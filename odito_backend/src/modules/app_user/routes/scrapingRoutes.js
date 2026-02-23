import express from 'express';
import { startScraping, getScrapingStatus, cancelAudit } from '../controller/scrapingController.js';
import auth from '../../user/middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(auth);

/**
 * @route   POST /api/seo/start-scraping
 * @desc    Start the new scraping pipeline for a project
 * @access  Private
 */
router.post('/start-scraping', startScraping);

/**
 * @route   GET /api/seo/scraping-status/:project_id
 * @desc    Get scraping status for a project
 * @access  Private
 */
router.get('/scraping-status/:project_id', getScrapingStatus);

/**
 * @route   POST /api/seo/cancel-audit
 * @desc    Cancel running audit for a project
 * @access  Private
 */
router.post('/cancel-audit', cancelAudit);

export default router;
