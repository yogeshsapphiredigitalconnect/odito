const express = require('express');
const PDFReportController = require('../controllers/pdfReportController');

function createPDFReportRoutes(db) {
    const router = express.Router();
    const controller = new PDFReportController(db);

    // GET /api/pdf-report/:projectId
    router.get('/:projectId', controller.getPDFReport.bind(controller));

    return router;
}

module.exports = createPDFReportRoutes;
