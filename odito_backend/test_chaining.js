import mongoose from 'mongoose';

// Import the modules we need to test
import chainingEngine from './src/modules/jobs/chainingEngine.js';

async function testChaining() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/odito_dev');
    console.log('Connected to MongoDB');

    // Create a mock PAGE_SCRAPING job that appears "completed"
    const mockPageScrapingJob = {
      _id: new mongoose.Types.ObjectId(),
      jobType: 'PAGE_SCRAPING',
      status: 'completed',
      project_id: new mongoose.Types.ObjectId(),
      user_id: new mongoose.Types.ObjectId(),
      completed_at: new Date(),
      input_data: {
        source_job_id: new mongoose.Types.ObjectId().toString()
      }
    };

    const mockStats = {
      totalPages: 5,
      pagesAnalyzed: 5
    };

    const requestId = 'test-' + Math.random().toString(36).substr(2, 9);

    console.log('=== TRIGGERING CHAINING ENGINE TEST ===');
    console.log('Mock job:', JSON.stringify(mockPageScrapingJob, null, 2));
    
    // Call the chaining engine process method
    await chainingEngine.process(mockPageScrapingJob, mockStats, requestId);
    
    console.log('=== CHAINING ENGINE TEST COMPLETED ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testChaining();
