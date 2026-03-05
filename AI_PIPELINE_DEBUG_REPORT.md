# AI Pipeline Chaining Debug Report

**Date:** March 4, 2026  
**Status:** 🔴 **CRITICAL - AI Pipeline Chaining NOT WORKING**

---

## Executive Summary

The AI pipeline (`AI_LINK_DISCOVERY → AI_VISIBILITY → AI_VISIBILITY_SCORING`) **is not chaining correctly**. When `AI_LINK_DISCOVERY` completes, the backend fails to trigger `AI_VISIBILITY` job creation.

**Root Cause:** Pipeline configuration is incomplete and missing from all three critical layers:
1. **Runtime Pipeline Config** (`pipelineConfig.js`) - No AI pipeline defined
2. **Job Creation Registry** (`JOB_CREATION_MAP`) - Missing AI_VISIBILITY creator
3. **Job Dispatch Registry** (`JOB_DISPATCH_MAP`) - Missing AI_VISIBILITY dispatcher

---

## Problem Diagnosis

### 1. Where AI_LINK_DISCOVERY Completion is Processed

**File:** [odito_backend/src/modules/jobs/controller/jobCompletionHandler.js](odito_backend/src/modules/jobs/controller/jobCompletionHandler.js#L1-L95)

```javascript
export const completeJobSafely = async (req, res) => {
  // ... job status updated to 'completed' ...
  
  // ✅ WORKS: Job is marked as completed
  const updatedJob = await jobService.updateJobStatus(jobId, 'completed', {
    result_data: mergedResultData,
    completed_at: new Date()
  });

  // ✅ WORKS: Response sent immediately
  res.json({ success: true, message: 'Job marked as completed' });

  // ⚠️  ASYNC: Chaining happens after response
  setImmediate(() => {
    handleJobCompletion(updatedJob, stats, requestId).catch(error => {
      console.error(`[CHAINING_ERROR] Job chaining failed`);
    });
  });
};

async function handleJobCompletion(updatedJob, stats, requestId) {
  await projectStatusService.updateForJobType(updatedJob, stats, requestId);
  // 🎯 THIS CALLS: chainingEngine.process(updatedJob, stats, requestId)
  await chainingEngine.process(updatedJob, stats, requestId);
}
```

**Key Finding:** Job completion handler correctly delegates to `chainingEngine.process()`. ✅ **This part works.**

---

### 2. The Chaining Logic - Where It Fails

**File:** [odito_backend/src/modules/jobs/chainingEngine.js](odito_backend/src/modules/jobs/chainingEngine.js#L31-L110)

```javascript
async process(updatedJob, stats, requestId) {
  const jobType = updatedJob.jobType; // = 'AI_LINK_DISCOVERY'
  const config = PIPELINE_CONFIG[jobType]; // ❌ THIS IS UNDEFINED!

  if (!config || !config.next || config.next.length === 0) {
    // 🔴 PROBLEM: This log appears in console
    console.log(`[CHAINING:${requestId}] No direct chaining for jobType=${jobType}`);
    // ❌ RETURNS: No chaining happens
    return;
  }

  // This code NEVER runs for AI_LINK_DISCOVERY
  for (let i = 0; i < config.next.length; i++) {
    const nextType = config.next[i];
    await this._createAndDispatchJob(nextType, ...);
  }
}
```

**Key Finding:** When `AI_LINK_DISCOVERY` completes:
- `PIPELINE_CONFIG['AI_LINK_DISCOVERY']` returns `undefined`
- Chaining engine silently exits
- **No AI_VISIBILITY job is ever created** ❌

---

### 3. Missing Runtime Pipeline Configuration

**File:** [odito_backend/src/modules/jobs/pipelineConfig.js](odito_backend/src/modules/jobs/pipelineConfig.js)

**Current Content:**
```javascript
export const PIPELINE_CONFIG = {
  // SEO Pipeline is here ✅
  [JOB_TYPES.LINK_DISCOVERY]: { next: [JOB_TYPES.TECHNICAL_DOMAIN], ... },
  [JOB_TYPES.TECHNICAL_DOMAIN]: { next: [JOB_TYPES.PAGE_SCRAPING], ... },
  [JOB_TYPES.PAGE_SCRAPING]: { next: [JOB_TYPES.CRAWL_GRAPH], ... },
  // ... more SEO pipeline stages ...

  // ❌ AI PIPELINE IS COMPLETELY MISSING
  // No AI_LINK_DISCOVERY entry
  // No AI_VISIBILITY entry
  // No AI_VISIBILITY_SCORING entry
};
```

**Evidence:**
```
Lines 1-120: Only SEO pipeline (LINK_DISCOVERY through SEO_SCORING)
Lines 121+: Config ends - AI pipeline never defined
```

---

### 4. Missing Job Creation Function

**File:** [odito_backend/src/modules/jobs/service/jobService.js](odito_backend/src/modules/jobs/service/jobService.js)

**What EXISTS:**
```javascript
✅ createAndDispatchTechnicalDomainJob(linkDiscoveryJob)     [line 620]
✅ createAndDispatchPageScrapingJob(linkDiscoveryJob)        [line 654]
✅ createAndDispatchPageAnalysisJob(pageScrapingJob)         [line 539]
✅ createAndDispatchSeoScoringJob(pageAnalysisJob)           [line 566]
✅ createAndDispatchAiVisibilityScoringJob(aiVisibilityJob)  [line 593]
```

**What's MISSING for AI_VISIBILITY → AI_VISIBILITY_SCORING chaining:**
```javascript
❌ createAndDispatchAiVisibilityJob(aiLinkDiscoveryJob)  [DOES NOT EXIST]
```

**Impact:** Even if pipeline configured, creation would fail with:
```
Error: Unsupported next job type: AI_VISIBILITY
Available job types: [TECHNICAL_DOMAIN, PAGE_SCRAPING, PAGE_ANALYSIS, ...]
```

---

### 5. Missing Job Creation Registry Entry

**File:** [odito_backend/src/modules/jobs/chainingEngine.js](odito_backend/src/modules/jobs/chainingEngine.js#L24-L38)

**Current JOB_CREATION_MAP:**
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
  // ❌ MISSING: AI_VISIBILITY entry
};
```

---

### 6. Missing Job Dispatch Registry Entry

**File:** [odito_backend/src/modules/jobs/chainingEngine.js](odito_backend/src/modules/jobs/chainingEngine.js#L40-L49)

**Current JOB_DISPATCH_MAP:**
```javascript
const JOB_DISPATCH_MAP = {
  [JOB_TYPES.TECHNICAL_DOMAIN]: (job) => jobDispatcher.dispatchTechnicalDomainJob(job),
  [JOB_TYPES.PAGE_SCRAPING]: (job) => jobDispatcher.dispatchPageScrapingJob(job),
  [JOB_TYPES.PAGE_ANALYSIS]: (job) => jobDispatcher.dispatchPageAnalysisJob(job),
  [JOB_TYPES.PERFORMANCE_MOBILE]: (job) => jobDispatcher.dispatchPerformanceMobileJob(job),
  [JOB_TYPES.PERFORMANCE_DESKTOP]: (job) => jobDispatcher.dispatchPerformanceDesktopJob(job),
  [JOB_TYPES.HEADLESS_ACCESSIBILITY]: (job) => jobDispatcher.dispatchHeadlessAccessibilityJob(job),
  [JOB_TYPES.SEO_SCORING]: (job) => jobDispatcher.dispatchSeoScoringJob(job),
  [JOB_TYPES.CRAWL_GRAPH]: (job) => jobDispatcher.dispatchCrawlGraphJob(job),
  // ❌ MISSING: AI_VISIBILITY entry
  // ✅ PRESENT: dispatchAiVisibilityJob exists in jobDispatcher [line 476]
  // ✅ PRESENT: dispatchAiVisibilityScoringJob exists in jobDispatcher [line 525]
};
```

**BUT:** Dispatch functions DO exist in [jobDispatcher.js](odito_backend/src/modules/jobs/service/jobDispatcher.js#L472-L520)
- ✅ `dispatchAiVisibilityJob(job)` [line 476]
- ✅ `dispatchAiVisibilityScoringJob(job)` [line 525]
- ✅ `dispatchAiLinkDiscoveryJob(job)` [line 433]

---

## Problem Chain Summary

```
┌─────────────────────────────────────────┐
│ AI_LINK_DISCOVERY completes             │
└──────────────────┬──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ jobCompletionHandler │ ✅ Works
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ chainingEngine.       │
        │ process()             │
        └──────────┬───────────┘
                   │
                   ▼
     config = PIPELINE_CONFIG[
       'AI_LINK_DISCOVERY'
     ]
                   │
                   ▼
     ❌ undefined (not in config)
                   │
                   ▼
        ┌──────────────────────┐
        │ "No direct chaining" │
        │ log + return         │
        └──────────────────────┘

❌ AI_VISIBILITY job NEVER created
```

---

## Minimal Code Changes Required

### Change 1: Add AI Pipeline to Runtime Configuration

**File:** [odito_backend/src/modules/jobs/pipelineConfig.js](odito_backend/src/modules/jobs/pipelineConfig.js)

**Add this to PIPELINE_CONFIG export (after PAGE_ANALYSIS section):**

```javascript
  // ──────────────────────────────────────────────────────────────────────────
  // AI_LINK_DISCOVERY → AI_VISIBILITY
  // ──────────────────────────────────────────────────────────────────────────
  [JOB_TYPES.AI_LINK_DISCOVERY]: {
    next: [JOB_TYPES.AI_VISIBILITY],
    parallel: false,
    atomicGuard: true
  },

  // ──────────────────────────────────────────────────────────────────────────
  // AI_VISIBILITY → AI_VISIBILITY_SCORING
  // ──────────────────────────────────────────────────────────────────────────
  [JOB_TYPES.AI_VISIBILITY]: {
    next: [JOB_TYPES.AI_VISIBILITY_SCORING],
    parallel: false,
    atomicGuard: true,
    resolveSource: true
  },

  // ──────────────────────────────────────────────────────────────────────────
  // AI_VISIBILITY_SCORING → (terminal)
  // ──────────────────────────────────────────────────────────────────────────
  [JOB_TYPES.AI_VISIBILITY_SCORING]: {
    next: []
  }
```

---

### Change 2: Create AI_VISIBILITY Job Creation Function

**File:** [odito_backend/src/modules/jobs/service/jobService.js](odito_backend/src/modules/jobs/service/jobService.js)

**Add this method after `createAndDispatchAiVisibilityScoringJob()` (around line 615):**

```javascript
  /**
   * Atomically create and dispatch AI_VISIBILITY job
   * CRITICAL: This operation must be atomic to prevent duplicates
   */
  async createAndDispatchAiVisibilityJob(aiLinkDiscoveryJob) {
    try {
      // Create AI_VISIBILITY job with source job reference
      const aiVisibilityJob = await this.createJob({
        user_id: aiLinkDiscoveryJob.user_id,
        seo_project_id: aiLinkDiscoveryJob.project_id,
        jobType: JOB_TYPES.AI_VISIBILITY,
        input_data: {
          source_job_id: aiLinkDiscoveryJob._id.toString(),
          aiProjectId: aiLinkDiscoveryJob.input_data?.aiProjectId || null
        },
        priority: JOB_TYPE_CONFIG[JOB_TYPES.AI_VISIBILITY].priority
      });

      console.log(`[QUEUE] AI_VISIBILITY job queued | jobId=${aiVisibilityJob._id} | sourceJobId=${aiLinkDiscoveryJob._id}`);

      return aiVisibilityJob;

    } catch (error) {
      console.error(`[ERROR] AI_VISIBILITY creation failed | sourceJobId=${aiLinkDiscoveryJob._id} | reason="${error.message}"`);
      throw error;
    }
  }
```

---

### Change 3: Register AI_VISIBILITY in JOB_CREATION_MAP

**File:** [odito_backend/src/modules/jobs/chainingEngine.js](odito_backend/src/modules/jobs/chainingEngine.js#L24-L38)

**Add this entry to JOB_CREATION_MAP (after SEO_SCORING entry):**

```javascript
const JOB_CREATION_MAP = {
  // ... existing entries ...
  [JOB_TYPES.SEO_SCORING]: (src) => jobService.createAndDispatchSeoScoringJob(src),
  [JOB_TYPES.CRAWL_GRAPH]: (src) => jobService.createAndDispatchCrawlGraphJob(src),
  
  // 🆕 AI PIPELINE CREATORS
  [JOB_TYPES.AI_VISIBILITY]: (src) => jobService.createAndDispatchAiVisibilityJob(src),
  [JOB_TYPES.AI_VISIBILITY_SCORING]: (src) => jobService.createAndDispatchAiVisibilityScoringJob(src),
};
```

---

### Change 4: Register AI_VISIBILITY in JOB_DISPATCH_MAP

**File:** [odito_backend/src/modules/jobs/chainingEngine.js](odito_backend/src/modules/jobs/chainingEngine.js#L40-L49)

**Add this entry to JOB_DISPATCH_MAP (after SEO_SCORING entry):**

```javascript
const JOB_DISPATCH_MAP = {
  // ... existing entries ...
  [JOB_TYPES.SEO_SCORING]: (job) => jobDispatcher.dispatchSeoScoringJob(job),
  [JOB_TYPES.CRAWL_GRAPH]: (job) => jobDispatcher.dispatchCrawlGraphJob(job),
  
  // 🆕 AI PIPELINE DISPATCHERS
  [JOB_TYPES.AI_VISIBILITY]: (job) => jobDispatcher.dispatchAiVisibilityJob(job),
  [JOB_TYPES.AI_VISIBILITY_SCORING]: (job) => jobDispatcher.dispatchAiVisibilityScoringJob(job),
};
```

---

## Expected Behavior After Fix

### Flow Diagram

```
1. AI_LINK_DISCOVERY completes
   │
   ▼
2. jobCompletionHandler.completeJobSafely() marks job as completed
   │
   ▼
3. chainingEngine.process(updatedJob) is called
   │
   ▼
4. config = PIPELINE_CONFIG['AI_LINK_DISCOVERY']
   Returns: { next: ['AI_VISIBILITY'], parallel: false, atomicGuard: true }
   │
   ▼
5. config.next.length > 0 ✅ (enters chaining loop)
   │
   ▼
6. For each job in config.next (AI_VISIBILITY):
   │
   ├─ _createNextJobAtomically (AI_VISIBILITY)
   │  │
   │  ├─ Check: Does AI_VISIBILITY already exist for this source? ✅ No
   │  ├─ Call: _createJobDirect
   │  │  │
   │  │  ├─ JOB_CREATION_MAP['AI_VISIBILITY'] found ✅
   │  │  ├─ Call: jobService.createAndDispatchAiVisibilityJob(sourceJob)
   │  │  │  │
   │  │  │  └─ Create AI_VISIBILITY job in DB ✅
   │  │  │
   │  │  └─ Return: newly created job
   │  │
   │  └─ Return: newly created job
   │
   ├─ atomicallyDispatchJob(jobId)
   │  └─ Mark job status as 'dispatched'
   │
   ├─ Emit stageChanged event (progress event for frontend)
   │  └─ { from: 'AI_LINK_DISCOVERY', to: 'AI_VISIBILITY', newJobId: '...' }
   │
   └─ _dispatchToWorker(AI_VISIBILITY, job)
      │
      ├─ JOB_DISPATCH_MAP['AI_VISIBILITY'] found ✅
      ├─ Call: jobDispatcher.dispatchAiVisibilityJob(job)
      │  │
      │  └─ HTTP POST to Python: /api/jobs/ai-visibility
      │     With payload: { jobId, projectId, userId, aiProjectId }
      │
      └─ Python worker receives job and starts processing ✅

7. When AI_VISIBILITY worker completes:
   │
   ├─ POST /jobs/{jobId}/complete (callback from Python)
   ├─ jobCompletionHandler repeats process()
   │
   └─ config = PIPELINE_CONFIG['AI_VISIBILITY']
      Returns: { next: ['AI_VISIBILITY_SCORING'], parallel: false, atomicGuard: true, resolveSource: true }
      │
      └─ AI_VISIBILITY_SCORING job created and dispatched ✅
```

---

## Verification Checklist

After applying the fixes:

- [ ] AI_LINK_DISCOVERY entry added to PIPELINE_CONFIG
- [ ] AI_VISIBILITY entry added to PIPELINE_CONFIG
- [ ] AI_VISIBILITY_SCORING entry added to PIPELINE_CONFIG
- [ ] createAndDispatchAiVisibilityJob() added to jobService.js
- [ ] AI_VISIBILITY registered in JOB_CREATION_MAP
- [ ] AI_VISIBILITY_SCORING registered in JOB_CREATION_MAP
- [ ] AI_VISIBILITY registered in JOB_DISPATCH_MAP
- [ ] AI_VISIBILITY_SCORING registered in JOB_DISPATCH_MAP
- [ ] Test: Manually trigger AI_LINK_DISCOVERY job via `/api/ai-visibility/start-audit`
- [ ] Verify in logs: "[CHAINING] config.next = ["AI_VISIBILITY"]"
- [ ] Verify in logs: "[DISPATCH] AI_VISIBILITY job dispatched"
- [ ] Verify in Python logs: Received AI_VISIBILITY job on `/api/jobs/ai-visibility`
- [ ] Verify in DB: AI_VISIBILITY job created with status 'pending'/'processing'

---

## Impact Analysis

### SEO Pipeline
✅ **No Impact** - Changes only add AI pipeline to PIPELINE_CONFIG. SEO pipeline unchanged.

### AI Pipeline
🚀 **Enables Full Chaining**:
- AI_LINK_DISCOVERY → AI_VISIBILITY ✅
- AI_VISIBILITY → AI_VISIBILITY_SCORING ✅
- Terminal stage: AI_VISIBILITY_SCORING (no further chaining)

### Job Service
✅ One new function added (createAndDispatchAiVisibilityJob)

### Chaining Engine
✅ Two new registrations in existing maps (non-breaking)

---

## Code Files Involved

| File | Lines | Change Type |
|------|-------|------------|
| [pipelineConfig.js](odito_backend/src/modules/jobs/pipelineConfig.js) | ~30-60 new lines at end | Add 3 AI pipeline stage configs |
| [jobService.js](odito_backend/src/modules/jobs/service/jobService.js) | ~615-630 new lines | Add createAndDispatchAiVisibilityJob() |
| [chainingEngine.js](odito_backend/src/modules/jobs/chainingEngine.js) | ~38 and ~48 | Add 2 entries to maps |
| jobDispatcher.js | No change needed | ✅ Dispatch functions already exist |
| jobTypes.js | No change needed | ✅ Job type constants already exist |

---

## Root Cause Summary

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| No chaining triggered | AI_LINK_DISCOVERY missing from PIPELINE_CONFIG | Add config entry |
| Creation fails | No creation function for AI_VISIBILITY | Implement function |
| Dispatch fails | AI_VISIBILITY not in JOB_DISPATCH_MAP | Register dispatcher |
| Factory pattern broken | AI_VISIBILITY not in JOB_CREATION_MAP | Register creator |

---

**Report Generated:** March 4, 2026  
**Pipeline Status:** 🔴 BROKEN (by design - missing configuration)  
**Fixability:** ✅ EASY - Four simple, localized changes required  
**Risk Level:** 🟢 LOW - Changes isolated to AI pipeline, no SEO pipeline impact
