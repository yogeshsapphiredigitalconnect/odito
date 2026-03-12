import express from 'express';
import auth from '../../user/middleware/auth.js';
import {
  createSeoProject,
  getAllSeoProjects,
  getSeoProjectById,
  updateSeoProject,
  updateSeoProjectStatus,
  deleteSeoProject,
  getProjectScrapingSummary,
  getProjectsNeedingScrape,
  getProjectDashboard
} from '../controller/seoProjectController.js';
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
  getAIVisibilityPage,
  getAIVisibilityPages,
  getAIVisibilityWorstPages,
  getAIVisibilityEntityGraph,
  getOnPageIssues,
  getTechnicalChecks
} from '../controller/projectDataController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Project routes
router.post('/projects', createSeoProject);
router.get('/projects', getAllSeoProjects);
router.get('/projects/:id', getSeoProjectById);
router.put('/projects/:id', updateSeoProject);
router.patch('/projects/:id/status', updateSeoProjectStatus);
router.delete('/projects/:id', deleteSeoProject);

// Scraping-related routes
router.get('/projects/:id/scraping-summary', getProjectScrapingSummary);
router.get('/projects-needing-scrape', getProjectsNeedingScrape);

// Project data display routes
router.get('/projects/:id/links', getProjectLinks);
router.get('/projects/:id/pages', getProjectPages);
router.get('/projects/:id/performance', getProjectPerformance);
router.get('/projects/:id/summary', getProjectSummary);
router.get('/projects/:id/dashboard', getProjectDashboard);
router.get('/projects/:id/issues', getProjectIssues);
router.get('/projects/:id/issues-by-page', getProjectIssuesByPage);
router.get('/projects/:id/page-issues', getPageIssues);
router.get('/projects/:id/onpage-issues', getOnPageIssues);
router.get('/projects/:id/technical-checks', getTechnicalChecks);

// Google Visibility routes
router.get('/projects/:id/google-visibility/status', getGoogleVisibilityStatus);
router.get('/projects/:id/google-visibility/connect', connectGoogleVisibility);
router.delete('/projects/:id/google-visibility/disconnect', disconnectGoogleVisibility);

// AI Visibility routes
router.get('/projects/:id/ai-visibility/page', getAIVisibilityPage);
router.get('/projects/:id/ai-visibility/pages', getAIVisibilityPages);
router.get('/projects/:id/ai-visibility/worst-pages', getAIVisibilityWorstPages);
router.get('/projects/:id/ai-visibility/entity-graph', getAIVisibilityEntityGraph);

// Test endpoint to verify routes are working
router.get('/test-routes', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Routes are working',
    availableRoutes: [
      '/projects/:id/links',
      '/projects/:id/pages', 
      '/projects/:id/performance',
      '/projects/:id/summary',
      '/projects/:id/dashboard',
      '/projects/:id/issues',
      '/projects/:id/issues-by-page',
      '/projects/:id/page-issues',
      '/projects/:id/onpage-issues',
      '/projects/:id/technical-checks',
      '/projects/:id/screenshot'
    ]
  });
});

export default router;
