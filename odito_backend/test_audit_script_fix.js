/**
 * Test Script for AI Script Generation Fix Verification
 * Tests all the fixes implemented for audit data mapping
 */

import { AiScriptService } from './src/modules/aiVideo/services/aiScript.service.js';

// Mock audit data that simulates the real UnifiedJsonService structure
const mockAuditData = {
  project: {
    name: "Test Website",
    url: "https://example.com",
    industry: "Technology",
    country: "US"
  },
  
  // Real scores from unified service
  scores: {
    seoHealth: 75,
    aiVisibility: 82,
    performance: 68,
    authority: 70
  },
  
  // Real issue distribution from unified service
  issueDistribution: {
    total: 521,
    critical: 47,
    medium: 234,  // This was previously called "warnings"
    info: 240     // This was previously called "informational"
  },
  
  // Issues data structure
  issues: {
    critical: [
      { title: "Missing H1 tags", impact: "High" },
      { title: "Broken internal links", impact: "High" },
      { title: "Missing meta descriptions", impact: "Medium" }
    ],
    high: [
      { title: "Slow page load speed" },
      { title: "Missing alt tags" }
    ],
    medium: [
      { title: "Thin content" },
      { title: "Duplicate content" }
    ]
  },
  
  // Technical SEO data
  technical: {
    issues: [
      "Missing XML sitemap",
      "Robots.txt blocking important pages"
    ],
    recommendations: [
      { title: "Implement XML sitemap" },
      { title: "Fix robots.txt configuration" }
    ]
  },
  
  // Performance data
  performance: {
    pageSpeed: 65,
    metrics: ["FCP: 2.1s", "LCP: 4.5s", "CLS: 0.15"]
  },
  
  // Keywords data
  keywords: {
    totalKeywords: 1250,
    topRankings: ["keyword1 - #3", "keyword2 - #5", "keyword3 - #8"],
    opportunities: ["long-tail keyword 1", "long-tail keyword 2"]
  },
  
  // AI visibility data
  ai: {
    visibility: 82,
    schemaMarkup: ["Article", "Organization", "Website"],
    knowledgeGraph: { exists: true }
  },
  
  // Recommendations (objects that need formatting)
  recommendations: [
    { title: "Add structured data markup", description: "Implement Schema.org" },
    { title: "Optimize page loading speed", description: "Compress images" },
    { title: "Improve content quality", description: "Add more depth" },
    { title: "Fix technical SEO issues", description: "Update sitemap" },
    { title: "Enhance mobile experience", description: "Responsive design" }
  ]
};

console.log('🧪 TESTING AI SCRIPT GENERATION FIXES');
console.log('='.repeat(50));

// Test 1: buildAuditSnapshot with debug logging
console.log('\n📋 TEST 1: buildAuditSnapshot');
console.log('-'.repeat(30));

try {
  const auditSnapshot = AiScriptService.buildAuditSnapshot(mockAuditData);
  
  console.log('✅ buildAuditSnapshot SUCCESS');
  console.log('📊 Results:');
  console.log(`  Project: ${auditSnapshot.projectName}`);
  console.log(`  Critical Issues: ${auditSnapshot.issueDistribution.critical}`);
  console.log(`  Medium Issues: ${auditSnapshot.issueDistribution.medium}`);
  console.log(`  Total Issues: ${auditSnapshot.issueDistribution.total}`);
  console.log(`  AI Score: ${auditSnapshot.scores.aiVisibility}`);
  console.log(`  Overall Score: ${auditSnapshot.scores.overall}`);
  console.log(`  Recommendations Count: ${auditSnapshot.recommendations.length}`);
  console.log(`  Sample Recommendation: ${auditSnapshot.recommendations[0]}`);
  
  // Verify no [object Object] in recommendations
  const hasObjectInRecommendations = auditSnapshot.recommendations.some(rec => 
    typeof rec === 'object' && rec.toString() === '[object Object]'
  );
  
  if (hasObjectInRecommendations) {
    console.log('❌ ISSUE: [object Object] found in recommendations');
  } else {
    console.log('✅ No [object Object] found in recommendations');
  }
  
  // Verify correct issue distribution mapping
  if (auditSnapshot.issueDistribution.critical === 47 && 
      auditSnapshot.issueDistribution.medium === 234 &&
      auditSnapshot.issueDistribution.total === 521) {
    console.log('✅ Issue distribution mapping CORRECT');
  } else {
    console.log('❌ Issue distribution mapping INCORRECT');
    console.log(`  Expected: critical=47, medium=234, total=521`);
    console.log(`  Got: critical=${auditSnapshot.issueDistribution.critical}, medium=${auditSnapshot.issueDistribution.medium}, total=${auditSnapshot.issueDistribution.total}`);
  }
  
  // Verify scores mapping
  if (auditSnapshot.scores.seoHealth === 75 && 
      auditSnapshot.scores.aiVisibility === 82) {
    console.log('✅ Scores mapping CORRECT');
  } else {
    console.log('❌ Scores mapping INCORRECT');
  }
  
} catch (error) {
  console.log('❌ buildAuditSnapshot FAILED:', error.message);
}

// Test 2: buildPromptData with debug logging
console.log('\n📋 TEST 2: buildPromptData');
console.log('-'.repeat(30));

try {
  const promptData = AiScriptService.buildPromptData(mockAuditData);
  
  console.log('✅ buildPromptData SUCCESS');
  console.log('📊 Results:');
  console.log(`  Has issueDistribution: ${!!promptData.issueDistribution}`);
  console.log(`  Critical Issues: ${promptData.issueDistribution.critical}`);
  console.log(`  Medium Issues: ${promptData.issueDistribution.medium}`);
  console.log(`  Total Issues: ${promptData.issueDistribution.total}`);
  console.log(`  AI Score: ${promptData.scores.aiVisibility}`);
  console.log(`  Top Recommendations Count: ${promptData.topRecommendations.length}`);
  console.log(`  Sample Top Recommendation: ${promptData.topRecommendations[0]}`);
  
  // Verify issueDistribution is used (not topIssues.length)
  if (promptData.issueDistribution && 
      typeof promptData.issueDistribution.critical === 'number') {
    console.log('✅ issueDistribution used correctly');
  } else {
    console.log('❌ issueDistribution not used correctly');
  }
  
} catch (error) {
  console.log('❌ buildPromptData FAILED:', error.message);
}

// Test 3: testScript function
console.log('\n📋 TEST 3: testScript Function');
console.log('-'.repeat(30));

try {
  const auditSnapshot = AiScriptService.buildAuditSnapshot(mockAuditData);
  const testOutput = AiScriptService.testScript(auditSnapshot);
  
  console.log('✅ testScript SUCCESS');
  console.log('📊 Test Script Output:');
  console.log(testOutput);
  
  // Verify test script contains expected data
  if (testOutput.includes('Critical Issues: 47') &&
      testOutput.includes('Medium Issues: 234') &&
      testOutput.includes('Total Issues: 521') &&
      testOutput.includes('AI Score: 82')) {
    console.log('✅ Test script shows correct values');
  } else {
    console.log('❌ Test script shows incorrect values');
  }
  
} catch (error) {
  console.log('❌ testScript FAILED:', error.message);
}

// Test 4: Script prompt generation
console.log('\n📋 TEST 4: Script Prompt Generation');
console.log('-'.repeat(30));

try {
  const promptData = AiScriptService.buildPromptData(mockAuditData);
  const scriptPrompt = AiScriptService.buildScriptPrompt(promptData);
  
  console.log('✅ Script prompt generation SUCCESS');
  
  // Verify prompt uses issueDistribution for counts
  if (scriptPrompt.includes('521 Total - 47 Critical, 234 Medium')) {
    console.log('✅ Script prompt uses correct issue counts');
  } else {
    console.log('❌ Script prompt uses incorrect issue counts');
  }
  
  // Verify prompt has no [object Object]
  if (!scriptPrompt.includes('[object Object]')) {
    console.log('✅ Script prompt has no [object Object]');
  } else {
    console.log('❌ Script prompt contains [object Object]');
  }
  
} catch (error) {
  console.log('❌ Script prompt generation FAILED:', error.message);
}

// Test 5: Fallback script generation
console.log('\n📋 TEST 5: Fallback Script Generation');
console.log('-'.repeat(30));

try {
  const auditSnapshot = AiScriptService.buildAuditSnapshot(mockAuditData);
  const fallbackScript = AiScriptService.generateFallbackScript(auditSnapshot);
  
  console.log('✅ Fallback script generation SUCCESS');
  
  // Verify fallback script uses correct issue distribution
  if (fallbackScript.includes('47 critical issues') &&
      fallbackScript.includes('234 medium-level issues') &&
      fallbackScript.includes('total of 521 issues')) {
    console.log('✅ Fallback script uses correct issue counts');
  } else {
    console.log('❌ Fallback script uses incorrect issue counts');
  }
  
  // Verify no [object Object] in recommendations
  if (!fallbackScript.includes('[object Object]')) {
    console.log('✅ Fallback script has no [object Object]');
  } else {
    console.log('❌ Fallback script contains [object Object]');
  }
  
} catch (error) {
  console.log('❌ Fallback script generation FAILED:', error.message);
}

console.log('\n🎯 TEST SUMMARY');
console.log('='.repeat(50));
console.log('All tests completed. Check above for any ❌ failures.');
console.log('If all ✅, the audit data mapping fixes are working correctly!');
