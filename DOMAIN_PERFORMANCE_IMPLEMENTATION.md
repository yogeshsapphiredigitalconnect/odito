# DOMAIN_PERFORMANCE Implementation - Verification & Testing

## Implementation Summary

The DOMAIN_PERFORMANCE worker has been successfully implemented across the entire SEO audit system architecture. It runs in parallel with LINK_DISCOVERY when analysis begins and collects domain-level PageSpeed metrics independently.

## Modified Files

### Backend (Node.js)
1. **src/modules/jobs/model/Job.js** - Added DOMAIN_PERFORMANCE to jobType enum
2. **src/modules/jobs/constants/jobTypes.js** - Added DOMAIN_PERFORMANCE constant and configuration
3. **src/modules/app_user/controller/scrapingController.js** - Modified startScraping() to create both jobs
4. **src/modules/jobs/service/jobDispatcher.js** - Added queueDomainPerformanceJob() and dispatchDomainPerformanceJob()
5. **src/modules/jobs/service/jobService.js** - Added createAndDispatchDomainPerformanceJob() method

### Python Workers
6. **python_workers/api/domain_performance.py** - New endpoint for domain performance analysis
7. **python_workers/main.py** - Registered new domain_performance router

### Documentation
8. **database_schemas/seo_domain_performance.md** - Database schema documentation

## New Dispatcher Function

```javascript
async queueDomainPerformanceJob(job) {
  // DOMAIN_PERFORMANCE jobs are dispatched immediately (no queue)
  this.dispatchDomainPerformanceJob(job).catch(error => {
    console.error(`[ERROR] DOMAIN_PERFORMANCE dispatch failed | jobId=${job._id} | reason="${error.message}"`);
  });
}

async dispatchDomainPerformanceJob(job) {
  try {
    await jobService.updateJobStatus(job._id, 'PROCESSING', {
      started_at: new Date(),
      last_attempted_at: new Date()
    });

    const response = await axios.post(`${this.pythonBaseURL}/api/jobs/domain-performance`, {
      jobId: job._id.toString(),
      projectId: job.project_id.toString(),
      userId: job.user_id.toString(),
      main_url: job.input_data.main_url
    }, {
      timeout: 240000,
      headers: { 'Content-Type': 'application/json' }
    });

    return { success: true, jobId: job._id };
  } catch (error) {
    await jobService.updateJobStatus(job._id, 'FAILED', {
      completed_at: new Date(),
      error_message: `Dispatch failed: ${error.message}`
    });
    return { success: false, error: error.message };
  }
}
```

## Python Worker Implementation

### Endpoint: POST /api/jobs/domain-performance

**Payload:**
```json
{
  "jobId": "string",
  "projectId": "string", 
  "userId": "string",
  "main_url": "string"
}
```

**Logic:**
1. Extract domain from main_url
2. Call PageSpeed API for mobile strategy
3. Call PageSpeed API for desktop strategy
4. Extract metrics: performance_score, fcp, lcp, cls, tbt, speed_index, tti
5. Store results in seo_domain_performance collection
6. Update job status to COMPLETED

**Database Storage:**
```javascript
{
  project_id: ObjectId,
  domain: "example.com",
  mobile: { performance_score: 85, fcp: {...}, lcp: {...}, cls: {...}, tbt: {...} },
  desktop: { performance_score: 92, fcp: {...}, lcp: {...}, cls: {...}, tbt: {...} },
  tested_at: Date,
  job_id: "string"
}
```

## Database Schema

**Collection:** `seo_domain_performance`

**Indexes:**
- `project_id` (unique)
- `domain` 
- `project_id + tested_at` (compound)

**Constraints:** One document per project (upsert operation)

## Final Pipeline Architecture

```
START
├── LINK_DISCOVERY (priority: 1) ──→ TECHNICAL_DOMAIN ──→ PAGE_SCRAPING ──→ CRAWL_GRAPH ──→ PERFORMANCE_MOBILE
│                                                                                      │
│                                                                                      └─→ PERFORMANCE_DESKTOP ──→ PAGE_ANALYSIS ──→ SEO_SCORING
│                                                                                      
│                                                                                      └─→ HEADLESS_ACCESSIBILITY ──┘
│
└── DOMAIN_PERFORMANCE (priority: 2) ──→ [INDEPENDENT - NO CHAINING]
                                       │
                                       └─→ Stores domain metrics in seo_domain_performance
```

## Parallel Execution Verification

### ✅ Verified Requirements

1. **Parallel Job Creation:** `startScraping()` creates both LINK_DISCOVERY and DOMAIN_PERFORMANCE jobs
2. **Independent Dispatch:** LINK_DISCOVERY uses queue, DOMAIN_PERFORMANCE dispatches immediately
3. **No Chaining Interference:** DOMAIN_PERFORMANCE is not in PIPELINE_CONFIG or chaining maps
4. **Pipeline Monitoring:** Added to PIPELINE_JOB_TYPES for dashboard tracking
5. **Database Isolation:** Uses separate collection with unique project constraint

### ✅ Safety Checks

- **Chaining Engine:** DOMAIN_PERFORMANCE has no entry in JOB_CREATION_MAP or JOB_DISPATCH_MAP
- **Pipeline Config:** No configuration entry means no next jobs are triggered
- **Queue Safety:** DOMAIN_PERFORMANCE bypasses sequential queue to prevent blocking
- **Error Isolation:** Failure in DOMAIN_PERFORMANCE doesn't affect LINK_DISCOVERY pipeline

### ✅ Testing Scenarios

1. **Normal Flow:**
   - Both jobs created successfully
   - Both dispatch to Python workers
   - LINK_DISCOVERY triggers page pipeline
   - DOMAIN_PERFORMANCE stores domain metrics
   - Dashboard shows progress for both

2. **Error Scenarios:**
   - DOMAIN_PERFORMANCE fails → LINK_DISCOVERY continues unaffected
   - LINK_DISCOVERY fails → DOMAIN_PERFORMANCE continues unaffected
   - Both fail → graceful error handling for each

3. **Concurrency:**
   - Jobs run in true parallel (no blocking)
   - No race conditions on database writes
   - Proper job status tracking for both

## Environment Variables Required

```bash
PAGESPEED_API_KEY=your_google_pagespeed_api_key
```

## API Response Format

**Start Scraping Response:**
```json
{
  "success": true,
  "message": "Your crawling has started",
  "data": {
    "jobs": [
      {
        "job_id": "link_discovery_job_id",
        "job_type": "LINK_DISCOVERY",
        "status": "pending",
        "priority": 1
      },
      {
        "job_id": "domain_performance_job_id", 
        "job_type": "DOMAIN_PERFORMANCE",
        "status": "pending",
        "priority": 2
      }
    ],
    "project_id": "project_id",
    "main_url": "https://example.com"
  }
}
```

## Performance Metrics Collected

### Core Web Vitals
- **FCP** (First Contentful Paint)
- **LCP** (Largest Contentful Paint) 
- **CLS** (Cumulative Layout Shift)
- **TBT** (Total Blocking Time)

### Additional Metrics
- **Performance Score** (0-100)
- **Speed Index**
- **TTI** (Time to Interactive)

All metrics collected for both mobile and desktop strategies.

## Implementation Complete ✅

The DOMAIN_PERFORMANCE worker is fully implemented and ready for production use. It provides domain-level performance insights while maintaining complete independence from the existing page-level pipeline.
