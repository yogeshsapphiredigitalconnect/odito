import { NotFoundError, AccessDeniedError } from '../../../utils/ErrorUtil.js';
import { LoggerUtil } from '../../../utils/LoggerUtil.js';
import mongoose from 'mongoose';

/**
 * Project Performance Service
 * Extracted from projectDataController.js - Phase 2 Refactoring
 * 
 * Handles all project performance-related business logic
 * Maintains EXACT same behavior as original controller
 */
export class ProjectPerformanceService {
  
  /**
   * Get project performance data
   * Extracted from getProjectPerformance controller function
   * Maintains IDENTICAL response format and behavior
   */
  static async getProjectPerformance(project) {
    const projectId = project._id.toString();
    const userId = project.user_id.toString();
    
    LoggerUtil.info('Project Performance API called', { projectId, userId });

    const db = mongoose.connection.db;
    const { ObjectId } = mongoose.Types;
    const projectIdObj = new ObjectId(projectId);

    // Get PageSpeed data from seo_domain_performance collection
    const pagespeedData = await db.collection('seo_domain_performance').findOne({
      project_id: projectIdObj
    });

    if (!pagespeedData) {
      return {
        success: true,
        data: {
          mobile: null,
          desktop: null,
          summary: {
            mobileScore: 0,
            desktopScore: 0,
            avgPerformance: 0
          },
          message: "No PageSpeed data available. Run a PageSpeed audit first."
        }
      };
    }

    // Calculate summary (EXACT same logic)
    const mobileScore = pagespeedData.mobile?.performance_score || 0;
    const desktopScore = pagespeedData.desktop?.performance_score || 0;
    const avgPerformance = Math.round((mobileScore + desktopScore) / 2);

    // Format data for frontend compatibility (EXACT same logic)
    const formatDeviceData = (deviceData) => {
      if (!deviceData) return null;
      
      // Extract TTFB from diagnostics if available
      let ttfb = null;
      if (deviceData.diagnostics && Array.isArray(deviceData.diagnostics)) {
        const serverResponseTime = deviceData.diagnostics.find(d => d.id === 'server-response-time');
        if (serverResponseTime && serverResponseTime.details && serverResponseTime.details.items && serverResponseTime.details.items.length > 0) {
          const responseTime = serverResponseTime.details.items[0].responseTime;
          if (responseTime !== undefined) {
            ttfb = {
              value: responseTime,
              unit: 'ms',
              display_value: `${responseTime} ms`
            };
          }
        }
      }

      return {
        // New structure for frontend
        performance: deviceData.performance_score || 0,
        accessibility: deviceData.accessibility_score || 0,
        best_practices: deviceData.best_practices_score || 0,
        seo: deviceData.seo_score || 0,
        opportunities: deviceData.opportunities || [],
        diagnostics: deviceData.diagnostics || [],
        passed_audits: deviceData.passed_audits || [],
        metrics: deviceData.metrics || {},
        
        // Backward compatibility - keep existing fields
        performance_score: deviceData.performance_score || 0,
        fcp: deviceData.fcp,
        lcp: deviceData.lcp,
        cls: deviceData.cls,
        tbt: deviceData.tbt,
        speed_index: deviceData.speed_index,
        tti: deviceData.tti,
        ttfb: ttfb
      };
    };

    // Return EXACT same response structure as controller
    return {
      success: true,
      data: {
        mobile: formatDeviceData(pagespeedData.mobile),
        desktop: formatDeviceData(pagespeedData.desktop),
        domain: pagespeedData.domain,
        tested_at: pagespeedData.tested_at,
        summary: {
          mobileScore,
          desktopScore,
          avgPerformance
        }
      }
    };
  }

  /**
   * Save performance data
   * Additional utility method for future use
   */
  static async savePerformanceData(userId, projectId, performanceData) {
    // Validate project ownership
    const project = await SeoProject.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.user_id.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }

    const db = mongoose.connection.db;
    const { ObjectId } = mongoose.Types;
    const projectIdObj = new ObjectId(projectId);

    // Save or update performance data
    const result = await db.collection('seo_domain_performance').updateOne(
      { project_id: projectIdObj },
      {
        $set: {
          ...performanceData,
          project_id: projectIdObj,
          tested_at: new Date()
        }
      },
      { upsert: true }
    );

    return {
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedId: result.upsertedId
      }
    };
  }
}
