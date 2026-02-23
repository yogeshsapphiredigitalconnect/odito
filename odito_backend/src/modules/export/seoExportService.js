import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

// URL normalizer for robust matching across collections (same as AI export)
function normalizeUrlForMatching(url) {
  if (!url) return '';

  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')   // remove http/https
    .replace(/^www\./, '')         // remove www
    .replace(/\/$/, '');           // remove trailing slash
}

// Score class calculator for SEO scores
function getSEOScoreClass(score) {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'average';
  if (score >= 60) return 'poor';
  return 'critical';
}

// URL truncator for display
function truncateUrl(url, maxLength = 45) {
  if (!url) return '';
  return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
}

// Grade calculator for SEO scores
function getSEOGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// Issue Impact Summary aggregation
async function getIssueImpactSummary(projectIdObj) {
  const db = mongoose.connection.db;
  
  const ISSUE_LABELS = {
    META_DESC_TOO_SHORT: "Meta Description Too Short",
    META_DESC_MISSING: "Missing Meta Description",
    IMAGES_MISSING_ALT: "Images Missing Alt Text",
    TITLE_MISSING: "Missing Title Tag",
    MULTIPLE_H1: "Multiple H1 Tags",
    H1_MISSING: "Missing H1 Tag",
    CONTENT_TOO_SHORT: "Thin Content",
    INTERNAL_LINKS_NONE: "No Internal Links",
    EXTERNAL_LINKS_NONE: "No External Links",
    SOCIAL_TAGS_MISSING: "Missing Social Tags",
    CANONICAL_MISSING: "Missing Canonical Tag",
    STRUCTURED_DATA_MISSING: "Missing Structured Data",
    PAGE_SPEED_SLOW: "Slow Page Speed",
    MOBILE_FRIENDLY_ISSUES: "Mobile Compatibility Issues",
    BROKEN_LINKS: "Broken Internal Links"
  };
  
  try {
    const impact = await db.collection('seo_page_issues').aggregate([
      { $match: { projectId: projectIdObj } },
      {
        $group: {
          _id: {
            issue_code: "$issue_code",
            category: "$category"
          },
          affectedPages: { $addToSet: "$page_url" }
        }
      },
      {
        $project: {
          issue_code: "$_id.issue_code",
          category: "$_id.category",
          pageCount: { $size: "$affectedPages" }
        }
      },
      { $sort: { pageCount: -1 } },
      { $limit: 15 }
    ]).toArray();
    
    const impactSummary = impact.map(i => ({
      label: ISSUE_LABELS[i.issue_code] || i.issue_code.replace(/_/g, ' '),
      category: i.category,
      pageCount: i.pageCount
    }));
    
    console.log(`[SEO EXPORT] Issue Impact Summary: Found ${impactSummary.length} issue types affecting pages`);
    return impactSummary;
    
  } catch (error) {
    console.error('[SEO EXPORT] Error getting issue impact summary:', error.message);
    return [];
  }
}

export async function getSEOExportData(projectId, userId) {
  const startTime = Date.now();

  try {
    console.log(`[SEO EXPORT] === SEO EXPORT STARTED ===`);
    console.log(`[SEO EXPORT] Project ID: ${projectId}`);
    console.log(`[SEO EXPORT] User ID: ${userId}`);

    const db = mongoose.connection.db;
    const projectIdObj = new ObjectId(projectId);

    console.log(`[SEO EXPORT] Step 1: Fetch raw SEO data collections...`);
    
    // Fetch raw data from all collections
    const project = await db.collection('seoprojects')
      .findOne({ _id: projectIdObj });

    const pageData = await db.collection('seo_page_data')
      .find({ projectId: projectIdObj })
      .toArray();

    const pageScores = await db.collection('seo_page_scores')
      .find({ projectId: projectIdObj })
      .toArray();

    const pageIssues = await db.collection('seo_page_issues')
      .find({ projectId: projectIdObj })
      .toArray();

    const internalLinks = await db.collection('seo_internal_links')
      .find({ projectId: projectIdObj })
      .toArray();

    const externalLinks = await db.collection('seo_external_links')
      .find({ projectId: projectIdObj })
      .toArray();

    const socialLinks = await db.collection('seo_social_links')
      .find({ projectId: projectIdObj })
      .toArray();

    const performance = await db.collection('seo_page_performance')
      .find({ projectId: projectIdObj })
      .toArray();

    // Debug logs
    console.log('SEO EXPORT DEBUG:');
    console.log('pageData:', pageData.length);
    console.log('pageScores:', pageScores.length);
    console.log('pageIssues:', pageIssues.length);
    console.log('internalLinks:', internalLinks.length);
    console.log('externalLinks:', externalLinks.length);
    console.log('socialLinks:', socialLinks.length);

    console.log(`[SEO EXPORT] Step 2: Build normalized lookup maps...`);
    
    // Build lookup maps
    const scoreMap = new Map();
    pageScores.forEach(score => {
      const normalized = normalizeUrlForMatching(score.page_url);
      scoreMap.set(normalized, score);
    });

    const issuesMap = new Map();
    pageIssues.forEach(issue => {
      const normalized = normalizeUrlForMatching(issue.page_url);
      if (!issuesMap.has(normalized)) {
        issuesMap.set(normalized, []);
      }
      issuesMap.get(normalized).push(issue);
    });
    
    console.log(`[SEO EXPORT] Step 3: Process pages with normalized matching...`);
    
    // Build page-level data properly
    const pages = pageData.map(page => {
      const normalized = normalizeUrlForMatching(page.url);
      
      const scoreData = scoreMap.get(normalized) || {};
      const issues = issuesMap.get(normalized) || [];
      
      const highCount = issues.filter(i => i.severity === 'high').length;
      const mediumCount = issues.filter(i => i.severity === 'medium').length;
      const lowCount = issues.filter(i => i.severity === 'low').length;
      
      return {
        url: page.url,
        urlTruncated: truncateUrl(page.url),
        seoScore: scoreData.page_score || 0,
        grade: scoreData.page_grade || 'N/A',
        highCount,
        mediumCount,
        lowCount,
        wordCount: page.content?.word_count || 0
      };
    });
    
    console.log(`[SEO EXPORT] Step 4: Calculate overview statistics...`);
    
    // Get Issue Impact Summary
    const impactSummary = await getIssueImpactSummary(projectIdObj);
    
    // Aggregate totals
    const totalPages = pageData.length;
    const totalIssues = pageIssues.length;
    
    const highIssues = pageIssues.filter(i => i.severity === 'high').length;
    const mediumIssues = pageIssues.filter(i => i.severity === 'medium').length;
    const lowIssues = pageIssues.filter(i => i.severity === 'low').length;
    
    // Compute percentages
    const highPercent = totalIssues > 0 ? Math.round((highIssues / totalIssues) * 100) : 0;
    const mediumPercent = totalIssues > 0 ? Math.round((mediumIssues / totalIssues) * 100) : 0;
    const lowPercent = totalIssues > 0 ? Math.round((lowIssues / totalIssues) * 100) : 0;
    
    const websiteScore = project.website_score || 0;
    const websiteGrade = project.website_grade || 'F';
    const scorePercent = Math.round(websiteScore);
    
    // Calculate score distribution with percentages
    const scoreCounts = {
      excellent: pages.filter(p => p.seoScore >= 90).length,
      good: pages.filter(p => p.seoScore >= 80 && p.seoScore < 90).length,
      average: pages.filter(p => p.seoScore >= 70 && p.seoScore < 80).length,
      poor: pages.filter(p => p.seoScore >= 60 && p.seoScore < 70).length,
      critical: pages.filter(p => p.seoScore < 60).length
    };
    
    const scoreDistribution = totalPages > 0 ? {
      excellent: Math.round((scoreCounts.excellent / totalPages) * 100),
      good: Math.round((scoreCounts.good / totalPages) * 100),
      average: Math.round((scoreCounts.average / totalPages) * 100),
      poor: Math.round((scoreCounts.poor / totalPages) * 100),
      critical: Math.round((scoreCounts.critical / totalPages) * 100)
    } : { excellent: 0, good: 0, average: 0, poor: 0, critical: 0 };
    
    // Return final export JSON
    const data = {
      project,
      overview: {
        totalPages,
        totalIssues,
        highIssues,
        mediumIssues,
        lowIssues,
        highPercent,
        mediumPercent,
        lowPercent,
        websiteScore,
        websiteGrade,
        scorePercent
      },
      scores: {
        websiteScore,
        websiteGrade,
        pageCount: totalPages,
        scoreDistribution,
        scoreCounts
      },
      issues: {
        highIssues,
        mediumIssues,
        lowIssues,
        totalIssues
      },
      pages,
      links: {
        internal: internalLinks,
        external: externalLinks,
        social: socialLinks
      },
      performance,
      impactSummary
    };

    const gatherTime = Date.now() - startTime;
    console.log(`[SEO EXPORT] SEO data gathered in ${gatherTime}ms`);
    console.log(`[SEO EXPORT] === SEO EXPORT SUCCESS ===`);

    return {
      success: true,
      data,
      gatherTimeMs: gatherTime
    };

  } catch (error) {
    console.error(`[SEO EXPORT] === SEO EXPORT FAILED ===`);
    console.error(`[SEO EXPORT] Error: ${error.message}`);
    console.error(`[SEO EXPORT] Stack: ${error.stack}`);
    return {
      success: false,
      error: error.message,
      gatherTimeMs: Date.now() - startTime
    };
  }
}

export async function validateProjectAccess(projectId, userId) {
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

export default {
  getSEOExportData,
  validateProjectAccess
};
