import { JobService } from '../service/jobService.js';
import { body, param, validationResult } from 'express-validator';
import auditProgressService from '../service/auditProgressService.js';
import { JOB_TYPES, JOB_TYPE_CONFIG } from '../constants/jobTypes.js';
import JobDispatcher from '../service/jobDispatcher.js';
import SeoProject from '../../app_user/model/SeoProject.js';
import AIVisibilityProject from '../../ai_visibility/model/AIVisibilityProject.js';
import Job from '../model/Job.js';
import axios from 'axios';

const jobService = new JobService();
const jobDispatcher = new JobDispatcher();

/**
 * Complete a job (callback from Python worker)
 */
export const completeJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { jobId } = req.params;
    const { stats, result_data } = req.body;

    // Validate job exists
    const job = await jobService.getJobById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already completed (idempotent)
    if (job.status === 'completed') {
      return res.json({
        success: true,
        message: 'Job already completed'
      });
    }

    // Update job status to completed
    const mergedResultData = {
      ...(stats || {}),
      ...(result_data || {})
    };

    const updatedJob = await jobService.updateJobStatus(jobId, 'completed', {
      result_data: mergedResultData,
      completed_at: new Date()
    });

    // CRITICAL: Job chaining logic - only Node.js can create jobs
    if (updatedJob.jobType === JOB_TYPES.LINK_DISCOVERY) {
      // Update project crawl_status to DISCOVERED after LINK_DISCOVERY completes
      try {
        await SeoProject.findByIdAndUpdate(updatedJob.project_id, {
          crawl_status: 'discovered',
          pages_discovered: stats?.discovered_links?.total || stats?.totalUrlsFound || 0
        });
        console.log(`[API] Project crawl_status updated | projectId=${updatedJob.project_id} | status=discovered | pages_discovered=${stats?.discovered_links?.total || stats?.totalUrlsFound || 0}`);
      } catch (statusError) {
        console.error(`[ERROR] Failed to update crawl_status after LINK_DISCOVERY | projectId=${updatedJob.project_id} | reason="${statusError.message}"`);
      }

      // Chain to TECHNICAL_DOMAIN (data collection step)
      try {
        const technicalDomainJob = await jobService.createAndDispatchTechnicalDomainJob(updatedJob);

        if (technicalDomainJob) {
          // Atomic dispatch - prevents duplicates
          const dispatchedJob = await jobService.atomicallyDispatchJob(technicalDomainJob._id);

          if (dispatchedJob) {
            // Emit stage change event for frontend
            auditProgressService.emitStageChanged(jobId, {
              from: 'LINK_DISCOVERY',
              to: 'TECHNICAL_DOMAIN',
              newJobId: technicalDomainJob._id.toString()
            });

            // Dispatch to Python worker (fire-and-forget)
            jobDispatcher.dispatchTechnicalDomainJob(dispatchedJob).catch(error => {
              console.error(`[ERROR] TECHNICAL_DOMAIN dispatch failed | jobId=${dispatchedJob._id} | reason="${error.message}"`);
            });
          }
        }
      } catch (chainingError) {
        console.error(`[ERROR] TECHNICAL_DOMAIN creation failed | sourceJobId=${updatedJob._id} | reason="${chainingError.message}"`);

        // FALLBACK: If TECHNICAL_DOMAIN fails to create, skip directly to PAGE_SCRAPING
        console.log(`[FALLBACK] Skipping TECHNICAL_DOMAIN, creating PAGE_SCRAPING directly`);
        try {
          const pageScrapingJob = await jobService.createAndDispatchPageScrapingJob(updatedJob);
          if (pageScrapingJob) {
            const dispatchedJob = await jobService.atomicallyDispatchJob(pageScrapingJob._id);
            if (dispatchedJob) {
              auditProgressService.emitStageChanged(jobId, {
                from: 'LINK_DISCOVERY',
                to: 'PAGE_SCRAPING',
                newJobId: pageScrapingJob._id.toString()
              });
              jobDispatcher.dispatchPageScrapingJob(dispatchedJob).catch(error => {
                console.error(`[ERROR] PAGE_SCRAPING dispatch failed | jobId=${dispatchedJob._id} | reason="${error.message}"`);
              });
            }
          }
        } catch (fallbackError) {
          console.error(`[ERROR] Fallback PAGE_SCRAPING creation also failed | reason="${fallbackError.message}"`);
        }
      }
    } else if (updatedJob.jobType === JOB_TYPES.TECHNICAL_DOMAIN) {
      // TECHNICAL_DOMAIN completed → chain to PAGE_SCRAPING
      console.log(`[API] TECHNICAL_DOMAIN completion received | jobId=${jobId}`);

      try {
        // Use the original LINK_DISCOVERY job data to create PAGE_SCRAPING
        // We need the source LINK_DISCOVERY job to get discovered URLs
        const sourceJobId = updatedJob.input_data?.source_job_id;
        let sourceJob = updatedJob;

        if (sourceJobId) {
          const linkDiscoveryJob = await jobService.getJobById(sourceJobId);
          if (linkDiscoveryJob) {
            sourceJob = linkDiscoveryJob;
          }
        }

        const pageScrapingJob = await jobService.createAndDispatchPageScrapingJob(sourceJob);

        if (pageScrapingJob) {
          const dispatchedJob = await jobService.atomicallyDispatchJob(pageScrapingJob._id);

          if (dispatchedJob) {
            auditProgressService.emitStageChanged(jobId, {
              from: 'TECHNICAL_DOMAIN',
              to: 'PAGE_SCRAPING',
              newJobId: pageScrapingJob._id.toString()
            });

            jobDispatcher.dispatchPageScrapingJob(dispatchedJob).catch(error => {
              console.error(`[ERROR] PAGE_SCRAPING dispatch failed | jobId=${dispatchedJob._id} | reason="${error.message}"`);
            });
          }
        }
      } catch (chainingError) {
        console.error(`[ERROR] PAGE_SCRAPING creation failed after TECHNICAL_DOMAIN | sourceJobId=${updatedJob._id} | reason="${chainingError.message}"`);
      }
    } else if (updatedJob.jobType === JOB_TYPES.PAGE_SCRAPING) {
      console.log(`[API] PAGE_SCRAPING completion received | jobId=${jobId}`);

      // Update project crawl_status to CRAWLED after PAGE_SCRAPING completes
      try {
        await SeoProject.findByIdAndUpdate(updatedJob.project_id, {
          crawl_status: 'crawled',
          pages_crawled: stats?.crawled_pages?.successful || stats?.totalPages || 0
        });
        console.log(`[API] Project crawl_status updated | projectId=${updatedJob.project_id} | status=crawled | pages_crawled=${stats?.crawled_pages?.successful || stats?.totalPages || 0}`);
      } catch (statusError) {
        console.error(`[ERROR] Failed to update crawl_status after PAGE_SCRAPING | projectId=${updatedJob.project_id} | reason="${statusError.message}"`);
      }

      try {
        console.log(`[DEBUG] Creating PERFORMANCE_MOBILE job for sourceJobId=${updatedJob._id}`);
        console.log(`[DEBUG] pageScrapingJob.user_id=${updatedJob.user_id}`);
        console.log(`[DEBUG] pageScrapingJob.project_id=${updatedJob.project_id}`);

        // Create PERFORMANCE_MOBILE job first
        const performanceMobileJob = await jobService.createAndDispatchPerformanceMobileJob(updatedJob);

        console.log(`[DEBUG] PERFORMANCE_MOBILE job creation returned | result=${performanceMobileJob ? 'SUCCESS' : 'NULL'}`);

        if (performanceMobileJob) {
          console.log(`[DEBUG] PERFORMANCE_MOBILE job created successfully | jobId=${performanceMobileJob._id}`);
          // Atomic dispatch - prevents duplicates
          const dispatchedMobileJob = await jobService.atomicallyDispatchJob(performanceMobileJob._id);

          if (dispatchedMobileJob) {
            console.log(`[DEBUG] PERFORMANCE_MOBILE job dispatched successfully | jobId=${dispatchedMobileJob._id}`);
            // Emit stage change event for frontend
            auditProgressService.emitStageChanged(jobId, {
              from: 'PAGE_SCRAPING',
              to: 'PERFORMANCE_MOBILE',
              newJobId: performanceMobileJob._id.toString()
            });

            // Dispatch to Python worker (fire-and-forget)
            jobDispatcher.dispatchPerformanceMobileJob(dispatchedMobileJob).catch(error => {
              console.error(`[ERROR] PERFORMANCE_MOBILE dispatch failed | jobId=${dispatchedMobileJob._id} | reason="${error.message}"`);
            });

            // Create PERFORMANCE_DESKTOP job after mobile is dispatched
            console.log(`[DEBUG] Creating PERFORMANCE_DESKTOP job for sourceJobId=${updatedJob._id}`);
            const performanceDesktopJob = await jobService.createAndDispatchPerformanceDesktopJob(updatedJob);

            if (performanceDesktopJob) {
              console.log(`[DEBUG] PERFORMANCE_DESKTOP job created successfully | jobId=${performanceDesktopJob._id}`);
              // Atomic dispatch - prevents duplicates
              const dispatchedDesktopJob = await jobService.atomicallyDispatchJob(performanceDesktopJob._id);

              if (dispatchedDesktopJob) {
                console.log(`[DEBUG] PERFORMANCE_DESKTOP job dispatched successfully | jobId=${dispatchedDesktopJob._id}`);
                // Emit stage change event for frontend
                auditProgressService.emitStageChanged(jobId, {
                  from: 'PERFORMANCE_MOBILE',
                  to: 'PERFORMANCE_DESKTOP',
                  newJobId: performanceDesktopJob._id.toString()
                });

                // Dispatch to Python worker (fire-and-forget)
                jobDispatcher.dispatchPerformanceDesktopJob(dispatchedDesktopJob).catch(error => {
                  console.error(`[ERROR] PERFORMANCE_DESKTOP dispatch failed | jobId=${dispatchedDesktopJob._id} | reason="${error.message}"`);
                });
              } else {
                console.log(`[ERROR] PERFORMANCE_DESKTOP atomicallyDispatchJob returned null`);
              }
            } else {
              console.log(`[ERROR] PERFORMANCE_DESKTOP createAndDispatchPerformanceDesktopJob returned null`);
            }
          } else {
            console.log(`[ERROR] PERFORMANCE_MOBILE atomicallyDispatchJob returned null`);
          }
        } else {
          console.log(`[ERROR] PERFORMANCE_MOBILE createAndDispatchPerformanceMobileJob returned null`);
        }
      } catch (chainingError) {
        console.error(`[ERROR] Performance job creation failed | sourceJobId=${updatedJob._id} | reason="${chainingError.message}"`);
        console.error(`[ERROR] Error type: ${chainingError.constructor.name}`);
        console.error(`[ERROR] Full error stack: ${chainingError.stack}`);

        // Fallback: Create PAGE_ANALYSIS directly if performance jobs fail
        console.log(`[FALLBACK] Creating PAGE_ANALYSIS directly due to performance job failure`);
        try {
          const pageAnalysisJob = await jobService.createAndDispatchPageAnalysisJob(updatedJob);
          if (pageAnalysisJob) {
            console.log(`[FALLBACK] PAGE_ANALYSIS job created | jobId=${pageAnalysisJob._id}`);
            const dispatchedJob = await jobService.atomicallyDispatchJob(pageAnalysisJob._id);
            if (dispatchedJob) {
              auditProgressService.emitStageChanged(jobId, {
                from: 'PAGE_SCRAPING',
                to: 'PAGE_ANALYSIS',
                newJobId: pageAnalysisJob._id.toString()
              });
              jobDispatcher.dispatchPageAnalysisJob(dispatchedJob).catch(error => {
                console.error(`[ERROR] PAGE_ANALYSIS dispatch failed | jobId=${dispatchedJob._id} | reason="${error.message}"`);
              });
            }
          }
        } catch (fallbackError) {
          console.error(`[ERROR] Fallback PAGE_ANALYSIS creation also failed | reason="${fallbackError.message}"`);
        }
      }

    } else if (updatedJob.jobType === JOB_TYPES.PERFORMANCE_MOBILE) {
      console.log(`[API] PERFORMANCE_MOBILE completion received | jobId=${jobId}`);
      // PAGE_ANALYSIS will be created after PERFORMANCE_DESKTOP completes

    } else if (updatedJob.jobType === JOB_TYPES.PERFORMANCE_DESKTOP) {
      console.log(`[API] PERFORMANCE_DESKTOP completion received | jobId=${jobId}`);

      try {
        // Create PAGE_ANALYSIS job only after both performance jobs complete
        const pageAnalysisJob = await jobService.createAndDispatchPageAnalysisJob(updatedJob);

        if (pageAnalysisJob) {
          // Atomic dispatch - prevents duplicates
          const dispatchedJob = await jobService.atomicallyDispatchJob(pageAnalysisJob._id);

          if (dispatchedJob) {
            // Emit stage change event for frontend
            auditProgressService.emitStageChanged(jobId, {
              from: 'PERFORMANCE_DESKTOP',
              to: 'PAGE_ANALYSIS',
              newJobId: pageAnalysisJob._id.toString()
            });

            // Dispatch to Python worker (fire-and-forget)
            jobDispatcher.dispatchPageAnalysisJob(dispatchedJob).catch(error => {
              console.error(`[ERROR] PAGE_ANALYSIS dispatch failed | jobId=${dispatchedJob._id} | reason="${error.message}"`);
            });
          }
        }
      } catch (chainingError) {
        console.error(`[ERROR] PAGE_ANALYSIS creation failed | sourceJobId=${updatedJob._id} | reason="${chainingError.message}"`);
      }
    } else if (updatedJob.jobType === JOB_TYPES.PAGE_ANALYSIS) {
      console.log(`[API] PAGE_ANALYSIS completion received | jobId=${jobId}`);

      // 🔥 CRITICAL: Emit completion event FIRST (never block on DB)
      try {
        auditProgressService.emitCompleted(updatedJob.project_id, {
          projectId: updatedJob.project_id,
          jobId: jobId,
          stats: stats,
          summary: {
            pages_analyzed: stats?.pagesAnalyzed || stats?.totalPages || 0,
            issues_found: stats?.issuesFound || 0,
            crawl_status: 'completed'
          }
        });
        console.log(`[EVENT] Final audit completion emitted | projectId=${updatedJob.project_id} | jobId=${jobId}`);
      } catch (emitError) {
        console.error(`[ERROR] Failed to emit completion event | projectId=${updatedJob.project_id} | reason="${emitError.message}"`);
      }

      // Update project crawl_status to COMPLETED after PAGE_ANALYSIS completes (best-effort)
      try {
        // Get project to calculate accurate audit duration using lifecycle timestamps
        const project = await SeoProject.findById(updatedJob.project_id);
        const analysisCompletionTime = new Date();

        // 🎯 TRUE audit duration = last_analysis_at - audit_started_at (lifecycle, not worker timing)
        const auditDurationMs = project?.audit_started_at
          ? analysisCompletionTime.getTime() - project.audit_started_at.getTime()
          : 0;

        await SeoProject.findByIdAndUpdate(updatedJob.project_id, {
          crawl_status: 'completed',
          pages_analyzed: stats?.pagesAnalyzed || stats?.totalPages || 0,
          total_issues: stats?.issuesFound || 0,
          last_analysis_at: analysisCompletionTime,
          audit_duration_ms: Math.max(0, auditDurationMs) // 🎯 SINGLE SOURCE OF TRUTH
        });
        console.log(`[API] Project crawl_status updated | projectId=${updatedJob.project_id} | status=completed | pages_analyzed=${stats?.pagesAnalyzed || stats?.totalPages || 0} | total_issues=${stats?.issuesFound || 0} | audit_duration_ms=${auditDurationMs}ms`);
      } catch (statusError) {
        console.error(`[WARN] Failed to update crawl_status after PAGE_ANALYSIS | projectId=${updatedJob.project_id} | reason="${statusError.message}"`);
      }

      try {
        // Create SEO_SCORING job after PAGE_ANALYSIS completes successfully
        const seoScoringJob = await jobService.createAndDispatchSeoScoringJob(updatedJob);

        if (seoScoringJob) {
          // Atomic dispatch - prevents duplicates
          const dispatchedJob = await jobService.atomicallyDispatchJob(seoScoringJob._id);

          if (dispatchedJob) {
            // Emit stage change event for frontend
            auditProgressService.emitStageChanged(jobId, {
              from: 'PAGE_ANALYSIS',
              to: 'SEO_SCORING',
              newJobId: seoScoringJob._id.toString()
            });

            // Dispatch to Python worker (fire-and-forget)
            jobDispatcher.dispatchSeoScoringJob(dispatchedJob).catch(error => {
              console.error(`[ERROR] SEO_SCORING dispatch failed | jobId=${dispatchedJob._id} | reason="${error.message}"`);
            });
          }
        }
      } catch (chainingError) {
        console.error(`[ERROR] SEO_SCORING creation failed | sourceJobId=${updatedJob._id} | reason="${chainingError.message}"`);
      }
    } else if (updatedJob.jobType === JOB_TYPES.AI_VISIBILITY_SCORING && updatedJob.status === 'completed') {
      console.log(`[API] AI_VISIBILITY_SCORING completion received | jobId=${jobId}`);

      // 🔥 CRITICAL: Update AIVisibilityProject with final scoring results
      try {
        // Extract aiProjectId from job input_data
        const aiProjectId = updatedJob.input_data?.aiProjectId;

        console.log('[SCORING COMPLETION LOOKUP]', { jobId: updatedJob._id, aiProjectId });

        if (!aiProjectId) {
          console.error(`[AI_PROJECT] CRITICAL: No aiProjectId in job input_data | jobId=${updatedJob._id}`);
          return res.json({
            success: true,
            message: 'Job marked as completed (AI project update skipped)'
          });
        }

        // Get current version first for optimistic locking
        const currentProject = await AIVisibilityProject.findById(aiProjectId);
        if (!currentProject) {
          console.error(`[AI_PROJECT] CRITICAL: Not found for scoring job | aiProjectId=${aiProjectId} | jobId=${updatedJob._id}`);
        } else {
          // Use optimistic locking with version check and status protection
          const aiProjectUpdate = await AIVisibilityProject.findOneAndUpdate(
            { _id: aiProjectId, version: currentProject.version, aiStatus: { $ne: 'completed' } },
            {
              $set: {
                aiStatus: 'completed',
                completedAt: new Date(),
                lastActivityAt: new Date(),
                'summary.overallScore': stats?.overallScore || 0,
                'summary.grade': stats?.grade || 'F',
                'summary.totalIssues': stats?.totalIssues || 0,
                'summary.highSeverityIssues': stats?.highSeverityIssues || 0,
                'summary.mediumSeverityIssues': stats?.mediumSeverityIssues || 0,
                'summary.lowSeverityIssues': stats?.lowSeverityIssues || 0,
                'summary.pagesScored': stats?.pagesScored || 0,
                'summary.totalPages': stats?.totalPages || 0
              },
              $inc: { version: 1 }
            },
            { new: true }
          );

          if (aiProjectUpdate) {
            console.log(`[AI_PROJECT] Final scoring completed | aiProjectId=${aiProjectUpdate._id} | score=${stats?.overallScore || 0} | version=${aiProjectUpdate.version}`);
          } else {
            // Check if it was already completed
            const alreadyCompleted = await AIVisibilityProject.findById(aiProjectId);
            if (alreadyCompleted && alreadyCompleted.aiStatus === 'completed') {
              console.log(`[AI_PROJECT] Already completed - idempotent scoring operation | aiProjectId=${alreadyCompleted._id} | score=${alreadyCompleted.summary?.overallScore || 0}`);
            } else {
              console.warn(`[AI_PROJECT] Version conflict detected in scoring | aiProjectId=${currentProject._id} | expectedVersion=${currentProject.version}`);
            }
          }
        }
      } catch (updateError) {
        console.error(`[AI_PROJECT] Failed to update final scoring | jobId=${updatedJob._id}:`, updateError);
      }

      // 🔥 CRITICAL: Emit clean completion event (no old AI fields)
      try {
        auditProgressService.emitCompleted(updatedJob.project_id, {
          projectId: updatedJob.project_id,
          jobId: updatedJob._id,
          jobType: updatedJob.jobType,
          message: "AI visibility scoring completed successfully"
        });
        console.log(`[EVENT] Audit completed emitted | jobId=${updatedJob._id} | percentage=100`);
      } catch (emitError) {
        console.error(`[ERROR] Failed to emit AI visibility scoring completion event | projectId=${updatedJob.project_id} | reason="${emitError.message}"`);
      }

      return res.json({
        success: true,
        message: 'Job marked as completed'
      });
    } else if (updatedJob.jobType === JOB_TYPES.AI_LINK_DISCOVERY && updatedJob.status === 'completed') {
      console.log(`[AI_CHAIN] AI_LINK_DISCOVERY completed → Creating AI_VISIBILITY`);

      try {
        // Explicitly extract aiProjectId to guarantee propagation
        const aiProjectId = updatedJob.input_data.aiProjectId;

        if (!aiProjectId) {
          console.error(`[ERROR] AI_LINK_DISCOVERY missing aiProjectId in input_data | jobId=${updatedJob._id}`);
          throw new Error('AI_LINK_DISCOVERY job missing aiProjectId for chaining');
        }

        console.log(`[CHAINING] Creating AI_VISIBILITY with aiProjectId=${aiProjectId}`);

        const nextJob = await jobService.createJob({
          user_id: updatedJob.user_id,
          seo_project_id: aiProjectId,
          jobType: JOB_TYPES.AI_VISIBILITY,
          input_data: {
            aiProjectId: aiProjectId,   // MUST be explicitly set
            isStandalone: true
          }
        });

        console.log(`[CHAINING] AI_VISIBILITY job queued | jobId=${nextJob._id} | sourceJobId=${updatedJob._id}`);

        // 🔥 CRITICAL: Emit stage change event for frontend (AI chaining)
        try {
          await auditProgressService.emitStageChanged(updatedJob._id.toString(), {
            oldJobId: updatedJob._id.toString(),
            newJobId: nextJob._id.toString(),
            from: 'AI_LINK_DISCOVERY',
            to: 'AI_VISIBILITY',
            stageName: 'AI Visibility Analysis',
            projectId: updatedJob.input_data.aiProjectId
          });
          console.log(`[EVENT] Stage changed | oldJobId=${updatedJob._id} | newJobId=${nextJob._id} | from=AI_LINK_DISCOVERY | to=AI_VISIBILITY`);
        } catch (emitError) {
          console.error(`[ERROR] Failed to emit AI stage change event | oldJobId=${updatedJob._id} | reason="${emitError.message}"`);
        }

        // Update AI project with latest job ID
        try {
          await AIVisibilityProject.updateOne(
            { _id: updatedJob.input_data.aiProjectId },
            { $set: { aiJobId: nextJob._id } }
          );
          console.log(`[AI_PROJECT] Updated aiJobId to ${nextJob._id} for AI_VISIBILITY job`);
        } catch (e) {
          console.error(`[ERROR] Failed to update AI project aiJobId: ${e.message}`);
        }

        // Dispatch to Python worker (fire-and-forget)
        await jobService.atomicallyDispatchJob(nextJob._id);
        jobDispatcher.dispatchAiVisibilityJob(nextJob).catch(error => {
          console.error(`[ERROR] AI_VISIBILITY dispatch failed | jobId=${nextJob._id} | reason="${error.message}"`);
        });

      } catch (err) {
        console.error(`[ERROR] AI_VISIBILITY creation failed | sourceJobId=${updatedJob._id} | reason="${err.message}"`);
      }

      return res.json({
        success: true,
        message: 'Job marked as completed'
      });
    } else if (updatedJob.jobType === JOB_TYPES.AI_VISIBILITY && updatedJob.status === 'completed') {
      console.log(`[AI_CHAIN] AI_VISIBILITY completed → Creating AI_VISIBILITY_SCORING`);

      try {
        const aiScoringJob = await jobService.createAndDispatchAiVisibilityScoringJob(updatedJob);

        console.log(`[CHAINING] AI_VISIBILITY_SCORING job queued | jobId=${aiScoringJob._id} | sourceJobId=${updatedJob._id}`);

        // 🔥 CRITICAL: Emit stage change event for frontend (AI chaining)
        try {
          await auditProgressService.emitStageChanged(updatedJob._id.toString(), {
            oldJobId: updatedJob._id.toString(),
            newJobId: aiScoringJob._id.toString(),
            from: 'AI_VISIBILITY',
            to: 'AI_VISIBILITY_SCORING',
            stageName: 'AI Visibility Scoring',
            projectId: updatedJob.project_id
          });
          console.log(`[EVENT] Stage changed | oldJobId=${updatedJob._id} | newJobId=${aiScoringJob._id} | from=AI_VISIBILITY | to=AI_VISIBILITY_SCORING`);
        } catch (emitError) {
          console.error(`[ERROR] Failed to emit AI stage change event | oldJobId=${updatedJob._id} | reason="${emitError.message}"`);
        }

        // Update AI project with latest job ID
        try {
          await AIVisibilityProject.updateOne(
            { _id: updatedJob.input_data?.aiProjectId },
            { $set: { aiJobId: aiScoringJob._id } }
          );
          console.log(`[AI_PROJECT] Updated aiJobId to ${aiScoringJob._id} for AI_VISIBILITY_SCORING job`);
        } catch (e) {
          console.error(`[ERROR] Failed to update AI project aiJobId: ${e.message}`);
        }

        // 🔥 CRITICAL: Dispatch to Python worker (fire-and-forget)
        jobDispatcher.dispatchAiVisibilityScoringJob(aiScoringJob).catch(error => {
          console.error(`[ERROR] AI_VISIBILITY_SCORING dispatch failed | jobId=${aiScoringJob._id} | reason="${error.message}"`);
        });

      } catch (err) {
        console.error(`[ERROR] AI_VISIBILITY_SCORING creation failed | sourceJobId=${updatedJob._id} | reason="${err.message}"`);
      }

      return res.json({
        success: true,
        message: 'Job marked as completed'
      });
    }

  } catch (error) {
    console.log(`[ERROR] Job completion failed | jobId=${jobId} | jobType=${job.jobType} | reason="${error.message}"`);
    res.status(500).json({
      success: false,
      message: 'Failed to complete job',
      error: error.message
    });
  }
};

/**
 * Fail a job (callback from Python worker)
 */
export const failJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { jobId } = req.params;
    const { error, stats } = req.body;

    // Validate job exists
    const job = await jobService.getJobById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already completed (idempotent)
    if (job.status === 'completed') {
      return res.json({
        success: true,
        message: 'Job already completed'
      });
    }

    // Create error object
    const errorObj = error ? {
      message: error.message || error,
      timestamp: new Date()
    } : {
      message: 'Unknown error from Python worker',
      timestamp: new Date()
    };

    // Update job status to failed
    const updatedJob = await jobService.failJob(jobId, errorObj, {
      result_data: stats || {}
    });

    console.log(`[ERROR] Job failed | jobId=${jobId} | reason="${errorObj.message}"`);

    // 🔥 CRITICAL: Update AIVisibilityProject status for AI jobs
    if (updatedJob.jobType && (
      updatedJob.jobType === JOB_TYPES.AI_VISIBILITY ||
      updatedJob.jobType === JOB_TYPES.AI_VISIBILITY_SCORING
    )) {
      try {
        const aiProjectUpdate = await AIVisibilityProject.findOneAndUpdate(
          { aiJobId: updatedJob._id },
          {
            $set: {
              aiStatus: 'failed',
              'error.message': errorObj.message,
              'error.stage': 'job_failure',
              'error.timestamp': new Date(),
              'error.lastError': errorObj.message,
              lastActivityAt: new Date()
            },
            $inc: {
              version: 1,
              'error.retryCount': 1
            }
          },
          { new: true }
        );

        if (aiProjectUpdate) {
          console.log(`[AI_PROJECT] Marked as failed | aiProjectId=${aiProjectUpdate._id} | error="${errorObj.message}"`);
        } else {
          console.warn(`[AI_PROJECT] Not found for failed job | jobId=${updatedJob._id}`);
        }
      } catch (updateError) {
        console.error(`[AI_PROJECT] Failed to mark as failed | jobId=${updatedJob._id}:`, updateError);
      }
    }

    // 🔥 CRITICAL: If TECHNICAL_DOMAIN fails, continue pipeline to PAGE_SCRAPING
    if (updatedJob.jobType === JOB_TYPES.TECHNICAL_DOMAIN) {
      console.log(`[FALLBACK] TECHNICAL_DOMAIN failed, continuing pipeline to PAGE_SCRAPING | jobId=${jobId}`);
      try {
        const sourceJobId = updatedJob.input_data?.source_job_id;
        let sourceJob = updatedJob;

        if (sourceJobId) {
          const linkDiscoveryJob = await jobService.getJobById(sourceJobId);
          if (linkDiscoveryJob) {
            sourceJob = linkDiscoveryJob;
          }
        }

        const pageScrapingJob = await jobService.createAndDispatchPageScrapingJob(sourceJob);
        if (pageScrapingJob) {
          const dispatchedJob = await jobService.atomicallyDispatchJob(pageScrapingJob._id);
          if (dispatchedJob) {
            auditProgressService.emitStageChanged(jobId, {
              from: 'TECHNICAL_DOMAIN',
              to: 'PAGE_SCRAPING',
              newJobId: pageScrapingJob._id.toString()
            });
            jobDispatcher.dispatchPageScrapingJob(dispatchedJob).catch(error => {
              console.error(`[ERROR] PAGE_SCRAPING dispatch failed | jobId=${dispatchedJob._id} | reason="${error.message}"`);
            });
            console.log(`[FALLBACK] PAGE_SCRAPING created after TECHNICAL_DOMAIN failure | jobId=${pageScrapingJob._id}`);
          }
        }
      } catch (fallbackError) {
        console.error(`[ERROR] Fallback PAGE_SCRAPING creation failed after TECHNICAL_DOMAIN failure | reason="${fallbackError.message}"`);
      }

      // Return early - don't reset project to draft for TECHNICAL_DOMAIN failure
      return res.json({
        success: true,
        message: 'Job marked as failed (pipeline continues)',
        data: {
          job_id: jobId,
          status: 'failed',
          failed_at: updatedJob.failed_at,
          error: errorObj.message,
          stats: stats || {}
        }
      });
    }

    // CRITICAL: Update project status to draft when job fails
    try {
      await SeoProject.findByIdAndUpdate(job.project_id, {
        crawl_status: 'draft',
        status: 'draft'
      });
      console.log(`[API] Project status reset to draft | projectId=${job.project_id} | jobId=${jobId}`);
    } catch (statusError) {
      console.error(`[ERROR] Failed to reset project status | projectId=${job.project_id} | error="${statusError.message}"`);
    }

    // Emit real-time error update to frontend
    auditProgressService.emitError(jobId, {
      jobId: jobId,
      message: errorObj.message,
      subtext: 'The audit encountered an error and has been stopped',
      error: errorObj.message || 'WORKER_ERROR'
    });

    res.json({
      success: true,
      message: 'Job marked as failed',
      data: {
        job_id: jobId,
        status: 'failed',
        failed_at: updatedJob.failed_at,
        error: errorObj.message,
        stats: stats || {}
      }
    });
  } catch (error) {
    console.log(`[ERROR] Job failure processing failed | jobId=${jobId} | jobType=${job.jobType} | reason="${error.message}"`);
    res.status(500).json({
      success: false,
      message: 'Failed to fail job',
      error: error.message
    });
  }
};

// Validation middleware - relaxed for Python worker callbacks
export const validateCompleteJob = [
  // param('jobId').isMongoId().withMessage('Valid job ID required'),
  body('stats').optional().isObject().withMessage('Stats must be an object'),
  body('result_data').optional().isObject().withMessage('Result data must be an object')
];

export const validateFailJob = [
  // param('jobId').isMongoId().withMessage('Valid job ID required'),
  body('error').optional().isString().withMessage('Error must be a string'),
  body('stats').optional().isObject().withMessage('Stats must be an object')
];

/**
 * Claim a job (for Python workers)
 */
export const claimJob = async (req, res) => {
  try {
    const { job_type, worker_id } = req.body;

    if (!job_type || !worker_id) {
      return res.status(400).json({
        success: false,
        message: 'job_type and worker_id are required'
      });
    }

    // Atomically claim a job
    const job = await Job.findOneAndUpdate(
      {
        jobType: job_type,
        status: 'pending',
        $or: [
          { last_attempted_at: { $lt: new Date(Date.now() - 5 * 60 * 1000) } },
          { last_attempted_at: null }
        ]
      },
      {
        $set: {
          status: 'processing',
          claimed_at: new Date(),
          started_at: new Date(),
          last_attempted_at: new Date()
        },
        $inc: { attempts: 1 }
      },
      {
        new: true,
        sort: { priority: -1, created_at: 1 }
      }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'No jobs available'
      });
    }

    console.log(`[JOB] Job claimed | jobId=${job._id} | jobType=${job.jobType} | worker=${worker_id}`);

    return res.json({
      success: true,
      job: {
        _id: job._id,
        project_id: job.project_id,
        user_id: job.user_id,
        input_data: job.input_data
      }
    });

  } catch (error) {
    console.error('[JOB_CLAIM_ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to claim job'
    });
  }
};

export const validateClaimJob = [
  body('job_type').isString().withMessage('Job type must be a string'),
  body('worker_id').isString().withMessage('Worker ID must be a string')
];
