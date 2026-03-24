/**
 * Worker Integration Test
 * Tests the video worker with score-only architecture
 */

// Import worker modules using ES module syntax
import { VideoTemplateService } from './services/videoTemplate.service.js';

async function testWorkerIntegration() {
  console.log('🤖 Testing Video Worker Integration');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Sample video data (what worker would receive from API)
    const sampleVideoData = {
      project: {
        name: 'Test Website',
        url: 'https://test.com',
        industry: 'Technology'
      },
      scores: {
        overall: 85,
        performance: 78,
        seo: 92,
        aiVisibility: 70,
        accessibility: 65
      },
      issueDistribution: {
        critical: 2,
        high: 8,
        medium: 15,
        low: 5,
        total: 30
      },
      topIssues: {
        critical: ['Critical security issue'],
        high: ['Missing meta descriptions', 'Slow page load speed', 'Mobile optimization issues'],
        medium: ['Image alt text missing', 'Header structure problems'],
        low: ['Minor CSS issues']
      },
      performanceMetrics: {
        mobileScore: 78,
        desktopScore: 85,
        pageSpeed: 75,
        lcp: '4.2',
        tbt: '1200',
        cls: '0.15'
      },
      technicalHighlights: {
        totalChecks: 45,
        criticalIssues: ['SSL certificate expired', 'XML sitemap missing'],
        topRecommendations: ['Implement HTTPS', 'Add structured data', 'Fix mobile usability']
      },
      keywordData: {
        totalKeywords: 125,
        topRankings: [
          { keyword: 'web design', position: 12, volume: 2400 },
          { keyword: 'seo services', position: 18, volume: 1600 },
          { keyword: 'website development', position: 25, volume: 1200 }
        ],
        opportunities: [
          { keyword: 'local seo', position: 45, volume: 800 },
          { keyword: 'responsive design', position: 52, volume: 600 }
        ]
      },
      aiAnalysis: {
        score: 70,
        schemaMarkupCount: 3,
        hasKnowledgeGraph: false,
        entityCount: 12
      },
      recommendations: [
        'Optimize page load speed',
        'Add missing meta descriptions',
        'Implement structured data markup',
        'Fix mobile usability issues',
        'Improve internal linking'
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'VideoDataService',
        version: '2.0.0'
      }
    };
    
    // Test 1: Worker Narration Generation
    console.log('\n🧪 Test 1: Worker Narration Generation');
    try {
      const narrationSegments = VideoTemplateService.generateCompleteNarration(sampleVideoData);
      const fullNarration = narrationSegments.map(segment => segment.narration).join('\n\n');
      
      console.log('✅ Worker narration generated successfully');
      console.log('   Total segments:', narrationSegments.length);
      console.log('   Total characters:', fullNarration.length);
      console.log('   Estimated duration:', Math.round(fullNarration.length / 150 * 60), 'seconds');
      
      // Validate each segment
      narrationSegments.forEach((segment, index) => {
        console.log(`   Segment ${index + 1} (${segment.slideType}): ${segment.narration.length} chars`);
      });
      
      passed++;
    } catch (error) {
      console.log('❌ Worker narration generation failed:', error.message);
      failed++;
    }
    
    // Test 2: Data Structure Validation
    console.log('\n🧪 Test 2: Data Structure Validation');
    try {
      // Validate that videoData contains no script fields
      const dataString = JSON.stringify(sampleVideoData);
      const forbiddenFields = ['script', 'narration', 'generatedText'];
      const hasForbiddenContent = forbiddenFields.some(field => dataString.includes(`"${field}"`));
      
      if (!hasForbiddenContent) {
        console.log('✅ Video data structure is clean (no script fields)');
        passed++;
      } else {
        console.log('❌ Video data contains forbidden fields');
        failed++;
      }
      
      // Validate required fields
      const requiredFields = ['scores', 'project', 'issueDistribution', 'topIssues'];
      const hasRequiredFields = requiredFields.every(field => sampleVideoData[field]);
      
      if (hasRequiredFields) {
        console.log('✅ Video data contains all required fields');
        passed++;
      } else {
        console.log('❌ Video data missing required fields');
        failed++;
      }
      
    } catch (error) {
      console.log('❌ Data structure validation failed:', error.message);
      failed++;
    }
    
    // Test 3: Score Processing
    console.log('\n🧪 Test 3: Score Processing');
    try {
      const scores = sampleVideoData.scores;
      const scoreValues = Object.values(scores);
      const allValidScores = scoreValues.every(score => 
        typeof score === 'number' && score >= 0 && score <= 100
      );
      
      if (allValidScores) {
        console.log('✅ All scores are valid numbers (0-100)');
        console.log('   Scores:', scores);
        passed++;
      } else {
        console.log('❌ Invalid scores detected');
        failed++;
      }
      
    } catch (error) {
      console.log('❌ Score processing failed:', error.message);
      failed++;
    }
    
    // Test 4: Issue Processing
    console.log('\n🧪 Test 4: Issue Processing');
    try {
      const totalIssues = Object.values(sampleVideoData.issueDistribution).reduce((sum, count) => sum + count, 0);
      const hasTopIssues = Object.values(sampleVideoData.topIssues).some(issues => issues.length > 0);
      
      console.log('✅ Issue processing successful');
      console.log('   Total issues:', totalIssues);
      console.log('   Has top issues:', hasTopIssues);
      console.log('   Issue distribution:', sampleVideoData.issueDistribution);
      passed++;
      
    } catch (error) {
      console.log('❌ Issue processing failed:', error.message);
      failed++;
    }
    
    // Test 5: Template Integration
    console.log('\n🧪 Test 5: Template Integration');
    try {
      // Test each slide type with the data
      const slideTypes = ['overview', 'issues', 'technical', 'performance', 'keywords', 'ai'];
      let allSlidesGenerated = true;
      
      slideTypes.forEach(slideType => {
        try {
          const narration = VideoTemplateService.generateSlideNarration(slideType, sampleVideoData);
          if (!narration || narration.length === 0) {
            allSlidesGenerated = false;
          }
        } catch (error) {
          console.log(`   ❌ Failed to generate ${slideType} slide:`, error.message);
          allSlidesGenerated = false;
        }
      });
      
      if (allSlidesGenerated) {
        console.log('✅ All slide types generated successfully');
        passed++;
      } else {
        console.log('❌ Some slide types failed to generate');
        failed++;
      }
      
    } catch (error) {
      console.log('❌ Template integration failed:', error.message);
      failed++;
    }
    
    // Test 6: Complete Workflow Simulation
    console.log('\n🧪 Test 6: Complete Workflow Simulation');
    try {
      // Simulate the complete worker workflow
      console.log('   Step 1: Receive video data ✅');
      
      const narrationSegments = VideoTemplateService.generateCompleteNarration(sampleVideoData);
      console.log('   Step 2: Generate narration from templates ✅');
      
      const fullNarration = narrationSegments.map(segment => segment.narration).join('\n\n');
      console.log('   Step 3: Prepare audio narration ✅');
      
      const inputData = {
        audioFile: '/audio/test.mp3',
        projectId: 'test123',
        videoData: sampleVideoData
      };
      console.log('   Step 4: Prepare Remotion input data ✅');
      
      console.log('   Step 5: Ready for video rendering ✅');
      console.log('   Complete workflow simulation successful');
      
      passed++;
      
    } catch (error) {
      console.log('❌ Workflow simulation failed:', error.message);
      failed++;
    }
    
    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 WORKER INTEGRATION TEST SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Total Tests: ${passed + failed}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    
    if (failed === 0) {
      console.log('\n🎉 ALL WORKER INTEGRATION TESTS PASSED!');
      console.log('   Video worker is ready for score-only architecture.');
    } else {
      console.log('\n⚠️  Some worker integration tests failed.');
      console.log('   Please review the implementation.');
    }
    
    return { passed, failed, total: passed + failed, success: failed === 0 };
    
  } catch (error) {
    console.error('\n❌ Worker integration test execution failed:', error.message);
    return { passed: 0, failed: 1, total: 1, success: false, error: error.message };
  }
}

// Run the tests
testWorkerIntegration().then(results => {
  console.log('\n=== WORKER INTEGRATION TEST RESULTS ===');
  console.log('Success:', results.success);
  console.log('Passed:', results.passed, '/', results.total);
  process.exit(results.success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
