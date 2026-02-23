import express from 'express';
import auth from '../../user/middleware/auth.js';
import { startAiVisibility, getAiVisibilityProjects, startAudit } from '../../ai_visibility/controller/aiVisibilityController.js';
import { getStandaloneAIVisibilityPages, getPageScore, getAIVisibilityPageIssues } from '../../app_user/controller/projectDataController.js';

const router = express.Router();

router.use(auth);
router.post('/start', startAiVisibility);
router.post('/start-audit', startAudit);
router.get('/projects', getAiVisibilityProjects);

// NEW: Get pages for standalone AI visibility records
router.get('/:id/pages', getStandaloneAIVisibilityPages);

// NEW: Get individual page score and details
router.get('/page-score', getPageScore);

// NEW: Get page issues for AI visibility
router.get('/page-issues', getAIVisibilityPageIssues);

export default router;
