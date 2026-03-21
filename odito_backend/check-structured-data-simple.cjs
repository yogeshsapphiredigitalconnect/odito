/**
 * Simple check for structured data in seo_page_data
 */

const mongoose = require('mongoose');

async function checkStructuredData() {
  const MONGODB_URI = 'mongodb://localhost:27017/odito_dev';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const { ObjectId } = mongoose.Types;
    
    // Check total documents in seo_page_data
    const totalDocs = await db.collection('seo_page_data').countDocuments();
    console.log(`Total documents in seo_page_data: ${totalDocs}`);
    
    if (totalDocs === 0) {
      console.log('❌ No data in seo_page_data collection');
      await mongoose.connection.close();
      return;
    }
    
    // Get project IDs with data
    const projects = await db.collection('seo_page_data').distinct('projectId');
    console.log(`Projects found: ${projects.length}`);
    
    // Find project with most pages
    let bestProject = null;
    let maxPages = 0;
    
    for (const projectId of projects) {
      const pageCount = await db.collection('seo_page_data')
        .distinct('url', { projectId: new ObjectId(projectId) });
      
      if (pageCount.length > maxPages) {
        maxPages = pageCount.length;
        bestProject = projectId;
      }
    }
    
    console.log(`Best project: ${bestProject} with ${maxPages} pages`);
    
    if (!bestProject) {
      console.log('❌ No valid project found');
      await mongoose.connection.close();
      return;
    }
    
    // Analyze structured data for best project
    const projectIdObj = new ObjectId(bestProject);
    
    // Get sample documents
    const samples = await db.collection('seo_page_data')
      .find({ projectId: projectIdObj })
      .limit(3)
      .toArray();
    
    console.log('\n📄 Sample Documents Analysis:');
    samples.forEach((doc, index) => {
      console.log(`\nSample ${index + 1}:`);
      console.log(`  URL: ${doc.url}`);
      console.log(`  Has structured_data: ${doc.structured_data ? 'YES' : 'NO'}`);
      
      if (doc.structured_data) {
        console.log(`  Type: ${Array.isArray(doc.structured_data) ? 'array' : typeof doc.structured_data}`);
        console.log(`  Length: ${Array.isArray(doc.structured_data) ? doc.structured_data.length : 'N/A'}`);
        
        if (Array.isArray(doc.structured_data) && doc.structured_data.length > 0) {
          const firstItem = doc.structured_data[0];
          console.log(`  First item @type: ${firstItem['@type'] || 'unknown'}`);
        }
      }
    });
    
    // Count pages with and without schema
    const totalPages = await db.collection('seo_page_data')
      .distinct('url', { projectId: projectIdObj });
    
    const withSchema = await db.collection('seo_page_data')
      .distinct('url', { 
        projectId: projectIdObj,
        structured_data: { $exists: true, $ne: null, $ne: [] }
      });
    
    const withoutSchema = await db.collection('seo_page_data')
      .distinct('url', { 
        projectId: projectIdObj,
        $or: [
          { structured_data: { $exists: false } },
          { structured_data: null },
          { structured_data: [] }
        ]
      });
    
    const coverage = totalPages.length > 0 ? Math.round((withSchema.length / totalPages.length) * 100) : 0;
    
    // Final results
    const result = {
      totalPages: totalPages.length,
      withSchema: withSchema.length,
      withoutSchema: withoutSchema.length,
      coverage: coverage,
      fieldNameUsed: 'structured_data',
      fieldType: 'array'
    };
    
    console.log('\n📋 FINAL RESULTS:');
    console.log(JSON.stringify(result, null, 2));
    
    await mongoose.connection.close();
    console.log('\n🏁 Analysis completed');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

checkStructuredData().catch(console.error);
