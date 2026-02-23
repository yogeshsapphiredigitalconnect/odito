import GoogleConnection from '../model/GoogleConnection.js';
import BusinessProfileData from '../model/BusinessProfileData.js';
import SeoProject from '../model/SeoProject.js';
import { 
  getProjectBusinessProfileData,
  getBusinessProfileAccounts,
  getBusinessProfileLocations,
  validateBusinessProfileAccess
} from '../../../services/businessProfileService.js';

/**
 * Business Profile Sync Controller
 * 
 * Implements manual sync endpoint for Business Profile insights and reviews
 * 
 * Flow (exact same as Analytics):
 * 1. Validate project ownership
 * 2. Validate Google connection
 * 3. Validate selected businessAccountId + businessLocationId
 * 4. Fetch Business Profile data
 * 5. Store data
 * 6. Update sync metadata & enable service
 */

/**
 * Sync Business Profile data for a project
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const syncBusinessProfileData = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  console.log('[BUSINESS_PROFILE_SYNC] Starting sync', {
    projectId,
    userId: userId.toString()
  });

  try {
    // Step 1: Validate project ownership
    console.log('[BUSINESS_PROFILE_SYNC] Step 1: Validating project ownership...');
    const project = await SeoProject.findById(projectId);
    
    if (!project) {
      console.log('[BUSINESS_PROFILE_SYNC] Project not found:', projectId);
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.user_id.toString() !== userId.toString()) {
      console.log('[BUSINESS_PROFILE_SYNC] Access denied - user does not own project');
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log('[BUSINESS_PROFILE_SYNC] Project ownership validated:', {
      projectName: project.project_name,
      projectUrl: project.main_url
    });

    // Step 2: Validate Google connection
    console.log('[BUSINESS_PROFILE_SYNC] Step 2: Validating Google connection...');
    const googleConnection = await GoogleConnection.findActiveConnection(userId, projectId);
    
    if (!googleConnection) {
      console.log('[BUSINESS_PROFILE_SYNC] No active Google connection found');
      return res.status(400).json({
        success: false,
        message: 'Google account not connected. Please connect your Google account first.'
      });
    }

    console.log('[BUSINESS_PROFILE_SYNC] Google connection validated:', {
      googleEmail: googleConnection.google_email,
      serviceTypes: googleConnection.service_type,
      lastSync: googleConnection.last_sync_at
    });

    // Step 3: Validate selected businessAccountId + businessLocationId
    console.log('[BUSINESS_PROFILE_SYNC] Step 3: Validating Business Profile selection...');
    if (!googleConnection.service_type.includes('business_profile')) {
      console.log('[BUSINESS_PROFILE_SYNC] Business Profile service not enabled');
      return res.status(400).json({
        success: false,
        message: 'Business Profile service not enabled. Please select a Business Profile account first.'
      });
    }

    if (!googleConnection.business_account_id || !googleConnection.business_location_id) {
      console.log('[BUSINESS_PROFILE_SYNC] Business Profile IDs not stored');
      return res.status(400).json({
        success: false,
        message: 'Business Profile account/location not selected. Please select an account and location first.'
      });
    }

    console.log('[BUSINESS_PROFILE_SYNC] Business Profile selection validated:', {
      accountId: googleConnection.business_account_id,
      locationId: googleConnection.business_location_id
    });

    // Step 4: Fetch Business Profile data
    console.log('[BUSINESS_PROFILE_SYNC] Step 4: Fetching Business Profile data...');
    let performanceData;
    let dateRange;

    try {
      performanceData = await getProjectBusinessProfileData(
        googleConnection, 
        googleConnection.business_account_id,
        googleConnection.business_location_id
      );
      
      if (!performanceData || !performanceData.data || performanceData.data.length === 0) {
        console.log('[BUSINESS_PROFILE_SYNC] No Business Profile data available');
        return res.status(200).json({
          success: true,
          message: 'No Business Profile data available for this location',
          dataPoints: 0,
          dateRange: null,
          lastSyncAt: googleConnection.last_sync_at
        });
      }

      // Calculate date range from data (last 30 days for GBP)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      dateRange = {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      };

      console.log('[BUSINESS_PROFILE_SYNC] Business Profile data fetched:', {
        dataPoints: performanceData.data?.length || 0,
        dateRange,
        sampleData: (performanceData.data || []).slice(0, 2).map(item => ({
          views: item.views,
          searches: item.searches,
          actions: item.actions
        }))
      });

    } catch (apiError) {
      console.error('[BUSINESS_PROFILE_SYNC] Google API fetch failed:', {
        error: apiError.message,
        stack: apiError.stack
      });
      
      return res.status(400).json({
        success: false,
        message: `Failed to fetch Business Profile data: ${apiError.message}`
      });
    }

    // Step 5: Store data in database
    console.log('[BUSINESS_PROFILE_SYNC] Step 5: Storing data in database...');
    let dbResult;

    try {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      dbResult = await BusinessProfileData.upsertPerformanceData(
        performanceData.data,
        userId,
        projectId,
        startDate,
        endDate
      );

      console.log('[BUSINESS_PROFILE_SYNC] Data stored successfully:', {
        upserted: dbResult.upserted,
        modified: dbResult.modified,
        total: dbResult.total
      });

    } catch (dbError) {
      console.error('[BUSINESS_PROFILE_SYNC] Database operation failed:', {
        error: dbError.message,
        stack: dbError.stack
      });
      
      return res.status(500).json({
        success: false,
        message: 'Failed to store Business Profile data. Please try again.'
      });
    }

    // Step 6: Update Google connection sync metadata & enable service
    console.log('[BUSINESS_PROFILE_SYNC] Step 6: Updating sync metadata...');
    try {
      await GoogleConnection.findByIdAndUpdate(
        googleConnection._id,
        {
          $addToSet: { service_type: 'business_profile' }, // Ensure service is enabled
          last_sync_at: new Date(),
          updated_at: new Date()
        },
        { new: true }
      );

      console.log('[BUSINESS_PROFILE_SYNC] Sync metadata updated');

    } catch (metadataError) {
      console.error('[BUSINESS_PROFILE_SYNC] Failed to update sync metadata:', {
        error: metadataError.message
      });
      
      console.log('[BUSINESS_PROFILE_SYNC] Continuing despite metadata update failure');
    }

    // Return success response
    const syncResponse = {
      success: true,
      message: 'Business Profile data synced successfully',
      dataPoints: dbResult.total,
      dateRange: dateRange,
      lastSyncAt: new Date().toISOString()
    };

    console.log('[BUSINESS_PROFILE_SYNC] Sync completed successfully:', {
      projectId,
      dataPoints: syncResponse.dataPoints,
      dateRange: syncResponse.dateRange
    });

    return res.status(200).json(syncResponse);

  } catch (error) {
    console.error('[BUSINESS_PROFILE_SYNC] Unexpected error:', {
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
 * Get Business Profile sync status for a project
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getBusinessProfileSyncStatus = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  console.log('[BUSINESS_PROFILE_STATUS] Getting sync status', {
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

    const isServiceEnabled = googleConnection.service_type.includes('business_profile');

    // Get latest data count
    let dataCount = 0;
    let latestDataDate = null;

    if (isServiceEnabled) {
      try {
        // FIX: Count business_profile_data documents directly like Search Console & Analytics
        dataCount = await BusinessProfileData.countDocuments({
          project_id: projectId
        });
        
        // Get latest data date if we have data
        if (dataCount > 0) {
          const aggregates = await BusinessProfileData.getProjectAggregates(projectId);
          latestDataDate = aggregates.lastFetched;
        }
      } catch (countError) {
        console.warn('[BUSINESS_PROFILE_STATUS] Failed to get data count:', countError.message);
      }
    }

    const statusResponse = {
      success: true,
      connected: true,
      serviceEnabled: isServiceEnabled,
      businessAccountId: googleConnection.business_account_id || null,
      businessLocationId: googleConnection.business_location_id || null,
      lastSyncAt: googleConnection.last_sync_at,
      dataPoints: dataCount,
      latestDataDate: latestDataDate,
      googleEmail: googleConnection.google_email
    };

    console.log('[BUSINESS_PROFILE_STATUS] Status retrieved:', statusResponse);

    return res.json(statusResponse);

  } catch (error) {
    console.error('[BUSINESS_PROFILE_STATUS] Error:', {
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
 * Get Business Profile performance data for a project
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getBusinessProfileData = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  // Parse query parameters
  const {
    page = 1,
    limit = 50,
    sort = 'views',
    order = 'desc',
    start_date,
    end_date
  } = req.query;

  console.log('[BUSINESS_PROFILE_DATA] Fetching performance data', {
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
    
    if (!googleConnection || !googleConnection.service_type.includes('business_profile')) {
      return res.status(400).json({
        success: false,
        message: 'Business Profile not connected for this project'
      });
    }

    // Parse and validate parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Validate sort field
    const validSortFields = ['views', 'searches', 'actions', 'calls', 'websiteClicks', 'directionRequests'];
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
    const performanceData = await BusinessProfileData.getProjectPerformanceData(
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
    const aggregates = await BusinessProfileData.getProjectAggregates(
      projectId,
      startDateFilter,
      endDateFilter
    );

    const response = {
      success: true,
      data: performanceData.map(row => ({  // FIX: Normalize field names for frontend
        metricDate: row.metric_date,
        views: row.views,
        searches: row.searches,
        actions: row.actions,
        calls: row.calls,
        websiteClicks: row.website_clicks,
        directionRequests: row.direction_requests,
        fetchedAt: row.fetched_at
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: aggregates.page_count || 0,
        pages: Math.max(1, Math.ceil((aggregates.page_count || 0) / limitNum))  // FIX: Never return 0
      },
      summary: {
        totalViews: aggregates.totalViews || 0,
        totalSearches: aggregates.totalSearches || 0,
        totalActions: aggregates.totalActions || 0,
        lastFetched: aggregates.lastFetched
      },
      dateRange: {
        start: start_date || null,
        end: end_date || null
      }
    };

    console.log('[BUSINESS_PROFILE_DATA] Data retrieved successfully:', {
      projectId,
      dataPoints: performanceData.length,
      totalPages: response.pagination.pages
    });

    return res.json(response);

  } catch (error) {
    console.error('[BUSINESS_PROFILE_DATA] Error:', {
      error: error.message,
      stack: error.stack,
      projectId
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Business Profile data'
    });
  }
};

/**
 * Get list of accessible Business Profile accounts
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getBusinessProfileAccountsController = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  console.log('[BUSINESS_PROFILE_ACCOUNTS] Getting accounts', {
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

    // Get Business Profile accounts
    const accounts = await getBusinessProfileAccounts(googleConnection);

    const response = {
      success: true,
      accounts: accounts
    };

    console.log('[BUSINESS_PROFILE_ACCOUNTS] Accounts retrieved:', {
      projectId,
      accountCount: accounts.length
    });

    return res.json(response);

  } catch (error) {
    console.error('[BUSINESS_PROFILE_ACCOUNTS] Error:', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
      projectId
    });
    
    // ✅ Preserve Google error codes - don't hide behind 500
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Google Business Profile rate limit exceeded. Please wait and retry.',
        retryAfter: 60
      });
    }
    
    if (error.response?.status === 403) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Missing Business Profile permissions'
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid or expired credentials'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Unexpected Business Profile error'
    });
  }
};

/**
 * Get locations for a specific Business Profile account
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getBusinessProfileLocationsController = async (req, res) => {
  const { projectId } = req.params;
  const { accountId } = req.query;
  const userId = req.user._id;

  console.log('[BUSINESS_PROFILE_LOCATIONS] Getting locations', {
    projectId,
    accountId,
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

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID is required'
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

    // Get locations for the account
    const locations = await getBusinessProfileLocations(googleConnection, accountId);

    const response = {
      success: true,
      locations: locations
    };

    console.log('[BUSINESS_PROFILE_LOCATIONS] Locations retrieved:', {
      projectId,
      accountId,
      locationCount: locations.length
    });

    return res.json(response);

  } catch (error) {
    console.error('[BUSINESS_PROFILE_LOCATIONS] Error:', {
      error: error.message,
      projectId
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Business Profile locations'
    });
  }
};

/**
 * Select and store Business Profile account and location
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const selectBusinessProfile = async (req, res) => {
  const { projectId } = req.params;
  const { accountId, locationId } = req.body;
  const userId = req.user._id;

  console.log('[BUSINESS_PROFILE_SELECT] Selecting account/location', {
    projectId,
    userId: userId.toString(),
    accountId,
    locationId
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

    if (!accountId || !locationId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID and Location ID are required'
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

    // Validate account access
    try {
      await validateBusinessProfileAccess(googleConnection, accountId, locationId);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: `Access denied for account/location: ${validationError.message}`
      });
    }

    // Update connection with account/location IDs and enable business profile service
    await GoogleConnection.findByIdAndUpdate(
      googleConnection._id,
      {
        business_account_id: accountId,
        business_location_id: locationId,
        $addToSet: { service_type: 'business_profile' },
        updated_at: new Date()
      },
      { new: true }
    );

    const response = {
      success: true,
      businessAccountId: accountId,
      businessLocationId: locationId
    };

    console.log('[BUSINESS_PROFILE_SELECT] Account/location selected successfully:', {
      projectId,
      accountId,
      locationId
    });

    return res.json(response);

  } catch (error) {
    console.error('[BUSINESS_PROFILE_SELECT] Error:', {
      error: error.message,
      projectId
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to select Business Profile account'
    });
  }
};

export default {
  syncBusinessProfileData,
  getBusinessProfileSyncStatus,
  getBusinessProfileData,
  getBusinessProfileAccountsController,
  getBusinessProfileLocationsController,
  selectBusinessProfile
};
