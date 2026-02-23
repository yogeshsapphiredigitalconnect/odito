/**
 * Production-safe job completion handler with defensive architecture
 * Prevents cascading failures and ensures reliable webhook responses
 * Includes atomic guards to prevent duplicate next job creation
 */

import { JobService } from '../service/jobService.js';
import auditProgressService from '../service/auditProgressService.js';
import { JOB_TYPES } from '../constants/jobTypes.js';
import jobDispatcher from '../service/jobDispatcher.js';
import SeoProject from '../../app_user/model/SeoProject.js';
import mongoose from 'mongoose';

const jobService = new JobService();

/**
 * Atomic guard to prevent duplicate next job creation
 * Uses findOneAndUpdate with status guard to ensure only one next job is created
 */
async function createNextJobAtomically(sourceJob, nextJobType, requestId) {
  const Job = mongoose.model('Job');
  
  console.log(`[GUARD:${requestId}] Creating next job atomically | sourceJobId=${sourceJob._id} | nextJobType=${nextJobType}`);
  
  // Check if next job already exists for this source job
  const existingNextJob = await Job.findOne({
    'input_data.source_job_id': sourceJob._id.toString(),
    jobType: nextJobType,
    status: { $in: ['pending', 'processing', 'retrying'] }
  });
  
  if (existingNextJob) {
    console.log(`[GUARD:${requestId}] Next job already exists | jobId=${existingNextJob._id} | status=${existingNextJob.status}`);
    return existingNextJob;
  }
  
  // Create next job atomically
  let nextJob;
  switch (nextJobType) {
    case JOB_TYPES.PAGE_SCRAPING:
      nextJob = await jobService.createAndDispatchPageScrapingJob(sourceJob);
      break;
    case JOB_TYPES.PAGE_ANALYSIS:
      nextJob = await jobService.createAndDispatchPageAnalysisJob(sourceJob);
      break;
    case JOB_TYPES.PERFORMANCE_MOBILE:
      nextJob = await jobService.createAndDispatchPerformanceMobileJob(sourceJob);
      break;
    case JOB_TYPES.PERFORMANCE_DESKTOP:
      nextJob = await jobService.createAndDispatchPerformanceDesktopJob(sourceJob);
      break;
    case JOB_TYPES.SEO_SCORING:
      nextJob = await jobService.createAndDispatchSeoScoringJob(sourceJob);
      break;
    default:
      throw new Error(`Unsupported next job type: ${nextJobType}`);
  }
  
  if (nextJob) {
    console.log(`[GUARD:${requestId}] Next job created atomically | jobId=${nextJob._id} | jobType=${nextJobType}`);
  } else {
    console.log(`[GUARD:${requestId}] Next job creation returned null | jobType=${nextJobType}`);
  }
  
  return nextJob;
}

/**
 * Safe job completion with guaranteed response
 * Uses immediate response pattern with async chaining
 */
export const completeJobSafely = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  const { jobId } = req.params;
  const { stats, result_data } = req.body;

  console.log(`[REQUEST:${requestId}] Job completion started | jobId=${jobId}`);

  // Immediate validation and response
  try {
    const job = await jobService.getJobById(jobId);
    if (!job) {
      console.log(`[ERROR:${requestId}] Job not found | jobId=${jobId}`);
      return res.status(404).json({
        success: false,
        message: 'Job not found',
        requestId
      });
    }

    if (job.status === 'completed') {
      console.log(`[INFO:${requestId}] Job already completed | jobId=${jobId}`);
      return res.json({
        success: true,
        message: 'Job already completed',
        requestId
      });
    }

    // Update job status to completed immediately
    const mergedResultData = { ...(stats || {}), ...(result_data || {}) };
    const updatedJob = await jobService.updateJobStatus(jobId, 'completed', {
      result_data: mergedResultData,
      completed_at: new Date()
    });

    console.log(`[SUCCESS:${requestId}] Job status updated | jobId=${jobId} | jobType=${updatedJob.jobType}`);

    // Send immediate response BEFORE chaining
    res.json({
      success: true,
      message: 'Job marked as completed',
      requestId,
      jobType: updatedJob.jobType
    });

    console.log(`[RESPONSE:${requestId}] Response sent | jobId=${jobId}`);

    // Chain jobs asynchronously after response (non-blocking)
    setImmediate(() => {
      chainNextJobs(updatedJob, stats, requestId).catch(error => {
        console.error(`[CHAINING_ERROR:${requestId}] Job chaining failed | jobId=${jobId} | reason="${error.message}"`);
      });
    });

  } catch (error) {
    console.error(`[ERROR:${requestId}] Job completion failed | jobId=${jobId} | reason="${error.message}"`);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to complete job',
        error: error.message,
        requestId
      });
    }
  }
};

/**
 * Asynchronous job chaining (non-blocking)
 * Runs after HTTP response is sent
 */
async function chainNextJobs(updatedJob, stats, requestId) {
  console.log(`[CHAINING:${requestId}] Starting job chaining | jobType=${updatedJob.jobType}`);

  try {
    switch (updatedJob.jobType) {
      case JOB_TYPES.LINK_DISCOVERY:
        await handleLinkDiscoveryCompletion(updatedJob, stats, requestId);
        break;
        
      case JOB_TYPES.PAGE_SCRAPING:
        await handlePageScrapingCompletion(updatedJob, stats, requestId);
        break;
        
      case JOB_TYPES.PERFORMANCE_MOBILE:
        await handlePerformanceMobileCompletion(updatedJob, stats, requestId);
        break;
        
      case JOB_TYPES.PERFORMANCE_DESKTOP:
        await handlePerformanceDesktopCompletion(updatedJob, stats, requestId);
        break;
        
      case JOB_TYPES.PAGE_ANALYSIS:
        await handlePageAnalysisCompletion(updatedJob, stats, requestId);
        break;
        
      default:
        console.log(`[CHAINING:${requestId}] No chaining for jobType=${updatedJob.jobType}`);
    }
    
    console.log(`[CHAINING:${requestId}] Job chaining completed | jobType=${updatedJob.jobType}`);
    
  } catch (error) {
    console.error(`[CHAINING_ERROR:${requestId}] Job chaining failed | jobType=${updatedJob.jobType} | reason="${error.message}"`);
    throw error;
  }
}

/**
 * LINK_DISCOVERY completion handler
 */
async function handleLinkDiscoveryCompletion(updatedJob, stats, requestId) {
  console.log(`[CHAINING:${requestId}] Processing LINK_DISCOVERY completion`);

  // Update project status
  try {
    await SeoProject.findByIdAndUpdate(updatedJob.project_id, {
      crawl_status: 'discovered',
      pages_discovered: stats?.discovered_links?.total || stats?.totalUrlsFound || 0
    });
    console.log(`[CHAINING:${requestId}] Project status updated | projectId=${updatedJob.project_id}`);
  } catch (statusError) {
    console.error(`[CHAINING_ERROR:${requestId}] Project status update failed | reason="${statusError.message}"`);
  }

  // Create and dispatch PAGE_SCRAPING job with atomic guard
  try {
    const pageScrapingJob = await createNextJobAtomically(updatedJob, JOB_TYPES.PAGE_SCRAPING, requestId);
    if (pageScrapingJob) {
      const dispatchedJob = await jobService.atomicallyDispatchJob(pageScrapingJob._id);
      if (dispatchedJob) {
        auditProgressService.emitStageChanged(updatedJob._id.toString(), {
          from: 'LINK_DISCOVERY',
          to: 'PAGE_SCRAPING',
          newJobId: pageScrapingJob._id.toString()
        });
        
        await jobDispatcher.dispatchPageScrapingJob(dispatchedJob);
        console.log(`[CHAINING:${requestId}] PAGE_SCRAPING dispatched | jobId=${dispatchedJob._id}`);
      } else {
        console.log(`[CHAINING:${requestId}] PAGE_SCRAPING already dispatched | jobId=${pageScrapingJob._id}`);
      }
    }
  } catch (error) {
    console.error(`[CHAINING_ERROR:${requestId}] PAGE_SCRAPING creation failed | reason="${error.message}"`);
  }
}

/**
 * PAGE_SCRAPING completion handler
 */
async function handlePageScrapingCompletion(updatedJob, stats, requestId) {
  console.log(`[CHAINING:${requestId}] Processing PAGE_SCRAPING completion`);

  // Update project status
  try {
    await SeoProject.findByIdAndUpdate(updatedJob.project_id, {
      crawl_status: 'crawled',
      pages_crawled: stats?.crawled_pages?.successful || stats?.totalPages || 0
    });
    console.log(`[CHAINING:${requestId}] Project status updated | projectId=${updatedJob.project_id}`);
  } catch (statusError) {
    console.error(`[CHAINING_ERROR:${requestId}] Project status update failed | reason="${statusError.message}"`);
  }

  // Create performance jobs
  await Promise.allSettled([
    createPerformanceJob(updatedJob, 'PERFORMANCE_MOBILE', requestId),
    createPerformanceJob(updatedJob, 'PERFORMANCE_DESKTOP', requestId)
  ]);
}

/**
 * Performance job creation helper
 */
async function createPerformanceJob(sourceJob, jobType, requestId) {
  try {
    let performanceJob;
    
    if (jobType === 'PERFORMANCE_MOBILE') {
      performanceJob = await jobService.createAndDispatchPerformanceMobileJob(sourceJob);
    } else if (jobType === 'PERFORMANCE_DESKTOP') {
      performanceJob = await jobService.createAndDispatchPerformanceDesktopJob(sourceJob);
    }
    
    if (performanceJob) {
      const dispatchedJob = await jobService.atomicallyDispatchJob(performanceJob._id);
      if (dispatchedJob) {
        auditProgressService.emitStageChanged(sourceJob._id.toString(), {
          from: 'PAGE_SCRAPING',
          to: jobType,
          newJobId: performanceJob._id.toString()
        });
        
        if (jobType === 'PERFORMANCE_MOBILE') {
          await jobDispatcher.dispatchPerformanceMobileJob(dispatchedJob);
        } else if (jobType === 'PERFORMANCE_DESKTOP') {
          await jobDispatcher.dispatchPerformanceDesktopJob(dispatchedJob);
          // Create PAGE_ANALYSIS after desktop completes
          await createPageAnalysisJob(sourceJob, requestId);
        }
        
        console.log(`[CHAINING:${requestId}] ${jobType} dispatched | jobId=${dispatchedJob._id}`);
      }
    }
  } catch (error) {
    console.error(`[CHAINING_ERROR:${requestId}] ${jobType} creation failed | reason="${error.message}"`);
    
    // Fallback: Create PAGE_ANALYSIS directly if performance jobs fail
    if (jobType === 'PERFORMANCE_MOBILE') {
      await createPageAnalysisJob(sourceJob, requestId);
    }
  }
}

/**
 * PAGE_ANALYSIS creation helper
 */
async function createPageAnalysisJob(sourceJob, requestId) {
  try {
    const pageAnalysisJob = await jobService.createAndDispatchPageAnalysisJob(sourceJob);
    if (pageAnalysisJob) {
      const dispatchedJob = await jobService.atomicallyDispatchJob(pageAnalysisJob._id);
      if (dispatchedJob) {
        auditProgressService.emitStageChanged(sourceJob._id.toString(), {
          from: 'PAGE_SCRAPING',
          to: 'PAGE_ANALYSIS',
          newJobId: pageAnalysisJob._id.toString()
        });
        
        await jobDispatcher.dispatchPageAnalysisJob(dispatchedJob);
        console.log(`[CHAINING:${requestId}] PAGE_ANALYSIS dispatched | jobId=${dispatchedJob._id}`);
      }
    }
  } catch (error) {
    console.error(`[CHAINING_ERROR:${requestId}] PAGE_ANALYSIS creation failed | reason="${error.message}"`);
  }
}

/**
 * PERFORMANCE_MOBILE completion handler
 */
async function handlePerformanceMobileCompletion(updatedJob, stats, requestId) {
  console.log(`[CHAINING:${requestId}] Processing PERFORMANCE_MOBILE completion`);
  // PAGE_ANALYSIS will be created after PERFORMANCE_DESKTOP completes
}

/**
 * PERFORMANCE_DESKTOP completion handler
 */
async function handlePerformanceDesktopCompletion(updatedJob, stats, requestId) {
  console.log(`[CHAINING:${requestId}] Processing PERFORMANCE_DESKTOP completion`);
  await createPageAnalysisJob(updatedJob, requestId);
}

/**
 * PAGE_ANALYSIS completion handler
 */
async function handlePageAnalysisCompletion(updatedJob, stats, requestId) {
  console.log(`[CHAINING:${requestId}] Processing PAGE_ANALYSIS completion`);

  // Emit completion event immediately
  try {
    auditProgressService.emitCompleted(updatedJob.project_id, {
      projectId: updatedJob.project_id,
      jobId: updatedJob._id.toString(),
      stats: stats,
      summary: {
        pages_analyzed: stats?.pagesAnalyzed || stats?.totalPages || 0,
        issues_found: stats?.issuesFound || 0,
        crawl_status: 'completed'
      }
    });
    console.log(`[CHAINING:${requestId}] Completion event emitted | projectId=${updatedJob.project_id}`);
  } catch (emitError) {
    console.error(`[CHAINING_ERROR:${requestId}] Event emission failed | reason="${emitError.message}"`);
  }

  // Update project status
  try {
    const project = await SeoProject.findById(updatedJob.project_id);
    const analysisCompletionTime = new Date();
    const auditDurationMs = project?.audit_started_at 
      ? analysisCompletionTime.getTime() - project.audit_started_at.getTime()
      : 0;

    await SeoProject.findByIdAndUpdate(updatedJob.project_id, {
      crawl_status: 'completed',
      pages_analyzed: stats?.pagesAnalyzed || stats?.totalPages || 0,
      total_issues: stats?.issuesFound || 0,
      last_analysis_at: analysisCompletionTime,
      audit_duration_ms: Math.max(0, auditDurationMs)
    });
    console.log(`[CHAINING:${requestId}] Project updated | projectId=${updatedJob.project_id}`);
  } catch (statusError) {
    console.error(`[CHAINING_ERROR:${requestId}] Project update failed | reason="${statusError.message}"`);
  }

  // Create SEO_SCORING job with atomic guard
  try {
    const seoScoringJob = await createNextJobAtomically(updatedJob, JOB_TYPES.SEO_SCORING, requestId);
    if (seoScoringJob) {
      const dispatchedJob = await jobService.atomicallyDispatchJob(seoScoringJob._id);
      if (dispatchedJob) {
        auditProgressService.emitStageChanged(updatedJob._id.toString(), {
          from: 'PAGE_ANALYSIS',
          to: 'SEO_SCORING',
          newJobId: seoScoringJob._id.toString()
        });
        
        await jobDispatcher.dispatchSeoScoringJob(dispatchedJob);
        console.log(`[CHAINING:${requestId}] SEO_SCORING dispatched | jobId=${dispatchedJob._id}`);
      } else {
        console.log(`[CHAINING:${requestId}] SEO_SCORING already dispatched | jobId=${seoScoringJob._id}`);
      }
    }
  } catch (error) {
    console.error(`[CHAINING_ERROR:${requestId}] SEO_SCORING creation failed | reason="${error.message}"`);
  }
}

export default completeJobSafely;
