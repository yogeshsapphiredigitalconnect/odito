import express from 'express';
import { completeJob, failJob, claimJob, validateCompleteJob, validateFailJob, validateClaimJob } from '../controller/jobController.js';
import { JobService } from '../service/jobService.js';
import auditProgressService from '../service/auditProgressService.js';

const router = express.Router();
const jobService = new JobService();

/**
 * Job status endpoints
 */

// GET /jobs/:jobId/status - Get job status (for frontend polling)
router.get('/:jobId/status', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    console.log(`🔍 Status check for job: ${jobId}`);
    
    // Get job from database
    const job = await jobService.getJobById(jobId);
    if (!job) {
      console.log(`❌ Job not found: ${jobId}`);
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    console.log(`✅ Job found: ${jobId}, status: ${job.status}`);
    
    // Return job status and relevant data
    res.json({
      success: true,
      data: {
        _id: job._id,
        status: job.status,
        jobType: job.jobType,
        project_id: job.project_id,
        created_at: job.created_at,
        started_at: job.started_at,
        completed_at: job.completed_at,
        failed_at: job.failed_at,
        result_data: job.result_data || {}
      }
    });

  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job status',
      error: error.message
    });
  }
});

/**
 * Job status update endpoints (for Python worker callbacks)
 * These are internal endpoints that Python workers call to update job status
 */

// POST /jobs/:jobId/complete - Mark job as completed
router.post('/:jobId/complete', validateCompleteJob, completeJob);

// POST /jobs/:jobId/fail - Mark job as failed  
router.post('/:jobId/fail', validateFailJob, failJob);

// POST /jobs/claim - Claim a job (for Python workers)
router.post('/claim', validateClaimJob, claimJob);

/**
 * Crawl summary endpoint (for Python worker summary reporting)
 */

// POST /jobs/:jobId/summary - Update project with crawl summary
router.post('/:jobId/summary', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { projectId, seo_jobId, crawl_summary } = req.body;
    
    // Input validation
    if (!jobId) {
      console.log(`⚠️ Summary endpoint missing jobId`);
      return res.status(200).json({
        success: false,
        error: 'Missing jobId'
      });
    }

    if (!projectId) {
      console.log(`⚠️ Summary endpoint missing projectId for job ${jobId}`);
      return res.status(200).json({
        success: false,
        error: 'Missing projectId'
      });
    }

    if (!crawl_summary || !crawl_summary.timing || !crawl_summary.timing.total_crawl_duration_ms) {
      console.log(`⚠️ Summary endpoint missing crawl_summary data for job ${jobId}`);
      return res.status(200).json({
        success: false,
        error: 'Missing crawl_summary data'
      });
    }
    
    console.log(`[API] Crawl summary received | jobId=${jobId} | projectId=${projectId} | duration=${Math.round((crawl_summary.timing.total_crawl_duration_ms || 0) / 1000)}s`);
    
    // Validate job exists and is PAGE_ANALYSIS type
    const job = await jobService.getJobById(jobId);
    if (!job) {
      console.log(`[ERROR] Job not found for summary | jobId=${jobId}`);
      return res.status(200).json({
        success: false,
        error: 'Job not found'
      });
    }

    if (job.jobType !== 'PAGE_ANALYSIS') {
      console.log(`[ERROR] Summary received for non-PAGE_ANALYSIS job | jobId=${jobId} | jobType=${job.jobType}`);
      return res.status(200).json({
        success: false,
        error: 'Summary only allowed for PAGE_ANALYSIS jobs'
      });
    }

    if (job.status !== 'completed') {
      console.log(`[ERROR] Summary received for non-completed job | jobId=${jobId} | status=${job.status}`);
      return res.status(200).json({
        success: false,
        error: 'Summary only allowed for completed jobs'
      });
    }

    // Enhance crawl summary with derived values from job data
    const enhancedSummary = await jobService.enhanceCrawlSummary(projectId, crawl_summary);

    // Update project using enhanced summary data
    const projectUpdateData = {
      total_pages: enhancedSummary.analysis_results?.pages_analyzed || 0,
      total_issues: enhancedSummary.analysis_results?.issues_found || 0,
      pages_discovered: enhancedSummary.discovered_links?.total || enhancedSummary.analysis_results?.pages_analyzed || 0,
      // pages_crawled = total attempted crawls (including failed ones)
      pages_crawled: enhancedSummary.crawled_pages?.total || enhancedSummary.analysis_results?.pages_analyzed || 0,
      pages_analyzed: enhancedSummary.analysis_results?.pages_analyzed || 0,
      // Store duration in ms to match crawl_summary.timing.total_crawl_duration_ms
      crawl_duration: enhancedSummary.timing?.total_crawl_duration_ms || 0,
      crawl_success_rate: 0,
      crawl_status: 'completed',
      last_analysis_at: new Date(),
      last_scraped_at: new Date(),
      last_crawl_summary: enhancedSummary,
      updated_at: new Date()
    };

    console.log("🔍 [DEBUG] enhancedSummary:", enhancedSummary);
    console.log("🔍 [DEBUG] projectUpdateData.last_crawl_summary:", projectUpdateData.last_crawl_summary);

    // SAFETY RULE: Never allow zeros when pages_analyzed > 0
    if (projectUpdateData.pages_analyzed > 0) {
      if (projectUpdateData.pages_discovered === 0) {
        projectUpdateData.pages_discovered = projectUpdateData.pages_analyzed;
        console.log(`[SAFETY] Fixed pages_discovered | projectId=${projectId} | set=${projectUpdateData.pages_discovered}`);
      }
      if (projectUpdateData.pages_crawled === 0) {
        projectUpdateData.pages_crawled = projectUpdateData.pages_analyzed;
        console.log(`[SAFETY] Fixed pages_crawled | projectId=${projectId} | set=${projectUpdateData.pages_crawled}`);
      }
    }

    // crawl_success_rate = successful crawls / discovered pages (overall crawl completion rate)
    if (projectUpdateData.pages_discovered > 0) {
      projectUpdateData.crawl_success_rate = Math.round(
        (projectUpdateData.pages_crawled / projectUpdateData.pages_discovered) * 100
      );
      console.log(`[SAFETY] Calculated crawl_success_rate | projectId=${projectId} | rate=${projectUpdateData.crawl_success_rate}%`);
    }

    // Use JobService to update project - this eliminates mongoose dependency
    const updatedProject = await jobService.updateProjectStats(projectId, projectUpdateData);

    if (!updatedProject) {
      console.log(`[ERROR] Project not found for summary update | projectId=${projectId}`);
      return res.status(200).json({
        success: false,
        error: 'Project not found'
      });
    }

    console.log(`[API] Project updated successfully | projectId=${projectId} | pages=${projectUpdateData.total_pages} | issues=${projectUpdateData.total_issues} | duration=${projectUpdateData.crawl_duration}s`);

    return res.status(200).json({
      success: true,
      message: 'Crawl summary processed and project updated',
      data: {
        projectId,
        jobId,
        updated_fields: Object.keys(projectUpdateData)
      }
    });

  } catch (error) {
    console.error('[ERROR] Error processing crawl summary:', error);
    
    // IMPORTANT: Return 200 OK to prevent Python crawl lifecycle failure
    return res.status(200).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Progress update endpoint (for Python worker progress reporting)
 */

// POST /jobs/:jobId/progress - Update job progress
router.post('/:jobId/progress', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { percentage, step, message, subtext } = req.body;
    
    console.log(`📊 Progress update for job ${jobId}:`, { percentage, step, message });
    
    // Validate job exists
    const job = await jobService.getJobById(jobId);
    if (!job) {
      console.log(`❌ Job not found for progress update: ${jobId}`);
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Emit real-time progress update to frontend
    auditProgressService.emitProgress(jobId, {
      status: 'processing',
      step: step || auditProgressService.mapStatusToStep('processing', percentage).step,
      percentage: Math.max(0, Math.min(100, percentage || 0)),
      message: message || `Processing... ${percentage || 0}%`,
      subtext: subtext || auditProgressService.getStepSubtext(step)
    });

    res.json({
      success: true,
      message: 'Progress update received',
      data: {
        job_id: jobId,
        percentage,
        step,
        message
      }
    });

  } catch (error) {
    console.error('Error updating job progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job progress',
      error: error.message
    });
  }
});

export default router;
