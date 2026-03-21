/**
 * AI Video Service
 * Handles business logic for AI video script generation
 */

import mongoose from 'mongoose';
import { AIVideoTransformer } from './aiVideo.transformer.js';
import { AIVideoPrompt } from './aiVideo.prompt.js';
import { GeminiService } from '../../services/gemini.service.js';
import { CoverPageService } from '../pdf/service/coverPageService.js';
import { Page08Service } from '../pdf/service/page08Service.js';
import { Page09Service } from '../pdf/service/page09Service.js';
import { Page10Service } from '../pdf/service/page10Service.js';
import { Page11Service } from '../pdf/service/page11Service.js';
import { PDFDataController } from '../pdf/controller/pdfDataController.js';
import { LoggerUtil } from '../../utils/LoggerUtil.js';

export class AIVideoService {
  
  /**
   * Generate AI video script for a project
   * @param {string} projectId - Project ID
   * @returns {Object} Generated script result
   */
  static async generateVideoScript(projectId) {
    const startTime = Date.now();
    
    try {
      console.log(' AI Video Service: Starting script generation', { projectId });
      
      // Validate project exists
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      // Fetch all page data
      console.log(' Fetching audit data...');
      const pageData = await this.fetchAllPageData(projectId);
      
      // Validate we have some data
      if (!pageData || !pageData.cover) {
        console.warn(' Limited data available, using fallback approach');
      }
      
      // Transform data for AI
      console.log(' Transforming data for AI...');
      const transformedData = AIVideoTransformer.transformPageData(pageData);
      
      // Validate required fields
      if (!transformedData.companyName || !transformedData.domain) {
        console.warn(' Missing required fields, using defaults');
        transformedData.companyName = transformedData.companyName || 'Your Company';
        transformedData.domain = transformedData.domain || 'your-website.com';
      }
      
      // Generate prompt
      console.log(' Generating AI prompt...');
      const prompt = AIVideoPrompt.buildPrompt(transformedData);
      
      // Generate script using Gemini
      console.log(' Calling Gemini AI...');
      let script;
      try {
        script = await GeminiService.generateScript(prompt);
        console.log(' AI script generated successfully');
      } catch (aiError) {
        console.error(' AI generation failed, using fallback:', aiError.message);
        script = GeminiService.getFallbackScript(transformedData);
      }
      
      const processingTime = Date.now() - startTime;
      
      console.log(' AI Video Service: Script generation completed', {
        processingTime,
        scriptLength: script.length,
        usedFallback: !script || script.includes('fallback')
      });
      
      return {
        success: true,
        script: script,
        metadata: {
          projectId,
          generatedAt: new Date().toISOString(),
          processingTime,
          dataSources: Object.keys(pageData).filter(key => pageData[key]),
          usedFallback: !script || script.includes('fallback')
        }
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      console.error(' AI Video Service: Script generation failed', {
        error: error.message,
        stack: error.stack,
        projectId,
        processingTime
      });
      
      // Return fallback response instead of throwing
      return {
        success: true,
        script: GeminiService.getFallbackScript({ companyName: 'Your Company', domain: 'your-website.com' }),
        metadata: {
          projectId,
          generatedAt: new Date().toISOString(),
          processingTime,
          error: error.message,
          usedFallback: true
        }
      };
    }
  }
  
  /**
   * Validate that project exists
   * @param {string} projectId - Project ID
   */
  static async validateProject(projectId) {
    try {
      const db = mongoose.connection.db;
      const { ObjectId } = mongoose.Types;
      const projectIdObj = new ObjectId(projectId);
      
      const project = await db.collection('seoprojects')
        .findOne({ _id: projectIdObj });
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      return project;
      
    } catch (error) {
      if (error.message === 'Project not found') {
        throw error;
      }
      
      LoggerUtil.error('AI Video Service: Project validation failed', {
        error: error.message,
        projectId
      });
      
      throw new Error('Failed to validate project');
    }
  }
  
  /**
   * Fetch all page data using existing services
   * @param {string} projectId - Project ID
   * @returns {Object} All page data
   */
  static async fetchAllPageData(projectId) {
    try {
      // Fetch all page data in parallel for optimal performance
      const [
        coverData,
        executiveData,
        page08Data,
        page09Data,
        page10Data,
        page11Data
      ] = await Promise.all([
        this.fetchCoverData(projectId),
        this.fetchExecutiveData(projectId),
        this.fetchPage08Data(projectId),
        this.fetchPage09Data(projectId),
        this.fetchPage10Data(projectId),
        this.fetchPage11Data(projectId)
      ]);
      
      return {
        cover: coverData,
        executive: executiveData,
        page08: page08Data,
        page09: page09Data,
        page10: page10Data,
        page11: page11Data
      };
      
    } catch (error) {
      LoggerUtil.error('AI Video Service: Failed to fetch page data', {
        error: error.message,
        projectId
      });
      
      throw new Error('Failed to fetch audit data');
    }
  }
  
  /**
   * Fetch cover page data
   * @param {string} projectId - Project ID
   * @returns {Object} Cover data
   */
  static async fetchCoverData(projectId) {
    try {
      const result = await CoverPageService.getCoverPageData(projectId);
      return result.success ? result.data : null;
    } catch (error) {
      LoggerUtil.warn('AI Video Service: Failed to fetch cover data', {
        error: error.message,
        projectId
      });
      return null;
    }
  }
  
  /**
   * Fetch executive summary data
   * @param {string} projectId - Project ID
   * @returns {Object} Executive data
   */
  static async fetchExecutiveData(projectId) {
    try {
      // Create a mock request/response to use the controller
      const mockReq = { params: { projectId } };
      const mockRes = {
        status: () => mockRes,
        json: (data) => { mockRes.data = data; return mockRes; }
      };
      
      // Call the controller method directly
      await PDFDataController.generateExecutiveSummaryData(mockReq, mockRes);
      
      return mockRes.data?.success ? mockRes.data.data : null;
    } catch (error) {
      LoggerUtil.warn('AI Video Service: Failed to fetch executive data', {
        error: error.message,
        projectId
      });
      return null;
    }
  }
  
  /**
   * Fetch page 08 data
   * @param {string} projectId - Project ID
   * @returns {Object} Page 08 data
   */
  static async fetchPage08Data(projectId) {
    try {
      const result = await Page08Service.getPage08Data(projectId);
      return result.success ? result.data : null;
    } catch (error) {
      LoggerUtil.warn('AI Video Service: Failed to fetch page08 data', {
        error: error.message,
        projectId
      });
      return null;
    }
  }
  
  /**
   * Fetch page 09 data
   * @param {string} projectId - Project ID
   * @returns {Object} Page 09 data
   */
  static async fetchPage09Data(projectId) {
    try {
      const result = await Page09Service.getPage09Data(projectId);
      return result.success ? result.data : null;
    } catch (error) {
      LoggerUtil.warn('AI Video Service: Failed to fetch page09 data', {
        error: error.message,
        projectId
      });
      return null;
    }
  }
  
  /**
   * Fetch page 10 data
   * @param {string} projectId - Project ID
   * @returns {Object} Page 10 data
   */
  static async fetchPage10Data(projectId) {
    try {
      const result = await Page10Service.getPage10Data(projectId);
      return result.success ? result.data : null;
    } catch (error) {
      LoggerUtil.warn('AI Video Service: Failed to fetch page10 data', {
        error: error.message,
        projectId
      });
      return null;
    }
  }
  
  /**
   * Fetch page 11 data
   * @param {string} projectId - Project ID
   * @returns {Object} Page 11 data
   */
  static async fetchPage11Data(projectId) {
    try {
      const result = await Page11Service.getPage11Data(projectId);
      return result.success ? result.data : null;
    } catch (error) {
      LoggerUtil.warn('AI Video Service: Failed to fetch page11 data', {
        error: error.message,
        projectId
      });
      return null;
    }
  }

  /**
   * Fetch and validate all audit pages (1-14) with retry mechanism
   * @param {string} projectId - Project ID
   * @returns {Object} Validation result with raw data
   */
  static async fetchAllPagesWithValidation(projectId) {
    const startTime = Date.now();
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    try {
      console.log('📋 Starting comprehensive audit data fetch...', { projectId });
      
      // Define all pages to fetch
      const pageDefinitions = [
        { key: 'cover', fetcher: () => this.fetchCoverData(projectId) },
        { key: 'page2', fetcher: () => this.fetchPage2Data(projectId) },
        { key: 'page3', fetcher: () => this.fetchPage3Data(projectId) },
        { key: 'page4', fetcher: () => this.fetchPage4Data(projectId) },
        { key: 'page5', fetcher: () => this.fetchPage5Data(projectId) },
        { key: 'page6', fetcher: () => this.fetchPage6Data(projectId) },
        { key: 'page7', fetcher: () => this.fetchPage7Data(projectId) },
        { key: 'page8', fetcher: () => this.fetchPage08Data(projectId) },
        { key: 'page9', fetcher: () => this.fetchPage09Data(projectId) },
        { key: 'page10', fetcher: () => this.fetchPage10Data(projectId) },
        { key: 'page11', fetcher: () => this.fetchPage11Data(projectId) },
        { key: 'page12', fetcher: () => this.fetchPage12Data(projectId) },
        { key: 'page13', fetcher: () => this.fetchPage13Data(projectId) },
        { key: 'page14', fetcher: () => this.fetchPage14Data(projectId) }
      ];
      
      let rawData = {};
      let missingPages = [];
      let retryCount = 0;
      
      // Retry mechanism
      while (retryCount <= maxRetries) {
        console.log(`🔄 Fetch attempt ${retryCount + 1}/${maxRetries + 1}`);
        
        // Fetch all pages in parallel
        const fetchPromises = pageDefinitions.map(async (page) => {
          try {
            const data = await page.fetcher();
            return { key: page.key, data, success: true };
          } catch (error) {
            console.warn(`❌ Failed to fetch ${page.key}:`, error.message);
            return { key: page.key, data: null, success: false, error: error.message };
          }
        });
        
        const results = await Promise.all(fetchPromises);
        
        // Process results
        rawData = {};
        missingPages = [];
        
        for (const result of results) {
          if (result.success && this.isValidPageData(result.data)) {
            rawData[result.key] = result.data;
          } else {
            rawData[result.key] = { status: "missing" };
            missingPages.push(result.key);
          }
        }
        
        // If all pages are valid, break the retry loop
        if (missingPages.length === 0) {
          break;
        }
        
        // If we have retries left, wait before retrying
        if (retryCount < maxRetries) {
          console.log(`⏳ Waiting ${retryDelay}ms before retry... Missing: ${missingPages.join(', ')}`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
        
        retryCount++;
      }
      
      // Final validation
      const validationResult = this.validateCompleteData(rawData);
      
      const processingTime = Date.now() - startTime;
      
      console.log('📊 Audit data fetch completed', {
        processingTime,
        pagesFetched: 14,
        missingPages: missingPages.length,
        retryAttempts: retryCount,
        validationPassed: validationResult.isValid
      });
      
      return {
        success: validationResult.isValid && missingPages.length === 0,
        pagesFetched: 14,
        missingPages: missingPages,
        rawData: rawData,
        metadata: {
          projectId,
          fetchedAt: new Date().toISOString(),
          processingTime,
          retryAttempts: retryCount,
          validationResults: validationResult
        }
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      console.error('❌ fetchAllPagesWithValidation failed:', {
        error: error.message,
        stack: error.stack,
        projectId,
        processingTime
      });
      
      return {
        success: false,
        pagesFetched: 0,
        missingPages: ['cover', 'page2', 'page3', 'page4', 'page5', 'page6', 'page7', 'page8', 'page9', 'page10', 'page11', 'page12', 'page13', 'page14'],
        message: 'Critical error during data fetch',
        error: error.message
      };
    }
  }

  /**
   * Validate if page data is meaningful
   * @param {any} data - Page data to validate
   * @returns {boolean} True if data is valid
   */
  static isValidPageData(data) {
    if (data === null || data === undefined) {
      return false;
    }
    
    if (typeof data === 'object' && !Array.isArray(data)) {
      // Check if object is empty
      const keys = Object.keys(data);
      if (keys.length === 0) {
        return false;
      }
      
      // Check if all values are null/undefined
      const hasValidValues = keys.some(key => {
        const value = data[key];
        return value !== null && value !== undefined && value !== '';
      });
      
      return hasValidValues;
    }
    
    // For arrays or primitives, check if they have content
    if (Array.isArray(data)) {
      return data.length > 0;
    }
    
    return data !== '';
  }

  /**
   * Validate complete data structure
   * @param {Object} rawData - Raw data object
   * @returns {Object} Validation results
   */
  static validateCompleteData(rawData) {
    const requiredPages = ['cover', 'page2', 'page3', 'page4', 'page5', 'page6', 'page7', 'page8', 'page9', 'page10', 'page11', 'page12', 'page13', 'page14'];
    const validationResults = {
      isValid: true,
      issues: [],
      validPages: [],
      invalidPages: []
    };
    
    for (const pageKey of requiredPages) {
      const pageData = rawData[pageKey];
      
      if (!pageData) {
        validationResults.issues.push(`${pageKey}: undefined`);
        validationResults.invalidPages.push(pageKey);
        validationResults.isValid = false;
      } else if (pageData.status === 'missing') {
        validationResults.issues.push(`${pageKey}: marked as missing`);
        validationResults.invalidPages.push(pageKey);
        validationResults.isValid = false;
      } else if (!this.isValidPageData(pageData)) {
        validationResults.issues.push(`${pageKey}: empty or invalid data`);
        validationResults.invalidPages.push(pageKey);
        validationResults.isValid = false;
      } else {
        validationResults.validPages.push(pageKey);
      }
    }
    
    return validationResults;
  }

  // Placeholder methods for pages 2-7, 12-14 (to be implemented based on available services)
  static async fetchPage2Data(projectId) {
    try {
      // TODO: Implement based on actual page 2 service
      const db = mongoose.connection.db;
      const { ObjectId } = mongoose.Types;
      const projectIdObj = new ObjectId(projectId);
      
      const data = await db.collection('seoprojects')
        .findOne({ _id: projectIdObj }, { projection: { projectName: 1, domain: 1, createdAt: 1 } });
      
      return data;
    } catch (error) {
      LoggerUtil.warn('Failed to fetch page2 data', { error: error.message, projectId });
      return null;
    }
  }

  static async fetchPage3Data(projectId) {
    try {
      // TODO: Implement based on actual page 3 service
      const db = mongoose.connection.db;
      const { ObjectId } = mongoose.Types;
      const projectIdObj = new ObjectId(projectId);
      
      const data = await db.collection('seoprojects')
        .findOne({ _id: projectIdObj }, { projection: { targetKeywords: 1, competitors: 1 } });
      
      return data;
    } catch (error) {
      LoggerUtil.warn('Failed to fetch page3 data', { error: error.message, projectId });
      return null;
    }
  }

  static async fetchPage4Data(projectId) {
    try {
      // TODO: Implement based on actual page 4 service
      const db = mongoose.connection.db;
      const { ObjectId } = mongoose.Types;
      const projectIdObj = new ObjectId(projectId);
      
      const data = await db.collection('ai_visibility_summary')
        .findOne({ projectId: projectIdObj });
      
      return data;
    } catch (error) {
      LoggerUtil.warn('Failed to fetch page4 data', { error: error.message, projectId });
      return null;
    }
  }

  static async fetchPage5Data(projectId) {
    try {
      // TODO: Implement based on actual page 5 service
      const db = mongoose.connection.db;
      const { ObjectId } = mongoose.Types;
      const projectIdObj = new ObjectId(projectId);
      
      const data = await db.collection('seo_ai_visibility_issues')
        .find({ projectId: projectIdObj })
        .limit(10)
        .toArray();
      
      return { issues: data };
    } catch (error) {
      LoggerUtil.warn('Failed to fetch page5 data', { error: error.message, projectId });
      return null;
    }
  }

  static async fetchPage6Data(projectId) {
    try {
      // TODO: Implement based on actual page 6 service
      const db = mongoose.connection.db;
      const { ObjectId } = mongoose.Types;
      const projectIdObj = new ObjectId(projectId);
      
      const data = await db.collection('technical_audit_results')
        .findOne({ projectId: projectIdObj });
      
      return data;
    } catch (error) {
      LoggerUtil.warn('Failed to fetch page6 data', { error: error.message, projectId });
      return null;
    }
  }

  static async fetchPage7Data(projectId) {
    try {
      // TODO: Implement based on actual page 7 service
      const db = mongoose.connection.db;
      const { ObjectId } = mongoose.Types;
      const projectIdObj = new ObjectId(projectId);
      
      const data = await db.collection('content_audit_results')
        .findOne({ projectId: projectIdObj });
      
      return data;
    } catch (error) {
      LoggerUtil.warn('Failed to fetch page7 data', { error: error.message, projectId });
      return null;
    }
  }

  static async fetchPage12Data(projectId) {
    try {
      // TODO: Implement based on actual page 12 service
      const db = mongoose.connection.db;
      const { ObjectId } = mongoose.Types;
      const projectIdObj = new ObjectId(projectId);
      
      const data = await db.collection('recommendations_summary')
        .findOne({ projectId: projectIdObj });
      
      return data;
    } catch (error) {
      LoggerUtil.warn('Failed to fetch page12 data', { error: error.message, projectId });
      return null;
    }
  }

  static async fetchPage13Data(projectId) {
    try {
      // TODO: Implement based on actual page 13 service
      const db = mongoose.connection.db;
      const { ObjectId } = mongoose.Types;
      const projectIdObj = new ObjectId(projectId);
      
      const data = await db.collection('implementation_roadmap')
        .findOne({ projectId: projectIdObj });
      
      return data;
    } catch (error) {
      LoggerUtil.warn('Failed to fetch page13 data', { error: error.message, projectId });
      return null;
    }
  }

  static async fetchPage14Data(projectId) {
    try {
      // TODO: Implement based on actual page 14 service
      const db = mongoose.connection.db;
      const { ObjectId } = mongoose.Types;
      const projectIdObj = new ObjectId(projectId);
      
      const data = await db.collection('next_steps')
        .findOne({ projectId: projectIdObj });
      
      return data;
    } catch (error) {
      LoggerUtil.warn('Failed to fetch page14 data', { error: error.message, projectId });
      return null;
    }
  }
}
