import SeoProject from '../model/SeoProject.js';
import GoogleConnection from '../model/GoogleConnection.js';
import mongoose from 'mongoose';



// Get project links data

export const getProjectLinks = async (req, res) => {

  try {

    const { id: projectId } = req.params;

    const { page = 1, limit = 50, link_type, search } = req.query;

    const skip = (page - 1) * limit;



    console.log('🔗 Links API called with:', { projectId, page, limit, link_type, search });



    // Verify project belongs to user

    const project = await SeoProject.findById(projectId);

    if (!project) {

      console.log('❌ Project not found:', projectId);

      return res.status(404).json({

        success: false,

        message: 'Project not found'

      });

    }



    console.log('✅ Project found:', project.project_name);



    // Check if user owns this project

    if (project.user_id.toString() !== req.user._id.toString()) {

      console.log('❌ Access denied for user:', req.user._id);

      return res.status(403).json({

        success: false,

        message: 'Access denied'

      });

    }



    const db = mongoose.connection.db;

    const { ObjectId } = mongoose.Types;

    const projectIdObj = new ObjectId(projectId);



    // Get links from all three collections

    let allLinks = [];



    // Get internal links

    if (!link_type || link_type === 'internal') {

      const internalQuery = { projectId: projectIdObj };

      if (search) {

        internalQuery.$or = [

          { sourceUrl: { $regex: search, $options: 'i' } },

          { url: { $regex: search, $options: 'i' } }

        ];

      }

      const internalLinks = await db.collection('seo_internal_links')

        .find(internalQuery)

        .sort({ discoveredAt: -1 })

        .toArray();  // Remove pagination here



      allLinks.push(...internalLinks.map(link => ({ ...link, linkType: 'internal' })));

    }



    // Get external links

    if (!link_type || link_type === 'external') {

      const externalQuery = { projectId: projectIdObj };

      if (search) {

        externalQuery.$or = [

          { sourceUrl: { $regex: search, $options: 'i' } },

          { url: { $regex: search, $options: 'i' } }

        ];

      }

      const externalLinks = await db.collection('seo_external_links')

        .find(externalQuery)

        .sort({ discoveredAt: -1 })

        .toArray();  // Remove pagination here



      allLinks.push(...externalLinks.map(link => ({ ...link, linkType: 'external' })));

    }



    // Get social links

    if (!link_type || link_type === 'social') {

      const socialQuery = { projectId: projectIdObj };

      if (search) {

        socialQuery.$or = [

          { sourceUrl: { $regex: search, $options: 'i' } },

          { platform: { $regex: search, $options: 'i' } }

        ];

      }

      const socialLinks = await db.collection('seo_social_links')

        .find(socialQuery)

        .sort({ discoveredAt: -1 })

        .toArray();  // Remove pagination here



      allLinks.push(...socialLinks.map(link => ({ ...link, linkType: 'social' })));

    }



    console.log('� Found links for current page:', allLinks.length);



    // Get total counts for summary

    const internalCount = await db.collection('seo_internal_links').countDocuments({ projectId: projectIdObj });

    const externalCount = await db.collection('seo_external_links').countDocuments({ projectId: projectIdObj });

    const socialCount = await db.collection('seo_social_links').countDocuments({ projectId: projectIdObj });



    const summary = {

      internal_links: internalCount,

      external_links: externalCount,

      social_links: socialCount,

      total: internalCount + externalCount + socialCount

    };



    console.log('📊 Summary counts:', summary);



    // Group by platform for social links

    const platformSummary = await db.collection('seo_social_links').aggregate([

      { $match: { projectId: projectIdObj } },

      { $group: { _id: '$platform', count: { $sum: 1 } } },

      { $sort: { count: -1 } }

    ]).toArray();



    console.log('📱 Platform summary:', platformSummary);



    // Sort all links by discoveredAt

    allLinks.sort((a, b) => new Date(b.discoveredAt) - new Date(a.discoveredAt));



    // Apply pagination AFTER combining all links

    const paginatedLinks = allLinks.slice(skip, skip + parseInt(limit));



    // Calculate pagination values

    const totalLinks = allLinks.length;

    const totalPages = Math.ceil(totalLinks / limit);

    const currentPage = parseInt(page);

    const hasNext = currentPage < totalPages;

    const hasPrev = currentPage > 1;



    console.log('📊 Pagination info:', {

      totalLinks,

      currentPage,

      totalPages,

      limit: parseInt(limit),

      skip,

      hasNext,

      hasPrev

    });



    // Format response data

    const formattedLinks = paginatedLinks.map(link => ({

      _id: link._id,

      sourceUrl: link.sourceUrl,

      targetUrl: link.url || link.targetUrl,

      linkType: link.linkType,

      platform: link.platform,

      discoveredAt: link.discoveredAt,

      seo_jobId: link.seo_jobId

    }));



    res.json({

      success: true,

      data: {

        links: formattedLinks,

        pagination: {

          currentPage,

          totalPages,

          totalLinks,

          hasNext,

          hasPrev

        },

        summary,

        platformSummary

      }

    });





  } catch (error) {

    console.error('Error getting project links:', error);

    res.status(500).json({

      success: false,

      message: 'Failed to get project links',

      error: error.message

    });

  }

};



// Get project pages data

export const getProjectPages = async (req, res) => {

  try {

    const { id: projectId } = req.params;

    const { page = 1, limit = 50, status, search, sortBy, sortOrder, filter } = req.query;

    const skip = (page - 1) * limit;



    console.log('📄 getProjectPages called with:', { projectId, page, limit, status, search, sortBy, sortOrder, filter });



    // Verify project belongs to user

    const project = await SeoProject.findById(projectId);

    if (!project) {

      console.log('❌ Project not found:', projectId);

      return res.status(404).json({

        success: false,

        message: 'Project not found'

      });

    }



    if (project.user_id.toString() !== req.user._id.toString()) {

      console.log('❌ Access denied for user:', req.user._id);

      return res.status(403).json({

        success: false,

        message: 'Access denied'

      });

    }



    const db = mongoose.connection.db;

    const { ObjectId } = mongoose.Types;

    const projectIdObj = new ObjectId(projectId);



    // Build query for seo_page_data collection

    const query = { projectId: projectIdObj };



    // Add search filter

    if (search) {

      query.$or = [

        { url: { $regex: search, $options: 'i' } },

        { title: { $regex: search, $options: 'i' } }

      ];

    }



    // Add status filter

    if (status) {

      query.scrape_status = status;

    }



    // Add indexability filter

    if (filter === 'indexable') {

      query['meta_tags.robots'] = { $not: /noindex/ };

    } else if (filter === 'not-indexable') {

      query['meta_tags.robots'] = /noindex/;

    }



    console.log('🔍 Pages query:', query);

    console.log('🆔 Project ID:', projectIdObj);



    // Get pages from seo_page_data collection

    const pagesCollection = db.collection('seo_page_data');



    // Test: Get all pages for this project without filters first

    const allPages = await pagesCollection.find({ projectId: projectIdObj }).toArray();

    console.log('📄 All pages count (no filters):', allPages.length);



    // Get total count

    const totalPagesCount = await pagesCollection.countDocuments(query);

    console.log('📊 Filtered pages count:', totalPagesCount);



    // Build sort query

    const sortQuery = {};

    if (sortBy) {

      const sortField = sortBy === 'page_score' ? 'http_status_code' : sortBy;

      sortQuery[sortField] = sortOrder === 'asc' ? 1 : -1;

    } else {

      sortQuery.scraped_at = -1; // Default sort by most recent

    }



    // Get paginated pages

    const pages = await pagesCollection

      .find(query)

      .sort(sortQuery)

      .skip(skip)

      .limit(parseInt(limit))

      .toArray();



    console.log('📊 Found pages:', { total: totalPagesCount, page: pages.length });



    // Get issues count for each page

    const pageUrls = pages.map(p => p.url);

    const issuesByPage = await db.collection('seo_page_issues').aggregate([

      { $match: { projectId: projectIdObj, page_url: { $in: pageUrls } } },

      {

        $group: {

          _id: '$page_url',

          issueCount: { $sum: 1 }

        }

      }

    ]).toArray();



    // Create issues count lookup

    const issuesLookup = {};

    issuesByPage.forEach(item => {

      issuesLookup[item._id] = item.issueCount;

    });



    // Get real scores from seo_page_scores collection
    const pageScores = await db.collection('seo_page_scores')
      .find({ projectId: projectIdObj })
      .toArray();

    // Create lookup for O(1) access
    const scoreLookup = Object.fromEntries(
      pageScores.map(s => [s.page_url, s.page_score])
    );

    console.log('📊 Real scores loaded:', { count: pageScores.length, sample: Object.entries(scoreLookup).slice(0, 3) });

    // Format pages for frontend
    const formattedPages = pages.map(page => {
      // Use real score from seo_page_scores, fallback to 0
      const realPageScore = scoreLookup[page.url] ?? 0;


      // Get issue count (kept for display)
      const issueCount = issuesLookup[page.url] || 0;

      // Check if page is indexable

      const robotsTag = page.meta_tags?.robots?.[0] || '';

      const isIndexable = !robotsTag.includes('noindex');



      return {

        id: page._id.toString(),

        url: page.url,

        page_score: realPageScore,

        issues_count: issueCount,

        crawl_depth: 1, // Default depth - could be calculated from internal links

        incoming_links: 0, // Could be calculated from internal_links collection

        outgoing_links: 0, // Could be calculated from page analysis

        external_links: 0, // Could be calculated from page analysis

        backlinks: 0, // Not available in current schema

        rankings: 0, // Not available in current schema

        page_title: page.title || 'No title',

        is_indexable: isIndexable,

        is_premium: false, // Could be based on user subscription

        http_status_code: page.http_status_code,

        response_time_ms: page.response_time_ms ? Math.round(page.response_time_ms / 1000000) : 0, // Convert ns to ms

        scraped_at: page.scraped_at,

        scrape_status: page.scrape_status,

        extraction_status: page.extraction_status

      };

    });



    // Calculate pagination

    const totalPages = Math.ceil(totalPagesCount / limit);

    const currentPage = parseInt(page);

    const hasNext = currentPage < totalPages;

    const hasPrev = currentPage > 1;



    // Get summary statistics - match overview dashboard counts
    const projectData = await SeoProject.findById(projectId);

    // Count indexable pages (pages without noindex tag)
    const indexablePages = await pagesCollection.countDocuments({
      projectId: projectIdObj,
      'meta_tags.robots': { $not: /noindex/ }
    });

    console.log('📊 Page counts:', {
      total: totalPagesCount,
      indexable: indexablePages,
      crawled: projectData?.pages_crawled,
      analyzed: projectData?.pages_analyzed
    });

    const summary = {
      totalPages: totalPagesCount,
      scrapedPages: await pagesCollection.countDocuments({
        projectId: projectIdObj,
        scrape_status: 'completed'
      }),
      failedPages: await pagesCollection.countDocuments({
        projectId: projectIdObj,
        scrape_status: 'failed'
      }),

      totalWords: await pagesCollection.aggregate([

        { $match: { projectId: projectIdObj } },

        { $group: { _id: null, totalWords: { $sum: '$content.word_count' } } }

      ]).toArray().then(result => result[0]?.totalWords || 0),

      avgWordCount: 0 // Will be calculated below

    };



    summary.avgWordCount = summary.totalPages > 0 ? Math.round(summary.totalWords / summary.totalPages) : 0;



    console.log('📊 Pagination info:', {

      totalPagesCount,

      currentPage,

      totalPages,

      limit: parseInt(limit),

      skip,

      hasNext,

      hasPrev

    });



    res.status(200).json({

      success: true,

      data: {

        subpages: formattedPages,

        crawled_pages: projectData?.pages_crawled || summary.scrapedPages,
        found_pages: projectData?.pages_analyzed || summary.scrapedPages,
        analyzed_pages: projectData?.pages_analyzed || summary.scrapedPages,

        pagination: {

          currentPage,

          totalPages,

          totalItems: totalPagesCount,

          hasNext,

          hasPrev

        },

        summary,

        debug: {

          allPagesCount: allPages.length,

          filteredPagesCount: totalPagesCount,

          projectId: projectId.toString(),

          query: query

        }

      }

    });



  } catch (error) {

    console.error('Error getting project pages:', error);

    res.status(500).json({

      success: false,

      message: 'Failed to get project pages',

      error: error.message

    });

  }

};



// Get project performance data

export const getProjectPerformance = async (req, res) => {

  try {

    const { id: projectId } = req.params;



    // Verify project belongs to user

    const project = await SeoProject.findById(projectId);

    if (!project) {

      return res.status(404).json({

        success: false,

        message: 'Project not found'

      });

    }



    if (project.user_id.toString() !== req.user._id.toString()) {

      return res.status(403).json({

        success: false,

        message: 'Access denied'

      });

    }



    // Phase-1: No performance reports yet, only link discovery

    res.status(200).json({

      success: true,

      data: {

        mobile: null,

        desktop: null,

        summary: {

          mobileScore: 0,

          desktopScore: 0,

          avgPerformance: 0

        },

        message: "Performance testing not implemented in Phase-1. Use link discovery APIs instead."

      }

    });



  } catch (error) {

    console.error('Error getting project performance:', error);

    res.status(500).json({

      success: false,

      message: 'Failed to get project performance',

      error: error.message

    });

  }

};



// Get project summary for dashboard

export const getProjectSummary = async (req, res) => {

  try {

    const { id: projectId } = req.params;



    // Verify project belongs to user

    const project = await SeoProject.findById(projectId);

    if (!project) {

      return res.status(404).json({

        success: false,

        message: 'Project not found'

      });

    }



    if (project.user_id.toString() !== req.user._id.toString()) {

      return res.status(403).json({

        success: false,

        message: 'Access denied'

      });

    }



    const db = mongoose.connection.db;

    const { ObjectId } = mongoose.Types;



    // Get link counts directly from MongoDB collections

    const internalLinksCount = await db.collection('seo_internal_links').countDocuments({

      projectId: new ObjectId(projectId)

    });



    const externalLinksCount = await db.collection('seo_external_links').countDocuments({

      projectId: new ObjectId(projectId)

    });



    const socialLinksCount = await db.collection('seo_social_links').countDocuments({

      projectId: new ObjectId(projectId)

    });



    const summaryData = {

      internalLinks: internalLinksCount,

      externalLinks: externalLinksCount,

      socialLinks: socialLinksCount,

      totalUrlsFound: internalLinksCount + externalLinksCount + socialLinksCount,

      pagesScraped: 0 // Phase-1: No page scraping yet

    };



    res.status(200).json({

      success: true,

      data: summaryData

    });



  } catch (error) {

    console.error('Error getting project summary:', error);

    res.status(500).json({

      success: false,

      message: 'Failed to get project summary',

      error: error.message

    });

  }

};



// Get project issues grouped by page URL

export const getProjectIssuesByPage = async (req, res) => {

  try {

    const { id: projectId } = req.params;



    console.log('📄 Issues by Page API called with:', { projectId });



    // Verify project belongs to user

    const project = await SeoProject.findById(projectId);

    if (!project) {

      console.log('❌ Project not found:', projectId);

      return res.status(404).json({

        success: false,

        message: 'Project not found'

      });

    }



    console.log('✅ Project found:', project.project_name);



    // Check if user owns this project

    if (project.user_id.toString() !== req.user._id.toString()) {

      console.log('❌ Access denied for user:', req.user._id);

      return res.status(403).json({

        success: false,

        message: 'Access denied'

      });

    }



    const db = mongoose.connection.db;

    const { ObjectId } = mongoose.Types;

    const projectIdObj = new ObjectId(projectId);



    // Aggregate issues by page_url

    const issuesByPage = await db.collection('seo_page_issues').aggregate([

      { $match: { projectId: projectIdObj } },

      {

        $group: {

          _id: '$page_url',

          issueCount: { $sum: 1 },

          issues: {

            $push: {

              id: { $toString: '$_id' },

              issue_message: '$issue_message',

              rule_id: '$rule_id',

              severity: '$severity',

              category: '$category',

              issue_code: '$issue_code',

              detected_value: '$detected_value',

              expected_value: '$expected_value',

              created_at: '$created_at'

            }

          }

        }

      },

      {

        $project: {

          page_url: '$_id',

          issueCount: 1,

          issues: 1,

          _id: 0

        }

      },

      { $sort: { issueCount: -1, page_url: 1 } }

    ]).toArray();



    console.log('📊 Found pages with issues:', issuesByPage.length);



    // Calculate total issues across all pages

    const totalIssues = issuesByPage.reduce((sum, page) => sum + page.issueCount, 0);



    res.status(200).json({

      success: true,

      data: {

        pages: issuesByPage,

        summary: {

          totalPages: issuesByPage.length,

          totalIssues: totalIssues

        }

      }

    });



  } catch (error) {

    console.error('Error getting project issues by page:', error);

    res.status(500).json({

      success: false,

      message: 'Failed to get project issues by page',

      error: error.message

    });

  }

};



// Get issues for a specific page URL

export const getPageIssues = async (req, res) => {

  try {

    const { id: projectId } = req.params;

    const { page_url } = req.query;

    console.log("🔍 getPageIssues called with:", { projectId, page_url });



    const db = mongoose.connection.db;

    const { ObjectId } = mongoose.Types;

    const projectIdObj = new ObjectId(projectId);

    const decodedPageUrl = decodeURIComponent(page_url);



    if (!page_url) {

      return res.status(400).json({

        success: false,

        message: 'page_url parameter is required'

      });

    }

    if (!projectId) {

      return res.status(400).json({

        success: false,

        message: 'projectId parameter is required'

      });

    }



    // Verify project belongs to user (consistent with other functions)
    const project = await SeoProject.findById(projectId);
    
    if (!project) {
      console.log('❌ Project not found:', projectId);
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns this project
    if (project.user_id.toString() !== req.user._id.toString()) {
      console.log('❌ Access denied for user:', req.user._id);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log('✅ Project validated:', project.project_name);

    // Get page score from seo_page_scores collection (same source as subpages table)
    const pageScore = await db.collection('seo_page_scores')
      .findOne({
        projectId: projectIdObj,
        page_url: decodedPageUrl
      });

    const pageScoreValue = pageScore ? pageScore.page_score : 0;

    console.log('📊 Page score found:', { page_url: decodedPageUrl, score: pageScoreValue });

    // Get page data from seo_page_data collection (this contains all the page data we need)
    const pageData = await db.collection('seo_page_data')
      .findOne({
        projectId: projectIdObj,
        url: decodedPageUrl
      });

    // Get screenshot from seo_first_snapshot collection (this contains screenshot metadata)
    const pageScreenshot = await db.collection('seo_first_snapshot')
      .findOne({
        project_id: projectIdObj,   // ✅ FIXED: was projectId
        $or: [
          { url: decodedPageUrl },
          { final_url: decodedPageUrl },
          { canonical_url: decodedPageUrl }
        ]
      });

    console.log("🧪 PAGE SCREENSHOT RAW:", pageScreenshot);

    // Get issues for specific page URL
    const issues = await db.collection('seo_page_issues')
      .find({
        projectId: projectIdObj,
        page_url: decodedPageUrl
      })
      .sort({ created_at: -1 })
      .toArray();



    console.log('📊 Found issues for page:', { page_url: decodedPageUrl, count: issues.length });



    // Format issues for frontend

    const formattedIssues = issues.map(issue => ({

      id: issue._id.toString(),

      issue_message: issue.issue_message,

      rule_id: issue.rule_id,

      severity: issue.severity,

      category: issue.category,

      issue_code: issue.issue_code,

      detected_value: issue.detected_value,

      expected_value: issue.expected_value,

      data_key: issue.data_key,

      data_path: issue.data_path,

      created_at: issue.created_at

    }));



    // Extract page data if available

    const data = pageData ? {

      title: pageData.title,

      meta_description: pageData.meta_tags?.description?.[0] || '',

      word_count: pageData.content?.word_count,

      language: pageData.html_lang,

      size: JSON.stringify(pageData).length, // Approximate size in bytes

      status_code: pageData.http_status_code,

      response_time: pageData.response_time_ms

    } : null;



    // Build page_data_preview translation layer (READ-ONLY mapping)

    const page_data_preview = pageData ? {

      title: pageData.title,

      meta_description: pageData.meta_tags?.description?.[0] || null,

      viewport: pageData.meta_tags?.viewport?.[0] || null,

      robots: pageData.meta_tags?.robots?.[0] || null,

      content_text: pageData.content?.text || null,

      word_count: pageData.content?.word_count || 0,

      headings: pageData.content?.headings || {},

      images: pageData.images || [],

      tracking: pageData.tracking || {},

      structured_data: pageData.structured_data || [],

      og_tags: pageData.social?.open_graph || {},

      twitter_tags: pageData.social?.twitter || {},

      url: pageData.url || null,

      hreflangs: pageData.hreflangs || [],

      doctype: pageData.doctype || null,

      meta_tags: pageData.meta_tags || {}

    } : null;



    // Extract metadata if available

    const metadata = pageData ? {

      url: pageData.url,

      http_status_code: pageData.http_status_code,

      response_time_ms: pageData.response_time_ms,

      crawledAt: pageData.scrapedAt || pageData.scraped_at,

      crawl_status: pageData.scrape_status,

      seo_status: pageData.extraction_status

    } : null;



    const responseData = {
      page_url: decodedPageUrl,
      page_score: pageScoreValue, // Add page score from same source as subpages table
      page_metadata: metadata,
      page_screenshot: pageScreenshot
        ? (() => {
          // Normalize path to ensure browser-valid URL
          const rawPath = pageScreenshot.screenshot_path;
          const normalizedPath = rawPath
            .replace(/\\/g, '/')                 // windows → unix
            .replace(/^(\.\.\/)+/, '')           // remove ../
            .replace(/^.*storage\//, 'storage/'); // force public root

          const screenshotUrl = `${req.protocol}://${req.get('host')}/${normalizedPath}`;
          console.log('🔗 Normalized screenshot URL:', screenshotUrl);

          return {
            screenshot_path: screenshotUrl,
            final_url: pageScreenshot.final_url,
            canonical_url: pageScreenshot.canonical_url,
            scroll_height: pageScreenshot.scroll_height,
            captured_at: pageScreenshot.captured_at
          };
        })()
        : null,
      page_data: data,
      page_data_preview: page_data_preview,
      issues: formattedIssues,
      summary: {
        totalIssues: formattedIssues.length
      }
    };



    res.status(200).json({

      success: true,

      data: responseData

    });



  } catch (error) {

    console.error('Error getting page issues:', error);

    res.status(500).json({

      success: false,

      message: 'Failed to get page issues',

      error: error.message

    });

  }

};



// Get project issues

export const getProjectIssues = async (req, res) => {

  try {

    const { id: projectId } = req.params;

    const { page = 1, limit = 1000, category, severity, search } = req.query;

    const skip = (page - 1) * limit;



    console.log('🚨 Issues API called with:', { projectId, page, limit, category, severity, search });



    // Verify project belongs to user

    const project = await SeoProject.findById(projectId);

    if (!project) {

      console.log('❌ Project not found:', projectId);

      return res.status(404).json({

        success: false,

        message: 'Project not found'

      });

    }



    console.log('✅ Project found:', project.project_name);



    // Check if user owns this project

    if (project.user_id.toString() !== req.user._id.toString()) {

      console.log('❌ Access denied for user:', req.user._id);

      return res.status(403).json({

        success: false,

        message: 'Access denied'

      });

    }



    const db = mongoose.connection.db;

    const { ObjectId } = mongoose.Types;

    const projectIdObj = new ObjectId(projectId);



    // Build query for issues

    const query = { projectId: projectIdObj };



    // Add filters

    if (category) {

      query.category = { $regex: category, $options: 'i' };

    }



    if (severity) {

      query.severity = severity;

    }



    if (search) {

      query.$or = [

        { issue_message: { $regex: search, $options: 'i' } },

        { page_url: { $regex: search, $options: 'i' } },

        { issue_code: { $regex: search, $options: 'i' } }

      ];

    }



    console.log('🔍 Issues query:', query);



    // Get issues from seo_page_issues collection

    const issuesCollection = db.collection('seo_page_issues');



    // Get total count

    const totalIssues = await issuesCollection.countDocuments(query);



    // Get paginated issues

    const issues = await issuesCollection

      .find(query)

      .sort({ created_at: -1 })

      .skip(skip)

      .limit(parseInt(limit))

      .toArray();



    console.log('📊 Found issues:', { total: totalIssues, page: issues.length });



    // Get category and severity summaries

    const categorySummary = await issuesCollection.aggregate([

      { $match: { projectId: projectIdObj } },

      { $group: { _id: '$category', count: { $sum: 1 } } },

      { $sort: { count: -1 } }

    ]).toArray();



    const severitySummary = await issuesCollection.aggregate([

      { $match: { projectId: projectIdObj } },

      { $group: { _id: '$severity', count: { $sum: 1 } } },

      { $sort: { count: -1 } }

    ]).toArray();



    // Format issues for frontend

    const formattedIssues = issues.map(issue => ({

      id: issue._id.toString(),

      type: issue.severity === 'high' ? 'warning' : 'warning', // All issues as warnings for now

      description: issue.issue_message,

      category: issue.category,

      severity: issue.severity,

      rule_no: issue.rule_no,

      issue_code: issue.issue_code,

      page_url: issue.page_url,

      detected_value: issue.detected_value,

      expected_value: issue.expected_value,

      created_at: issue.created_at

    }));



    // Calculate pagination

    const totalPages = Math.ceil(totalIssues / limit);

    const currentPage = parseInt(page);

    const hasNext = currentPage < totalPages;

    const hasPrev = currentPage > 1;



    console.log('📊 Pagination info:', {

      totalIssues,

      currentPage,

      totalPages,

      limit: parseInt(limit),

      skip,

      hasNext,

      hasPrev

    });



    res.status(200).json({

      success: true,

      data: {

        issues: formattedIssues,

        pagination: {

          currentPage,

          totalPages,

          totalIssues,

          hasNext,

          hasPrev

        },

        summary: {

          category: categorySummary,

          severity: severitySummary,

          total: totalIssues

        }

      }

    });



  } catch (error) {

    console.error('Error getting project issues:', error);

    res.status(500).json({

      success: false,

      message: 'Failed to get project issues',

      error: error.message

    });

  }

};

// Google Visibility Status Check
export const getGoogleVisibilityStatus = async (req, res) => {
  try {
    console.log('[GOOGLE_VISIBILITY] Status check function started');

    const { id } = req.params;
    const userId = req.user._id;

    console.log('[GOOGLE_VISIBILITY] Status check | projectId=', id, 'userId=', userId);
    console.log('[GOOGLE_VISIBILITY] Project ID type:', typeof id);
    console.log('[GOOGLE_VISIBILITY] User ID type:', typeof userId);

    // Verify project belongs to user
    console.log('[GOOGLE_VISIBILITY] Searching for project with _id:', id);
    const project = await SeoProject.findById(id);
    console.log('[GOOGLE_VISIBILITY] Found project:', project ? 'YES' : 'NO');

    if (!project) {
      console.log('[GOOGLE_VISIBILITY] Project not found:', id);

      // Let's try to find what projects exist for this user
      const userProjects = await SeoProject.find({ user_id: userId }).select('_id project_name').limit(5);
      console.log('[GOOGLE_VISIBILITY] User projects:', userProjects.map(p => ({ _id: p._id, name: p.project_name })));

      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.user_id.toString() !== userId.toString()) {
      console.log('[GOOGLE_VISIBILITY] Access denied - user does not own project');
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check for active Google connection
    console.log('[GOOGLE_VISIBILITY] Checking for active Google connection...');
    try {
      const connection = await GoogleConnection.findActiveConnection(userId, id);
      console.log('[GOOGLE_VISIBILITY] Connection query result:', connection ? 'FOUND' : 'NOT FOUND');

      if (!connection) {
        console.log('[GOOGLE_VISIBILITY] No active connection found');
        return res.json({
          success: true,
          data: {
            connected: false
          }
        });
      }

      console.log('[GOOGLE_VISIBILITY] Active connection found | googleEmail=', connection.google_email);
      return res.json({
        success: true,
        data: {
          connected: true,
          google_email: connection.google_email,
          google_name: connection.google_name,
          google_avatar: connection.google_avatar,
          connected_at: connection.connected_at
        }
      });
    } catch (connectionError) {
      console.error('[GOOGLE_VISIBILITY] Connection query error:', connectionError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check Google connection',
        error: connectionError.message
      });
    }

  } catch (error) {
    console.error('[GOOGLE_VISIBILITY] Status check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Google Visibility Connect Initiation
export const connectGoogleVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log('[GOOGLE_VISIBILITY] Connect initiation | projectId=', id, 'userId=', userId);

    // Verify project belongs to user
    const project = await SeoProject.findById(id);
    if (!project) {
      console.log('[GOOGLE_VISIBILITY] Project not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.user_id.toString() !== userId.toString()) {
      console.log('[GOOGLE_VISIBILITY] Access denied - user does not own project');
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Import OAuth2Client dynamically to avoid circular dependencies
    const { OAuth2Client } = await import('google-auth-library');

    const googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT
    );

    // Debug: Log OAuth configuration for Google Visibility
    console.log('[GOOGLE_VISIBILITY] OAuth Config:', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT,
      projectId: id,
      userId: userId
    });

    // Generate auth URL with purpose and projectId
    const authUrl = googleClient.generateAuthUrl({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT,
      response_type: "code",
      access_type: "offline",
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/webmasters.readonly",  // Search Console
        "https://www.googleapis.com/auth/analytics.readonly",   // Analytics
        "https://www.googleapis.com/auth/business.manage"      // Business Profile
      ],
      prompt: "select_account consent", // Force consent to get refresh token
      state: JSON.stringify({
        purpose: "google_visibility",
        projectId: id,  // ✅ Use 'id' instead of 'projectId'
        userId: userId
      })
    });

    console.log('[GOOGLE_VISIBILITY] Generated auth URL:', authUrl.substring(0, 200) + '...');

    console.log('[GOOGLE_VISIBILITY] Generated auth URL for projectId=', id);
    return res.json({
      success: true,
      data: {
        authUrl: authUrl
      }
    });

  } catch (error) {
    console.error('[GOOGLE_VISIBILITY] Connect initiation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Google Visibility Disconnect
export const disconnectGoogleVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log('[GOOGLE_VISIBILITY] Disconnect | projectId=', id, 'userId=', userId);

    // Verify project belongs to user
    const project = await SeoProject.findById(id);
    if (!project) {
      console.log('[GOOGLE_VISIBILITY] Project not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.user_id.toString() !== userId.toString()) {
      console.log('[GOOGLE_VISIBILITY] Access denied - user does not own project');
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Revoke the connection
    const result = await GoogleConnection.revokeConnection(userId, id);

    if (result.modifiedCount === 0) {
      console.log('[GOOGLE_VISIBILITY] No active connection found to disconnect');
      return res.status(404).json({
        success: false,
        message: 'No active Google connection found'
      });
    }

    console.log('[GOOGLE_VISIBILITY] Connection revoked successfully');
    return res.json({
      success: true,
      message: 'Google connection disconnected successfully'
    });

  } catch (error) {
    console.error('[GOOGLE_VISIBILITY] Disconnect error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get AI visibility worst performing pages
export const getAIVisibilityEntityGraph = async (req, res) => {
  try {
    const { id: projectId } = req.params;

    console.log("Entity Graph Controller - Incoming projectId:", projectId);
    console.log("Entity Graph Controller - projectId type:", typeof projectId);
    console.log("Entity Graph Controller - projectId isValid:", mongoose.Types.ObjectId.isValid(projectId));

    // Validate projectId format
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      console.log("Entity Graph Controller - Invalid projectId format");
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const projectIdObj = new mongoose.Types.ObjectId(projectId);
    console.log("Entity Graph Controller - Converted to ObjectId:", projectIdObj);

    console.log(`[AI_VISIBILITY] Getting entity graph | projectId=${projectId}`);

    // Get latest AI visibility data for the project
    const db = mongoose.connection.db;
    console.log("Entity Graph Controller - Querying seo_ai_visibility collection...");

    const latestData = await db.collection('seo_ai_visibility')
      .find({ projectId: projectIdObj })
      .sort({ extraction_timestamp: -1 }) // Get latest
      .limit(1)
      .project({
        projectId: 1,
        raw_json_ld_blocks: 1,
        parsed_entities: 1,
        entity_types: 1,
        entity_relationship_graph: 1,
        primary_entity: 1,
        entity_graph_integrity: 1,
        extraction_timestamp: 1,
        ai_jobId: 1
      })
      .toArray();

    console.log("Entity Graph Controller - Query results count:", latestData.length);

    if (latestData.length > 0) {
      console.log("Entity Graph Controller - Found document with keys:", Object.keys(latestData[0]));
      console.log("Entity Graph Controller - parsed_entities count:", latestData[0].parsed_entities?.length || 0);
      console.log("Entity Graph Controller - entity_relationship_graph count:", latestData[0].entity_relationship_graph?.length || 0);
    }

    if (!latestData || latestData.length === 0) {
      console.log("Entity Graph Controller - No AI visibility data found, returning empty response");
      return res.json({
        success: true,
        data: {
          summary: {
            json_ld_blocks: 0,
            primary_entity: "None",
            synthetic_ids_count: 0,
            graph_connectivity: "Fragmented"
          },
          entity_distribution: [],
          relationship_matrix: [],
          analysis_status: "failed"
        }
      });
    }

    const data = latestData[0];
    const parsedEntities = data.parsed_entities || [];
    const relationshipGraph = data.entity_relationship_graph || [];
    const rawJsonLdBlocks = data.raw_json_ld_blocks || [];

    // Calculate json_ld_blocks
    const json_ld_blocks = rawJsonLdBlocks.length;

    // Get primary_entity
    const primary_entity = data.primary_entity?.primary_entity_type || "None";

    // Calculate synthetic_ids_count
    const synthetic_ids_count = parsedEntities.filter(entity => {
      const entityId = entity['@id'];
      return entityId && entityId.includes('#') && entityId.includes('_');
    }).length;

    // Calculate entity_distribution
    const entityDistribution = {};
    parsedEntities.forEach(entity => {
      const entityType = entity['@type'];
      if (Array.isArray(entityType)) {
        entityType.forEach(type => {
          entityDistribution[type] = (entityDistribution[type] || 0) + 1;
        });
      } else if (entityType) {
        entityDistribution[entityType] = (entityDistribution[entityType] || 0) + 1;
      }
    });
    const entity_distribution = Object.entries(entityDistribution).map(([type, count]) => ({
      type,
      count
    }));

    // Calculate relationship_matrix
    const relationshipCounts = {};
    relationshipGraph.forEach(relationship => {
      // Count relationships by source entity
      if (relationship.source) {
        relationshipCounts[relationship.source] = (relationshipCounts[relationship.source] || 0) + 1;
      }
      // Count relationships by target entity
      if (relationship.target) {
        relationshipCounts[relationship.target] = (relationshipCounts[relationship.target] || 0) + 1;
      }
    });

    const relationship_matrix = parsedEntities.map(entity => {
      const nodeId = entity['@id'];
      const relationships_count = relationshipCounts[nodeId] || 0;
      const orphan = relationships_count === 0;

      // Safe type handling for arrays
      const type = Array.isArray(entity['@type'])
        ? entity['@type'][0]
        : entity['@type'] || 'Unknown';

      const safeType = typeof type === 'string'
        ? type.toLowerCase()
        : 'unknown';

      return {
        node_id: nodeId || `#${safeType}_unknown`,
        type: Array.isArray(entity['@type']) ? entity['@type'][0] : entity['@type'] || 'Unknown',
        relationships_count,
        orphan
      };
    });

    // Calculate graph_connectivity (simplified as noted)
    const hasOrphans = relationship_matrix.some(entity => entity.orphan);
    const graph_connectivity = hasOrphans ? "Fragmented" : "Unified";

    // Determine analysis_status from ai_jobId (not hardcoded)
    let analysis_status = "failed";
    if (data.ai_jobId) {
      try {
        // Check job status in jobs collection
        const jobDoc = await db.collection('jobs').findOne({
          _id: data.ai_jobId
        });

        if (jobDoc) {
          switch (jobDoc.status) {
            case 'queued':
            case 'running':
              analysis_status = "active";
              break;
            case 'completed':
              analysis_status = "completed";
              break;
            case 'failed':
              analysis_status = "failed";
              break;
            default:
              analysis_status = "failed";
          }
        }
      } catch (jobError) {
        console.warn('[AI_VISIBILITY] Could not fetch job status, defaulting to failed:', jobError.message);
        analysis_status = "failed";
      }
    }

    console.log(`[AI_VISIBILITY] Entity graph data ready | projectId=${projectId} | entities=${parsedEntities.length} | connectivity=${graph_connectivity}`);

    const responseData = {
      success: true,
      data: {
        summary: {
          json_ld_blocks,
          primary_entity,
          synthetic_ids_count,
          graph_connectivity
        },
        entity_distribution,
        relationship_matrix,
        analysis_status,
        raw_json_ld_blocks: rawJsonLdBlocks || []
      }
    };

    console.log("Entity Graph Controller - Sending response:", {
      success: responseData.success,
      dataKeys: Object.keys(responseData.data),
      entityDistributionCount: responseData.data.entity_distribution.length,
      relationshipMatrixCount: responseData.data.relationship_matrix.length,
      rawJsonLdBlocksCount: responseData.data.raw_json_ld_blocks.length,
      analysisStatus: responseData.data.analysis_status
    });

    return res.json(responseData);

  } catch (error) {
    console.error('[AI_VISIBILITY] Error getting entity graph:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getAIVisibilityPage = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { url } = req.query;

    // Validate projectId format
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    // Validate URL parameter
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL parameter is required'
      });
    }

    const projectIdObj = new mongoose.Types.ObjectId(projectId);
    const decodedUrl = decodeURIComponent(url);

    console.log(`[AI_VISIBILITY] Getting page details | projectId=${projectId} | url=${decodedUrl}`);

    // Query seo_ai_page_scores collection for specific page
    const db = mongoose.connection.db;

    // Check if collection exists before querying
    const collections = await db.listCollections().toArray();
    const hasCollection = collections.some(c => c.name === 'seo_ai_page_scores');

    if (!hasCollection) {
      console.log(`[AI_VISIBILITY] Collection seo_ai_page_scores does not exist | projectId=${projectId}`);
      return res.status(404).json({
        success: false,
        message: 'No AI visibility data found for this project'
      });
    }

    // Find the specific page
    const pageData = await db.collection('seo_ai_page_scores')
      .findOne({
        projectId: projectIdObj,
        page_url: decodedUrl
      });

    if (!pageData) {
      console.log(`[AI_VISIBILITY] Page not found | projectId=${projectId} | url=${decodedUrl}`);
      return res.status(404).json({
        success: false,
        message: 'Page not found in AI visibility data'
      });
    }

    // Query for real issues from the database
    let issues = [];

    // Check if seo_ai_visibility_issues collection exists
    const issuesCollection = collections.find(c => c.name === 'seo_ai_visibility_issues');

    if (issuesCollection) {
      console.log(`[AI_VISIBILITY] Found seo_ai_visibility_issues collection, querying for page issues | projectId=${projectId} | url=${decodedUrl}`);

      // Query the issues collection for this specific page
      const pageIssues = await db.collection('seo_ai_visibility_issues')
        .find({
          projectId: projectIdObj,
          page_url: decodedUrl
        })
        .project({
          severity: 1,
          rule_id: 1,
          issue_message: 1,
          detected_value: 1,
          expected_value: 1,
          data_path: 1,
          data_key: 1,
          created_at: 1
        })
        .toArray();

      // Format issues to match expected structure - USE CORRECT FIELD NAMES
      issues = pageIssues.map(issue => ({
        severity: issue.severity || 'unknown',
        rule_id: issue.rule_id || 'UNKNOWN',
        issue_message: issue.issue_message,
        detected_value: issue.detected_value,
        expected_value: issue.expected_value,
        data_path: issue.data_path || issue.data_key,
        data_key: issue.data_key,
        created_at: issue.created_at
      }));

      console.log("Mapped issues being returned:", issues);

      console.log(`[AI_VISIBILITY] Found ${issues.length} real issues for page | projectId=${projectId} | url=${decodedUrl}`);
    } else {
      console.log(`[AI_VISIBILITY] seo_ai_visibility_issues collection does not exist, returning empty issues array | projectId=${projectId}`);
      // No issues collection exists, return empty array
      // This is the correct behavior - no synthetic issues should be generated
    }

    // Calculate actual issue counts from the real issues data
    const actualHighIssues = issues.filter(issue => issue.severity.toLowerCase() === 'high').length;
    const actualMediumIssues = issues.filter(issue => issue.severity.toLowerCase() === 'medium').length;
    const actualLowIssues = issues.filter(issue => issue.severity.toLowerCase() === 'low').length;
    const actualTotalIssues = issues.length;

    // Format response with pure scoring fields
    const responseData = {
      url: pageData.page_url,
      score: pageData.final_score || 0,
      category_scores: pageData.category_scores || {},
      rule_breakdown: pageData.rule_breakdown || [],
      word_count: pageData.word_count || 0,
      issues: issues,
      total_issues: actualTotalIssues,
      last_crawled: pageData.updated_at
    };

    console.log(`[AI_VISIBILITY] Returning page data | projectId=${projectId} | url=${decodedUrl} | real_issues=${actualTotalIssues} | critical=${actualHighIssues} | warning=${actualMediumIssues} | info=${actualLowIssues}`);

    return res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('[AI_VISIBILITY] Error getting AI visibility page:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getAIVisibilityPages = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const {
      page = 1,
      limit = 20,
      grade,
      minScore,
      maxScore,
      severity,
      search
    } = req.query;

    // Validate projectId format
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const projectIdObj = new mongoose.Types.ObjectId(projectId);
    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 100); // Cap at 100 for performance
    const skip = (pageNum - 1) * limitNum;

    console.log(`[AI_VISIBILITY] Getting AI visibility pages | projectId=${projectId} | page=${pageNum} | limit=${limitNum}`);

    // Build query filter for pure scoring structure
    const filter = { projectId: projectIdObj };

    if (minScore !== undefined) {
      filter.final_score = { ...filter.final_score, $gte: parseFloat(minScore) };
    }

    if (maxScore !== undefined) {
      filter.final_score = { ...filter.final_score, $lte: parseFloat(maxScore) };
    }

    // Remove legacy grade-based filtering - no longer supported

    if (search) {
      filter.page_url = { $regex: search, $options: 'i' };
    }

    // Query seo_ai_page_scores collection
    const db = mongoose.connection.db;

    // Check if collection exists before querying
    const collections = await db.listCollections().toArray();
    const hasCollection = collections.some(c => c.name === 'seo_ai_page_scores');

    if (!hasCollection) {
      console.log(`[AI_VISIBILITY] Collection seo_ai_page_scores does not exist | projectId=${projectId}`);
      return res.json({
        success: true,
        data: {
          pages: [],
          summary: {
            total_pages: 0,
            avg_score: 0,
            critical_issues: 0,
            crawl_duration: 0
          },
          pagination: {
            page: pageNum,
            total: 0,
            limit: limitNum
          }
        }
      });
    }

    // Get total count for pagination
    const totalCount = await db.collection('seo_ai_page_scores').countDocuments(filter);

    // Get pages with pagination using pure scoring fields
    const pages = await db.collection('seo_ai_page_scores')
      .find(filter)
      .sort({ final_score: -1 }) // Sort by final_score descending
      .skip(skip)
      .limit(limitNum)
      .project({
        page_url: 1,
        final_score: 1,
        category_scores: 1,
        rule_breakdown: 1,
        updated_at: 1
      })
      .toArray();

    // Get summary metrics using pure scoring fields
    const summaryResults = await db.collection('seo_ai_page_scores').aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total_pages: { $sum: 1 },
          avg_score: { $avg: '$final_score' },
          min_updated: { $min: '$updated_at' },
          max_updated: { $max: '$updated_at' }
        }
      }
    ]).toArray();

    const summaryData = summaryResults.length > 0 ? summaryResults[0] : null;

    const summary = summaryData || {
      total_pages: 0,
      avg_score: 0,
      critical_issues: 0,
      min_updated: null,
      max_updated: null
    };

    // Calculate crawl duration in minutes
    let crawlDuration = 0;
    if (summary.min_updated && summary.max_updated) {
      crawlDuration = Math.round((summary.max_updated - summary.min_updated) / (1000 * 60));
    }

    // Format response with pure scoring structure
    const formattedPages = pages.map(page => ({
      url: page.page_url,
      score: page.final_score || 0,
      category_scores: page.category_scores || {},
      rule_breakdown: page.rule_breakdown || [],
      last_crawled: page.updated_at
    }));

    const responseData = {
      pages: formattedPages,
      summary: {
        total_pages: summary.total_pages,
        avg_score: Math.round(summary.avg_score * 10) / 10, // Round to 1 decimal
        critical_issues: summary.critical_issues,
        crawl_duration: crawlDuration
      },
      pagination: {
        page: pageNum,
        total: Math.ceil(totalCount / limitNum),
        limit: limitNum
      }
    };

    console.log(`[AI_VISIBILITY] Returning ${pages.length} pages | projectId=${projectId} | total=${totalCount}`);

    return res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('[AI_VISIBILITY] Error getting AI visibility pages:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getAIVisibilityWorstPages = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { limit = 5 } = req.query;

    // Validate projectId format
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const projectIdObj = new mongoose.Types.ObjectId(projectId);
    const limitNum = Math.min(parseInt(limit), 50); // Cap at 50 for performance

    console.log(`[AI_VISIBILITY] Getting worst pages | projectId=${projectId} | limit=${limitNum}`);

    // Query ONLY seo_ai_page_scores collection
    const db = mongoose.connection.db;

    // Check if collection exists before querying
    const collections = await db.listCollections().toArray();
    const hasCollection = collections.some(c => c.name === 'seo_ai_page_scores');

    if (!hasCollection) {
      console.log(`[AI_VISIBILITY] Collection seo_ai_page_scores does not exist | projectId=${projectId}`);
      return res.json({
        success: true,
        data: []
      });
    }

    const worstPages = await db.collection('seo_ai_page_scores')
      .find({ projectId: projectIdObj })
      .sort({ final_score: 1 }) // Sort ascending — lowest final_score are worst
      .limit(limitNum)
      .project({
        page_url: 1,
        final_score: 1,
        category_scores: 1,
        rule_breakdown: 1,
        updated_at: 1
      })
      .toArray();

    console.log(`[AI_VISIBILITY] Found ${worstPages.length} worst pages | projectId=${projectId}`);

    // Format response for frontend with pure scoring fields
    const formattedPages = worstPages.map(page => ({
      url: page.page_url,
      ai_score: page.final_score || 0,
      category_scores: page.category_scores || {},
      rule_breakdown: page.rule_breakdown || [],
      last_crawled: page.updated_at
    }));

    return res.json({
      success: true,
      data: formattedPages
    });

  } catch (error) {
    console.error('[AI_VISIBILITY] Error getting worst pages:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getStandaloneAIVisibilityPages = async (req, res) => {
  try {
    const { id: aiProjectId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    console.log(`[AI_VISIBILITY] Getting standalone AI visibility pages | aiProjectId=${aiProjectId}`);

    // Validate aiProjectId format
    if (!aiProjectId || !mongoose.Types.ObjectId.isValid(aiProjectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid AI project ID format'
      });
    }

    const aiProjectIdObj = new mongoose.Types.ObjectId(aiProjectId);
    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    // Get database connection
    const db = mongoose.connection.db;

    // Fetch URLs from seo_ai_internal_links where aiProjectId matches
    console.log(`[AI_VISIBILITY] Fetching from seo_ai_internal_links | aiProjectId=${aiProjectId}`);
    const internalLinks = await db.collection('seo_ai_internal_links')
      .find({ aiProjectId: aiProjectIdObj })
      .project({
        url: 1,
        score: 1,
        issues_count: 1,
        updated_at: 1
      })
      .toArray();

    console.log(`[AI_VISIBILITY] Internal links found:`, internalLinks.length);

    // Optionally fetch from seo_ai_visibility where projectId matches
    console.log(`[AI_VISIBILITY] Fetching from seo_ai_visibility | projectId=${aiProjectId}`);
    const visibilityPages = await db.collection('seo_ai_visibility')
      .find({ projectId: aiProjectIdObj })
      .project({
        url: 1,
        score: 1,
        issues_count: 1,
        updated_at: 1
      })
      .toArray();

    console.log(`[AI_VISIBILITY] Visibility pages found:`, visibilityPages.length);

    // Fetch page scores from seo_ai_page_scores where projectId matches
    console.log(`[AI_VISIBILITY] Fetching scores from seo_ai_page_scores | projectId=${aiProjectId}`);
    const pageScores = await db.collection('seo_ai_page_scores')
      .find({ projectId: aiProjectIdObj })
      .project({
        page_url: 1,
        final_score: 1,
        category_scores: 1,
        rule_breakdown: 1,
        updated_at: 1
      })
      .toArray();

    console.log(`[AI_VISIBILITY] Page scores found:`, pageScores.length);

    // Fetch issues from seo_ai_visibility_issues collection
    console.log(`[AI_VISIBILITY] Fetching issues from seo_ai_visibility_issues | projectId=${aiProjectId}`);
    const issues = await db.collection('seo_ai_visibility_issues')
      .find({ projectId: aiProjectIdObj })
      .project({
        page_url: 1,
        severity: 1
      })
      .toArray();

    console.log(`[AI_VISIBILITY] Issues found:`, issues.length);

    // Group issues by page_url
    const issuesMap = {};
    issues.forEach(issue => {
      if (!issuesMap[issue.page_url]) {
        issuesMap[issue.page_url] = {
          total: 0,
          high: 0
        };
      }

      issuesMap[issue.page_url].total++;

      if (issue.severity === 'high') {
        issuesMap[issue.page_url].high++;
      }
    });

    // Create score map for quick lookup
    const scoreMap = new Map();
    pageScores.forEach(scoreDoc => {
      if (scoreDoc.page_url) {
        // Normalize URL (remove trailing slash for consistent matching)
        const normalizedUrl = scoreDoc.page_url.replace(/\/$/, '');
        scoreMap.set(normalizedUrl, scoreDoc);
      }
    });

    // Merge both URL lists and remove duplicates
    const urlMap = new Map();

    // Add internal links
    internalLinks.forEach(page => {
      if (page.url) {
        const normalizedUrl = page.url.replace(/\/$/, '');
        urlMap.set(normalizedUrl, {
          url: page.url,
          score: page.score || 0,
          issues: page.issues_count || 0,
          updated_at: page.updated_at
        });
      }
    });

    // Add visibility pages (will overwrite duplicates with latest data)
    visibilityPages.forEach(page => {
      if (page.url) {
        const normalizedUrl = page.url.replace(/\/$/, '');
        urlMap.set(normalizedUrl, {
          url: page.url,
          score: page.score || 0,
          issues: page.issues_count || 0,
          updated_at: page.updated_at
        });
      }
    });

    // Merge scores into page list
    let matchedCount = 0;
    const pagesWithScores = Array.from(urlMap.values()).map(page => {
      const normalizedUrl = page.url.replace(/\/$/, '');
      const scoreDoc = scoreMap.get(normalizedUrl);
      const pageIssues = issuesMap[page.url] || { total: 0, high: 0 };
      
      if (scoreDoc) {
        matchedCount++;
        const categoryScores = scoreDoc.category_scores || {};
        
        return {
          url: page.url,
          finalScore: scoreDoc.final_score || 0,
          aeo: categoryScores.aeo_score || 0,
          llm: categoryScores.llm_readiness || 0,
          cite: categoryScores.citation_probability || 0,
          aeoPercent: Math.round(categoryScores.aeo_score || 0),
          llmPercent: Math.round(categoryScores.llm_readiness || 0),
          citePercent: Math.round(categoryScores.citation_probability || 0),
          issuesCount: pageIssues.total,
          criticalCount: pageIssues.high,
          updated_at: page.updated_at || scoreDoc.updated_at
        };
      } else {
        return {
          url: page.url,
          finalScore: 0,
          aeo: 0,
          llm: 0,
          cite: 0,
          aeoPercent: 0,
          llmPercent: 0,
          citePercent: 0,
          issuesCount: pageIssues.total,
          criticalCount: pageIssues.high,
          updated_at: page.updated_at
        };
      }
    });

    console.log(`[AI_VISIBILITY] Scores matched:`, matchedCount);

    // Apply pagination
    const totalPages = pagesWithScores.length;
    const paginatedPages = pagesWithScores.slice(skip, skip + limitNum);

    // Calculate metrics
    const scores = pagesWithScores.map(p => p.finalScore).filter(s => s > 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const totalCritical = pagesWithScores.reduce((sum, p) => sum + p.criticalCount, 0);

    console.log(`[AI_VISIBILITY] Total unique pages: ${totalPages} | Returning: ${paginatedPages.length} | Avg score: ${avgScore} | Total critical: ${totalCritical}`);

    return res.json({
      success: true,
      message: 'Standalone AI visibility pages retrieved successfully',
      data: {
        pages: paginatedPages,
        totalPages: totalPages,
        avgScore: avgScore,
        totalCritical: totalCritical,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: Math.ceil(totalPages / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('[AI_VISIBILITY] Error getting standalone AI visibility pages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get standalone AI visibility pages',
      error: error.message
    });
  }
};

export const getPageScore = async (req, res) => {
  try {
    const { projectId, url } = req.query;

    console.log(`[AI_VISIBILITY] Getting page score | projectId=${projectId} | url=${url}`);

    // Validate inputs
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL parameter is required'
      });
    }

    const projectIdObj = new mongoose.Types.ObjectId(projectId);
    
    // Robust URL normalization for matching
    const normalizeUrl = (url) => {
      try {
        const parsed = new URL(url);
        // Force https protocol
        parsed.protocol = "https:";
        // Remove trailing slash and duplicate slashes
        parsed.pathname = parsed.pathname.replace(/\/+$/, "").replace(/\/+/g, "/");
        // Standardize www (remove it)
        parsed.hostname = parsed.hostname?.replace(/^www\./, "");
        return parsed.origin + parsed.pathname;
      } catch {
        // Fallback for malformed URLs
        return url.replace(/^https?:\/\//, "")
                  .replace(/^www\./, "")
                  .replace(/\/+$/, "")
                  .replace(/\/+/g, "/");
      }
    };
    
    const normalizedUrl = normalizeUrl(url);
    
    console.log(`[AI_VISIBILITY] URL normalization | original=${url} | normalized=${normalizedUrl}`);

    // Get database connection
    const db = mongoose.connection.db;

    // Fetch page score from seo_ai_page_scores
    console.log(`[AI_VISIBILITY] Fetching page score from seo_ai_page_scores | normalized=${normalizedUrl}`);
    
    // Create flexible regex pattern for URL matching
    const pathname = new URL(normalizedUrl).pathname;
    const urlPattern = new RegExp(pathname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
    
    console.log(`[AI_VISIBILITY] Query pattern | pathname=${pathname} | pattern=${urlPattern}`);
    
    const pageScore = await db.collection('seo_ai_page_scores').findOne(
      {
        projectId: projectIdObj,
        page_url: { $regex: urlPattern }
      },
      {
        projection: {
          page_url: 1,
          final_score: 1,
          category_scores: 1,
          rule_breakdown: 1,
          updated_at: 1
        }
      }
    );

    console.log(`[AI_VISIBILITY] Page score found:`, !!pageScore);
    
    // 🔍 DEBUG: Log raw database values
    if (pageScore) {
      console.log(`[AI_VISIBILITY] RAW DB DATA:`);
      console.log(`  - final_score: ${pageScore.final_score}`);
      console.log(`  - category_scores:`, pageScore.category_scores);
      console.log(`  - ai_impact from category_scores: ${pageScore.category_scores?.ai_impact}`);
    }

    // Fetch issues from seo_ai_visibility_issues
    console.log(`[AI_VISIBILITY] Fetching issues from seo_ai_visibility_issues | pattern=${urlPattern}`);
    const issues = await db.collection('seo_ai_visibility_issues')
      .find({
        projectId: projectIdObj,
        page_url: { $regex: urlPattern }
      })
      .project({
        page_url: 1,
        rule_name: 1,
        category: 1,
        severity: 1,
        description: 1,
        recommended_fix: 1,
        created_at: 1
      })
      .toArray();

    console.log(`[AI_VISIBILITY] Issues found:`, issues.length);

    if (!pageScore) {
      return res.status(404).json({
        success: false,
        message: 'Page not found in AI visibility data'
      });
    }

    // Calculate metrics
    const categoryScores = pageScore.category_scores || {};
    const highSeverityCount = issues.filter(issue => issue.severity === 'high').length;

    const responseData = {
      url: pageScore.page_url,
      finalScore: pageScore.final_score || 0,
      categoryScores: {
        ai_impact: categoryScores.ai_impact || 0,  // 🔍 DEBUG: Added ai_impact
        aeo_score: categoryScores.aeo_score || 0,
        llm_readiness: categoryScores.llm_readiness || 0,
        citation_probability: categoryScores.citation_probability || 0,
        topical_authority: categoryScores.topical_authority || 0,
        voice_intent: categoryScores.voice_intent || 0
      },
      issues: issues,
      issuesCount: issues.length,
      highSeverityCount: highSeverityCount,
      ruleBreakdown: pageScore.rule_breakdown || [],
      updatedAt: pageScore.updated_at
    };

    console.log(`[AI_VISIBILITY] API RESPONSE PAYLOAD:`);
    console.log(`  - finalScore: ${responseData.finalScore}`);
    console.log(`  - categoryScores.ai_impact: ${responseData.categoryScores.ai_impact}`);
    console.log(`  - categoryScores:`, responseData.categoryScores);

    console.log(`[AI_VISIBILITY] Page data ready | score=${responseData.finalScore} | issues=${responseData.issuesCount}`);

    return res.json({
      success: true,
      message: 'Page score retrieved successfully',
      data: responseData
    });

  } catch (error) {
    console.error('[AI_VISIBILITY] Error getting page score:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get page score',
      error: error.message
    });
  }
};

export const getAIVisibilityPageIssues = async (req, res) => {
  try {
    const { projectId, page_url } = req.query;

    console.log(`[AI_VISIBILITY] Getting AI visibility page issues | projectId=${projectId} | page_url=${page_url}`);

    // Validate inputs
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    if (!page_url) {
      return res.status(400).json({
        success: false,
        message: 'page_url parameter is required'
      });
    }

    const projectIdObj = new mongoose.Types.ObjectId(projectId);
    const decodedUrl = decodeURIComponent(page_url);

    // Get database connection
    const db = mongoose.connection.db;

    // Fetch issues from seo_ai_visibility_issues collection
    console.log(`[AI_VISIBILITY] Querying seo_ai_visibility_issues | projectId=${projectId} | page_url=${decodedUrl}`);
    
    const issues = await db.collection('seo_ai_visibility_issues')
      .find({
        projectId: projectIdObj,
        page_url: decodedUrl
      })
      .sort({ created_at: -1 })
      .project({
        rule_id: 1,
        category: 1,
        severity: 1,
        message: 1,
        rule_score: 1,
        created_at: 1
      })
      .toArray();

    console.log(`[AI_VISIBILITY] Found ${issues.length} issues for page | page_url=${decodedUrl}`);

    // Map database fields to frontend format
    const formattedIssues = issues.map((issue, index) => ({
      id: issue._id.toString(),
      rule_name: issue.rule_id || 'Unknown Rule',
      issue_code: issue.rule_id || `ISSUE-${index}`,
      category: issue.category || 'General',
      severity: issue.severity || 'low',
      description: issue.message || 'No description available',
      recommended_fix: `Review and fix the rule: ${issue.rule_id}`,
      score: issue.rule_score || 0,
      created_at: issue.created_at
    }));

    return res.json({
      success: true,
      message: 'Issues retrieved successfully',
      data: formattedIssues
    });

  } catch (error) {
    console.error('[AI_VISIBILITY] Error getting AI visibility page issues:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get page issues',
      error: error.message
    });
  }
};

