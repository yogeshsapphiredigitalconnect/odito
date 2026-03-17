/**
 * Verification Script: Check project_id data types after migration
 * 
 * This script verifies that all project_id fields are now stored as ObjectId
 * 
 * Usage: node verify-project-ids.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function verifyProjectIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/odito');
    console.log('🔗 Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Collections to verify
    const collections = [
      'seo_keyword_opportunities',
      'seo_keyword_research', 
      'jobs',
      'seoprojects'
    ];

    console.log('🔍 Verifying project_id data types...');

    for (const collectionName of collections) {
      console.log(`\n📋 Verifying collection: ${collectionName}`);
      
      try {
        const collection = db.collection(collectionName);
        
        // Check if collection exists
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length === 0) {
          console.log(`⚠️  Collection ${collectionName} does not exist, skipping...`);
          continue;
        }

        // Count documents with ObjectId project_id
        const objectIdCount = await collection.countDocuments({
          project_id: { $type: "objectId" }
        });

        // Count documents with string project_id
        const stringCount = await collection.countDocuments({
          project_id: { $type: "string" }
        });

        // Get sample documents to verify
        const sampleDoc = await collection.findOne({ project_id: { $exists: true } });
        
        console.log(`📊 Results for ${collectionName}:`);
        console.log(`   - ObjectId project_id: ${objectIdCount}`);
        console.log(`   - String project_id: ${stringCount}`);
        
        if (sampleDoc) {
          console.log(`   - Sample project_id type: ${typeof sampleDoc.project_id}`);
          console.log(`   - Sample project_id value: ${sampleDoc.project_id}`);
        }

        if (stringCount === 0 && objectIdCount > 0) {
          console.log(`✅ All project_id fields are properly converted to ObjectId`);
        } else if (stringCount > 0) {
          console.log(`⚠️  ${stringCount} documents still have string project_id`);
        } else {
          console.log(`ℹ️  No documents with project_id found in this collection`);
        }

      } catch (error) {
        console.log(`❌ Error verifying collection ${collectionName}: ${error.message}`);
      }
    }

    console.log('\n🎉 Verification completed!');

    // Test a sample query
    console.log('\n🧪 Testing sample queries...');
    
    try {
      const keywordCollection = db.collection('seo_keyword_opportunities');
      
      // Get a sample project_id
      const sampleDoc = await keywordCollection.findOne({ project_id: { $exists: true } });
      
      if (sampleDoc) {
        const projectId = sampleDoc.project_id;
        console.log(`📝 Testing with project_id: ${projectId} (${typeof projectId})`);
        
        // Test query with ObjectId
        const results = await keywordCollection.find({ project_id: projectId }).limit(3).toArray();
        console.log(`✅ Query with ObjectId returned ${results.length} results`);
        
        if (results.length > 0) {
          console.log(`📄 Sample result:`, {
            keyword: results[0].keyword,
            project_id: results[0].project_id,
            project_id_type: typeof results[0].project_id
          });
        }
      }
    } catch (error) {
      console.log(`❌ Query test failed: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run verification
if (require.main === module) {
  verifyProjectIds()
    .then(() => {
      console.log('✅ Verification script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Verification script failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyProjectIds };
