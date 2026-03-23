/**
 * Simple test script for Page19 endpoint
 * Run with: node test-page19.js
 */

import mongoose from 'mongoose';
import { Page19Service } from './src/modules/pdf/service/page19Service.js';

async function testPage19() {
  try {
    // Connect to MongoDB (using your existing connection)
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/odito_dev');
    console.log('Connected to odito_dev database');

    // Test with a sample project ID (replace with actual ID from your database)
    const testProjectId = '69bd4440b9f78e5bd946750b'; // From the MongoDB document you showed
    
    console.log('Testing Page19 service with projectId:', testProjectId);
    
    const result = await Page19Service.getPage19Data(testProjectId);
    
    console.log('Page19 Test Result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ Page19 service working correctly!');
      console.log('AI Readiness:', result.data.aiReadiness);
      console.log('GEO Score:', result.data.geoScore);
      console.log('AEO Score:', result.data.aeoScore);
      console.log('AI SEO Score:', result.data.aiSeoScore);
      console.log('Summary:', result.data.summary);
    } else {
      console.log('\n❌ Page19 service failed:', result.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testPage19();
