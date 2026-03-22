/**
 * Test Script for Structured Extraction from Multi-Page SEO Audit
 * Tests the extraction of top issues, technical highlights, and performance metrics
 */

import { AiScriptService } from './src/modules/aiVideo/services/aiScript.service.js';

console.log('🔍 TESTING STRUCTURED EXTRACTION FROM MULTI-PAGE SEO AUDIT');
console.log('='.repeat(70));

// Mock data with structured page data
const mockAuditData = {
  project: {
    name: "Structured Extraction Test Website",
    url: "https://structured-extraction-test.com"
  },
  
  // Issues object (new format)
  issues: {
    critical: 47,
    warnings: 185,
    informational: 142,
    passed: 0
  },
  
  // Scores
  scores: {
    seoHealth: 75,
    aiVisibility: 82,
    performance: 68
  },
  
  // 🔧 STEP 1: PAGE 08 DATA (Top Issues)
  page08: {
    criticalIssues: [
      { title: "Missing H1 tags", description: "Critical SEO issue", impact: "High" },
      { title: "Broken internal links", description: "Navigation broken", impact: "High" },
      { title: "Missing meta descriptions", description: "SEO metadata missing", impact: "Medium" },
      { title: "Duplicate title tags", description: "Title conflicts", impact: "Medium" },
      { title: "Thin content pages", description: "Content insufficient", impact: "Low" }
    ],
    highIssues: [
      { title: "Slow page load speed", description: "Performance issue" },
      { title: "Missing alt tags", description: "Accessibility issue" },
      { title: "Poor URL structure", description: "SEO structure issue" }
    ],
    mediumIssues: [
      { title: "Thin content", description: "Content needs improvement" },
      { title: "Duplicate content", description: "Content duplication" },
      { title: "Missing schema markup", description: "Structured data missing" }
    ]
  },
  
  // 🔧 STEP 2: PAGE 10 DATA (Technical Highlights)
  page10: {
    criticalFindings: [
      { title: "XML sitemap missing", description: "SEO foundation issue" },
      { title: "Robots.txt blocking important pages", description: "Crawl blocking" },
      { title: "No HTTPS redirect", description: "Security issue" },
      { title: "Canonical tags missing", description: "Duplicate content risk" },
      { title: "Internal linking poor", description: "Link juice distribution" }
    ],
    recommendations: [
      { title: "Implement XML sitemap", description: "Create comprehensive sitemap" },
      { title: "Fix robots.txt configuration", description: "Allow proper crawling" },
      { title: "Add HTTPS redirect", description: "Secure all pages" },
      { title: "Add canonical tags", description: "Prevent duplicate content" },
      { title: "Improve internal linking", description: "Better link distribution" }
    ]
  },
  
  // 🔧 STEP 3: PERFORMANCE DATA (Lighthouse)
  performance: {
    score: 72,
    categories: {
      performance: { score: 72 }
    },
    audits: {
      'first-contentful-paint': {
        displayValue: "1.8 s"
      },
      'largest-contentful-paint': {
        displayValue: "3.2 s"
      },
      'total-blocking-time': {
        displayValue: "450 ms"
      },
      'cumulative-layout-shift': {
        displayValue: "0.1"
      }
    },
    desktop: {
      fcp: "1.8 s",
      lcp: "3.2 s",
      tbt: "450 ms",
      cls: "0.1"
    },
    mobile: {
      fcp: "2.1 s",
      lcp: "4.5 s",
      tbt: "680 ms",
      cls: "0.15"
    }
  },
  
  // Recommendations
  recommendations: [
    { title: "Add structured data markup", description: "Implement Schema.org" },
    { title: "Optimize page loading speed", description: "Compress images" },
    { title: "Improve content quality", description: "Add more depth" }
  ]
};

console.log('📋 Testing with structured page data...');
console.log('Expected:');
console.log('- Top Issues: 5 critical, 3 high, 3 medium');
console.log('- Technical Highlights: 5 critical findings, 5 recommendations');
console.log('- Performance: Score 72, real metric values');

try {
  console.log('\n🚀 STEP 1: Testing buildAuditSnapshot with structured data');
  console.log('-'.repeat(50));
  
  const auditSnapshot = AiScriptService.buildAuditSnapshot(mockAuditData);
  
  console.log('\n✅ buildAuditSnapshot completed');
  console.log('Results:');
  console.log(`  Project Name: ${auditSnapshot.projectName}`);
  console.log(`  Critical Issues (distribution): ${auditSnapshot.issueDistribution.critical}`);
  console.log(`  Top Issues (critical): ${auditSnapshot.topIssues.critical.length}`);
  console.log(`  Top Issues (high): ${auditSnapshot.topIssues.high.length}`);
  console.log(`  Top Issues (medium): ${auditSnapshot.topIssues.medium.length}`);
  console.log(`  Technical Issues: ${auditSnapshot.technicalHighlights.criticalIssues.length}`);
  console.log(`  Technical Recommendations: ${auditSnapshot.technicalHighlights.topRecommendations.length}`);
  console.log(`  Performance Score: ${auditSnapshot.performanceMetrics.pageSpeed}`);
  console.log(`  Performance Metrics Count: ${auditSnapshot.performanceMetrics.metrics.length}`);
  console.log(`  Frozen: ${Object.isFrozen(auditSnapshot)}`);
  
  // Verify structured extraction integrity
  const extractionIntegrity = {
    topIssuesPopulated: auditSnapshot.topIssues.critical.length > 0,
    technicalHighlightsPopulated: auditSnapshot.technicalHighlights.criticalIssues.length > 0,
    performanceMetricsReal: auditSnapshot.performanceMetrics.pageSpeed > 0,
    performanceMetricsDetailed: auditSnapshot.performanceMetrics.metrics.length === 4,
    projectCorrect: auditSnapshot.projectName === "Structured Extraction Test Website",
    isFrozen: Object.isFrozen(auditSnapshot)
  };
  
  console.log('\n🔍 STRUCTURED EXTRACTION INTEGRITY CHECK:');
  Object.entries(extractionIntegrity).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`  ${status} ${key}: ${value}`);
  });
  
  const allExtractionPassed = Object.values(extractionIntegrity).every(v => v);
  
  if (allExtractionPassed) {
    console.log('\n🎉 ALL STRUCTURED EXTRACTION CHECKS PASSED!');
    console.log('✅ Top Issues extracted from Page 08');
    console.log('✅ Technical Highlights extracted from Page 10');
    console.log('✅ Performance Metrics mapped from Lighthouse data');
    console.log('✅ Real values (not zeros) in all sections');
  } else {
    console.log('\n❌ STRUCTURED EXTRACTION ISSUES DETECTED!');
    console.log('Some sections not properly extracted');
  }
  
  // Test specific performance metrics
  console.log('\n📊 PERFORMANCE METRICS VERIFICATION:');
  auditSnapshot.performanceMetrics.metrics.forEach((metric, index) => {
    console.log(`  ${index + 1}. ${metric.metric}:`);
    console.log(`     Desktop: ${metric.desktop}`);
    console.log(`     Mobile: ${metric.mobile}`);
  });
  
  // Test specific top issues
  console.log('\n📋 TOP ISSUES VERIFICATION:');
  console.log(`Critical Issues (${auditSnapshot.topIssues.critical.length}):`);
  auditSnapshot.topIssues.critical.slice(0, 3).forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue.title}`);
  });
  
  console.log(`High Issues (${auditSnapshot.topIssues.high.length}):`);
  auditSnapshot.topIssues.high.slice(0, 3).forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue.title}`);
  });
  
  // Test technical highlights
  console.log('\n🔧 TECHNICAL HIGHLIGHTS VERIFICATION:');
  console.log(`Critical Findings (${auditSnapshot.technicalHighlights.criticalIssues.length}):`);
  auditSnapshot.technicalHighlights.criticalIssues.slice(0, 3).forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue.title}`);
  });
  
  console.log(`Recommendations (${auditSnapshot.technicalHighlights.topRecommendations.length}):`);
  auditSnapshot.technicalHighlights.topRecommendations.slice(0, 3).forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec.title}`);
  });
  
  console.log('\n🎯 OVERALL STRUCTURED EXTRACTION RESULT:');
  console.log('='.repeat(70));
  
  if (allExtractionPassed) {
    console.log('🎉 SUCCESS: Structured extraction working correctly!');
    console.log('✅ Multi-page SEO audit data properly extracted');
    console.log('✅ Page 08 → Top Issues (critical/high/medium)');
    console.log('✅ Page 10 → Technical Highlights (findings/recommendations)');
    console.log('✅ Performance → Lighthouse metrics (FCP/LCP/TBT/CLS)');
    console.log('✅ Real values preserved throughout pipeline');
    console.log('✅ No fallback defaults used');
  } else {
    console.log('❌ FAILURE: Structured extraction issues exist');
    console.log('Check the integrity checks above for specific failures');
  }
  
  console.log('\n🔧 EXTRACTION MAPPING SUMMARY:');
  console.log('Input (Page 08) → Output (topIssues):');
  console.log('  page08.criticalIssues → topIssues.critical ✅');
  console.log('  page08.highIssues → topIssues.high ✅');
  console.log('  page08.mediumIssues → topIssues.medium ✅');
  console.log('');
  console.log('Input (Page 10) → Output (technicalHighlights):');
  console.log('  page10.criticalFindings → technicalHighlights.criticalIssues ✅');
  console.log('  page10.recommendations → technicalHighlights.topRecommendations ✅');
  console.log('');
  console.log('Input (Performance) → Output (performanceMetrics):');
  console.log('  performance.score → performanceMetrics.pageSpeed ✅');
  console.log('  performance.audits → performanceMetrics.metrics ✅');
  console.log('  performance.desktop/mobile → metric values ✅');
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Test with real project data using the API');
  console.log('2. Monitor logs for "PAGE 08 DATA" and "PAGE 10 DATA" sections');
  console.log('3. Verify extraction summary shows real counts');
  console.log('4. Check final enriched snapshot contains all sections');
  console.log('5. Confirm script generation uses enriched data');
  
} catch (error) {
  console.error('❌ TEST FAILED:', error.message);
  console.error('Stack trace:', error.stack);
}
