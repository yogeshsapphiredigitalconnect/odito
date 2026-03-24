/**
 * Video Template Service Test
 * Tests the internal template generation
 */

// Import template service using ES module syntax
import { VideoTemplateService } from './services/videoTemplate.service.js';

async function testVideoTemplates() {
  console.log('🎬 Testing Video Template Service');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Test data
    const testData = {
      scores: { overall: 85, performance: 78, seo: 92, aiVisibility: 70 },
      project: { name: 'Test Website', url: 'https://test.com' },
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
    };
    
    // Test 1: Overview Slide Narration
    console.log('\n🧪 Test 1: Overview Slide Narration');
    try {
      const overviewNarration = VideoTemplateService.generateSlideNarration('overview', testData);
      console.log('✅ Overview narration generated');
      console.log('   Length:', overviewNarration.length, 'characters');
      console.log('   Preview:', overviewNarration.substring(0, 100) + '...');
      passed++;
    } catch (error) {
      console.log('❌ Overview narration failed:', error.message);
      failed++;
    }
    
    // Test 2: Issues Slide Narration
    console.log('\n🧪 Test 2: Issues Slide Narration');
    try {
      const issuesNarration = VideoTemplateService.generateSlideNarration('issues', testData);
      console.log('✅ Issues narration generated');
      console.log('   Length:', issuesNarration.length, 'characters');
      console.log('   Preview:', issuesNarration.substring(0, 100) + '...');
      passed++;
    } catch (error) {
      console.log('❌ Issues narration failed:', error.message);
      failed++;
    }
    
    // Test 3: Technical Slide Narration
    console.log('\n🧪 Test 3: Technical Slide Narration');
    try {
      const technicalNarration = VideoTemplateService.generateSlideNarration('technical', testData);
      console.log('✅ Technical narration generated');
      console.log('   Length:', technicalNarration.length, 'characters');
      console.log('   Preview:', technicalNarration.substring(0, 100) + '...');
      passed++;
    } catch (error) {
      console.log('❌ Technical narration failed:', error.message);
      failed++;
    }
    
    // Test 4: Performance Slide Narration
    console.log('\n🧪 Test 4: Performance Slide Narration');
    try {
      const performanceNarration = VideoTemplateService.generateSlideNarration('performance', testData);
      console.log('✅ Performance narration generated');
      console.log('   Length:', performanceNarration.length, 'characters');
      console.log('   Preview:', performanceNarration.substring(0, 100) + '...');
      passed++;
    } catch (error) {
      console.log('❌ Performance narration failed:', error.message);
      failed++;
    }
    
    // Test 5: Keywords Slide Narration
    console.log('\n🧪 Test 5: Keywords Slide Narration');
    try {
      const keywordsNarration = VideoTemplateService.generateSlideNarration('keywords', testData);
      console.log('✅ Keywords narration generated');
      console.log('   Length:', keywordsNarration.length, 'characters');
      console.log('   Preview:', keywordsNarration.substring(0, 100) + '...');
      passed++;
    } catch (error) {
      console.log('❌ Keywords narration failed:', error.message);
      failed++;
    }
    
    // Test 6: AI Slide Narration
    console.log('\n🧪 Test 6: AI Slide Narration');
    try {
      const aiNarration = VideoTemplateService.generateSlideNarration('ai', testData);
      console.log('✅ AI narration generated');
      console.log('   Length:', aiNarration.length, 'characters');
      console.log('   Preview:', aiNarration.substring(0, 100) + '...');
      passed++;
    } catch (error) {
      console.log('❌ AI narration failed:', error.message);
      failed++;
    }
    
    // Test 7: Complete Narration Generation
    console.log('\n🧪 Test 7: Complete Narration Generation');
    try {
      const completeNarration = VideoTemplateService.generateCompleteNarration(testData);
      console.log('✅ Complete narration generated');
      console.log('   Segments:', completeNarration.length);
      completeNarration.forEach((segment, index) => {
        console.log(`   Segment ${index + 1} (${segment.slideType}): ${segment.narration.length} chars`);
      });
      passed++;
    } catch (error) {
      console.log('❌ Complete narration failed:', error.message);
      failed++;
    }
    
    // Test 8: Score Level Mapping
    console.log('\n🧪 Test 8: Score Level Mapping');
    try {
      const score90 = VideoTemplateService.getScoreLevel(90);
      const score75 = VideoTemplateService.getScoreLevel(75);
      const score60 = VideoTemplateService.getScoreLevel(60);
      const score40 = VideoTemplateService.getScoreLevel(40);
      
      console.log('✅ Score levels mapped:');
      console.log('   90 →', score90);
      console.log('   75 →', score75);
      console.log('   60 →', score60);
      console.log('   40 →', score40);
      passed++;
    } catch (error) {
      console.log('❌ Score level mapping failed:', error.message);
      failed++;
    }
    
    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 TEMPLATE TEST SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Total Tests: ${passed + failed}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    
    if (failed === 0) {
      console.log('\n🎉 ALL TEMPLATE TESTS PASSED! Video templates are working correctly.');
    } else {
      console.log('\n⚠️  Some template tests failed. Please review the implementation.');
    }
    
    return { passed, failed, total: passed + failed, success: failed === 0 };
    
  } catch (error) {
    console.error('\n❌ Template test execution failed:', error.message);
    return { passed: 0, failed: 1, total: 1, success: false, error: error.message };
  }
}

// Run the tests
testVideoTemplates().then(results => {
  console.log('\n=== TEMPLATE TEST RESULTS ===');
  console.log('Success:', results.success);
  console.log('Passed:', results.passed, '/', results.total);
  process.exit(results.success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
