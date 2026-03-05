# Research Report: Adding AI_VISIBILITY to Pipeline
## Integrating AI Track in Parallel with SEO Track

**Date**: March 4, 2026  
**Objective**: Research feasibility of triggering AI_VISIBILITY and AI_VISIBILITY_SCORING in parallel with existing SEO pipeline  
**Affected Tracks**: SEO pipeline (LINK_DISCOVERY → ... → SEO_SCORING) + AI track (PAGE_SCRAPING → AI_VISIBILITY → AI_VISIBILITY_SCORING)

---

## Executive Summary

| Question | Answer | Status |
|----------|--------|--------|
| **Is AI_VISIBILITY currently connected to the pipeline or isolated?** | ISOLATED - only reachable from AI_LINK_DISCOVERY | ❌ Not integrated |
| **Does pipelineConfig.js support adding AI_VISIBILITY to PAGE_SCRAPING.next[]?** | YES - architecture supports parallel arrays | ✅ Supported |
| **Does chainingEngine.js support dispatching in parallel with CRAWL_GRAPH?** | YES - parallel: true mechanism exists | ✅ Supported |
| **Does jobDispatcher have dispatchAiVisibilityJob()?** | YES - fully implemented | ✅ Implemented |
| **Does AI_VISIBILITY → AI_VISIBILITY_SCORING chaining exist?** | YES - in jobController.js manually | ⚠️ Manual, not in pipeline config |
| **Does AIVisibilityProject need automatic creation?** | MAYBE - currently optional for standalone | ❓ Optional but recommended |
| **What is current data flow for AI_VISIBILITY?** | Independent - fetches from seo_ai_visibility collection | ✅ Independent |
| **Files that need changes** | 3-4 files | 📝 See details below |

---

## 1. CURRENT STATE: AI_VISIBILITY ISOLATION

### Current Flow (Standalone AI Projects Only)
```
POST /api/ai-visibility/create
  ↓
AIVisibilityProject created
  ↓
AI_LINK_DISCOVERY job created
  ↓
AI_LINK_DISCOVERY completes
  ↓
jobController.js handles chaining:
  AI_LINK_DISCOVERY → AI_VISIBILITY (manually created)
  AI_VISIBILITY → AI_VISIBILITY_SCORING (manually created)
```

**Key Finding**: AI_VISIBILITY is **NOT** in the declarative pipeline config at all.

---

## 2. PIPELINE ARCHITECTURE ANALYSIS

### Current pipelineConfig.js Structure

**File**: [odito_backend/src/modules/jobs/pipelineConfig.js](odito_backend/src/modules/jobs/pipelineConfig.js)

```javascript
// CURRENT STATE (Lines 48-56)
[JOB_TYPES.PAGE_SCRAPING]: {
  next: [JOB_TYPES.CRAWL_GRAPH],           // Only CRAWL_GRAPH
  parallel: false,                          // Sequential
  atomicGuard: true,
  creationFallback: {
    [JOB_TYPES.CRAWL_GRAPH]: [JOB_TYPES.PERFORMANCE_MOBILE, JOB_TYPES.PERFORMANCE_DESKTOP, JOB_TYPES.HEADLESS_ACCESSIBILITY]
  }
},

// Parallel jobs (Lines 57-65)
[JOB_TYPES.CRAWL_GRAPH]: {
  next: [JOB_TYPES.PERFORMANCE_MOBILE, JOB_TYPES.PERFORMANCE_DESKTOP, JOB_TYPES.HEADLESS_ACCESSIBILITY],
  parallel: true,  // ← Parallel mechanism already exists
  atomicGuard: false
},
```

**Analysis**: 
- ✅ `next` array supports multiple jobs (e.g., `[JOB_TYPES.CRAWL_GRAPH, JOB_TYPES.AI_VISIBILITY]`)
- ✅ `parallel: true` mechanism already handles multiple jobs
- ✅ Architecture is **ready** for parallel job creation
- ❌ AI_VISIBILITY not present in config

---

## 3. CHAINING ENGINE ANALYSIS

### Current JOB_CREATION_MAP and JOB_DISPATCH_MAP

**File**: [odito_backend/src/modules/jobs/chainingEngine.js](odito_backend/src/modules/jobs/chainingEngine.js) (Lines 25-46)

```javascript
const JOB_CREATION_MAP = {
  [JOB_TYPES.TECHNICAL_DOMAIN]: (src) => jobService.createAndDispatchTechnicalDomainJob(src),
  [JOB_TYPES.PAGE_SCRAPING]: (src) => jobService.createAndDispatchPageScrapingJob(src),
  [JOB_TYPES.PAGE_ANALYSIS]: (src) => jobService.createAndDispatchPageAnalysisJob(src),
  [JOB_TYPES.PERFORMANCE_MOBILE]: (src) => jobService.createAndDispatchPerformanceMobileJob(src),
  [JOB_TYPES.PERFORMANCE_DESKTOP]: (src) => jobService.createAndDispatchPerformanceDesktopJob(src),
  [JOB_TYPES.HEADLESS_ACCESSIBILITY]: (src) => jobService.createAndDispatchHeadlessAccessibilityJob(src),
  [JOB_TYPES.SEO_SCORING]: (src) => jobService.createAndDispatchSeoScoringJob(src),
  [JOB_TYPES.CRAWL_GRAPH]: (src) => jobService.createAndDispatchCrawlGraphJob(src),
  // ❌ AI_VISIBILITY MISSING
};

const JOB_DISPATCH_MAP = {
  [JOB_TYPES.TECHNICAL_DOMAIN]: (job) => jobDispatcher.dispatchTechnicalDomainJob(job),
  [JOB_TYPES.PAGE_SCRAPING]: (job) => jobDispatcher.dispatchPageScrapingJob(job),
  [JOB_TYPES.PERFORMANCE_MOBILE]: (job) => jobDispatcher.dispatchPerformanceMobileJob(job),
  [JOB_TYPES.PERFORMANCE_DESKTOP]: (job) => jobDispatcher.dispatchPerformanceDesktopJob(job),
  [JOB_TYPES.HEADLESS_ACCESSIBILITY]: (job) => jobDispatcher.dispatchHeadlessAccessibilityJob(job),
  [JOB_TYPES.PAGE_ANALYSIS]: (job) => jobDispatcher.dispatchPageAnalysisJob(job),
  [JOB_TYPES.SEO_SCORING]: (job) => jobDispatcher.dispatchSeoScoringJob(job),
  [JOB_TYPES.CRAWL_GRAPH]: (job) => jobDispatcher.dispatchCrawlGraphJob(job),
  // ❌ AI_VISIBILITY MISSING
};
```

**Analysis**:
- ❌ `AI_VISIBILITY` not in JOB_CREATION_MAP
- ❌ `AI_VISIBILITY` not in JOB_DISPATCH_MAP
- ✅ Architecture supports adding it (Maps support any job type)
- ✅ Parallel execution logic (Promise.allSettled) already ready (Lines 112-133)

### How Parallel Execution Works (Lines 112-133)

```javascript
if (config.parallel) {
  console.log(`[CHAINING:${requestId}] === PARALLEL EXECUTION START ===`);
  
  await Promise.allSettled(
    config.next.map((nextType, index) => {
      console.log(`[CHAINING:${requestId}] [PARALLEL MAP ${index}] Calling _createAndDispatchJob for nextType=${nextType}`);
      return this._createAndDispatchJob(nextType, updatedJob, sourceJob, stageFrom, config, requestId, false);
    })
  );
  console.log(`[CHAINING:${requestId}] === PARALLEL EXECUTION COMPLETE ===`);
}
```

**Key Point**: If `PAGE_SCRAPING.parallel = true` and `next: [CRAWL_GRAPH, AI_VISIBILITY]`, both will be created simultaneously.

---

## 4. JOB SERVICE ANALYSIS

### Existing createAndDispatch Methods

**File**: [odito_backend/src/modules/jobs/service/jobService.js](odito_backend/src/modules/jobs/service/jobService.js)

#### createAndDispatchCrawlGraphJob (Lines 509-540)
```javascript
async createAndDispatchCrawlGraphJob(pageScrapingJob) {
  try {
    console.log(`[DEBUG] createAndDispatchCrawlGraphJob called with pageScrapingJob._id=${pageScrapingJob._id}`);

    const crawlGraphJob = await this.createJob({
      user_id: pageScrapingJob.user_id,
      seo_project_id: pageScrapingJob.project_id,
      jobType: JOB_TYPES.CRAWL_GRAPH,
      input_data: {
        source_job_id: pageScrapingJob._id.toString()
      },
      priority: JOB_TYPE_CONFIG[JOB_TYPES.CRAWL_GRAPH].priority
    });

    console.log(`[QUEUE] CRAWL_GRAPH job queued | jobId=${crawlGraphJob._id} | sourceJobId=${pageScrapingJob._id}`);
    return crawlGraphJob;

  } catch (error) {
    console.error(`[ERROR] CRAWL_GRAPH creation failed | sourceJobId=${pageScrapingJob._id} | reason="${error.message}"`);
    console.error(`[ERROR] Full error stack: ${error.stack}`);
    throw error;
  }
}
```

**Pattern**: Create job with `source_job_id` reference + return for dispatch

#### createAndDispatchAiVisibilityScoringJob (Lines 593-613)

```javascript
async createAndDispatchAiVisibilityScoringJob(aiVisibilityAnalysisJob) {
  try {
    const aiVisibilityScoringJob = await this.createJob({
      user_id: aiVisibilityAnalysisJob.user_id,
      seo_project_id: aiVisibilityAnalysisJob.project_id,
      jobType: JOB_TYPES.AI_VISIBILITY_SCORING,
      input_data: {
        source_job_id: aiVisibilityAnalysisJob._id.toString(),
        aiProjectId: aiVisibilityAnalysisJob.input_data?.aiProjectId || null
      },
      priority: JOB_TYPE_CONFIG[JOB_TYPES.AI_VISIBILITY_SCORING].priority
    });

    console.log(`[QUEUE] AI_VISIBILITY_SCORING job queued | jobId=${aiVisibilityScoringJob._id} | sourceJobId=${aiVisibilityAnalysisJob._id}`);
    return aiVisibilityScoringJob;

  } catch (error) {
    console.error(`[ERROR] AI_VISIBILITY_SCORING creation failed | sourceJobId=${aiVisibilityAnalysisJob._id} | reason="${error.message}"`);
    throw error;
  }
}
```

**Finding**: ✅ AI_VISIBILITY_SCORING job creation method EXISTS but no `createAndDispatchAiVisibilityJob()` method exists

---

## 5. JOB DISPATCHER ANALYSIS

### Existing dispatchAiVisibilityJob

**File**: [odito_backend/src/modules/jobs/service/jobDispatcher.js](odito_backend/src/modules/jobs/service/jobDispatcher.js) (Lines 476-526)

```javascript
/**
 * Dispatch AI_VISIBILITY job directly to Python worker via HTTP
 * This is PUSH model - Node actively calls Python
 * CRITICAL: Job must already be atomically marked as dispatched
 */
async dispatchAiVisibilityJob(job) {
  try {
    const payload = {
      jobId: job._id.toString(),
      projectId: job.project_id ? job.project_id.toString() : null,
      userId: job.user_id.toString(),
      aiProjectId: job.input_data?.aiProjectId?.toString() || null
    };

    console.log("[DISPATCH] AI_VISIBILITY payload:", {
      projectId: payload.projectId,
      aiProjectId: payload.aiProjectId,
      hasInputData: !!job.input_data
    });

    // Job should already be marked as dispatched atomically
    // Just send the HTTP request to Python
    const response = await axios.post(`${this.pythonBaseURL}/api/jobs/ai-visibility`, payload, {
      timeout: 600000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      jobId: job._id
    };
  } catch (error) {
    console.error(`[ERROR] AI_VISIBILITY dispatch failed | jobId=${job._id} | reason="${error.message}"`);

    // Mark job as failed if dispatch fails
    await jobService.updateJobStatus(job._id, 'FAILED', {
      completed_at: new Date(),
      error_message: `Dispatch failed: ${error.message}`
    });

    return {
      success: false,
      message: 'Failed to dispatch AI_VISIBILITY job to Python worker',
      error: error.message
    };
  }
}

/**
 * Dispatch AI_VISIBILITY_SCORING job directly to Python worker via HTTP
 */
async dispatchAiVisibilityScoringJob(job) {
  try {
    const payload = {
      jobId: job._id.toString(),
      projectId: job.project_id.toString(),
      userId: job.user_id.toString(),
      sourceJobId: job.input_data?.source_job_id || '',
      aiProjectId: job.input_data?.aiProjectId || null
    };

    console.log('[SCORING DISPATCH PAYLOAD]', payload);

    const response = await axios.post(`${this.pythonBaseURL}/api/jobs/ai-visibility-scoring`, payload, {
      timeout: 300000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      jobId: job._id
    };
  } catch (error) {
    console.error(`[ERROR] AI_VISIBILITY_SCORING dispatch failed | jobId=${job._id} | reason="${error.message}"`);

    await jobService.updateJobStatus(job._id, 'FAILED', {
      completed_at: new Date(),
      error_message: `Dispatch failed: ${error.message}`
    });

    return {
      success: false,
      message: 'Failed to dispatch AI_VISIBILITY_SCORING job to Python worker',
      error: error.message
    };
  }
}
```

**Finding**: ✅ BOTH dispatchAiVisibilityJob() and dispatchAiVisibilityScoringJob() are fully implemented

---

## 6. CHAINING FLOW (MANUAL, NON-DECLARATIVE)

### Current AI_VISIBILITY → AI_VISIBILITY_SCORING Chaining

**File**: [odito_backend/src/modules/jobs/controller/jobController.js](odito_backend/src/modules/jobs/controller/jobController.js) (Lines 438-520)

#### AI_LINK_DISCOVERY Completion (Lines 438-497)
```javascript
} else if (updatedJob.jobType === JOB_TYPES.AI_LINK_DISCOVERY && updatedJob.status === 'completed') {
  console.log(`[AI_CHAIN] AI_LINK_DISCOVERY completed → Creating AI_VISIBILITY`);

  try {
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
        aiProjectId: aiProjectId,
        isStandalone: true
      }
    });

    // ... emit event and dispatch ...
    await jobService.atomicallyDispatchJob(nextJob._id);
    jobDispatcher.dispatchAiVisibilityJob(nextJob).catch(error => {
      console.error(`[ERROR] AI_VISIBILITY dispatch failed | jobId=${nextJob._id} | reason="${error.message}"`);
    });

  } catch (err) {
    console.error(`[ERROR] AI_VISIBILITY creation failed | sourceJobId=${updatedJob._id} | reason="${err.message}"`);
  }
}
```

#### AI_VISIBILITY Completion (Lines 504-520)
```javascript
} else if (updatedJob.jobType === JOB_TYPES.AI_VISIBILITY && updatedJob.status === 'completed') {
  console.log(`[AI_CHAIN] AI_VISIBILITY completed → Creating AI_VISIBILITY_SCORING`);

  try {
    const aiScoringJob = await jobService.createAndDispatchAiVisibilityScoringJob(updatedJob);

    console.log(`[CHAINING] AI_VISIBILITY_SCORING job queued | jobId=${aiScoringJob._id} | sourceJobId=${updatedJob._id}`);

    // ... emit event and dispatch ...
    await jobService.atomicallyDispatchJob(aiScoringJob._id);
    jobDispatcher.dispatchAiVisibilityScoringJob(aiScoringJob).catch(error => {
      console.error(`[ERROR] AI_VISIBILITY_SCORING dispatch failed | jobId=${aiScoringJob._id} | reason="${error.message}"`);
    });
```

**Finding**: ⚠️ AI chaining is **manual** in jobController.js, NOT in declarative pipelineConfig.js

---

## 7. JOB TYPES DEFINITION

**File**: [odito_backend/src/modules/jobs/constants/jobTypes.js](odito_backend/src/modules/jobs/constants/jobTypes.js)

```javascript
// Lines 32-40
// Crawl Graph Analysis (internal link graph)
CRAWL_GRAPH: 'CRAWL_GRAPH',

// AI Visibility Jobs
AI_VISIBILITY: 'AI_VISIBILITY',

// AI Visibility Scoring (final stage)
AI_VISIBILITY_SCORING: 'AI_VISIBILITY_SCORING',

// AI Link Discovery for new standalone projects
AI_LINK_DISCOVERY: 'AI_LINK_DISCOVERY',

// Lines 167-177
[JOB_TYPES.AI_VISIBILITY]: {
  maxAttempts: 2,
  timeout: 600000,       // 10 minutes for AI analysis
  priority: 5,            // 🔥 FIFTH PRIORITY
  workerType: 'ai_visibility'
},

[JOB_TYPES.AI_VISIBILITY_SCORING]: {
  maxAttempts: 3,
  timeout: 300000,       // 5 minutes
  priority: 8,
  workerType: 'ai_visibility_scorer'
},
```

**Finding**: ✅ Both job types and their configuration are already defined

---

## 8. PIPELINE ENTRY POINT ANALYSIS

### Where startAudit() is triggered

**File**: [odito_backend/src/modules/app_user/controller/scrapingController.js](odito_backend/src/modules/app_user/controller/scrapingController.js) (Lines 76-165)

```javascript
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

    // ... credit check ...
    // ... reset crawl data ...

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

    // Dispatch job to queue
    jobDispatcher.queueLinkDiscoveryJob(linkDiscoveryJob).catch(error => {
      console.error(`Failed to queue job ${linkDiscoveryJob._id}:`, error);
    });

    // Update project status
    await SeoProject.findByIdAndUpdate(project_id, {
      status: 'active',
      crawl_status: 'running',
      audit_started_at: new Date()
    });

    // Emit audit started event
    auditProgressService.emitStarted(linkDiscoveryJob._id.toString(), {
      job_id: linkDiscoveryJob._id,
      job_type: linkDiscoveryJob.jobType,
      project_id: project_id,
      main_url: project.main_url,
      user_id: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Your crawling has started',
      data: {
        job_id: linkDiscoveryJob._id,
        job_type: linkDiscoveryJob.jobType,
        status: linkDiscoveryJob.status,
        priority: linkDiscoveryJob.priority,
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
```

**Finding**: Entry point is `startScraping()` which creates LINK_DISCOVERY job. No AIVisibilityProject creation here - only happens in AI module.

---

## 9. AI VISIBILITY PROJECT MODEL

**File**: [odito_backend/src/modules/ai_visibility/model/AIVisibilityProject.js](odito_backend/src/modules/ai_visibility/model/AIVisibilityProject.js) (Lines 1-50)

```javascript
const aiVisibilityProjectSchema = new mongoose.Schema({
  // Ownership & Identity
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SeoProject',
    required: false, // Optional for standalone projects
    index: true
  },
  
  isStandalone: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Job Tracking
  aiJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: false,
    index: true
  },
  
  // Status Lifecycle
  aiStatus: {
    type: String,
    enum: ['pending', 'running', 'analyzing', 'scoring', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  
  // ... more fields ...
});
```

**Finding**: ✅ AIVisibilityProject supports linking to SeoProject (not required if standalone), but currently not auto-created on startAudit()

---

## 10. PAGE_SCRAPING DATA FLOW

**File**: [odito_backend/src/modules/jobs/service/jobService.js](odito_backend/src/modules/jobs/service/jobService.js) (Lines 654-693)

```javascript
async createAndDispatchPageScrapingJob(linkDiscoveryJob) {
  try {
    // Get MongoDB connection to access discovered URLs
    const db = mongoose.connection.db;

    // Query internal links discovered by LINK_DISCOVERY job
    const internalLinks = await db.collection('seo_internal_links')
      .find({ seo_jobId: linkDiscoveryJob._id })
      .project({ url: 1, _id: 0 })
      .toArray();

    if (internalLinks.length === 0) {
      return null;
    }

    // Extract URLs for PAGE_SCRAPING job input
    const urls = internalLinks.map(link => link.url);

    // Create PAGE_SCRAPING job with URLs as input data
    const pageScrapingJob = await this.createJob({
      user_id: linkDiscoveryJob.user_id,
      seo_project_id: linkDiscoveryJob.project_id,
      jobType: JOB_TYPES.PAGE_SCRAPING,
      input_data: {
        urls: urls,
        source_job_id: linkDiscoveryJob._id.toString()
      },
      priority: JOB_TYPE_CONFIG[JOB_TYPES.PAGE_SCRAPING].priority
    });

    console.log(`[QUEUE] PAGE_SCRAPING job queued | jobId=${pageScrapingJob._id}`);
    return pageScrapingJob;

  } catch (error) {
    console.error(`[ERROR] PAGE_SCRAPING creation failed | sourceJobId=${linkDiscoveryJob._id} | reason="${error.message}"`);
    throw error;
  }
}
```

**Finding**: ✅ PAGE_SCRAPING reads URLs from `seo_internal_links` collection (populated by LINK_DISCOVERY) and stores them in `input_data.urls`

---

## 11. DATA FLOW FOR AI_VISIBILITY

**Current AI_VISIBILITY data source**: Independent collection `seo_ai_visibility`

Python worker reference:
**File**: [python_workers/scraper/workers/ai/ai_visibility_analysis/execute_ai_visibility_analysis.py](python_workers/scraper/workers/ai/ai_visibility_analysis/execute_ai_visibility_analysis.py) (Lines 37-50)

```python
pages = list(seo_ai_visibility.find({
  'project_id': project_id,
  'status': 'completed'
}))

if len(pages) == 0:
  print(f"[WORKER] AI_VISIBILITY_ANALYSIS loaded {len(pages)} pages | jobId={job_id}")
```

**Finding**: ✅ AI_VISIBILITY runs independently - it queries its own `seo_ai_visibility` collection, not `seo_pages` from PAGE_SCRAPING

This means **NO data dependency** between SEO and AI tracks ✓

---

## 12. COMPLETENESS VERIFICATION

### What EXISTS ✅
| Component | Location | Status |
|-----------|----------|--------|
| AI_VISIBILITY job type | jobTypes.js | ✅ Defined |
| AI_VISIBILITY_SCORING job type | jobTypes.js | ✅ Defined |
| Job type configuration | jobTypes.js:167-177 | ✅ Complete |
| dispatchAiVisibilityJob() | jobDispatcher.js:476-526 | ✅ Implemented |
| dispatchAiVisibilityScoringJob() | jobDispatcher.js:527-573 | ✅ Implemented |
| createAndDispatchAiVisibilityScoringJob() | jobService.js:593-613 | ✅ Implemented |
| AI_VISIBILITY → AI_VISIBILITY_SCORING chaining | jobController.js:504-520 | ✅ Implemented (manual) |
| AIVisibilityProject model | aiVisibilityProject.js | ✅ Exists |
| Parallel execution infrastructure | chainingEngine.js:112-133 | ✅ Ready |

### What is MISSING ❌
| Component | Needed For | Impact |
|-----------|-----------|--------|
| pipelineConfig entry for AI_VISIBILITY | Declarative pipeline integration | CRITICAL |
| createAndDispatchAiVisibilityJob() | Job creation in jobService | CRITICAL |
| AI_VISIBILITY in JOB_CREATION_MAP | chainingEngine to call creation | CRITICAL |
| AI_VISIBILITY in JOB_DISPATCH_MAP | chainingEngine to call dispatch | CRITICAL |
| pipelineConfig for AI_VISIBILITY_SCORING | Move AI chaining to declarative config | NICE-TO-HAVE |
| Automatic AIVisibilityProject creation on startAudit() | Link SEO and AI projects | OPTIONAL |

---

## 13. FILES AFFECTED BY INTEGRATION

### Files That MUST Change (3 minimum)

| # | File | Current State | Required Change | Complexity |
|---|------|---------------|-----------------|-----------|
| 1 | `pipelineConfig.js` | PAGE_SCRAPING has `next: [CRAWL_GRAPH]` only | Add AI_VISIBILITY to PAGE_SCRAPING.next[] + new config for AI_VISIBILITY | **LOW** |
| 2 | `jobService.js` | Has createAndDispatchAiVisibilityScoringJob() but not createAndDispatchAiVisibilityJob() | Add createAndDispatchAiVisibilityJob() method | **LOW** |
| 3 | `chainingEngine.js` | JOB_CREATION_MAP and JOB_DISPATCH_MAP missing AI_VISIBILITY | Add AI_VISIBILITY entries to both maps | **LOW** |

### Files That SHOULD Change (1 optional)

| # | File | Current State | Recommended Change | Complexity |
|---|------|---------------|-------------------|-----------|
| 4 | `jobController.js` | Manual AI chaining in completion handler (lines 504-520) | Move AI_VISIBILITY_SCORING chaining to pipelineConfig.js | **MEDIUM** |

### Files That COULD Change (2 optional)

| # | File | Current State | Optional Change | Reason |
|---|------|---------------|-----------------|--------|
| 5 | `scrapingController.js` | startScraping() only creates LINK_DISCOVERY | Auto-create AIVisibilityProject when startAudit() called | Link projects for dashboard visibility |
| 6 | `aiVisibilityController.js` | AI projects created manually via separate API | Integrate with startScraping() | Unified entry point |

---

## 14. CURRENT STATE: COMPLETE CODE SNIPPETS

### chainingEngine.js: Process Method (Lines 62-163)

```javascript
async process(updatedJob, stats, requestId) {
  const jobType = updatedJob.jobType;
  const config = PIPELINE_CONFIG[jobType];

  console.log(`[CHAINING:${requestId}] Starting job chaining | jobType=${jobType}`);
  
  try {
    // No config or empty next → nothing to chain (but may have dependency gate)
    if (!config || !config.next || config.next.length === 0) {
      console.log(`[CHAINING:${requestId}] No direct chaining for jobType=${jobType}`);
    } else {
      // Pre-chain hooks
      if (config.hooks?.beforeChain === 'emitCompleted') {
        await this._emitCompletionEvent(updatedJob, stats, requestId);
      }

      // Resolve source job if needed
      let sourceJob = updatedJob;
      if (config.resolveSource) {
        sourceJob = await jobDataService.resolveSourceJob(updatedJob);
      }

      const stageFrom = config.stageFrom || jobType;

      console.log(`[CHAINING:${requestId}] config.next = ${JSON.stringify(config?.next)}`);

      if (config.parallel) {
        console.log(`[CHAINING:${requestId}] === PARALLEL EXECUTION START ===`);
        
        await Promise.allSettled(
          config.next.map((nextType, index) => {
            console.log(`[CHAINING:${requestId}] [PARALLEL MAP ${index}] Calling _createAndDispatchJob for nextType=${nextType}`);
            return this._createAndDispatchJob(nextType, updatedJob, sourceJob, stageFrom, config, requestId, false);
          })
        );
        console.log(`[CHAINING:${requestId}] === PARALLEL EXECUTION COMPLETE ===`);
      } else {
        console.log(`[CHAINING:${requestId}] === SEQUENTIAL EXECUTION START ===`);
        
        for (let i = 0; i < config.next.length; i++) {
          const nextType = config.next[i];
          console.log(`[CHAINING:${requestId}] [SEQUENTIAL ITERATION ${i}] nextType=${nextType}`);
          await this._createAndDispatchJob(nextType, updatedJob, sourceJob, stageFrom, config, requestId, false);
        }
        console.log(`[CHAINING:${requestId}] === SEQUENTIAL EXECUTION COMPLETE ===`);
      }
    }

    // Dependency gate for PAGE_ANALYSIS
    if (DEPENDENCY_GATE_TYPES.has(jobType)) {
      await this._checkDependencyGate(updatedJob, requestId);
    }

    console.log(`[CHAINING:${requestId}] Job chaining completed | jobType=${jobType}`);

  } catch (error) {
    console.error(`[CHAINING_ERROR:${requestId}] Job chaining failed | jobType=${jobType} | reason="${error.message}"`);
    throw error;
  }
}
```

**Key Observation**: The `config.parallel` and `config.next.map()` pattern already handles arrays of jobs perfectly

---

## 15. FEASIBILITY ASSESSMENT

| Aspect | Assessment | Risk Level |
|--------|------------|-----------|
| **Architecture Compatibility** | ✅ Fully compatible - parallel infrastructure exists | **LOW** |
| **Data Independence** | ✅ AI_VISIBILITY has own data source | **LOW** |
| **Job Types Defined** | ✅ Already in jobTypes.js | **LOW** |
| **Dispatch Logic** | ✅ Both dispatchers exist | **LOW** |
| **Implementation Complexity** | ✅ Just add entries to maps + new method | **LOW** |
| **Test Coverage Needed** | ⚠️ New parallel path should be tested | **MEDIUM** |
| **Production Risk** | ✅ Isolated track - SEO pipeline unaffected | **LOW** |

---

## SUMMARY TABLE: INTEGRATION READINESS

```
┌─────────────────────────────────┬──────────┬─────────────────┬──────────┐
│ Component                       │ Exists   │ Location        │ Status   │
├─────────────────────────────────┼──────────┼─────────────────┼──────────┤
│ AI_VISIBILITY job type          │ ✅ Yes   │ jobTypes.js     │ Ready    │
│ AI_VISIBILITY_SCORING job type  │ ✅ Yes   │ jobTypes.js     │ Ready    │
│ dispatchAiVisibilityJob()       │ ✅ Yes   │ jobDispatcher   │ Ready    │
│ dispatchAiVisibilityScoringJob()│ ✅ Yes   │ jobDispatcher   │ Ready    │
│ createAndDispatchAiVisibility() │ ❌ NO    │ jobService      │ MISSING  │
│ AI_VISIBILITY in creation map   │ ❌ NO    │ chainingEngine  │ MISSING  │
│ AI_VISIBILITY in dispatch map   │ ❌ NO    │ chainingEngine  │ MISSING  │
│ PAGE_SCRAPING parallel next     │ ⚠️  CAP  │ pipelineConfig  │ Ready*   │
│ AIVisibilityProject model       │ ✅ Yes   │ ai_visibility   │ Ready    │
│ Parallel execution logic        │ ✅ Yes   │ chainingEngine  │ Ready    │
│ AI_VISIBILITY -> SCORING chain  │ ✅ Yes   │ jobController   │ Manual   │
│ Independent data source         │ ✅ Yes   │ seo_ai_visibility| Ready   │
└─────────────────────────────────┴──────────┴─────────────────┴──────────┘
* Ready with modifications
```

---

## RECOMMENDATIONS

### Phase 1: Minimum Implementation (3 changes)
1. **pipelineConfig.js** - Modify PAGE_SCRAPING to include AI_VISIBILITY in next[]
2. **jobService.js** - Add createAndDispatchAiVisibilityJob() method
3. **chainingEngine.js** - Add AI_VISIBILITY to both JOB_CREATION_MAP and JOB_DISPATCH_MAP

**Impact**: AI_VISIBILITY will be triggered from PAGE_SCRAPING completion ✓

### Phase 2: Optional Enhancement (1 change)
4. **jobController.js** - Move manual AI_VISIBILITY_SCORING chaining to pipelineConfig

**Impact**: Unified declarative pipeline for all job chaining ✓

### Phase 3: Integration (1-2 changes)
5. **scrapingController.js** - Auto-create AIVisibilityProject on startAudit()
6. **Dashboard UI** - Link both tracks for unified progress display

**Impact**: Single startAudit() call triggers both SEO and AI tracks ✓

---

## CONCLUSION

✅ **Integration is FEASIBLE and LOW-RISK**

The codebase is **architecturally ready** for adding AI_VISIBILITY to the parallel pipeline. The infrastructure exists; only the declarative configuration and one missing method need to be added. All supporting components (dispatch, service, models) are already implemented.

Estimated implementation time: **30-45 minutes** (Phases 1-2)

---

*Report generated: March 4, 2026*  
*Status: Ready for implementation*
