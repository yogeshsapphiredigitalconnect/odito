import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function handleExport(req, res, type) {
  const startTime = Date.now();
  const { id: projectId } = req.params;

  console.log(`✅ STATIC PDF EXPORT TRIGGERED | type=${type} | projectId=${projectId}`);

  try {
    // Path to the reference PDF file - fix the path construction
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'pdf-reference',
      'odito-cover-v2.pdf'
    );
    
    console.log(`[EXPORT] Serving static PDF from: ${filePath}`);
    console.log(`[EXPORT] File exists check: ${fs.existsSync(filePath)}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`[EXPORT] Reference PDF not found at: ${filePath}`);
      return res.status(404).json({
        success: false,
        message: 'Reference PDF file not found'
      });
    }

    const filename = type === 'seo' 
      ? `seo-report-${projectId}-${Date.now()}.pdf`
      : `ai-report-${projectId}-${Date.now()}.pdf`;

    const totalTime = Date.now() - startTime;
    console.log(`[EXPORT] Static PDF download completed | time=${totalTime}ms`);

    // Use res.download for proper file download
    return res.download(filePath, filename);

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[EXPORT] Static PDF export failed | projectId=${projectId} | error=${error.message}`);
    
    return res.status(500).json({
      success: false,
      message: 'Export failed',
      error: error.message,
      generationTimeMs: totalTime
    });
  }
}

export async function exportSEOReport(req, res) {
  return handleExport(req, res, 'seo');
}

export async function exportAIReport(req, res) {
  return handleExport(req, res, 'ai');
}

export async function getExportStatus(req, res) {
  try {
    const browserStats = getBrowserStats();

    return res.json({
      success: true,
      data: {
        browser: browserStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get export status',
      error: error.message
    });
  }
}

export async function previewSEOReport(req, res) {
  const { id: projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: 'Project ID is required'
    });
  }

  try {
    const mongoose = await import('mongoose');
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const validationResult = await validateProjectAccess(projectId, req.user?._id);
    if (!validationResult.valid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    const result = await getSEOExportData(projectId, req.user?._id);
    if (!result.success) {
      throw new Error(result.error);
    }

    const renderResult = renderSEOTemplate(result.data);
    if (!renderResult.success) {
      throw new Error(renderResult.error);
    }

    return res.json({
      success: true,
      data: {
        html: renderResult.html,
        gatherTimeMs: result.gatherTimeMs
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to preview SEO report',
      error: error.message
    });
  }
}

export async function previewAIReport(req, res) {
  const { id: projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: 'Project ID is required'
    });
  }

  try {
    const mongoose = await import('mongoose');
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const validationResult = await validateAIAccess(projectId, req.user?._id);
    if (!validationResult.valid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    const result = await getAIExportData(projectId, req.user?._id);
    if (!result.success) {
      throw new Error(result.error);
    }

    const renderResult = renderAITemplate(result.data);
    if (!renderResult.success) {
      throw new Error(renderResult.error);
    }

    return res.json({
      success: true,
      data: {
        html: renderResult.html,
        gatherTimeMs: result.gatherTimeMs
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to preview AI report',
      error: error.message
    });
  }
}

export default {
  exportSEOReport,
  exportAIReport,
  getExportStatus,
  previewSEOReport,
  previewAIReport
};
