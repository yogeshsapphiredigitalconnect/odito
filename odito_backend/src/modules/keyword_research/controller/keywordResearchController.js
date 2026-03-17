import KeywordResearchService from '../service/keywordResearchService.js';
import { KeywordOpportunity } from '../model/KeywordResearch.js';
import { KeywordResearch } from '../model/KeywordResearch.js';
import mongoose from 'mongoose';

const keywordResearchService = new KeywordResearchService();

/**
 * POST /api/keywords/research
 * Trigger a keyword research job
 */
export const startResearch = async (req, res) => {
  try {
    const { projectId, keyword, depth } = req.body;

    // Validate required fields
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required'
      });
    }

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'keyword is required and must be a non-empty string'
      });
    }

    // Validate depth (optional, defaults to 2)
    const parsedDepth = depth ? parseInt(depth, 10) : 2;
    if (isNaN(parsedDepth) || parsedDepth < 1 || parsedDepth > 5) {
      return res.status(400).json({
        success: false,
        message: 'depth must be a number between 1 and 5'
      });
    }

    // Get userId from auth middleware or request
    const userId = req.user?._id || req.body.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    // Create and dispatch the job
    const job = await keywordResearchService.startKeywordResearch({
      userId,
      projectId,
      keyword: keyword.trim(),
      depth: parsedDepth
    });

    console.log(`[API] KEYWORD_RESEARCH started | jobId=${job._id} | keyword="${keyword}" | depth=${parsedDepth}`);

    res.status(201).json({
      success: true,
      message: 'Keyword research job created and dispatched',
      data: {
        jobId: job._id,
        keyword: keyword.trim(),
        depth: parsedDepth,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error(`[ERROR] KEYWORD_RESEARCH start failed | reason="${error.message}"`);
    res.status(500).json({
      success: false,
      message: 'Failed to start keyword research',
      error: error.message
    });
  }
};

/**
 * GET /api/keywords/intelligence?projectId=xxx
 * Get summary statistics and intent distribution
 */
export const getKeywordIntelligence = async (req, res) => {
  try {
    const { projectId } = req.query;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required'
      });
    }

    // CRITICAL: Use simple queries instead of heavy aggregation
    const [summary, intentCounts, totalKeywords] = await Promise.all([
      // Summary stats - simple aggregation
      KeywordOpportunity.aggregate([
        { $match: { project_id: mongoose.Types.ObjectId(projectId) } },
        {
          $group: {
            _id: null,
            total_volume: { $sum: "$search_volume" },
            avg_kd_score: { $avg: "$difficulty" },
            avg_cpc: { $avg: "$cpc" },
            keywords_with_ai: {
              $sum: { $cond: [{ $in: ["ai_overview", "$serp_features"] }, 1, 0] }
            },
            keywords_with_local: {
              $sum: { $cond: [{ $in: ["local_pack", "$serp_features"] }, 1, 0] }
            }
          }
        }
      ]),
      
      // Intent distribution - simple aggregation
      KeywordOpportunity.aggregate([
        { $match: { project_id: mongoose.Types.ObjectId(projectId) } },
        { $group: { _id: "$intent", count: { $sum: 1 } } }
      ]),
      
      // Total count - simple query
      KeywordOpportunity.countDocuments({ project_id: mongoose.Types.ObjectId(projectId) })
    ]);

    const result = {
      summary: summary[0] ? {
        total_volume: summary[0].total_volume || 0,
        avg_kd_score: Math.round(summary[0].avg_kd_score || 0),
        avg_cpc: Number((summary[0].avg_cpc || 0).toFixed(2)),
        ai_overview_count: summary[0].keywords_with_ai || 0,
        local_pack_count: summary[0].keywords_with_local || 0
      } : {
        total_volume: 0,
        avg_kd_score: 0,
        avg_cpc: 0,
        ai_overview_count: 0,
        local_pack_count: 0
      },
      intentDistribution: intentCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      total_keywords: totalKeywords
    };
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[ERROR] KEYWORD_INTELLIGENCE failed | reason="${error.message}"`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch keyword intelligence',
      error: error.message
    });
  }
};

/**
 * GET /api/keywords?projectId=xxx&page=1&limit=50&sort=search_volume&order=desc&intent=all
 * Get paginated keyword list
 */
export const getKeywordList = async (req, res) => {
  try {
    const { 
      projectId, 
      page = 1, 
      limit = 50, 
      sort = 'search_volume', 
      order = 'desc', 
      intent = 'all' 
    } = req.query;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required'
      });
    }

    // Build match filter
    const matchFilter = { project_id: mongoose.Types.ObjectId(projectId) };
    if (intent !== 'all') {
      matchFilter.intent = intent;
    }

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // CRITICAL: Use simple find with pagination instead of aggregation
    const [keywords, totalCount] = await Promise.all([
      KeywordOpportunity.find(matchFilter)
        .sort(sortObj)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean(), // Use lean for better performance
      KeywordOpportunity.countDocuments(matchFilter)
    ]);

    // Transform to match frontend expectations
    const transformedKeywords = keywords.map(kw => ({
      keyword: kw.keyword,
      vol: kw.search_volume,
      kd: kw.difficulty,
      cpc: kw.cpc,
      intent: kw.intent,
      serpTypes: kw.serp_features || [],
      trend: { monthly: 0, quarterly: 0, yearly: 0 }, // Mock for now
      monthly: new Array(12).fill(kw.search_volume || 0), // Mock for now
      depth: 1, // Mock for now
      backlinks: 0, // Mock for now
      refDomains: 0, // Mock for now
      relatedKws: [] // Mock for now
    }));
    
    res.json({
      success: true,
      data: {
        keywords: transformedKeywords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error(`[ERROR] KEYWORD_LIST failed | reason="${error.message}"`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch keyword list',
      error: error.message
    });
  }
};

/**
 * GET /api/keywords/:keyword?projectId=xxx
 * Get detailed information for a specific keyword
 */
export const getKeywordDetail = async (req, res) => {
  try {
    const { keyword } = req.params;
    const { projectId } = req.query;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required'
      });
    }

    // CRITICAL: Use job_id to link collections, not keyword matching
    const keywordData = await KeywordOpportunity.findOne({
      project_id: mongoose.Types.ObjectId(projectId),
      keyword: keyword
    }).lean();

    if (!keywordData) {
      return res.status(404).json({
        success: false,
        message: 'Keyword not found'
      });
    }

    // Get related research data via job_id (the correct relationship)
    let researchData = null;
    if (keywordData.job_id) {
      researchData = await KeywordResearch.findOne({
        job_id: keywordData.job_id
      }).lean();
    }

    // Transform to match frontend expectations
    const detail = {
      keyword: keywordData.keyword,
      vol: keywordData.search_volume,
      kd: keywordData.difficulty,
      cpc: keywordData.cpc,
      intent: keywordData.intent,
      serpTypes: keywordData.serp_features || [],
      trend: { monthly: 0, quarterly: 0, yearly: 0 }, // Calculate from research data if available
      monthly: new Array(12).fill(keywordData.search_volume || 0), // Extract from research data if available
      depth: 1, // Calculate from research data if available
      backlinks: 0, // Mock for now
      refDomains: 0, // Mock for now
      relatedKws: [] // Extract from research data if available
    };

    res.json({ success: true, data: detail });
  } catch (error) {
    console.error(`[ERROR] KEYWORD_DETAIL failed | reason="${error.message}"`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch keyword detail',
      error: error.message
    });
  }
};
