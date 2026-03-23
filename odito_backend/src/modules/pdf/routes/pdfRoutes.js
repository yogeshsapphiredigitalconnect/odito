/**
 * PDF Routes
 * API endpoints for PDF data generation
 */

import { Router } from 'express';
import { PDFDataController } from '../controller/pdfDataController.js';
import auth from '../../../modules/user/middleware/auth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(auth);

/**
 * @route GET /api/pdf/:projectId
 * @desc Generate complete PDF data for a project
 * @access Private
 */
router.get('/:projectId', PDFDataController.generatePDFData);

/**
 * @route GET /api/pdf/:projectId/section/:section
 * @desc Generate specific PDF section data
 * @access Private
 */
router.get('/:projectId/section/:section', PDFDataController.generateSectionData);

/**
 * @route GET /api/pdf/:projectId/cover
 * @desc Generate cover page data
 * @access Private
 */
router.get('/:projectId/cover', PDFDataController.generateCoverPageData);

/**
 * @route GET /api/pdf/:projectId/page08
 * @desc Generate Page 08 - On-Page SEO Audit data
 * @access Private
 */
router.get('/:projectId/page08', PDFDataController.getPage08Data);

/**
 * @route GET /api/pdf/:projectId/page09
 * @desc Generate Page 09 - Structured Data Analysis data
 * @access Private
 */
router.get('/:projectId/page09', PDFDataController.getPage09Data);

/**
 * @route GET /api/pdf/:projectId/page10
 * @desc Generate Page 10 - Technical SEO Health data
 * @access Private
 */
router.get('/:projectId/page10', PDFDataController.getPage10Data);

/**
 * @route GET /api/pdf/:projectId/page11
 * @desc Generate Page 11 - Crawlability Analysis data
 * @access Private
 */
router.get('/:projectId/page11', PDFDataController.getPage11Data);

/**
 * @route GET /api/pdf/:projectId/page19
 * @desc Generate Page 19 - AI Visibility Overview data
 * @access Private
 */
router.get('/:projectId/page19', PDFDataController.getPage19Data);

/**
 * @route GET /api/pdf/:projectId/executive
 * @desc Generate executive summary data
 * @access Private
 */
router.get('/:projectId/executive', PDFDataController.generateExecutiveSummaryData);

/**
 * @route GET /api/pdf/:projectId/summary
 * @desc Get PDF data summary (metadata only)
 * @access Private
 */
router.get('/:projectId/summary', PDFDataController.getPDFDataSummary);

/**
 * @route GET /api/pdf/:projectId/validate
 * @desc Validate project for PDF generation
 * @access Private
 */
router.get('/:projectId/validate', PDFDataController.validateProject);

/**
 * @route GET /api/pdf/:projectId/status
 * @desc Get PDF generation status
 * @access Private
 */
router.get('/:projectId/status', PDFDataController.getGenerationStatus);

/**
 * @route GET /api/pdf/:projectId/metrics
 * @desc Get PDF generation metrics
 * @access Private
 */
router.get('/:projectId/metrics', PDFDataController.getGenerationMetrics);

/**
 * @route GET /api/pdf/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', PDFDataController.healthCheck);

/**
 * @route GET /api/pdf/sections
 * @desc Get available PDF sections
 * @access Public
 */
router.get('/sections', PDFDataController.getAvailableSections);

export default router;
