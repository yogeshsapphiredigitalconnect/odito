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
        
        // Step 1: Generate 13 structured slides using auditSnapshot only
        console.log(`[VIDEO_WORKER] Generating 13 structured slides from audit data...`);
        const structuredSlides = this.generateStructuredSlides(audit);
        
        if (!structuredSlides || structuredSlides.length === 0) {
          throw new Error(`Slides generation failed - no slides created`);
        }
        
        if (structuredSlides.length !== 13) {
          throw new Error(`Failed to generate exactly 13 slides. Got ${structuredSlides?.length || 0} slides`);
        }
        
        console.log(`[VIDEO_WORKER] ✅ Created ${structuredSlides.length} structured slides`);
        console.log(`[VIDEO_WORKER] SLIDES COUNT:`, structuredSlides.length);
        
        // Step 2: Generate separate audio for each slide
        console.log(`[VIDEO_WORKER] Generating separate audio for ${structuredSlides.length} slides...`);
        const audioFiles = await this.generatePerSlideAudio(structuredSlides, projectId);
        console.log(`[VIDEO_WORKER] ✅ Generated ${audioFiles.length} separate audio files`);
        
        // Attach audio files to slides
        const slidesWithAudio = structuredSlides.map((slide, index) => {
          const audioFile = audioFiles.find(audio => audio.slideIndex === index + 1);
          if (!audioFile) {
            throw new Error(`Missing audio file for slide ${index + 1}`);
          }
          
          console.log(`[VIDEO_WORKER] 🔍 Validating audio file for slide ${index + 1}:`);
          console.log(`[VIDEO_WORKER]   Audio URL: ${audioFile.audioPath}`);
          console.log(`[VIDEO_WORKER]   Duration: ${audioFile.duration.toFixed(2)} seconds`);
          
          // Validate audio file exists on disk
          const filename = audioFile.audioPath.replace('http://localhost:5000/audio/', '').replace('.mp3', '');
          if (!this.audioService.audioExists(filename)) {
            throw new Error(`Audio file not found on disk for slide ${index + 1}: ${filename}`);
          }
          
          console.log(`[VIDEO_WORKER]   ✅ File exists on disk`);
          
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
        
        const videoPath = await this.renderVideoWithSlides(projectId, slidesWithAudio, audit);
        console.log(`[VIDEO_WORKER] Render done | path=${videoPath}`);
        
        // Step 4: Update job with results
        await this.updateJobStatus(jobId, 'completed', {
          result_data: {
            videoUrl: `http://localhost:5000/videos/${projectId}.mp4`,
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
      
      // Extract technical highlights - NO duplication
      const technicalHighlights = audit?.technicalHighlights || {};
      
      // Extract performance metrics
      const performanceMetrics = audit?.performanceMetrics || {};
      
      // Extract Core Web Vitals dynamically from performanceMetrics
      const coreWebVitals = this.extractCoreWebVitals(performanceMetrics);
      
      // Extract AI analysis
      const aiAnalysis = audit?.aiAnalysis || {};
      
      console.log(`[VIDEO_WORKER] 📈 Extracted data - Project: ${projectName}, Overall Score: ${scores.overall}`);
      
      // Create exactly 9 structured slides with clean data mapping
      const slides = [
        {
          id: 1,
          type: "projectOverview",
          title: projectName,
          subtitle: url,
          narration: `Welcome to your comprehensive SEO audit for ${projectName}. We analyzed ${pagesCrawled} pages of your website to generate this report.`,
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
          narration: `Your overall performance score is ${scores.overall || 0} out of 100. Your SEO score is ${scores.seo || 0}, performance is ${scores.performance || 0}, and AI visibility is ${scores.aiVisibility || 0}.`,
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
          narration: `We found a total of ${issueDistribution.total || 0} issues, including ${issueDistribution.high || 0} high, ${issueDistribution.medium || 0} medium, and ${issueDistribution.low || 0} low priority issues.`,
          data: {
            issueDistribution,
            total: issueDistribution.total || 0
          }
        },
        {
          id: 4,
          type: "highIssues",
          title: "High Priority Issues",
          subtitle: `Showing top ${highIssues.length} of ${issueDistribution.high || 0} high-priority issues`,
          narration: this.generateIssueNarration(issueDistribution.high || 0, highIssues.length, 'high'),
          data: {
            issues: highIssues,
            count: highIssues.length,
            totalHigh: issueDistribution.high || 0
          }
        },
        {
          id: 5,
          type: "mediumIssues",
          title: "Medium Priority Issues",
          subtitle: `Showing top ${mediumIssues.length} of ${issueDistribution.medium || 0} issues`,
          narration: this.generateIssueNarration(issueDistribution.medium || 0, mediumIssues.length, 'medium'),
          data: {
            issues: mediumIssues,
            count: mediumIssues.length,
            totalMedium: issueDistribution.medium || 0
          }
        },
        {
          id: 6,
          type: "lowIssues",
          title: "Low Priority Issues",
          subtitle: `Showing top ${lowIssues.length} of ${issueDistribution.low || 0} issues`,
          narration: this.generateIssueNarration(issueDistribution.low || 0, lowIssues.length, 'low'),
          data: {
            issues: lowIssues,
            count: lowIssues.length,
            totalLow: issueDistribution.low || 0
          }
        },
        {
          id: 7,
          type: "technicalHighlights",
          title: "Technical Highlights",
          subtitle: "Technical SEO Overview",
          narration: this.generateTechnicalNarration(technicalHighlights),
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
          narration: `Your website performance score is ${performanceMetrics.pageSpeed || 0}. Mobile performance is ${performanceMetrics.mobileScore || 0}, while desktop performance is ${performanceMetrics.desktopScore || 0}, indicating areas for improvement.`,
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
          narration: this.generateCoreWebVitalsNarration(coreWebVitals),
          data: coreWebVitals
        }
      ];

      // Add 4 NEW AI Analysis slides (10-13) - NO aiRecommendations slide
      const newAiSlides = this.generateAISlides(aiAnalysis, scores);
      
      // Combine existing slides with new AI slides
      const allSlides = [...slides, ...newAiSlides];
      
      // DEBUG LOG: Final slides data before returning
      console.log("FINAL SLIDES DATA:", JSON.stringify(allSlides, null, 2));
      
      // Validate we have exactly 13 slides (9 original + 4 AI slides)
      if (allSlides.length !== 13) {
        throw new Error(`Expected 13 slides (9 original + 4 AI), got ${allSlides.length}`);
      }
      
      // Validate each slide has required fields
      allSlides.forEach((slide, index) => {
        if (!slide.id || !slide.type || !slide.narration) {
          throw new Error(`Slide ${index + 1} missing required fields`);
        }
      });
      
      console.log(`[VIDEO_WORKER] ✅ Successfully created ${allSlides.length} structured slides (including 3 new AI slides)`);
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
      console.log(`[VIDEO_WORKER] 🤖 Generating 3 AI Analysis slides from aiAnalysis data`);
      
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
        narration: this.generateAIOverviewNarration(scores.aiVisibility || 0, aiAnalysis.hasKnowledgeGraph || false),
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
        narration: this.generateAICategoryNarration(categories),
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
        narration: this.generateAIDetailedMetricsNarration(detailedMetrics),
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
        narration: this.generateAITopIssuesNarration(checklist),
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
   * @returns {Array} Top 3 critical issues with clean titles
   */
  extractTopIssues(checklist) {
    if (!Array.isArray(checklist) || checklist.length === 0) {
      return [];
    }
    
    // Parse real scores from titles and sort by score (lowest first = most critical)
    const sortedIssues = [...checklist]
      .map(issue => {
        const title = issue.title || issue.description || issue.item || 'Unknown issue';
        
        // Extract real score from title like "Rule step_by_step_content scored 20.0"
        const scoreMatch = title.match(/scored\s+(\d+(?:\.\d+)?)/);
        const realScore = scoreMatch ? parseFloat(scoreMatch[1]) : (issue.score || issue.score_value || 0);
        
        // Clean up the title - remove "Rule xxx scored YY:" prefix
        let cleanTitle = title.replace(/^Rule\s+\w+\s+scored\s+\d+(?:\.\d+)?\s*:?\s*/i, '').trim();
        
        // If title is empty after cleaning, use a default based on the original title
        if (!cleanTitle) {
          if (title.includes('faq_section_5_to_10_questions')) {
            cleanTitle = 'FAQ section missing (5–10 questions)';
          } else if (title.includes('schema')) {
            cleanTitle = 'Schema not implemented';
          } else if (title.includes('google_maps_embed')) {
            cleanTitle = 'No Google Maps embed';
          } else if (title.includes('entity') || title.includes('knowledge')) {
            cleanTitle = 'Entity information unclear';
          } else if (title.includes('citation')) {
            cleanTitle = 'Missing citation signals';
          } else if (title.includes('conversational') || title.includes('content')) {
            cleanTitle = 'Poor content structure';
          } else {
            cleanTitle = 'AI optimization issue';
          }
        } else {
          // Convert rule names to readable titles
          if (cleanTitle.includes('faq_section_5_to_10_questions')) {
            cleanTitle = 'FAQ section missing (5–10 questions)';
          } else if (cleanTitle.includes('schema')) {
            cleanTitle = 'Schema not implemented';
          } else if (cleanTitle.includes('google_maps_embed')) {
            cleanTitle = 'No Google Maps embed';
          } else if (cleanTitle.includes('entity') || cleanTitle.includes('knowledge')) {
            cleanTitle = 'Entity information unclear';
          } else if (cleanTitle.includes('citation')) {
            cleanTitle = 'Missing citation signals';
          } else if (cleanTitle.includes('conversational') || cleanTitle.includes('content')) {
            cleanTitle = 'Poor content structure';
          }
        }
        
        return {
          title: cleanTitle,
          score: realScore,
          status: issue.status || 'unknown',
          category: this.deriveCategory(cleanTitle)
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
      
      console.log("[VIDEO_WORKER] ✅ All 13 slides with audio validated successfully");
      return response.data.data;
      
    } catch (error) {
      console.error('[VIDEO_WORKER] Error fetching video data:', error);
      return null;
    }
  }

  async renderVideoWithSlides(projectId, slidesWithAudio, auditSnapshot) {
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
      
      // Validate slides with audio
      console.log(`[VIDEO_WORKER] 🎵 Using ${slidesWithAudio.length} slides with per-slide audio`);
      
      // Calculate total video duration based on slide audio durations
      const totalDuration = slidesWithAudio.reduce((sum, slide) => sum + slide.duration, 0);
      const totalDurationInFrames = Math.round(totalDuration * 30); // Convert to frames at 30 FPS
      console.log(`[VIDEO_WORKER] 🕐 Total video duration: ${totalDuration.toFixed(2)} seconds`);
      console.log(`[VIDEO_WORKER] 🎞️ Total duration frames: ${totalDurationInFrames} frames`);
      
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
