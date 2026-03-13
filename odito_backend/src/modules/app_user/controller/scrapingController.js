import mongoose from 'mongoose';
import { JobService } from '../../jobs/service/jobService.js';
import JobDispatcher from '../../jobs/service/jobDispatcher.js';
import SeoProject from '../model/SeoProject.js';
import auditProgressService from '../../jobs/service/auditProgressService.js';
import fetch from 'node-fetch';
import Job from '../../jobs/model/Job.js';
import { useCredits } from '../../../utils/creditService.js';
import User from '../../user/model/User.js';

// Get MongoDB connection to access collections directly
const getDb = () => mongoose.connection.db;

const jobService = new JobService();
const jobDispatcher = new JobDispatcher();

// Debug: Verify Job model is imported
console.log('🔍 Job model loaded:', typeof Job);

/**
 * Reset all crawl-related data for a project before starting a new crawl
 * This ensures new crawls rewrite existing data instead of creating duplicates
 */
const resetProjectCrawlData = async (projectId) => {
  try {
    const db = getDb();
    const { ObjectId } = mongoose.Types;
    const projectIdObj = new ObjectId(projectId);

    console.log(`[API] Resetting crawl data for project | projectId=${projectId}`);

    // Clear all crawl-related collections for this project
    const collectionsToClear = [
      'seo_internal_links',
      'seo_external_links',
      'seo_social_links',
      'seo_page_data',
      'seo_page_issues',
      'seo_first_snapshot',
      'seo_mainurl_snapshot'
    ];

    let totalDeleted = 0;
    for (const collectionName of collectionsToClear) {
      const result = await db.collection(collectionName).deleteMany({
        projectId: projectIdObj
      });
      totalDeleted += result.deletedCount;
      console.log(`[API] Cleared ${collectionName} | deleted=${result.deletedCount}`);
    }

    // Reset project crawl summary fields
    await SeoProject.findByIdAndUpdate(projectId, {
      pages_discovered: 0,
      pages_crawled: 0,
      pages_analyzed: 0,
      total_issues: 0,
      crawl_duration: 0,
      crawl_success_rate: 0,
      crawl_status: 'pending',
      // last_crawl_summary: null,  // REMOVED: Preserve previous audit results
      last_analysis_at: null
    });

    console.log(`[API] Project crawl data reset complete | projectId=${projectId} | totalDeleted=${totalDeleted}`);
    return totalDeleted;

  } catch (error) {
    console.error(`[ERROR] Failed to reset crawl data | projectId=${projectId} | error="${error.message}"`);
    throw error;
  }
};

/**
 * Start the new scraping pipeline
 * Creates only a LINK_DISCOVERY job initially
 */
export const startScraping = async (req, res) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: 'project_id is required'
      });
    }

    // Verify project exists
    const project = await SeoProject.findById(project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if there's already a LINK_DISCOVERY or PAGE_SCRAPING job running for this project
    const existingJobs = await jobService.getJobsByProject(project_id, {
      jobType: { $in: ['LINK_DISCOVERY', 'PAGE_SCRAPING', 'DOMAIN_PERFORMANCE'] },
      status: { $in: ['pending', 'processing'] }
    });

    // Allow starting audit if no active jobs OR if project is pending (first-time setup)
    if (existingJobs.length > 0 && project.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: 'Scraping already in progress for this project',
        existing_job: existingJobs[0]
      });
    }

    // Check and deduct credits (3 credits per scrape)
    try {
      const user = await User.findById(req.user._id);
      await useCredits(user, 3);
    } catch (creditError) {
      if (creditError.code === 'INSUFFICIENT_CREDITS') {
        return res.status(403).json({
          success: false,
          code: 'INSUFFICIENT_CREDITS',
          message: 'Not enough credits to start scraping'
        });
      }
      throw creditError;
    }

    // CRITICAL: Reset all previous crawl data before starting new crawl
    // This ensures new crawls rewrite existing data instead of creating duplicates
    await resetProjectCrawlData(project_id);

    // Create LINK_DISCOVERY job
    const linkDiscoveryJob = await jobService.createJob({
      user_id: req.user._id,
      seo_project_id: project_id,
      jobType: 'LINK_DISCOVERY',
      input_data: {
        main_url: project.main_url
      },
      priority: 1 // Highest priority
    });

    // Create DOMAIN_PERFORMANCE job
    const domainPerformanceJob = await jobService.createJob({
      user_id: req.user._id,
      seo_project_id: project_id,
      jobType: 'DOMAIN_PERFORMANCE',
      input_data: {
        main_url: project.main_url
      },
      priority: 2
    });

    // Dispatch both jobs asynchronously
    // Don't wait for dispatch to respond to user immediately
    jobDispatcher.queueLinkDiscoveryJob(linkDiscoveryJob).catch(error => {
      console.error(`Failed to queue job ${linkDiscoveryJob._id}:`, error);
    });

    jobDispatcher.queueDomainPerformanceJob(domainPerformanceJob).catch(error => {
      console.error(`Failed to queue job ${domainPerformanceJob._id}:`, error);
    });

    // Update project status to active when scraping starts
    await SeoProject.findByIdAndUpdate(project_id, {
      status: 'active',
      crawl_status: 'running',
      audit_started_at: new Date()
    });

    // Emit audit started event for real-time frontend updates
    auditProgressService.emitStarted(linkDiscoveryJob._id.toString(), {
      job_id: linkDiscoveryJob._id,
      job_type: linkDiscoveryJob.jobType,
      project_id: project_id,
      main_url: project.main_url,
      user_id: req.user._id
    });

    auditProgressService.emitStarted(domainPerformanceJob._id.toString(), {
      job_id: domainPerformanceJob._id,
      job_type: domainPerformanceJob.jobType,
      project_id: project_id,
      main_url: project.main_url,
      user_id: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Your crawling has started',
      data: {
        jobs: [
          {
            job_id: linkDiscoveryJob._id,
            job_type: linkDiscoveryJob.jobType,
            status: linkDiscoveryJob.status,
            priority: linkDiscoveryJob.priority
          },
          {
            job_id: domainPerformanceJob._id,
            job_type: domainPerformanceJob.jobType,
            status: domainPerformanceJob.status,
            priority: domainPerformanceJob.priority
          }
        ],
        project_id: project_id,
        main_url: project.main_url
      }
    });

  } catch (error) {
    console.error('Error starting scraping pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start scraping pipeline',
      error: error.message
    });
  }
};

/**
 * Cancel running audit for a project
 */
export const cancelAudit = async (req, res) => {
  console.log('🔥 Cancel audit API HIT', req.body);

  try {
    const { project_id, job_id } = req.body; // Accept both project_id and job_id

    if (!project_id && !job_id) {
      console.log('❌ Missing project_id or job_id');
      return res.status(400).json({
        success: false,
        message: 'project_id or job_id is required'
      });
    }

    let runningJobs = [];

    if (job_id) {
      // Cancel specific job by job_id (preferred)
      console.log(`🔍 Looking for specific job: ${job_id}`);
      const job = await Job.findById(job_id);
      if (job && ['PROCESSING', 'QUEUED', 'CLAIMED'].includes(job.status)) {
        runningJobs = [job];
      }
    } else {
      // Legacy: find all running jobs for project
      console.log(`🔍 Looking for running jobs in project: ${project_id}`);

      // First, let's see ALL jobs for this project for debugging
      const allJobs = await jobService.getJobsByProject(project_id, {});
      console.log(`📋 ALL jobs for project ${project_id}:`, allJobs.map(j => ({
        id: j._id,
        status: j.status,
        jobType: j.jobType,
        project_id: j.project_id
      })));

      // Find running jobs for this project (PROCESSING, QUEUED, CLAIMED)
      runningJobs = allJobs.filter(job =>
        ['PROCESSING', 'QUEUED', 'CLAIMED'].includes(job.status)
      );
    }

    console.log(`📊 Found ${runningJobs.length} running jobs:`, runningJobs.map(j => ({ id: j._id, status: j.status })));

    if (runningJobs.length === 0) {
      console.log('❌ No running jobs found');
      return res.status(404).json({
        success: false,
        message: 'No running jobs found for this project'
      });
    }

    // Mark jobs as cancelled in database
    const jobIds = runningJobs.map(job => job._id);
    console.log(`🔄 Marking jobs as cancelled: ${jobIds.join(', ')}`);

    for (const jobId of jobIds) {
      await jobService.updateJobStatus(jobId, 'failed', {
        error_message: 'Audit cancelled by user',
        failed_at: new Date()
      });
    }

    console.log('✅ Jobs marked as cancelled in database');

    // Notify Python workers to stop processing these jobs
    const pythonWorkerUrl = process.env.PYTHON_WORKER_URL || 'http://localhost:8000';
    console.log(`📡 Notifying Python worker at: ${pythonWorkerUrl}`);

    for (const jobId of jobIds) {
      try {
        console.log(`📢 Sending cancel request for job: ${jobId}`);
        const response = await fetch(`${pythonWorkerUrl}/jobs/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: jobId.toString() })
        });

        if (response.ok) {
          console.log(`✅ Notified Python worker to cancel job: ${jobId}`);
        } else {
          console.error(`❌ Failed to notify Python worker for job ${jobId}:`, response.statusText);
        }
      } catch (workerError) {
        console.error(`❌ Error notifying Python worker for job ${jobId}:`, workerError.message);
      }
    }

    // Emit cancellation event to frontend via auditProgressService
    runningJobs.forEach(job => {
      auditProgressService.emitError(job._id.toString(), {
        jobId: job._id,
        message: 'Audit cancelled by user',
        subtext: 'The audit was stopped by the user',
        error: 'USER_CANCELLED'
      });
    });

    // Update project status back to draft
    if (project_id) {
      await SeoProject.findByIdAndUpdate(project_id, {
        status: 'draft',
        crawl_status: 'cancelled'
      });
    }

    console.log(`🛑 User cancelled audit, jobs: ${jobIds.join(', ')}`);

    res.json({
      success: true,
      message: 'Audit cancelled successfully',
      data: {
        cancelledJobs: jobIds,
        project_id
      }
    });

  } catch (error) {
    console.error('❌ Error cancelling audit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel audit',
      error: error.message
    });
  }
};

/**
 * Get scraping status for a project
 */
export const getScrapingStatus = async (req, res) => {
  try {
    const { project_id } = req.params;

    const jobs = await jobService.getJobsByProject(project_id);

    // All pipeline job types — update this list when adding new stages
    const PIPELINE_JOB_TYPES = [
      'link_discovery',
      'domain_performance',
      'technical_domain',
      'page_scraping',
      'headless_accessibility',
      'crawl_graph',
      'performance_mobile',
      'performance_desktop',
      'page_analysis',
      'seo_scoring',
      'ai_visibility',
      'ai_visibility_scoring'
    ];

    // Dynamically build the status object from the list
    const status = {};
    PIPELINE_JOB_TYPES.forEach(type => {
      status[type] = { pending: 0, processing: 0, completed: 0, failed: 0, latest: null };
    });

    jobs.forEach(job => {
      const key = job.jobType.toLowerCase();
      if (status[key] && status[key][job.status] !== undefined) {
        status[key][job.status]++;
        if (!status[key].latest || new Date(job.created_at) > new Date(status[key].latest.created_at)) {
          status[key].latest = {
            job_id: job._id,
            status: job.status,
            created_at: job.created_at,
            completed_at: job.completed_at,
            failed_at: job.failed_at
          };
        }
      }
    });

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Error getting scraping status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scraping status',
      error: error.message
    });
  }
};
