/**
 * Complete API Test Suite
 * Runs all tests for the score-only architecture
 */

// Import test modules
import { ScoreOnlyResponseService } from './src/services/scoreOnlyResponse.service.js';
import { VideoDataService } from './src/services/videoData.service.js';

async function runCompleteAPITestSuite() {
  console.log('🚀 COMPLETE API TEST SUITE');
  console.log('Score-Only Architecture Validation');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  let totalPassed = 0;
  let totalFailed = 0;
  
  try {
    // Test Suite 1: Score-Only Response Validation
    console.log('\n📊 TEST SUITE 1: Score-Only Response Validation');
    console.log('-'.repeat(40));
    
    const validationTests = [
      {
        name: 'Valid score-only response',
        data: {
          success: true,
          data: {
            page: 'overview',
            scores: { overall: 85, performance: 78, seo: 92 },
            issues: [{ title: 'Missing meta description', severity: 'high' }],
            metrics: { pageSpeed: 75, mobileScore: 80 }
          }
        },
        shouldPass: true
      },
      {
        name: 'Script field blocking',
        data: { success: true, script: 'Should be blocked' },
        shouldPass: false
      },
      {
        name: 'Narration field blocking',
        data: { success: true, narration: 'Should be blocked' },
        shouldPass: false
      },
      {
        name: 'Nested script detection',
        data: {
          success: true,
          data: {
            scores: { overall: 85 },
            auditSnapshot: { script: 'Hidden script' }
          }
        },
        shouldPass: false
      }
    ];
    
    let validationPassed = 0;
    let validationFailed = 0;
    
    for (const test of validationTests) {
      try {
        ScoreOnlyResponseService.validateScoreOnlyResponse(test.data);
        if (test.shouldPass) {
          console.log(`✅ ${test.name}`);
          validationPassed++;
        } else {
          console.log(`❌ ${test.name} - Should have failed`);
          validationFailed++;
        }
      } catch (error) {
        if (!test.shouldPass) {
          console.log(`✅ ${test.name} - Correctly blocked`);
          validationPassed++;
        } else {
          console.log(`❌ ${test.name} - Unexpected failure: ${error.message}`);
          validationFailed++;
        }
      }
    }
    
    console.log(`Validation Tests: ${validationPassed}/${validationTests.length} passed`);
    totalPassed += validationPassed;
    totalFailed += validationFailed;
    
    // Test Suite 2: Score-Only Response Creation
    console.log('\n📊 TEST SUITE 2: Score-Only Response Creation');
    console.log('-'.repeat(40));
    
    try {
      const response = ScoreOnlyResponseService.createScoreOnlyResponse(
        'overview',
        { overall: 85, performance: 78, seo: 92 },
        [{ title: 'Issue', severity: 'high' }],
        { pageSpeed: 75 }
      );
      
      console.log('✅ Score-only response created');
      console.log('   Structure:', Object.keys(response).join(', '));
      console.log('   Scores:', Object.keys(response.scores).join(', '));
      console.log('   Issues count:', response.issues.length);
      
      totalPassed++;
    } catch (error) {
      console.log('❌ Score-only response creation failed:', error.message);
      totalFailed++;
    }
    
    // Test Suite 3: Data Normalization
    console.log('\n📊 TEST SUITE 3: Data Normalization');
    console.log('-'.repeat(40));
    
    try {
      const rawScores = { overall: 85.7, performance: 78.3, seo: 92.1, custom: 65.9 };
      const normalizedScores = ScoreOnlyResponseService.normalizeScores(rawScores);
      
      console.log('✅ Score normalization working');
      console.log('   Raw scores:', rawScores);
      console.log('   Normalized:', normalizedScores);
      
      // Verify all scores are integers
      const allIntegers = Object.values(normalizedScores).every(score => Number.isInteger(score));
      if (allIntegers) {
        console.log('✅ All scores properly rounded to integers');
        totalPassed++;
      } else {
        console.log('❌ Some scores not properly rounded');
        totalFailed++;
      }
      
    } catch (error) {
      console.log('❌ Data normalization failed:', error.message);
      totalFailed++;
    }
    
    // Test Suite 4: Issue Normalization
    console.log('\n📊 TEST SUITE 4: Issue Normalization');
    console.log('-'.repeat(40));
    
    try {
      const rawIssues = [
        { title: 'Issue 1', severity: 'high', description: 'Long description that should be removed' },
        { issue: 'Issue 2', priority: 'medium', details: 'More details' },
        'Simple string issue'
      ];
      
      const normalizedIssues = ScoreOnlyResponseService.normalizeIssues(rawIssues);
      
      console.log('✅ Issue normalization working');
      console.log('   Input issues:', rawIssues.length);
      console.log('   Output issues:', normalizedIssues.length);
      console.log('   Sample issue:', normalizedIssues[0]);
      
      // Verify no descriptions remain
      const hasDescriptions = normalizedIssues.some(issue => 
        issue.description || issue.details || issue.description?.length > 100
      );
      
      if (!hasDescriptions) {
        console.log('✅ Long descriptions properly removed');
        totalPassed++;
      } else {
        console.log('❌ Long descriptions not removed');
        totalFailed++;
      }
      
    } catch (error) {
      console.log('❌ Issue normalization failed:', error.message);
      totalFailed++;
    }
    
    // Test Suite 5: Complex Response Validation
    console.log('\n📊 TEST SUITE 5: Complex Response Validation');
    console.log('-'.repeat(40));
    
    try {
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
          },
          keywordData: {
            totalKeywords: 125,
            topRankings: [{ keyword: 'test', position: 12, volume: 2400 }]
          },
          aiAnalysis: {
            score: 70,
            schemaMarkupCount: 3,
            hasKnowledgeGraph: false
          },
          recommendations: ['Optimize page load speed', 'Add missing meta descriptions']
        }
      };
      
      ScoreOnlyResponseService.validateScoreOnlyResponse(complexResponse);
      console.log('✅ Complex response validation passed');
      console.log('   Data points:', Object.keys(complexResponse.data).length);
      console.log('   Score fields:', Object.keys(complexResponse.data.scores).length);
      console.log('   Issue types:', Object.keys(complexResponse.data.topIssues).length);
      
      totalPassed++;
      
    } catch (error) {
      console.log('❌ Complex response validation failed:', error.message);
      totalFailed++;
    }
    
    // Test Suite 6: Middleware Simulation
    console.log('\n📊 TEST SUITE 6: Middleware Simulation');
    console.log('-'.repeat(40));
    
    try {
      // Simulate middleware validation
      const mockRequest = { path: '/api/video/data/test', method: 'GET' };
      const mockResponse = {
        json: function(data) {
          try {
            ScoreOnlyResponseService.validateScoreOnlyResponse(data);
            return { success: true, data };
          } catch (error) {
            return { 
              success: false, 
              error: 'Response validation failed',
              message: error.message 
            };
          }
        }
      };
      
      // Test valid response
      const validResult = mockResponse.json({
        success: true,
        data: { scores: { overall: 85 } }
      });
      
      // Test invalid response
      const invalidResult = mockResponse.json({
        success: true,
        script: 'Should be blocked',
        data: { scores: { overall: 85 } }
      });
      
      if (validResult.success && !invalidResult.success) {
        console.log('✅ Middleware simulation working correctly');
        console.log('   Valid response: ✅ Passed');
        console.log('   Invalid response: ❌ Blocked');
        totalPassed++;
      } else {
        console.log('❌ Middleware simulation failed');
        totalFailed++;
      }
      
    } catch (error) {
      console.log('❌ Middleware simulation failed:', error.message);
      totalFailed++;
    }
    
    // Final Summary
    const duration = Date.now() - startTime;
    const totalTests = totalPassed + totalFailed;
    const successRate = Math.round((totalPassed / totalTests) * 100);
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 COMPLETE TEST SUITE SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed} ✅`);
    console.log(`Failed: ${totalFailed} ❌`);
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Duration: ${duration}ms`);
    
    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('✅ Score-only architecture is working perfectly');
      console.log('✅ API validation is blocking script content');
      console.log('✅ Data normalization is working correctly');
      console.log('✅ Complex responses are handled properly');
      console.log('✅ Middleware simulation is successful');
      console.log('\n🚀 READY FOR PRODUCTION DEPLOYMENT');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED');
      console.log('Please review the failed tests before deployment');
    }
    
    return {
      success: totalFailed === 0,
      totalTests,
      passed: totalPassed,
      failed: totalFailed,
      duration,
      successRate
    };
    
  } catch (error) {
    console.error('\n❌ Test suite execution failed:', error.message);
    return {
      success: false,
      error: error.message,
      totalTests: 0,
      passed: 0,
      failed: 1
    };
  }
}

// Run the complete test suite
runCompleteAPITestSuite().then(results => {
  console.log('\n=== FINAL RESULTS ===');
  console.log('Success:', results.success);
  console.log('Tests Passed:', results.passed, '/', results.totalTests);
  console.log('Success Rate:', results.successRate + '%');
  console.log('Duration:', results.duration + 'ms');
  process.exit(results.success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
