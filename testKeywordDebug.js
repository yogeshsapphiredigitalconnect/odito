const axios = require('axios');
const mongoose = require('mongoose');

// Configuration - update these values
const BASE_URL = 'http://localhost:3001'; // Update if your backend runs on different port
const PROJECT_ID = 'YOUR_PROJECT_ID_HERE'; // You'll need to update this

// Test results tracking
const testResults = {
    passed: 0,
    failed: 0,
    details: []
};

// Helper function to log test results
function logTest(testName, passed, details = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}`);
    if (details) {
        console.log(`   ${details}`);
    }
    
    testResults.details.push({
        test: testName,
        passed,
        details
    });
    
    if (passed) {
        testResults.passed++;
    } else {
        testResults.failed++;
    }
}

// Helper function to make API requests
async function makeRequest(method, url, params = {}) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            params,
            timeout: 10000
        };
        
        console.log(`🔍 Making request: ${method} ${url}`);
        console.log(`   Params:`, JSON.stringify(params, null, 2));
        
        const response = await axios(config);
        
        console.log(`✅ Response status: ${response.status}`);
        console.log(`✅ Response data:`, JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error(`❌ Request failed: ${error.message}`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

// Test 1: Debug endpoint to check database state
async function testDebugEndpoint() {
    console.log('\n=== Testing Debug Endpoint ===');
    try {
        const response = await makeRequest('GET', '/api/keywords/debug');
        
        const hasData = response.data && response.data.total_documents > 0;
        const hasProjects = response.data && response.data.project_ids && response.data.project_ids.length > 0;
        
        logTest('Debug endpoint returns data', hasData, 
            `Total documents: ${response.data?.total_documents || 0}, Projects: ${response.data?.project_ids?.length || 0}`);
        
        if (hasProjects) {
            console.log('\n📋 Available Projects:');
            response.data.project_samples.forEach((sample, index) => {
                console.log(`   ${index + 1}. Project ID: ${sample.project_id}`);
                console.log(`      Count: ${sample.count} keywords`);
                console.log(`      Sample keyword: "${sample.sample_keyword}"`);
                console.log(`      Sample doc structure:`, Object.keys(sample.sample_doc || {}));
            });
            
            // Return first project ID for further testing
            return response.data.project_samples[0]?.project_id;
        }
    } catch (error) {
        logTest('Debug endpoint accessible', false, error.message);
    }
    return null;
}

// Test 2: Keyword Intelligence API
async function testKeywordIntelligence(projectId) {
    console.log('\n=== Testing Keyword Intelligence API ===');
    try {
        const response = await makeRequest('GET', '/api/keywords/intelligence', { projectId });
        
        const hasSuccess = response.success === true;
        const hasData = response.data && response.data.summary;
        const hasSummary = response.data && response.data.summary;
        const hasIntent = response.data && response.data.intentDistribution;
        
        logTest('Intelligence API success response', hasSuccess);
        logTest('Intelligence API has data', hasData);
        logTest('Intelligence API has summary', hasSummary);
        logTest('Intelligence API has intent distribution', hasIntent);
        
        if (hasSummary) {
            const summary = response.data.summary;
            console.log('\n📊 Intelligence Summary:');
            console.log(`   Total Volume: ${summary.total_volume}`);
            console.log(`   Avg KD Score: ${summary.avg_kd_score}`);
            console.log(`   Avg CPC: ${summary.avg_cpc}`);
            console.log(`   AI Overview Count: ${summary.ai_overview_count}`);
            console.log(`   Local Pack Count: ${summary.local_pack_count}`);
        }
        
        if (hasIntent) {
            console.log('\n🎯 Intent Distribution:');
            Object.entries(response.data.intentDistribution).forEach(([intent, count]) => {
                console.log(`   ${intent}: ${count}`);
            });
        }
        
        return hasData;
    } catch (error) {
        logTest('Intelligence API accessible', false, error.message);
        return false;
    }
}

// Test 3: Keyword List API
async function testKeywordList(projectId) {
    console.log('\n=== Testing Keyword List API ===');
    try {
        const response = await makeRequest('GET', '/api/keywords', { 
            projectId,
            page: 1,
            limit: 5
        });
        
        const hasSuccess = response.success === true;
        const hasKeywords = response.data && response.data.keywords && response.data.keywords.length > 0;
        const hasPagination = response.data && response.data.pagination;
        
        logTest('Keyword list API success response', hasSuccess);
        logTest('Keyword list returns keywords', hasKeywords);
        logTest('Keyword list has pagination', hasPagination);
        
        if (hasKeywords) {
            console.log('\n📝 Sample Keywords:');
            response.data.keywords.forEach((kw, index) => {
                console.log(`   ${index + 1}. "${kw.keyword}"`);
                console.log(`      Volume: ${kw.vol}, Difficulty: ${kw.kd}, CPC: ${kw.cpc}`);
                console.log(`      Intent: ${kw.intent}, SERP Types: ${kw.serpTypes?.join(', ') || 'none'}`);
                console.log(`      Trend: M/M: ${kw.trend?.monthly}%, Q/Q: ${kw.trend?.quarterly}%, Y/Y: ${kw.trend?.yearly}%`);
                console.log(`      Monthly data points: ${kw.monthly?.length || 0}`);
            });
            
            // Return first keyword for detail testing
            return response.data.keywords[0]?.keyword;
        }
    } catch (error) {
        logTest('Keyword list API accessible', false, error.message);
        return null;
    }
}

// Test 4: Keyword Detail API
async function testKeywordDetail(projectId, keyword) {
    console.log('\n=== Testing Keyword Detail API ===');
    if (!keyword) {
        logTest('Keyword detail test skipped', false, 'No keyword available from list API');
        return;
    }
    
    try {
        const response = await makeRequest('GET', `/api/keywords/${encodeURIComponent(keyword)}`, { projectId });
        
        const hasSuccess = response.success === true;
        const hasData = response.data;
        const hasTrend = response.data && response.data.trend;
        const hasMonthly = response.data && response.data.monthly && response.data.monthly.length > 0;
        const hasRealTrendData = hasTrend && (hasTrend.monthly !== 0 || hasTrend.quarterly !== 0 || hasTrend.yearly !== 0);
        const hasRealMonthlyData = hasMonthly && response.data.monthly.some(v => v !== 0);
        
        logTest('Keyword detail API success response', hasSuccess);
        logTest('Keyword detail has data', hasData);
        logTest('Keyword detail has trend data', hasTrend);
        logTest('Keyword detail has monthly data', hasMonthly);
        logTest('Keyword detail has REAL trend data (not all zeros)', hasRealTrendData);
        logTest('Keyword detail has REAL monthly data (not all zeros)', hasRealMonthlyData);
        
        if (hasData) {
            console.log('\n🔍 Keyword Detail:');
            console.log(`   Keyword: "${response.data.keyword}"`);
            console.log(`   Volume: ${response.data.vol}, Difficulty: ${response.data.kd}, CPC: ${response.data.cpc}`);
            console.log(`   Intent: ${response.data.intent}, SERP Types: ${response.data.serpTypes?.join(', ') || 'none'}`);
            console.log(`   Trend: M/M: ${response.data.trend?.monthly}%, Q/Q: ${response.data.trend?.quarterly}%, Y/Y: ${response.data.trend?.yearly}%`);
            console.log(`   Monthly data: [${response.data.monthly?.slice(0, 6).join(', ')}${response.data.monthly?.length > 6 ? '...' : ''}]`);
            console.log(`   Related keywords: ${response.data.relatedKws?.length || 0}`);
        }
        
    } catch (error) {
        logTest('Keyword detail API accessible', false, error.message);
    }
}

// Test 5: MongoDB Data Linking Test
async function testDataLinking(projectId) {
    console.log('\n=== Testing MongoDB Data Linking ===');
    
    // This would be run in MongoDB shell or via mongoose
    console.log('🔗 Manual MongoDB query to test data linking:');
    console.log(`
db.seo_keyword_opportunities.aggregate([
  { $match: { project_id: ObjectId("${projectId}") } },
  { $limit: 1 },
  {
    $lookup: {
      from: "seo_keyword_research",
      let: { jobId: "$job_id", sourceKeyword: "$source_keyword" },
      pipeline: [
        {
          $match: {
            $expr: {
              $or: [
                { $eq: ["$job_id", "$$jobId"] },
                { $eq: ["$seed_keyword", "$$sourceKeyword"] }
              ]
            }
          }
        }
      ],
      as: "research"
    }
  }
])
    `);
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Keyword Intelligence System Debug Tests');
    console.log(`📍 Backend URL: ${BASE_URL}`);
    
    if (PROJECT_ID === 'YOUR_PROJECT_ID_HERE') {
        console.log('\n⚠️  WARNING: Please update PROJECT_ID in the script before running');
    }
    
    try {
        // Test 1: Debug endpoint
        const actualProjectId = await testDebugEndpoint() || PROJECT_ID;
        
        if (!actualProjectId || actualProjectId === 'YOUR_PROJECT_ID_HERE') {
            console.log('\n❌ Cannot proceed - no valid project ID found');
            console.log('   Update the PROJECT_ID variable or ensure debug endpoint returns projects');
            return;
        }
        
        // Test 2: Intelligence API
        const intelligenceHasData = await testKeywordIntelligence(actualProjectId);
        
        // Test 3: Keyword List API
        const sampleKeyword = await testKeywordList(actualProjectId);
        
        // Test 4: Keyword Detail API
        await testKeywordDetail(actualProjectId, sampleKeyword);
        
        // Test 5: Data Linking
        await testDataLinking(actualProjectId);
        
        // Summary
        console.log('\n=== TEST SUMMARY ===');
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`📊 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
        
        console.log('\n🔍 ROOT CAUSE ANALYSIS:');
        
        const failedTests = testResults.details.filter(t => !t.passed);
        if (failedTests.length === 0) {
            console.log('   ✅ All tests passed - the issue might be in the frontend');
        } else {
            console.log('   ❌ Issues found in backend:');
            failedTests.forEach(test => {
                console.log(`      - ${test.test}: ${test.details}`);
            });
        }
        
        // Specific issue identification
        console.log('\n🎯 SPECIFIC ISSUE IDENTIFICATION:');
        
        const trendDataMissing = testResults.details.find(t => t.test.includes('REAL trend data') && !t.passed);
        const monthlyDataMissing = testResults.details.find(t => t.test.includes('REAL monthly data') && !t.passed);
        const detailApiFailed = testResults.details.find(t => t.test.includes('Keyword detail API') && !t.passed);
        
        if (trendDataMissing) {
            console.log('   🔴 TREND DATA: Monthly/Quarterly/Yearly trends are all zeros');
            console.log('      → Raw API response data not being extracted properly');
            console.log('      → Check seo_keyword_research.raw_api_response structure');
        }
        
        if (monthlyDataMissing) {
            console.log('   🔴 MONTHLY DATA: All monthly values are the same');
            console.log('      → monthly_searches not being extracted from raw API response');
            console.log('      → Fallback to constant search_volume is being used');
        }
        
        if (detailApiFailed) {
            console.log('   🔴 DETAIL API: Keyword detail endpoint failing');
            console.log('      → Check job_id linking between collections');
            console.log('      → Verify keyword matching logic');
        }
        
    } catch (error) {
        console.error('\n💥 Test runner crashed:', error.message);
    }
}

// Run the tests
if (require.main === module) {
    runTests();
}

module.exports = {
    runTests,
    testDebugEndpoint,
    testKeywordIntelligence,
    testKeywordList,
    testKeywordDetail
};
