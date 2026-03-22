/**
 * Test Script for Data Overwrite Fix Verification
 * Tests the complete snapshot lifecycle with overwrite detection
 */

import { AiScriptService } from './src/modules/aiVideo/services/aiScript.service.js';

console.log('🔍 TESTING DATA OVERWRITE FIX');
console.log('='.repeat(60));

// Mock data with real values
const mockAuditData = {
  project: {
    name: "Overwrite Test Website",
    url: "https://overwrite-test.com"
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

console.log('📋 Testing with mock data containing real values...');
console.log('Expected: critical=47, total=521, aiVisibility=82');

try {
  console.log('\n🚀 STEP 1: Testing buildAuditSnapshot');
  console.log('-'.repeat(40));
  
  const auditSnapshot = AiScriptService.buildAuditSnapshot(mockAuditData);
  
  console.log('\n✅ buildAuditSnapshot completed');
  console.log('Results:');
  console.log(`  Critical Issues: ${auditSnapshot.issueDistribution.critical}`);
  console.log(`  Total Issues: ${auditSnapshot.issueDistribution.total}`);
  console.log(`  AI Score: ${auditSnapshot.scores.aiVisibility}`);
  console.log(`  Overall Score: ${auditSnapshot.scores.overall}`);
  console.log(`  Project Name: ${auditSnapshot.projectName}`);
  console.log(`  Frozen: ${Object.isFrozen(auditSnapshot)}`);
  
  // Verify data integrity
  const dataIntegrity = {
    criticalCorrect: auditSnapshot.issueDistribution.critical === 47,
    totalCorrect: auditSnapshot.issueDistribution.total === 521,
    aiVisibilityCorrect: auditSnapshot.scores.aiVisibility === 82,
    overallCorrect: auditSnapshot.scores.overall === 75,
    projectCorrect: auditSnapshot.projectName === "Overwrite Test Website",
    isFrozen: Object.isFrozen(auditSnapshot)
  };
  
  console.log('\n🔍 DATA INTEGRITY CHECK:');
  Object.entries(dataIntegrity).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`  ${status} ${key}: ${value}`);
  });
  
  const allIntegrityPassed = Object.values(dataIntegrity).every(v => v);
  
  if (allIntegrityPassed) {
    console.log('\n🎉 ALL DATA INTEGRITY CHECKS PASSED!');
    console.log('✅ No data overwrite detected');
    console.log('✅ Values preserved correctly');
    console.log('✅ Object properly frozen');
  } else {
    console.log('\n❌ DATA INTEGRITY ISSUES DETECTED!');
    console.log('Some values were overwritten or incorrect');
  }
  
  console.log('\n🚀 STEP 2: Testing buildPromptData');
  console.log('-'.repeat(40));
  
  const promptData = AiScriptService.buildPromptData(mockAuditData);
  
  console.log('\n✅ buildPromptData completed');
  console.log('Results:');
  console.log(`  Critical Issues: ${promptData.issueDistribution.critical}`);
  console.log(`  Total Issues: ${promptData.issueDistribution.total}`);
  console.log(`  AI Score: ${promptData.scores.aiVisibility}`);
  console.log(`  Overall Score: ${promptData.scores.overall}`);
  console.log(`  Project Name: ${promptData.projectName}`);
  
  // Verify prompt data integrity
  const promptIntegrity = {
    criticalCorrect: promptData.issueDistribution.critical === 47,
    totalCorrect: promptData.issueDistribution.total === 521,
    aiVisibilityCorrect: promptData.scores.aiVisibility === 82,
    overallCorrect: promptData.scores.overall === 75,
    projectCorrect: promptData.projectName === "Overwrite Test Website"
  };
  
  console.log('\n🔍 PROMPT DATA INTEGRITY CHECK:');
  Object.entries(promptIntegrity).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`  ${status} ${key}: ${value}`);
  });
  
  const allPromptIntegrityPassed = Object.values(promptIntegrity).every(v => v);
  
  if (allPromptIntegrityPassed) {
    console.log('\n🎉 ALL PROMPT DATA INTEGRITY CHECKS PASSED!');
    console.log('✅ No data overwrite in buildPromptData');
    console.log('✅ Consistent mapping with buildAuditSnapshot');
  } else {
    console.log('\n❌ PROMPT DATA INTEGRITY ISSUES DETECTED!');
    console.log('Some values were overwritten in buildPromptData');
  }
  
  console.log('\n🚀 STEP 3: Testing testScript function');
  console.log('-'.repeat(40));
  
  const testOutput = AiScriptService.testScript(auditSnapshot);
  console.log('Test Script Output:');
  console.log(testOutput);
  
  // Verify test script contains correct values
  const testScriptCorrect = testOutput.includes('Critical Issues: 47') &&
                          testOutput.includes('Total Issues: 521') &&
                          testOutput.includes('AI Score: 82') &&
                          testOutput.includes('Overall Score: 75');
  
  console.log(`\n🔍 TEST SCRIPT INTEGRITY: ${testScriptCorrect ? '✅ PASSED' : '❌ FAILED'}`);
  
  console.log('\n🎯 OVERALL TEST RESULT:');
  console.log('='.repeat(60));
  
  const overallSuccess = allIntegrityPassed && allPromptIntegrityPassed && testScriptCorrect;
  
  if (overallSuccess) {
    console.log('🎉 SUCCESS: Data overwrite fix is working correctly!');
    console.log('✅ All values preserved throughout the pipeline');
    console.log('✅ No data loss detected');
    console.log('✅ Consistent mapping across all methods');
    console.log('✅ Object freeze protection active');
  } else {
    console.log('❌ FAILURE: Data overwrite issues still exist');
    console.log('Check the integrity checks above for specific failures');
  }
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Test with real project data using the API');
  console.log('2. Monitor console logs for lifecycle tracking');
  console.log('3. Verify database contains correct values');
  console.log('4. Check that script generation uses real data');
  
} catch (error) {
  console.error('❌ TEST FAILED:', error.message);
  console.error('Stack trace:', error.stack);
}
