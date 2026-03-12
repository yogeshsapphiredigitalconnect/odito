/**
 * One-time script to create the compound index on seo_page_issues.
 *
 * Run:  node scripts/create-onpage-index.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function createIndex() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    const result = await db.collection('seo_page_issues').createIndex(
      { projectId: 1, issue_code: 1, page_url: 1 },
      { name: 'idx_project_issue_page', background: true }
    );

    console.log('Index created:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error creating index:', error);
    process.exit(1);
  }
}

createIndex();
