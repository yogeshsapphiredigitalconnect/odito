# Backend-Driven Progress System

## Overview
The frontend progress system has been completely refactored to display only real backend pipeline state. All demo mode and fake progress simulation has been removed.

## Updated ProcessingScreen Logic

### 1. Complete Backend Pipeline Stages
The frontend now displays the full 11-stage backend pipeline:

```javascript
const steps = [
  { label: "Discover Links", icon: "🔍", key: 'LINK_DISCOVERY' },
  { label: "Technical Domain", icon: "⚙️", key: 'TECHNICAL_DOMAIN' },
  { label: "Crawl Pages", icon: "🕷", key: 'PAGE_SCRAPING' },
  { label: "Page Analysis", icon: "📊", key: 'PAGE_ANALYSIS' },
  { label: "SEO Scoring", icon: "🎯", key: 'SEO_SCORING' },
  { label: "Mobile Performance", icon: "📱", key: 'PERFORMANCE_MOBILE' },
  { label: "Desktop Performance", icon: "💻", key: 'PERFORMANCE_DESKTOP' },
  { label: "Accessibility", icon: "♿", key: 'HEADLESS_ACCESSIBILITY' },
  { label: "Crawl Graph", icon: "🕸️", key: 'CRAWL_GRAPH' },
  { label: "AI Visibility", icon: "🧠", key: 'AI_VISIBILITY' },
  { label: "AI Visibility Scoring", icon: "✨", key: 'AI_VISIBILITY_SCORING' }
];
```

### 2. Updated Job Step Mapping
Complete mapping from backend job types to UI step indices:

```javascript
const jobStepMap = {
  'LINK_DISCOVERY': 0,
  'TECHNICAL_DOMAIN': 1,
  'PAGE_SCRAPING': 2,
  'PAGE_ANALYSIS': 3,
  'SEO_SCORING': 4,
  'PERFORMANCE_MOBILE': 5,
  'PERFORMANCE_DESKTOP': 6,
  'HEADLESS_ACCESSIBILITY': 7,
  'CRAWL_GRAPH': 8,
  'AI_VISIBILITY': 9,
  'AI_VISIBILITY_SCORING': 10
};
```

### 3. Removed Demo Mode
All fake setTimeout-based progress simulation has been removed. The component now requires a valid `projectId` and shows an error if none is provided.

### 4. Backend-Driven Progress Calculation
Progress is calculated using actual backend job completion:

```javascript
const calculateProgress = () => {
  if (!jobStatus) return 0;
  
  let totalJobs = 0;
  let completedJobs = 0;
  
  Object.values(jobStatus).forEach(status => {
    totalJobs += status.pending + status.processing + status.completed + status.failed;
    completedJobs += status.completed + status.failed; // Count failed as completed for progress
  });
  
  return totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
};
```

### 5. Real-Time Job Status Detection
The system detects four job states from the backend:

```javascript
const getStepStatus = (stepIndex) => {
  if (!jobStatus) return 'pending';
  
  const step = steps[stepIndex];
  const jobData = jobStatus[step.key.toLowerCase()];
  
  if (!jobData) return 'pending';
  
  if (jobData.failed > 0) return 'failed';
  if (jobData.completed > 0) return 'completed';
  if (jobData.processing > 0) return 'processing';
  if (jobData.pending > 0) return 'pending';
  
  return 'pending';
};
```

## Updated StepList Component

### Enhanced State Handling
StepList now handles four states instead of three:
- **completed**: ✓ with green styling
- **processing**: ⟳ with cyan animation
- **failed**: ✗ with red styling
- **pending**: Original icon with gray styling

### Dynamic Status Rendering
```javascript
const getStepIcon = (stepIndex) => {
  const status = getStepStatus ? getStepStatus(stepIndex) : 'pending';
  const step = steps[stepIndex];
  
  if (status === 'completed') return "✓";
  if (status === 'failed') return "✗";
  if (status === 'processing') return "⟳";
  return step.icon;
};
```

## CSS Updates

### Failed State Styling
Added red styling for failed job states:

```css
.process-icon.failed { background: rgba(255,69,96,0.15); }
```

## Data Flow Diagram

```
Frontend → Backend State → UI

Current Flow:
ProcessingScreen → apiService.getAuditStatus() → /api/seo/scraping-status/:projectId
      ↓
  Poll every 2s
      ↓  
  Parse job status (pending/processing/completed/failed)
      ↓
  Calculate progress: completedJobs / totalJobs
      ↓
  Update step states via getStepStatus()
      ↓
  StepList renders with real-time status
      ↓
  Progress bar shows actual completion percentage

Backend Job States:
- pending: Job queued but not started
- processing: Job currently running
- completed: Job finished successfully
- failed: Job failed with error

Error Handling:
- Individual job failures show "Failed" badge and ✗ icon
- Overall audit failure triggers error state
- User can retry via reload button
```

## API Response Structure

The backend `/api/seo/scraping-status/:projectId` returns:

```javascript
{
  success: true,
  data: {
    link_discovery: {
      pending: 0,
      processing: 1,
      completed: 0,
      failed: 0,
      latest: { job_id, status, created_at, completed_at, failed_at }
    },
    technical_domain: { /* same structure */ },
    page_scraping: { /* same structure */ },
    // ... all 11 job types
  }
}
```

## Completion Detection

The system detects completion when:

```javascript
const allJobsCompleted = Object.values(response.data).every(
  status => status.completed > 0 || status.failed > 0 || status.pending === 0
);
```

## Error Handling

1. **Missing projectId**: Shows error "Project ID is required to track audit progress"
2. **API failures**: Shows "Failed to check job status"
3. **Job failures**: Shows "One or more jobs failed during the audit"
4. **Individual step failures**: Shows red ✗ icon and "Failed" badge

## Key Improvements

1. **No fake progress**: All progress reflects real backend state
2. **Complete pipeline**: All 11 backend job stages are represented
3. **Failure visibility**: Failed jobs are clearly indicated
4. **Accurate progress**: Percentage based on actual job completion
5. **Real-time updates**: 2-second polling for live status updates
6. **Better UX**: Clear visual indicators for each state

## Backend Event Integration (Future)

While the current system uses polling, the architecture is ready for WebSocket/SSE integration:

- `audit:started` → Set initial active state
- `audit:progress` → Update progress percentage
- `audit:stageChanged` → Update active step
- `audit:completed` → Mark as completed
- `audit:error` → Show error state

The current polling logic can be easily replaced with event listeners without changing the UI components.
