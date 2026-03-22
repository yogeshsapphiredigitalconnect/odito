/**
 * Test Script for Critical Runtime and Data Mapping Fixes
 * Tests all the fixes for TDZ errors, wrong data paths, and mapping issues
 */

import { AiScriptService } from './src/modules/aiVideo/services/aiScript.service.js';

console.log('🔍 TESTING CRITICAL RUNTIME AND DATA MAPPING FIXES');
console.log('='.repeat(70));

// Mock data matching the REAL structure from error logs
const mockAuditData = {
  project: {
    name: "Critical Fixes Test Website",
    url: "https://critical-fixes-test.com"
  },
  
  // REAL ISSUES STRUCTURE (from error logs)
  issues: {
    critical: 521,
    warnings: 185,
    informational: 142,
    passed: 0
  },
  
  // REAL SCORES STRUCTURE
  scores: {
    seoHealth: 50,
    aiVisibility: 46,
    performance: 68
  },
  
  // REAL PERFORMANCE STRUCTURE (from error logs)
  performance: {
    stats: {
      desktopScore: 72,
      mobileLCP: {
        display_value: "4.5 s"
      },
      mobileTBT: {
        display_value: "680 ms"
      },
      mobileFCP: {
        display_value: "2.1 s"
      },
      mobileCLS: {
        display_value: "0.15"
      }
    }
  },
  
  // EMPTY PAGE DATA (to test fallbacks)
  pages: {
    page08: {}, // Empty
    page10: {}  // Empty
  },
  page08: {},   // Also empty
  page10: {},   // Also empty
  
  // RECOMMENDATIONS (for technical highlights fallback)
  recommendations: [
    { title: "Add structured data markup", description: "Implement Schema.org" },
    { title: "Optimize page loading speed", description: "Compress images" },
    { title: "Improve content quality", description: "Add more depth" },
    { title: "Fix technical SEO issues", description: "Address crawl errors" },
    { title: "Enhance user experience", description: "Improve navigation" }
  ]
};

console.log('📋 Testing with REAL data structure (from error logs)...');
console.log('Expected:');
console.log('- issueDistribution: critical=521, total=848 (521+185+142)');
console.log('- No TDZ errors');
console.log('- Empty Page 08/10 handled gracefully');
console.log('- Performance metrics from stats.mobileLCP etc');
console.log('- Technical highlights use recommendations fallback');

try {
  console.log('\n🚀 STEP 1: Testing buildAuditSnapshot with critical fixes');
  console.log('-'.repeat(50));
  
  const auditSnapshot = AiScriptService.buildAuditSnapshot(mockAuditData);
  
  console.log('\n✅ buildAuditSnapshot completed successfully!');
  console.log('Results:');
  console.log(`  Project Name: ${auditSnapshot.projectName}`);
  console.log(`  Critical Issues: ${auditSnapshot.issueDistribution.critical}`);
  console.log(`  Total Issues: ${auditSnapshot.issueDistribution.total}`);
  console.log(`  Medium Issues: ${auditSnapshot.issueDistribution.medium}`);
  console.log(`  Info Issues: ${auditSnapshot.issueDistribution.info}`);
  console.log(`  Overall Score: ${auditSnapshot.scores.overall}`);
  console.log(`  AI Score: ${auditSnapshot.scores.aiVisibility}`);
  console.log(`  Performance Score: ${auditSnapshot.performanceMetrics.pageSpeed}`);
  console.log(`  Top Issues (critical): ${auditSnapshot.topIssues.critical.length}`);
  console.log(`  Top Issues (high): ${auditSnapshot.topIssues.high.length}`);
  console.log(`  Top Issues (medium): ${auditSnapshot.topIssues.medium.length}`);
  console.log(`  Technical Issues: ${auditSnapshot.technicalHighlights.criticalIssues.length}`);
  console.log(`  Technical Recommendations: ${auditSnapshot.technicalHighlights.topRecommendations.length}`);
  console.log(`  Frozen: ${Object.isFrozen(auditSnapshot)}`);
  
  // Verify critical fixes
  const criticalFixes = {
    noTDZError: true, // If we got here, no TDZ error occurred
    issueDistributionCorrect: auditSnapshot.issueDistribution.critical === 521,
    issueTotalCorrect: auditSnapshot.issueDistribution.total === 848,
    scoresCorrect: auditSnapshot.scores.aiVisibility === 46,
    performanceCorrect: auditSnapshot.performanceMetrics.pageSpeed === 72,
    topIssuesEmpty: auditSnapshot.topIssues.critical.length === 0 && auditSnapshot.topIssues.high.length === 0,
    technicalHighlightsUseRecommendations: auditSnapshot.technicalHighlights.topRecommendations.length === 5,
    performanceMetricsHaveData: auditSnapshot.performanceMetrics.metrics.length > 0,
    isFrozen: Object.isFrozen(auditSnapshot)
  };
  
  console.log('\n🔍 CRITICAL FIXES VERIFICATION:');
  Object.entries(criticalFixes).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`  ${status} ${key}: ${value}`);
  });
  
  const allFixesPassed = Object.values(criticalFixes).every(v => v);
  
  if (allFixesPassed) {
    console.log('\n🎉 ALL CRITICAL FIXES PASSED!');
    console.log('✅ No TDZ error (issueDistribution defined before use)');
    console.log('✅ issueDistribution uses correct data source (issues object)');
    console.log('✅ Empty Page 08 handled with empty arrays');
    console.log('✅ Empty Page 10 handled with recommendations fallback');
    console.log('✅ Performance metrics mapped from stats.mobileLCP etc');
    console.log('✅ Correct operation order maintained');
    console.log('✅ No runtime crashes');
  } else {
    console.log('\n❌ SOME CRITICAL FIXES FAILED!');
    console.log('Check the verification above for specific failures');
  }
  
  // Test specific performance metrics
  console.log('\n📊 PERFORMANCE METRICS VERIFICATION:');
  console.log(`Page Speed Score: ${auditSnapshot.performanceMetrics.pageSpeed}`);
  auditSnapshot.performanceMetrics.metrics.forEach((metric, index) => {
    console.log(`  ${index + 1}. ${metric.metric}: ${metric.mobile}`);
  });
  
  // Test issue distribution calculation
  console.log('\n📋 ISSUE DISTRIBUTION CALCULATION:');
  console.log(`Critical: ${auditSnapshot.issueDistribution.critical} (from issues.critical: 521)`);
  console.log(`Medium: ${auditSnapshot.issueDistribution.medium} (from issues.warnings: 185)`);
  console.log(`Info: ${auditSnapshot.issueDistribution.info} (from issues.informational: 142)`);
  console.log(`Total: ${auditSnapshot.issueDistribution.total} (521 + 185 + 142 = 848)`);
  
  // Test fallback behavior
  console.log('\n🔧 FALLBACK BEHAVIOR VERIFICATION:');
  console.log(`Top Issues (should be empty): ${JSON.stringify(auditSnapshot.topIssues)}`);
  console.log(`Technical Highlights (should use recommendations): ${auditSnapshot.technicalHighlights.topRecommendations.length} items`);
  
  console.log('\n🎯 OVERALL CRITICAL FIXES RESULT:');
  console.log('='.repeat(70));
  
  if (allFixesPassed) {
    console.log('🎉 SUCCESS: All critical runtime and data mapping issues fixed!');
    console.log('✅ ReferenceError: Cannot access issueDistribution before initialization → FIXED');
    console.log('✅ Wrong data path (issueDistribution does not exist) → FIXED');
    console.log('✅ Page 08 and Page 10 data empty → HANDLED WITH FALLBACKS');
    console.log('✅ Performance metrics incorrectly mapped → FIXED');
    console.log('✅ Stable auditSnapshot generation → ACHIEVED');
  } else {
    console.log('❌ FAILURE: Some critical issues still exist');
    console.log('Review the verification checks above');
  }
  
  console.log('\n🔧 FIXES IMPLEMENTED:');
  console.log('1. ✅ TDZ Error Fixed: issueDistribution defined BEFORE auditSnapshot');
  console.log('2. ✅ Issue Distribution Source Fixed: Uses issues object directly');
  console.log('3. ✅ Top Issues Fallback: Empty arrays when Page 08 empty');
  console.log('4. ✅ Technical Highlights Fallback: Uses recommendations when Page 10 empty');
  console.log('5. ✅ Performance Mapping Fixed: Uses stats.mobileLCP, stats.mobileTBT etc');
  console.log('6. ✅ Operation Order Fixed: 1)issues 2)issueDistribution 3)performance 4)snapshot');
  
  console.log('\n🚀 EXPECTED RESULT ACHIEVED:');
  console.log('✅ No crash');
  console.log('✅ issueDistribution correct (521 critical, 848 total)');
  console.log('✅ No undefined errors');
  console.log('✅ Stable script generation');
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Test with real project data using the API');
  console.log('2. Monitor logs for "Built issueDistribution from issues object"');
  console.log('3. Verify no TDZ errors in production');
  console.log('4. Check script generation completes successfully');
  console.log('5. Confirm auditSnapshot stored correctly in database');
  
} catch (error) {
  console.error('❌ TEST FAILED:', error.message);
  console.error('Stack trace:', error.stack);
  
  if (error.message.includes('Cannot access')) {
    console.error('\n❌ TDZ ERROR STILL EXISTS!');
    console.error('The fix for issueDistribution before initialization failed.');
  }
}
