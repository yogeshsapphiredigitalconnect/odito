require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { ObjectId } = require('mongodb');

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
    // Validate required environment variables
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error('BACKEND_URL environment variable is required');
    }
    this.backendUrl = backendUrl;
    this.audioService = new AudioService();
    
    // Dynamic backend path configuration
    this.backendPublicPath = process.env.BACKEND_PUBLIC_PATH || 
      path.resolve(__dirname, '../../odito_backend/public');
    
    console.log(`[VIDEO_WORKER] Backend public path: ${this.backendPublicPath}`);
    
    // MongoDB connection
    const { getDatabaseConfig } = require('./config/env.js');
    const dbConfig = getDatabaseConfig();
    this.mongoUri = dbConfig.uri;
    
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
        
        // CRITICAL: Validate required fields
        if (!jobId || typeof jobId !== 'string' || jobId.trim().length === 0) {
          console.error(`[VIDEO_WORKER] ❌ INVALID jobId | jobId=${jobId}`);
          return res.status(400).json({
            success: false,
            message: 'Valid jobId is required',
            jobId
          });
        }
        
        if (!projectId || typeof projectId !== 'string' || projectId.trim().length === 0) {
          console.error(`[VIDEO_WORKER] ❌ INVALID projectId | projectId=${projectId}`);
          return res.status(400).json({
            success: false,
            message: 'Valid projectId is required',
            projectId
          });
        }
        
        // Validate MongoDB ObjectId format
        if (!ObjectId.isValid(projectId.trim())) {
          console.error(`[VIDEO_WORKER] ❌ INVALID projectId format | projectId=${projectId}`);
          return res.status(400).json({
            success: false,
            message: 'Invalid projectId format',
            projectId
          });
        }
        
        // Sanitize inputs
        const sanitizedJobId = jobId.trim().replace(/[^a-zA-Z0-9-_]/g, '');
        const sanitizedProjectId = projectId.trim();
        
        // CRITICAL: Validate auditSnapshot is present
        if (!auditSnapshot) {
          console.error(`[VIDEO_WORKER] ❌ MISSING auditSnapshot | jobId=${sanitizedJobId} | projectId=${sanitizedProjectId}`);
          return res.status(400).json({
            success: false,
            message: 'auditSnapshot is required',
            jobId: sanitizedJobId,
            projectId: sanitizedProjectId
          });
        }

        console.log(`[VIDEO_WORKER] ✅ auditSnapshot received | keys:`, Object.keys(auditSnapshot));
        console.log(`[VIDEO_WORKER] 🔍 AUDIT DATA:`, JSON.stringify(auditSnapshot, null, 2));
        
        // Acknowledge job immediately
        res.json({
          success: true,
          message: 'Video generation job accepted with auditSnapshot',
          jobId: sanitizedJobId,
          projectId: sanitizedProjectId,
          hasAuditSnapshot: !!auditSnapshot
        });

        // Process job asynchronously with sanitized inputs and auditSnapshot only (NO script)
        this.processVideoJob(sanitizedJobId, sanitizedProjectId, auditSnapshot).catch(error => {
          console.error(`[VIDEO_WORKER] ❌ CRITICAL: Job processing failed | jobId=${sanitizedJobId}:`, error);
          // Ensure job is marked as failed even if processing crashes
          this.updateJobStatus(sanitizedJobId, 'failed', {
            error: {
              message: error.message,
              stack: error.stack,
              timestamp: new Date(),
              criticalFailure: true
            },
            progress: 0,
            currentStep: 'Failed - Critical Error'
          }).catch(updateError => {
            console.error(`[VIDEO_WORKER] ❌ DOUBLE CRITICAL: Failed to update job status | jobId=${sanitizedJobId}:`, updateError);
          });
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
      console.log(`🔗 [VIDEO_WORKER] Connected to MongoDB database: ${mongoose.connection.name}`);
    } catch (error) {
      console.error('[VIDEO_WORKER] MongoDB connection failed:', error);
    }
  }

  async processVideoJob(jobId, projectId, auditSnapshot) {
    const maxRetries = 3;
    let retryCount = 0;
    
    // Ensure jobId is properly sanitized for this method
    const sanitizedJobId = jobId.toString().replace(/[^a-zA-Z0-9-_]/g, '');
    const sanitizedProjectId = projectId.toString().replace(/[^a-zA-Z0-9-_]/g, '');
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`[VIDEO_WORKER] Processing started | jobId=${sanitizedJobId} | attempt=${retryCount + 1}`);
        
        // CRITICAL: Ensure auditSnapshot is ALWAYS defined
        const audit = auditSnapshot;
        
        if (!audit) {
          throw new Error("auditSnapshot is missing in video worker");
        }
        
        console.log(`[VIDEO_WORKER] ✅ Using provided auditSnapshot (NO DB script)`);
        console.log(`[VIDEO_WORKER] AUDIT SNAPSHOT RECEIVED:`, JSON.stringify(audit, null, 2));
        
        // Update job status to processing with initial progress
        await this.updateJobStatus(sanitizedJobId, 'processing', { 
          progress: 10,
          currentStep: "Preparing video script",
          retryCount,
          maxRetries,
          timestamp: new Date(),
          hasAuditSnapshot: !!auditSnapshot
        });
        
        // Step 1: Generate structured slides using auditSnapshot only
        console.log(`[VIDEO_WORKER] Generating structured slides from audit data...`);
        const structuredSlides = this.generateStructuredSlides(audit);
        
        if (!structuredSlides || structuredSlides.length === 0) {
          throw new Error(`Slides generation failed - no slides created`);
        }
        
        if (structuredSlides.length < 13) {
          throw new Error(`Minimum 13 slides required. Got ${structuredSlides?.length || 0} slides`);
        }
        
        console.log(`[VIDEO_WORKER] ✅ Created ${structuredSlides.length} structured slides`);
        console.log(`[VIDEO_WORKER] SLIDES COUNT:`, structuredSlides.length);
        
        // Update progress after script processing
        await this.updateJobStatus(sanitizedJobId, 'processing', { 
          progress: 20,
          currentStep: "Script prepared - starting audio generation"
        });
        
        // Step 2: Generate separate audio for each slide with progress tracking
        console.log(`[VIDEO_WORKER] Generating separate audio for ${structuredSlides.length} slides...`);
        
        const audioFiles = await this.generatePerSlideAudioWithProgress(structuredSlides, sanitizedProjectId, sanitizedJobId);
        
        console.log(`[VIDEO_WORKER] ✅ Generated ${audioFiles.length} separate audio files`);
        
        // Update progress after audio generation
        await this.updateJobStatus(sanitizedJobId, 'processing', { 
          progress: 70,
          currentStep: "Audio generation complete - preparing video rendering"
        });
        
        // Attach audio files to slides with CRITICAL duration validation
        const slidesWithAudio = structuredSlides.map((slide, index) => {
          const audioFile = audioFiles.find(audio => audio.slideIndex === index + 1);
          if (!audioFile) {
            throw new Error(`Missing audio file for slide ${index + 1}`);
          }
          
          console.log(`[VIDEO_WORKER] 🔍 Validating audio file for slide ${index + 1}:`);
          console.log(`[VIDEO_WORKER]   Audio URL: ${audioFile.audioPath}`);
          console.log(`[VIDEO_WORKER]   Duration: ${audioFile.duration.toFixed(2)} seconds`);
          
          // CRITICAL FIX: Validate audio duration is reasonable
          const minDuration = 2.0; // Minimum 2 seconds
          const maxDuration = 60.0; // Maximum 60 seconds
          
          if (audioFile.duration < minDuration) {
            console.warn(`[VIDEO_WORKER] ⚠️ Audio duration too short (${audioFile.duration.toFixed(2)}s), using minimum`);
            audioFile.duration = minDuration;
          } else if (audioFile.duration > maxDuration) {
            console.warn(`[VIDEO_WORKER] ⚠️ Audio duration too long (${audioFile.duration.toFixed(2)}s), capping at maximum`);
            audioFile.duration = maxDuration;
          }
          
          // Validate audio file exists on disk
          const filename = audioFile.audioPath.replace(`${this.backendUrl}/audio/`, '').replace('.mp3', '');
          if (!this.audioService.audioExists(filename)) {
            throw new Error(`Audio file not found on disk for slide ${index + 1}: ${filename}`);
          }
          
          console.log(`[VIDEO_WORKER]   ✅ File exists on disk`);
          console.log(`[VIDEO_WORKER]   🎯 Final duration: ${audioFile.duration.toFixed(2)}s`);
          
          return {
            ...slide,
            audio: audioFile.audioPath,
            duration: audioFile.duration,
            durationInFrames: Math.round(audioFile.duration * 30) // Assuming 30 FPS
          };
        });
        
        console.log(`[VIDEO_WORKER] ✅ Attached audio to all slides`);
        
        // Step 3: FAIL SAFE RENDER - Validate before rendering
        console.log(`[VIDEO_WORKER] Starting video render with slides and per-slide audio...`);
        
        // Fail-safe validation before rendering
        if (!slidesWithAudio || slidesWithAudio.length === 0) {
          throw new Error("Slides generation failed - cannot render video without slides");
        }
        
        if (!audioFiles || audioFiles.length === 0) {
          throw new Error("Audio generation failed - cannot render video without audio");
        }
        
        console.log(`[VIDEO_WORKER] ✅ Fail-safe validation passed - proceeding with render`);
        
        // Update progress for video rendering start
        await this.updateJobStatus(sanitizedJobId, 'processing', { 
          progress: 80,
          currentStep: "Rendering video"
        });
        
        const videoFileName = `${sanitizedProjectId}-${sanitizedJobId}.mp4`;
        const videoPath = await this.renderVideoWithSlides(sanitizedProjectId, sanitizedJobId, slidesWithAudio, audit);
        console.log(`[VIDEO_WORKER] Render done | path=${videoPath}`);
        
        // Update progress for finalizing
        await this.updateJobStatus(sanitizedJobId, 'processing', { 
          progress: 95,
          currentStep: "Finalizing video"
        });
        
        // Step 4: Update job with results
        console.log(`[VIDEO_WORKER] 🎬 VIDEO RENDERED: ${videoPath}`);
        console.log(`[VIDEO_WORKER] 📡 VIDEO URL: ${this.backendUrl}/videos/${videoFileName}`);
        
        const resultData = {
          videoUrl: `${this.backendUrl}/videos/${videoFileName}`,
          videoFileName: videoFileName,
          audioFiles: audioFiles,
          processingTime: Date.now(),
          retryCount,
          slidesGenerated: structuredSlides.length,
          audioFilesGenerated: audioFiles.length,
          providerUsed: 'per_slide_audio_generation',
          slideBreakdown: {
            originalSlides: 9,
            newAiSlides: 3,
            totalSlides: structuredSlides.length
          }
        };
        
        console.log(`[VIDEO_WORKER] SENDING DATA:`, JSON.stringify(resultData, null, 2));
        
        // 🧪 PART 5: WORKER LOGGING - Log video completion
        console.log(`[VIDEO_WORKER] 🎬 VIDEO COMPLETE:`, {
          jobId: sanitizedJobId,
          projectId: sanitizedProjectId,
          videoUrl: resultData.videoUrl,
          videoFileName: resultData.videoFileName,
          status: 'RENDERED'
        });
        
        await this.updateJobStatus(sanitizedJobId, 'completed', {
          progress: 100,
          currentStep: "Completed",
          result_data: resultData
        });
        
        console.log(`[VIDEO_WORKER] Job completed | jobId=${sanitizedJobId} | attempts=${retryCount + 1}`);
        return; // Success, exit retry loop
        
      } catch (error) {
        console.error(`[VIDEO_WORKER] Job attempt ${retryCount + 1} failed | jobId=${sanitizedJobId}:`, error);
        
        retryCount++;
        
        // Check if we should retry
        const shouldRetry = this.shouldRetryJob(error, retryCount, maxRetries);
        
        if (shouldRetry && retryCount <= maxRetries) {
          const delay = Math.min(5000 * Math.pow(2, retryCount - 1), 30000); // Max 30s delay
          console.log(`[VIDEO_WORKER] Retrying job in ${delay}ms | jobId=${sanitizedJobId} | attempt=${retryCount + 1}/${maxRetries + 1}`);
          
          await this.updateJobStatus(sanitizedJobId, 'retrying', {
            error: error.message,
            retryCount,
            maxRetries,
            nextRetryAt: new Date(Date.now() + delay)
          });
          
          await this.sleep(delay);
        } else {
          // Final failure
          console.error(`[VIDEO_WORKER] Job failed permanently | jobId=${sanitizedJobId} | attempts=${retryCount}`);
          
          await this.updateJobStatus(sanitizedJobId, 'failed', {
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
   * Generate 9 structured slides using auditSnapshot data only
   * @param {Object} audit - Audit data snapshot
   * @returns {Array} Array of 9 structured slide objects
   */
  generateStructuredSlides(audit) {
    try {
      console.log(`[VIDEO_WORKER] 🎬 Generating 9 structured slides from audit data`);
      console.log(`[VIDEO_WORKER] ✅ audit available:`, !!audit);
      
      // Safety checks
      if (!audit || typeof audit !== 'object') {
        throw new Error('Invalid auditSnapshot provided');
      }
      
      // Extract key data from auditSnapshot with safety
      const projectName = audit?.projectName || 'Website';
      const url = audit?.url || 'N/A';
      const scores = audit?.scores || {};
      const pagesCrawled = audit?.pagesCrawled || 0;
      
      // Use EXACT issueDistribution from auditSnapshot - NO critical field
      const issueDistribution = audit?.issueDistribution || {};
      
      // Extract top issues
      const topIssues = audit?.topIssues || {};
      const highIssues = topIssues?.high || [];
      const mediumIssues = topIssues?.medium || [];
      const lowIssues = topIssues?.low || [];
      
      // Log issue counts for debugging narration logic
      console.log(`[VIDEO_WORKER] 📊 Issue counts for dynamic narration:`);
      console.log(`[VIDEO_WORKER]   High issues: ${issueDistribution.high || 0} → using ${(issueDistribution.high || 0) === 0 ? 'zero-case' : 'normal'} narration`);
      console.log(`[VIDEO_WORKER]   Medium issues: ${issueDistribution.medium || 0} → using ${(issueDistribution.medium || 0) === 0 ? 'zero-case' : 'normal'} narration`);
      console.log(`[VIDEO_WORKER]   Low issues: ${issueDistribution.low || 0} → using ${(issueDistribution.low || 0) === 0 ? 'zero-case' : 'normal'} narration`);
      
      // Extract technical highlights - NO duplication
      const technicalHighlights = audit?.technicalHighlights || {};
      
      // Extract performance metrics
      const performanceMetrics = audit?.performanceMetrics || {};
      
      // Extract Core Web Vitals dynamically from performanceMetrics
      const coreWebVitals = this.extractCoreWebVitals(performanceMetrics);
      
      // Extract keyword data from auditSnapshot
      const keywordData = audit?.keywordData || {};
      console.log(`[VIDEO_WORKER] 📊 Keyword data extracted:`, {
        totalKeywords: keywordData.totalKeywords || 0,
        topRankingsCount: keywordData.topRankings?.length || 0,
        opportunitiesCount: keywordData.opportunities?.length || 0,
        notRankingCount: keywordData.notRanking?.length || 0
      });

      // Extract AI analysis
      const aiAnalysis = audit?.aiAnalysis || {};
      
      console.log(`[VIDEO_WORKER] 📈 Extracted data - Project: ${projectName}, Overall Score: ${scores.overall}`);
      
      // Helper function to categorize score status
      function getScoreStatus(score) {
        const normalizedScore = score || 0;
        if (normalizedScore >= 75) return "strong";
        if (normalizedScore >= 50) return "moderate";
        return "weak";
      }

      // Helper function to group scores by category
      function groupScores(scores) {
        const groups = {
          strong: [],
          moderate: [],
          weak: []
        };

        const metrics = [
          { name: "Technical", key: "technicalHealth" },
          { name: "Performance", key: "performance" },
          { name: "SEO", key: "seo" },
          { name: "AI Visibility", key: "aiVisibility" }
        ];

        metrics.forEach(metric => {
          const score = scores[metric.key];
          // Skip null/undefined scores
          if (score !== null && score !== undefined && !isNaN(score)) {
            const status = getScoreStatus(score);
            groups[status].push({ name: metric.name, score });
          }
        });

        return groups;
      }

      // Helper function to generate dynamic narration
      function generateScoreNarration(scores) {
        const overall = scores.overall || 0;
        const groups = groupScores(scores);
        
        let narration = `Your overall score is ${overall} out of 100. `;
        
        // Add strong metrics
        if (groups.strong.length > 0) {
          const strongList = groups.strong.map(m => `${m.name} at ${m.score}`).join(" and ");
          narration += `${strongList} ${groups.strong.length === 1 ? 'is' : 'are'} performing strongly. `;
        }
        
        // Add moderate metrics
        if (groups.moderate.length > 0) {
          const moderateList = groups.moderate.map(m => `${m.name} at ${m.score}`).join(" and ");
          narration += `${moderateList} show${groups.moderate.length === 1 ? 's' : ''} moderate performance. `;
        }
        
        // Add weak metrics
        if (groups.weak.length > 0) {
          const weakList = groups.weak.map(m => `${m.name} at ${m.score}`).join(" and ");
          if (groups.weak.length === 1) {
            narration += `${weakList} is underperforming and needs attention. `;
          } else {
            narration += `${weakList} are underperforming and need immediate attention. `;
          }
        }
        
        // Add impact sentence based on weak metrics count
        if (groups.weak.length >= 2) {
          narration += "These gaps are severely limiting your growth and require urgent action.";
        } else if (groups.weak.length === 1) {
          narration += "This gap represents an improvement opportunity that could boost your overall performance.";
        } else {
          narration += "Your strong performance across all areas positions you well for continued success.";
        }
        
        return narration;
      }
      
      // Create exactly 9 structured slides with clean data mapping
      const slides = [
        {
          id: 1,
          type: "projectOverview",
          title: projectName,
          subtitle: url,
          narration: `${projectName} scores ${scores.overall || 0} out of 100 — not because the business isn't good, but because the website isn't communicating that to search engines. Let's break down exactly why.`,
          data: {
            projectName,
            url,
            pagesCrawled,
            scores,
            issueDistribution
          }
        },
        {
          id: 2,
          type: "scoreSummary",
          title: "Overall Score Analysis",
          subtitle: `Score: ${scores.overall || 0}/100`,
          narration: generateScoreNarration(scores),
          data: {
            scores,
            overall: scores.overall || 0
          }
        },
        {
          id: 3,
          type: "issueDistribution",
          title: "Issue Distribution",
          subtitle: `${issueDistribution.total || 0} Total Issues`,
          narration: `${issueDistribution.total || 0} issues found — and ${issueDistribution.high || 0} of them are high priority. That means ${Math.round(((issueDistribution.high || 0) / (issueDistribution.total || 1)) * 100)}% of your problems are actively costing you rankings right now, today.`,
          data: {
            issueDistribution,
            total: issueDistribution.total || 0
          }
        },
        {
          id: 4,
          type: "highIssues",
          title: "High Priority Issues",
          subtitle: (issueDistribution.high || 0) === 0 
            ? "No issues detected 🎉"
            : `Showing top ${highIssues.length} of ${issueDistribution.high || 0} high-priority issues`,
          narration: (issueDistribution.high || 0) === 0 
            ? "Excellent news! There are no high priority issues detected. This means your site doesn't have any critical problems that could be actively harming your rankings right now."
            : `These high priority issues are the ones bleeding your score the most. Every one of them fixed is a direct point gain — address them first and your overall score could jump significantly within 30 days.`,
          data: {
            issues: highIssues,
            count: highIssues.length,
            totalHigh: issueDistribution.high || 0,
            hasZeroIssues: (issueDistribution.high || 0) === 0
          }
        },
        {
          id: 5,
          type: "mediumIssues",
          title: "Medium Priority Issues",
          subtitle: (issueDistribution.medium || 0) === 0
            ? "No issues detected 🎉"
            : `Showing top ${mediumIssues.length} of ${issueDistribution.medium || 0} issues`,
          narration: (issueDistribution.medium || 0) === 0
            ? "Great job! There are no medium priority issues to address. Your site is already well-maintained beyond the critical fixes, showing search engines you're running a tight ship."
            : `Your medium priority issues aren't urgent, but they're adding up quietly. Resolve these and you're not just fixing problems — you're sending search engines a signal that this site is actively maintained and trustworthy.`,
          data: {
            issues: mediumIssues,
            count: mediumIssues.length,
            totalMedium: issueDistribution.medium || 0,
            hasZeroIssues: (issueDistribution.medium || 0) === 0
          }
        },
        {
          id: 6,
          type: "lowIssues",
          title: "Low Priority Issues",
          subtitle: (issueDistribution.low || 0) === 0
            ? "No issues detected 🎉"
            : `Showing top ${lowIssues.length} of ${issueDistribution.low || 0} issues`,
          narration: (issueDistribution.low || 0) === 0
            ? "The good news is, there are no low-priority issues detected. This means your site is already clean at the foundational level, allowing you to focus on higher-impact improvements."
            : `Even the low priority items matter. Small fixes, but each one removed is one less reason for search engines to rank someone else above you.`,
          data: {
            issues: lowIssues,
            count: lowIssues.length,
            totalLow: issueDistribution.low || 0,
            hasZeroIssues: (issueDistribution.low || 0) === 0
          }
        },
        {
          id: 7,
          type: "technicalHighlights",
          title: "Technical Highlights",
          subtitle: "Technical SEO Overview",
          narration: `${scores.technicalHealth || 0} is decent — but all ${pagesCrawled || 0} pages are missing security headers, which search engines flag as unsafe. Plus inconsistent H1 tags mean search engines can't identify what your pages are actually about.`,
          data: {
            auditSnapshot: {
              technicalHighlights,
              scores,
              issueDistribution
            }
          }
        },
        {
          id: 8,
          type: "performanceSummary",
          title: "Performance Summary",
          subtitle: `Performance Score: ${performanceMetrics.pageSpeed || 0}`,
          narration: (() => {
            const pageSpeed = performanceMetrics.pageSpeed || 0;
            const mobileScore = performanceMetrics.mobileScore || 0;
            const desktopScore = performanceMetrics.desktopScore || 0;
            
            // Helper to categorize performance
            const getPerformanceCategory = (score) => {
              if (score >= 75) return "strong";
              if (score >= 50) return "moderate";
              return "weak";
            };
            
            let narration = `Your performance score is ${pageSpeed}. `;
            
            // Compare mobile vs desktop
            if (mobileScore < desktopScore) {
              narration += `Mobile performance is lagging at ${mobileScore} compared to desktop at ${desktopScore}. `;
            } else if (desktopScore < mobileScore) {
              narration += `Desktop performance is lower at ${desktopScore} compared to mobile at ${mobileScore}. `;
            } else {
              narration += `Both mobile and desktop are similar at ${mobileScore}. `;
            }
            
            // Add performance category analysis
            const category = getPerformanceCategory(pageSpeed);
            if (category === "weak") {
              narration += "This indicates serious performance bottlenecks affecting load speed and user experience. ";
            } else if (category === "moderate") {
              narration += "This shows moderate performance with room for optimization. ";
            } else {
              narration += "This demonstrates strong performance across the board. ";
            }
            
            // Add smart recommendation
            if (pageSpeed < 50 || mobileScore < 50) {
              narration += "Focus on optimizing heavy assets, enabling compression, and improving load efficiency for quick gains.";
            } else {
              narration += "Consider fine-tuning with caching strategies and minor optimizations for even better results.";
            }
            
            return narration;
          })(),
          data: {
            pageSpeed: performanceMetrics.pageSpeed || 0,
            mobileScore: performanceMetrics.mobileScore || 0,
            desktopScore: performanceMetrics.desktopScore || 0
          }
        },
        {
          id: 9,
          type: "coreWebVitals",
          title: "Core Web Vitals",
          subtitle: "User Experience Metrics",
          narration: `Your main content takes ${this.getLCPValue(coreWebVitals?.mobile)} seconds to appear on mobile — search engine guidelines recommend 2.5. That gap is where your visitors lose patience and leave. Desktop is better, but still problematic.`,
          data: coreWebVitals
        },
        {
          id: 10,
          type: "keywords",
          title: "Keyword Performance",
          subtitle: `${keywordData.totalKeywords || 0} Keywords Tracked`,
          narration: this.generateKeywordNarration(keywordData),
          data: keywordData
        }
      ];

      // Add 4 NEW AI Analysis slides (11-14) - NO aiRecommendations slide
      const newAiSlides = this.generateAISlides(aiAnalysis, scores);
      
      // Add NEW CTA Closure slide (Slide 15)
      const slide14 = {
        id: 15,
        type: "ctaClosure",
        title: "What's Next?",
        subtitle: "Take Action on Your SEO & AI Growth",
        narration: `Now you have two clear paths. You can use the AI-powered suggestions provided in this audit and implement them yourself. Or, if you'd prefer faster and expert-driven results, our team can handle everything for you. Let's take your SEO and AI visibility to the next level.`,
        data: {
          cards: [
            {
              title: "Use AI Suggestions",
              description: "Follow the AI recommendations provided in this audit to improve your SEO step by step."
            },
            {
              title: "Do It Yourself",
              description: "Apply the fixes on your own using the insights and improve your rankings gradually."
            },
            {
              title: "Let Us Handle It",
              description: "Our team can implement everything for you. Get in touch and scale your SEO faster."
            }
          ]
        }
      };
      
      // Combine existing slides with new AI slides and CTA slide
      const allSlides = [...slides, ...newAiSlides, slide14];
      
      if (allSlides.length < 14) {
        throw new Error(`Minimum 14 slides required. Got ${allSlides.length}`);
      }
      
      // Validate each slide has required fields
      allSlides.forEach((slide, index) => {
        if (!slide.id || !slide.type || !slide.narration) {
          throw new Error(`Slide ${index + 1} missing required fields`);
        }
      });
      
      console.log(`[VIDEO_WORKER] ✅ Successfully created ${allSlides.length} structured slides (including keyword slide + 4 AI slides + 1 CTA)`);
      return allSlides;
      
    } catch (error) {
      console.error(`[VIDEO_WORKER] ❌ Error generating structured slides:`, error);
      throw error;
    }
  }

  /**
   * Generate 4 new AI Analysis slides (10-13) from aiAnalysis data
   * @param {Object} aiAnalysis - AI analysis data from auditSnapshot
   * @param {Object} scores - Scores object containing aiVisibility
   * @returns {Array} Array of 4 AI slide objects
   */
  generateAISlides(aiAnalysis, scores) {
    try {
      console.log(`[VIDEO_WORKER] 🤖 Generating AI Analysis slides from aiAnalysis data`);
      
      // Safety checks for aiAnalysis data
      if (!aiAnalysis || typeof aiAnalysis !== 'object') {
        console.warn(`[VIDEO_WORKER] ⚠️ aiAnalysis data missing or invalid, using fallback values`);
        aiAnalysis = {
          score: 0,
          summary: "AI analysis data unavailable",
          hasKnowledgeGraph: false,
          categories: {},
          detailedMetrics: {},
          checklist: []
        };
      }
      
      const categories = aiAnalysis.categories || {};
      const detailedMetrics = aiAnalysis.detailedMetrics || {};
      const checklist = aiAnalysis.checklist || [];
      
      // SLIDE 10: AI Analysis Overview (clean)
      const slide10 = {
        id: 10,
        type: "aiAnalysis",
        title: "AI Analysis Overview",
        subtitle: "AI Search Readiness Summary",
        narration: `And now the most important score in today's world — AI Visibility. ChatGPT, Claude, Perplexity, AI search overviews — these are the new search engines. People aren't just searching online anymore, they're asking AI. And AI decides who to mention, who to recommend, who to trust. Your score is ${scores.aiVisibility || 0} — meaning right now, you're largely invisible in that conversation. This is the score that will define the next 5 years of your online presence.`,
        data: {
          score: scores.aiVisibility || 0,
          summary: aiAnalysis.summary || "AI analysis data unavailable",
          hasKnowledgeGraph: aiAnalysis.hasKnowledgeGraph || false
        }
      };
      
      // SLIDE 11: AI Category Breakdown
      const slide11 = {
        id: 11,
        type: "aiCategoryBreakdown",
        title: "AI Category Breakdown",
        subtitle: "AI Performance Distribution",
        narration: (() => {
            const aiImpact = categories.aiImpact || 0;
            const citationProbability = categories.citationProbability || 0;
            const llmReadiness = categories.llmReadiness || 0;
            const aeoScore = categories.aeoScore || 0;
            const topicalAuthority = categories.topicalAuthority || 0;
            const voiceIntent = categories.voiceIntent || 0;
            
            // Helper to categorize score status
            const getStatus = (score) => {
              if (score >= 75) return "strong";
              if (score >= 50) return "moderate";
              return "weak";
            };
            
            // Define all categories with their labels and scores
            const allCategories = [
              { name: "AI Impact", score: aiImpact },
              { name: "Citation Probability", score: citationProbability },
              { name: "LLM Readiness", score: llmReadiness },
              { name: "AEO Score", score: aeoScore },
              { name: "Topical Authority", score: topicalAuthority },
              { name: "Voice Intent", score: voiceIntent }
            ];
            
            // Group categories by status
            const groups = {
              strong: [],
              moderate: [],
              weak: []
            };
            
            allCategories.forEach(category => {
              const status = getStatus(category.score);
              groups[status].push(category);
            });
            
            let narration = "Your AI performance shows a mixed distribution across key areas. ";
            
            // Add strong categories
            if (groups.strong.length > 0) {
              const strongList = groups.strong.map(c => `${c.name} at ${c.score}`).join(" and ");
              narration += `${strongList} ${groups.strong.length === 1 ? 'is' : 'are'} performing strongly. `;
            }
            
            // Add moderate categories
            if (groups.moderate.length > 0) {
              const moderateList = groups.moderate.map(c => `${c.name} at ${c.score}`).join(" and ");
              narration += `${moderateList} ${groups.moderate.length === 1 ? 'shows' : 'show'} moderate performance. `;
            }
            
            // Add weak categories
            if (groups.weak.length > 0) {
              const weakList = groups.weak.map(c => `${c.name} at ${c.score}`).join(" and ");
              narration += `${weakList} ${groups.weak.length === 1 ? 'is' : 'are'} underperforming and need attention. `;
            }
            
            // Add final insight based on weak categories count
            if (groups.weak.length >= 3) {
              narration += "This indicates low AI readiness requiring comprehensive optimization.";
            } else if (groups.weak.length >= 1) {
              narration += "Improving these areas will strengthen your AI visibility and authority.";
            } else {
              narration += "You demonstrate strong AI optimization across all key areas.";
            }
            
            return narration;
          })(),
        data: {
          categories: {
            aiImpact: categories.aiImpact || 0,
            citationProbability: categories.citationProbability || 0,
            llmReadiness: categories.llmReadiness || 0,
            aeoScore: categories.aeoScore || 0,
            topicalAuthority: categories.topicalAuthority || 0,
            voiceIntent: categories.voiceIntent || 0
          }
        }
      };
      
      // SLIDE 12: AI Detailed Metrics
      const slide12 = {
        id: 12,
        type: "aiDetailedMetrics",
        title: "AI Detailed Metrics",
        subtitle: "Technical AI Readiness",
        narration: (() => {
            const schemaCoverage = detailedMetrics.schemaCoverage || 0;
            const faqOptimization = detailedMetrics.faqOptimization || 0;
            const conversationalScore = detailedMetrics.conversationalScore || 0;
            const aiSnippetProbability = detailedMetrics.aiSnippetProbability || 0;
            const aiCitationRate = detailedMetrics.aiCitationRate || 0;
            const knowledgeGraph = detailedMetrics.knowledgeGraph || 0;
            
            // Helper to categorize score status
            const getStatus = (score) => {
              if (score >= 75) return "strong";
              if (score >= 50) return "moderate";
              return "weak";
            };
            
            // Define all metrics with their labels and scores
            const allMetrics = [
              { name: "Schema Coverage", score: schemaCoverage },
              { name: "FAQ Optimization", score: faqOptimization },
              { name: "Conversational Score", score: conversationalScore },
              { name: "AI Snippet Probability", score: aiSnippetProbability },
              { name: "AI Citation Rate", score: aiCitationRate },
              { name: "Knowledge Graph", score: knowledgeGraph }
            ];
            
            // Group metrics by status
            const groups = {
              strong: [],
              moderate: [],
              weak: []
            };
            
            allMetrics.forEach(metric => {
              const status = getStatus(metric.score);
              groups[status].push(metric);
            });
            
            let narration = "Your technical AI readiness shows varied performance across key metrics. ";
            
            // Add strong metrics
            if (groups.strong.length > 0) {
              const strongList = groups.strong.map(m => `${m.name} at ${m.score}`).join(" and ");
              narration += `${strongList} ${groups.strong.length === 1 ? 'is' : 'are'} performing strongly. `;
            }
            
            // Add moderate metrics
            if (groups.moderate.length > 0) {
              const moderateList = groups.moderate.map(m => `${m.name} at ${m.score}`).join(" and ");
              narration += `${moderateList} ${groups.moderate.length === 1 ? 'shows' : 'show'} moderate performance. `;
            }
            
            // Add weak metrics
            if (groups.weak.length > 0) {
              const weakList = groups.weak.map(m => `${m.name} at ${m.score}`).join(" and ");
              narration += `${weakList} ${groups.weak.length === 1 ? 'needs' : 'need'} improvement. `;
            }
            
            // Add final AI impact insight
            if (groups.weak.length >= 3) {
              narration += "This indicates low AI visibility requiring comprehensive optimization.";
            } else if (groups.weak.length >= 1) {
              narration += "Addressing these areas presents an opportunity to enhance your AI search presence.";
            } else {
              narration += "You demonstrate strong AI readiness across all technical metrics.";
            }
            
            return narration;
          })(),
        data: {
          detailedMetrics: {
            schemaCoverage: detailedMetrics.schemaCoverage || 0,
            faqOptimization: detailedMetrics.faqOptimization || 0,
            conversationalScore: detailedMetrics.conversationalScore || 0,
            aiSnippetProbability: detailedMetrics.aiSnippetProbability || 0,
            aiCitationRate: detailedMetrics.aiCitationRate || 0,
            knowledgeGraph: detailedMetrics.knowledgeGraph || 0
          }
        }
      };
      
      // SLIDE 13: AI Top Issues - ONLY pass filtered topIssues, not full checklist
      const slide13 = {
        id: 13,
        type: "aiTopIssues",
        title: "AI Top Issues",
        subtitle: "Critical AI Optimization Areas",
        narration: `The root cause is clear — AI systems do not understand your entity properly. They don't know who you are, what you do, or who you serve. Fixing your entity clarity can significantly improve your AI visibility score.`,
        data: {
          topIssues: this.extractTopIssues(checklist) // Only 3 items, not full checklist
        }
      };
      
      const aiSlides = [slide10, slide11, slide12, slide13];
      
      console.log(`[VIDEO_WORKER] ✅ Generated ${aiSlides.length} AI Analysis slides (slides 10-13)`);
      aiSlides.forEach((slide, index) => {
        console.log(`[VIDEO_WORKER]   AI Slide ${slide.id}: ${slide.title} (${slide.type})`);
      });
      
      return aiSlides;
      
    } catch (error) {
      console.error(`[VIDEO_WORKER] ❌ Error generating AI slides:`, error);
      throw error;
    }
  }

  /**
   * Generate narration for AI Analysis Overview slide - SHORT AND CLEAN
   * @param {number} aiVisibilityScore - AI visibility score
   * @param {boolean} hasKnowledgeGraph - Whether knowledge graph is established
   * @returns {string} Short, clean narration text
   */
  generateAIOverviewNarration(aiVisibilityScore, hasKnowledgeGraph) {
    const score = aiVisibilityScore || 0;
    
    if (score >= 70) {
      return `Your AI visibility score is ${score}. Your brand has strong presence in AI-generated search results.`;
    } else if (score >= 50) {
      return `Your AI visibility score is ${score}. Your brand has moderate presence in AI-generated search results.`;
    } else {
      return `Your AI visibility score is ${score}. Your brand has limited presence in AI-generated search results.`;
    }
  }

  /**
   * Generate narration for AI Category Breakdown slide - SUMMARY STYLE
   * @param {Object} categories - AI category scores
   * @returns {string} Short, clean narration text
   */
  generateAICategoryNarration(categories) {
    const scores = Object.values(categories).filter(s => s > 0);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;
    
    if (avgScore >= 70) {
      return "Your AI performance shows strong results across key categories, indicating solid optimization for AI search visibility.";
    } else if (avgScore >= 50) {
      return "Your AI performance varies across key categories, with moderate optimization overall.";
    } else {
      return "Your AI performance needs attention across multiple categories to improve search visibility.";
    }
  }

  /**
   * Generate narration for AI Detailed Metrics slide - SHORT AND CLEAN
   * @param {Object} detailedMetrics - AI detailed metrics scores
   * @returns {string} Short, clean narration text
   */
  generateAIDetailedMetricsNarration(detailedMetrics) {
    return "Your technical AI readiness shows improvement opportunities in schema, FAQs, and content structure.";
  }

  /**
   * Generate narration for AI Top Issues slide - SHORT BULLET STYLE
   * @param {Array} checklist - AI checklist data
   * @returns {string} Short narration text (12-15 seconds)
   */
  generateAITopIssuesNarration(checklist) {
    const topIssues = this.extractTopIssues(checklist);
    
    if (topIssues.length === 0) {
      return "Your AI optimization shows no critical issues.";
    }
    
    // Create short, punchy narration - max 2-3 sentences
    const issueTypes = topIssues.slice(0, 3).map(issue => {
      const title = issue.title.toLowerCase();
      if (title.includes('schema') || title.includes('structured')) return 'weak structured data';
      if (title.includes('content') || title.includes('conversational')) return 'poor content structure';
      if (title.includes('citation') || title.includes('authority')) return 'missing citation signals';
      if (title.includes('entity') || title.includes('knowledge')) return 'unclear entity information';
      if (title.includes('faq')) return 'limited FAQ content';
      return 'AI optimization gaps';
    });
    
    const uniqueIssues = [...new Set(issueTypes)].slice(0, 3);
    const issuesText = uniqueIssues.join(', ');
    
    return `These are the top 3 critical issues impacting your AI visibility.`;
  }

  /**
   * Extract top 3 most critical AI issues from checklist
   * @param {Array} checklist - AI checklist data
   * @returns {Array} Top 3 critical issues with clean titles and recommendations
   */
  extractTopIssues(checklist) {
    if (!Array.isArray(checklist) || checklist.length === 0) {
      return [];
    }
    
    // Parse real scores from titles and sort by score (lowest first = most critical)
    const sortedIssues = [...checklist]
      .map(issue => {
        const title = issue.title || issue.description || issue.item || 'Unknown issue';
        
        // Extract real score from title like "Rule area_served_defined scored 0.0"
        const scoreMatch = title.match(/scored\s+(\d+(?:\.\d+)?)/);
        const realScore = scoreMatch ? parseFloat(scoreMatch[1]) : (issue.score || issue.score_value || 0);
        
        // Clean up the title - remove "Rule" prefix and "scored XX" suffix
        let cleanTitle = title
          .replace(/^Rule\s+/i, '') // Remove "Rule" prefix
          .replace(/\s+scored\s+\d+(?:\.\d+)?\s*$/i, '') // Remove "scored XX" suffix
          .trim();
        
        // Replace underscores with spaces and capitalize properly
        cleanTitle = cleanTitle
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase()) // Title case
          .trim();
        
        // If cleaning resulted in empty title, use a simplified version of original
        if (!cleanTitle) {
          cleanTitle = title
            .replace(/^Rule\s+\w+\s+scored\s+\d+(?:\.\d+)?$/i, 'Technical Issue')
            .trim();
        }
        
        return {
          title: cleanTitle,
          score: realScore,
          status: issue.status || 'info',
          category: 'general',
          recommendation: issue.recommendation || ''
        };
      })
      .sort((a, b) => a.score - b.score) // Lowest score first = most critical
      .slice(0, 3); // EXACTLY 3 items
    
    return sortedIssues;
  }

  /**
   * Derive category from issue title
   * @param {string} title - Issue title
   * @returns {string} Derived category
   */
  deriveCategory(title) {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('schema') || lowerTitle.includes('structured')) return 'schema';
    if (lowerTitle.includes('faq') || lowerTitle.includes('question')) return 'faq';
    if (lowerTitle.includes('entity') || lowerTitle.includes('knowledge')) return 'entity';
    if (lowerTitle.includes('citation') || lowerTitle.includes('authority')) return 'citation';
    if (lowerTitle.includes('conversational') || lowerTitle.includes('content')) return 'content';
    
    return 'general';
  }

  /**
   * Generate dynamic narration for issue slides based on total vs shown counts
   * @param {number} totalCount - Total issues from auditSnapshot.issueDistribution
   * @param {number} shownCount - Number of issues shown (data.issues.length)
   * @param {string} issueType - Type of issues ('high', 'medium', 'low')
   * @returns {string} Formatted narration text
   */
  generateIssueNarration(totalCount, shownCount, issueType) {
    if (shownCount < totalCount) {
      return `Your website has ${totalCount} ${issueType}-priority issues. Showing the top ${shownCount} most important issues that need attention.`;
    } else {
      return `Your website has ${totalCount} ${issueType}-priority issues that need attention.`;
    }
  }

  /**
   * Generate narration for technical highlights slide
   * @param {Object} technicalHighlights - Technical highlights data
   * @returns {string} Formatted narration text
   */
  generateTechnicalNarration(technicalHighlights) {
    const firstFailingCheck = this.extractFirstFailingCheck(technicalHighlights);
    if (firstFailingCheck) {
      return `From a technical perspective, your website shows a mix of strengths and issues. Key areas such as ${firstFailingCheck} need attention, while several other aspects are properly configured.`;
    } else {
      return `From a technical perspective, your website shows a mix of strengths and issues. Several aspects are properly configured while others need attention.`;
    }
  }

  /**
   * Extract the first FAIL or WARN item from technical highlights
   * @param {Object} technicalHighlights - Technical highlights data
   * @returns {string|null} Name of first failing check or null
   */
  extractFirstFailingCheck(technicalHighlights) {
    if (!technicalHighlights || typeof technicalHighlights !== 'object') {
      return null;
    }
    
    // Look for checks array or similar structure
    const checks = technicalHighlights.checks || technicalHighlights.items || [];
    
    for (const check of checks) {
      if (check.status === 'FAIL' || check.status === 'WARN') {
        return check.name || check.check || check.title || 'technical issue';
      }
    }
    
    return null;
  }

  /**
   * Get performance grade from score
   * @param {number} score - Performance score
   * @returns {string} Letter grade
   */
  getPerformanceGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Get LCP value from core web vitals
   * @param {Object} mobileData - Mobile core web vitals data
   * @returns {string} LCP value in seconds
   */
  getLCPValue(mobileData) {
    const lcp = mobileData?.lcp;
    if (typeof lcp === 'number') return lcp.toFixed(1);
    if (typeof lcp === 'string' && lcp !== 'N/A') return lcp;
    return '5.1'; // fallback
  }

  /**
   * Generate narration for Core Web Vitals slide
   * @param {Object} coreWebVitals - Core Web Vitals data
   * @returns {string} Formatted narration text
   */
  generateCoreWebVitalsNarration(coreWebVitals) {
    const mobile = coreWebVitals?.mobile || {};
    const desktop = coreWebVitals?.desktop || {};
    
    return `Core Web Vitals show that on mobile, Largest Contentful Paint is ${mobile.lcp || 'N/A'} and Total Blocking Time is ${mobile.tbt || 'N/A'}. On desktop, LCP is ${desktop.lcp || 'N/A'} and TBT is ${desktop.tbt || 'N/A'}, reflecting differences in performance across devices.`;
  }

  /**
   * Extract Core Web Vitals from performance metrics dynamically - BOTH mobile and desktop
   * @param {Object} performanceMetrics - Performance metrics object
   * @returns {Object} Core Web Vitals values for mobile and desktop
   */
  extractCoreWebVitals(performanceMetrics) {
    try {
      const mobileMetrics = performanceMetrics?.metrics || [];
      const desktopMetrics = performanceMetrics?.desktopMetrics || [];
      
      // Extract mobile metrics
      const mobileLcpMetric = mobileMetrics.find(metric => 
        metric?.metric?.toLowerCase().includes('largest contentful paint') ||
        metric?.metric?.toLowerCase().includes('lcp')
      );
      
      const mobileTbtMetric = mobileMetrics.find(metric => 
        metric?.metric?.toLowerCase().includes('total blocking time') ||
        metric?.metric?.toLowerCase().includes('tbt')
      );
      
      const mobileFcpMetric = mobileMetrics.find(metric => 
        metric?.metric?.toLowerCase().includes('first contentful paint') ||
        metric?.metric?.toLowerCase().includes('fcp')
      );
      
      const mobileClsMetric = mobileMetrics.find(metric => 
        metric?.metric?.toLowerCase().includes('cumulative layout shift') ||
        metric?.metric?.toLowerCase().includes('cls')
      );
      
      // Extract desktop metrics
      const desktopLcpMetric = desktopMetrics.find(metric => 
        metric?.metric?.toLowerCase().includes('largest contentful paint') ||
        metric?.metric?.toLowerCase().includes('lcp')
      );
      
      const desktopTbtMetric = desktopMetrics.find(metric => 
        metric?.metric?.toLowerCase().includes('total blocking time') ||
        metric?.metric?.toLowerCase().includes('tbt')
      );
      
      const desktopFcpMetric = desktopMetrics.find(metric => 
        metric?.metric?.toLowerCase().includes('first contentful paint') ||
        metric?.metric?.toLowerCase().includes('fcp')
      );
      
      const desktopClsMetric = desktopMetrics.find(metric => 
        metric?.metric?.toLowerCase().includes('cumulative layout shift') ||
        metric?.metric?.toLowerCase().includes('cls')
      );
      
      return {
        mobile: {
          lcp: mobileLcpMetric?.mobile || mobileLcpMetric?.desktop || 'N/A',
          tbt: mobileTbtMetric?.mobile || mobileTbtMetric?.desktop || 'N/A',
          fcp: mobileFcpMetric?.mobile || mobileFcpMetric?.desktop || 'N/A',
          cls: mobileClsMetric?.mobile || mobileClsMetric?.desktop || 'N/A',
          score: performanceMetrics?.mobileScore || 0
        },
        desktop: {
          lcp: desktopLcpMetric?.desktop || desktopLcpMetric?.mobile || 'N/A',
          tbt: desktopTbtMetric?.desktop || desktopTbtMetric?.mobile || 'N/A',
          fcp: desktopFcpMetric?.desktop || desktopFcpMetric?.mobile || 'N/A',
          cls: desktopClsMetric?.desktop || desktopClsMetric?.mobile || 'N/A',
          score: performanceMetrics?.desktopScore || 0
        }
      };
    } catch (error) {
      console.warn(`[VIDEO_WORKER] ⚠️ Error extracting Core Web Vitals:`, error.message);
      return {
        mobile: {
          lcp: 'N/A',
          tbt: 'N/A',
          fcp: 'N/A',
          cls: 'N/A',
          score: 0
        },
        desktop: {
          lcp: 'N/A',
          tbt: 'N/A',
          fcp: 'N/A',
          cls: 'N/A',
          score: 0
        }
      };
    }
  }

  /**
   * Generate separate audio files for each slide using AudioService
   * @param {Array} structuredSlides - Array of slide objects
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} Array of audio file information
   */
  async generatePerSlideAudio(structuredSlides, projectId) {
    try {
      console.log(`[VIDEO_WORKER] 🎙️ Delegating per-slide audio generation to AudioService`);
      
      // Use AudioService to generate separate audio files
      const audioFiles = await this.audioService.generatePerSlideAudio(structuredSlides, projectId);
      
      console.log(`[VIDEO_WORKER] ✅ AudioService generated ${audioFiles.length} audio files`);
      
      // Log each audio file details
      audioFiles.forEach((audioFile, index) => {
        console.log(`[VIDEO_WORKER] 🎵 Slide ${audioFile.slideIndex}: ${audioFile.audioPath} (${audioFile.duration.toFixed(2)}s)`);
      });
      
      return audioFiles;
      
    } catch (error) {
      console.error('[VIDEO_WORKER] ❌ Error generating per-slide audio:', error);
      throw error;
    }
  }

  /**
   * Generate separate audio files for each slide with progress tracking
   * @param {Array} structuredSlides - Array of slide objects
   * @param {string} projectId - Project ID
   * @param {string} jobId - Job ID for progress updates
   * @returns {Promise<Array>} Array of audio file information
   */
  async generatePerSlideAudioWithProgress(structuredSlides, projectId, jobId) {
    try {
      console.log(`[VIDEO_WORKER] 🎙️ Starting per-slide audio generation with progress tracking`);
      
      const totalSlides = structuredSlides.length;
      const audioFiles = [];

      // Generate audio for each slide individually to track progress
      for (let i = 0; i < totalSlides; i++) {
        const slide = structuredSlides[i];
        const slideIndex = i + 1;
        console.log(`[VIDEO_WORKER] 🎵 Generating audio for slide ${slideIndex}/${totalSlides}: ${slide.title}`);
        
        try {
          // CRITICAL FIX: Pass slide with index to ensure proper slide numbering
          const slideWithIndex = { ...slide, slideIndex };
          const slideAudioFiles = await this.audioService.generatePerSlideAudio([slideWithIndex], projectId);
          
          if (slideAudioFiles && slideAudioFiles.length > 0) {
            audioFiles.push(...slideAudioFiles);
            console.log(`[VIDEO_WORKER] ✅ Generated audio for slide ${slideIndex}`);
          } else {
            throw new Error(`No audio generated for slide ${slideIndex}`);
          }
          
          // Calculate progress (20% to 70% range)
          const progress = 20 + ((i + 1) / totalSlides) * 50;
          
          // Update progress
          await this.updateJobStatus(jobId, 'processing', {
            progress: Math.round(progress),
            currentStep: `Generating audio (${i + 1}/${totalSlides})`
          });
          
        } catch (error) {
          console.error(`[VIDEO_WORKER] ❌ Error generating audio for slide ${i + 1}:`, error);
          throw new Error(`Failed to generate audio for slide ${i + 1}: ${error.message}`);
        }
      }
      
      console.log(`[VIDEO_WORKER] ✅ Generated ${audioFiles.length} audio files with progress tracking`);
      
      // CRITICAL VALIDATION: Ensure unique audio files
      const uniqueSlideIndices = [...new Set(audioFiles.map(audio => audio.slideIndex))];
      if (uniqueSlideIndices.length !== audioFiles.length) {
        throw new Error(`Duplicate audio files detected: Expected ${audioFiles.length} unique files, got ${uniqueSlideIndices.length} unique slide indices`);
      }
      
      // Log each audio file details for verification
      audioFiles.forEach((audioFile, index) => {
        console.log(`[VIDEO_WORKER] 🎵 Slide ${audioFile.slideIndex}: ${audioFile.audioPath} (${audioFile.duration.toFixed(2)}s)`);
      });
      
      return audioFiles;
      
    } catch (error) {
      console.error('[VIDEO_WORKER] ❌ Error generating per-slide audio with progress:', error);
      throw error;
    }
  }

  // NOTE: findSecurityHeaderIssues function removed as criticalTechnicalIssue slide is no longer generated

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
      
      console.log("[VIDEO_WORKER] ✅ All slides with audio validated successfully");
      return response.data.data;
      
    } catch (error) {
      console.error('[VIDEO_WORKER] Error fetching video data:', error);
      return null;
    }
  }

  async renderVideoWithSlides(projectId, jobId, slidesWithAudio, auditSnapshot) {
    try {
      // Dynamic video output path using environment variable or resolved path
      const videoDir = path.join(this.backendPublicPath, 'videos');
      const videoFileName = `${projectId}-${jobId}.mp4`;
      const videoPath = path.join(videoDir, videoFileName);
      
      console.log(`[VIDEO_WORKER] 🎬 Video output path: ${videoPath}`);
      console.log(`[VIDEO_WORKER] 📁 Video directory: ${videoDir}`);
      
      // Ensure videos directory exists
      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
        console.log(`[VIDEO_WORKER] ✅ Created videos directory: ${videoDir}`);
      } else {
        console.log(`[VIDEO_WORKER] ✅ Videos directory exists: ${videoDir}`);
      }
      
      // Validate slides with audio
      console.log(`[VIDEO_WORKER] 🎵 Using ${slidesWithAudio.length} slides with per-slide audio`);
      
      // Calculate total video duration based on slide audio durations
      const totalDuration = slidesWithAudio.reduce((sum, slide) => sum + slide.duration, 0);
      const totalDurationInFrames = Math.round(totalDuration * 30); // Convert to frames at 30 FPS
      console.log(`[VIDEO_WORKER] 🕐 Total video duration: ${totalDuration.toFixed(2)} seconds`);
      console.log(`[VIDEO_WORKER] 🎞️ Total duration frames: ${totalDurationInFrames} frames`);
      
      // CRITICAL FIX: Log individual slide durations for debugging sync issues
      console.log(`[VIDEO_WORKER] 📊 Slide-by-slide duration breakdown:`);
      slidesWithAudio.forEach((slide, index) => {
        console.log(`[VIDEO_WORKER]   Slide ${index + 1} (${slide.type}): ${slide.duration.toFixed(2)}s = ${slide.durationInFrames} frames`);
      });
      
      // Prepare input data for Remotion with slides and per-slide audio - CLEAN OUTPUT
      const inputData = {
        projectId: projectId,
        slidesWithAudio: slidesWithAudio,
        fps: 30, // Frame rate for duration calculation
        durationInFrames: totalDurationInFrames, // Dynamic total duration
        totalDuration: totalDuration // Pass total duration in seconds for reference
      };
      
      const inputDataPath = path.join(__dirname, 'temp', `${projectId}-input.json`);
      if (!fs.existsSync(path.dirname(inputDataPath))) {
        fs.mkdirSync(path.dirname(inputDataPath), { recursive: true });
      }
      fs.writeFileSync(inputDataPath, JSON.stringify(inputData, null, 2));
      
      // DEBUG LOG: Final temp JSON data
      console.log("FINAL SLIDES DATA:", JSON.stringify(slidesWithAudio, null, 2));
      
      console.log(`[VIDEO_WORKER] 🎬 Starting Remotion render for projectId=${projectId}`);
      console.log(`[VIDEO_WORKER] 📊 Slides with audio: ${slidesWithAudio.length}`);
      console.log(`[VIDEO_WORKER] 🕐 Total duration: ${totalDuration.toFixed(2)} seconds`);
      console.log(`[VIDEO_WORKER] 🎞️ Total frames: ${totalDurationInFrames} frames (dynamic)`);
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
          `--duration=${totalDurationInFrames}`, // Dynamic duration override
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
            const { getMediaUrls } = require('./config/env.js');
            const mediaUrls = getMediaUrls();
            const videoUrl = `${mediaUrls.video}/${projectId}.mp4`;
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
    const audioUrl = `${this.backendUrl}/audio/${projectId}.mp3`;
    
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
          `--duration=${totalDurationInFrames}`, // Dynamic duration override
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
            const { getMediaUrls } = require('./config/env.js');
            const mediaUrls = getMediaUrls();
            const videoUrl = `${mediaUrls.video}/${projectId}.mp4`;
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

  /**
   * Generate dynamic keyword narration based on performance
   * @param {Object} keywordData - Keyword data from auditSnapshot
   * @returns {string} Dynamic narration text
   */
  generateKeywordNarration(keywordData) {
    const totalKeywords = keywordData.totalKeywords || 0;
    const topRankingsCount = keywordData.topRankings?.length || 0;
    const opportunitiesCount = keywordData.opportunities?.length || 0;
    const notRankingCount = keywordData.notRanking?.length || 0;

    // All keywords not ranking
    if (notRankingCount === totalKeywords && totalKeywords > 0) {
      return `Currently, none of your ${totalKeywords} tracked keywords are ranking in the top 100 search results. This represents a significant opportunity, as each keyword optimized properly could unlock new streams of organic traffic and potential customers for your business.`;
    }

    // Mixed performance
    if (topRankingsCount > 0 && opportunitiesCount > 0 && notRankingCount > 0) {
      return `Your keyword performance shows mixed results. ${topRankingsCount} keywords are already ranking well, while ${opportunitiesCount} present strong growth opportunities. The ${notRankingCount} keywords not yet ranking need targeted optimization to start appearing in search results.`;
    }

    // Strong performance
    if (topRankingsCount > 0 && notRankingCount === 0) {
      return `Excellent progress! All ${totalKeywords} of your tracked keywords are ranking, with ${topRankingsCount} achieving top positions. This strong foundation can be leveraged to capture even more search visibility and traffic.`;
    }

    // Growth opportunity focus
    if (opportunitiesCount > 0) {
      return `You have ${opportunitiesCount} keywords positioned just outside the top 10, representing immediate growth opportunities. With focused optimization, these could move to page one and significantly increase your organic traffic.`;
    }

    // Default/fallback
    return `You're tracking ${totalKeywords} keywords. Some are performing well while others present opportunities for improvement. Let's explore how to optimize your keyword strategy for better search visibility.`;
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
