import express from 'express';
import { startResearch } from '../controller/keywordResearchController.js';

const router = express.Router();

// POST /api/keywords/research - Start keyword research
router.post('/research', startResearch);

export default router;
