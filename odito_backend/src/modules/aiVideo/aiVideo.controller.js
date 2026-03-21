/**
 * AI Video Controller
 * Handles AI video script generation requests
 */

import { AIVideoService } from './aiVideo.service.js';

export class AIVideoController {
  
  /**
   * Generate AI video script for a project
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static async generateVideoScript(req, res) {
    const startTime = Date.now();
    
    try {
      const { projectId } = req.params;
      
      // DEBUG LOG
      console.log("🎬 AI VIDEO API HIT!", { 
        projectId,
        userId: req.user?.id,
        method: req.method,
        url: req.originalUrl
      });
      
      // Validate projectId
      if (!projectId) {
        console.log("❌ Missing Project ID");
        return res.status(400).json({
          success: false,
          message: 'Project ID is required'
        });
      }
      
      console.log('🎯 Processing AI video script request...');
      
      // Call service to generate script
      const result = await AIVideoService.generateVideoScript(projectId);
      
      const processingTime = Date.now() - startTime;
      
      console.log('✅ AI Video script generated successfully', {
        processingTime,
        success: result.success,
        scriptLength: result.script?.length || 0,
        usedFallback: result.metadata?.usedFallback
      });
      
      // Return success response
      return res.status(200).json({
        success: true,
        script: result.script,
        metadata: result.metadata
      });
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      console.error('❌ AI Video Controller: Unhandled error', {
        error: error.message,
        stack: error.stack,
        projectId: req.params.projectId,
        userId: req.user?.id,
        processingTime
      });
      
      // Return safe error response - never crash the server
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Fetch and validate all audit pages data as raw JSON
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static async getRawAuditData(req, res) {
    const startTime = Date.now();
    
    try {
      const { projectId } = req.params;
      
      console.log("📊 RAW AUDIT DATA API HIT!", { 
        projectId,
        userId: req.user?.id,
        method: req.method,
        url: req.originalUrl
      });
      
      // Validate projectId
      if (!projectId) {
        console.log("❌ Missing Project ID");
        return res.status(400).json({
          success: false,
          message: 'Project ID is required'
        });
      }
      
      console.log('📋 Fetching all audit pages data...');
      
      // Call service to fetch and validate all pages
      const result = await AIVideoService.fetchAllPagesWithValidation(projectId);
      
      const processingTime = Date.now() - startTime;
      
      console.log('📊 Raw audit data fetch completed', {
        processingTime,
        success: result.success,
        pagesFetched: result.pagesFetched,
        missingPages: result.missingPages?.length || 0
      });
      
      // Return response
      return res.status(result.success ? 200 : 400).json(result);
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      console.error('❌ Raw Audit Data Controller: Unhandled error', {
        error: error.message,
        stack: error.stack,
        projectId: req.params.projectId,
        userId: req.user?.id,
        processingTime
      });
      
      // Return safe error response
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}
