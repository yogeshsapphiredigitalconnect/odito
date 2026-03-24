/**
 * Video Data Routes
 * Routes for structured video data without scripts
 */

import express from 'express';
import { getVideoData, getPageVideoData, getSlideTemplate } from '../controller/videoData.controller.js';
import { ScoreOnlyResponseService } from '../../../services/scoreOnlyResponse.service.js';

const router = express.Router();

// Apply score-only validation middleware to all routes
router.use(ScoreOnlyResponseService.scoreOnlyMiddleware);

/**
 * GET /api/video/data/:projectId
 * Get complete structured video data for a project
 */
router.get('/data/:projectId', getVideoData);

/**
 * GET /api/video/data/:projectId/:pageType
 * Get page-specific video data for slides
 */
router.get('/data/:projectId/:pageType', getPageVideoData);

/**
 * GET /api/video/template/:slideType
 * Get template example for a slide type (for testing)
 */
router.get('/template/:slideType', getSlideTemplate);

export default router;
