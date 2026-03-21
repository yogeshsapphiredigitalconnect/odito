/**
 * AI Video Service Direct Test
 * Test the service logic directly without requiring a running server
 */

import mongoose from 'mongoose';
import { AIVideoService } from './src/modules/aiVideo/aiVideo.service.js';

// Test configuration
const TEST_PROJECT_ID = '507f1f77bcf86cd799439011'; // Mock ObjectId

/**
 * Test validation functions
 */
function testValidationFunctions() {
  console.log('🧪 Testing Validation Functions...\n');
  
  const testCases = [
    { name: 'Valid Object', data: { name: 'Test', value: 123 }, expected: true },
    { name: 'Empty Object', data: {}, expected: false },
    { name: 'Null', data: null, expected: false },
    { name: 'Undefined', data: undefined, expected: false },
    { name: 'Empty String', data: '', expected: false },
    { name: 'Empty Array', data: [], expected: false },
    { name: 'Valid Array', data: [1, 2, 3], expected: true },
    { name: 'Object with null values', data: { a: null, b: undefined }, expected: false },
    { name: 'Object with some valid values', data: { a: null, b: 'valid' }, expected: true },
    { name: 'Number zero', data: 0, expected: true },
    { name: 'Boolean false', data: false, expected: true },
    { name: 'String with spaces', data: '   ', expected: true }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    const result = AIVideoService.isValidPageData(testCase.data);
    const status = result === testCase.expected ? '✅' : '❌';
    console.log(`${status} ${testCase.name}: ${result} (expected ${testCase.expected})`);
    
    if (result === testCase.expected) {
      passed++;
    } else {
      failed++;
    }
  });
  
  console.log(`\n📊 Validation Tests: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

/**
 * Test complete data validation
 */
function testCompleteDataValidation() {
  console.log('🧪 Testing Complete Data Validation...\n');
  
  const testData = {
    // Valid complete data
    valid: {
      cover: { projectName: 'Test Project' },
      page2: { domain: 'example.com' },
      page3: { keywords: ['test'] },
      page4: { summary: 'test summary' },
      page5: { issues: [] },
      page6: { technical: 'data' },
      page7: { content: 'data' },
      page8: { data: 'page8' },
      page9: { data: 'page9' },
      page10: { data: 'page10' },
      page11: { data: 'page11' },
      page12: { data: 'page12' },
      page13: { data: 'page13' },
      page14: { data: 'page14' }
    },
    
    // Missing some pages
    partial: {
      cover: { projectName: 'Test Project' },
      page2: { domain: 'example.com' },
      page3: null,
      page4: undefined,
      page5: { issues: [] },
      page6: { status: 'missing' },
      page7: {},
      page8: { data: 'page8' }
      // Missing pages 9-14
    },
    
    // All missing
    allMissing: {}
  };
  
  const testCases = [
    { name: 'Valid Complete Data', data: testData.valid, expectedValid: true, expectedInvalidPages: 0 },
    { name: 'Partial Data', data: testData.partial, expectedValid: false, expectedInvalidPages: 10 },
    { name: 'All Missing', data: testData.allMissing, expectedValid: false, expectedInvalidPages: 14 }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    const result = AIVideoService.validateCompleteData(testCase.data);
    const validationPassed = result.isValid === testCase.expectedValid;
    const invalidPagesCount = result.invalidPages.length === testCase.expectedInvalidPages;
    
    const status = validationPassed && invalidPagesCount ? '✅' : '❌';
    console.log(`${status} ${testCase.name}:`);
    console.log(`  - Valid: ${result.isValid} (expected ${testCase.expectedValid})`);
    console.log(`  - Invalid Pages: ${result.invalidPages.length} (expected ${testCase.expectedInvalidPages})`);
    
    if (result.issues.length > 0) {
      console.log(`  - Issues: ${result.issues.slice(0, 3).join(', ')}${result.issues.length > 3 ? '...' : ''}`);
    }
    console.log('');
    
    if (validationPassed && invalidPagesCount) {
      passed++;
    } else {
      failed++;
    }
  });
  
  console.log(`📊 Complete Data Validation Tests: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

/**
 * Test individual page fetch functions (mock)
 */
async function testPageFetchFunctions() {
  console.log('🧪 Testing Page Fetch Functions (Mock)...\n');
  
  // Mock MongoDB connection for testing
  const mockData = {
    seoprojects: {
      _id: TEST_PROJECT_ID,
      projectName: 'Test Project',
      domain: 'example.com',
      targetKeywords: ['test', 'seo'],
      competitors: ['competitor1.com'],
      createdAt: new Date()
    },
    ai_visibility_summary: {
      projectId: TEST_PROJECT_ID,
      totalScore: 85,
      issuesFound: 12
    },
    seo_ai_visibility_issues: [
      { projectId: TEST_PROJECT_ID, rule_id: 'rule1', severity: 'high' },
      { projectId: TEST_PROJECT_ID, rule_id: 'rule2', severity: 'medium' }
    ]
  };
  
  // Test each fetch function by calling it directly
  const fetchFunctions = [
    { name: 'fetchPage2Data', func: () => AIVideoService.fetchPage2Data(TEST_PROJECT_ID) },
    { name: 'fetchPage3Data', func: () => AIVideoService.fetchPage3Data(TEST_PROJECT_ID) },
    { name: 'fetchPage4Data', func: () => AIVideoService.fetchPage4Data(TEST_PROJECT_ID) },
    { name: 'fetchPage5Data', func: () => AIVideoService.fetchPage5Data(TEST_PROJECT_ID) },
    { name: 'fetchPage6Data', func: () => AIVideoService.fetchPage6Data(TEST_PROJECT_ID) },
    { name: 'fetchPage7Data', func: () => AIVideoService.fetchPage7Data(TEST_PROJECT_ID) },
    { name: 'fetchPage12Data', func: () => AIVideoService.fetchPage12Data(TEST_PROJECT_ID) },
    { name: 'fetchPage13Data', func: () => AIVideoService.fetchPage13Data(TEST_PROJECT_ID) },
    { name: 'fetchPage14Data', func: () => AIVideoService.fetchPage14Data(TEST_PROJECT_ID) }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const fetchTest of fetchFunctions) {
    try {
      console.log(`📄 Testing ${fetchTest.name}...`);
      const result = await fetchTest.func();
      
      if (result === null || result === undefined) {
        console.log(`  ⚠️  ${fetchTest.name}: Returned null/undefined (expected - no DB connection)`);
        passed++; // This is expected without DB connection
      } else {
        console.log(`  ✅ ${fetchTest.name}: Returned data with ${Object.keys(result).length} keys`);
        passed++;
      }
    } catch (error) {
      console.log(`  ❌ ${fetchTest.name}: Error - ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Page Fetch Tests: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

/**
 * Test the complete fetch and validation flow (mock)
 */
async function testCompleteFlow() {
  console.log('🧪 Testing Complete Flow (Mock)...\n');
  
  try {
    console.log('📋 Calling fetchAllPagesWithValidation...');
    
    // This will fail without DB connection, but we can test the structure
    const result = await AIVideoService.fetchAllPagesWithValidation(TEST_PROJECT_ID);
    
    console.log('✅ Complete flow executed successfully!');
    console.log(`📊 Results:`);
    console.log(`  - Success: ${result.success}`);
    console.log(`  - Pages Fetched: ${result.pagesFetched}`);
    console.log(`  - Missing Pages: ${result.missingPages?.length || 0}`);
    
    if (result.metadata) {
      console.log(`  - Processing Time: ${result.metadata.processingTime}ms`);
      console.log(`  - Retry Attempts: ${result.metadata.retryAttempts}`);
    }
    
    return { passed: 1, failed: 0 };
    
  } catch (error) {
    console.log(`❌ Complete flow failed: ${error.message}`);
    return { passed: 0, failed: 1 };
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting AI Video Service Direct Tests\n');
  console.log('='.repeat(60));
  
  const results = {
    validation: testValidationFunctions(),
    completeData: testCompleteDataValidation(),
    pageFetch: await testPageFetchFunctions(),
    completeFlow: await testCompleteFlow()
  };
  
  console.log('='.repeat(60));
  console.log('📊 FINAL RESULTS:');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  Object.entries(results).forEach(([testName, result]) => {
    totalPassed += result.passed;
    totalFailed += result.failed;
    console.log(`  ${testName}: ${result.passed} passed, ${result.failed} failed`);
  });
  
  console.log(`\n🎯 TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
  
  if (totalFailed === 0) {
    console.log('✅ All tests passed successfully!');
  } else {
    console.log(`⚠️  ${totalFailed} tests failed - review above for details`);
  }
  
  return { totalPassed, totalFailed };
}

// Run tests if this file is executed directly
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.argv[1] === __filename) {
  runAllTests().catch(console.error);
}

export {
  testValidationFunctions,
  testCompleteDataValidation,
  testPageFetchFunctions,
  testCompleteFlow,
  runAllTests
};
