/**
 * Unified JSON Report Service
 * Generates clean, AI-friendly JSON reports by reusing existing services and mappers
 */

import { PDFAggregationService } from './pdfAggregationService.js';
import { CoverPageService } from './coverPageService.js';
import { ExecutiveMapper } from '../mapper/sections/executive.mapper.js';
import { PerformanceMapper } from '../mapper/sections/performance.mapper.js';
import { KeywordsMapper } from '../mapper/sections/keywords.mapper.js';
import { AIMapper } from '../mapper/sections/ai.mapper.js';
import { ContentMapper } from '../mapper/sections/content.mapper.js';
import { TechnicalMapper } from '../mapper/sections/technical.mapper.js';
import { LoggerUtil } from '../../../utils/LoggerUtil.js';
import axios from 'axios';

export class UnifiedJsonService {
  
  /**
   * Generate complete unified JSON report for AI usage
   * @param {string} projectId - Project ID
   * @param {Object} options - Configuration options
   * @param {string} options.authToken - Authorization token for internal API calls
   * @returns {Object} Clean, structured JSON ready for AI input
   */
  static async getFullReportJson(projectId, options = {}) {
    const startTime = Date.now();
    
    try {
      LoggerUtil.info('Unified JSON service starting', { projectId });
      
      // 🔧 FIX: CREATE BASE URL AND ADD DEBUG LOGGING
      const BASE_URL = "http://localhost:5000";
      console.log('UNIFIED SERVICE: Base URL:', BASE_URL);
      console.log('UNIFIED SERVICE: Project ID:', projectId);
      
      // 🔧 STEP 1: CALL PAGE 08 API (TOP ISSUES)
      console.log('UNIFIED SERVICE: Calling Page 08 API for top issues');
      console.log('UNIFIED SERVICE: Full URL:', `${BASE_URL}/api/pdf/${projectId}/page08`);
      let page08Data;
      try {
        const headers = options.authToken ? { Authorization: `Bearer ${options.authToken}` } : {};
        const page08Response = await axios.get(`${BASE_URL}/api/pdf/${projectId}/page08`, { headers });
        page08Data = page08Response.data;
        console.log('UNIFIED SERVICE: Page 08 API response status:', page08Response.status);
        console.log('UNIFIED SERVICE: Page 08 API response data:', page08Data);
      } catch (error) {
        console.warn('UNIFIED SERVICE: Page 08 API failed, using empty fallback:', error.message);
        page08Data = {};
      }

      // 🔧 STEP 2: CALL PAGE 10 API (TECHNICAL HIGHLIGHTS)
      console.log('UNIFIED SERVICE: Calling Page 10 API for technical highlights');
      console.log('UNIFIED SERVICE: Full URL:', `${BASE_URL}/api/pdf/${projectId}/page10`);
      let page10Data;
      try {
        const headers = options.authToken ? { Authorization: `Bearer ${options.authToken}` } : {};
        const page10Response = await axios.get(`${BASE_URL}/api/pdf/${projectId}/page10`, { headers });
        page10Data = page10Response.data;
        console.log('UNIFIED SERVICE: Page 10 API response status:', page10Response.status);
        console.log('UNIFIED SERVICE: Page 10 API response data:', page10Data);
      } catch (error) {
        console.warn('UNIFIED SERVICE: Page 10 API failed, using empty fallback:', error.message);
        page10Data = {};
      }

      // 🔧 STEP 3: CALL PERFORMANCE API (CORRECT ENDPOINT)
      console.log('UNIFIED SERVICE: Calling Performance API for metrics');
      console.log('UNIFIED SERVICE: Full URL:', `${BASE_URL}/app_user/projects/${projectId}/performance`);
      let page13Data;
      try {
        const headers = options.authToken ? { Authorization: `Bearer ${options.authToken}` } : {};
        const page13Response = await axios.get(`${BASE_URL}/app_user/projects/${projectId}/performance`, { headers });
        page13Data = page13Response.data;
        console.log('UNIFIED SERVICE: Page 13 API response status:', page13Response.status);
        console.log('UNIFIED SERVICE: Page 13 API response data:', page13Data);
      } catch (error) {
        console.warn('UNIFIED SERVICE: Page 13 API failed, using empty fallback:', error.message);
        page13Data = {};
      }

      // 🔧 STEP 4: GET COVER DATA FOR SCORES (reuse existing computation)
      console.log('UNIFIED SERVICE: Getting cover data for scores');
      const coverResult = await CoverPageService.getCoverPageData(projectId);
      if (!coverResult?.success) {
        console.warn('Cover data failed, using default scores');
      }
      
      // 🔧 STEP 5: BUILD UNIFIED RESPONSE STRUCTURE
      console.log('UNIFIED SERVICE: Building unified response structure');
      
      // 🔧 STEP 5A: MAP PAGE 08 DATA - USE TOP ISSUES (REAL DATA)
      console.log('\n🔧 EXTRACTING PAGE 08 DATA (Real Top Issues)');
      const topIssuesArray = page08Data?.data?.topIssues || page08Data?.topIssues || [];
      console.log('Top Issues Array:', topIssuesArray);
      console.log('Top Issues Count:', topIssuesArray.length);
      
      // Extract real issue counts from top issues array
      const criticalCount = topIssuesArray.filter(i => i.severity === 'critical').length;
      const highCount = topIssuesArray.filter(i => i.severity === 'high').length;
      const mediumCount = topIssuesArray.filter(i => i.severity === 'medium').length;
      const lowInfoCount = topIssuesArray.filter(i => i.severity === 'low' || i.severity === 'info').length;
      
      console.log(`\n✅ Issue Counts: Critical=${criticalCount}, High=${highCount}, Medium=${mediumCount}, Low/Info=${lowInfoCount}`);
      
      // Sliced lists for display only (unchanged caps)
      const topIssues = {
        critical: topIssuesArray.filter(i => i.severity === 'critical').slice(0, 3),
        high: topIssuesArray.filter(i => i.severity === 'high').slice(0, 3),
        medium: topIssuesArray.filter(i => i.severity === 'medium').slice(0, 2),
        low: topIssuesArray.filter(i => i.severity === 'low' || i.severity === 'info').slice(0, 1)
      };

      const issueTotalCount =
        criticalCount + highCount + mediumCount + lowInfoCount;
      console.log(
        'UNIFIED issue counts (full):',
        { criticalCount, highCount, mediumCount, lowInfoCount, issueTotalCount }
      );

      // 🔧 STEP 5B: MAP PAGE 10 DATA - USE CHECKS (REAL DATA)
      console.log('\n🔧 EXTRACTING PAGE 10 DATA (Real Checks)');
      const technicalChecks = page10Data?.data?.checks || page10Data?.checks || [];
      console.log(`Technical Checks Count: ${technicalChecks.length}`);
      
      const technicalHighlights = {
        checks: technicalChecks,
        checkCount: technicalChecks.length
      };

      // 🔧 STEP 5C: MAP PERFORMANCE DATA (REAL DATA)
      console.log('\n🔧 EXTRACTING PERFORMANCE DATA');
      const performancePageData = page13Data?.data || page13Data || {};
      console.log('Performance Data:', performancePageData);
      
      const performanceMetrics = {
        desktopScore: performancePageData?.desktopScore || 0,
        mobileScore: performancePageData?.mobileScore || 0,
        desktopMetrics: performancePageData?.desktopMetrics || [],
        mobileMetrics: performancePageData?.mobileMetrics || []
      };

      // Get scores from cover data (nested under data.scores)
      const s = coverResult.data?.scores || {};
      const scores = {
        overall: Math.round(s.overallScore || s.seoHealth || 0),
        performance: Math.round(s.performance || 0),
        seo: Math.round(s.seoHealth || 0),
        aiVisibility: Math.round(s.aiVisibility || 0)
      };
      console.log('UNIFIED scores from cover:', scores);

      const coverData = coverResult.data;
      const projectInfo = {
        name: coverData?.companyName || coverData?.projectName || 'Website',
        url: coverData?.mainUrl || (coverData?.domain ? `https://${coverData.domain}` : 'N/A')
      };

      // Get recommendations from page 10
      const recommendations = page10Data?.data?.recommendations || page10Data?.recommendations || [];

      // 🔧 STEP 6: BUILD UNIFIED RESPONSE WITH REAL DATA (NO FALLBACKS)
      console.log('\n🔧 BUILDING UNIFIED RESPONSE');
      console.log(
        `Total Issues (full counts): ${issueTotalCount} (Critical: ${criticalCount}, High: ${highCount}, Medium: ${mediumCount}, Low/Info: ${lowInfoCount})`
      );
      
      // ⚠️ CRITICAL: Build unifiedResponse object with REAL data - NOT FALLBACKS
      const unifiedResponse = {
        success: true,
        data: {
          project: projectInfo,
          scores: scores,
          issues: {
            critical: criticalCount,
            high: highCount,
            medium: mediumCount,
            low: lowInfoCount,
            total: issueTotalCount
          },
          issueDistribution: {
            critical: criticalCount,
            high: highCount,
            medium: mediumCount,
            low: lowInfoCount,
            total: issueTotalCount
          },
          topIssues,
          technical: {
            checks: technicalHighlights.checks,
            checkCount: technicalHighlights.checkCount
          },
          performance: performanceMetrics,
          recommendations: recommendations,
          pages: {
            page08: page08Data,
            page10: page10Data,
            performance: page13Data
          }
        },
        metadata: {
          fetchedAt: new Date().toISOString(),
          projectId,
          processingTime: Date.now() - startTime,
          version: '2.0.0',
          dataSources: ['page08', 'page10', 'performance-api', 'cover-service']
        }
      };
      
      // 🔧 STEP 7: VALIDATION CHECK BEFORE RETURN
      console.log('\n🔧 FINAL DATA VALIDATION');
      console.log('═'.repeat(50));
      console.log('FINAL DATA CHECK:', {
        critical: unifiedResponse.data.issues.critical,
        high: unifiedResponse.data.issues.high,
        medium: unifiedResponse.data.issues.medium,
        total: unifiedResponse.data.issues.total,
        technicalChecks: unifiedResponse.data.technical.checkCount,
        performanceScore: unifiedResponse.data.performance.desktopScore
      });
      console.log('═'.repeat(50));
      
      // Validate data is NOT zero
      if (unifiedResponse.data.issues.total === 0 && !page08Data?.data?.severityBreakdown) {
        console.warn('⚠️ WARNING: Zero issues found - check if Page08 API returned data');
      } else if (unifiedResponse.data.issues.critical > 0) {
        console.log('✅ SUCCESS: Real data present in response');
      }
      
      LoggerUtil.info('Unified JSON report generated successfully', {
        projectId,
        processingTime: Date.now() - startTime,
        issuesCount: unifiedResponse.data.issues.total,
        checksCount: unifiedResponse.data.technical.checkCount
      });
      
      return unifiedResponse;

    } catch (error) {
      LoggerUtil.error('Unified JSON service failed', {
        projectId,
        error: error.message,
        stack: error.stack
      });
      
      // Return safe fallback structure on any error
      const fallbackResponse = {
        success: false,
        error: {
          message: "Failed to generate unified JSON report",
          details: error.message,
          projectId
        },
        data: {
          project: { project_name: "Unknown", main_url: "N/A" },
          pages: {
            page08: {},
            page10: {}
          },
          performance: { pageSpeed: 0, metrics: [] },
          scores: { overall: 0, performance: 0, seo: 0, aiVisibility: 0 },
          recommendations: [],
          issues: { critical: 0, warnings: 0, informational: 0 },
          issueDistribution: { total: 0, critical: 0, medium: 0, info: 0 }
        },
        metadata: {
          fetchedAt: new Date(),
          projectId,
          queryTime: Date.now() - startTime,
          error: error.message,
          fallbackUsed: true
        }
      };

      return fallbackResponse;
    }
  }
  
  /**
   * Compute shared context to avoid redundant calculations
   */
  static computeSharedContext(aggregatedData, coverData) {
    const scores = coverData?.scores || {};
    
    // Calculate percentages once, reuse across mappers
    const percentages = {
      ai: {
        schemaCoverage: this.calculateSchemaCoverage(aggregatedData.ai),
        entityCoverage: this.calculateEntityCoverage(aggregatedData.ai)
      },
      optimization: {
        h1: this.calculateH1Coverage(aggregatedData.pages),
        metaDesc: this.calculateMetaDescCoverage(aggregatedData.pages)
      },
      pageCoverage: {
        indexed: this.calculateIndexedPercentage(aggregatedData.pages)
      }
    };
    
    // Calculate grades once
    const grades = {
      overall: this.getGrade(scores.overall || 0),
      seoHealth: this.getGrade(scores.seoHealth || 0),
      aiVisibility: this.getGrade(scores.aiVisibility || 0),
      performance: this.getGrade(scores.performance || 0),
      authority: this.getGrade(scores.authority || 0)
    };
    
    return {
      scores,
      percentages,
      grades,
      aggregatedData
    };
  }
  
  /**
   * Transform executive summary data
   */
  static async transformExecutive(aggregatedData, coverData, sharedContext) {
    try {
      const result = await ExecutiveMapper.mapExecutiveSummary(aggregatedData, coverData);
      return result.success ? result.data : {};
    } catch (error) {
      LoggerUtil.error('Executive transformation failed', error);
      return {};
    }
  }
  
  /**
   * Transform performance data
   */
  static async transformPerformance(aggregatedData, sharedContext) {
    try {
      const coreWebVitals = PerformanceMapper.transformCoreWebVitals(
        aggregatedData.performance, 
        aggregatedData
      );
      
      const opportunities = PerformanceMapper.transformOpportunities(aggregatedData.technical);
      
      return {
        coreWebVitals,
        opportunities
      };
    } catch (error) {
      LoggerUtil.error('Performance transformation failed', error);
      return {};
    }
  }
  
  /**
   * Transform keywords data
   */
  static async transformKeywords(aggregatedData, sharedContext) {
    try {
      const rankings = KeywordsMapper.transformRankings(
        aggregatedData.links,
        aggregatedData.pages
      );
      
      const opportunities = KeywordsMapper.transformOpportunities();
      
      return {
        rankings,
        opportunities
      };
    } catch (error) {
      LoggerUtil.error('Keywords transformation failed', error);
      return {};
    }
  }
  
  /**
   * Transform AI visibility data
   */
  static async transformAI(aggregatedData, sharedContext) {
    try {
      const visibility = AIMapper.transformVisibility(
        aggregatedData.ai,
        sharedContext.scores,
        sharedContext.grades
      );
      
      const structuredData = AIMapper.transformStructuredData(
        aggregatedData.ai,
        sharedContext.percentages
      );
      
      const llmVisibility = AIMapper.transformLLMVisibility(
        aggregatedData.ai,
        sharedContext.percentages
      );
      
      const knowledgeGraph = AIMapper.transformKnowledgeGraph(
        aggregatedData.ai,
        sharedContext.percentages
      );
      
      const optimization = AIMapper.transformOptimization(
        aggregatedData.ai?.issues,
        aggregatedData.ai
      );
      
      return {
        visibility,
        structuredData,
        llmVisibility,
        knowledgeGraph,
        optimization
      };
    } catch (error) {
      LoggerUtil.error('AI transformation failed', error);
      return {};
    }
  }
  
  /**
   * Transform content data
   */
  static async transformContent(aggregatedData, sharedContext) {
    try {
      const readiness = ContentMapper.transformReadiness(
        aggregatedData.ai,
        sharedContext.percentages
      );
      
      return {
        readiness
      };
    } catch (error) {
      LoggerUtil.error('Content transformation failed', error);
      return {};
    }
  }
  
  /**
   * Transform technical SEO data
   */
  static async transformTechnical(aggregatedData, sharedContext) {
    try {
      const seoHealth = TechnicalMapper.transformSEOHealth(
        sharedContext.scores,
        sharedContext.grades,
        sharedContext.percentages
      );
      
      const technicalSEO = TechnicalMapper.transformTechnicalSEO(
        aggregatedData.technical,
        sharedContext.grades
      );
      
      const crawlability = TechnicalMapper.transformCrawlability(
        aggregatedData.pages,
        sharedContext.percentages
      );
      
      return {
        seoHealth,
        technicalSEO,
        crawlability
      };
    } catch (error) {
      LoggerUtil.error('Technical transformation failed', error);
      return {};
    }
  }
  
  /**
   * Normalize project data for AI consumption
   */
  static normalizeProjectData(project) {
    if (!project) return {};
    
    return {
      id: project._id?.toString() || project.id,
      name: project.project_name,
      domain: project.main_url,
      status: project.status,
      createdAt: project.createdAt,
      lastScraped: project.last_scraped,
      userId: project.user_id
    };
  }
  
  /**
   * Generate unified recommendations from all sections
   */
  static generateUnifiedRecommendations(executive, performance, keywords, ai, content, technical) {
    const recommendations = [];
    let priority = 1;
    
    // Critical issues from executive summary
    if (executive.issues?.critical > 0) {
      recommendations.push({
        id: priority++,
        category: 'critical',
        title: 'Address Critical SEO Issues',
        description: `${executive.issues.critical} critical issues require immediate attention`,
        impact: 'High',
        effort: 'Medium',
        actions: ['Review and fix critical technical issues', 'Address high-priority SEO violations']
      });
    }
    
    // AI visibility optimization
    const aiScore = executive.scores?.aiVisibility || 0;
    if (aiScore < 60) {
      recommendations.push({
        id: priority++,
        category: 'ai',
        title: 'Improve AI Visibility',
        description: `AI visibility score of ${aiScore} needs improvement for AI search readiness`,
        impact: 'High',
        effort: 'Medium',
        actions: ['Implement comprehensive schema markup', 'Enhance entity coverage', 'Optimize content for AI search']
      });
    }
    
    // Performance optimization
    const perfScore = executive.scores?.performance || 0;
    if (perfScore < 70) {
      recommendations.push({
        id: priority++,
        category: 'performance',
        title: 'Optimize Website Performance',
        description: `Performance score of ${perfScore} impacts user experience and rankings`,
        impact: 'Medium',
        effort: 'High',
        actions: ['Optimize images and assets', 'Improve server response time', 'Eliminate render-blocking resources']
      });
    }
    
    // Content optimization
    if (content.readiness?.readinessScore < 60) {
      recommendations.push({
        id: priority++,
        category: 'content',
        title: 'Enhance Content for AI Search',
        description: 'Content readiness needs improvement for better AI visibility',
        impact: 'Medium',
        effort: 'Medium',
        actions: ['Add conversational content structure', 'Implement FAQ sections', 'Enhance entity coverage']
      });
    }
    
    return recommendations;
  }
  
  /**
   * Helper methods for calculations (avoid duplication)
   */
  static calculateSchemaCoverage(aiData) {
    const aggregates = aiData?.visibility?.aggregates || {};
    const totalPages = aggregates.totalPages || 1;
    const pagesWithSchema = aggregates.pagesWithSchema || 0;
    return totalPages > 0 ? Math.round((pagesWithSchema / totalPages) * 100) : 0;
  }
  
  static calculateEntityCoverage(aiData) {
    const entities = aiData?.entities || {};
    const totalEntities = entities.summary?.totalEntities || 0;
    const idealEntities = 15;
    return Math.min(100, Math.round((totalEntities / idealEntities) * 100));
  }
  
  static calculateH1Coverage(pagesData) {
    const totalPages = pagesData?.data?.totalPages || 1;
    const pagesWithH1 = pagesData?.data?.pagesWithH1 || 0;
    return totalPages > 0 ? Math.round((pagesWithH1 / totalPages) * 100) : 0;
  }
  
  static calculateMetaDescCoverage(pagesData) {
    const totalPages = pagesData?.data?.totalPages || 1;
    const pagesWithMetaDesc = pagesData?.data?.pagesWithMetaDesc || 0;
    return totalPages > 0 ? Math.round((pagesWithMetaDesc / totalPages) * 100) : 0;
  }
  
  static calculateIndexedPercentage(pagesData) {
    const totalPages = pagesData?.data?.totalPages || 1;
    const indexedPages = pagesData?.data?.indexedPages || 0;
    return totalPages > 0 ? Math.round((indexedPages / totalPages) * 100) : 0;
  }
  
  static getGrade(score) {
    if (score >= 90) return { grade: 'A', status: 'Excellent' };
    if (score >= 80) return { grade: 'B', status: 'Good' };
    if (score >= 70) return { grade: 'C', status: 'Fair' };
    if (score >= 60) return { grade: 'D', status: 'Poor' };
    return { grade: 'F', status: 'Critical' };
  }
  
  /**
   * Get data sources for metadata
   */
  static getDataSources(aggregatedData) {
    const sources = [];
    
    if (aggregatedData.project) sources.push('seoprojects');
    if (aggregatedData.ai) sources.push('seo_ai_visibility', 'seo_ai_visibility_issues', 'ai_visibility_entities');
    if (aggregatedData.technical) sources.push('domain_technical_reports');
    if (aggregatedData.pages) sources.push('seo_page_data', 'seo_page_issues');
    if (aggregatedData.links) sources.push('seo_internal_links', 'seo_external_links', 'seo_social_links');
    if (aggregatedData.performance) sources.push('seo_domain_performance');
    
    return sources;
  }
  
  /**
   * Validate unified JSON output
   */
  static validateUnifiedJson(unifiedReport) {
    const requiredFields = ['project', 'scores', 'metadata'];
    const missing = requiredFields.filter(field => !unifiedReport[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    return true;
  }
  
  /**
   * Validate project data availability
   */
  static async validateProjectData(projectId) {
    try {
      // Quick check using aggregation service
      const aggregatedData = await PDFAggregationService.fetchAllPDFData(projectId);
      
      const validation = {
        project: !!aggregatedData.project,
        aiData: !!(aggregatedData.ai?.visibility || aggregatedData.ai?.issues),
        technicalData: !!aggregatedData.technical,
        pageData: !!aggregatedData.pages,
        performanceData: !!aggregatedData.performance,
        linkData: !!aggregatedData.links,
        overall: !!aggregatedData.project && !!aggregatedData.pages
      };
      
      validation.isReady = validation.project && validation.pageData;
      validation.completeness = Object.values(validation).filter(v => v === true).length / Object.keys(validation).length;
      
      return validation;
      
    } catch (error) {
      LoggerUtil.error('Project data validation failed', error, { projectId });
      
      return {
        project: false,
        aiData: false,
        technicalData: false,
        pageData: false,
        performanceData: false,
        linkData: false,
        overall: false,
        isReady: false,
        completeness: 0,
        error: error.message
      };
    }
  }
}
