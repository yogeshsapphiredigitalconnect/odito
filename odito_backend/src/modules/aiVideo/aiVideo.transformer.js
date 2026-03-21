/**
 * AI Video Transformer
 * Transforms raw page data into clean JSON structure for AI processing
 */

import { LoggerUtil } from '../../utils/LoggerUtil.js';

export class AIVideoTransformer {
  
  /**
   * Transform raw page data into clean JSON structure
   * @param {Object} pageData - Raw page data from all sources
   * @returns {Object} Clean transformed data
   */
  static transform(pageData) {
    try {
      LoggerUtil.info('AI Video Transformer: Starting transformation', {
        hasCover: !!pageData.cover,
        hasExecutive: !!pageData.executive,
        hasPage08: !!pageData.page08,
        hasPage09: !!pageData.page09,
        hasPage10: !!pageData.page10,
        hasPage11: !!pageData.page11
      });
      
      const transformed = {
        // Basic company info from cover page
        companyName: pageData.cover?.companyName || '',
        domain: pageData.cover?.domain || '',
        auditDate: pageData.cover?.auditDate || '',
        pagesCrawled: pageData.cover?.pagesCrawled || 0,
        
        // Overall scores and grades
        overallScore: pageData.cover?.overallScore || 0,
        overallGrade: pageData.cover?.overallGrade || '',
        
        // Detailed scores (prefer executive data, fallback to cover)
        scores: {
          performance: pageData.executive?.scores?.performance || pageData.cover?.scores?.performance || 0,
          authority: pageData.executive?.scores?.authority || pageData.cover?.scores?.authority || 0,
          seoHealth: pageData.executive?.scores?.seoHealth || pageData.cover?.scores?.seoHealth || 0,
          aiVisibility: pageData.executive?.scores?.aiVisibility || pageData.cover?.scores?.aiVisibility || 0
        },
        
        // Issues breakdown
        issues: {
          total: pageData.executive?.issueDistribution?.total || 0,
          critical: pageData.executive?.issues?.critical || pageData.cover?.issues?.critical || 0,
          warnings: pageData.executive?.issues?.warnings || pageData.cover?.issues?.warnings || 0,
          informational: pageData.executive?.issues?.informational || pageData.cover?.issues?.informational || 0,
          passed: pageData.executive?.issues?.passed || pageData.cover?.issues?.passed || 0
        },
        
        // Top on-page issues
        topIssues: this.transformTopIssues(pageData.page08),
        
        // Structured data analysis
        structuredData: this.transformStructuredData(pageData.page09),
        
        // Technical SEO health
        technicalSEO: this.transformTechnicalSEO(pageData.page10),
        
        // Crawlability analysis
        crawlability: this.transformCrawlability(pageData.page11),
        
        // Core Web Vitals (if available from performance data)
        coreWebVitals: this.transformCoreWebVitals(pageData.performance),
        
        // AI analysis summary
        aiAnalysis: pageData.executive?.aiAnalysis || '',
        
        // Metadata
        metadata: {
          dataSources: this.getDataSources(pageData),
          transformedAt: new Date(),
          dataCompleteness: this.calculateDataCompleteness(pageData)
        }
      };
      
      LoggerUtil.info('AI Video Transformer: Transformation completed', {
        companyName: transformed.companyName,
        domain: transformed.domain,
        overallScore: transformed.overallScore,
        totalIssues: transformed.issues.total,
        dataCompleteness: transformed.metadata.dataCompleteness
      });
      
      return transformed;
      
    } catch (error) {
      LoggerUtil.error('AI Video Transformer: Transformation failed', {
        error: error.message,
        stack: error.stack
      });
      
      throw new Error('Failed to transform audit data');
    }
  }
  
  /**
   * Transform top issues from page 08 data
   * @param {Object} page08Data - Page 08 data
   * @returns {Array} Transformed top issues
   */
  static transformTopIssues(page08Data) {
    if (!page08Data?.topIssues || !Array.isArray(page08Data.topIssues)) {
      return [];
    }
    
    return page08Data.topIssues.slice(0, 5).map(issue => ({
      issue: issue.issue || '',
      severity: issue.severity || '',
      pages: issue.pages || 0,
      count: issue.count || 0,
      recommendation: issue.recommendation || ''
    }));
  }
  
  /**
   * Transform structured data from page 09
   * @param {Object} page09Data - Page 09 data
   * @returns {Object} Transformed structured data
   */
  static transformStructuredData(page09Data) {
    if (!page09Data) {
      return {
        withSchema: 0,
        withoutSchema: 0,
        coverage: 0,
        errors: 0,
        schemaTypes: []
      };
    }
    
    return {
      withSchema: page09Data.withSchema || 0,
      withoutSchema: page09Data.withoutSchema || 0,
      coverage: page09Data.coverage || 0,
      errors: page09Data.errors || 0,
      schemaTypes: Array.isArray(page09Data.schemaTypes) 
        ? page09Data.schemaTypes.slice(0, 5).map(type => ({
            type: type.type || '',
            pages: type.pages || 0
          }))
        : []
    };
  }
  
  /**
   * Transform technical SEO from page 10
   * @param {Object} page10Data - Page 10 data
   * @returns {Object} Transformed technical SEO
   */
  static transformTechnicalSEO(page10Data) {
    if (!page10Data) {
      return {
        techHealth: 0,
        passing: 0,
        warnings: 0,
        critical: 0,
        topChecks: []
      };
    }
    
    return {
      techHealth: page10Data.summary?.techHealth || 0,
      passing: page10Data.summary?.passing || 0,
      warnings: page10Data.summary?.warnings || 0,
      critical: page10Data.summary?.critical || 0,
      topChecks: Array.isArray(page10Data.checks)
        ? page10Data.checks.slice(0, 5).map(check => ({
            name: check.name || '',
            status: check.status || '',
            detail: check.detail || ''
          }))
        : []
    };
  }
  
  /**
   * Transform crawlability from page 11
   * @param {Object} page11Data - Page 11 data
   * @returns {Object} Transformed crawlability
   */
  static transformCrawlability(page11Data) {
    if (!page11Data) {
      return {
        totalPages: 0,
        indexedPages: 0,
        blockedPages: 0,
        indexRate: 0,
        blockedReasons: []
      };
    }
    
    return {
      totalPages: page11Data.metrics?.totalPages || 0,
      indexedPages: page11Data.metrics?.indexedPages || 0,
      blockedPages: page11Data.metrics?.blockedPages || 0,
      indexRate: page11Data.metrics?.indexRate || 0,
      blockedReasons: Array.isArray(page11Data.blockedReasons)
        ? page11Data.blockedReasons.slice(0, 3).map(reason => ({
            reason: reason.reason || '',
            affected: reason.affected || 0,
            impact: reason.impact || '',
            fix: reason.fix || ''
          }))
        : []
    };
  }
  
  /**
   * Transform Core Web Vitals from performance data
   * @param {Object} performanceData - Performance data
   * @returns {Object} Transformed Core Web Vitals
   */
  static transformCoreWebVitals(performanceData) {
    if (!performanceData) {
      return {
        mobile: { performance_score: 0, lcp: 0, cls: 0, fcp: 0, tbt: 0 },
        desktop: { performance_score: 0, lcp: 0, cls: 0, fcp: 0, tbt: 0 }
      };
    }
    
    const extractMetrics = (device) => ({
      performance_score: device?.performance_score || 0,
      lcp: device?.metrics?.lcp?.value || device?.lcp?.value || 0,
      cls: device?.metrics?.cls?.value || device?.cls?.value || 0,
      fcp: device?.metrics?.fcp?.value || device?.fcp?.value || 0,
      tbt: device?.metrics?.tbt?.value || device?.tbt?.value || 0
    });
    
    return {
      mobile: extractMetrics(performanceData.mobile),
      desktop: extractMetrics(performanceData.desktop)
    };
  }
  
  /**
   * Get list of available data sources
   * @param {Object} pageData - Raw page data
   * @returns {Array} List of available data sources
   */
  static getDataSources(pageData) {
    const sources = [];
    
    if (pageData.cover) sources.push('cover');
    if (pageData.executive) sources.push('executive');
    if (pageData.page08) sources.push('onpage-seo');
    if (pageData.page09) sources.push('structured-data');
    if (pageData.page10) sources.push('technical-seo');
    if (pageData.page11) sources.push('crawlability');
    if (pageData.performance) sources.push('core-web-vitals');
    
    return sources;
  }
  
  /**
   * Calculate data completeness percentage
   * @param {Object} pageData - Raw page data
   * @returns {number} Completeness percentage
   */
  static calculateDataCompleteness(pageData) {
    const totalSources = 7; // cover, executive, page08, page09, page10, page11, performance
    const availableSources = this.getDataSources(pageData).length;
    
    return Math.round((availableSources / totalSources) * 100);
  }
}
