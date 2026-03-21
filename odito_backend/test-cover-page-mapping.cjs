/**
 * Test script to validate Cover Page Issue Distribution mapping
 * Tests the new business logic mapping for cover page stats
 */

const mongoose = require('mongoose');
const { CoverPageService } = require('./src/modules/pdf/service/coverPageService.js');

// Test configuration
const TEST_PROJECT_ID = '675f18e5b2b1f8f5a7e8e8b1'; // Replace with actual project ID

async function testCoverPageMapping() {
  try {
    console.log('=== Cover Page Mapping Validation Test ===\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/odito');
    console.log('✅ Connected to MongoDB');
    
    // 1. Test raw database aggregation
    console.log('\n1. Testing raw database aggregation...');
    const db = mongoose.connection.db;
    const { ObjectId } = mongoose.Types;
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
            },
            low: {
              $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] }
            },
            info: {
              $sum: { $cond: [{ $eq: ['$severity', 'info'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalIssues: 1,
            critical: 1,
            warnings: 1,
            informational: 1,
            low: 1,
            info: 1
          }
        }
      ]).toArray();
    
    const dbResult = rawCounts[0] || { 
      totalIssues: 0, 
      critical: 0, 
      warnings: 0, 
      informational: 0,
      low: 0,
      info: 0
    };
    console.log('📊 Raw DB Result:', dbResult);
    
    // 2. Test cover page service
    console.log('\n2. Testing Cover Page Service...');
    const coverResult = await CoverPageService.getCoverPageData(TEST_PROJECT_ID);
    
    if (!coverResult.success) {
      console.error('❌ Cover Page Service failed:', coverResult.error);
      return;
    }
    
    console.log('📊 Cover Service Result:', {
      issues: coverResult.data.issues,
      pagesCrawled: coverResult.data.pagesCrawled
    });
    
    // 3. Validate business logic mapping
    console.log('\n3. Validating Business Logic Mapping...');
    
    const expectedMapping = {
      // Critical Issues → totalIssues
      critical: dbResult.totalIssues,
      // Warnings → critical (severity = "high")
      warnings: dbResult.critical,
      // Informational → medium (severity = "medium")
      informational: dbResult.warnings,
      // Checks Passed → low + info
      passed: dbResult.low + dbResult.info
    };
    
    console.log('📋 Expected Mapping:', expectedMapping);
    console.log('📋 Actual Mapping:', {
      critical: coverResult.data.issues.critical,
      warnings: coverResult.data.issues.warnings,
      informational: coverResult.data.issues.informational,
      passed: coverResult.data.issues.passed
    });
    
    // 4. Validation results
    console.log('\n4. Validation Results:');
    const validation = {
      criticalCorrect: coverResult.data.issues.critical === expectedMapping.critical,
      warningsCorrect: coverResult.data.issues.warnings === expectedMapping.warnings,
      informationalCorrect: coverResult.data.issues.informational === expectedMapping.informational,
      passedCorrect: coverResult.data.issues.passed === expectedMapping.passed,
      pagesCrawledPresent: !!coverResult.data.pagesCrawled
    };
    
    console.log('✅ Validation Results:', validation);
    
    const allValid = Object.values(validation).every(v => v === true);
    console.log(allValid ? '🎉 ALL VALIDATIONS PASSED!' : '❌ Some validations failed');
    
    // 5. Sample API response for frontend
    console.log('\n5. Sample API Response for Frontend:');
    const apiResponse = {
      success: true,
      data: {
        ...coverResult.data,
        // Show the mapping clearly
        _debug: {
          rawCounts: dbResult,
          businessLogicMapping: expectedMapping
        }
      }
    };
    
    console.log('📤 API Response:', JSON.stringify(apiResponse, null, 2));
    
    // 6. Frontend usage example
    console.log('\n6. Frontend Usage Example:');
    console.log('// Frontend should use:');
    console.log('Critical Issues → data.issues.critical');
    console.log('Warnings → data.issues.warnings');
    console.log('Informational → data.issues.informational');
    console.log('Checks Passed → data.issues.passed');
    console.log('Pages Crawled → data.pagesCrawled');
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
if (require.main === module) {
  testCoverPageMapping();
}

module.exports = { testCoverPageMapping };
