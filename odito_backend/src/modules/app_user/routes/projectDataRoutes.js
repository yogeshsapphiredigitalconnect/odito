import express from 'express';
import auth from '../../user/middleware/auth.js';
import {
  getProjectLinks,
  getProjectPages,
  getProjectPerformance,
  getProjectSummary,
  getProjectIssues,
  getProjectIssuesByPage,
  getPageIssues,
  getGoogleVisibilityStatus,
  connectGoogleVisibility,
  disconnectGoogleVisibility,
  getAIVisibilityWorstPages
} from '../controller/projectDataController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Project data routes
router.get('/projects/:projectId/links', getProjectLinks);
router.get('/projects/:projectId/pages', getProjectPages);
router.get('/projects/:projectId/performance', getProjectPerformance);
router.get('/projects/:projectId/summary', getProjectSummary);
router.get('/projects/:projectId/issues', getProjectIssues);
router.get('/projects/:projectId/issues-by-page', getProjectIssuesByPage);
router.get('/projects/:projectId/page-issues', getPageIssues);

// AI Visibility routes
router.get('/projects/:projectId/ai-visibility/worst-pages', getAIVisibilityWorstPages);

// Google Visibility routes
router.get('/projects/:projectId/google-visibility/status', getGoogleVisibilityStatus);
router.get('/projects/:projectId/google-visibility/connect', connectGoogleVisibility);
router.delete('/projects/:projectId/google-visibility/disconnect', disconnectGoogleVisibility);

export default router;
