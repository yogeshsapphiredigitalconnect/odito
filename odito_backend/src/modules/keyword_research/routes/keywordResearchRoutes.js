import express from 'express';
import { startResearch, getKeywordIntelligence, getKeywordList, getKeywordDetail, debugKeywordData } from '../controller/keywordResearchController.js';

const router = express.Router();

// POST /api/keywords/research - Start keyword research
router.post('/research', startResearch);

// GET /api/keywords/debug - Debug endpoint
router.get('/debug', debugKeywordData);

// GET /api/keywords/intelligence - Get summary statistics
router.get('/intelligence', getKeywordIntelligence);

// GET /api/keywords - Get paginated keyword list
router.get('/', getKeywordList);

// GET /api/keywords/:keyword - Get keyword details
router.get('/:keyword', getKeywordDetail);

export default router;
