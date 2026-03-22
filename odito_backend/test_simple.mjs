/**
 * Simple Test Script for auditSnapshot Data Mapping
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
const TEST_PROJECT_ID = '65f8a4b5c4a3b001e8b4e5'; // Example project ID

async function testAuditSnapshot() {
  console.log('🔍 TESTING auditSnapshot Data Mapping');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Check Page08 API
    console.log('\n📋 TESTING PAGE08 API...');
    const page08Response = await axios.get(`${BASE_URL}/api/pdf/${TEST_PROJECT_ID}/page08`);
    console.log('Page08 Status:', page08Response.status);
    console.log('Page08 Data Keys:', Object.keys(page08Response.data || {}));
    console.log('Page08 Data Data Keys:', Object.keys(page08Response.data?.data || {}));
    console.log('Has topIssues:', !!page08Response.data?.data?.topIssues);
    console.log('Top Issues Count:', page08Response.data?.data?.topIssues?.length || 0);
    
    // Test 2: Check Page10 API  
    console.log('\n🔧 TESTING PAGE10 API...');
    const page10Response = await axios.get(`${BASE_URL}/api/pdf/${TEST_PROJECT_ID}/page10`);
    console.log('Page10 Status:', page10Response.status);
    console.log('Page10 Data Keys:', Object.keys(page10Response.data || {}));
    console.log('Page10 Data Data Keys:', Object.keys(page10Response.data?.data || {}));
    console.log('Has checks:', !!page10Response.data?.data?.checks);
    console.log('Checks Count:', page10Response.data?.data?.checks?.length || 0);
    
    // Test 3: Check Executive API
    console.log('\n📊 TESTING EXECUTIVE API...');
    const execResponse = await axios.get(`${BASE_URL}/api/pdf/${TEST_PROJECT_ID}/executive`);
    console.log('Executive Status:', execResponse.status);
    console.log('Executive Data Keys:', Object.keys(execResponse.data?.data || {}));
    console.log('Has topIssues:', !!execResponse.data?.data?.topIssues);
    console.log('Has technicalHighlights:', !!execResponse.data?.data?.technicalHighlights);
    console.log('Has performanceMetrics:', !!execResponse.data?.data?.performanceMetrics);
    
    // Test 4: Show actual data structure
    if (execResponse.data?.success) {
      const { topIssues, technicalHighlights, performanceMetrics } = execResponse.data.data;
      console.log('\n📈 FINAL DATA STRUCTURE:');
      console.log('Top Issues:', topIssues);
      console.log('Technical Highlights:', technicalHighlights);
      console.log('Performance Metrics:', performanceMetrics);
    }
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testAuditSnapshot();
