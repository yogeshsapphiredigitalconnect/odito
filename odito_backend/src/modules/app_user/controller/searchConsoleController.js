import GoogleConnection from '../model/GoogleConnection.js';
import SearchConsoleData from '../model/SearchConsoleData.js';
import SeoProject from '../model/SeoProject.js';
import { getProjectSearchConsoleData } from '../../../services/searchConsoleService.js';

/**
 * Search Console Sync Controller
 * 
 * Implements manual sync endpoint for Search Console performance data
 * 
 * Flow:
 * 1. Validate user ownership and Google connection
 * 2. Fetch data from Search Console API
 * 3. Store data with duplicate prevention
 * 4. Update sync metadata
 * 5. Return sync status
 * 
 * Safety Features:
 * - Transaction-safe operations
 * - Idempotent sync (safe to retry)
 * - Partial failure handling
 * - Comprehensive validation
 */

/**
 * Sync Search Console data for a project
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const syncSearchConsoleData = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  console.log('[SEARCH_CONSOLE_SYNC] Starting sync', {
    projectId,
    userId: userId.toString()
  });

  try {
    // Step 1: Validate project ownership
    console.log('[SEARCH_CONSOLE_SYNC] Step 1: Validating project ownership...');
    const project = await SeoProject.findById(projectId);
    
    if (!project) {
      console.log('[SEARCH_CONSOLE_SYNC] Project not found:', projectId);
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.user_id.toString() !== userId.toString()) {
      console.log('[SEARCH_CONSOLE_SYNC] Access denied - user does not own project');
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log('[SEARCH_CONSOLE_SYNC] Project ownership validated:', {
      projectName: project.project_name,
      projectUrl: project.main_url
    });

    // Step 2: Validate Google connection
    console.log('[SEARCH_CONSOLE_SYNC] Step 2: Validating Google connection...');
    const googleConnection = await GoogleConnection.findActiveConnection(userId, projectId);
    
    if (!googleConnection) {
      console.log('[SEARCH_CONSOLE_SYNC] No active Google connection found');
      return res.status(400).json({
        success: false,
        message: 'Google account not connected. Please connect your Google account first.'
      });
    }

    console.log('[SEARCH_CONSOLE_SYNC] Google connection validated:', {
      googleEmail: googleConnection.google_email,
      serviceTypes: googleConnection.service_type,
      lastSync: googleConnection.last_sync_at
    });

    // Step 3: Fetch Search Console data
    console.log('[SEARCH_CONSOLE_SYNC] Step 3: Fetching Search Console data...');
    let performanceData;
    let dateRange;

    try {
      performanceData = await getProjectSearchConsoleData(googleConnection, project.main_url);
      
      if (!performanceData || !performanceData.data || performanceData.data.length === 0) {
        console.log('[SEARCH_CONSOLE_SYNC] No Search Console data available');
        return res.status(200).json({
          success: true,
          message: 'No Search Console data available for this project',
          synced_pages: 0,
          skipped_pages: 0,
          data_points: 0,
          date_range: null,
          last_sync_at: googleConnection.last_sync_at
        });
      }

      // Calculate date range from data (28 days from API)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 28);
      
      dateRange = {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      };

      console.log('[SEARCH_CONSOLE_SYNC] Search Console data fetched:', {
        dataPoints: performanceData.dataPoints || performanceData.data?.length || 0,
        syncedPages: performanceData.syncedPages || 0,
        skippedPages: performanceData.skippedPages || 0,
        dateRange,
        sampleData: (performanceData.rows || performanceData.data || []).slice(0, 2).map(item => ({
          page_url: item.page_url,
          clicks: item.clicks,
          impressions: item.impressions
        }))
      });

    } catch (apiError) {
      console.error('[SEARCH_CONSOLE_SYNC] Google API fetch failed:', {
        error: apiError.message,
        stack: apiError.stack
      });
      
      // Don't update sync state on API failure
      return res.status(400).json({
        success: false,
        message: `Failed to fetch Search Console data: ${apiError.message}`
      });
    }

    // Step 4: Store data in database
    console.log('[SEARCH_CONSOLE_SYNC] Step 4: Storing data in database...');
    let dbResult;

    try {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      dbResult = await SearchConsoleData.upsertPerformanceData(
        performanceData.data,
        userId,
        projectId,
        startDate,
        endDate
      );

      console.log('[SEARCH_CONSOLE_SYNC] Data stored successfully:', {
        upserted: dbResult.upserted,
        modified: dbResult.modified,
        total: dbResult.total
      });

    } catch (dbError) {
      console.error('[SEARCH_CONSOLE_SYNC] Database operation failed:', {
        error: dbError.message,
        stack: dbError.stack
      });
      
      // Don't update sync state on DB failure
      return res.status(500).json({
        success: false,
        message: 'Failed to store Search Console data. Please try again.'
      });
    }

    // Step 5: Update Google connection sync metadata and enable Search Console service
    console.log('[SEARCH_CONSOLE_SYNC] Step 5: Updating sync metadata and enabling Search Console service...');
    try {
      // Update last_sync_at and automatically enable Search Console service
      await GoogleConnection.findByIdAndUpdate(
        googleConnection._id,
        {
          last_sync_at: new Date(),
          updated_at: new Date(),
          // Automatically add search_console to service_type on first successful sync
          $addToSet: { service_type: 'search_console' }
        },
        { new: true }
      );

      console.log('[SEARCH_CONSOLE_SYNC] Sync metadata updated');

    } catch (metadataError) {
      console.error('[SEARCH_CONSOLE_SYNC] Failed to update sync metadata:', {
        error: metadataError.message
      });
      
      // Data was stored successfully, but metadata update failed
      // This is not critical, so we can still return success
      console.log('[SEARCH_CONSOLE_SYNC] Continuing despite metadata update failure');
    }

    // Step 6: Return success response
    const syncResponse = {
      success: true,
      message: 'Search Console data synced successfully',
      synced_pages: dbResult.total,
      skipped_pages: performanceData.skipped_pages || 0,
      data_points: performanceData.dataPoints || performanceData.data?.length || 0,
      date_range: dateRange,
      last_sync_at: new Date().toISOString()
    };

    console.log('[SEARCH_CONSOLE_SYNC] Sync completed successfully:', {
      projectId,
      syncedPages: syncResponse.synced_pages,
      dateRange: syncResponse.date_range
    });

    return res.status(200).json(syncResponse);

  } catch (error) {
    console.error('[SEARCH_CONSOLE_SYNC] Unexpected error:', {
      error: error.message,
      stack: error.stack,
      projectId,
      userId
    });
    
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during sync. Please try again.'
    });
  }
};

/**
 * Get Search Console sync status for a project
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSearchConsoleSyncStatus = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  console.log('[SEARCH_CONSOLE_STATUS] Getting sync status', {
    projectId,
    userId: userId.toString()
  });

  try {
    // Validate project ownership
    const project = await SeoProject.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check Google connection
    const googleConnection = await GoogleConnection.findActiveConnection(userId, projectId);
    
    if (!googleConnection) {
      return res.json({
        success: true,
        connected: false,
        service_enabled: false,
        last_sync_at: null,
        message: 'Google account not connected'
      });
    }

    const isServiceEnabled = googleConnection.service_type.includes('search_console');

    // Get latest data count
    let dataCount = 0;
    let latestDataDate = null;

    if (isServiceEnabled) {
      try {
        // FIX: Count search_console_data documents directly like Analytics
        dataCount = await SearchConsoleData.countDocuments({
          project_id: projectId
        });
        
        // Get latest data date if we have data
        if (dataCount > 0) {
          const aggregates = await SearchConsoleData.getProjectAggregates(projectId);
          latestDataDate = aggregates.lastFetched;
        }
      } catch (countError) {
        console.warn('[SEARCH_CONSOLE_STATUS] Failed to get data count:', countError.message);
      }
    }

    const statusResponse = {
      success: true,
      connected: true,
      service_enabled: isServiceEnabled,
      last_sync_at: googleConnection.last_sync_at,
      data_points: dataCount,
      latest_data_date: latestDataDate,
      google_email: googleConnection.google_email
    };

    console.log('[SEARCH_CONSOLE_STATUS] Status retrieved:', statusResponse);

    return res.json(statusResponse);

  } catch (error) {
    console.error('[SEARCH_CONSOLE_STATUS] Error:', {
      error: error.message,
      projectId
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to get sync status'
    });
  }
};

/**
 * Get Search Console performance data for a project
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSearchConsoleData = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  // Parse query parameters
  const {
    page = 1,
    limit = 50,
    sort = 'clicks',
    order = 'desc',
    start_date,
    end_date
  } = req.query;

  console.log('[SEARCH_CONSOLE_DATA] Fetching performance data', {
    projectId,
    userId: userId.toString(),
    queryParams: { page, limit, sort, order, start_date, end_date }
  });

  try {
    // Validate project ownership
    const project = await SeoProject.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate Google connection
    const googleConnection = await GoogleConnection.findActiveConnection(userId, projectId);
    
    if (!googleConnection || !googleConnection.service_type.includes('search_console')) {
      return res.status(400).json({
        success: false,
        message: 'Search Console not connected for this project'
      });
    }

    // Parse and validate parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Validate sort field
    const validSortFields = ['clicks', 'impressions', 'ctr', 'position', 'page_url'];
    if (!validSortFields.includes(sort)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`
      });
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Parse dates
    let startDateFilter = null;
    let endDateFilter = null;

    if (start_date) {
      startDateFilter = new Date(start_date);
      if (isNaN(startDateFilter.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid start_date format'
        });
      }
    }

    if (end_date) {
      endDateFilter = new Date(end_date);
      if (isNaN(endDateFilter.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid end_date format'
        });
      }
    }

    // Fetch data
    const performanceData = await SearchConsoleData.getProjectPerformanceData(
      projectId,
      startDateFilter,
      endDateFilter,
      {
        sort: sortObj,
        limit: limitNum,
        skip: skip
      }
    );

    // Get total count for pagination
    const aggregates = await SearchConsoleData.getProjectAggregates(
      projectId,
      startDateFilter,
      endDateFilter
    );

    const response = {
      success: true,
      data: performanceData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: aggregates.page_count || 0,
        pages: Math.max(1, Math.ceil((aggregates.page_count || 0) / limitNum))  // FIX: Never return 0
      },
      summary: {
        total_clicks: aggregates.totalClicks || 0,
        total_impressions: aggregates.totalImpressions || 0,
        avg_ctr: aggregates.avgCtr || 0,
        avg_position: aggregates.avgPosition || 0,
        last_fetched: aggregates.lastFetched
      },
      date_range: {
        start: start_date || null,
        end: end_date || null
      }
    };

    console.log('[SEARCH_CONSOLE_DATA] Data retrieved successfully:', {
      projectId,
      dataPoints: performanceData.length,
      totalPages: response.pagination.pages
    });

    return res.json(response);

  } catch (error) {
    console.error('[SEARCH_CONSOLE_DATA] Error:', {
      error: error.message,
      stack: error.stack,
      projectId
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Search Console data'
    });
  }
};

export default {
  syncSearchConsoleData,
  getSearchConsoleSyncStatus,
  getSearchConsoleData
};
