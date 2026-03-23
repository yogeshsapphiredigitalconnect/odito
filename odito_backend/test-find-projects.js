/**
 * Find available projects to test with
 */

import mongoose from 'mongoose';

async function findProjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/odito_dev');
    console.log('Connected to odito_dev database');

    const db = mongoose.connection.db;
    
    // Find all projects with ai_visibility data
    const projects = await db.collection('seoprojects')
      .find({ 
        ai_visibility: { $exists: true, $ne: null }
      })
      .limit(5)
      .toArray();

    console.log('\n=== Available Projects with AI Visibility ===');
    projects.forEach((project, index) => {
      console.log(`${index + 1}. Project ID: ${project._id}`);
      console.log(`   Name: ${project.project_name}`);
      console.log(`   URL: ${project.main_url}`);
      console.log(`   AI Visibility Score: ${project.ai_visibility?.score || 'N/A'}`);
      console.log(`   Categories:`, project.ai_visibility?.categories || {});
      console.log('---');
    });

    if (projects.length > 0) {
      console.log(`\n✅ Found ${projects.length} projects with AI visibility data`);
      console.log(`\nUse this Project ID for testing: ${projects[0]._id}`);
    } else {
      console.log('\n❌ No projects found with AI visibility data');
      
      // Find any projects
      const allProjects = await db.collection('seoprojects').find({}).limit(3).toArray();
      console.log('\n=== Available Projects (any) ===');
      allProjects.forEach((project, index) => {
        console.log(`${index + 1}. Project ID: ${project._id}`);
        console.log(`   Name: ${project.project_name}`);
        console.log(`   URL: ${project.main_url}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

findProjects();
