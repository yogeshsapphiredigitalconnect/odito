import SeoProject from '../model/SeoProject.js';
import { JobService } from '../../jobs/service/jobService.js';
import { JOB_TYPES } from '../../jobs/constants/jobTypes.js';
import Job from '../../jobs/model/Job.js';
import mongoose from 'mongoose';

// Create a new SEO project
const createSeoProject = async (req, res) => {
  const { 
    project_name, 
    main_url, 
    keywords, 
    business_type,
    industry,
    location,
    country = 'US', 
    language = 'en', 
    description,
    scrape_frequency = 'manual',
    status = 'draft'
  } = req.body;

  console.log('📥 Received create project request');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('User:', req.user?._id);

  try {

    // Validate required fields with detailed error messages
    if (!project_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    if (!main_url?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Main URL is required'
      });
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one keyword is required'
      });
    }

    // Check if project name already exists for this user
    const existingProject = await SeoProject.findOne({
      user_id: req.user._id,
      project_name: project_name.trim()
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'A project with this name already exists'
      });
    }

    // Create the SEO project with new schema
    const seoProject = new SeoProject({
      user_id: req.user._id,
      project_name: project_name.trim(),
      main_url: main_url.trim().toLowerCase(),
      keywords: keywords.map(k => k.trim()).filter(k => k.length >= 2),
      business_type: business_type?.trim() || null,
      industry: industry?.trim() || null,
      location: location?.trim() || null,
      country: country.toUpperCase(),
      language: language.toLowerCase(),
      description: description?.trim() || '',
      scrape_frequency: scrape_frequency || 'manual',
      status: status || 'draft'
    });

    const savedProject = await seoProject.save();

    res.status(201).json({
      success: true,
      message: 'SEO Project created successfully',
      data: {
        project: savedProject,
        projectId: savedProject._id
      }
    });

  } catch (error) {
    console.error('Error creating SEO project:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      errors: error.errors
    });
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry detected'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all SEO projects for the logged-in user
const getAllSeoProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, industry, scrape_frequency } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { user_id: req.user._id };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by industry if provided
    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }

    // Filter by scrape frequency if provided
    if (scrape_frequency) {
      query.scrape_frequency = scrape_frequency;
    }

    // Search by project name or business name if provided
    if (search) {
      query.$or = [
        { project_name: { $regex: search, $options: 'i' } },
        { business_type: { $regex: search, $options: 'i' } },
        { main_url: { $regex: search, $options: 'i' } }
      ];
    }

    // Get projects with pagination and enhanced fields
    const projects = await SeoProject.aggregate([
      { $match: query },
      { $sort: { created_at: -1 } },
      {
        $addFields: {
          keyword_count: { $size: { $ifNull: ['$keywords', []] } },
          project_age_days: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$created_at'] },
                1000 * 60 * 60 * 24
              ]
            }
          },
          days_since_last_scrape: {
            $cond: {
              if: { $ne: ['$last_scraped_at', null] },
              then: {
                $floor: {
                  $divide: [
                    { $subtract: [new Date(), '$last_scraped_at'] },
                    1000 * 60 * 60 * 24
                  ]
                }
              },
              else: null
            }
          },
          // NEW: Add crawl duration formatting
          crawl_duration_formatted: {
            $cond: {
              if: { $gt: ['$crawl_duration', 0] },
              then: {
                $let: {
                  vars: {
                    totalSeconds: { $floor: { $divide: ['$crawl_duration', 1000] } }
                  },
                  in: {
                    $concat: [
                      { $toString: { $floor: { $divide: ['$$totalSeconds', 60] } } },
                      'm ',
                      { $toString: { $mod: ['$$totalSeconds', 60] } },
                      's'
                    ]
                  }
                }
              },
              else: 'N/A'
            }
          }
        }
      },
      {
        $project: {
          project_name: 1,
          main_url: 1,
          business_type: 1,
          industry: 1,
          location: 1,
          country: 1,
          language: 1,
          status: 1,
          scrape_frequency: 1,
          last_scraped_at: 1,
          total_pages: 1,
          total_issues: 1,
          // NEW: Include crawl summary fields
          pages_discovered: 1,
          pages_crawled: 1,
          pages_analyzed: 1,
          crawl_duration: 1,
          crawl_success_rate: 1,
          crawl_status: 1,
          last_analysis_at: 1,
          crawl_duration_formatted: 1,
          keyword_count: 1,
          project_age_days: 1,
          days_since_last_scrape: 1,
          created_at: 1,
          updated_at: 1
        }
      },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    // Get total count for pagination
    const totalProjects = await SeoProject.countDocuments(query);

    // Get statistics
    const stats = await SeoProject.aggregate([
      { $match: { user_id: req.user._id } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          draftProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          pausedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] }
          },
          errorProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] }
          },
          totalScraped: {
            $sum: { $cond: [{ $ne: ['$last_scraped_at', null] }, 1, 0] }
          },
          totalPages: { $sum: '$total_pages' },
          totalIssues: { $sum: '$total_issues' },
          // NEW: Add crawl summary statistics
          completedCrawls: {
            $sum: { $cond: [{ $eq: ['$crawl_status', 'completed'] }, 1, 0] }
          },
          averageCrawlDuration: {
            $avg: { $cond: [{ $gt: ['$crawl_duration', 0] }, '$crawl_duration', null] }
          },
          totalPagesDiscovered: { $sum: '$pages_discovered' },
          totalPagesCrawled: { $sum: '$pages_crawled' },
          totalPagesAnalyzed: { $sum: '$pages_analyzed' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProjects / limit),
          totalProjects,
          hasNext: page * limit < totalProjects,
          hasPrev: page > 1
        },
        stats: stats[0] || {
          totalProjects: 0,
          activeProjects: 0,
          draftProjects: 0,
          pausedProjects: 0,
          errorProjects: 0,
          totalScraped: 0,
          totalPages: 0,
          totalIssues: 0,
          // NEW: Default crawl summary statistics
          completedCrawls: 0,
          averageCrawlDuration: 0,
          totalPagesDiscovered: 0,
          totalPagesCrawled: 0,
          totalPagesAnalyzed: 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects',
      error: error.message
    });
  }
};

// Get single SEO project by ID
const getSeoProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const project = await SeoProject.findOne({
      _id: id,
      user_id: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Fetch latest screenshot for this project using existing connection
    let screenshotUrl = null;
    try {
      // Use the same mongoose connection that's already established
      const screenshotsCollection = mongoose.connection.collection('seo_mainurl_snapshot');
      
      const latestScreenshot = await screenshotsCollection
        .find({ project_id: new mongoose.Types.ObjectId(id) })
        .sort({ captured_at: -1 })
        .limit(1)
        .toArray();
      
      if (latestScreenshot.length > 0 && latestScreenshot[0].screenshot_path) {
        // Convert relative path to public URL
        const screenshotPath = latestScreenshot[0].screenshot_path;
        screenshotUrl = `http://localhost:5000/${screenshotPath}`;
        console.log('✅ Found screenshot for project:', id, 'URL:', screenshotUrl);
      }
    } catch (screenshotError) {
      console.error('Error fetching screenshot:', screenshotError);
      // Continue without screenshot if fetch fails
    }

    const projectData = {
      ...project.toObject(),
      screenshot_url: screenshotUrl
    };

    console.log('📤 Project data response:', { 
      projectId: id, 
      hasScreenshot: !!screenshotUrl,
      screenshotUrl: screenshotUrl 
    });

    res.status(200).json({
      success: true,
      data: projectData
    });

  } catch (error) {
    console.error('Error fetching SEO project:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update SEO project details
const updateSeoProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      project_name, 
      main_url, 
      keywords, 
      business_type,
      industry,
      location,
      country, 
      language, 
      description,
      scrape_frequency,
      status
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    // Find the project and ensure it belongs to the user
    const project = await SeoProject.findOne({
      _id: id,
      user_id: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if new project name conflicts with existing projects
    if (project_name && project_name !== project.project_name) {
      const existingProject = await SeoProject.findOne({
        _id: { $ne: id },
        user_id: req.user._id,
        project_name: project_name.trim()
      });

      if (existingProject) {
        return res.status(400).json({
          success: false,
          message: 'A project with this name already exists'
        });
      }
    }

    // Update project fields with new schema
    if (project_name) project.project_name = project_name.trim();
    if (main_url) project.main_url = main_url.trim().toLowerCase();
    if (keywords) project.keywords = keywords.map(k => k.trim()).filter(k => k.length >= 2);
    if (business_type !== undefined) project.business_type = business_type?.trim() || null;
    if (industry !== undefined) project.industry = industry?.trim() || null;
    if (location !== undefined) project.location = location?.trim() || null;
    if (country) project.country = country.toUpperCase();
    if (language) project.language = language.toLowerCase();
    if (description !== undefined) project.description = description?.trim() || '';
    if (scrape_frequency) project.scrape_frequency = scrape_frequency;
    if (status) project.status = status;

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });

  } catch (error) {
    console.error('Error updating SEO project:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update project status
const updateSeoProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    if (!['draft', 'active', 'paused', 'error'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be draft, active, paused, or error'
      });
    }

    const project = await SeoProject.findOneAndUpdate(
      {
        _id: id,
        user_id: req.user._id
      },
      { status },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project status updated successfully',
      data: project
    });

  } catch (error) {
    console.error('Error updating SEO project status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete SEO project
const deleteSeoProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    // Find the project and ensure it belongs to the user
    const project = await SeoProject.findOne({
      _id: id,
      user_id: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete the project
    await SeoProject.deleteOne({
      _id: id
    });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting SEO project:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get project scraping summary
const getProjectScrapingSummary = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const summary = await SeoProject.getScrapingSummary(id);

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Verify project belongs to user
    if (summary.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error getting scraping summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scraping summary',
      error: error.message
    });
  }
};

// Get projects needing scraping (for scheduled jobs)
const getProjectsNeedingScrape = async (req, res) => {
  try {
    // This endpoint is for internal/scheduled use
    const projects = await SeoProject.getProjectsNeedingScrape();

    res.status(200).json({
      success: true,
      data: projects,
      count: projects.length
    });

  } catch (error) {
    console.error('Error getting projects needing scrape:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects needing scrape',
      error: error.message
    });
  }
};

// Get project dashboard data
const getProjectDashboard = async (req, res) => {
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

    // Get link counts directly from MongoDB collections
    const db = mongoose.connection.db;
    const { ObjectId } = mongoose.Types;
    
    // Get the latest completed LINK_DISCOVERY job for this project
    const latestJob = await Job.findOne({
      project_id: projectId,
      jobType: JOB_TYPES.LINK_DISCOVERY,
      status: 'completed'
    }).sort({ created_at: -1 });
    
    // If no completed job, return 0 counts
    if (!latestJob) {
      return {
        internalLinks: 0,
        externalLinks: 0,
        socialLinks: 0,
        totalUrlsFound: 0
      };
    }
    
    console.log('🔍 Latest completed job:', latestJob._id);
    
    // Query links using the job's _id as seo_jobId
    const internalLinksCount = await db.collection('seo_internal_links').countDocuments({
      seo_jobId: latestJob._id
    });

    const externalLinksCount = await db.collection('seo_external_links').countDocuments({
      seo_jobId: latestJob._id
    });

    const socialLinksCount = await db.collection('seo_social_links').countDocuments({
      seo_jobId: latestJob._id
    });

    // Get crawl status
    const linkDiscoveryJob = await Job.findOne({
      project_id: projectId,
      jobType: JOB_TYPES.LINK_DISCOVERY
    }).sort({ created_at: -1 });

    console.log('🔍 Dashboard Debug:', {
      projectId,
      latestJobId: latestJob._id,
      linkDiscoveryJob: linkDiscoveryJob?.status,
      internalLinksCount,
      externalLinksCount,
      socialLinksCount
    });

    const crawlStatus = {
      linkDiscovery: {
        completed: linkDiscoveryJob?.status === 'completed' || internalLinksCount > 0,
        running: linkDiscoveryJob?.status === 'processing',
        pending: !linkDiscoveryJob || (linkDiscoveryJob?.status === 'pending' && internalLinksCount === 0)
      }
    };

    const dashboardData = {
      summary: {
        internalLinks: internalLinksCount,
        externalLinks: externalLinksCount,
        socialLinks: socialLinksCount,
        totalUrlsFound: linkDiscoveryJob?.result_data?.totalUrlsFound || (internalLinksCount + externalLinksCount + socialLinksCount)
      },
      crawlStatus
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error getting project dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project dashboard',
      error: error.message
    });
  }
};

// Get project screenshot data
const getProjectScreenshot = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    
    console.log('🖼️ Screenshot API called with projectId:', projectId);
    
    // Get database connection
    const db = mongoose.connection.db;
    const { ObjectId } = mongoose.Types;
    
    console.log('🖼️ Database connection obtained');
    
    // Validate project exists
    const project = await SeoProject.findById(projectId);
    
    console.log('🖼️ Project lookup result:', project ? 'Found' : 'Not found');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get the most recent screenshot data for this project from mainurl_snapshot collection
    console.log('🖼️ Querying seo_mainurl_snapshot collection...');
    const screenshotData = await db.collection('seo_mainurl_snapshot')
      .find({ project_id: new ObjectId(projectId) })
      .sort({ captured_at: -1 })
      .limit(1)
      .toArray();

    console.log('🖼️ Screenshot Debug:', {
      projectId,
      found: screenshotData.length,
      data: screenshotData[0] ? {
        screenshot_path: screenshotData[0].screenshot_path,
        status: screenshotData[0].status,
        captured_at: screenshotData[0].captured_at
      } : null
    });

    if (screenshotData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No screenshot data found for this project'
      });
    }

    const screenshot = screenshotData[0];
    
    // Construct full URL for screenshot path
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fullScreenshotPath = screenshot.screenshot_path.startsWith('./') 
      ? screenshot.screenshot_path.replace('./', `${baseUrl}/`)
      : `${baseUrl}/${screenshot.screenshot_path}`;
    
    console.log('🖼️ Full screenshot URL:', fullScreenshotPath);
    
    // Calculate screenshot sections for processing
    const scrollHeight = screenshot.scroll_height || 17248; // Default height
    const sectionHeight = 800; // A4-friendly section height
    const numSections = Math.ceil(scrollHeight / sectionHeight);
    
    // Generate section metadata
    const sections = [];
    for (let i = 0; i < numSections; i++) {
      const startY = i * sectionHeight;
      const endY = Math.min((i + 1) * sectionHeight, scrollHeight);
      const sectionHeight_actual = endY - startY;
      
      // Skip sections that are too small
      if (sectionHeight_actual < 400 && i > 0) continue;
      
      const sectionType = i === 0 ? 'hero' : (i === numSections - 1 ? 'footer' : 'content');
      const sectionLabels = {
        hero: 'Above the Fold',
        content: numSections > 2 ? `Content Section ${i}` : 'Main Content',
        footer: 'Footer'
      };
      
      sections.push({
        id: `section-${i + 1}`,
        type: sectionType,
        index: i,
        startY,
        endY,
        height: sectionHeight_actual,
        width: 1200, // Standard screenshot width
        totalHeight: scrollHeight,
        imageUrl: fullScreenshotPath,
        label: sectionLabels[sectionType] || `Section ${i + 1}`,
        cropParams: {
          x: 0,
          y: startY,
          width: 1200,
          height: sectionHeight_actual
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        _id: screenshot._id,
        project_id: screenshot.project_id,
        job_id: screenshot.job_id,
        url: screenshot.url,
        final_url: screenshot.final_url,
        canonical_url: screenshot.canonical_url,
        screenshot_path: fullScreenshotPath,
        dom_hash: screenshot.dom_hash,
        scroll_height: screenshot.scroll_height,
        status: screenshot.status,
        error: screenshot.error,
        captured_at: screenshot.captured_at,
        // Add processed sections metadata
        sections: sections,
        totalSections: sections.length,
        processing: {
          sectionHeight,
          minSectionHeight: 400,
          maxSectionHeight: 800,
          aspectRatio: '16:9',
          printOptimized: true
        }
      }
    });

  } catch (error) {
    console.error('Error getting project screenshot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project screenshot',
      error: error.message
    });
  }
};

export {
  createSeoProject,
  getAllSeoProjects,
  getSeoProjectById,
  updateSeoProject,
  updateSeoProjectStatus,
  deleteSeoProject,
  getProjectScrapingSummary,
  getProjectsNeedingScrape,
  getProjectDashboard,
  getProjectScreenshot
};
