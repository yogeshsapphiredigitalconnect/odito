/**
 * Test script for AI Search Audit Issues aggregation
 * 
 * This script tests the MongoDB aggregation pipeline for generating
 * AI Search Audit issues from crawled page data.
 */

import mongoose from 'mongoose';
import { getAISearchAuditIssues, getAISearchAuditIssuePages, AI_SEO_RULES } from '../src/services/aiSearchAuditAggregationService.js';

// Test configuration
const TEST_PROJECT_ID = '507f1f77bcf86cd799439011'; // Replace with actual project ID
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odito';

async function runTests() {
  try {
    console.log('🚀 Starting AI Search Audit Issues aggregation tests...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Get all issues for a project
    console.log('\n📊 Test 1: Getting all AI Search Audit issues...');
    const issues = await getAISearchAuditIssues(TEST_PROJECT_ID);
    
    console.log(`Found ${issues.length} issues:`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title}`);
      console.log(`   - Issue ID: ${issue.issueId}`);
      console.log(`   - Severity: ${issue.severity}`);
      console.log(`   - Category: ${issue.category}`);
      console.log(`   - Pages Affected: ${issue.pagesAffected}`);
      console.log(`   - Impact: ${issue.impact}`);
      console.log(`   - Difficulty: ${issue.difficulty}`);
      console.log(`   - Sample URLs: ${issue.sampleUrls?.length || 0}`);
      if (issue.sampleUrls?.length > 0) {
        console.log(`   - Sample: ${issue.sampleUrls[0]}`);
      }
      console.log('');
    });

    // Test 2: Get affected pages for a specific issue
    if (issues.length > 0) {
      const testIssue = issues[0];
      console.log(`🔍 Test 2: Getting affected pages for issue: ${testIssue.title}`);
      
      const issuePages = await getAISearchAuditIssuePages(TEST_PROJECT_ID, testIssue.issueId, {
        page: 1,
        limit: 10
      });
      
      console.log(`Issue Details:`);
      console.log(`- Title: ${issuePages.title}`);
      console.log(`- Severity: ${issuePages.severity}`);
      console.log(`- Total Pages Affected: ${issuePages.pagination.totalPagesAffected}`);
      console.log(`- Showing page ${issuePages.pagination.currentPage} of ${issuePages.pagination.totalPages}`);
      
      console.log(`\nAffected Pages (first 10):`);
      issuePages.pages.forEach((page, index) => {
        console.log(`${index + 1}. ${page.url}`);
        console.log(`   - Title: ${page.title}`);
        console.log(`   - AI Visibility Score: ${page.aiVisibility?.conversational_score || 'N/A'}`);
        console.log('');
      });
    }

    // Test 3: Performance test with timing
    console.log('⚡ Test 3: Performance test...');
    const startTime = Date.now();
    const performanceIssues = await getAISearchAuditIssues(TEST_PROJECT_ID);
    const endTime = Date.now();
    
    console.log(`✅ Aggregation completed in ${endTime - startTime}ms`);
    console.log(`✅ Processed ${performanceIssues.length} issues`);

    // Test 4: Validate rule configuration
    console.log('\n📋 Test 4: Validating AI SEO Rules configuration...');
    console.log(`Total rules configured: ${AI_SEO_RULES.length}`);
    
    const categories = [...new Set(AI_SEO_RULES.map(rule => rule.category))];
    const severities = [...new Set(AI_SEO_RULES.map(rule => rule.severity))];
    
    console.log(`Categories: ${categories.join(', ')}`);
    console.log(`Severities: ${severities.join(', ')}`);
    
    AI_SEO_RULES.forEach(rule => {
      console.log(`✓ ${rule.issueId}: ${rule.title} (${rule.severity}/${rule.category})`);
    });

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Test with sample data generation
async function generateSampleData() {
  try {
    console.log('📝 Generating sample data for testing...');
    
    await mongoose.connect(MONGODB_URI);
    
    const collection = mongoose.connection.db.collection('seo_ai_visibility');
    
    // Sample documents for testing
    const sampleDocs = [
      {
        projectId: new mongoose.Types.ObjectId(TEST_PROJECT_ID),
        url: '/blog/seo-audit-guide',
        page_title: 'SEO Audit Guide - Complete 2025 Guide',
        ai_visibility_available: true,
        ai_visibility: {
          schema_markup: { has_schema: false },
          faq_schema: { has_faq_schema: false, faq_content_detected: 5 },
          conversational_score: 0.31,
          knowledge_graph: { claimed: false },
          llm_indexability: { score: 0.39 },
          ai_snippet_probability: 0.29,
          entity_coverage: { score: 0.65 },
          structured_data: { depth: 1 },
          geo_score: 0.55,
          ai_citation_rate: 0.35
        }
      },
      {
        projectId: new mongoose.Types.ObjectId(TEST_PROJECT_ID),
        url: '/features/technical-seo',
        page_title: 'Technical SEO Features',
        ai_visibility_available: true,
        ai_visibility: {
          schema_markup: { has_schema: true },
          faq_schema: { has_faq_schema: false, faq_content_detected: 0 },
          conversational_score: 0.67,
          knowledge_graph: { claimed: false },
          llm_indexability: { score: 0.72 },
          ai_snippet_probability: 0.45,
          entity_coverage: { score: 0.78 },
          structured_data: { depth: 3 },
          geo_score: 0.68,
          ai_citation_rate: 0.52
        }
      },
      {
        projectId: new mongoose.Types.ObjectId(TEST_PROJECT_ID),
        url: '/pricing',
        page_title: 'Pricing Plans',
        ai_visibility_available: true,
        ai_visibility: {
          schema_markup: { has_schema: false },
          faq_schema: { has_faq_schema: false, faq_content_detected: 8 },
          conversational_score: 0.42,
          knowledge_graph: { claimed: true },
          llm_indexability: { score: 0.58 },
          ai_snippet_probability: 0.33,
          entity_coverage: { score: 0.71 },
          structured_data: { depth: 2 },
          geo_score: 0.61,
          ai_citation_rate: 0.44
        }
      }
    ];
    
    // Insert sample data
    await collection.insertMany(sampleDocs);
    console.log(`✅ Generated ${sampleDocs.length} sample documents`);
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Failed to generate sample data:', error.message);
    await mongoose.disconnect();
  }
}

// Command line interface
const command = process.argv[2];

if (command === 'generate-sample') {
  generateSampleData();
} else {
  runTests();
}
