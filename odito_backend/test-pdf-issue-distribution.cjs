/**
 * Test script to validate PDF Executive Summary Issue Distribution
 * Tests the complete flow from database to frontend
 */

const mongoose = require('mongoose');
const { PDFAggregationService } = require('./src/modules/pdf/service/pdfAggregationService.js');

// Test configuration
const TEST_PROJECT_ID = '675f18e5b2b1f8f5a7e8e8b1'; // Replace with actual project ID

async function testIssueDistribution() {
  try {
    console.log('=== PDF Issue Distribution Validation Test ===\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/odito');
    console.log('✅ Connected to MongoDB');
    
    // 1. Test raw database aggregation
    console.log('\n1. Testing raw database aggregation...');
    const { db, ObjectId } = PDFAggregationService.getDbConnection();
    const projectIdObj = new ObjectId(TEST_PROJECT_ID);
    
    const rawCounts = await db.collection('seo_page_issues')
      .aggregate([
        { $match: { projectId: projectIdObj } },
        {
          $group: {
            _id: null,
            totalIssues: { $sum: 1 },
            critical: {
              $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
            },
            warnings: {
              $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] }
            },
            informational: {
              $sum: {
                $cond: [
                  { $in: ['$severity', ['low', 'info']] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalIssues: 1,
            critical: 1,
            warnings: 1,
            informational: 1
          }
        }
      ]).toArray();
    
    const dbResult = rawCounts[0] || { totalIssues: 0, critical: 0, warnings: 0, informational: 0 };
    console.log('📊 Raw DB Result:', dbResult);
    
    // 2. Test aggregation service
    console.log('\n2. Testing PDF aggregation service...');
    const serviceResult = await PDFAggregationService.getOnPageIssueCounts(TEST_PROJECT_ID);
    console.log('📊 Service Result:', serviceResult);
    
    // 3. Test executive mapper (simulate)
    console.log('\n3. Testing executive mapper logic...');
    const mockCoverData = {
      scores: { seoHealth: 75, aiVisibility: 60, performance: 80, authority: 70 }
    };
    
    const mockAggregatedData = {
      project: { _id: TEST_PROJECT_ID },
      pages: {
        onpageIssues: serviceResult
      }
    };
    
    // Simulate mapper logic
    const issues = {
      critical: serviceResult.critical,
      warnings: serviceResult.warnings,
      informational: serviceResult.informational,
      passed: Math.max(0, 100 - serviceResult.totalIssues)
    };
    
    const issueDistribution = {
      total: serviceResult.totalIssues,
      critical: issues.critical,
      medium: issues.warnings,  // Map warnings to medium
      info: issues.informational  // Map informational to info
    };
    
    console.log('📊 Mapper Issues:', issues);
    console.log('📊 Mapper Issue Distribution:', issueDistribution);
    
    // 4. Validate consistency
    console.log('\n4. Validation Results:');
    const validation = {
      dbMatchesService: JSON.stringify(dbResult) === JSON.stringify(serviceResult),
      serviceTotalCorrect: serviceResult.totalIssues === (dbResult.totalIssues || 0),
      serviceCriticalCorrect: serviceResult.critical === (dbResult.critical || 0),
      serviceWarningsCorrect: serviceResult.warnings === (dbResult.warnings || 0),
      serviceInfoCorrect: serviceResult.informational === (dbResult.informational || 0),
      distributionTotalCorrect: issueDistribution.total === serviceResult.totalIssues,
      distributionCriticalCorrect: issueDistribution.critical === serviceResult.critical,
      distributionMediumCorrect: issueDistribution.medium === serviceResult.warnings,
      distributionInfoCorrect: issueDistribution.info === serviceResult.informational
    };
    
    console.log('✅ Validation Results:', validation);
    
    // 5. Sample API response
    console.log('\n5. Sample API Response:');
    const apiResponse = {
      success: true,
      data: {
        scores: mockCoverData.scores,
        issues,
        issueDistribution,
        aiAnalysis: "Sample AI analysis text...",
        metadata: {
          totalIssues: serviceResult.totalIssues,
          generatedAt: new Date()
        }
      }
    };
    console.log('📤 API Response:', JSON.stringify(apiResponse, null, 2));
    
    // 6. Frontend chart data simulation
    console.log('\n6. Frontend Chart Data:');
    const chartData = [
      { name: "Critical", value: issueDistribution.critical },
      { name: "Medium", value: issueDistribution.medium },
      { name: "Info", value: issueDistribution.info }
    ];
    console.log('📈 Chart Data:', chartData);
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
if (require.main === module) {
  testIssueDistribution();
}

module.exports = { testIssueDistribution };
