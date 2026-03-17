import KeywordResearchService from '../service/keywordResearchService.js';

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
