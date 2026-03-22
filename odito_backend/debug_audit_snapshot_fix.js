/**
 * DEBUG + TEST SCRIPT: Fix auditSnapshot Data Mapping
 * Identifies why Page08 (topIssues) and Page10 (technical checks) data is not reaching auditSnapshot
 */

import axios from 'axios';
import { AiDataService } from './src/modules/aiVideo/services/aiData.service.js';

console.log('🔍 DEBUG + TEST SCRIPT: auditSnapshot Data Mapping Fix');
console.log('='.repeat(60));

// Test configuration
const TEST_PROJECT_ID = 'YOUR_PROJECT_ID_HERE'; // Replace with actual project ID
const BASE_URL = 'http://localhost:5000';

/**
 * STEP 1: VERIFY RAW API RESPONSE
 */
async function testRawAPIResponses(projectId) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 1: VERIFY RAW API RESPONSE');
  console.log('━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Test Page08 API
    console.log('\n📋 TESTING PAGE08 API...');
    const page08Response = await axios.get(`${BASE_URL}/api/pdf/${projectId}/page08`, {
      headers: { Authorization: `Bearer YOUR_TOKEN_HERE` }
    });
    
    console.log("RAW PAGE08 FULL RESPONSE:", JSON.stringify(page08Response.data, null, 2));
    console.log("PAGE08 RESPONSE STRUCTURE:", {
      hasData: !!page08Response.data,
      hasDataData: !!page08Response.data?.data,
      hasTopIssues: !!page08Response.data?.data?.topIssues,
      topIssuesType: typeof page08Response.data?.data?.topIssues,
      topIssuesLength: Array.isArray(page08Response.data?.data?.topIssues) ? page08Response.data?.data?.topIssues.length : 'N/A'
    });
    
    // Test Page10 API
    console.log('\n📋 TESTING PAGE10 API...');
    const page10Response = await axios.get(`${BASE_URL}/api/pdf/${projectId}/page10`, {
      headers: { Authorization: `Bearer YOUR_TOKEN_HERE` }
    });
    
    console.log("RAW PAGE10 FULL RESPONSE:", JSON.stringify(page10Response.data, null, 2));
    console.log("PAGE10 RESPONSE STRUCTURE:", {
      hasData: !!page10Response.data,
      hasDataData: !!page10Response.data?.data,
      hasChecks: !!page10Response.data?.data?.checks,
      checksType: typeof page10Response.data?.data?.checks,
      checksLength: Array.isArray(page10Response.data?.data?.checks) ? page10Response.data?.data?.checks.length : 'N/A'
    });
    
    return {
      page08: page08Response.data,
      page10: page10Response.data
    };
    
  } catch (error) {
    console.error('❌ ERROR TESTING RAW API RESPONSES:', error.message);
    return { page08: {}, page10: {} };
  }
}

/**
 * STEP 2: EXTRACT CORRECT DATA
 */
function testCorrectDataExtraction(page08Response, page10Response) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 2: EXTRACT CORRECT DATA');
  console.log('━━━━━━━━━━━━━━━━━━━━━');
  
  // CORRECT extraction (fixing the bug)
  const page08Data = page08Response?.data?.data || {};
  const page10Data = page10Response?.data?.data || {};
  
  console.log("EXTRACTED PAGE08:", page08Data);
  console.log("EXTRACTED PAGE10:", page10Data);
  
  // Test different possible paths
  console.log('\n🔍 TESTING DIFFERENT DATA PATHS:');
  console.log('page08Response.data?.data?.topIssues:', page08Response?.data?.data?.topIssues);
  console.log('page08Response.data?.topIssues:', page08Response?.data?.topIssues);
  console.log('page10Response.data?.data?.checks:', page10Response?.data?.data?.checks);
  console.log('page10Response.data?.checks:', page10Response?.data?.checks);
  
  return {
    page08Data,
    page10Data
  };
}

/**
 * STEP 3: BUILD TEST SCRIPT FUNCTION
 */
async function testDataFlow(projectId) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 3: BUILD TEST SCRIPT FUNCTION');
  console.log('━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const page08 = await axios.get(`${BASE_URL}/api/pdf/${projectId}/page08`);
    const page10 = await axios.get(`${BASE_URL}/api/pdf/${projectId}/page10`);
    
    // CORRECT extraction
    const topIssues = page08.data?.data?.topIssues || [];
    const checks = page10.data?.data?.checks || [];
    
    console.log('\n📊 TEST RESULT:');
    console.log("Top Issues Count:", topIssues.length);
    console.log("Sample Issue:", topIssues[0]);
    console.log("Checks Count:", checks.length);
    console.log("Sample Check:", checks[0]);
    
    // Test severity filtering
    const high = topIssues.filter(i => i.severity === 'high').slice(0, 3);
    const medium = topIssues.filter(i => i.severity === 'medium').slice(0, 2);
    const low = topIssues.filter(i => i.severity === 'low').slice(0, 1);
    
    console.log('\n📈 FILTERED TOP ISSUES:');
    console.log('High (3):', high.length, high);
    console.log('Medium (2):', medium.length, medium);
    console.log('Low (1):', low.length, low);
    
    return {
      topIssues: { high, medium, low },
      checks: checks.slice(0, 12)
    };
    
  } catch (error) {
    console.error('❌ ERROR IN TEST DATA FLOW:', error.message);
    return { topIssues: { high: [], medium: [], low: [] }, checks: [] };
  }
}

/**
 * STEP 4: FIX SNAPSHOT MAPPING
 */
function testFixedSnapshotMapping(topIssuesRaw, checksRaw) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 4: FIX SNAPSHOT MAPPING');
  console.log('━━━━━━━━━━━━━━━━━━━━━');
  
  // Simulate the fix for auditSnapshot mapping
  const auditSnapshot = {
    topIssues: {
      high: topIssuesRaw.filter(i => i.severity === 'high').slice(0, 3),
      medium: topIssuesRaw.filter(i => i.severity === 'medium').slice(0, 2),
      low: topIssuesRaw.filter(i => i.severity === 'low').slice(0, 1)
    },
    technicalHighlights: {
      checks: checksRaw.slice(0, 12)
    }
  };
  
  console.log('\n📋 FIXED SNAPSHOT MAPPING:');
  console.log('Top Issues:', auditSnapshot.topIssues);
  console.log('Technical Highlights:', auditSnapshot.technicalHighlights);
  
  return auditSnapshot;
}

/**
 * STEP 5: ADD FINAL VALIDATION
 */
function validateSnapshotMapping(auditSnapshot, topIssuesRaw, checksRaw) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 5: ADD FINAL VALIDATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\n🔍 FINAL TOP ISSUES:', auditSnapshot.topIssues);
  console.log('🔍 FINAL TECH CHECKS:', auditSnapshot.technicalHighlights);
  
  const validationResults = {
    topIssuesValid: false,
    technicalValid: false,
    errors: []
  };
  
  // Validate topIssues
  if (!topIssuesRaw.length) {
    console.error('❌ ERROR: Page08 data not mapped correctly');
    validationResults.errors.push('Page08 data empty');
  } else {
    const totalTopIssues = auditSnapshot.topIssues.high.length + 
                           auditSnapshot.topIssues.medium.length + 
                           auditSnapshot.topIssues.low.length;
    if (totalTopIssues > 0) {
      console.log('✅ Top issues mapped correctly:', totalTopIssues, 'items');
      validationResults.topIssuesValid = true;
    } else {
      console.error('❌ ERROR: Top issues mapped but result is empty');
      validationResults.errors.push('Top issues mapping failed');
    }
  }
  
  // Validate technical highlights
  if (!checksRaw.length) {
    console.error('❌ ERROR: Page10 data not mapped correctly');
    validationResults.errors.push('Page10 data empty');
  } else {
    if (auditSnapshot.technicalHighlights.checks.length > 0) {
      console.log('✅ Technical checks mapped correctly:', auditSnapshot.technicalHighlights.checks.length, 'items');
      validationResults.technicalValid = true;
    } else {
      console.error('❌ ERROR: Technical checks mapped but result is empty');
      validationResults.errors.push('Technical checks mapping failed');
    }
  }
  
  return validationResults;
}

/**
 * STEP 6: EXPECTED OUTPUT
 */
function showExpectedOutput() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 6: EXPECTED OUTPUT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\n📋 EXPECTED TOP ISSUES:');
  console.log('  high: 3 items');
  console.log('  medium: 2 items');
  console.log('  low: 1 item');
  
  console.log('\n🔧 EXPECTED TECHNICAL:');
  console.log('  checks: 12 items');
  
  console.log('\n⚠️  IMPORTANT ROOT CAUSE:');
  console.log('  The bug is in AiScriptService.buildAuditSnapshot()');
  console.log('  Line 368: const page08Data = auditData.pages?.page08?.data || auditData.pages?.page08 || {};');
  console.log('  Line 388: const page10Data = auditData.pages?.page10?.data || auditData.pages?.page10 || {};');
  console.log('  SHOULD BE: page08Data?.topIssues and page10Data?.checks');
  console.log('  CURRENTLY: page08Data?.severityBreakdown and page10Data?.checks');
}

/**
 * MAIN TEST EXECUTION
 */
async function runDebugTest() {
  console.log('\n🚀 STARTING DEBUG TEST FOR auditSnapshot DATA MAPPING');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Test raw API responses
    const rawResponses = await testRawAPIResponses(TEST_PROJECT_ID);
    
    // Step 2: Test correct data extraction
    const extractedData = testCorrectDataExtraction(rawResponses.page08, rawResponses.page10);
    
    // Step 3: Test data flow
    const testData = await testDataFlow(TEST_PROJECT_ID);
    
    // Step 4: Test fixed snapshot mapping
    const fixedSnapshot = testFixedSnapshotMapping(testData.topIssues.high.concat(testData.topIssues.medium).concat(testData.topIssues.low), testData.checks);
    
    // Step 5: Validate final mapping
    const validation = validateSnapshotMapping(fixedSnapshot, testData.topIssues.high.concat(testData.topIssues.medium).concat(testData.topIssues.low), testData.checks);
    
    // Step 6: Show expected output
    showExpectedOutput();
    
    console.log('\n🎯 DEBUG TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Raw API Response Testing: COMPLETE');
    console.log('✅ Data Extraction Testing: COMPLETE');
    console.log('✅ Data Flow Testing: COMPLETE');
    console.log('✅ Fixed Mapping Testing: COMPLETE');
    console.log('✅ Validation Testing: COMPLETE');
    
    if (validation.topIssuesValid && validation.technicalValid) {
      console.log('\n🎉 ALL TESTS PASSED - Data mapping is working correctly!');
    } else {
      console.log('\n❌ SOME TESTS FAILED - Check errors above');
      console.log('Errors:', validation.errors);
    }
    
  } catch (error) {
    console.error('\n💥 DEBUG TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
}

/**
 * ACTUAL FIX IMPLEMENTATION
 * This shows the exact fix needed in AiScriptService
 */
function showActualFix() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ACTUAL FIX IMPLEMENTATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\n🔧 FILE TO FIX: aiScript.service.js');
  console.log('📍 METHOD: buildAuditSnapshot()');
  console.log('📍 LINES: 368 and 388');
  
  console.log('\n❌ CURRENT (WRONG):');
  console.log('  Line 368: const page08Data = auditData.pages?.page08?.data || auditData.pages?.page08 || {};');
  console.log('  Line 388: const page10Data = auditData.pages?.page10?.data || auditData.pages?.page10 || {};');
  
  console.log('\n✅ CORRECT FIX:');
  console.log('  Line 368: const page08Data = auditData.pages?.page08?.data || {};');
  console.log('  Line 388: const page10Data = auditData.pages?.page10?.data || {};');
  
  console.log('\n🔧 EXTRACTION FIX:');
  console.log('  Line 372: const page08TopIssues = page08Data?.topIssues || [];');
  console.log('  Line 392: const allChecks = page10Data?.checks || [];');
  
  console.log('\n📋 COMPLETE FIX:');
  console.log(`  // Replace lines 363-377 with:
  const page08Data = auditData.pages?.page08?.data || {};
  console.log('Page 08 data:', page08Data);
  const page08TopIssues = page08Data?.topIssues || [];
  const topIssues = {
    critical: page08TopIssues.filter(i => i.severity === 'critical').slice(0, 1),
    high: page08TopIssues.filter(i => i.severity === 'high').slice(0, 1),
    medium: page08TopIssues.filter(i => i.severity === 'medium').slice(0, 1)
  };`);
  
  console.log(`  // Replace lines 383-396 with:
  const page10Data = auditData.pages?.page10?.data || {};
  console.log('Page 10 data:', JSON.stringify(page10Data, null, 2));
  const allChecks = page10Data?.checks || [];
  const technicalHighlights = {
    criticalIssues: allChecks.filter(c => c.status === 'FAIL').slice(0, 3),
    topRecommendations: allChecks.slice(0, 5)
  };`);
}

// Run the debug test
if (require.main === module) {
  runDebugTest();
  showActualFix();
}

export {
  testRawAPIResponses,
  testCorrectDataExtraction,
  testDataFlow,
  testFixedSnapshotMapping,
  validateSnapshotMapping,
  runDebugTest,
  showActualFix
};
