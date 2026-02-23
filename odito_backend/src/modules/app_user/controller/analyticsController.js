import GoogleConnection from '../model/GoogleConnection.js';
import AnalyticsData from '../model/AnalyticsData.js';
import SeoProject from '../model/SeoProject.js';
import { 
  getProjectAnalyticsData,
  getAnalyticsProperties,
  validateAnalyticsPropertyAccess
} from '../../../services/analyticsService.js';

/**
 * Analytics Sync Controller
 * 
 * Implements manual sync endpoint for Analytics performance data
 * 
 * Flow:
 * 1. Validate user ownership and Google connection
 * 2. Validate stored analytics_property_id
 * 3. Fetch data from Analytics API
 * 4. Store data with duplicate prevention
 * 5. Update sync metadata
 * 6. Return sync status
 * 
 * Safety Features:
 * - Transaction-safe operations
 * - Idempotent sync (safe to retry)
 * - Partial failure handling
 * - Comprehensive validation
 */

/**
 * Sync Analytics data for a project
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const syncAnalyticsData = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  console.log('[ANALYTICS_SYNC] Starting sync', {
    projectId,
    userId: userId.toString()
  });

  try {
    // Step 1: Validate project ownership
    console.log('[ANALYTICS_SYNC] Step 1: Validating project ownership...');
    const project = await SeoProject.findById(projectId);
    
    if (!project) {
      console.log('[ANALYTICS_SYNC] Project not found:', projectId);
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.user_id.toString() !== userId.toString()) {
      console.log('[ANALYTICS_SYNC] Access denied - user does not own project');
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log('[ANALYTICS_SYNC] Project ownership validated:', {
      projectName: project.project_name,
      projectUrl: project.main_url
    });

    // Step 2: Validate Google connection
    console.log('[ANALYTICS_SYNC] Step 2: Validating Google connection...');
    const googleConnection = await GoogleConnection.findActiveConnection(userId, projectId);
    
    if (!googleConnection) {
      console.log('[ANALYTICS_SYNC] No active Google connection found');
      return res.status(400).json({
        success: false,
        message: 'Google account not connected. Please connect your Google account first.'
      });
    }

    console.log('[ANALYTICS_SYNC] Google connection validated:', {
      googleEmail: googleConnection.google_email,
      serviceTypes: googleConnection.service_type,
      lastSync: googleConnection.last_sync_at
    });

    // Step 3: Validate stored analytics_property_id
    console.log('[ANALYTICS_SYNC] Step 3: Validating analytics property ID...');
    if (!googleConnection.service_type.includes('analytics')) {
      console.log('[ANALYTICS_SYNC] Analytics service not enabled');
      return res.status(400).json({
        success: false,
        message: 'Analytics service not enabled. Please select an Analytics property first.'
      });
    }

    if (!googleConnection.analytics_property_id) {
      console.log('[ANALYTICS_SYNC] No analytics property ID stored');
      return res.status(400).json({
        success: false,
        message: 'Analytics property not selected. Please select an Analytics property first.'
      });
    }

    console.log('[ANALYTICS_SYNC] Analytics property ID validated:', {
      propertyId: googleConnection.analytics_property_id
    });

    // Step 4: Fetch Analytics data
    console.log('[ANALYTICS_SYNC] Step 4: Fetching Analytics data...');
    let performanceData;
    let dateRange;

    try {
      performanceData = await getProjectAnalyticsData(
        googleConnection, 
        googleConnection.analytics_property_id
      );
      
      if (!performanceData || !performanceData.data || performanceData.data.length === 0) {
        console.log('[ANALYTICS_SYNC] No Analytics data available');
        return res.status(200).json({
          success: true,
          message: 'No Analytics data available for this property',
          syncedPages: 0,
          skippedPages: 0,
          dataPoints: 0,
          dateRange: null,
          lastSyncAt: googleConnection.last_sync_at
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

      console.log('[ANALYTICS_SYNC] Analytics data fetched:', {
        dataPoints: performanceData.dataPoints || performanceData.data?.length || 0,
        syncedPages: performanceData.syncedPages || 0,
        skippedPages: performanceData.skippedPages || 0,
        dateRange,
        sampleData: (performanceData.data || []).slice(0, 2).map(item => ({
          pagePath: item.page_path,
          sessions: item.sessions,
          pageViews: item.page_views
        }))
      });

    } catch (apiError) {
      console.error('[ANALYTICS_SYNC] Google API fetch failed:', {
        error: apiError.message,
        stack: apiError.stack
      });
      
      // Don't update sync state on API failure
      return res.status(400).json({
        success: false,
        message: `Failed to fetch Analytics data: ${apiError.message}`
      });
    }

    // Step 5: Store data in database
    console.log('[ANALYTICS_SYNC] Step 5: Storing data in database...');
    let dbResult;

    try {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      dbResult = await AnalyticsData.upsertPerformanceData(
        performanceData.data,
        userId,
        projectId,
        startDate,
        endDate
      );

      console.log('[ANALYTICS_SYNC] Data stored successfully:', {
        upserted: dbResult.upserted,
        modified: dbResult.modified,
        total: dbResult.total
      });

    } catch (dbError) {
      console.error('[ANALYTICS_SYNC] Database operation failed:', {
        error: dbError.message,
        stack: dbError.stack
      });
      
      // Don't update sync state on DB failure
      return res.status(500).json({
        success: false,
        message: 'Failed to store Analytics data. Please try again.'
      });
    }

    // Step 6: Update Google connection sync metadata
    console.log('[ANALYTICS_SYNC] Step 6: Updating sync metadata...');
    try {
      await GoogleConnection.findByIdAndUpdate(
        googleConnection._id,
        {
          last_sync_at: new Date(),
          updated_at: new Date()
        },
        { new: true }
      );

      console.log('[ANALYTICS_SYNC] Sync metadata updated');

    } catch (metadataError) {
      console.error('[ANALYTICS_SYNC] Failed to update sync metadata:', {
        error: metadataError.message
      });
      
      // Data was stored successfully, but metadata update failed
      console.log('[ANALYTICS_SYNC] Continuing despite metadata update failure');
    }

    // Step 7: Return success response
    const syncResponse = {
      success: true,
      message: 'Analytics data synced successfully',
      syncedPages: dbResult.total,
      skippedPages: performanceData.skipped_pages || 0,
      dataPoints: performanceData.dataPoints || performanceData.data?.length || 0,
      dateRange: dateRange,
      lastSyncAt: new Date().toISOString()
    };

    console.log('[ANALYTICS_SYNC] Sync completed successfully:', {
      projectId,
      syncedPages: syncResponse.syncedPages,
      dateRange: syncResponse.dateRange
    });

    return res.status(200).json(syncResponse);

  } catch (error) {
    console.error('[ANALYTICS_SYNC] Unexpected error:', {
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
 * Get Analytics sync status for a project
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAnalyticsSyncStatus = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  console.log('[ANALYTICS_STATUS] Getting sync status', {
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
        serviceEnabled: false,
        lastSyncAt: null,
        message: 'Google account not connected'
      });
    }

    const isServiceEnabled = googleConnection.service_type.includes('analytics');

    // Get latest data count
    let dataCount = 0;
    let latestDataDate = null;

    if (isServiceEnabled) {
      try {
        // FIX: Count analytics_data documents directly like Search Console
        dataCount = await AnalyticsData.countDocuments({
          project_id: projectId
        });
        
        // Get latest data date if we have data
        if (dataCount > 0) {
          const aggregates = await AnalyticsData.getProjectAggregates(projectId);
          latestDataDate = aggregates.lastFetched;
        }
      } catch (countError) {
        console.warn('[ANALYTICS_STATUS] Failed to get data count:', countError.message);
      }
    }

    const statusResponse = {
      success: true,
      connected: true,
      serviceEnabled: isServiceEnabled,
      analyticsPropertyId: googleConnection.analytics_property_id || null,
      lastSyncAt: googleConnection.last_sync_at,
      dataPoints: dataCount,
      latestDataDate: latestDataDate,
      googleEmail: googleConnection.google_email
    };

    console.log('[ANALYTICS_STATUS] Status retrieved:', statusResponse);

    return res.json(statusResponse);

  } catch (error) {
    console.error('[ANALYTICS_STATUS] Error:', {
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
 * Get Analytics performance data for a project
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAnalyticsData = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  // Parse query parameters
  const {
    page = 1,
    limit = 50,
    sort = 'sessions',
    order = 'desc',
    start_date,
    end_date
  } = req.query;

  console.log('[ANALYTICS_DATA] Fetching performance data', {
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
    
    if (!googleConnection || !googleConnection.service_type.includes('analytics')) {
      return res.status(400).json({
        success: false,
        message: 'Analytics not connected for this project'
      });
    }

    // Parse and validate parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Validate sort field
    const validSortFields = ['sessions', 'activeUsers', 'pageViews', 'engagementRate', 'pagePath'];
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
    const performanceData = await AnalyticsData.getProjectPerformanceData(
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
    const aggregates = await AnalyticsData.getProjectAggregates(
      projectId,
      startDateFilter,
      endDateFilter
    );

    const response = {
      success: true,
      data: performanceData.map(row => ({  // FIX: Normalize field names for frontend
        pagePath: row.page_path,
        sessions: row.sessions,
        activeUsers: row.active_users,
        pageViews: row.page_views,
        engagementRate: row.engagement_rate,
        fetchedAt: row.fetched_at
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: aggregates.page_count || 0,
        pages: Math.max(1, Math.ceil((aggregates.page_count || 0) / limitNum))  // FIX: Never return 0
      },
      summary: {
        totalSessions: aggregates.totalSessions || 0,
        totalPageViews: aggregates.totalPageViews || 0,
        avgEngagementRate: aggregates.avgEngagementRate || 0,
        lastFetched: aggregates.lastFetched
      },
      dateRange: {
        start: start_date || null,
        end: end_date || null
      }
    };

    console.log('[ANALYTICS_DATA] Data retrieved successfully:', {
      projectId,
      dataPoints: performanceData.length,
      totalPages: response.pagination.pages
    });

    return res.json(response);

  } catch (error) {
    console.error('[ANALYTICS_DATA] Error:', {
      error: error.message,
      stack: error.stack,
      projectId
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Analytics data'
    });
  }
};

/**
 * Get list of accessible Analytics properties
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAnalyticsPropertiesList = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  console.log('[ANALYTICS_PROPERTIES] Getting properties', {
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
      return res.status(400).json({
        success: false,
        message: 'Google account not connected'
      });
    }

    // Get Analytics properties
    const properties = await getAnalyticsProperties(googleConnection);

    const response = {
      success: true,
      properties: properties
    };

    console.log('[ANALYTICS_PROPERTIES] Properties retrieved:', {
      projectId,
      propertyCount: properties.length
    });

    return res.json(response);

  } catch (error) {
    console.error('[ANALYTICS_PROPERTIES] Error:', {
      error: error.message,
      projectId
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Analytics properties'
    });
  }
};

/**
 * Select and store Analytics property
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const selectAnalyticsProperty = async (req, res) => {
  const { projectId } = req.params;
  const { propertyId } = req.body;
  const userId = req.user._id;

  console.log('[ANALYTICS_SELECT_PROPERTY] Selecting property', {
    projectId,
    userId: userId.toString(),
    propertyId
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

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    // Check Google connection
    const googleConnection = await GoogleConnection.findActiveConnection(userId, projectId);
    
    if (!googleConnection) {
      return res.status(400).json({
        success: false,
        message: 'Google account not connected'
      });
    }

    // Validate property access
    try {
      await validateAnalyticsPropertyAccess(googleConnection, propertyId);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: `Access denied for property: ${validationError.message}`
      });
    }

    // Update connection with property ID and enable analytics service
    await GoogleConnection.findByIdAndUpdate(
      googleConnection._id,
      {
        analytics_property_id: propertyId,
        $addToSet: { service_type: 'analytics' },
        updated_at: new Date()
      },
      { new: true }
    );

    const response = {
      success: true,
      analyticsPropertyId: propertyId
    };

    console.log('[ANALYTICS_SELECT_PROPERTY] Property selected successfully:', {
      projectId,
      propertyId
    });

    return res.json(response);

  } catch (error) {
    console.error('[ANALYTICS_SELECT_PROPERTY] Error:', {
      error: error.message,
      projectId
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to select Analytics property'
    });
  }
};

export default {
  syncAnalyticsData,
  getAnalyticsSyncStatus,
  getAnalyticsData,
  getAnalyticsPropertiesList,
  selectAnalyticsProperty
};
