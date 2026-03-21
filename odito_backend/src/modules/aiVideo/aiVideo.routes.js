/**
 * AI Video Routes
 * Handles AI video script generation routes
 */

import { Router } from 'express';
import { AIVideoController } from './aiVideo.controller.js';
import auth from '../user/middleware/auth.js';

const router = Router();

// DEBUG LOG
console.log("🎬 AI Video Routes initialized!");

// Apply authentication middleware to all routes
router.use(auth);

/**
 * @route GET /api/ai-video/:projectId
 * @desc Generate AI video script for a project
 * @access Private
 */
router.get('/:projectId', (req, res, next) => {
  console.log("🎬 AI Video Route Matched!", { 
    projectId: req.params.projectId,
    originalUrl: req.originalUrl,
    method: req.method
  });
  AIVideoController.generateVideoScript(req, res, next);
});

/**
 * @route GET /api/ai-video/:projectId/raw-json
 * @desc Fetch and validate all audit pages data as raw JSON
 * @access Private
 */
router.get('/:projectId/raw-json', (req, res, next) => {
  console.log("📊 Raw Audit Data Route Matched!", { 
    projectId: req.params.projectId,
    originalUrl: req.originalUrl,
    method: req.method
  });
  AIVideoController.getRawAuditData(req, res, next);
});

/**
 * @route POST /api/ai-video/:projectId/generate-from-json
 * @desc Generate AI video script from raw audit JSON data
 * @access Private
 */
router.post('/:projectId/generate-from-json', (req, res, next) => {
  console.log("🤖 Generate From JSON Route Matched!", { 
    projectId: req.params.projectId,
    originalUrl: req.originalUrl,
    method: req.method
  });
  AIVideoController.generateFromRawJSON(req, res, next);
});

/**
 * @route POST /api/ai-video/:projectId/generate-from-raw-json
 * @desc Generate AI video script from raw JSON data
 * @access Private
 */
router.post('/:projectId/generate-from-raw-json', (req, res, next) => {
  console.log("🤖 Generate From Raw JSON Route Matched!", { 
    projectId: req.params.projectId,
    originalUrl: req.originalUrl,
    method: req.method
  });
  AIVideoController.generateFromRawJSON(req, res, next);
});

export { router as aiVideoRoutes };
