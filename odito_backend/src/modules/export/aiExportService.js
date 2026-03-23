import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

// URL normalizer for robust matching across collections
function normalizeUrlForMatching(url) {
  if (!url) return '';

  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')   // remove http/https
    .replace(/^www\./, '')         // remove www
    .replace(/\/$/, '');           // remove trailing slash
}

// Score class calculator
function getScoreClass(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'average';
  if (score >= 40) return 'poor';
  return 'critical';
}

// URL truncator for display
function truncateUrl(url, maxLength = 45) {
  if (!url) return '';
  return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
}

async function getAIOverviewData(projectId) {
  const db = mongoose.connection.db;
  const projectIdObj = new ObjectId(projectId);

  const [project, visibilityStats, issuesStats, pagesStats] = await Promise.all([
    db.collection('seoprojects').findOne({ _id: projectIdObj }),
    db.collection('seo_ai_visibility').aggregate([
      { $match: { projectId: projectIdObj } },
      {
        $group: {
          _id: null,
          totalPages: { $sum: 1 },
          avgVisibilityScore: { $avg: '$overall_page_score' },
          minScore: { $min: '$overall_page_score' },
          maxScore: { $max: '$overall_page_score' }
        }
      }
    ]).toArray(),
    db.collection('seo_ai_visibility_issues').aggregate([
      { $match: { projectId: projectIdObj } },
      {
        $group: {
          _id: null,
          totalIssues: { $sum: 1 },
          highIssues: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
          mediumIssues: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
          lowIssues: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } }
        }
      }
    ]).toArray(),
    db.collection('seo_ai_page_scores').aggregate([
      { $match: { projectId: projectIdObj } },
      {
        $group: {
          _id: null,
          totalScored: { $sum: 1 },
          avgBlocking: { $avg: '$blocking' },
          avgCompleteness: { $avg: '$completeness' }
        }
      }
    ]).toArray()
  ]);

  const visibility = visibilityStats[0] || {};
  const issues = issuesStats[0] || {};
  const pages = pagesStats[0] || {};

  return {
    projectName: project?.project_name || 'Unknown Project',
    mainUrl: project?.main_url || '',
    // AI STATUS FIELDS REMOVED - Will need new data source
    aiStatus: 'pending', // TODO: Get from new AI collection
    aiScore: Math.round(visibility.avgVisibilityScore) || 0,
    aiGrade: 'F', // TODO: Get from new AI collection
    totalPages: visibility.totalPages || 0,
    minScore: Math.round(visibility.minScore) || 0,
    maxScore: Math.round(visibility.maxScore) || 0,
    totalIssues: issues.totalIssues || 0,
    highIssues: issues.highIssues || 0,
    mediumIssues: issues.mediumIssues || 0,
    lowIssues: issues.lowIssues || 0,
    pagesScored: pages.totalScored || 0,
    avgBlocking: Math.round(pages.avgBlocking) || 0,
    avgCompleteness: Math.round(pages.avgCompleteness) || 0
  };
}

async function getAIScoresData(projectId) {
  const db = mongoose.connection.db;
  const projectIdObj = new ObjectId(projectId);

  const [websiteScore, pageScores] = await Promise.all([
    // Get AI score from new AIVisibilityProject collection
    db.collection('seo_ai_visibility_project').findOne(
      { projectId: projectIdObj },
      {
        projection: {
          'summary.overallScore': 1,
          'summary.grade': 1,
          'summary.totalIssues': 1,
          'summary.highSeverityIssues': 1,
          'summary.mediumSeverityIssues': 1,
          'summary.lowSeverityIssues': 1,
          'summary.pagesScored': 1,
          'summary.totalPages': 1,
          aiStatus: 1,
          completedAt: 1
        }
      }
    ),
    db.collection('seo_ai_page_scores').find(
      { projectId: projectIdObj },
      {
        projection: {
          page_url: 1,
          overall_page_score: 1,
          blocking: 1,
          completeness: 1,
          clarity: 1,
          structured_data_score: 1
        }
      }
    ).toArray()
  ]);

  const scores = pageScores.map(s => s.overall_page_score).filter(s => s > 0);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const scoreDistribution = {
    excellent: scores.filter(s => s >= 90).length,
    good: scores.filter(s => s >= 75 && s < 90).length,
    average: scores.filter(s => s >= 60 && s < 75).length,
    poor: scores.filter(s => s >= 40 && s < 60).length,
    critical: scores.filter(s => s < 40).length
  };

  return {
    websiteScore: websiteScore?.summary?.overallScore || avgScore,
    websiteGrade: websiteScore?.summary?.grade || 'F',
    pageCount: pageScores.length,
    pageScores: pageScores, // Add pageScores array for page-level access
    scoreDistribution,
    avgBlocking: pageScores.length > 0
      ? Math.round(pageScores.reduce((a, b) => a + (b.blocking || 0), 0) / pageScores.length)
      : 0,
    avgCompleteness: pageScores.length > 0
      ? Math.round(pageScores.reduce((a, b) => a + (b.completeness || 0), 0) / pageScores.length)
      : 0,
    avgClarity: pageScores.length > 0
      ? Math.round(pageScores.reduce((a, b) => a + (b.clarity || 0), 0) / pageScores.length)
      : 0,
    avgStructuredData: pageScores.length > 0
      ? Math.round(pageScores.reduce((a, b) => a + (b.structured_data_score || 0), 0) / pageScores.length)
      : 0
  };
}

async function getAIIssuesByCategory(projectId) {
  const db = mongoose.connection.db;
  const projectIdObj = new ObjectId(projectId);

  const categories = await db.collection('seo_ai_visibility_issues').aggregate([
    { $match: { projectId: projectIdObj } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        highCount: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
        mediumCount: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
        lowCount: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } }
      }
    },
    { $sort: { count: -1 } }
  ]).toArray();

  return categories.map(cat => ({
    category: cat._id || 'Unknown',
    count: cat.count,
    highCount: cat.highCount,
    mediumCount: cat.mediumCount,
    lowCount: cat.lowCount
  }));
}

async function getAIIssuesBySeverity(projectId) {
  const db = mongoose.connection.db;
  const projectIdObj = new ObjectId(projectId);

  const severities = await db.collection('seo_ai_visibility_issues').aggregate([
    { $match: { projectId: projectIdObj } },
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 },
        issues: {
          $push: {
            code: '$issue_code',
            message: '$issue_message',
            pageUrl: '$page_url',
            category: '$category',
            detectedValue: '$detected_value',
            expectedValue: '$expected_value'
          }
        }
      }
    },
    { $sort: { count: -1 } }
  ]).toArray();

  const severityOrder = { high: 0, medium: 1, low: 2 };
  severities.sort((a, b) => (severityOrder[a._id] || 99) - (severityOrder[b._id] || 99));

  return severities.map(sev => ({
    severity: sev._id || 'unknown',
    count: sev.count,
    topIssues: sev.issues.slice(0, 10)
  }));
}

async function getAIPagesData(projectId, limit = 100) {
  const db = mongoose.connection.db;
  const projectIdObj = new ObjectId(projectId);

  const [pages, issuesByPage] = await Promise.all([
    db.collection('seo_ai_visibility').find(
      { projectId: projectIdObj },
      {
        projection: {
          url: 1,
          overall_page_score: 1,
          blocking: 1,
          completeness: 1,
          clarity: 1,
          structured_data_score: 1,
          parsed_entities: 1,
          entity_graph: 1,
          analyzed_at: 1
        }
      }
    ).limit(limit).toArray(),
    db.collection('seo_ai_visibility_issues').aggregate([
      { $match: { projectId: projectIdObj } },
      {
        $group: {
          _id: '$page_url',
          issueCount: { $sum: 1 },
          highestSeverity: {
            $max: {
              $switch: {
                branches: [
                  { case: { $eq: ['$severity', 'high'] }, then: 3 },
                  { case: { $eq: ['$severity', 'medium'] }, then: 2 },
                  { case: { $eq: ['$severity', 'low'] }, then: 1 }
                ],
                default: 0
              }
            }
          }
        }
      }
    ]).toArray()
  ]);

  const issuesLookup = new Map();
  issuesByPage.forEach(item => {
    issuesLookup.set(item._id, {
      count: item.issueCount,
      severity: item.highestSeverity === 3 ? 'high' : item.highestSeverity === 2 ? 'medium' : 'low'
    });
  });

  return pages.map(page => {
    const pageIssues = issuesLookup.get(page.url) || { count: 0, severity: 'none' };
    const entities = page.parsed_entities || [];
    const entityTypes = [...new Set(entities.map(e => e['@type'] || 'Unknown'))];

    return {
      url: page.url,
      aiScore: Math.round(page.overall_page_score) || 0,
      issueCount: pageIssues.count,
      highestSeverity: pageIssues.severity,
      blocking: Math.round(page.blocking) || 0,
      completeness: Math.round(page.completeness) || 0,
      clarity: Math.round(page.clarity) || 0,
      structuredDataScore: Math.round(page.structured_data_score) || 0,
      entityCount: entities.length,
      entityTypes: entityTypes.slice(0, 5),
      hasEntityGraph: !!page.entity_graph,
      analyzedAt: page.analyzed_at
    };
  });
}

async function getEntityGraphSummary(projectId) {
  const db = mongoose.connection.db;
  const projectIdObj = new ObjectId(projectId);

  const entityStats = await db.collection('seo_ai_visibility').aggregate([
    { $match: { projectId: projectIdObj } },
    { $unwind: '$parsed_entities' },
    {
      $group: {
        _id: '$parsed_entities.@type',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$parsed_entities.confidence_score' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]).toArray();

  const totalEntities = entityStats.reduce((sum, e) => sum + e.count, 0);
  const typeCount = entityStats.length;

  return {
    totalEntities,
    typeCount,
    topTypes: entityStats.map(e => ({
      type: e._id || 'Unknown',
      count: e.count,
      percent: totalEntities > 0 ? Math.round((e.count / totalEntities) * 100) : 0,
      avgConfidence: Math.round((e.avgConfidence || 0) * 100) / 100
    }))
  };
}

async function getStructuredDataBlocksSummary(projectId) {
  const db = mongoose.connection.db;
  const projectIdObj = new ObjectId(projectId);

  const blockStats = await db.collection('seo_ai_visibility').aggregate([
    { $match: { projectId: projectIdObj } },
    {
      $group: {
        _id: null,
        totalBlocks: { $sum: { $size: { $ifNull: ['$json_ld_blocks', []] } } },
        totalGraphs: { $sum: { $cond: [{ $ne: ['$entity_graph', null] }, 1, 0] } },
        pagesWithBlocks: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$json_ld_blocks', []] } }, 0] }, 1, 0] } },
        pagesWithGraphs: { $sum: { $cond: [{ $ne: ['$entity_graph', null] }, 1, 0] } }
      }
    }
  ]).toArray();

  const stats = blockStats[0] || {};
  return {
    totalBlocks: stats.totalBlocks || 0,
    totalGraphs: stats.totalGraphs || 0,
    pagesWithBlocks: stats.pagesWithBlocks || 0,
    pagesWithGraphs: stats.pagesWithGraphs || 0
  };
}

export async function getAIExportData(projectId, userId) {
  const startTime = Date.now();

  try {
    console.log(`[EXPORT] === AI EXPORT STARTED ===`);
    console.log(`[EXPORT] Project ID: ${projectId}`);
    console.log(`[EXPORT] User ID: ${userId}`);

    const db = mongoose.connection.db;
    const projectIdObj = new ObjectId(projectId);

    console.log(`[EXPORT] Step 1: Fetch raw data collections...`);
    
    // Fetch all raw data collections directly
    const [project, aiPages, pageScores, aiIssues] = await Promise.all([
      db.collection('seoprojects').findOne({ _id: projectIdObj }),
      db.collection('seo_ai_visibility').find({ projectId: projectIdObj }).toArray(),
      db.collection('seo_ai_page_scores').find({ projectId: projectIdObj }).toArray(),
      db.collection('seo_ai_visibility_issues').find({ projectId: projectIdObj }).toArray()
    ]);

    console.log(`[EXPORT] Step 1 Complete: Found ${aiPages.length} pages, ${pageScores.length} scores, ${aiIssues.length} issues`);

    console.log(`[EXPORT] Step 2: Build normalized lookup maps...`);
    
    // Build normalized lookup maps for robust URL matching
    const scoreMap = new Map();
    const issuesMap = new Map();

    // Build score map with normalized URLs
    pageScores.forEach(score => {
      const normalized = normalizeUrlForMatching(score.page_url);
      scoreMap.set(normalized, score);
    });

    // Build issues map with normalized URLs
    aiIssues.forEach(issue => {
      const normalized = normalizeUrlForMatching(issue.page_url);
      if (!issuesMap.has(normalized)) {
        issuesMap.set(normalized, []);
      }
      issuesMap.get(normalized).push(issue);
    });

    console.log(`[EXPORT] Step 2 Complete: Built score map (${scoreMap.size} entries) and issues map (${issuesMap.size} entries)`);
    
    console.log(`[EXPORT] Step 3: Process pages with normalized matching...`);
    
    // Process pages with proper URL normalization
    const processedPages = aiPages.map(page => {
      const normalizedUrl = normalizeUrlForMatching(page.url);
      
      // Get score data using normalized URL
      const scoreData = scoreMap.get(normalizedUrl) || {};
      const pageIssues = issuesMap.get(normalizedUrl) || [];
      
      // Count severity per page
      const highCount = pageIssues.filter(i => i.severity === 'high').length;
      const mediumCount = pageIssues.filter(i => i.severity === 'medium').length;
      const lowCount = pageIssues.filter(i => i.severity === 'low').length;
      
      // Get AI score from page scores collection
      const aiScore = scoreData.websiteScore || 0;
      
      return {
        url: page.url,
        urlTruncated: truncateUrl(page.url),
        aiScore: Math.round(aiScore),
        highCount: highCount,
        mediumCount: mediumCount,
        lowCount: lowCount,
        entityCount: page.parsed_entities ? page.parsed_entities.length : 0,
        scoreClass: getScoreClass(aiScore)
      };
    });

    console.log(`[EXPORT] Step 3 Complete: Processed ${processedPages.length} pages with normalized matching`);
    
    console.log(`[EXPORT] Step 4: Calculate overview statistics...`);
    
    // Calculate overview statistics from processed data
    const totalIssues = processedPages.reduce((sum, page) => sum + page.highCount + page.mediumCount + page.lowCount, 0);
    const highIssues = processedPages.reduce((sum, page) => sum + page.highCount, 0);
    const mediumIssues = processedPages.reduce((sum, page) => sum + page.mediumCount, 0);
    const lowIssues = processedPages.reduce((sum, page) => sum + page.lowCount, 0);
    
    const scores = processedPages.map(p => p.aiScore);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;
    
    // Calculate grade
    let grade = 'F';
    if (avgScore >= 90) grade = 'A';
    else if (avgScore >= 80) grade = 'B';
    else if (avgScore >= 70) grade = 'C';
    else if (avgScore >= 60) grade = 'D';

    console.log(`[EXPORT] Step 4 Complete: Overview calculated - Score: ${avgScore}, Grade: ${grade}, Issues: ${totalIssues}`);
    
    console.log(`[EXPORT] Step 5: Build entity graph summary...`);
    
    // Build entity graph summary
    const entityTypes = new Map();
    processedPages.forEach(page => {
      if (page.entityCount > 0) {
        // Count entities from parsed_entities if available
        const entities = aiPages.find(p => p.url === page.url)?.parsed_entities || [];
        entities.forEach(entity => {
          if (entity && entity['@type']) {
            const type = Array.isArray(entity['@type']) ? entity['@type'][0] : entity['@type'];
            entityTypes.set(type, (entityTypes.get(type) || 0) + 1);
          }
        });
      }
    });

    const entityGraph = {
      totalEntities: Array.from(entityTypes.values()).reduce((a, b) => a + b, 0),
      topTypes: Array.from(entityTypes.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    };

    console.log(`[EXPORT] Step 5 Complete: Entity graph built - ${entityGraph.totalEntities} total entities`);
    
    console.log(`[EXPORT] Step 6: Build final export data...`);
    
    // Build final export data
    const data = {
      project: {
        project_name: project?.project_name || 'Unknown Project',
        main_url: project?.main_url || 'Unknown URL'
      },
      overview: {
        aiStatus: 'completed',
        aiScore: avgScore,
        aiGrade: grade,
        totalPages: processedPages.length,
        minScore: minScore,
        maxScore: maxScore,
        totalIssues: totalIssues,
        highIssues: highIssues,
        mediumIssues: mediumIssues,
        lowIssues: lowIssues,
        pagesScored: processedPages.length
      },
      scores: {
        websiteScore: avgScore,
        websiteGrade: grade,
        scoreClass: getScoreClass(avgScore),
        avgBlocking: 0, // Will be calculated if needed
        avgCompleteness: 0,
        avgClarity: 0,
        avgStructuredData: 0
      },
      issues: {
        byCategory: [], // Will be populated if needed
        bySeverity: [], // Will be populated if needed
        highPriorityIssues: [] // Will be populated if needed
      },
      pages: processedPages,
      entities: {
        ...entityGraph,
        avgEntitiesPerPage: processedPages.length > 0 ? Math.round(entityGraph.totalEntities / processedPages.length * 10) / 10 : 0,
        topTypes: entityGraph.topTypes.map(entity => ({
          ...entity,
          percentWidth: entityGraph.topTypes.length > 0 ? Math.round((entity.count / entityGraph.topTypes[0].count) * 100) : 0
        }))
      },
      structuredData: {
        totalBlocks: 0,
        totalGraphs: 0,
        pagesWithBlocks: 0,
        pagesWithGraphs: 0
      },
      summary: {
        paragraph: `This project scored ${avgScore} (Grade ${grade}). ${highIssues} high-priority AI schema issues were detected across ${processedPages.length} pages, primarily affecting structured data architecture and entity consistency.`
      }
    };
    
    console.log(`[EXPORT] Step 6 Complete: Export data built successfully`);

    const gatherTime = Date.now() - startTime;
    console.log(`[EXPORT] AI data gathered in ${gatherTime}ms`);
    console.log(`[EXPORT] === AI EXPORT SUCCESS ===`);

    return {
      success: true,
      data,
      gatherTimeMs: gatherTime
    };

  } catch (error) {
    console.error(`[EXPORT] === AI EXPORT FAILED ===`);
    console.error(`[EXPORT] Error: ${error.message}`);
    console.error(`[EXPORT] Stack: ${error.stack}`);
    return {
      success: false,
      error: error.message,
      gatherTimeMs: Date.now() - startTime
    };
  }
}

export async function validateAIAccess(projectId, userId) {
  const db = mongoose.connection.db;
  const projectIdObj = new ObjectId(projectId);

  const project = await db.collection('seoprojects').findOne({
    _id: projectIdObj,
    user_id: new ObjectId(userId)
  });

  return {
    valid: !!project,
    project: project || null
  };
}

async function getPage19Data(projectId) {
  const db = mongoose.connection.db;
  const projectIdObj = new ObjectId(projectId);
  
  // Fetch project from seoprojects collection
  const project = await db.collection('seoprojects')
    .findOne({ _id: projectIdObj });
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  // Extract AI visibility data with fallbacks
  const aiVisibility = project.ai_visibility || {};
  const categories = aiVisibility.categories || {};
  
  // Map fields according to requirements
  const aiReadiness = Math.round(categories.llm_readiness || 0);
  const geoScore = Math.round(categories.ai_impact || 0);
  const aeoScore = Math.round(categories.aeo_score || 0);
  const aiSeoScore = Math.round(aiVisibility.score || 0);
  const aiCitation = Math.round(categories.citation_probability || 0);
  const aiTopicalAuthority = Math.round(categories.topical_authority || 0);
  
  // Generate summary based on scores
  const avgScore = (aiReadiness + geoScore + aeoScore) / 3;
  let summary = '';
  
  if (avgScore >= 80) {
    summary = 'Excellent AI visibility. Your brand is well-positioned for AI-powered search and conversational queries.';
  } else if (avgScore >= 60) {
    summary = 'Good AI visibility with room for improvement. Focus on enhancing structured data and entity optimization.';
  } else if (avgScore >= 40) {
    summary = 'Moderate AI visibility. Your brand has limited presence in AI-generated search results.';
  } else {
    summary = 'Low AI visibility. Significant optimization needed for AI search readiness and entity recognition.';
  }
  
  return {
    aiReadiness,
    geoScore,
    aeoScore,
    aiSeoScore,
    aiCitation,
    aiTopicalAuthority,
    summary,
    overallScore: Math.round((aiReadiness + geoScore + aeoScore + aiSeoScore) / 4)
  };
}

export default {
  getAIExportData,
  validateAIAccess,
  getPage19Data
};
