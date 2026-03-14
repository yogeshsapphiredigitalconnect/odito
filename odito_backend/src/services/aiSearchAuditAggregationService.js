import mongoose from 'mongoose';

/**
 * AI Search Audit Aggregation Service
 * 
 * Aggregates dashboard metrics from seo_ai_visibility collection
 * using MongoDB aggregation pipeline for optimal performance.
 */

/**
 * Get AI Search Audit metrics aggregation for a project
 * @param {string} projectId - Project ID to filter aggregation
 * @returns {Promise<Object>} - Aggregated dashboard metrics
 */
async function getAISearchAuditAggregation(projectId) {
  // Validate projectId
  if (!projectId || typeof projectId !== 'string') {
    throw new Error('INVALID_PROJECT_ID');
  }

  try {
    // Convert to ObjectId for MongoDB query
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    // Main aggregation pipeline for dashboard metrics
    const aggregationResult = await mongoose.connection.db.collection('seo_ai_visibility').aggregate([
      // Stage 1: Filter by projectId and ai_visibility_available
      {
        $match: {
          projectId: projectObjectId,
          ai_visibility_available: true
        }
      },

      // Stage 2: Calculate averages for all dashboard metrics
      {
        $group: {
          _id: null,
          ai_readiness: { $avg: "$ai_visibility.dashboard_metrics.ai_readiness" },
          schema_coverage: { $avg: "$ai_visibility.dashboard_metrics.schema_coverage" },
          faq_optimization: { $avg: "$ai_visibility.dashboard_metrics.faq_optimization" },
          conversational_score: { $avg: "$ai_visibility.dashboard_metrics.conversational_score" },
          ai_snippet_probability: { $avg: "$ai_visibility.dashboard_metrics.ai_snippet_probability" },
          ai_citation_rate: { $avg: "$ai_visibility.dashboard_metrics.ai_citation_rate" },
          knowledge_graph: { $avg: "$ai_visibility.dashboard_metrics.knowledge_graph" },
          entity_coverage: { $avg: "$ai_visibility.dashboard_metrics.entity_coverage" },
          llm_indexability: { $avg: "$ai_visibility.dashboard_metrics.llm_indexability" },
          structured_data_depth: { $avg: "$ai_visibility.dashboard_metrics.structured_data_depth" },
          entity_coverage_pct: { $avg: "$ai_visibility.dashboard_metrics.entity_coverage_pct" },
          geo_score: { $avg: "$ai_visibility.dashboard_metrics.geo_score" },
          total_pages: { $sum: 1 }
        }
      },

      // Stage 3: Round all values to integers and handle nulls
      {
        $project: {
          _id: 0,
          ai_readiness: { $ifNull: [{ $round: "$ai_readiness" }, 0] },
          schema_coverage: { $ifNull: [{ $round: "$schema_coverage" }, 0] },
          faq_optimization: { $ifNull: [{ $round: "$faq_optimization" }, 0] },
          conversational_score: { $ifNull: [{ $round: "$conversational_score" }, 0] },
          ai_snippet_probability: { $ifNull: [{ $round: "$ai_snippet_probability" }, 0] },
          ai_citation_rate: { $ifNull: [{ $round: "$ai_citation_rate" }, 0] },
          knowledge_graph: { $ifNull: [{ $round: "$knowledge_graph" }, 0] },
          entity_coverage: { $ifNull: [{ $round: "$entity_coverage" }, 0] },
          llm_indexability: { $ifNull: [{ $round: "$llm_indexability" }, 0] },
          structured_data_depth: { $ifNull: [{ $round: "$structured_data_depth" }, 0] },
          entity_coverage_pct: { $ifNull: [{ $round: "$entity_coverage_pct" }, 0] },
          geo_score: { $ifNull: [{ $round: "$geo_score" }, 0] },
          total_pages: { $ifNull: ["$total_pages", 0] }
        }
      }
    ]).toArray();

    // Handle case where no documents found
    if (!aggregationResult || aggregationResult.length === 0) {
      console.log(`[AI_SEARCH_AUDIT] No documents found for projectId: ${projectId}`);
      return {
        ai_readiness: 0,
        schema_coverage: 0,
        faq_optimization: 0,
        conversational_score: 0,
        ai_snippet_probability: 0,
        ai_citation_rate: 0,
        knowledge_graph: 0,
        entity_coverage: 0,
        llm_indexability: 0,
        structured_data_depth: 0,
        entity_coverage_pct: 0,
        geo_score: 0,
        total_pages: 0
      };
    }

    const result = aggregationResult[0];
    console.log(`[AI_SEARCH_AUDIT] Aggregation completed for projectId: ${projectId} | total_pages: ${result.total_pages}`);

    return result;

  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'BSONError' && error.message.includes('ObjectId')) {
      throw new Error('INVALID_PROJECT_ID');
    }

    // Handle MongoDB connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      throw new Error('DATABASE_CONNECTION_ERROR');
    }

    // Re-throw other errors with context
    throw new Error(`Failed to aggregate AI search audit data: ${error.message}`);
  }
}

export {
  getAISearchAuditAggregation
};
