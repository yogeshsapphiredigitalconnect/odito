import express from 'express';
import { 
  generateScript, 
  getScript, 
  deleteScript, 
  regenerateScript 
} from '../controllers/aiScript.controller.js';
import auth from '../../user/middleware/auth.js';

const router = express.Router();

/**
 * AI Video Script Routes
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(auth);

/**
 * POST /api/ai-video/script
 * Generate or retrieve a video narration script for a project
 */
router.post('/script', generateScript);

/**
 * POST /api/ai-video/script/regenerate/:projectId
 * Force regenerate script for a project
 * ⚠️ MUST come before other /script/:projectId routes to match correctly
 */
router.post('/script/regenerate/:projectId', regenerateScript);

/**
 * GET /api/ai-video/script/:projectId
 * Get existing script for a project
 */
router.get('/script/:projectId', getScript);

/**
 * DELETE /api/ai-video/script/:projectId
 * Delete script for a project
 */
router.delete('/script/:projectId', deleteScript);

export default router;
