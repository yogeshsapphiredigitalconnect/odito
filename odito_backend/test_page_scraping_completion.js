import mongoose from 'mongoose';
import Job from './src/modules/jobs/model/Job.js';

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/odito_dev');

// Create a test PAGE_SCRAPING job
const projectId = new mongoose.Types.ObjectId();
const testJob = new Job({
  user_id: new mongoose.Types.ObjectId(),
  project_id: projectId,
  entityId: projectId, // Required field
  entityType: 'project', // Required field
  jobType: 'PAGE_SCRAPING',
  status: 'processing', // Start as processing
  input_data: {
    source_job_id: new mongoose.Types.ObjectId().toString(),
    urls: ['https://example.com']
  },
  created_at: new Date(),
  started_at: new Date()
});

// Save the job
const savedJob = await testJob.save();
console.log('Created test PAGE_SCRAPING job:', savedJob._id);

// Now simulate completion by calling the webhook endpoint
const response = await fetch(`http://localhost:5000/api/jobs/${savedJob._id}/complete`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    stats: {
      totalPages: 5,
      pagesAnalyzed: 5,
      issuesFound: 10
    },
    result_data: {
      status: 'completed',
      processedUrls: ['https://example.com']
    }
  })
});

const result = await response.json();
console.log('Completion response:', result);

await mongoose.disconnect();
process.exit(0);
