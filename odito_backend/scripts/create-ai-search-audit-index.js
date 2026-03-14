/**
 * Create MongoDB Index for AI Search Audit Performance
 * 
 * This script creates the optimal index for the seo_ai_visibility collection
 * to ensure fast aggregation queries for AI Search Audit metrics.
 */

import mongoose from 'mongoose';
import { getDatabaseConnection } from '../src/config/database.js';

async function createAISearchAuditIndex() {
  try {
    // Connect to database
    await getDatabaseConnection();
    console.log('🔗 Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('seo_ai_visibility');

    // Create compound index for optimal AI Search Audit aggregation performance
    // This index supports:
    // 1. Filtering by projectId
    // 2. Filtering by ai_visibility_available
    // 3. Accessing ai_visibility.dashboard_metrics.* fields
    console.log('📊 Creating AI Search Audit index...');

    const indexSpec = {
      projectId: 1,                    // Primary filter
      ai_visibility_available: 1,      // Secondary filter
      'ai_visibility.dashboard_metrics.ai_readiness': 1,
      'ai_visibility.dashboard_metrics.schema_coverage': 1,
      'ai_visibility.dashboard_metrics.faq_optimization': 1,
      'ai_visibility.dashboard_metrics.conversational_score': 1,
      'ai_visibility.dashboard_metrics.ai_snippet_probability': 1,
      'ai_visibility.dashboard_metrics.ai_citation_rate': 1,
      'ai_visibility.dashboard_metrics.knowledge_graph': 1,
      'ai_visibility.dashboard_metrics.entity_coverage': 1,
      'ai_visibility.dashboard_metrics.llm_indexability': 1,
      'ai_visibility.dashboard_metrics.structured_data_depth': 1,
      'ai_visibility.dashboard_metrics.entity_coverage_pct': 1,
      'ai_visibility.dashboard_metrics.geo_score': 1
    };

    const result = await collection.createIndex(indexSpec, {
      name: 'ai_search_audit_aggregation_idx',
      background: true, // Don't block database operations
      partialFilterExpression: {
        ai_visibility_available: true // Only index documents with AI visibility data
      }
    });

    console.log('✅ AI Search Audit index created successfully:', result);

    // Verify the index was created
    const indexes = await collection.listIndexes().toArray();
    const createdIndex = indexes.find(idx => idx.name === 'ai_search_audit_aggregation_idx');
    
    if (createdIndex) {
      console.log('✅ Verified index exists:', {
        name: createdIndex.name,
        keys: createdIndex.key,
        partialFilterExpression: createdIndex.partialFilterExpression
      });
    } else {
      console.error('❌ Index verification failed');
    }

    // Additional simple index for basic project queries (fallback)
    console.log('📊 Creating basic project index...');
    await collection.createIndex(
      { projectId: 1, ai_visibility_available: 1 },
      { 
        name: 'project_ai_available_idx',
        background: true 
      }
    );
    console.log('✅ Basic project index created');

    console.log('🎉 All AI Search Audit indexes created successfully!');

  } catch (error) {
    console.error('❌ Error creating AI Search Audit indexes:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the index creation
if (require.main === module) {
  createAISearchAuditIndex()
    .then(() => {
      console.log('🚀 AI Search Audit index creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 AI Search Audit index creation failed:', error);
      process.exit(1);
    });
}

export { createAISearchAuditIndex };
