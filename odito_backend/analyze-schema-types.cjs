/**
 * Analyze schema types in structured_data
 */

const mongoose = require('mongoose');

async function analyzeSchemaTypes() {
  const MONGODB_URI = 'mongodb://localhost:27017/odito_dev';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const { ObjectId } = mongoose.Types;
    
    const projectId = '69bd4440b9f78e5bd946750b';
    const projectIdObj = new ObjectId(projectId);
    
    console.log('🔍 ANALYZING SCHEMA TYPES');
    
    // Get all documents to analyze schema types
    const documents = await db.collection('seo_page_data')
      .find({ projectId: projectIdObj })
      .toArray();
    
    const schemaTypes = new Map();
    let totalSchemas = 0;
    
    console.log(`\n📄 Analyzing ${documents.length} documents...`);
    
    documents.forEach((doc, index) => {
      if (doc.structured_data && Array.isArray(doc.structured_data)) {
        doc.structured_data.forEach(schema => {
          totalSchemas++;
          const type = schema['@type'] || 'unknown';
          schemaTypes.set(type, (schemaTypes.get(type) || 0) + 1);
        });
      }
    });
    
    console.log('\n📊 Schema Types Found:');
    const sortedTypes = Array.from(schemaTypes.entries()).sort((a, b) => b[1] - a[1]);
    sortedTypes.forEach(([type, count]) => {
      console.log(`  ${type}: ${count} occurrences`);
    });
    
    console.log(`\n📈 Total Schema Objects: ${totalSchemas}`);
    
    // Get sample schema structure
    const sampleDoc = documents.find(doc => 
      doc.structured_data && 
      Array.isArray(doc.structured_data) && 
      doc.structured_data.length > 0
    );
    
    if (sampleDoc) {
      console.log('\n📄 Sample Schema Structure:');
      const firstSchema = sampleDoc.structured_data[0];
      console.log('Keys:', Object.keys(firstSchema));
      
      console.log('\nFull sample:');
      console.log(JSON.stringify(firstSchema, null, 2));
      
      // Show all schemas from this document
      console.log('\n📋 All Schemas in Sample Document:');
      sampleDoc.structured_data.forEach((schema, i) => {
        console.log(`  ${i + 1}. ${schema['@type'] || 'unknown'}`);
      });
    }
    
    await mongoose.connection.close();
    console.log('\n🏁 Analysis completed');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

analyzeSchemaTypes().catch(console.error);
