/**
 * MongoDB Migration Script: Convert project_id from string to ObjectId
 * 
 * This script safely migrates all collections that use project_id as string
 * to use proper ObjectId type.
 * 
 * Usage: node migrate-project-ids.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function migrateProjectIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/odito');
    console.log('🔗 Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Collections to migrate
    const collections = [
      'seo_keyword_opportunities',
      'seo_keyword_research', 
      'jobs',
      'seoprojects'
    ];

    console.log('🚀 Starting project_id migration...');

    for (const collectionName of collections) {
      console.log(`\n📋 Processing collection: ${collectionName}`);
      
      try {
        const collection = db.collection(collectionName);
        
        // Check if collection exists
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length === 0) {
          console.log(`⚠️  Collection ${collectionName} does not exist, skipping...`);
          continue;
        }

        // Find all documents with string project_id
        const stringProjectDocs = await collection.find({
          project_id: { $type: "string" }
        }).toArray();

        console.log(`📊 Found ${stringProjectDocs.length} documents with string project_id`);

        if (stringProjectDocs.length === 0) {
          console.log(`✅ No migration needed for ${collectionName}`);
          continue;
        }

        let migrated = 0;
        let skipped = 0;

        // Process each document
        for (const doc of stringProjectDocs) {
          try {
            // Check if the string is a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(doc.project_id)) {
              const objectId = new mongoose.Types.ObjectId(doc.project_id);
              
              await collection.updateOne(
                { _id: doc._id },
                { $set: { project_id: objectId } }
              );
              
              migrated++;
              
              if (migrated % 100 === 0) {
                console.log(`📈 Migrated ${migrated} documents...`);
              }
            } else {
              console.log(`⚠️  Invalid ObjectId format: ${doc.project_id} (doc _id: ${doc._id})`);
              skipped++;
            }
          } catch (error) {
            console.log(`❌ Failed to migrate doc ${doc._id}: ${error.message}`);
            skipped++;
          }
        }

        console.log(`✅ Migration complete for ${collectionName}:`);
        console.log(`   - Migrated: ${migrated}`);
        console.log(`   - Skipped: ${skipped}`);

        // Verify migration
        const remainingStringDocs = await collection.countDocuments({
          project_id: { $type: "string" }
        });

        if (remainingStringDocs === 0) {
          console.log(`✅ All project_id fields successfully converted to ObjectId`);
        } else {
          console.log(`⚠️  ${remainingStringDocs} documents still have string project_id`);
        }

      } catch (error) {
        console.log(`❌ Error processing collection ${collectionName}: ${error.message}`);
      }
    }

    console.log('\n🎉 Migration completed!');

    // Create indexes after migration
    console.log('\n🔧 Creating/updating indexes...');
    
    try {
      // Indexes for seo_keyword_opportunities
      await db.collection('seo_keyword_opportunities').createIndex({ project_id: 1 });
      await db.collection('seo_keyword_opportunities').createIndex({ project_id: 1, search_volume: -1 });
      await db.collection('seo_keyword_opportunities').createIndex({ project_id: 1, keyword: 1 }, { unique: true });
      
      // Indexes for seo_keyword_research
      await db.collection('seo_keyword_research').createIndex({ project_id: 1 });
      await db.collection('seo_keyword_research').createIndex({ job_id: 1 });
      
      // Indexes for jobs
      await db.collection('jobs').createIndex({ project_id: 1 });
      
      console.log('✅ Indexes created/updated successfully');
    } catch (error) {
      console.log(`⚠️  Index creation warning: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration
if (require.main === module) {
  migrateProjectIds()
    .then(() => {
      console.log('✅ Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateProjectIds };
