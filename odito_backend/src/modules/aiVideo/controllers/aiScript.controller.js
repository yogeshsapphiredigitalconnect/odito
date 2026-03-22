import { AiScriptService } from '../services/aiScript.service.js';
import AIScript from '../models/aiScript.model.js';

/**
 * AI Script Controller
 * Handles API endpoints for script generation
 */

/**
 * POST /api/ai-video/script
 * Generate or retrieve a video narration script for a project
 * 
 * @body {projectId} string - Project ID
 * @returns {Object} Generated script
 */
export const generateScript = async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.user?._id;

    // Validate input
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    console.log(`[SCRIPT_CTRL] Generate script request | projectId=${projectId} | userId=${userId}`);

    // Extract auth token from request header
    const authToken = req.headers.authorization?.split(' ')[1];

    // Generate script using service
    const result = await AiScriptService.generateScript(projectId, {
      forceRegenerate: req.body.forceRegenerate || false,
      authToken: authToken
    });

    // Return success response
    return res.status(200).json({
      success: true,
      script: result.script,
      isExisting: result.isExisting || false,
      processingTime: result.processingTime,
      message: result.isExisting ? 'Existing script retrieved' : 'Script generated successfully'
    });

  } catch (error) {
    console.error('[SCRIPT_CTRL] Generate script error:', {
      message: error.message,
      projectId: req.body?.projectId,
      stack: error.stack
    });

    // Return error response with appropriate status code
    if (error.message.includes('Project not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('API key') || error.message.includes('configuration')) {
      return res.status(503).json({
        success: false,
        message: 'AI service temporarily unavailable. Please try again later.'
      });
    }

    if (error.message.includes('quota')) {
      return res.status(429).json({
        success: false,
        message: 'AI service quota exceeded. Please try again later.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to generate script',
      error: error.message
    });
  }
};

/**
 * GET /api/ai-video/script/:projectId
 * Get existing script for a project
 * 
 * @param {projectId} string - Project ID (URL param)
 * @returns {Object} Script data
 */
export const getScript = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?._id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required'
      });
    }

    console.log(`[SCRIPT_CTRL] Get script request | projectId=${projectId}`);

    const script = await AiScriptService.getScriptByProjectId(projectId);

    if (!script) {
      return res.status(404).json({
        success: false,
        message: 'Script not found for this project. Generate a script first.'
      });
    }

    return res.status(200).json({
      success: true,
      script: script.script,
      status: script.status,
      createdAt: script.createdAt,
      updatedAt: script.updatedAt,
      processingTime: script.processingTime
    });

  } catch (error) {
    console.error('[SCRIPT_CTRL] Get script error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve script',
      error: error.message
    });
  }
};

/**
 * DELETE /api/ai-video/script/:projectId
 * Delete script for a project
 * 
 * @param {projectId} string - Project ID (URL param)
 * @returns {Object} Success response
 */
export const deleteScript = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?._id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required'
      });
    }

    console.log(`[SCRIPT_CTRL] Delete script request | projectId=${projectId}`);

    // Verify ownership
    const script = await AIScript.findOne({ projectId }).select('userId');
    if (script && script.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this script'
      });
    }

    await AiScriptService.deleteScript(projectId);

    return res.status(200).json({
      success: true,
      message: 'Script deleted successfully'
    });

  } catch (error) {
    console.error('[SCRIPT_CTRL] Delete script error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete script',
      error: error.message
    });
  }
};

/**
 * POST /api/ai-video/script/regenerate/:projectId
 * Force regenerate script for a project
 * 
 * @param {projectId} string - Project ID (URL param)
 * @returns {Object} Regenerated script
 */
export const regenerateScript = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?._id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required'
      });
    }

    console.log(`[SCRIPT_CTRL] Regenerate script request | projectId=${projectId}`);

    const result = await AiScriptService.generateScript(projectId, {
      forceRegenerate: true
    });

    return res.status(200).json({
      success: true,
      script: result.script,
      processingTime: result.processingTime,
      message: 'Script regenerated successfully'
    });

  } catch (error) {
    console.error('[SCRIPT_CTRL] Regenerate script error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to regenerate script',
      error: error.message
    });
  }
};

export default {
  generateScript,
  getScript,
  deleteScript,
  regenerateScript
};
