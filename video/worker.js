require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Import Audio Service
const AudioService = require('./services/audioService');

/**
 * Video Generation Worker
 * HTTP-based worker following Python worker pattern
 * Receives jobs via dispatch, processes them, updates status
 */

class VideoWorker {
  constructor() {
    this.app = express();
    this.port = process.env.VIDEO_WORKER_PORT || 8001;
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    this.audioService = new AudioService();
    
    // Dynamic backend path configuration
    this.backendPublicPath = process.env.BACKEND_PUBLIC_PATH || 
      path.resolve(__dirname, '../../odito_backend/public');
    
    console.log(`[VIDEO_WORKER] Backend public path: ${this.backendPublicPath}`);
    
    // MongoDB connection
    this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/odito_dev';
    
    this.setupMiddleware();
    this.setupRoutes();
    this.connectMongo();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // Health check endpoint
    this.app.post('/workers/health', (req, res) => {
      console.log('[VIDEO_WORKER] Health check received');
      res.json({
        success: true,
        message: 'Video worker is healthy',
        timestamp: new Date().toISOString()
      });
    });

    // Main video generation endpoint
    this.app.post('/jobs/video-generation', async (req, res) => {
      try {
        const { jobId, projectId } = req.body;
        
        console.log(`[VIDEO_WORKER] Job received | jobId=${jobId} | projectId=${projectId}`);
        
        // Acknowledge job immediately
        res.json({
          success: true,
          message: 'Video generation job accepted',
          jobId,
          projectId
        });

        // Process job asynchronously
        this.processVideoJob(jobId, projectId).catch(error => {
          console.error(`[VIDEO_WORKER] Job processing failed | jobId=${jobId}:`, error);
        });
        
      } catch (error) {
        console.error('[VIDEO_WORKER] Error receiving job:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to accept job',
          error: error.message
        });
      }
    });
  }

  async connectMongo() {
    try {
      await mongoose.connect(this.mongoUri);
      console.log('[VIDEO_WORKER] Connected to MongoDB');
    } catch (error) {
      console.error('[VIDEO_WORKER] MongoDB connection failed:', error);
    }
  }

  async processVideoJob(jobId, projectId) {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`[VIDEO_WORKER] Processing started | jobId=${jobId} | attempt=${retryCount + 1}`);
        
        // Update job status to processing
        await this.updateJobStatus(jobId, 'processing', { 
          retryCount,
          maxRetries,
          timestamp: new Date()
        });
        
        // Step 1: Fetch structured data (NO SCRIPT)
        console.log(`[VIDEO_WORKER] Fetching structured data for projectId=${projectId}`);
        const videoData = await this.fetchVideoData(projectId);
        
        if (!videoData) {
          throw new Error('No video data found for project');
        }
        
        // Step 2: Generate narration from templates using scores
        console.log(`[VIDEO_WORKER] Generating narration from templates...`);
        const fullNarration = this.generateNarrationFromData(videoData);
        
        // Create narrationSegments array from the generated narration
        const narrationSegments = fullNarration 
          ? fullNarration.split('\n').filter(segment => segment.trim() !== '')
          : [];
        
        console.log(`[VIDEO_WORKER] ✅ Created ${narrationSegments.length} narration segments`);
        console.log(`[VIDEO_WORKER] NARRATION TYPE:`, typeof narrationSegments);
        console.log(`[VIDEO_WORKER] IS ARRAY:`, Array.isArray(narrationSegments));
        
        // Step 3: Generate audio from template-based narration
        console.log(`[VIDEO_WORKER] Generating audio from template narration...`);
        const audioPath = await this.generateAudioFromNarration(fullNarration, projectId);
        console.log(`[VIDEO_WORKER] Audio done | path=${audioPath}`);
        
        // Step 4: Render video using structured data
        console.log(`[VIDEO_WORKER] Starting video render with structured data...`);
        const videoPath = await this.renderVideo(projectId, audioPath, videoData, narrationSegments);
        console.log(`[VIDEO_WORKER] Render done | path=${videoPath}`);
        
        // Step 5: Update job with results
        await this.updateJobStatus(jobId, 'completed', {
          result_data: {
            videoUrl: `http://localhost:5000/videos/${projectId}.mp4`,
            audioUrl: audioPath,
            processingTime: Date.now(),
            retryCount,
            narrationLength: fullNarration.length,
            providerUsed: 'template_based'
          }
        });
        
        console.log(`[VIDEO_WORKER] Job completed | jobId=${jobId} | attempts=${retryCount + 1}`);
        return; // Success, exit retry loop
        
      } catch (error) {
        console.error(`[VIDEO_WORKER] Job attempt ${retryCount + 1} failed | jobId=${jobId}:`, error);
        
        retryCount++;
        
        // Check if we should retry
        const shouldRetry = this.shouldRetryJob(error, retryCount, maxRetries);
        
        if (shouldRetry && retryCount <= maxRetries) {
          const delay = Math.min(5000 * Math.pow(2, retryCount - 1), 30000); // Max 30s delay
          console.log(`[VIDEO_WORKER] Retrying job in ${delay}ms | jobId=${jobId} | attempt=${retryCount + 1}/${maxRetries + 1}`);
          
          await this.updateJobStatus(jobId, 'retrying', {
            error: error.message,
            retryCount,
            maxRetries,
            nextRetryAt: new Date(Date.now() + delay)
          });
          
          await this.sleep(delay);
        } else {
          // Final failure
          console.error(`[VIDEO_WORKER] Job failed permanently | jobId=${jobId} | attempts=${retryCount}`);
          
          await this.updateJobStatus(jobId, 'failed', {
            error: {
              message: error.message,
              stack: error.stack,
              timestamp: new Date(),
              retryCount,
              finalAttempt: true
            }
          });
          
          return; // Exit retry loop
        }
      }
    }
  }

  /**
   * Check if a job should be retried based on error type
   * @param {Error} error - The error that occurred
   * @param {number} retryCount - Current retry count
   * @param {number} maxRetries - Maximum allowed retries
   * @returns {boolean} True if should retry
   */
  shouldRetryJob(error, retryCount, maxRetries) {
    // Don't retry if we've exceeded max retries
    if (retryCount > maxRetries) {
      return false;
    }
    
    // Don't retry on validation errors or missing data
    if (error.message?.includes('No video data found') ||
        error.message?.includes('validation') ||
        error.message?.includes('invalid')) {
      return false;
    }
    
    // Retry on network errors, timeouts, TTS failures, rendering issues
    if (error.message?.includes('timeout') ||
        error.message?.includes('network') ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('Audio generation failed') ||
        error.message?.includes('Video rendering failed') ||
        error.message?.includes('TTS') ||
        error.message?.includes('ElevenLabs') ||
        error.message?.includes('OpenAI')) {
      return true;
    }
    
    // Default to retry for unknown errors
    return true;
  }

  /**
   * Sleep utility for delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchVideoData(projectId) {
    try {
      // Call backend API to get structured video data
      const response = await axios.get(`${this.backendUrl}/api/video/data/${projectId}`, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch video data');
      }
      
      console.log(`[VIDEO_WORKER] ✅ Video data fetched successfully`);
      return response.data.data;
      
    } catch (error) {
      console.error('[VIDEO_WORKER] Error fetching video data:', error);
      return null;
    }
  }

  async generateAudioFromNarration(narration, projectId) {
    try {
      // Check if audio already exists
      if (this.audioService.audioExists(projectId)) {
        console.log(`[VIDEO_WORKER] Using existing audio for projectId=${projectId}`);
        return this.audioService.getAudioUrl(projectId);
      }
      
      // Generate new audio from template-based narration
      console.log(`[VIDEO_WORKER] Generating new audio from template narration for projectId=${projectId}`);
      return await this.audioService.generateAudioFromText(narration, projectId);
    } catch (error) {
      console.error('[VIDEO_WORKER] Audio generation failed:', error);
      throw error;
    }
  }

  /**
   * Validate audio URL accessibility via HTTP
   * @param {string} projectId - Project ID
   * @returns {Promise<string>} Audio URL if accessible
   */
  async validateAudioUrl(projectId) {
    const audioUrl = `http://localhost:5000/audio/${projectId}.mp3`;
    
    console.log(`[VIDEO_WORKER] 🔍 Validating audio URL: ${audioUrl}`);
    
    // Test HTTP accessibility only - NO local file checks
    try {
      const response = await axios.head(audioUrl, { timeout: 5000 });
      if (response.status !== 200) {
        throw new Error(`Audio URL not accessible: ${audioUrl} (HTTP ${response.status})`);
      }
      console.log(`[VIDEO_WORKER] ✅ Audio URL accessible via HTTP: ${audioUrl}`);
      return audioUrl;
    } catch (error) {
      if (error.response) {
        throw new Error(`Audio URL HTTP check failed: ${audioUrl} (HTTP ${error.response.status})`);
      } else {
        throw new Error(`Audio URL HTTP check failed: ${audioUrl} (${error.message})`);
      }
    }
  }

  async renderVideo(projectId, audioPath, videoData, narrationSegments) {
    try {
      // Dynamic video output path using environment variable or resolved path
      const videoDir = path.join(this.backendPublicPath, 'videos');
      const videoPath = path.join(videoDir, `${projectId}.mp4`);
      
      console.log(`[VIDEO_WORKER] 🎬 Video output path: ${videoPath}`);
      console.log(`[VIDEO_WORKER] 📁 Video directory: ${videoDir}`);
      
      // Ensure videos directory exists
      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
        console.log(`[VIDEO_WORKER] ✅ Created videos directory: ${videoDir}`);
      } else {
        console.log(`[VIDEO_WORKER] ✅ Videos directory exists: ${videoDir}`);
      }
      
      // Validate audio URL accessibility via HTTP ONLY
      const audioUrl = await this.validateAudioUrl(projectId);
      console.log(`[VIDEO_WORKER] 🎵 Using audio URL: ${audioUrl}`);
      
      // Prepare input data for Remotion with HTTP URL
      const inputData = {
        audioUrl: audioUrl,  // HTTP URL - NO local file paths
        projectId: projectId,
        videoData: videoData,
        narrationSegments: narrationSegments
      };
      
      const inputDataPath = path.join(__dirname, 'temp', `${projectId}-input.json`);
      if (!fs.existsSync(path.dirname(inputDataPath))) {
        fs.mkdirSync(path.dirname(inputDataPath), { recursive: true });
      }
      fs.writeFileSync(inputDataPath, JSON.stringify(inputData, null, 2));
      
      console.log(`[VIDEO_WORKER] 🎬 Starting Remotion render for projectId=${projectId}`);
      console.log(`[VIDEO_WORKER] 📡 Audio URL: ${audioUrl}`);
      console.log(`[VIDEO_WORKER] 📹 Video output: ${videoPath}`);
      
      return new Promise((resolve, reject) => {
        // Use local remotion binary
        const remotionPath = path.join(
          __dirname,
          'node_modules',
          '.bin',
          process.platform === 'win32' ? 'remotion.cmd' : 'remotion'
        );
        
        // Safety check: ensure binary exists
        if (!fs.existsSync(remotionPath)) {
          reject(new Error(`Remotion binary not found at ${remotionPath}. Run npm install.`));
          return;
        }
        
        // Arguments for remotion
        const remotionArgs = [
          'render',
          'src/index.ts',
          'AuditVideo',
          videoPath,
          `--props=${inputDataPath}`,
          '--codec', 'h264',
          '--pixel-format', 'yuv420p'
        ];
        
        console.log(`[VIDEO_WORKER] Using remotion binary: ${remotionPath}`);
        console.log(`[VIDEO_WORKER] Command args:`, remotionArgs);
        
        // Run Remotion CLI
        const remotion = spawn(remotionPath, remotionArgs, {
          cwd: __dirname,
          stdio: 'pipe',
          shell: process.platform === 'win32' ? true : false
        });
        
        let stdout = '';
        let stderr = '';
        
        remotion.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        remotion.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        remotion.on('close', (code) => {
          console.log(`[VIDEO_WORKER] Remotion process exited with code ${code}`);
          
          if (code === 0 && fs.existsSync(videoPath)) {
            console.log(`[VIDEO_WORKER] ✅ Video rendered successfully: ${videoPath}`);
            
            // Validate file size and existence
            const stats = fs.statSync(videoPath);
            console.log(`[VIDEO_WORKER] 📊 Video file size: ${stats.size} bytes`);
            console.log(`[VIDEO_WORKER] 📅 Created at: ${stats.birthtime}`);
            
            // Return HTTP URL for video access
            const videoUrl = `http://localhost:5000/videos/${projectId}.mp4`;
            console.log(`[VIDEO_WORKER] 📡 Video URL: ${videoUrl}`);
            
            resolve(videoUrl);
          } else {
            console.error('[VIDEO_WORKER] ❌ Remotion stderr:', stderr);
            
            // Check if file exists despite error code
            if (fs.existsSync(videoPath)) {
              console.log(`[VIDEO_WORKER] ⚠️  File exists but render failed. File: ${videoPath}`);
              const stats = fs.statSync(videoPath);
              console.log(`[VIDEO_WORKER] 📊 File size: ${stats.size} bytes`);
            } else {
              console.log(`[VIDEO_WORKER] ❌ File does not exist: ${videoPath}`);
            }
            
            reject(new Error(`Video rendering failed with code ${code}: ${stderr}`));
          }
        });
        
        remotion.on('error', (error) => {
          console.error('[VIDEO_WORKER] Remotion process error:', error);
          reject(error);
        });
        
        // Timeout after 10 minutes
        setTimeout(() => {
          remotion.kill();
          reject(new Error('Video rendering timed out after 10 minutes'));
        }, 10 * 60 * 1000);
      });
      
    } catch (error) {
      throw new Error(`Video rendering setup failed: ${error.message}`);
    }
  }

  /**
   * Generate narration from structured data using internal templates
   * @param {Object} videoData - Structured video data
   * @returns {string} Complete narration text for all slides
   */
  generateNarrationFromData(videoData) {
    const videoTemplateService = require('./services/videoTemplate.service');
    
    try {
      console.log('[VIDEO_WORKER] Generating narration from structured data');
      
      // Enhanced defensive logging
      console.log('[DEBUG] VideoTemplateService type:', typeof videoTemplateService);
      console.log('[DEBUG] VideoTemplateService constructor:', videoTemplateService.constructor.name);
      console.log('[DEBUG] Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(videoTemplateService)));
      console.log('[DEBUG] Own properties:', Object.keys(videoTemplateService));
      
      if (typeof videoTemplateService.generateCompleteNarration !== "function") {
        throw new Error("generateCompleteNarration method missing in VideoTemplateService");
      }
      
      const fullNarration = videoTemplateService.generateCompleteNarration(videoData);
      
      console.log(`[VIDEO_WORKER] ✅ Generated complete narration (${fullNarration.length} characters)`);
      console.log(`[VIDEO_WORKER] 📝 Narration preview: "${fullNarration.substring(0, 200)}..."`);
      
      return fullNarration;
      
    } catch (error) {
      console.error('[VIDEO_WORKER] Error generating narration:', error);
      throw new Error(`Narration generation failed: ${error.message}`);
    }
  }

  async updateJobStatus(jobId, status, data = {}) {
    try {
      const updateData = {
        status,
        ...data
      };
      
      if (status === 'completed') {
        updateData.completed_at = new Date();
      }
      
      if (status === 'failed') {
        updateData.failed_at = new Date();
      }
      
      const response = await axios.post(`${this.backendUrl}/api/jobs/update-status`, {
        jobId,
        ...updateData
      }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`[VIDEO_WORKER] Status updated | jobId=${jobId} | status=${status}`);
      
    } catch (error) {
      console.error(`[VIDEO_WORKER] Failed to update job status | jobId=${jobId}:`, error.message);
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🤖 Video Worker started on port ${this.port}`);
      console.log(`🚀 Ready to receive video generation jobs from Node.js backend`);
      console.log(`📡 Backend URL: ${this.backendUrl}`);
    });
  }
}

// Start worker
if (require.main === module) {
  const worker = new VideoWorker();
  worker.start();
}

module.exports = VideoWorker;
