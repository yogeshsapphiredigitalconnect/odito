/**
 * Cover Page Service
 * Handles cover page data generation for PDF reports
 */

import mongoose from 'mongoose';
import { LoggerUtil } from '../../../utils/LoggerUtil.js';

export class CoverPageService {
  
  /**
   * Get cover page data for a project
   * @param {string} projectId - Project ID
   * @returns {Object} Cover page data structure
   */
  static async getCoverPageData(projectId) {
    const startTime = Date.now();
    
    try {
      LoggerUtil.info('Cover page data generation started', { projectId });
      
      // Validate projectId
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      const db = mongoose.connection.db;
      const { ObjectId } = mongoose.Types;
      const projectIdObj = new ObjectId(projectId);
      
      // Step 1: Fetch project from seoprojects collection
      const project = await db.collection('seoprojects')
        .findOne({ _id: projectIdObj });
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      LoggerUtil.debug('Project found', { 
        projectId: project._id,
        projectName: project.project_name,
        mainUrl: project.main_url
      });
      
      // Step 2: Fetch issue statistics
      const issueStats = await this.getIssueStatistics(db, projectIdObj);
      
      // Step 3: Fetch performance metrics (placeholder - will be computed)
      const performanceMetrics = await this.getPerformanceMetrics(db, projectIdObj, project);
      
      // Step 4: Calculate derived metrics
      const calculatedData = this.calculateDerivedMetrics(project, issueStats, performanceMetrics);
      
      // Step 5: Build final response structure
      const coverPageData = {
        domain: this.extractDomain(project.main_url) || '',
        companyName: project.project_name || '',
        auditDate: this.formatDate(project.last_analysis_at || project.created_at),
        engine: 'Odito AI',
        pagesCrawled: project.pages_crawled || 0,
        preparedFor: project.project_name || '',
        overallScore: 0,
        overallGrade: project.website_grade || 'N/A',
        scores: {
          performance: calculatedData.performance,
          authority: calculatedData.authority,
          seoHealth: calculatedData.seoHealth,
          aiVisibility: Math.round(project.ai_visibility?.score || 0)
        },
        issues: {
          critical: issueStats.critical,
          warnings: issueStats.warnings,
          informational: issueStats.informational,
          passed: calculatedData.passedChecks
        }
      };
      
      // Validate no undefined values
      this.validateCoverPageData(coverPageData);
      
      const totalTime = Date.now() - startTime;
      
      LoggerUtil.info('Cover page data generation completed', {
        projectId,
        totalTime,
        domain: coverPageData.domain,
        overallScore: coverPageData.overallScore
      });
      
      return {
        success: true,
        data: coverPageData,
        metadata: {
          generatedAt: new Date(),
          generationTime: totalTime,
          projectId
        }
      };
      
    } catch (error) {
      LoggerUtil.error('Cover page data generation failed', error, { projectId });
      
      return {
        success: false,
        error: {
          message: error.message,
          code: 'COVER_PAGE_GENERATION_FAILED',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      };
    }
  }
  
  /**
   * Get issue statistics from seo_page_issues collection
   */
  static async getIssueStatistics(db, projectIdObj) {
    try {
      const issueStats = await db.collection('seo_page_issues')
        .aggregate([
          { $match: { projectId: projectIdObj } },
          {
            $group: {
              _id: '$severity',
              count: { $sum: 1 }
            }
          }
        ])
        .toArray();
      
      const stats = {
        critical: 0,
        warnings: 0,
        informational: 0,
        total: 0
      };
      
      issueStats.forEach(stat => {
        const severity = stat._id || 'info';
        if (severity === 'critical') {
          stats.critical = stat.count;
        } else if (severity === 'warning') {
          stats.warnings = stat.count;
        } else {
          stats.informational += stat.count;
        }
        stats.total += stat.count;
      });
      
      LoggerUtil.debug('Issue statistics calculated', stats);
      return stats;
      
    } catch (error) {
      LoggerUtil.error('Failed to get issue statistics', error);
      return { critical: 0, warnings: 0, informational: 0, total: 0 };
    }
  }
  
  /**
   * Get performance metrics (placeholder implementation)
   */
  static async getPerformanceMetrics(db, projectIdObj, project) {
    try {
      // For now, use available data and reasonable defaults
      // In future, this could fetch from performance collections
      
      const baseMetrics = {
        crawlSuccessRate: project.crawl_status === 'completed' ? 100 : 0,
        pagesAnalyzed: project.pages_analyzed || 0,
        totalIssues: project.total_issues || 0
      };
      
      LoggerUtil.debug('Performance metrics calculated', baseMetrics);
      return baseMetrics;
      
    } catch (error) {
      LoggerUtil.error('Failed to get performance metrics', error);
      return { crawlSuccessRate: 0, pagesAnalyzed: 0, totalIssues: 0 };
    }
  }
  
  /**
   * Calculate derived metrics
   */
  static calculateDerivedMetrics(project, issueStats, performanceMetrics) {
    try {
      // Performance score: Not available yet, set to 0
      const performance = 0;
      
      // Authority score: Not available yet, set to 0
      const authority = 0;
      
      // SEO Health: Use website_score directly
      const seoHealth = Math.round(project.website_score || 0);
      
      // Passed checks: Estimated based on successful crawls and low issue count
      const totalChecks = Math.max(1, (project.pages_crawled || 0) * 5); // Assume 5 checks per page
      const passedChecks = Math.max(0, totalChecks - issueStats.total);
      
      const calculated = {
        performance,
        authority,
        seoHealth,
        passedChecks: Math.round(passedChecks)
      };
      
      LoggerUtil.debug('Derived metrics calculated', calculated);
      return calculated;
      
    } catch (error) {
      LoggerUtil.error('Failed to calculate derived metrics', error);
      return {
        performance: 0,
        authority: 0,
        seoHealth: 0,
        passedChecks: 0
      };
    }
  }
  
  /**
   * Extract domain from URL
   */
  static extractDomain(url) {
    if (!url) return '';
    
    try {
      // Remove protocol and www, then get domain
      const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
      const domain = cleanUrl.split('/')[0];
      return domain || '';
    } catch (error) {
      LoggerUtil.error('Failed to extract domain', error, { url });
      return '';
    }
  }
  
  /**
   * Format date for display
   */
  static formatDate(date) {
    if (!date) return '';
    
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      LoggerUtil.error('Failed to format date', error, { date });
      return '';
    }
  }
  
  /**
   * Validate cover page data has no undefined values
   */
  static validateCoverPageData(data) {
    const checkValue = (value, path) => {
      if (value === undefined) {
        throw new Error(`Undefined value found at: ${path}`);
      }
    };
    
    // Check all top-level fields
    Object.keys(data).forEach(key => {
      checkValue(data[key], key);
    });
    
    // Check nested objects
    if (data.scores) {
      Object.keys(data.scores).forEach(key => {
        checkValue(data.scores[key], `scores.${key}`);
      });
    }
    
    if (data.issues) {
      Object.keys(data.issues).forEach(key => {
        checkValue(data.issues[key], `issues.${key}`);
      });
    }
    
    LoggerUtil.debug('Cover page data validation passed');
  }
}
