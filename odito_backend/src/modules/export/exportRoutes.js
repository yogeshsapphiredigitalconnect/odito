import express from 'express';
import { exportSEOReport, exportAIReport, getExportStatus, previewSEOReport, previewAIReport } from './exportController.js';
import auth from '../user/middleware/auth.js';

const router = express.Router();

router.post('/projects/:id/export/seo', auth, exportSEOReport);
router.post('/projects/:id/export/ai', auth, exportAIReport);
router.get('/export/status', auth, getExportStatus);
router.get('/projects/:id/export/seo/preview', auth, previewSEOReport);
router.get('/projects/:id/export/ai/preview', auth, previewAIReport);

export default router;
