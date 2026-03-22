/**
 * Test Script for New Data Structure Fix
 * Tests the updated mapping for the new issues object format
 */

import { AiScriptService } from './src/modules/aiVideo/services/aiScript.service.js';

console.log('🔍 TESTING NEW DATA STRUCTURE FIX');
console.log('='.repeat(60));

// Mock data with the NEW structure (from the error logs)
const mockAuditData = {
  project: {
    name: "New Structure Test Website",
    url: "https://new-structure-test.com"
  },
  // NEW FORMAT: issues object with counts, not issueDistribution
  issues: {
    critical: 521,
    warnings: 185,
    informational: 142,
    passed: 0
  },
  scores: {
    seoHealth: 50,
    aiVisibility: 46,
    performance: 68
  },
  recommendations: [
    { title: "Add structured data" },
    { title: "Improve page speed" }
  ]
};

console.log('📋 Testing with NEW data structure...');
console.log('Expected: critical=521, warnings=185, informational=142');
console.log('Expected mapped: critical=521, medium=185, info=142, total=848');

try {
  console.log('\n🚀 STEP 1: Testing buildAuditSnapshot with new structure');
  console.log('-'.repeat(40));
  
  const auditSnapshot = AiScriptService.buildAuditSnapshot(mockAuditData);
  
  console.log('\n✅ buildAuditSnapshot completed');
  console.log('Results:');
  console.log(`  Critical Issues: ${auditSnapshot.issueDistribution.critical}`);
  console.log(`  Medium Issues: ${auditSnapshot.issueDistribution.medium}`);
  console.log(`  Info Issues: ${auditSnapshot.issueDistribution.info}`);
  console.log(`  Total Issues: ${auditSnapshot.issueDistribution.total}`);
  console.log(`  AI Score: ${auditSnapshot.scores.aiVisibility}`);
  console.log(`  Overall Score: ${auditSnapshot.scores.overall}`);
  console.log(`  Project Name: ${auditSnapshot.projectName}`);
  console.log(`  Frozen: ${Object.isFrozen(auditSnapshot)}`);
  
  // Verify data integrity for new structure
  const dataIntegrity = {
    criticalCorrect: auditSnapshot.issueDistribution.critical === 521,
    mediumCorrect: auditSnapshot.issueDistribution.medium === 185,
    infoCorrect: auditSnapshot.issueDistribution.info === 142,
    totalCorrect: auditSnapshot.issueDistribution.total === 848, // 521+185+142
    aiVisibilityCorrect: auditSnapshot.scores.aiVisibility === 46,
    overallCorrect: auditSnapshot.scores.overall === 50,
    projectCorrect: auditSnapshot.projectName === "New Structure Test Website",
    isFrozen: Object.isFrozen(auditSnapshot)
  };
  
  console.log('\n🔍 DATA INTEGRITY CHECK (NEW STRUCTURE):');
  Object.entries(dataIntegrity).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`  ${status} ${key}: ${value}`);
  });
  
  const allIntegrityPassed = Object.values(dataIntegrity).every(v => v);
  
  if (allIntegrityPassed) {
    console.log('\n🎉 ALL NEW STRUCTURE INTEGRITY CHECKS PASSED!');
    console.log('✅ New issues object format handled correctly');
    console.log('✅ Proper mapping: warnings → medium, informational → info');
    console.log('✅ Total calculation correct');
  } else {
    console.log('\n❌ NEW STRUCTURE INTEGRITY ISSUES DETECTED!');
    console.log('New data structure not handled properly');
  }
  
  console.log('\n🚀 STEP 2: Testing buildPromptData with new structure');
  console.log('-'.repeat(40));
  
  const promptData = AiScriptService.buildPromptData(mockAuditData);
  
  console.log('\n✅ buildPromptData completed');
  console.log('Results:');
  console.log(`  Critical Issues: ${promptData.issueDistribution.critical}`);
  console.log(`  Medium Issues: ${promptData.issueDistribution.medium}`);
  console.log(`  Info Issues: ${promptData.issueDistribution.info}`);
  console.log(`  Total Issues: ${promptData.issueDistribution.total}`);
  console.log(`  AI Score: ${promptData.scores.aiVisibility}`);
  console.log(`  Overall Score: ${promptData.scores.overall}`);
  
  // Verify prompt data integrity for new structure
  const promptIntegrity = {
    criticalCorrect: promptData.issueDistribution.critical === 521,
    mediumCorrect: promptData.issueDistribution.medium === 185,
    infoCorrect: promptData.issueDistribution.info === 142,
    totalCorrect: promptData.issueDistribution.total === 848,
    aiVisibilityCorrect: promptData.scores.aiVisibility === 46,
    overallCorrect: promptData.scores.overall === 50
  };
  
  console.log('\n🔍 PROMPT DATA INTEGRITY CHECK (NEW STRUCTURE):');
  Object.entries(promptIntegrity).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`  ${status} ${key}: ${value}`);
  });
  
  const allPromptIntegrityPassed = Object.values(promptIntegrity).every(v => v);
  
  if (allPromptIntegrityPassed) {
    console.log('\n🎉 ALL PROMPT NEW STRUCTURE INTEGRITY CHECKS PASSED!');
    console.log('✅ buildPromptData handles new structure correctly');
    console.log('✅ Consistent mapping with buildAuditSnapshot');
  } else {
    console.log('\n❌ PROMPT NEW STRUCTURE INTEGRITY ISSUES DETECTED!');
  }
  
  console.log('\n🚀 STEP 3: Testing testScript function');
  console.log('-'.repeat(40));
  
  const testOutput = AiScriptService.testScript(auditSnapshot);
  console.log('Test Script Output:');
  console.log(testOutput);
  
  // Verify test script contains correct values
  const testScriptCorrect = testOutput.includes('Critical Issues: 521') &&
                          testOutput.includes('Medium Issues: 185') &&
                          testOutput.includes('Total Issues: 848') &&
                          testOutput.includes('AI Score: 46');
  
  console.log(`\n🔍 TEST SCRIPT INTEGRITY: ${testScriptCorrect ? '✅ PASSED' : '❌ FAILED'}`);
  
  console.log('\n🎯 OVERALL TEST RESULT:');
  console.log('='.repeat(60));
  
  const overallSuccess = allIntegrityPassed && allPromptIntegrityPassed && testScriptCorrect;
  
  if (overallSuccess) {
    console.log('🎉 SUCCESS: New data structure fix is working correctly!');
    console.log('✅ Issues object format handled properly');
    console.log('✅ Correct mapping: critical→critical, warnings→medium, informational→info');
    console.log('✅ Total calculation includes all issue types');
    console.log('✅ No more zero critical issues');
    console.log('✅ Consistent mapping across all methods');
  } else {
    console.log('❌ FAILURE: New data structure issues still exist');
    console.log('Check the integrity checks above for specific failures');
  }
  
  console.log('\n🔧 MAPPING SUMMARY:');
  console.log('Input:  issues.critical: 521');
  console.log('Output: issueDistribution.critical: 521');
  console.log('');
  console.log('Input:  issues.warnings: 185');
  console.log('Output: issueDistribution.medium: 185');
  console.log('');
  console.log('Input:  issues.informational: 142');
  console.log('Output: issueDistribution.info: 142');
  console.log('');
  console.log('Input:  issues.critical + warnings + informational = 848');
  console.log('Output: issueDistribution.total: 848');
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Test with real project data using the API');
  console.log('2. Verify the error is resolved');
  console.log('3. Check that script generation no longer fails');
  console.log('4. Monitor logs for "Using issues object format" message');
  
} catch (error) {
  console.error('❌ TEST FAILED:', error.message);
  console.error('Stack trace:', error.stack);
}
