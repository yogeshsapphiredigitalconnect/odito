# AI Visibility Validation Strategy

## MongoDB Test Queries

### 1. Verify Collection Structure
```javascript
// Check collection exists and has correct structure
db.seo_ai_visibility_project.findOne()
db.seo_ai_visibility_project.getIndexes()
```

### 2. Test Dual Mode Creation
```javascript
// Test linked project creation
db.seo_ai_visibility_project.insertOne({
  projectId: ObjectId("64a7b8c9d1e2f3g4h5i6j7k9"),
  isStandalone: false,
  aiStatus: "pending",
  config: { analysisDepth: "standard" }
})

// Test standalone project creation
db.seo_ai_visibility_project.insertOne({
  projectId: null,
  isStandalone: true,
  aiStatus: "pending",
  config: { url: "https://example.com" }
})

// Verify unique index works for linked projects
db.seo_ai_visibility_project.createIndex(
  { projectId: 1 }, 
  { unique: true, partialFilterExpression: { projectId: { $exists: true, $ne: null } } }
)
```

### 3. Test Status Transitions
```javascript
// Simulate status progression
db.seo_ai_visibility_project.updateOne(
  { _id: ObjectId("...") },
  { 
    $set: { aiStatus: "running", startedAt: new Date() },
    $inc: { version: 1 }
  }
)

// Test summary updates
db.seo_ai_visibility_project.updateOne(
  { _id: ObjectId("...") },
  { 
    $set: { 
      "summary.overallScore": 85,
      "summary.grade": "B+",
      lastActivityAt: new Date()
    },
    $inc: { version: 1 }
  }
)
```

## Expected Logs During Lifecycle

### 1. Project Creation
```
[AI_PROJECT] Created for existing project | projectId=64a7b8c9d1e2f3g4h5i6j7k9 | aiProjectId=64a7b8c9d1e2f3g4h5i6j7k8
[AI_VISIBILITY] Started | type=existing | aiProjectId=64a7b8c9d1e2f3g4h5i6j7k8 | jobId=64a7b8c9d1e2f3g4h5i6j7ka0
[AI_VISIBILITY] Job dispatched | jobId=64a7b8c9d1e2f3g4h5i6j7ka0 | aiProjectId=64a7b8c9d1e2f3g4h5i6j7k8
```

### 2. Worker Processing
```
[WORKER] Status updated | aiProjectId=64a7b8c9d1e2f3g4h5i6j7k8 | status=running
[WORKER] Status updated | aiProjectId=64a7b8c9d1e2f3g4h5i6j7k8 | status=analyzing
[WORKER] Summary updated | aiProjectId=64a7b8c9d1e2f3g4h5i6j7k8 | score=85
[WORKER] Completed | aiProjectId=64a7b8c9d1e2f3g4h5i6j7k8 | score=85
```

### 3. Error Scenarios
```
[AI_PROJECT] Failed to create for existing project | projectId=invalid_id: CastError
[WORKER] Status update failed | aiProjectId=invalid_id: AI project not found
[WORKER] Marked as failed | aiProjectId=64a7b8c9d1e2f3g4h5i6j7k8 | error=Connection timeout
```

## Failure Scenario Simulation

### 1. Duplicate Project Creation
```javascript
// Try to create duplicate linked project
db.seo_ai_visibility_project.insertOne({
  projectId: ObjectId("64a7b8c9d1e2f3g4h5i6j7k9"), // Same as existing
  isStandalone: false,
  aiStatus: "pending"
})
// Expected: DuplicateKeyError
```

### 2. Invalid Status Transition
```javascript
// Try to update completed project
db.seo_ai_visibility_project.updateOne(
  { aiStatus: "completed" },
  { $set: { aiStatus: "running" } }
)
// Expected: No operation (should be prevented by worker logic)
```

### 3. Concurrent Updates
```javascript
// Simulate race condition
session1.startTransaction()
session2.startTransaction()

// Both try to update same project
session1.updateOne({ _id: "..." }, { $set: { aiStatus: "running" }, $inc: { version: 1 } })
session2.updateOne({ _id: "..." }, { $set: { aiStatus: "analyzing" }, $inc: { version: 1 } })

session1.commitTransaction()
session2.commitTransaction()
// Expected: Last update wins, version increments correctly
```

## Race Condition Prevention Logic

### 1. Optimistic Locking
```javascript
// Always include version in updates
const updateResult = await AIVisibilityProject.findByIdAndUpdate(
  aiProjectId,
  { 
    $set: updateData,
    $inc: { version: 1 }
  },
  { new: true }
)

// Check if version changed unexpectedly
if (updateResult.version !== expectedVersion + 1) {
  throw new Error('Concurrent modification detected')
}
```

### 2. Atomic Operations
```javascript
// Use $set and $inc together for atomic updates
db.seo_ai_visibility_project.updateOne(
  { _id: aiProjectId },
  { 
    $set: { 
      aiStatus: "completed",
      completedAt: new Date(),
      "summary.overallScore": 85
    },
    $inc: { version: 1 }
  }
)
```

### 3. Worker Verification
```python
def update_with_verification(self, ai_project_id, update_data):
    # Verify project exists and is in expected state
    project = self.collection.find_one({'_id': ai_project_id})
    if not project or project['aiStatus'] in ['completed', 'failed']:
        return False
    
    # Perform atomic update
    result = self.collection.update_one(
        {'_id': ai_project_id},
        {'$set': update_data}
    )
    
    return result.matched_count > 0
```

## Performance Validation

### 1. Index Usage
```javascript
// Verify indexes are being used
db.seo_ai_visibility_project.find({ aiStatus: "pending" }).explain("executionStats")
db.seo_ai_visibility_project.find({ projectId: ObjectId("...") }).explain("executionStats")
```

### 2. Query Performance
```javascript
// Test active projects query (should use compound index)
db.seo_ai_visibility_project.find({
  aiStatus: { $in: ['pending', 'running', 'analyzing', 'scoring'] }
}).sort({ lastActivityAt: -1 }).explain("executionStats")
```

## Data Integrity Checks

### 1. Consistency Validation
```javascript
// Check for orphaned jobs
db.seo_ai_visibility_project.find({
  aiJobId: { $exists: true },
  $where: "this.aiJobId.toString() !== 'null'"
})

// Check for stuck projects
db.seo_ai_visibility_project.find({
  aiStatus: { $in: ['running', 'analyzing', 'scoring'] },
  lastActivityAt: { $lt: new Date(Date.now() - 24*60*60*1000) } // Older than 24h
})
```

### 2. Summary Validation
```javascript
// Ensure summary fields are consistent
db.seo_ai_visibility_project.find({
  $expr: {
    $gt: [
      { $add: [
        "$summary.highSeverityIssues",
        "$summary.mediumSeverityIssues", 
        "$summary.lowSeverityIssues"
      ]},
      "$summary.totalIssues"
    ]
  }
})
```

## Monitoring Alerts

### 1. Failure Rate Monitoring
```javascript
// Monitor failure rate over time
db.seo_ai_visibility_project.aggregate([
  {
    $match: {
      createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
    }
  },
  {
    $group: {
      _id: "$aiStatus",
      count: { $sum: 1 }
    }
  }
])
```

### 2. Performance Metrics
```javascript
// Average processing time
db.seo_ai_visibility_project.aggregate([
  {
    $match: {
      aiStatus: "completed",
      startedAt: { $exists: true },
      completedAt: { $exists: true }
    }
  },
  {
    $project: {
      duration: { $subtract: ["$completedAt", "$startedAt"] }
    }
  },
  {
    $group: {
      _id: null,
      avgDuration: { $avg: "$duration" },
      maxDuration: { $max: "$duration" },
      minDuration: { $min: "$duration" }
    }
  }
])
```
