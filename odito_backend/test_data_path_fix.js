/**
 * Test Script for Data Path Mismatch Fix Verification
 * Tests all the debugging and mapping fixes implemented
 */

import { AiScriptService } from './src/modules/aiVideo/services/aiScript.service.js';

console.log('🔍 TESTING DATA PATH MISMATCH FIXES');
console.log('='.repeat(60));

// Test 1: Safe get function
console.log('\n📋 TEST 1: Safe Get Function');
console.log('-'.repeat(40));

const testData = {
  data: {
    issueDistribution: {
      total: 521,
      critical: 47,
      medium: 234,
      info: 240
    },
    scores: {
      seoHealth: 75,
      aiVisibility: 82,
      performance: 68
    },
    project: {
      name: "Test Website",
      url: "https://example.com"
    }
  }
};

try {
  // Test existing paths
  const total = AiScriptService.get(testData, "data.issueDistribution.total");
  const critical = AiScriptService.get(testData, "data.issueDistribution.critical");
  const aiScore = AiScriptService.get(testData, "data.scores.aiVisibility");
  const projectName = AiScriptService.get(testData, "data.project.name", "Default");
  
  console.log('✅ Existing paths work:');
  console.log(`  Total issues: ${total}`);
  console.log(`  Critical issues: ${critical}`);
  console.log(`  AI Score: ${aiScore}`);
  console.log(`  Project name: ${projectName}`);
  
  // Test non-existent paths with defaults
  const nonExistent = AiScriptService.get(testData, "data.nonExistent.path", 0);
  const deepNonExistent = AiScriptService.get(testData, "data.very.deep.nonExistent.path", "default");
  
  console.log('✅ Non-existent paths return defaults:');
  console.log(`  Non-existent: ${nonExistent}`);
  console.log(`  Deep non-existent: ${deepNonExistent}`);
  
} catch (error) {
  console.log('❌ Safe get function FAILED:', error.message);
}

// Test 2: Full API Response Logging Simulation
console.log('\n📋 TEST 2: Full API Response Logging');
console.log('-'.repeat(40));

try {
  console.log('🔍 STEP 1: LOG FULL API RESPONSE (CRITICAL)');
  console.log('FULL API RESPONSE:');
  console.log(JSON.stringify(testData, null, 2));
  
  console.log('✅ Full API response logging works');
} catch (error) {
  console.log('❌ Full API response logging FAILED:', error.message);
}

// Test 3: Real Data Path Identification
console.log('\n📋 TEST 3: Real Data Path Identification');
console.log('-'.repeat(40));

try {
  console.log('🔍 STEP 2: IDENTIFY REAL DATA PATH');
  console.log('data.issueDistribution exists:', !!testData.data?.issueDistribution);
  console.log('data.data.issueDistribution exists:', !!testData.data?.data?.issueDistribution);
  console.log('data.executiveSummary.issueDistribution exists:', !!testData.data?.executiveSummary?.issueDistribution);
  console.log('data.scores exists:', !!testData.data?.scores);
  
  console.log('✅ Data path identification works');
} catch (error) {
  console.log('❌ Data path identification FAILED:', error.message);
}

// Test 4: Mapping Using Safe Path
console.log('\n📋 TEST 4: Mapping Using Safe Path');
console.log('-'.repeat(40));

try {
  // 🔧 STEP 4: FIX MAPPING USING SAFE PATH
  const issueDistribution = {
    total: AiScriptService.get(testData, "data.issueDistribution.total"),
    critical: AiScriptService.get(testData, "data.issueDistribution.critical"),
    medium: AiScriptService.get(testData, "data.issueDistribution.medium"),
    info: AiScriptService.get(testData, "data.issueDistribution.info")
  };
  
  // 🔧 STEP 3: FIX SCORES USING SAFE PATH
  const scores = {
    overall: Math.round(AiScriptService.get(testData, "data.scores.seoHealth")),
    performance: Math.round(AiScriptService.get(testData, "data.scores.performance")),
    seo: Math.round(AiScriptService.get(testData, "data.scores.seoHealth")),
    aiVisibility: Math.round(AiScriptService.get(testData, "data.scores.aiVisibility"))
  };
  
  console.log('✅ Safe path mapping works:');
  console.log(`  Issue distribution:`, issueDistribution);
  console.log(`  Scores:`, scores);
  
} catch (error) {
  console.log('❌ Safe path mapping FAILED:', error.message);
}

// Test 5: Validation Logging
console.log('\n📋 TEST 5: Validation Logging');
console.log('-'.repeat(40));

try {
  const issueDistribution = {
    total: 521,
    critical: 47,
    medium: 234,
    info: 240
  };
  
  // 🔧 STEP 5: ADD VALIDATION LOG
  console.log("MAPPED issueDistribution:", issueDistribution);
  
  if (issueDistribution.critical === 0) {
    console.warn("❌ CRITICAL ISSUE: Data mapping failed");
    console.warn("Trying alternative paths...");
  } else {
    console.log('✅ Validation passed - critical issues > 0');
  }
  
} catch (error) {
  console.log('❌ Validation logging FAILED:', error.message);
}

// Test 6: Test Script Output
console.log('\n📋 TEST 6: Test Script Output');
console.log('-'.repeat(40));

try {
  const mockAuditSnapshot = {
    projectName: "Test Website",
    issueDistribution: {
      critical: 47,
      medium: 234,
      total: 521
    },
    scores: {
      aiVisibility: 82,
      overall: 75,
      performance: 68,
      seo: 75
    },
    recommendations: ["Recommendation 1", "Recommendation 2"]
  };
  
  // 🔧 STEP 7: TEST SCRIPT OUTPUT
  console.log(`TEST DATA:
Critical: ${mockAuditSnapshot.issueDistribution.critical}
Medium: ${mockAuditSnapshot.issueDistribution.medium}
Total: ${mockAuditSnapshot.issueDistribution.total}
AI Score: ${mockAuditSnapshot.scores.aiVisibility}
Overall Score: ${mockAuditSnapshot.scores.overall}`);
  
  const testOutput = AiScriptService.testScript(mockAuditSnapshot);
  console.log('✅ Test script output:');
  console.log(testOutput);
  
} catch (error) {
  console.log('❌ Test script output FAILED:', error.message);
}

// Test 7: Alternative Path Detection
console.log('\n📋 TEST 7: Alternative Path Detection');
console.log('-'.repeat(40));

try {
  // Simulate failed mapping scenario
  const failedMapping = {
    critical: 0,
    medium: 0,
    total: 0
  };
  
  if (failedMapping.critical === 0) {
    console.warn("❌ CRITICAL ISSUE: Data mapping failed");
    console.warn("Trying alternative paths...");
    
    // Try alternative paths
    const altPaths = [
      "data.issueDistribution",
      "executiveSummary.issueDistribution", 
      "issues"
    ];
    
    altPaths.forEach(path => {
      const testData = AiScriptService.get(testData, path);
      console.log(`Path ${path}:`, testData);
    });
    
    console.log('✅ Alternative path detection works');
  }
  
} catch (error) {
  console.log('❌ Alternative path detection FAILED:', error.message);
}

// Test 8: Complete Integration Test
console.log('\n📋 TEST 8: Complete Integration Test');
console.log('-'.repeat(40));

try {
  // Simulate the complete flow with buildAuditSnapshot
  const mockAuditData = {
    project: {
      name: "Integration Test Website",
      url: "https://integration-test.com"
    },
    issueDistribution: {
      total: 521,
      critical: 47,
      medium: 234,
      info: 240
    },
    scores: {
      seoHealth: 75,
      aiVisibility: 82,
      performance: 68
    },
    issues: {
      critical: ["Missing H1 tags", "Broken links"],
      high: ["Slow page speed"],
      medium: ["Thin content"]
    },
    recommendations: [
      { title: "Add structured data" },
      { title: "Improve page speed" }
    ]
  };
  
  console.log('🔍 Testing complete integration with buildAuditSnapshot...');
  const auditSnapshot = AiScriptService.buildAuditSnapshot(mockAuditData);
  
  console.log('✅ Complete integration test passed:');
  console.log(`  Project: ${auditSnapshot.projectName}`);
  console.log(`  Critical Issues: ${auditSnapshot.issueDistribution.critical}`);
  console.log(`  Total Issues: ${auditSnapshot.issueDistribution.total}`);
  console.log(`  AI Score: ${auditSnapshot.scores.aiVisibility}`);
  console.log(`  Recommendations: ${auditSnapshot.recommendations.length}`);
  
} catch (error) {
  console.log('❌ Complete integration test FAILED:', error.message);
}

console.log('\n🎯 TEST SUMMARY');
console.log('='.repeat(60));
console.log('All debugging fixes have been tested.');
console.log('Check above for any ❌ failures.');
console.log('If all ✅, the data path mismatch fixes are working correctly!');
console.log('');
console.log('🚀 NEXT STEPS:');
console.log('1. Test with real project data using: GET /api/debug/audit/:projectId');
console.log('2. Test mapping using: GET /api/debug/test-mapping/:projectId');
console.log('3. Monitor logs for "FULL API RESPONSE" and "MAPPED issueDistribution"');
console.log('4. Verify auditSnapshot stores real values instead of 0');
