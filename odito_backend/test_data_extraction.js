/**
 * Test Script for Data Extraction Verification
 * Tests and logs raw data from Page 08, Page 10, and Performance
 * DO NOT integrate - ONLY test and log
 */

import { UnifiedJsonService } from './src/modules/pdf/service/unifiedJsonService.js';

console.log('🔍 TESTING DATA EXTRACTION VERIFICATION');
console.log('='.repeat(70));

// Test with a real project ID (you can change this)
const testProjectId = '69bd4440b9f78e5bd946750b';

async function testDataExtraction() {
  try {
    console.log(`🚀 Testing data extraction for project: ${testProjectId}`);
    console.log('-'.repeat(50));
    
    // Step 1: Get raw audit data
    console.log('🔍 STEP 1: GETTING RAW AUDIT DATA');
    console.log('-'.repeat(40));
    
    const auditData = await UnifiedJsonService.getFullReportJson(testProjectId);
    
    if (!auditData) {
      console.error('❌ No audit data found for project');
      return;
    }
    
    // 🎯 STEP 1: LOG RAW DATA
    console.log('\n🎯 STEP 1: LOG RAW DATA');
    console.log('='.repeat(50));
    
    console.log("FULL DATA:", JSON.stringify(auditData, null, 2));
    
    console.log("\nPAGE 08 RAW:", JSON.stringify(auditData.pages?.page08 || auditData.page08, null, 2));
    console.log("\nPAGE 10 RAW:", JSON.stringify(auditData.pages?.page10 || auditData.page10, null, 2));
    console.log("\nPERFORMANCE RAW:", JSON.stringify(auditData.performance, null, 2));
    
    // 🔍 STEP 2: TEST PAGE 08 (TOP ISSUES)
    console.log('\n🔍 STEP 2: TEST PAGE 08 (TOP ISSUES)');
    console.log('-'.repeat(40));
    
    const page08 = auditData.pages?.page08 || auditData.page08 || {};
    
    console.log("🔍 Page08 keys:", Object.keys(page08));
    console.log("🔍 Page08 type:", typeof page08);
    console.log("🔍 Page08 isArray:", Array.isArray(page08));
    
    // Test different possible structures
    console.log("\n--- Testing Page08 Structures ---");
    console.log("page08.criticalIssues:", page08.criticalIssues);
    console.log("page08.highIssues:", page08.highIssues);
    console.log("page08.mediumIssues:", page08.mediumIssues);
    console.log("page08.infoIssues:", page08.infoIssues);
    console.log("page08.lowIssues:", page08.lowIssues);
    console.log("page08.critical:", page08.critical);
    console.log("page08.high:", page08.high);
    console.log("page08.medium:", page08.medium);
    console.log("page08.info:", page08.info);
    console.log("page08.low:", page08.low);
    
    // Test if page08 has nested structures
    if (page08.issues) {
      console.log("page08.issues:", page08.issues);
      console.log("page08.issues.critical:", page08.issues.critical);
      console.log("page08.issues.high:", page08.issues.high);
      console.log("page08.issues.medium:", page08.issues.medium);
    }
    
    const extractOne = (arr) => {
      if (!arr) return null;
      if (Array.isArray(arr) && arr.length > 0) return arr[0];
      if (typeof arr === 'object' && arr.title) return arr;
      return null;
    };
    
    const topIssuesTest = {
      high: extractOne(page08?.highIssues || page08?.high || []),
      medium: extractOne(page08?.mediumIssues || page08?.medium || []),
      info: extractOne(page08?.infoIssues || page08?.low || page08?.informational || [])
    };
    
    console.log("\n✅ TEST Top Issues:", topIssuesTest);
    
    if (!topIssuesTest.high && !topIssuesTest.medium && !topIssuesTest.info) {
      console.warn("❌ Page08 data not found OR wrong path");
      console.warn("Available keys:", Object.keys(page08));
      
      // Try alternative paths
      if (auditData.issues) {
        console.log("Trying auditData.issues as fallback:", auditData.issues);
      }
    }
    
    // 🔍 STEP 3: TEST PAGE 10 (TECHNICAL CHECKS)
    console.log('\n🔍 STEP 3: TEST PAGE 10 (TECHNICAL CHECKS)');
    console.log('-'.repeat(40));
    
    const page10 = auditData.pages?.page10 || auditData.page10 || {};
    
    console.log("🔍 Page10 keys:", Object.keys(page10));
    console.log("🔍 Page10 type:", typeof page10);
    console.log("🔍 Page10 isArray:", Array.isArray(page10));
    
    // Test different possible structures
    console.log("\n--- Testing Page10 Structures ---");
    console.log("page10.checks:", page10.checks);
    console.log("page10.technicalChecks:", page10.technicalChecks);
    console.log("page10.criticalFindings:", page10.criticalFindings);
    console.log("page10.criticalIssues:", page10.criticalIssues);
    console.log("page10.findings:", page10.findings);
    console.log("page10.issues:", page10.issues);
    console.log("page10.recommendations:", page10.recommendations);
    console.log("page10.suggestions:", page10.suggestions);
    
    // Test if page10 has nested structures
    if (page10.technical) {
      console.log("page10.technical:", page10.technical);
      console.log("page10.technical.checks:", page10.technical.checks);
    }
    
    const technicalChecks = page10?.checks || page10?.technicalChecks || page10?.criticalFindings || page10?.findings || page10?.issues || [];
    
    console.log("\n📊 Total Technical Checks:", technicalChecks.length);
    console.log("📊 Technical Checks Type:", typeof technicalChecks);
    console.log("📊 Technical Checks IsArray:", Array.isArray(technicalChecks));
    
    const selectedChecks = Array.isArray(technicalChecks) ? technicalChecks.slice(0, 12) : [];
    
    console.log("✅ Selected Technical Checks:", selectedChecks);
    
    if (technicalChecks.length === 0) {
      console.warn("❌ No technical checks found in page10");
      console.warn("Available keys:", Object.keys(page10));
      
      // Try alternative paths
      if (auditData.recommendations) {
        console.log("Trying auditData.recommendations as fallback:", auditData.recommendations);
      }
    }
    
    // 🔍 STEP 4: TEST PERFORMANCE METRICS
    console.log('\n🔍 STEP 4: TEST PERFORMANCE METRICS');
    console.log('-'.repeat(40));
    
    const perf = auditData.performance || {};
    
    console.log("🔍 Performance keys:", Object.keys(perf));
    console.log("🔍 Performance type:", typeof perf);
    
    // Test different possible structures
    console.log("\n--- Testing Performance Structures ---");
    console.log("perf.score:", perf.score);
    console.log("perf.categories:", perf.categories);
    console.log("perf.stats:", perf.stats);
    console.log("perf.desktop:", perf.desktop);
    console.log("perf.mobile:", perf.mobile);
    console.log("perf.audits:", perf.audits);
    console.log("perf.lighthouse:", perf.lighthouse);
    
    // Test nested structures
    if (perf.stats) {
      console.log("\n--- perf.stats Details ---");
      console.log("perf.stats.mobileScore:", perf.stats.mobileScore);
      console.log("perf.stats.desktopScore:", perf.stats.desktopScore);
      console.log("perf.stats.mobileLCP:", perf.stats.mobileLCP);
      console.log("perf.stats.mobileFCP:", perf.stats.mobileFCP);
      console.log("perf.stats.mobileTBT:", perf.stats.mobileTBT);
      console.log("perf.stats.mobileCLS:", perf.stats.mobileCLS);
      console.log("perf.stats.desktopLCP:", perf.stats.desktopLCP);
      console.log("perf.stats.desktopFCP:", perf.stats.desktopFCP);
      console.log("perf.stats.desktopTBT:", perf.stats.desktopTBT);
      console.log("perf.stats.desktopCLS:", perf.stats.desktopCLS);
    }
    
    // Test categories structure
    if (perf.categories) {
      console.log("\n--- perf.categories Details ---");
      console.log("perf.categories.performance:", perf.categories.performance);
      console.log("perf.categories.performance.score:", perf.categories.performance?.score);
    }
    
    // Test audits structure
    if (perf.audits) {
      console.log("\n--- perf.audits Details ---");
      const auditKeys = Object.keys(perf.audits);
      console.log("Available audits:", auditKeys);
      
      // Look for specific metrics
      const fcpAudit = perf.audits['first-contentful-paint'] || perf.audits['firstContentfulPaint'];
      const lcpAudit = perf.audits['largest-contentful-paint'] || perf.audits['largestContentfulPaint'];
      const tbtAudit = perf.audits['total-blocking-time'] || perf.audits['totalBlockingTime'];
      const clsAudit = perf.audits['cumulative-layout-shift'] || perf.audits['cumulativeLayoutShift'];
      
      console.log("FCP Audit:", fcpAudit);
      console.log("LCP Audit:", lcpAudit);
      console.log("TBT Audit:", tbtAudit);
      console.log("CLS Audit:", clsAudit);
    }
    
    const performanceTest = {
      mobileScore: perf?.stats?.mobileScore || perf?.categories?.performance?.score || 0,
      desktopScore: perf?.stats?.desktopScore || perf?.categories?.performance?.score || 0,
      
      mobileLCP: perf?.stats?.mobileLCP?.display_value || perf?.audits?.['largest-contentful-paint']?.displayValue || "N/A",
      mobileFCP: perf?.stats?.mobileFCP?.display_value || perf?.audits?.['first-contentful-paint']?.displayValue || "N/A",
      
      desktopLCP: perf?.stats?.desktopLCP?.display_value || perf?.audits?.['largest-contentful-paint']?.displayValue || "N/A",
      desktopFCP: perf?.stats?.desktopFCP?.display_value || perf?.audits?.['first-contentful-paint']?.displayValue || "N/A"
    };
    
    console.log("\n✅ Performance Test:", performanceTest);
    
    // 🔍 STEP 5: FINAL TEST OUTPUT
    console.log('\n🔍 STEP 5: FINAL TEST OUTPUT');
    console.log('='.repeat(50));
    
    console.log(`
================ FINAL TEST RESULT ================

Top Issues:
High: ${topIssuesTest.high ? "FOUND" : "MISSING"}
Medium: ${topIssuesTest.medium ? "FOUND" : "MISSING"}
Info: ${topIssuesTest.info ? "FOUND" : "MISSING"}

Technical Checks:
Count: ${technicalChecks.length}
Type: ${typeof technicalChecks}
IsArray: ${Array.isArray(technicalChecks)}

Performance:
Mobile Score: ${performanceTest.mobileScore}
Desktop Score: ${performanceTest.desktopScore}
Mobile LCP: ${performanceTest.mobileLCP}
Mobile FCP: ${performanceTest.mobileFCP}
Desktop LCP: ${performanceTest.desktopLCP}
Desktop FCP: ${performanceTest.desktopFCP}

==================================================
    `);
    
    // 🎯 EXPECTED RESULT VERIFICATION
    console.log('\n🎯 EXPECTED RESULT VERIFICATION:');
    console.log('-'.repeat(40));
    
    const findings = {
      page08HasData: Object.keys(page08).length > 0,
      page10HasData: Object.keys(page10).length > 0,
      performanceHasData: Object.keys(perf).length > 0,
      technicalChecksFound: technicalChecks.length > 0,
      performanceScoresFound: performanceTest.mobileScore > 0 || performanceTest.desktopScore > 0,
      lcpValuesFound: performanceTest.mobileLCP !== "N/A" || performanceTest.desktopLCP !== "N/A"
    };
    
    console.log("🔍 Findings:");
    Object.entries(findings).forEach(([key, value]) => {
      const status = value ? '✅' : '❌';
      console.log(`  ${status} ${key}: ${value}`);
    });
    
    console.log('\n🎯 DATA STRUCTURE ANALYSIS:');
    console.log(`Page08 Structure: ${Object.keys(page08).join(', ')}`);
    console.log(`Page10 Structure: ${Object.keys(page10).join(', ')}`);
    console.log(`Performance Structure: ${Object.keys(perf).join(', ')}`);
    
    console.log('\n🚀 RECOMMENDATIONS FOR IMPLEMENTATION:');
    if (findings.page08HasData) {
      console.log('✅ Page08 has data - use identified keys for extraction');
    } else {
      console.log('⚠️ Page08 empty - implement fallback to auditData.issues');
    }
    
    if (findings.page10HasData) {
      console.log('✅ Page10 has data - use identified keys for extraction');
    } else {
      console.log('⚠️ Page10 empty - implement fallback to auditData.recommendations');
    }
    
    if (findings.performanceHasData) {
      console.log('✅ Performance has data - use identified paths for metrics');
    } else {
      console.log('⚠️ Performance empty - implement fallback to default values');
    }
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testDataExtraction();
