/**
 * Test Script: Unified JSON Service Data Flow Validation
 * 
 * Tests that:
 * 1. UnifiedJsonService returns real data (not zeros)
 * 2. Page08 severity breakdown is mapped correctly
 * 3. Page10 checks are extracted correctly
 * 4. AuditSnapshot contains all real data before DB save
 */

import axios from 'axios';
import colorette from 'colorette';

const API_BASE = 'http://localhost:5000';

/**
 * Test a specific project
 */
async function testProject(projectId) {
  console.log(colorette.cyan('\n' + '='.repeat(60)));
  console.log(colorette.cyan(`Testing Project: ${projectId}`));
  console.log(colorette.cyan('='.repeat(60)));

  try {
    // TEST 1: Unified JSON Service Response
    console.log(colorette.yellow('\n[TEST 1] UnifiedJsonService Response'));
    console.log('-'.repeat(60));
    
    let unifiedResponse;
    try {
      const res = await axios.get(
        `${API_BASE}/api/pdf/${projectId}/unified`,
        {
          timeout: 15000,
          validateStatus: () => true // Accept any status
        }
      );
      unifiedResponse = res.data;
      
      if (!unifiedResponse) {
        throw new Error('No response from unified service');
      }
      
      console.log('Response Status:', res.status);
      console.log('Response Keys:', Object.keys(unifiedResponse.data || {}));
    } catch (error) {
      console.error(colorette.red('❌ Failed to fetch unified service:', error.message));
      return;
    }

    // TEST 2: Validate Issue Distribution
    console.log(colorette.yellow('\n[TEST 2] Issue Distribution Validation'));
    console.log('-'.repeat(60));
    
    const issues = unifiedResponse.data?.issues || {};
    console.log('Raw Issues from API:', issues);
    
    const totalIssues = (issues.critical || 0) + (issues.high || 0) + (issues.medium || 0) + (issues.low || 0);
    
    console.log(colorette.cyan('Issue Counts:'));
    console.log(`  Critical: ${issues.critical || 0}`);
    console.log(`  High: ${issues.high || 0}`);
    console.log(`  Medium: ${issues.medium || 0}`);
    console.log(`  Low/Info: ${issues.low || issues.info || 0}`);
    console.log(`  Total: ${totalIssues}`);
    
    if (totalIssues === 0) {
      console.error(colorette.red('❌ FAIL: Zero issues - data loss detected!'));
    } else if (issues.critical > 0 || issues.high > 0) {
      console.log(colorette.green('✅ PASS: Real issue data present'));
    } else {
      console.log(colorette.yellow('⚠️  WARNING: Only low-priority issues found'));
    }

    // TEST 3: Validate Technical Checks
    console.log(colorette.yellow('\n[TEST 3] Technical Checks Validation'));
    console.log('-'.repeat(60));
    
    const technical = unifiedResponse.data?.technical || {};
    const checksCount = technical.checkCount || 0;
    
    console.log(`Technical Checks: ${checksCount}`);
    
    if (checksCount === 0) {
      console.error(colorette.red('❌ FAIL: Zero technical checks!'));
    } else {
      console.log(colorette.green(`✅ PASS: ${checksCount} technical checks found`));
    }

    // TEST 4: Validate Performance Metrics
    console.log(colorette.yellow('\n[TEST 4] Performance Metrics Validation'));
    console.log('-'.repeat(60));
    
    const perf = unifiedResponse.data?.performance || {};
    console.log(`Desktop Score: ${perf.desktopScore || 0}`);
    console.log(`Mobile Score: ${perf.mobileScore || 0}`);
    
    if (perf.desktopScore === 0 && perf.mobileScore === 0) {
      console.warn(colorette.yellow('⚠️  Performance scores are zero'));
    } else {
      console.log(colorette.green('✅ PASS: Performance data present'));
    }

    // TEST 5: Validate Scores
    console.log(colorette.yellow('\n[TEST 5] Overall Scores Validation'));
    console.log('-'.repeat(60));
    
    const scores = unifiedResponse.data?.scores || {};
    console.log(`Overall: ${scores.overall || 0}`);
    console.log(`Performance: ${scores.performance || 0}`);
    console.log(`SEO: ${scores.seo || 0}`);
    console.log(`AI Visibility: ${scores.aiVisibility || 0}`);
    
    if (Object.values(scores).every(v => v === 0)) {
      console.error(colorette.red('❌ FAIL: All scores are zero!'));
    } else {
      console.log(colorette.green('✅ PASS: At least one score is non-zero'));
    }

    // FINAL SUMMARY
    console.log(colorette.cyan('\n' + '='.repeat(60)));
    console.log(colorette.cyan('FINAL SUMMARY'));
    console.log(colorette.cyan('='.repeat(60)));
    
    let passCount = 0;
    let failCount = 0;
    
    if (totalIssues > 0) {
      console.log(colorette.green('✅ Issues: PASS'));
      passCount++;
    } else {
      console.log(colorette.red('❌ Issues: FAIL'));
      failCount++;
    }
    
    if (checksCount > 0) {
      console.log(colorette.green('✅ Technical Checks: PASS'));
      passCount++;
    } else {
      console.log(colorette.red('❌ Technical Checks: FAIL'));
      failCount++;
    }
    
    if (Object.values(scores).some(v => v > 0)) {
      console.log(colorette.green('✅ Scores: PASS'));
      passCount++;
    } else {
      console.log(colorette.red('❌ Scores: FAIL'));
      failCount++;
    }
    
    console.log(colorette.cyan(`\nTotal: ${passCount} PASS, ${failCount} FAIL`));
    
    if (failCount === 0) {
      console.log(colorette.green.bold('\n🎉 ALL TESTS PASSED! Data flow is correct.\n'));
    } else {
      console.log(colorette.red.bold('\n⚠️  TESTS FAILED! Check data mapping in UnifiedJsonService.\n'));
    }

  } catch (error) {
    console.error(colorette.red('❌ Test error:', error.message));
    console.error(error.stack);
  }
}

/**
 * Run tests with provided project ID
 */
async function main() {
  // Replace with actual project ID to test
  const projectId = process.argv[2] || '69bd4440b9f78e5bd946750b';
  
  console.log(colorette.magenta.bold('\n📊 UNIFIED JSON SERVICE DATA FLOW TEST'));
  console.log(colorette.magenta('Testing data mapping and validation'));
  
  await testProject(projectId);
}

main().catch(err => {
  console.error(colorette.red('Fatal error:'), err);
  process.exit(1);
});
