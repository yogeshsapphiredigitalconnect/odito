import express from 'express';
import authRoutes from '../modules/user/routes/authRoutes.js';
import oauthRoutes from '../modules/user/routes/oauth.routes.js';
import seoProjectRoutes from '../modules/app_user/routes/seoProjectRoutes.js';
import scrapingRoutes from '../modules/app_user/routes/scrapingRoutes.js';
import jobRoutes from '../modules/jobs/routes/jobRoutes.js';
import workerRoutes from '../modules/jobs/routes/workerRoutes.js';
import searchConsoleRoutes from '../modules/app_user/routes/searchConsoleRoutes.js';
import analyticsRoutes from '../modules/app_user/routes/analyticsRoutes.js';
import businessProfileRoutes from '../modules/app_user/routes/businessProfileRoutes.js';
import webhookRoutes from '../modules/payments/routes/webhookRoutes.js';
import paymentRoutes from '../modules/payments/routes/paymentRoutes.js';
import aiVisibilityRoutes from '../modules/app_user/routes/aiVisibilityRoutes.js';
import exportRoutes from '../modules/export/exportRoutes.js';
import keywordResearchRoutes from '../modules/keyword_research/routes/keywordResearchRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/auth/oauth', oauthRoutes);
// All project-related routes (including project data)
router.use('/app_user', seoProjectRoutes);
// Scraping pipeline routes
router.use('/seo', scrapingRoutes);
// Search Console routes (matches frontend API calls)
router.use('/projects', searchConsoleRoutes);
// Analytics routes (matches frontend API calls)
router.use('/projects', analyticsRoutes);
// Business Profile routes (matches frontend API calls)
router.use('/projects', businessProfileRoutes);
// Job status update routes (for Python worker callbacks)
router.use('/jobs', jobRoutes);
// Worker job claiming routes
router.use('/workers', workerRoutes);
// Payment webhook routes
router.use('/webhooks', webhookRoutes);
// Payment API routes
router.use('/payments', paymentRoutes);
// AI Visibility routes
router.use('/ai-visibility', aiVisibilityRoutes);
// Export routes
router.use('/export', exportRoutes);
// Keyword Research routes
router.use('/keywords', keywordResearchRoutes);

export default router;
