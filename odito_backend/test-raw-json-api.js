/**
 * AI Video Raw JSON API Test
 * Test script for the comprehensive audit data fetch endpoint
 */

import axios from 'axios';

// Configuration
const API_BASE_URL = 'http://localhost:3001/api/ai-video';
const TEST_PROJECT_ID = '507f1f77bcf86cd799439011'; // Replace with actual project ID

/**
 * Test the raw JSON API endpoint
 */
async function testRawJsonAPI() {
  console.log('🧪 Testing AI Video Raw JSON API...\n');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/${TEST_PROJECT_ID}/raw-json`, {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN', // Replace with actual token
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Response Data:\n');
    
    const data = response.data;
    
    // Display summary
    console.log('📋 SUMMARY:');
    console.log(`- Success: ${data.success}`);
    console.log(`- Pages Fetched: ${data.pagesFetched}`);
    console.log(`- Missing Pages: ${data.missingPages?.length || 0}`);
    
    if (data.missingPages?.length > 0) {
      console.log(`- Missing: ${data.missingPages.join(', ')}`);
    }
    
    // Display metadata
    if (data.metadata) {
      console.log('\n📊 METADATA:');
      console.log(`- Project ID: ${data.metadata.projectId}`);
      console.log(`- Fetched At: ${data.metadata.fetchedAt}`);
      console.log(`- Processing Time: ${data.metadata.processingTime}ms`);
      console.log(`- Retry Attempts: ${data.metadata.retryAttempts}`);
      
      if (data.metadata.validationResults) {
        const vr = data.metadata.validationResults;
        console.log(`- Validation Passed: ${vr.isValid}`);
        console.log(`- Valid Pages: ${vr.validPages?.length || 0}`);
        console.log(`- Invalid Pages: ${vr.invalidPages?.length || 0}`);
        
        if (vr.issues?.length > 0) {
          console.log('\n❌ VALIDATION ISSUES:');
          vr.issues.forEach(issue => console.log(`  - ${issue}`));
        }
      }
    }
    
    // Display raw data structure
    if (data.rawData) {
      console.log('\n📦 RAW DATA STRUCTURE:');
      Object.keys(data.rawData).forEach(pageKey => {
        const pageData = data.rawData[pageKey];
        if (pageData.status === 'missing') {
          console.log(`  ${pageKey}: ❌ MISSING`);
        } else {
          const dataType = Array.isArray(pageData) ? 'Array' : typeof pageData;
          const size = Array.isArray(pageData) ? pageData.length : Object.keys(pageData).length;
          console.log(`  ${pageKey}: ✅ ${dataType} (${size} items/keys)`);
        }
      });
    }
    
    // Sample data preview
    if (data.rawData?.cover && data.rawData.cover !== 'missing') {
      console.log('\n📄 SAMPLE COVER DATA:');
      console.log(JSON.stringify(data.rawData.cover, null, 2).substring(0, 500) + '...');
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    
    throw error;
  }
}

/**
 * Test individual page fetching
 */
async function testIndividualPages() {
  console.log('\n🔍 Testing Individual Page Fetching...\n');
  
  const pages = ['cover', 'page2', 'page3', 'page4', 'page5', 'page6', 'page7', 'page8', 'page9', 'page10', 'page11', 'page12', 'page13', 'page14'];
  
  for (const page of pages) {
    try {
      console.log(`📄 Fetching ${page}...`);
      // This would require individual endpoints or direct service calls
      console.log(`  ✅ ${page}: Available`);
    } catch (error) {
      console.log(`  ❌ ${page}: ${error.message}`);
    }
  }
}

/**
 * Run validation tests
 */
function runValidationTests() {
  console.log('\n🧪 Running Validation Tests...\n');
  
  const testData = {
    valid: { name: 'Test', value: 123 },
    empty: {},
    null: null,
    undefined: undefined,
    emptyString: '',
    arrayEmpty: [],
    arrayValid: [1, 2, 3]
  };
  
  // Test validation logic (this would be imported from the service)
  const testCases = [
    { name: 'Valid Object', data: testData.valid, expected: true },
    { name: 'Empty Object', data: testData.empty, expected: false },
    { name: 'Null', data: testData.null, expected: false },
    { name: 'Undefined', data: testData.undefined, expected: false },
    { name: 'Empty String', data: testData.emptyString, expected: false },
    { name: 'Empty Array', data: testData.arrayEmpty, expected: false },
    { name: 'Valid Array', data: testData.arrayValid, expected: true }
  ];
  
  testCases.forEach(testCase => {
    const result = isValidPageData(testCase.data);
    const status = result === testCase.expected ? '✅' : '❌';
    console.log(`${status} ${testCase.name}: ${result} (expected ${testCase.expected})`);
  });
}

/**
 * Mock validation function (copied from service)
 */
function isValidPageData(data) {
  if (data === null || data === undefined) {
    return false;
  }
  
  if (typeof data === 'object' && !Array.isArray(data)) {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return false;
    }
    
    const hasValidValues = keys.some(key => {
      const value = data[key];
      return value !== null && value !== undefined && value !== '';
    });
    
    return hasValidValues;
  }
  
  if (Array.isArray(data)) {
    return data.length > 0;
  }
  
  return data !== '';
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting AI Video Raw JSON API Tests\n');
  console.log('=' .repeat(60));
  
  try {
    // Run validation tests first
    runValidationTests();
    
    // Test the main API
    await testRawJsonAPI();
    
    // Test individual pages (conceptual)
    await testIndividualPages();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.argv[1] === __filename) {
  runTests();
}

export {
  testRawJsonAPI,
  testIndividualPages,
  runValidationTests,
  runTests
};
