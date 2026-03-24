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
        const { jobId, projectId, auditSnapshot } = req.body;
        
        console.log(`[VIDEO_WORKER] Job received | jobId=${jobId} | projectId=${projectId}`);
        
        // CRITICAL: Validate auditSnapshot is present
        if (!auditSnapshot) {
          console.error(`[VIDEO_WORKER] ❌ MISSING auditSnapshot | jobId=${jobId} | projectId=${projectId}`);
          return res.status(400).json({
            success: false,
            message: 'auditSnapshot is required',
            jobId,
            projectId
          });
        }

        console.log(`[VIDEO_WORKER] ✅ auditSnapshot received | keys:`, Object.keys(auditSnapshot));
        console.log(`[VIDEO_WORKER] 🔍 AUDIT DATA:`, JSON.stringify(auditSnapshot, null, 2));
        
        // Acknowledge job immediately
        res.json({
          success: true,
          message: 'Video generation job accepted with auditSnapshot',
          jobId,
          projectId,
          hasAuditSnapshot: !!auditSnapshot
        });

        // Process job asynchronously with auditSnapshot only (NO script)
        this.processVideoJob(jobId, projectId, auditSnapshot).catch(error => {
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

  async processVideoJob(jobId, projectId, auditSnapshot) {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`[VIDEO_WORKER] Processing started | jobId=${jobId} | attempt=${retryCount + 1}`);
        
        // CRITICAL: Ensure auditSnapshot is ALWAYS defined
        const audit = auditSnapshot;
        
        if (!audit) {
          throw new Error("auditSnapshot is missing in video worker");
        }
        
        console.log(`[VIDEO_WORKER] ✅ Using provided auditSnapshot (NO DB script)`);
        console.log(`[VIDEO_WORKER] AUDIT SNAPSHOT RECEIVED:`, JSON.stringify(audit, null, 2));
        
        // Update job status to processing
        await this.updateJobStatus(jobId, 'processing', { 
          retryCount,
          maxRetries,
          timestamp: new Date(),
          hasAuditSnapshot: !!auditSnapshot
        });
        
        // Step 1: Generate 11 structured slides using auditSnapshot only
        console.log(`[VIDEO_WORKER] Generating 11 structured slides from audit data...`);
        const structuredSlides = this.generateStructuredSlides(audit);
        
        if (!structuredSlides || structuredSlides.length === 0) {
          throw new Error(`Slides generation failed - no slides created`);
        }
        
        if (structuredSlides.length !== 11) {
          throw new Error(`Failed to generate exactly 11 slides. Got ${structuredSlides?.length || 0} slides`);
        }
        
        console.log(`[VIDEO_WORKER] ✅ Created ${structuredSlides.length} structured slides`);
        console.log(`[VIDEO_WORKER] SLIDES COUNT:`, structuredSlides.length);
        
        // Step 2: Generate concatenated audio from all slide narrations
        console.log(`[VIDEO_WORKER] Generating concatenated audio from ${structuredSlides.length} slides...`);
        const audioPath = await this.generatePerSlideAudio(structuredSlides, projectId);
        console.log(`[VIDEO_WORKER] ✅ Generated concatenated audio: ${audioPath}`);
        
        // Step 3: FAIL SAFE RENDER - Validate before rendering
        console.log(`[VIDEO_WORKER] Starting video render with structured slides...`);
        
        // Fail-safe validation before rendering
        if (!structuredSlides || structuredSlides.length === 0) {
          throw new Error("Slides generation failed - cannot render video without slides");
        }
        
        if (!audioPath) {
          throw new Error("Audio generation failed - cannot render video without audio");
        }
        
        console.log(`[VIDEO_WORKER] ✅ Fail-safe validation passed - proceeding with render`);
        
        const videoPath = await this.renderVideoWithSlides(projectId, audioPath, structuredSlides, audit);
        console.log(`[VIDEO_WORKER] Render done | path=${videoPath}`);
        
        // Step 4: Update job with results
        await this.updateJobStatus(jobId, 'completed', {
          result_data: {
            videoUrl: `http://localhost:5000/videos/${projectId}.mp4`,
            audioUrl: audioPath,
            processingTime: Date.now(),
            retryCount,
            slidesGenerated: structuredSlides.length,
            audioFilesGenerated: 1,
            providerUsed: 'structured_audit_data_only'
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

  /**
   * Generate 11 structured slides using auditSnapshot data only
   * @param {Object} audit - Audit data snapshot
   * @returns {Array} Array of 11 structured slide objects
   */
  generateStructuredSlides(audit) {
    try {
      console.log(`[VIDEO_WORKER] 🎬 Generating 11 structured slides from audit data`);
      console.log(`[VIDEO_WORKER] � audit available:`, !!audit);
      
      // Safety checks
      if (!audit || typeof audit !== 'object') {
        throw new Error('Invalid auditSnapshot provided');
      }
      
      // Extract key data from auditSnapshot with safety
      const projectName = audit?.projectName || 'Website';
      const url = audit?.url || 'N/A';
      const scores = audit?.scores || {};
      
      // SAFE ACCESS: Use optional chaining and fallbacks for issueDistribution
      const issueDistribution = audit?.issueDistribution || {};
      
      // SAFE ACCESS: Use optional chaining and fallbacks for topIssues
      const topIssues = audit?.topIssues || {};
      const criticalIssues = topIssues?.critical || [];
      const highIssues = topIssues?.high || [];
      const mediumIssues = topIssues?.medium || [];
      const lowIssues = topIssues?.low || [];
      
      // SAFE ACCESS: Create issueCounts with fallbacks
      const issueCounts = {
        critical: issueDistribution?.critical || 0,
        high: issueDistribution?.high || 0,
        medium: issueDistribution?.medium || 0,
        low: issueDistribution?.low || 0,
        total: issueDistribution?.total || 0
      };
      
      const technicalHighlights = audit?.technicalHighlights || {};
      const performanceMetrics = audit?.performanceMetrics || {};
      const aiAnalysis = audit?.aiAnalysis || {};
      
      console.log(`[VIDEO_WORKER] 📈 Extracted data - Project: ${projectName}, Overall Score: ${scores.overall}`);
      
      // Create exactly 11 structured slides with narration
      const slides = [
        {
          id: 1,
          type: "projectOverview",
          title: projectName,
          subtitle: url,
          narration: `Welcome to your comprehensive SEO audit for ${projectName}. This analysis provides insights into your website's performance and areas for improvement.`,
          data: {
            projectName,
            url,
            scores: scores
          }
        },
        {
          id: 2,
          type: "scoreSummary",
          title: "Overall Score Analysis",
          subtitle: `Score: ${scores.overall || 0}/100`,
          narration: `Your overall performance score is ${scores.overall || 0} out of 100. Your SEO score is ${scores.seo || 0}, performance is ${scores.performance || 0}, and AI visibility is ${scores.aiVisibility || 0}.`,
          data: {
            scores: scores,
            overall: scores.overall || 0
          }
        },
        {
          id: 3,
          type: "issueDistribution",
          title: "Issue Distribution",
          subtitle: `${issueCounts.total} Total Issues`,
          narration: `We found a total of ${issueCounts.total || 0} issues across your website. Critical issues: ${issueCounts.critical || 0}, high: ${issueCounts.high || 0}, medium: ${issueCounts.medium || 0}, low: ${issueCounts.low || 0}.`,
          data: {
            issueDistribution: issueCounts,
            total: issueCounts.total
          }
        },
        {
          id: 4,
          type: "highIssues",
          title: "High Priority Issues",
          subtitle: `${issueCounts.high} High Issues`,
          narration: `Your website has ${issueDistribution.high || 0} high-priority issues that require immediate attention. These issues are significantly impacting your search rankings and user experience.`,
          data: {
            issues: highIssues,
            count: issueCounts.high
          }
        },
        {
          id: 5,
          type: "mediumIssues",
          title: "Medium Priority Issues",
          subtitle: `${issueCounts.medium} Medium Issues`,
          narration: `There are ${issueDistribution.medium || 0} medium-priority issues that should be addressed. While not critical, these issues provide opportunities for steady improvement.`,
          data: {
            issues: mediumIssues,
            count: issueCounts.medium
          }
        },
        {
          id: 6,
          type: "lowIssues",
          title: "Low Priority Issues",
          subtitle: `${issueCounts.low} Low Issues`,
          narration: `We identified ${issueDistribution.low || 0} low-priority issues. These minor optimizations can be addressed during routine maintenance for incremental improvements.`,
          data: {
            issues: lowIssues,
            count: issueCounts.low
          }
        },
        {
          id: 7,
          type: "technicalHighlights",
          title: "Technical Highlights",
          subtitle: "Technical SEO Overview",
          narration: `From a technical perspective, your website's infrastructure shows areas for improvement. Technical SEO forms the foundation for all other optimization efforts.`,
          data: {
            technicalHighlights: technicalHighlights,
            checks: technicalHighlights.checks || []
          }
        },
        {
          id: 8,
          type: "criticalTechnicalIssue",
          title: "Critical Technical Issue",
          subtitle: "Security Headers Analysis",
          narration: `A critical security issue has been detected. Security headers are missing, which exposes your website to potential security vulnerabilities and affects user trust.`,
          data: {
            criticalIssues: technicalHighlights?.criticalIssues || [],
            securityHeaders: this.findSecurityHeaderIssues(technicalHighlights)
          }
        },
        {
          id: 9,
          type: "performanceSummary",
          title: "Performance Summary",
          subtitle: `Performance Score: ${performanceMetrics.pageSpeed || 0}`,
          narration: `Your website performance shows room for improvement. Mobile users experience a score of ${performanceMetrics.mobileScore || 0}, while desktop scores ${performanceMetrics.desktopScore || 0}.`,
          data: {
            performanceMetrics: performanceMetrics,
            mobileScore: performanceMetrics.mobileScore || 0,
            desktopScore: performanceMetrics.desktopScore || 0
          }
        },
        {
          id: 10,
          type: "coreWebVitals",
          title: "Core Web Vitals",
          subtitle: "User Experience Metrics",
          narration: `Core Web Vitals measure user experience loading performance, interactivity, and visual stability. These metrics directly impact your search rankings and user satisfaction.`,
          data: {
            metrics: performanceMetrics.metrics || [],
            lcp: performanceMetrics.lcp || 'N/A',
            tbt: performanceMetrics.tbt || 'N/A'
          }
        },
        {
          id: 11,
          type: "aiAnalysis",
          title: "AI Visibility Analysis",
          subtitle: `AI Score: ${aiAnalysis.score || 0}`,
          narration: `Your AI visibility score is ${aiAnalysis.score || 0}, indicating how well your content is optimized for AI-powered search systems. Schema markup implementations: ${aiAnalysis.schemaMarkupCount || 0}.`,
          data: {
            aiAnalysis: aiAnalysis,
            score: aiAnalysis.score || 0,
            schemaMarkupCount: aiAnalysis.schemaMarkupCount || 0
          }
        }
      ];
      
      // Validate we have exactly 11 slides
      if (slides.length !== 11) {
        throw new Error(`Expected 11 slides, got ${slides.length}`);
      }
      
      // Validate each slide has required fields
      slides.forEach((slide, index) => {
        if (!slide.id || !slide.type || !slide.narration) {
          throw new Error(`Slide ${index + 1} missing required fields`);
        }
      });
      
      console.log(`[VIDEO_WORKER] ✅ Successfully created ${slides.length} structured slides`);
      return slides;
      
    } catch (error) {
      console.error(`[VIDEO_WORKER] ❌ Error generating structured slides:`, error);
      throw error;
    }
  }

  /**
   * Generate single concatenated audio from all slide narrations
   * @param {Array} structuredSlides - Array of slide objects
   * @param {string} projectId - Project ID
   * @returns {Promise<string>} Single audio file path
   */
  async generatePerSlideAudio(structuredSlides, projectId) {
    try {
      console.log(`[VIDEO_WORKER] 🎙️ Generating concatenated audio from ${structuredSlides.length} slides`);
      
      // Combine all slide narrations into one script
      const fullNarration = structuredSlides
        .map((slide, index) => {
          console.log(`[VIDEO_WORKER] 🎬 Slide ${index + 1}: ${slide.title}`);
          console.log(`[VIDEO_WORKER] 📝 Narration: "${slide.narration.substring(0, 100)}..."`);
          return slide.narration;
        })
        .join('\n\n');
      
      console.log(`[VIDEO_WORKER] 📝 Full narration length: ${fullNarration.length} characters`);
      
      // Generate single audio file from all narrations
      const audioPath = await this.audioService.generateAudioFromText(fullNarration, projectId);
      
      console.log(`[VIDEO_WORKER] ✅ Generated single concatenated audio: ${audioPath}`);
      return audioPath;
      
    } catch (error) {
      console.error('[VIDEO_WORKER] ❌ Error generating concatenated audio:', error);
      throw error;
    }
  }

  /**
   * Find security header issues from technical highlights
   * @param {Object} technicalHighlights - Technical data
   * @returns {Array} Security header issues
   */
  findSecurityHeaderIssues(technicalHighlights) {
    try {
      const checks = technicalHighlights.checks || [];
      return checks.filter(check => 
        check.name?.toLowerCase().includes('security') || 
        check.name?.toLowerCase().includes('header') ||
        check.detail?.toLowerCase().includes('security')
      );
    } catch (error) {
      console.warn(`[VIDEO_WORKER] ⚠️ Error finding security header issues:`, error.message);
      return [];
    }
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

  async renderVideoWithSlides(projectId, audioPath, structuredSlides, auditSnapshot) {
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
      
      // Validate audio path accessibility
      console.log(`[VIDEO_WORKER] 🎵 Using audio file: ${audioPath}`);
      
      // Prepare input data for Remotion with structured slides and single audio URL
      const inputData = {
        audioUrl: audioPath,  // Single audio URL for entire video
        projectId: projectId,
        structuredSlides: structuredSlides,
        auditSnapshot: auditSnapshot
      };
      
      const inputDataPath = path.join(__dirname, 'temp', `${projectId}-input.json`);
      if (!fs.existsSync(path.dirname(inputDataPath))) {
        fs.mkdirSync(path.dirname(inputDataPath), { recursive: true });
      }
      fs.writeFileSync(inputDataPath, JSON.stringify(inputData, null, 2));
      
      console.log(`[VIDEO_WORKER] 🎬 Starting Remotion render for projectId=${projectId}`);
      console.log(`[VIDEO_WORKER] 📊 Structured slides: ${structuredSlides.length}`);
      console.log(`[VIDEO_WORKER] 🎵 Audio file: ${audioPath}`);
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
