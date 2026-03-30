/**
 * Page 16 Service - Keyword Ranking Analysis
 * Provides keyword ranking insights from seo_rankings collection
 */

import mongoose from 'mongoose';

export class Page16Service {
  
  /**
   * Get Keyword Ranking Analysis for Page 16
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} - Keyword ranking analysis data
   */
  static async getKeywordRankingAnalysis(projectId) {
    console.log("Page16 getKeywordRankingAnalysis projectId:", projectId);
    
    try {
      // Validate projectId
      if (!projectId || typeof projectId !== 'string') {
        throw new Error('INVALID_PROJECT_ID');
      }

      // Convert to ObjectId for MongoDB query
      const projectObjectId = new mongoose.Types.ObjectId(projectId);

      // Get the latest ranking data for this project
      const SeoRanking = mongoose.model('SeoRanking');
      const rankingData = await SeoRanking
        .findOne({ project_id: projectObjectId })
        .sort({ created_at: -1 })
        .lean();

      console.log("Found ranking data:", rankingData);

      // Handle case where no ranking data found
      if (!rankingData || !rankingData.keywords || rankingData.keywords.length === 0) {
        return {
          success: false,
          error: {
            message: 'No keyword ranking data found for this project. Please run keyword ranking analysis first.',
            code: 'NO_RANKING_DATA'
          }
        };
      }

      const keywords = rankingData.keywords;
      
      // Calculate ranking metrics
      const totalKeywords = keywords.length;
      const rankingKeywords = keywords.filter(k => k.rank !== null && k.rank !== undefined).length;
      const notRankingKeywords = keywords.filter(k => k.rank === null || k.rank === undefined).length;
      
      const top3 = keywords.filter(k => k.rank !== null && k.rank <= 3).length;
      const top10 = keywords.filter(k => k.rank !== null && k.rank <= 10).length;
      const nearTop10 = keywords.filter(k => k.rank !== null && k.rank >= 11 && k.rank <= 25).length;

      // Process keywords for display
      const processedKeywords = keywords.map(k => ({
        keyword: k.keyword,
        rank: k.rank,
        status: k.rank === null || k.rank === undefined ? "not_ranking" : "ranking"
      }));

      // Check if all keywords are not ranking
      const allNotRanking = notRankingKeywords === totalKeywords;

      console.log("Keyword Ranking Analysis calculated:", {
        totalKeywords,
        rankingKeywords,
        notRankingKeywords,
        top3,
        top10,
        nearTop10,
        allNotRanking
      });

      return {
        success: true,
        data: {
          totalKeywords,
          rankingKeywords,
          notRankingKeywords,
          top3,
          top10,
          nearTop10,
          keywords: processedKeywords,
          allNotRanking,
          metadata: {
            domain: rankingData.domain,
            location: rankingData.location,
            lastUpdated: rankingData.created_at,
            generatedAt: new Date()
          }
        }
      };

    } catch (error) {
      console.error('[PAGE16_SERVICE_ERROR]', error);

      // Handle specific error cases
      if (error.message === 'INVALID_PROJECT_ID') {
        return {
          success: false,
          error: {
            message: 'Invalid projectId format',
            code: 'INVALID_PROJECT_ID'
          }
        };
      }

      // Handle MongoDB connection errors
      if (error.name === 'MongooseServerSelectionError') {
        return {
          success: false,
          error: {
            message: 'Database connection error. Please try again later.',
            code: 'DATABASE_CONNECTION_ERROR'
          }
        };
      }

      // Handle other errors
      return {
        success: false,
        error: {
          message: 'Failed to get keyword ranking analysis',
          code: 'SERVICE_ERROR',
          details: error.message
        }
      };
    }
  }
}
