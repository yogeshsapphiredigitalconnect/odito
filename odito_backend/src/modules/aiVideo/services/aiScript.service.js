import AIScript from '../models/aiScript.model.js';
import { AiDataService } from './aiData.service.js';
import { GeminiService } from '../../../services/gemini.service.js';
import SeoProject from '../../app_user/model/SeoProject.js';

/**
 * AI Script Service
 * Orchestrates the script generation pipeline:
 * 1. Fetch audit data
 * 2. Generate structured JSON from audit data
 * 3. Generate narration script from JSON
 * 4. Store results in database
 */
export class AiScriptService {
  /**
   * 🔧 STEP 3: CREATE SAFE GET FUNCTION
   * Safely traverse nested object paths without errors
   * 
   * @param {Object} obj - Object to traverse
   * @param {string} path - Dot notation path (e.g., 'data.issueDistribution.total')
   * @param {*} defaultValue - Default value if path doesn't exist
   * @returns {*} Value at path or default
   */
  static get(obj, path, defaultValue = 0) {
    // Add safety check for undefined obj
    if (!obj || typeof obj !== 'object') {
      console.warn('[GET] Safety check: obj is undefined or not an object, returning default value');
      return defaultValue;
    }
    
    return path.split('.').reduce((o, key) => (o || {})[key], obj) ?? defaultValue;
  }

  /**
   * Safe value getter with fallback
   * Handles null, undefined, and type mismatches
   * @param {*} value - Value to check
   * @param {*} fallback - Fallback value if invalid
   * @returns {*} Valid value or fallback
   */
  static safe(value, fallback) {
    return value ?? fallback;
  }

  /**
   * Safe array getter
   * Ensures array conversion with fallback
   * @param {*} value - Value to convert to array
   * @returns {Array} Valid array or empty array
   */
  static safeArray(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') {
      console.warn('[SCRIPT_DATA] Converting object to array:', value);
      return Object.entries(value).map(([key, v]) => ({ type: key, value: v }));
    }
    return [];
  }
  
  /**
   * Generate script for a project
   * Main orchestration method
   * 
   * @param {string} projectId - Project ID
   * @param {Object} options - Configuration options (including authToken)
   * @returns {Object} Generated script data
   */
  static async generateScript(projectId, options = {}) {
    const startTime = Date.now();
    let aiScriptRecord = null;

    try {
      console.log(`[SCRIPT_GEN] Starting script generation for project: ${projectId}`);

      // Step 1: Validate project exists and get userId
      const project = await SeoProject.findById(projectId);
      if (!project) {
        throw new Error(`Project not found: ${projectId}`);
      }

      const userId = project.user_id;

      // Step 2: Check if script already exists (avoid regeneration)
      const existingScript = await this.getExistingScript(projectId);
      if (existingScript && existingScript.status === 'completed' && !options.forceRegenerate) {
        console.log(`[SCRIPT_GEN] Returning existing script for project: ${projectId}`);
        return {
          success: true,
          script: existingScript.script,
          isExisting: true,
          processingTime: Date.now() - startTime
        };
      }

      // Create or get script record
      aiScriptRecord = await this.getOrCreateScriptRecord(projectId, userId);
      await this.updateScriptStatus(aiScriptRecord._id, 'generating');

      // Step 3: Fetch audit data
      console.log(`[SCRIPT_GEN] Fetching audit data...`);
      const auditResult = await AiDataService.fetchAuditData(projectId, {
        authToken: options.authToken
      });
      const auditData = auditResult.data;

      // Step 4: Build audit snapshot from REAL DATA
      console.log(`[SCRIPT_GEN] Building audit snapshot from unified service data...`);
      const auditSnapshot = this.buildAuditSnapshot(auditData);
      console.log('[SCRIPT_GEN] auditSnapshot.scores:', auditSnapshot.scores);
      
      // 🔧 STEP 8: VERIFY FIX WITH TEST SCRIPT OUTPUT
      console.log('[SCRIPT_GEN] 🔧 STEP 8: VERIFYING FIX WITH TEST SCRIPT OUTPUT');
      console.log('=== TEST SCRIPT OUTPUT ===');
      console.log(this.testScript(auditSnapshot));
      console.log('=== END TEST SCRIPT ===');
      
      // Step 4b: Structure for prompt building
      console.log(`[SCRIPT_GEN] Structuring data for Gemini prompt...`);
      const structuredData = this.buildPromptData(auditData);

      // Step 5: Save audit snapshot with REAL DATA
      console.log(`[SCRIPT_GEN] Saving audit snapshot...`);
      
      // 🔍 STEP 2: BEFORE DB SAVE
      console.log('\n🔍 STEP 4 - Before DB save:');
      console.log('auditSnapshot.issueDistribution.critical:', auditSnapshot.issueDistribution.critical);
      console.log('auditSnapshot.issueDistribution.total:', auditSnapshot.issueDistribution.total);
      console.log('auditSnapshot.scores.aiVisibility:', auditSnapshot.scores.aiVisibility);
      console.log('auditSnapshot.scores.overall:', auditSnapshot.scores.overall);
      console.log('auditSnapshot frozen:', Object.isFrozen(auditSnapshot));
      
      // 🔧 VALIDATION: Check for REAL data (not all audits have critical issues)
      // Valid cases: total > 0, OR (total = 0 AND cover data present)
      const hasRealIssueData = auditSnapshot.issueDistribution.total > 0;
      const hasCoverData = auditSnapshot.scores?.overall > 0 || auditSnapshot.scores?.seo > 0;
      
      if (!hasRealIssueData && !hasCoverData) {
        console.error("❌ CRITICAL: NO DATA FOUND!");
        console.error("Expected: total > 0 OR cover scores > 0");
        console.error("Got: total=" + auditSnapshot.issueDistribution.total + ", scores=" + JSON.stringify(auditSnapshot.scores));
        throw new Error("Data validation failed: no issue data and no cover data found");
      }
      
      // Log validation success
      if (hasRealIssueData) {
        console.log('✅ VALIDATION PASSED: Real issue data present (total=' + auditSnapshot.issueDistribution.total + ')');
      } else if (hasCoverData) {
        console.log('✅ VALIDATION PASSED: Cover data present (scores exist)');
      }
      
      const saveResult = await AIScript.updateOne(
        { _id: aiScriptRecord._id },
        { auditSnapshot: auditSnapshot }
      );
      
      console.log('[SCRIPT_GEN] ✅ Audit snapshot saved successfully');
      console.log('Save result:', saveResult);

      // Step 6: Generate script from Gemini
      console.log(`[SCRIPT_GEN] Calling Gemini API to generate script...`);
      const scriptPrompt = this.buildScriptPrompt(structuredData);
      let generatedScript;
      
      try {
        generatedScript = await GeminiService.generateScript(scriptPrompt);
        console.log(`[SCRIPT_GEN] ✅ Gemini API succeeded`);
      } catch (geminiError) {
        console.warn(`[SCRIPT_GEN] ⚠️ Gemini API failed, using fallback script:`, geminiError.message);
        generatedScript = this.generateFallbackScript(auditSnapshot);
      }

      // Step 7: Save completed script
      console.log(`[SCRIPT_GEN] Saving generated script...`);
      const processingTime = Date.now() - startTime;

      await AIScript.updateOne(
        { _id: aiScriptRecord._id },
        {
          script: generatedScript,
          status: 'completed',
          processingTime,
          error: null
        }
      );

      console.log(`[SCRIPT_GEN] Script generation completed | processingTime=${processingTime}ms`);

      return {
        success: true,
        script: generatedScript,
        isExisting: false,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;

      console.error(`[SCRIPT_GEN] Script generation failed:`, {
        projectId,
        error: error.message,
        processingTime
      });

      // Update script record with error status
      if (aiScriptRecord) {
        await AIScript.updateOne(
          { _id: aiScriptRecord._id },
          {
            status: 'failed',
            error: error.message,
            processingTime
          }
        ).catch(err => console.error('[SCRIPT_GEN] Failed to update error status:', err));
      }

      throw error;
    }
  }

  /**
   * Get existing script if it exists and is recent
   * 
   * @param {string} projectId - Project ID
   * @returns {Object|null} Existing script record or null
   */
  static async getExistingScript(projectId) {
    try {
      const script = await AIScript.findOne({
        projectId,
        status: 'completed'
      }).lean();

      return script;
    } catch (error) {
      console.warn(`[SCRIPT_GEN] Error checking for existing script:`, error);
      return null;
    }
  }

  /**
   * Get existing script record or create new one
   * 
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @returns {Object} AIScript document
   */
  static async getOrCreateScriptRecord(projectId, userId) {
    try {
      let record = await AIScript.findOne({ projectId, status: 'pending' });

      if (!record) {
        record = new AIScript({
          projectId,
          userId,
          status: 'pending',
          createdAt: new Date()
        });
        await record.save();
      }

      return record;
    } catch (error) {
      console.error(`[SCRIPT_GEN] Error getting/creating script record:`, error);
      throw error;
    }
  }

  /**
   * Update script status
   * 
   * @param {string} scriptId - AIScript ID
   * @param {string} status - New status
   */
  static async updateScriptStatus(scriptId, status) {
    try {
      await AIScript.updateOne(
        { _id: scriptId },
        { status, updatedAt: new Date() }
      );
    } catch (error) {
      console.error(`[SCRIPT_GEN] Error updating script status:`, error);
      throw error;
    }
  }

  /**
   * Build audit snapshot from real data (NO DUPLICATE FIELDS)
   * Uses unified service data directly, safe handling for missing values
   * 
   * @param {Object} auditData - Structured audit data from AiDataService
   * @returns {Object} Audit snapshot for storage with REAL DATA
   */
  static buildAuditSnapshot(auditData) {
    try {
      console.log('[AUDIT_SNAPSHOT] Building snapshot from real audit data');
      
      // 🔍 STEP 1: LOG FULL API RESPONSE (CRITICAL)
      console.log('FULL API RESPONSE:');
      console.log(JSON.stringify(auditData, null, 2));
      
      // 🔍 STEP 2: IDENTIFY REAL DATA PATH
      console.log('[AUDIT_SNAPSHOT] 🔍 STEP 2: Checking possible data paths...');
      console.log('data.issueDistribution exists:', !!auditData.issueDistribution);
      console.log('data.data.issueDistribution exists:', !!auditData.data?.issueDistribution);
      console.log('data.executiveSummary.issueDistribution exists:', !!auditData.executiveSummary?.issueDistribution);
      console.log('data.issues exists:', !!auditData.issues);
      console.log('data.scores exists:', !!auditData.scores);
      
      // 🔍 NEW: Check the actual issues structure
      console.log('data.issues structure:', auditData.issues);
      console.log('data.issues.critical:', auditData.issues?.critical);
      console.log('data.issues.warnings:', auditData.issues?.warnings);
      console.log('data.issues.informational:', auditData.issues?.informational);

      // 🔧 STEP 2: FIX ISSUE DISTRIBUTION SOURCE (FROM REAL API DATA)
      // API Returns: { critical?, high, medium, low/lowInfo }
      console.log('[AUDIT_SNAPSHOT] 🔧 Extracting real issue counts from unified service...');
      
      // Extract real counts from unifiedData (from UnifiedJsonService)
      const realIssues = auditData.issues || {};
      console.log('Real issues from API:', realIssues);
      
      // Map API response to our structure - calculate counts from array lengths
      const issueDistribution = {
        critical: Array.isArray(realIssues.critical) ? realIssues.critical.length : (realIssues.critical || 0),
        high: Array.isArray(realIssues.high) ? realIssues.high.length : (realIssues.high || 0),
        medium: Array.isArray(realIssues.medium) ? realIssues.medium.length : (realIssues.medium || 0),
        low: Array.isArray(realIssues.low) ? realIssues.low.length : (Array.isArray(realIssues.info) ? realIssues.info.length : (realIssues.low || realIssues.info || 0)),
        total: 0 // Will be calculated below
      };
      
      // Calculate total properly
      issueDistribution.total = issueDistribution.critical + issueDistribution.high + issueDistribution.medium + issueDistribution.low;
      
      console.log('✅ MAPPED issueDistribution FROM API:', issueDistribution);

      // Scores: unified uses scores.seo (alias of seoHealth); support legacy scores.seoHealth
      const scores = {
        overall: Math.round(
          this.get(auditData, "scores.overall", this.get(auditData, "scores.seo", this.get(auditData, "scores.seoHealth", this.get(auditData, "overallScore"))))
        ),
        performance: Math.round(this.get(auditData, "scores.performance")),
        seo: Math.round(this.get(auditData, "scores.seo", this.get(auditData, "scores.seoHealth"))),
        aiVisibility: Math.round(this.get(auditData, "scores.aiVisibility"))
      };
      
      console.log("MAPPED scores:", scores);

      // 🔧 STEP 4: FIX PERFORMANCE MAPPING (CORRECTED)
      const perf = auditData.performance || {};
      const performanceMetrics = {
        pageSpeed: perf?.stats?.desktopScore || perf?.score || 0,
        metrics: [
          {
            metric: "Largest Contentful Paint",
            mobile: perf?.stats?.mobileLCP?.display_value || "N/A"
          },
          {
            metric: "Total Blocking Time", 
            mobile: perf?.stats?.mobileTBT?.display_value || "N/A"
          },
          {
            metric: "First Contentful Paint",
            mobile: perf?.stats?.mobileFCP?.display_value || "N/A"
          },
          {
            metric: "Cumulative Layout Shift",
            mobile: perf?.stats?.mobileCLS?.display_value || "N/A"
          }
        ]
      };
      
      console.log('✅ Built performanceMetrics:', performanceMetrics);

      // 🔧 STEP 5: EXTRACT PAGE 08 DATA (REAL TOP ISSUES)
      console.log('\n🔧 STEP 5: EXTRACTING PAGE 08 TOP ISSUES');
      console.log('-'.repeat(40));
      
      // Get top issues from unified response - CORRECTED PATH
      const topIssuesUnified = auditData.issues || {};
      console.log('Unified Issues Data:', topIssuesUnified);
      
      // Extract top issues directly from unified data structure
      const topIssues = {
        high: topIssuesUnified.high || [],
        medium: topIssuesUnified.medium || [],
        low: topIssuesUnified.low || []
      };
      
      console.log(`✅ Top Issues: High=${topIssues.high.length}, Medium=${topIssues.medium.length}, Low=${topIssues.low.length}`);
      console.log('High issues count:', topIssues.high.length);
      console.log('Medium issues count:', topIssues.medium.length);
      console.log('Low issues count:', topIssues.low.length);

      // 🔧 STEP 6: EXTRACT PAGE 10 DATA (REAL TECHNICAL CHECKS)
      console.log('\n🔧 STEP 6: EXTRACTING PAGE 10 TECHNICAL HIGHLIGHTS');
      console.log('-'.repeat(40));
      
      // Get technical highlights from unified response - CORRECTED PATH
      const technicalUnified = auditData.technical || {};
      console.log('Unified Technical Data:', technicalUnified);
      
      // Extract checks from unified data structure
      const allChecks = technicalUnified.checks || [];
      const technicalHighlights = {
        checks: allChecks.slice(0, 12), // Return up to 12 checks as requested
        criticalIssues: allChecks.filter(c => c.status === 'FAIL').slice(0, 3),
        topRecommendations: allChecks.slice(0, 5)
      };
      
      console.log(`✅ Technical Checks: Total=${allChecks.length}, Checks=${technicalHighlights.checks.length}`);
      console.log('Critical findings count:', technicalHighlights.criticalIssues.length);
      console.log('Recommendations count:', technicalHighlights.topRecommendations.length);

      // Extract other data safely
      const aiObj = this.safe(auditData.ai, {});
      const aiVisibilityScore = this.safe(aiObj.visibility, this.safe(auditData.scores?.aiVisibility, 0));
      const schemaMarkup = this.safeArray(aiObj.schemaMarkup);
      const recommendations = this.safeArray(auditData.recommendations).slice(0, 5);
      const keywordsObj = this.safe(auditData.keywords, {});
      const topRankings = this.safeArray(keywordsObj.topRankings).slice(0, 5);
      const opportunities = this.safeArray(keywordsObj.opportunities).slice(0, 3);

      // 🔧 STEP 7: VALIDATION CHECKS
      console.log('\n🔧 STEP 7: VALIDATION CHECKS');
      console.log('-'.repeat(40));
      
      // Validate topIssues structure (high/medium/low, not critical)
      const totalTopIssues = (topIssues.high?.length || 0) + (topIssues.medium?.length || 0) + (topIssues.low?.length || 0);
      if (totalTopIssues === 0 && issueDistribution.critical > 0) {
        console.warn('⚠️ Top issues missing but counts exist → extraction failed');
        console.warn('Expected total issues > 0 but got:', totalTopIssues);
        console.warn('Issue distribution shows critical:', issueDistribution.critical);
      }
      
      if (!technicalHighlights.criticalIssues.length && !technicalHighlights.checks.length) {
        console.warn('⚠️ Technical highlights missing');
      }
      
      if (performanceMetrics.pageSpeed === 0) {
        console.warn('⚠️ Performance metrics missing or zero');
      } else {
        console.log('✅ Performance metrics look good');
      }
      
      // Log extraction summary
      console.log('\n📊 EXTRACTION SUMMARY:');
      console.log('Issue Distribution:', issueDistribution);
      console.log('Top Issues:', {
        high: topIssues.high.length,
        medium: topIssues.medium.length,
        low: topIssues.low.length
      });
      console.log('Technical Highlights:', {
        criticalIssues: technicalHighlights.criticalIssues.length,
        recommendations: technicalHighlights.topRecommendations.length
      });
      console.log('Performance:', {
        pageSpeed: performanceMetrics.pageSpeed,
        metricsCount: performanceMetrics.metrics.length
      });

      // � STEP 8: BUILD SNAPSHOT (CORRECT ORDER)
      console.log('\n🔧 STEP 8: BUILD SNAPSHOT (CORRECT ORDER)');
      console.log('-'.repeat(40));
      
      const auditSnapshot = {
        // Real project data
        projectName: this.get(auditData, "project.name", "Website"),
        url: this.get(auditData, "project.url", "N/A"),
        
        scores: scores,
        issueDistribution: issueDistribution,
        
        // Top issues with full data (from Page 08 or fallback)
        topIssues: topIssues,
        
        // Technical SEO data (from Page 10 or fallback)
        technicalHighlights: technicalHighlights,
        
        // Performance data (from corrected mapping)
        performanceMetrics: performanceMetrics,
        
        // Keywords & rankings (fallback extraction)
        keywordData: {
          totalKeywords: this.safe(auditData.keywords?.totalKeywords, 0),
          topRankings: topRankings,
          opportunities: opportunities
        },
        
        // AI visibility insights
        aiAnalysis: {
          score: Math.round(aiVisibilityScore),
          schemaMarkupCount: schemaMarkup.length,
          hasKnowledgeGraph: !!(aiObj.knowledgeGraph?.exists)
        },
        
        // 🔧 STEP 4: FIX RECOMMENDATIONS (IMPORTANT)
        // Convert objects to readable text
        recommendations: this.safeArray(auditData.recommendations).map(r => 
          typeof r === 'object' ? r.title || r.description || JSON.stringify(r) : r
        ).slice(0, 5),
        
        // Metadata for tracking
        metadata: {
          source: 'UnifiedJsonService',
          generatedAt: new Date().toISOString(),
          dataQuality: 'real'
        }
      };

      console.log('[AUDIT_SNAPSHOT] ✅ Snapshot created from REAL DATA', {
        projectName: auditSnapshot.projectName,
        overallScore: auditSnapshot.scores.overall,
        criticalIssues: auditSnapshot.issueDistribution.critical,
        topIssuesCount: topIssues.high.length + topIssues.medium.length + topIssues.low.length,
        technicalIssuesCount: technicalHighlights.criticalIssues.length,
        performanceScore: performanceMetrics.pageSpeed,
        recommendationCount: recommendations.length
      });

      // 🔧 STEP 9: FREEZE DATA (IMPORTANT)
      console.log('\n🔧 STEP 9: FREEZE DATA (IMPORTANT)');
      Object.freeze(auditSnapshot);
      console.log('auditSnapshot frozen:', Object.isFrozen(auditSnapshot));
      
      // 🔧 STEP 10: FINAL VALIDATION BEFORE RETURN (CRITICAL)
      console.log('\n🔧 STEP 10: FINAL VALIDATION CHECK');
      console.log('═'.repeat(50));
      console.log('FINAL DATA CHECK:', {
        critical: auditSnapshot.issueDistribution.critical,
        high: auditSnapshot.issueDistribution.high,
        medium: auditSnapshot.issueDistribution.medium,
        total: auditSnapshot.issueDistribution.total,
        technicalChecks: technicalHighlights.criticalIssues.length
      });
      console.log('═'.repeat(50));
      
      // Validate real data is present
      if (auditSnapshot.issueDistribution.total === 0) {
        console.warn('⚠️ WARNING: Total issues = 0 - check if API returned data');
      } else if (auditSnapshot.issueDistribution.critical > 0 || auditSnapshot.issueDistribution.high > 0) {
        console.log('✅ SUCCESS: Real data is present in snapshot');
      }
      
      if (auditSnapshot.issueDistribution.critical === 0) {
        console.error("❌ DATA LOSS DETECTED");
        console.error("Expected critical > 0 or high > 0, got critical:", auditSnapshot.issueDistribution.critical, "high:", auditSnapshot.issueDistribution.high);
      } else {
        console.log("✅ Data validation PASSED - critical issues:", auditSnapshot.issueDistribution.critical);
      }

      return auditSnapshot;

    } catch (error) {
      console.error('[AUDIT_SNAPSHOT] ERROR building snapshot:', error.message);
      throw error;
    }
  }

  /**
   * Build prompt data from structured audit data
   * Extracts key metrics and issues for Gemini
   * SAFE HANDLING: Validates all data before calling .slice()
   * 
   * @param {Object} auditData - Structured audit data
   * @returns {Object} Compact data for prompt with safe defaults
   */
  static buildPromptData(auditData) {
    try {
      // 🔍 STEP 1: DEBUG LOGGING - Understand data structure
      console.log('[SCRIPT_DATA] DEBUG - auditData structure:', {
        hasIssues: !!auditData.issues,
        issuesType: typeof auditData.issues,
        hasTechnical: !!auditData.technical,
        hasPerformance: !!auditData.performance,
        hasKeywords: !!auditData.keywords,
        hasAI: !!auditData.ai,
        hasRecommendations: !!auditData.recommendations,
        hasIssueDistribution: !!auditData.issueDistribution
      });

      // 🔍 STEP 2: SAFETY CHECK - Ensure auditData is valid object
      if (!auditData || typeof auditData !== 'object') {
        console.error('[SCRIPT_DATA] ERROR: auditData is not a valid object');
        return this.getFailSafeStructure();
      }

      // 🔍 STEP 3: EXTRACT KEY METRICS - Use safe extraction
      const scores = {
        overall: Math.round(
          this.get(auditData, "scores.overall", this.get(auditData, "scores.seo", this.get(auditData, "scores.seoHealth", this.get(auditData, "overallScore"))))
        ),
        performance: Math.round(this.get(auditData, "scores.performance")),
        seo: Math.round(this.get(auditData, "scores.seo", this.get(auditData, "scores.seoHealth"))),
        aiVisibility: Math.round(this.get(auditData, "scores.aiVisibility"))
      };

      // Define perf for performance metrics
      const perf = auditData.performance || {};
      
      // Define performanceMetrics array
      const performanceMetrics = [
        {
          name: 'Page Speed',
          value: perf?.stats?.desktopScore || perf?.score || 0,
          status: perf?.stats?.desktopScore >= 90 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
        },
        {
          name: 'Mobile Performance',
          value: perf?.stats?.mobileScore || 0,
          status: perf?.stats?.mobileScore >= 90 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
        }
      ];

      const issueDistribution = {
        total: this.get(auditData, "issueDistribution.total", 0),
        critical: this.get(auditData, "issueDistribution.critical", 0),
        high: this.get(auditData, "issueDistribution.high", 0),
        medium: this.get(auditData, "issueDistribution.medium", 0),
        low: this.get(auditData, "issueDistribution.low", 0),
        info: this.get(auditData, "issueDistribution.info", 0)
      };

      // 🔍 STEP 4: FIX SCRIPT INPUT DATA - Use issueDistribution (not individual counts)
      const topIssues = {
        critical: this.get(auditData, "topIssues.critical", []),
        high: this.get(auditData, "topIssues.high", []),
        medium: this.get(auditData, "topIssues.medium", []),
        low: this.get(auditData, "topIssues.low", [])
      };

      const technicalHighlights = {
        criticalIssues: this.get(auditData, "technicalHighlights.criticalIssues", []),
        topRecommendations: this.get(auditData, "technicalHighlights.topRecommendations", [])
      };
      // Extract keyword data safely
      const keywordsObj = this.safe(auditData.keywords, {});
      const topRankings = this.safeArray(keywordsObj.topRankings).slice(0, 5);
      const opportunities = this.safeArray(keywordsObj.opportunities).slice(0, 3);

      // Extract AI visibility data safely
      const aiObj = this.safe(auditData.ai, {});
      const schemaMarkup = this.safeArray(aiObj.schemaMarkup);

      // Extract recommendations safely and format them
      const recommendations = this.safeArray(auditData.recommendations).slice(0, 5);
      const formattedRecommendations = recommendations.map(r => 
        typeof r === 'object' ? r.title || r.description || JSON.stringify(r) : r
      );

      console.log('[SCRIPT_DATA] DEBUG - extracted data safely');
      
      // 🔧 STEP 6: ADD VALIDATION CHECK (CORRECTED - allow critical=0)
      // Only warn if TOTAL is zero, which indicates real data loss
      // Critical can be 0 legitimately - not all audits have critical issues
      const totalIssues = issueDistribution.critical + issueDistribution.high + issueDistribution.medium + issueDistribution.low;
      
      if (totalIssues === 0) {
        console.warn('⚠️ WARNING: Zero total issues detected - check if API returned data');
      } else if (issueDistribution.critical === 0) {
        console.log('✅ No critical issues found, but real issues exist: high=' + issueDistribution.high + ', medium=' + issueDistribution.medium + ', low=' + issueDistribution.low);
      } else {
        console.log('✅ Full issue data present: critical=' + issueDistribution.critical + ', high=' + issueDistribution.high + ', medium=' + issueDistribution.medium);
      }

      // ✅ GUARANTEED SAFE RETURN STRUCTURE WITH FIXES
      return {
        projectName: this.safe(auditData.project?.name, 'Website'),
        url: this.safe(auditData.project?.url, 'N/A'),
        
        // 🔧 STEP 3: FIX SCORES from unified service - Use same get() method as buildAuditSnapshot
        scores: {
          overall: Math.round(
            this.get(auditData, "scores.overall", this.get(auditData, "scores.seo", this.get(auditData, "scores.seoHealth", this.get(auditData, "overallScore"))))
          ),
          performance: Math.round(this.get(auditData, "scores.performance")),
          seo: Math.round(this.get(auditData, "scores.seo", this.get(auditData, "scores.seoHealth"))),
          aiVisibility: Math.round(this.get(auditData, "scores.aiVisibility"))
        },
        
        // 🔧 STEP 5: FIX SCRIPT INPUT DATA - Use issueDistribution
        issueDistribution: issueDistribution,
        
        topIssues: {
          critical: topIssues.critical,
          high: topIssues.high,
          medium: topIssues.medium
        },
        technicalHighlights: {
          criticalIssues: technicalHighlights.criticalIssues,
          topRecommendations: technicalHighlights.topRecommendations
        },
        performanceMetrics: {
          pageSpeed: this.safe(perf.pageSpeed, perf?.stats?.desktopScore || perf?.score || 0),
          metrics: performanceMetrics
        },
        keywordData: {
          totalKeywords: this.safe(keywordsObj.totalKeywords, 0),
          topRankings: topRankings,
          opportunities: opportunities
        },
        aiVisibility: {
          score: Math.round(this.safe(aiObj.visibility, 0)),
          schemaMarkupCount: schemaMarkup.length,
          hasKnowledgeGraph: !!(aiObj.knowledgeGraph?.exists)
        },
        // 🔧 STEP 4: FIX RECOMMENDATIONS - Use formatted recommendations
        topRecommendations: formattedRecommendations
      };

    } catch (error) {
      console.error('[SCRIPT_DATA] ERROR in buildPromptData:', {
        error: error.message,
        stack: error.stack
      });

      // ✅ FAIL-SAFE: Return minimal but valid structure
      console.log('[SCRIPT_DATA] Returning fallback structure due to error');
      return {
        projectName: this.safe(auditData?.project?.name, 'Website'),
        url: this.safe(auditData?.project?.url, 'N/A'),
        scores: {
          overall: 0,
          performance: 0,
          seo: 0,
          aiVisibility: 0
        },
        topIssues: {
          critical: [],
          high: [],
          medium: []
        },
        technicalHighlights: {
          criticalIssues: [],
          topRecommendations: []
        },
        performanceMetrics: {
          pageSpeed: 0,
          metrics: []
        },
        keywordData: {
          totalKeywords: 0,
          topRankings: [],
          opportunities: []
        },
        aiVisibility: {
          score: 0,
          schemaMarkupCount: 0,
          hasKnowledgeGraph: false
        },
        topRecommendations: []
      };
    }
  }

  /**
   * 🔧 STEP 7: CREATE TEST SCRIPT GENERATOR
   * Test function to verify auditSnapshot data integrity
   * 
   * @param {Object} auditSnapshot - Audit snapshot data
   * @returns {string} Test script output
   */
  static testScript(auditSnapshot) {
    return `
Project: ${auditSnapshot.projectName}

Critical Issues: ${auditSnapshot.issueDistribution.critical}
Medium Issues: ${auditSnapshot.issueDistribution.medium}
Total Issues: ${auditSnapshot.issueDistribution.total}

AI Score: ${auditSnapshot.scores.aiVisibility}
Overall Score: ${auditSnapshot.scores.overall}
Performance Score: ${auditSnapshot.scores.performance}
SEO Score: ${auditSnapshot.scores.seo}

Recommendations: ${auditSnapshot.recommendations.length}
Sample Recommendation: ${auditSnapshot.recommendations[0] || 'None'}
    `.trim();
  }

  /**
   * Generate fallback script when Gemini API fails
   * Uses audit data directly to create professional narration
   * 
   * @param {Object} auditSnapshot - Audit snapshot data
   * @returns {string} Professional fallback script
   */
  static generateFallbackScript(auditSnapshot) {
    console.log('[FALLBACK_SCRIPT] Generating fallback script using audit data');
    
    const {
      projectName,
      url,
      scores,
      issueDistribution,
      topIssues,
      recommendations
    } = auditSnapshot;

    const overallAssessment = scores.overall >= 80 ? 'strong' : scores.overall >= 60 ? 'moderate' : 'needs improvement';

    return `[INTRODUCTION]
Hello! We've completed a comprehensive SEO and AI visibility audit of ${projectName}.
This report analyzes your website at ${url} across multiple critical areas.

[OVERALL PERFORMANCE]
Your overall score is ${scores.overall} out of 100.
This indicates ${overallAssessment} performance for search engine optimization.

Performance Score: ${scores.performance}/100
SEO Health: ${scores.seo}/100
AI Discovery Score: ${scores.aiVisibility}/100

[KEY FINDINGS]
Our audit identified ${issueDistribution.critical} critical issues, ${issueDistribution.medium} medium-level issues, for a total of ${issueDistribution.total} issues.

Critical areas needing attention:
${(topIssues.high || []).slice(0, 3).map((issue, i) => `${i + 1}. ${issue.title || issue}`).join('\n') || '- No critical issues identified'}

These issues are affecting your search visibility and user experience.
Addressing them will have the most significant impact on your rankings.

[BUSINESS IMPACT]
Investigations show that these issues directly affect:
- Search engine crawlability: ${scores.seo >= 70 ? 'Adequate' : 'Needs improvement'}
- Page performance: ${scores.performance >= 70 ? 'Adequate' : 'Needs improvement'}
- AI bot discoverability: ${scores.aiVisibility >= 70 ? 'Adequate' : 'Needs improvement'}

[ACTION PLAN]
We recommend focusing on these priorities in the next 30 days:
${(recommendations || []).slice(0, 3).map((rec, i) => `${i + 1}. ${rec}`).join('\n') || '1. Implement core SEO best practices\n2. Improve page loading speed\n3. Add structured data markup'}

[CLOSING]
Implementing these recommendations will significantly improve your search rankings and online visibility.
We're here to support your success. Let's get started on making these improvements.

Thank you for choosing our SEO audit service.`;
  }

  /**
   * Build the script generation prompt for Gemini
   * 
   * @param {Object} promptData - Data for prompt
   * @returns {string} Complete prompt for Gemini
   */
  static buildScriptPrompt(promptData) {
    const {
      projectName,
      url,
      scores,
      issueDistribution = {},
      topIssues = {},
      technicalHighlights = {},
      performanceMetrics = {},
      keywordData = {},
      aiVisibility = {},
      topRecommendations = []
    } = promptData;

    return `You are a professional narrator and SEO expert. Create a compelling video narration script for an SEO audit report. The script should be suitable for voiceover and help clients understand their website's performance.

📊 AUDIT DATA:
Project: ${projectName}
Website: ${url}

🎯 SCORES:
- Overall Score: ${scores?.overall || 0}/100
- Performance: ${scores?.performance || 0}/100
- SEO Health: ${scores?.seo || 0}/100
- AI Visibility: ${scores?.aiVisibility || 0}/100

⚠️ KEY ISSUES (${issueDistribution?.total || 0} Total - ${issueDistribution?.critical || 0} Critical, ${issueDistribution?.medium || 0} Medium):
Critical areas needing attention:
${(topIssues.high || []).slice(0, 3).map((issue, i) => `${i + 1}. ${issue.title || issue}`).join('\n') || '- No critical issues identified'}
${(topIssues.medium || []).slice(0, 3).map((issue, i) => `${i + 1}. ${issue.title || issue}`).join('\n') || '- No medium issues identified'}
${(topIssues.low || []).slice(0, 1).map((issue, i) => `${i + 1}. ${issue.title || issue}`).join('\n') || '- No low issues identified'}

⚡ TECHNICAL HIGHLIGHTS:
${(technicalHighlights?.criticalIssues || []).map((issue, i) => `  ${i + 1}. ${issue}`).join('\n') || '  - No critical technical issues'}

💨 PERFORMANCE:
Page Speed Score: ${performanceMetrics?.pageSpeed || 0}
Key Metrics: ${(performanceMetrics?.metrics || []).join(', ') || 'Standard metrics'}

🔍 KEYWORDS:
Total Keywords Tracked: ${keywordData?.totalKeywords || 0}
Top Rankings: ${(keywordData?.topRankings || []).join(', ') || 'No ranking data'}

🤖 AI VISIBILITY:
AI Discovery Score: ${aiVisibility?.score || 0}
Schema Markup Implementation: ${aiVisibility?.schemaMarkupCount || 0} types
Knowledge Graph: ${aiVisibility?.hasKnowledgeGraph ? 'Present' : 'Not present'}

💡 TOP RECOMMENDATIONS:
${topRecommendations.map((rec, i) => `  ${i + 1}. ${rec}`).join('\n') || '  - General site optimization recommended'}

---

📝 PLEASE GENERATE A NARRATION SCRIPT WITH THIS STRUCTURE:

[INTRODUCTION]
- Professional greeting
- Brief overview of the audit

[OVERALL PERFORMANCE]
- Explain the overall score (simple language)
- Context of what this means for their business

[KEY FINDINGS]
- Top 3 critical issues affecting the site
- How these impact search visibility
- Business implications

[QUICK WINS]
- Easy wins they can achieve quickly
- Expected impact of implementing these

[AI & DISCOVERY]
- Current AI visibility score
- How AI bots perceive their content
- Recommendations for better AI discoverability

[ACTION PLAN]
- 3-5 priorities for next 30 days
- Expected outcomes

[CLOSING]
- Encouraging message
- Call to action

RULES:
✓ Use simple, conversational English
✓ Short sentences (max 15 words per sentence)
✓ Client-friendly language (avoid jargon)
✓ Positive but honest tone
✓ Focus on business impact
✓ Include numbers and metrics
✓ Make it suitable for voiceover (clear pronunciation)
✓ Total length: 2-3 minutes when read aloud (~500-750 words)
✓ Use [SECTION] markers for each part
✓ Don't include stage directions or asterisks

START WRITING THE SCRIPT NOW:`;
  }

  /**
   * Delete script for a project
   * 
   * @param {string} projectId - Project ID
   */
  static async deleteScript(projectId) {
    try {
      await AIScript.deleteOne({ projectId });
      console.log(`[SCRIPT_GEN] Script deleted for project: ${projectId}`);
    } catch (error) {
      console.error(`[SCRIPT_GEN] Error deleting script:`, error);
      throw error;
    }
  }

  /**
   * Get script by projectId
   * 
   * @param {string} projectId - Project ID
   * @returns {Object|null} AIScript document or null
   */
  static async getScriptByProjectId(projectId) {
    try {
      return await AIScript.findOne({ projectId })
        .select('script status createdAt updatedAt processingTime')
        .lean();
    } catch (error) {
      console.error(`[SCRIPT_GEN] Error fetching script:`, error);
      throw error;
    }
  }
}

export default AiScriptService;
