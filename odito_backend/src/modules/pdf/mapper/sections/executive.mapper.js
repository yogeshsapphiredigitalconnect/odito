/**
 * Executive Summary Mapper
 * Maps aggregated data to executive summary format with optimized data reuse
 */

import { FormatUtils } from '../../utils/format.utils.js';
import { GradeUtils } from '../../utils/grade.utils.js';
import { PercentageUtils } from '../../utils/percentage.utils.js';
import { PDFCalculationService } from '../../service/pdfCalculationService.js';
import { PDFAggregationService } from '../../service/pdfAggregationService.js';

export class ExecutiveMapper {
  
  /**
   * Map executive summary data from aggregated sources
   * @param {Object} aggregatedData - Data from PDF aggregation service
   * @param {Object} coverData - Cover page scores (reused)
   * @returns {Object} Executive summary data
   */
  static async mapExecutiveSummary(aggregatedData, coverData) {
    try {
      console.log("EXECUTIVE MAPPER: Starting mapping with data:", {
        aggregatedDataKeys: Object.keys(aggregatedData || {}),
        coverDataKeys: Object.keys(coverData || {}),
        hasPages: !!(aggregatedData?.pages),
        hasOnpageIssues: !!(aggregatedData?.pages?.onpageIssues)
      });
      
      // Safe input validation
      if (!aggregatedData) {
        console.error("EXECUTIVE MAPPER: No aggregated data provided");
        return this.getSafeFallback("No aggregated data");
      }
      
      if (!coverData) {
        console.error("EXECUTIVE MAPPER: No cover data provided");
        return this.getSafeFallback("No cover data");
      }
      
      // Step 1: REUSE scores from cover data (DO NOT RECOMPUTE)
      const scores = {
        seoHealth: coverData?.scores?.seoHealth || 0,
        aiVisibility: coverData?.scores?.aiVisibility || 0,
        performance: coverData?.scores?.performance || 0,
        authority: coverData?.scores?.authority || 0
      };
      
      console.log("EXECUTIVE MAPPER: Extracted scores:", scores);
      
      // Step 2: Get projectId from aggregated data
      const projectId = aggregatedData?.project?._id?.toString() || aggregatedData?.project?.id;
      
      if (!projectId) {
        console.error("EXECUTIVE MAPPER: No projectId found");
        return this.getSafeFallback("No projectId found");
      }
      
      // Step 3: Use NEW aggregation function directly
      const counts = await PDFAggregationService.getOnPageIssueCounts(projectId);
      
      console.log("EXECUTIVE MAPPER: Got counts from aggregation:", counts);
      
      // Step 4: Build issues object using new aggregation results
      const issues = {
        critical: counts.critical,
        warnings: counts.warnings,
        informational: counts.informational,
        passed: Math.max(0, 100 - counts.totalIssues)
      };
      
      console.log("EXECUTIVE MAPPER: Final issues object:", issues);
      
      // Step 5: Build issue distribution with correct structure
      const issueDistribution = {
        total: counts.totalIssues,
        critical: issues.critical,
        medium: issues.warnings,  // Map warnings to medium
        info: issues.informational  // Map informational to info
      };
      
      // Step 6: Generate AI analysis text safely
      const aiAnalysis = this.generateAIAnalysis(scores, issues, aggregatedData?.project);
      
      // Step 7: Build final response with exact required structure
      const executiveSummary = {
        scores,
        issues,
        issueDistribution,
        aiAnalysis,
        metadata: {
          totalIssues: counts.totalIssues,
          pagesAnalyzed: 0, // Not needed for new approach
          generatedAt: new Date()
        }
      };
      
      console.log("EXECUTIVE MAPPER: Final executive summary:", executiveSummary);
      
      return {
        success: true,
        data: executiveSummary
      };
      
    } catch (error) {
      console.error('EXECUTIVE MAPPER ERROR:', error.stack);
      return this.getSafeFallback(error.message);
    }
  }
  
  /**
   * Get safe fallback response
   */
  static getSafeFallback(errorReason = 'Unknown error') {
    console.log('EXECUTIVE MAPPER: Returning safe fallback due to:', errorReason);
    
    return {
      success: true, // Return success to avoid API crashes
      data: {
        scores: { seoHealth: 0, aiVisibility: 0, performance: 0, authority: 0 },
        issues: { critical: 0, warnings: 0, informational: 0 },
        issueDistribution: { critical: 0, medium: 0, info: 0, total: 0 },
        aiAnalysis: `Executive summary temporarily unavailable. Reason: ${errorReason}`,
        metadata: {
          totalIssues: 0,
          pagesAnalyzed: 0,
          generatedAt: new Date(),
          fallbackUsed: true,
          fallbackReason: errorReason
        }
      }
    };
  }

  /**
   * Calculate passed checks estimate
   */
  static calculatePassedChecks(issues) {
    // Estimate based on total issues vs potential checks
    const totalIssues = issues.total || 0;
    const estimatedPotentialChecks = Math.max(100, totalIssues * 3);
    const passedChecks = Math.max(0, estimatedPotentialChecks - totalIssues);
    
    return FormatUtils.formatNumber(passedChecks);
  }

  /**
   * Calculate issue distribution percentages
   */
  static calculateIssueDistribution(issues) {
    const combined = issues.combined || {};
    const total = combined.critical + combined.high + combined.medium + combined.low;
    
    if (total === 0) {
      return {
        critical: { count: 0, percentage: 0 },
        warnings: { count: 0, percentage: 0 },
        info: { count: 0, percentage: 0 },
        passed: { count: 100, percentage: 100 }
      };
    }

    return {
      critical: {
        count: combined.critical || 0,
        percentage: PercentageUtils.calculatePercentage(combined.critical, total, 1)
      },
      warnings: {
        count: combined.high || 0,
        percentage: PercentageUtils.calculatePercentage(combined.high, total, 1)
      },
      info: {
        count: (combined.medium || 0) + (combined.low || 0),
        percentage: PercentageUtils.calculatePercentage(
          (combined.medium || 0) + (combined.low || 0), 
          total, 
          1
        )
      },
      passed: {
        count: this.calculatePassedChecks(issues),
        percentage: PercentageUtils.calculatePercentage(
          this.calculatePassedChecks(issues),
          total + this.calculatePassedChecks(issues),
          1
        )
      }
    };
  }

  /**
   * Generate AI analysis summary
   */
  static generateAIAnalysis(scores, issues, aiMetrics) {
    const overallGrade = GradeUtils.getGrade(scores.overall);
    const aiGrade = GradeUtils.getGrade(scores.aiVisibility);
    
    let analysis = `Overall site health is ${overallGrade.status.toLowerCase()} with a score of ${scores.overall}/100. `;
    
    // AI Visibility analysis
    if (scores.aiVisibility < 50) {
      analysis += `AI visibility is significantly below average at ${scores.aiVisibility}/100 (${aiGrade.status}). `;
      analysis += `Key gaps include structured schema implementation and entity coverage. `;
    } else if (scores.aiVisibility < 70) {
      analysis += `AI visibility shows room for improvement at ${scores.aiVisibility}/100. `;
      analysis += `Enhancing schema markup and entity optimization would elevate AI search performance. `;
    } else {
      analysis += `AI visibility is strong at ${scores.aiVisibility}/100, positioning well for AI-driven search. `;
    }
    
    // Issue analysis
    const totalIssues = issues.total || 0;
    if (totalIssues > 20) {
      analysis += `${totalIssues} issues detected require systematic optimization approach. `;
    } else if (totalIssues > 5) {
      analysis += `${totalIssues} issues identified can be resolved through targeted improvements. `;
    } else {
      analysis += `Site shows strong technical foundation with minimal issues. `;
    }
    
    // Performance analysis
    if (scores.performance < 60) {
      analysis += `Performance optimization should be prioritized to enhance user experience and rankings.`;
    } else if (scores.performance < 80) {
      analysis += `Performance is good but further optimizations could provide competitive advantage.`;
    } else {
      analysis += `Performance metrics indicate excellent user experience foundation.`;
    }
    
    return analysis;
  }

  /**
   * Generate key insights
   */
  static generateKeyInsights(scores, issues, grades) {
    const insights = [];
    
    // Overall performance insight
    if (scores.overall >= 80) {
      insights.push({
        type: 'positive',
        title: 'Strong Overall Performance',
        description: `Site achieves ${grades.overall.status} status with ${scores.overall}/100 overall score.`
      });
    } else if (scores.overall < 50) {
      insights.push({
        type: 'critical',
        title: 'Requires Immediate Attention',
        description: `Overall score of ${scores.overall}/100 indicates critical optimization needs.`
      });
    }
    
    // AI visibility insight
    const aiGap = 100 - scores.aiVisibility;
    if (aiGap > 30) {
      insights.push({
        type: 'opportunity',
        title: 'Significant AI Opportunity',
        description: `${aiGap}-point AI visibility gap represents major growth potential in AI search.`
      });
    }
    
    // Issue severity insight
    const criticalIssues = issues.combined?.critical || 0;
    if (criticalIssues > 0) {
      insights.push({
        type: 'warning',
        title: 'Critical Issues Detected',
        description: `${criticalIssues} critical issue${criticalIssues > 1 ? 's' : ''} require immediate resolution.`
      });
    }
    
    // Performance insight
    if (scores.performance >= 85) {
      insights.push({
        type: 'positive',
        title: 'Excellent Performance',
        description: 'Performance metrics exceed industry standards, providing competitive advantage.'
      });
    } else if (scores.performance < 60) {
      insights.push({
        type: 'critical',
        title: 'Performance Optimization Needed',
        description: 'Performance improvements could significantly impact user experience and rankings.'
      });
    }
    
    // Authority insight
    if (scores.authority >= 75) {
      insights.push({
        type: 'positive',
        title: 'Strong Domain Authority',
        description: 'Link profile and authority metrics indicate strong competitive positioning.'
      });
    } else if (scores.authority < 50) {
      insights.push({
        type: 'opportunity',
        title: 'Authority Building Opportunity',
        description: 'Link building and authority enhancement could provide significant ranking benefits.'
      });
    }
    
    return insights.slice(0, 4); // Limit to top 4 insights
  }

  /**
   * Generate trend indicators
   */
  static generateTrendIndicators(currentScores, previousScores = null) {
    if (!previousScores) {
      // Return neutral trends if no previous data
      return {
        overall: { direction: 'neutral', change: 0, percentage: 0 },
        seoHealth: { direction: 'neutral', change: 0, percentage: 0 },
        aiVisibility: { direction: 'neutral', change: 0, percentage: 0 },
        performance: { direction: 'neutral', change: 0, percentage: 0 },
        authority: { direction: 'neutral', change: 0, percentage: 0 }
      };
    }

    return {
      overall: this.calculateTrend(currentScores.overall, previousScores.overall),
      seoHealth: this.calculateTrend(currentScores.seoHealth, previousScores.seoHealth),
      aiVisibility: this.calculateTrend(currentScores.aiVisibility, previousScores.aiVisibility),
      performance: this.calculateTrend(currentScores.performance, previousScores.performance),
      authority: this.calculateTrend(currentScores.authority, previousScores.authority)
    };
  }

  /**
   * Calculate trend for a single metric
   */
  static calculateTrend(current, previous) {
    if (previous == null || previous === 0) {
      return { direction: 'neutral', change: 0, percentage: 0 };
    }

    const change = current - previous;
    const percentage = PercentageUtils.calculatePercentageChange(current, previous, 1);
    
    let direction = 'neutral';
    if (change > 2) direction = 'positive';
    else if (change < -2) direction = 'negative';

    return {
      direction,
      change: FormatUtils.formatNumber(change),
      percentage
    };
  }

  /**
   * Generate executive summary highlights
   */
  static generateHighlights(scores, issues, grades) {
    return {
      topScore: Math.max(scores.seoHealth, scores.aiVisibility, scores.performance, scores.authority),
      lowestScore: Math.min(scores.seoHealth, scores.aiVisibility, scores.performance, scores.authority),
      totalIssues: issues.total || 0,
      criticalIssues: issues.combined?.critical || 0,
      overallGrade: grades.overall.grade,
      performanceStatus: GradeUtils.getPerformanceRating(scores.overall)
    };
  }

  /**
   * Validate executive summary data
   */
  static validate(executiveData) {
    const required = ['scores', 'issues', 'issueDistribution'];
    const missing = required.filter(field => executiveData[field] == null);
    
    if (missing.length > 0) {
      throw new Error(`Executive mapper missing required fields: ${missing.join(', ')}`);
    }
    
    return true;
  }
}
