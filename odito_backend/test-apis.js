/**
 * Simple API Test Runner
 * Tests the score-only architecture APIs
 */

// Import services using ES module syntax
import { ScoreOnlyResponseService } from './src/services/scoreOnlyResponse.service.js';
import { VideoDataService } from './src/services/videoData.service.js';

async function testAPIs() {
  console.log('🚀 Testing Score-Only Architecture APIs');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Test 1: Score-Only Response Validation
    console.log('\n🧪 Test 1: Score-Only Response Validation');
    
    const validResponse = {
      success: true,
      data: {
        page: 'overview',
        scores: { overall: 85, performance: 78, seo: 92 },
        issues: [{ title: 'Missing meta description', severity: 'high' }],
        metrics: { pageSpeed: 75, mobileScore: 80 }
      }
    };
    
    try {
      ScoreOnlyResponseService.validateScoreOnlyResponse(validResponse);
      console.log('✅ Valid response passed validation');
      passed++;
    } catch (error) {
      console.log('❌ Valid response failed validation:', error.message);
      failed++;
    }
    
    // Test 2: Script Content Blocking
    console.log('\n🧪 Test 2: Script Content Blocking');
    
    const scriptResponse = {
      success: true,
      script: 'This should be blocked',
      data: { scores: { overall: 85 } }
    };
    
    try {
      ScoreOnlyResponseService.validateScoreOnlyResponse(scriptResponse);
      console.log('❌ Script response was NOT blocked (FAIL)');
      failed++;
    } catch (error) {
      console.log('✅ Script response correctly blocked:', error.message);
      passed++;
    }
    
    // Test 3: Narration Content Blocking
    console.log('\n🧪 Test 3: Narration Content Blocking');
    
    const narrationResponse = {
      success: true,
      narration: 'This should be blocked',
      scores: { overall: 85 }
    };
    
    try {
      ScoreOnlyResponseService.validateScoreOnlyResponse(narrationResponse);
      console.log('❌ Narration response was NOT blocked (FAIL)');
      failed++;
    } catch (error) {
      console.log('✅ Narration response correctly blocked:', error.message);
      passed++;
    }
    
    // Test 4: Create Score-Only Response
    console.log('\n🧪 Test 4: Create Score-Only Response');
    
    try {
      const scoreResponse = ScoreOnlyResponseService.createScoreOnlyResponse(
        'overview',
        { overall: 85, performance: 78, seo: 92 },
        [{ title: 'Missing meta description', severity: 'high' }],
        { pageSpeed: 75, mobileScore: 80 }
      );
      
      console.log('✅ Score-only response created successfully');
      console.log('   Response structure:', JSON.stringify(scoreResponse, null, 2));
      passed++;
    } catch (error) {
      console.log('❌ Score-only response creation failed:', error.message);
      failed++;
    }
    
    // Test 5: Nested Script Detection
    console.log('\n🧪 Test 5: Nested Script Detection');
    
    const nestedScriptResponse = {
      success: true,
      data: {
        scores: { overall: 85 },
        auditSnapshot: {
          script: 'Hidden script that should be blocked',
          scores: { performance: 78 }
        }
      }
    };
    
    try {
      ScoreOnlyResponseService.validateScoreOnlyResponse(nestedScriptResponse);
      console.log('❌ Nested script was NOT detected (FAIL)');
      failed++;
    } catch (error) {
      console.log('✅ Nested script correctly detected:', error.message);
      passed++;
    }
    
    // Test 6: Complex Valid Response
    console.log('\n🧪 Test 6: Complex Valid Response');
    
    const complexResponse = {
      success: true,
      data: {
        page: 'technical',
        scores: { overall: 85, performance: 78, seo: 92, aiVisibility: 70 },
        issueDistribution: { critical: 2, high: 8, medium: 15, low: 5, total: 30 },
        topIssues: {
          high: ['Missing meta descriptions', 'Slow page load speed'],
          medium: ['Image alt text missing']
        },
        performanceMetrics: {
          mobileScore: 78,
          desktopScore: 85,
          lcp: '4.2',
          tbt: '1200'
        },
        technicalHighlights: {
          totalChecks: 45,
          criticalIssues: ['SSL certificate expired'],
          topRecommendations: ['Implement HTTPS']
        }
      }
    };
    
    try {
      ScoreOnlyResponseService.validateScoreOnlyResponse(complexResponse);
      console.log('✅ Complex valid response passed validation');
      passed++;
    } catch (error) {
      console.log('❌ Complex valid response failed validation:', error.message);
      failed++;
    }
    
    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Total Tests: ${passed + failed}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    
    if (failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Score-only architecture is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the implementation.');
    }
    
    return { passed, failed, total: passed + failed, success: failed === 0 };
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    return { passed: 0, failed: 1, total: 1, success: false, error: error.message };
  }
}

// Run the tests
testAPIs().then(results => {
  console.log('\n=== FINAL RESULTS ===');
  console.log('Success:', results.success);
  console.log('Passed:', results.passed, '/', results.total);
  process.exit(results.success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
