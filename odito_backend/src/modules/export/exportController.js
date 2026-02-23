import { getSEOExportData, validateProjectAccess } from './seoExportService.js';
import { getAIExportData, validateAIAccess } from './aiExportService.js';
import { renderSEOTemplate, renderAITemplate } from './templateRenderer.js';
import { generatePDFFromHTML, getBrowserStats } from './pdfGenerator.js';

async function handleExport(req, res, type) {
  const startTime = Date.now();
  const { id: projectId } = req.params;

  console.log(`[EXPORT] ${type} export requested | projectId=${projectId} | userId=${req.user?._id}`);

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

    let exportData;
    let validationResult;
    let gatherTimeMs = 0;

    if (type === 'seo') {
      validationResult = await validateProjectAccess(projectId, req.user?._id);
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
      exportData = result.data;
      gatherTimeMs = result.gatherTimeMs || 0;

    } else {
      validationResult = await validateAIAccess(projectId, req.user?._id);
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
      exportData = result.data;
      gatherTimeMs = result.gatherTimeMs || 0;
    }

    console.log(`[EXPORT] Template rendering started | type=${type}`);
    let renderResult;
    if (type === 'seo') {
      renderResult = renderSEOTemplate(exportData);
    } else {
      renderResult = renderAITemplate(exportData);
    }

    if (!renderResult.success) {
      throw new Error(renderResult.error);
    }

    console.log(`[EXPORT] PDF generation started | type=${type}`);
    const pdfResult = await generatePDFFromHTML(renderResult.html, {
      format: 'A4',
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      printBackground: true,
      scale: 1
    });

    if (!pdfResult.success) {
      throw new Error(pdfResult.error);
    }

    const totalTime = Date.now() - startTime;
    console.log(`[EXPORT] ${type.toUpperCase()} export completed | time=${totalTime}ms | size=${pdfResult.buffer.length} bytes`);

    const filename = type === 'seo'
      ? `seo-report-${projectId}-${Date.now()}.pdf`
      : `ai-report-${projectId}-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfResult.buffer.length);
    res.setHeader('X-Generation-Time-Ms', totalTime);
    res.setHeader('X-Data-Gather-Time-Ms', gatherTimeMs);

    return res.send(pdfResult.buffer);

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[EXPORT] ${type.toUpperCase()} export failed | projectId=${projectId} | error=${error.message}`);
    console.error(`[EXPORT] Full error stack:`);
    console.error(error.stack);
    
    return res.status(500).json({
      success: false,
      message: `Failed to generate ${type.toUpperCase()} report`,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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
