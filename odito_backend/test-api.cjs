const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/odito_dev')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const { ObjectId } = mongoose.Types;
    
    const projectId = '69b3bbc1ce3ae14c2d387ab6';
    const issueCode = 'HEADING_GENERIC_PHRASE';
    const projectIdObj = new ObjectId(projectId);
    
    console.log('Testing aggregation for:', { projectId, issueCode });
    
    // Test if issue exists for this project
    const issueExists = await db.collection('seo_page_issues').findOne({
      projectId: projectIdObj,
      issue_code: issueCode
    });
    
    console.log('Issue exists:', !!issueExists);
    
    if (issueExists) {
      // Test the aggregation pipeline
      const totalCountPipeline = [
        { $match: { projectId: projectIdObj, issue_code: issueCode } },
        { $group: { _id: '$page_url' } },
        { $count: 'total' }
      ];
      
      const totalCountResult = await db.collection('seo_page_issues').aggregate(totalCountPipeline).toArray();
      console.log('Total count result:', totalCountResult);
      
      const urlsPipeline = [
        { $match: { projectId: projectIdObj, issue_code: issueCode } },
        { $group: { _id: '$page_url', created_at: { $first: '$created_at' } } },
        { $sort: { _id: 1 } },
        { $skip: 0 },
        { $limit: 50 },
        {
          $project: {
            _id: 0,
            page_url: '$_id',
            created_at: 1
          }
        }
      ];
      
      const urls = await db.collection('seo_page_issues').aggregate(urlsPipeline).toArray();
      console.log('URLs found:', urls.length);
      console.log('Sample URLs:', urls.slice(0, 3));
    } else {
      // Get available issue codes for this project
      const availableIssues = await db.collection('seo_page_issues').distinct('issue_code', {
        projectId: projectIdObj
      });
      console.log('Available issue codes for this project:', availableIssues.slice(0, 10));
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
