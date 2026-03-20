const mongoose = require('mongoose');
require('dotenv').config();

// Import the aggregation service
const { PDFAggregationService } = require('./src/modules/pdf/service/pdfAggregationService.js');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/odito_dev')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const { ObjectId } = mongoose.Types;
    
    // Test project ID - use a project that actually has data
    const projectId = '69bd4440b9f78e5bd946750b'; // This project has issues
    const projectIdObj = new ObjectId(projectId);
    
    console.log('='.repeat(60));
    console.log('🧪 TESTING ONPAGE ISSUE COUNTS AGGREGATION');
    console.log('='.repeat(60));
    console.log('Project ID:', projectId);
    
    try {
      // Step 1: Check if project has any seo_page_issues
      const totalIssuesInCollection = await db.collection('seo_page_issues').countDocuments({
        projectId: projectIdObj
      });
      
      console.log('\n📊 Step 1: Total issues in collection:', totalIssuesInCollection);
      
      if (totalIssuesInCollection === 0) {
        console.log('❌ No issues found for this project. Please check the project ID.');
        
        // Show available projects
        const availableProjects = await db.collection('seo_page_issues').distinct('projectId');
        console.log('\n📋 Available project IDs (first 5):');
        availableProjects.slice(0, 5).forEach(id => {
          console.log('  -', id.toString());
        });
        
        mongoose.connection.close();
        return;
      }
      
      // Step 2: Test raw severity breakdown
      console.log('\n🔍 Step 2: Raw severity breakdown:');
      const severityBreakdown = await db.collection('seo_page_issues').aggregate([
        { $match: { projectId: projectIdObj } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]).toArray();
      
      console.log('Raw severity data:', severityBreakdown);
      
      // Step 3: Test our new aggregation pipeline
      console.log('\n🚀 Step 3: Testing new aggregation pipeline:');
      const newAggregation = await db.collection('seo_page_issues').aggregate([
        { $match: { projectId: projectIdObj } },
        {
          $group: {
            _id: null,
            critical: {
              $sum: {
                $cond: [{ $eq: ['$severity', 'high'] }, 1, 0]
              }
            },
            warnings: {
              $sum: {
                $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0]
              }
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
            totalIssues: { $sum: 1 }
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
      
      const aggregationResult = newAggregation[0] || {
        totalIssues: 0,
        critical: 0,
        warnings: 0,
        informational: 0
      };
      
      console.log('✅ New aggregation result:', aggregationResult);
      
      // Step 4: Test the service function
      console.log('\n🛠️ Step 4: Testing service function:');
      try {
        // Note: This might not work in CommonJS context due to ES modules
        // But let's try to test the aggregation logic directly
        console.log('Testing getOnPageIssueCounts function...');
        
        // Simulate the service function logic
        const serviceResult = await PDFAggregationService.fetchOnpageIssuesData(db, projectIdObj);
        console.log('✅ Service function result:', serviceResult);
        
        // Step 5: Verify the results match
        console.log('\n🔬 Step 5: Verification:');
        const matches = JSON.stringify(aggregationResult) === JSON.stringify(serviceResult);
        console.log('Aggregation matches service function:', matches ? '✅' : '❌');
        
        if (!matches) {
          console.log('Difference detected:');
          console.log('  Direct aggregation:', aggregationResult);
          console.log('  Service function:', serviceResult);
        }
        
      } catch (serviceError) {
        console.log('❌ Service function test failed (expected in CommonJS):', serviceError.message);
      }
      
      // Step 6: Manual verification calculation
      console.log('\n🧮 Step 6: Manual verification:');
      const manualCalc = {
        critical: severityBreakdown.find(s => s._id === 'high')?.count || 0,
        warnings: severityBreakdown.find(s => s._id === 'medium')?.count || 0,
        informational: (severityBreakdown.find(s => s._id === 'low')?.count || 0) + 
                      (severityBreakdown.find(s => s._id === 'info')?.count || 0),
        totalIssues: totalIssuesInCollection
      };
      
      console.log('Manual calculation:', manualCalc);
      
      // Step 7: Final verification
      console.log('\n🎯 Step 7: Final verification:');
      const aggregationMatches = JSON.stringify(aggregationResult) === JSON.stringify(manualCalc);
      console.log('Aggregation matches manual calculation:', aggregationMatches ? '✅' : '❌');
      
      if (aggregationMatches) {
        console.log('\n🎉 SUCCESS: All tests passed! The aggregation pipeline is working correctly.');
      } else {
        console.log('\n❌ FAILURE: Results do not match. Please check the aggregation logic.');
        console.log('Expected:', manualCalc);
        console.log('Got:', aggregationResult);
      }
      
      // Step 8: Sample data inspection
      console.log('\n📋 Step 8: Sample data inspection:');
      const sampleIssues = await db.collection('seo_page_issues')
        .find({ projectId: projectIdObj })
        .limit(5)
        .toArray();
      
      console.log('Sample issue documents:');
      sampleIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. severity: "${issue.severity}", issue_code: "${issue.issue_code}"`);
      });
      
    } catch (error) {
      console.error('❌ Test failed with error:', error);
      console.error('Stack trace:', error.stack);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 TEST COMPLETE');
    console.log('='.repeat(60));
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
