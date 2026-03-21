/**
 * Debug Structured Data in seo_page_data collection
 * Analyzes how schema/JSON-LD data is stored
 */

const mongoose = require('mongoose');

async function debugStructuredData() {
  console.log('🔍 INSPECTING SEO_PAGE_DATA COLLECTION');
  console.log('='.repeat(50));
  
  const MONGODB_URI = 'mongodb://localhost:27017/odito_dev';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const { ObjectId } = mongoose.Types;
    
    // Get a project with data
    const projects = await db.collection('seo_page_data').distinct('projectId');
    if (projects.length === 0) {
      console.log('❌ No projects found in seo_page_data');
      return;
    }
    
    const projectId = projects[0];
    console.log('Using projectId:', projectId.toString());
    
    // Step 1: Inspect sample documents
    console.log('\n📄 STEP 1: SAMPLE DOCUMENTS');
    const samples = await db.collection('seo_page_data')
      .find({ projectId: new ObjectId(projectId) })
      .limit(3)
      .toArray();
    
    console.log(`Found ${samples.length} sample documents`);
    
    samples.forEach((doc, index) => {
      console.log(`\nSample ${index + 1}:`);
      console.log('Keys:', Object.keys(doc));
      
      // Look for structured data fields
      const possibleFields = ['structured_data', 'schema', 'json_ld', 'schema_markup', 'structuredData', 'schemaData'];
      let foundField = null;
      
      possibleFields.forEach(field => {
        if (doc[field] !== undefined) {
          foundField = field;
          console.log(`🎯 Found field: ${field}`);
          console.log(`Type: ${Array.isArray(doc[field]) ? 'array' : typeof doc[field]}`);
          console.log(`Length: ${Array.isArray(doc[field]) ? doc[field].length : 'N/A'}`);
          console.log(`Sample: ${JSON.stringify(doc[field], null, 2).substring(0, 300)}...`);
        }
      });
      
      if (!foundField) {
        console.log('❌ No structured data field found in this document');
      }
    });
    
    // Step 2: Identify the correct field name
    console.log('\n🔍 STEP 2: IDENTIFY STRUCTURED DATA FIELD');
    const allFields = await db.collection('seo_page_data').distinct('structured_data');
    console.log('structured_data field exists:', allFields.length > 0 ? 'YES' : 'NO');
    
    // Check other possible fields
    const fieldChecks = [
      'structured_data',
      'schema', 
      'json_ld',
      'schema_markup',
      'structuredData',
      'schemaData'
    ];
    
    let fieldNameUsed = null;
    for (const field of fieldChecks) {
      const exists = await db.collection('seo_page_data').findOne({
        projectId: new ObjectId(projectId),
        [field]: { $exists: true }
      });
      if (exists) {
        fieldNameUsed = field;
        console.log(`✅ Field found: ${field}`);
        break;
      }
    }
    
    if (!fieldNameUsed) {
      console.log('❌ No structured data field found');
      await mongoose.connection.close();
      return;
    }
    
    // Step 3: Count total pages
    console.log('\n📊 STEP 3: COUNT TOTAL PAGES');
    const totalPages = await db.collection('seo_page_data')
      .distinct('page_url', { projectId: new ObjectId(projectId) });
    console.log(`Total pages: ${totalPages.length}`);
    
    // Step 4: Count pages with structured data (various conditions)
    console.log('\n📈 STEP 4: COUNT PAGES WITH STRUCTURED DATA');
    
    // Case 1: Field exists
    const withFieldExists = await db.collection('seo_page_data')
      .distinct('page_url', {
        projectId: new ObjectId(projectId),
        [fieldNameUsed]: { $exists: true }
      });
    console.log(`Pages with ${fieldNameUsed} exists: ${withFieldExists.length}`);
    
    // Case 2: Field not null
    const withFieldNotNull = await db.collection('seo_page_data')
      .distinct('page_url', {
        projectId: new ObjectId(projectId),
        [fieldNameUsed]: { $ne: null }
      });
    console.log(`Pages with ${fieldNameUsed} not null: ${withFieldNotNull.length}`);
    
    // Case 3: Field not empty array
    const withFieldNotEmpty = await db.collection('seo_page_data')
      .distinct('page_url', {
        projectId: new ObjectId(projectId),
        [fieldNameUsed]: { $ne: [] }
      });
    console.log(`Pages with ${fieldNameUsed} not empty: ${withFieldNotEmpty.length}`);
    
    // Case 4: Field is array type
    const withFieldArray = await db.collection('seo_page_data')
      .distinct('page_url', {
        projectId: new ObjectId(projectId),
        [fieldNameUsed]: { $type: 'array' }
      });
    console.log(`Pages with ${fieldNameUsed} as array: ${withFieldArray.length}`);
    
    // Step 5: Find pages without structured data
    console.log('\n❌ STEP 5: PAGES WITHOUT STRUCTURED DATA');
    const withoutSchema = await db.collection('seo_page_data')
      .distinct('page_url', {
        projectId: new ObjectId(projectId),
        $or: [
          { [fieldNameUsed]: { $exists: false } },
          { [fieldNameUsed]: null },
          { [fieldNameUsed]: [] }
        ]
      });
    console.log(`Pages without structured data: ${withoutSchema.length}`);
    
    // Step 6: Get field type info
    console.log('\n🔬 STEP 6: FIELD TYPE ANALYSIS');
    const typeSample = await db.collection('seo_page_data')
      .findOne({
        projectId: new ObjectId(projectId),
        [fieldNameUsed]: { $exists: true, $ne: null, $ne: [] }
      });
    
    let fieldType = 'unknown';
    if (typeSample && typeSample[fieldNameUsed]) {
      fieldType = Array.isArray(typeSample[fieldNameUsed]) ? 'array' : typeof typeSample[fieldNameUsed];
    }
    console.log(`Field type: ${fieldType}`);
    
    // Step 7: Final validation
    console.log('\n✅ STEP 7: FINAL VALIDATION');
    
    const withSchema = withFieldNotEmpty.length; // Use not empty as the definitive count
    const withoutSchemaCount = totalPages.length - withSchema;
    const coverage = totalPages.length > 0 ? Math.round((withSchema / totalPages.length) * 100) : 0;
    
    const result = {
      totalPages: totalPages.length,
      withSchema: withSchema,
      withoutSchema: withoutSchemaCount,
      coverage: coverage,
      fieldNameUsed: fieldNameUsed,
      fieldType: fieldType
    };
    
    console.log('\n📋 FINAL RESULTS:');
    console.log(JSON.stringify(result, null, 2));
    
    await mongoose.connection.close();
    console.log('\n🏁 Analysis completed');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the analysis
debugStructuredData().catch(console.error);
