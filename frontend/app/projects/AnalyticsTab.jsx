"use client"

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  RefreshCw,
  AlertTriangle as ErrorIcon,
  CheckCircle,
  BarChart3,
  Settings
} from 'lucide-react'
import apiService from '@/lib/apiService'

/**
 * Analytics Tab Component
 * 
 * Handles Google Analytics GA4 data sync and display
 * 
 * Features:
 * - Property selection before sync
 * - Manual sync with loading states
 * - Status display
 * - Data table with pagination
 * - Comprehensive error handling
 */

export default function AnalyticsTab({ projectId }) {
  console.log('AnalyticsTab mounted with projectId:', projectId);
  
  // State management
  const [status, setStatus] = useState({
    connected: false,
    serviceEnabled: false,
    analyticsPropertyId: null,
    lastSyncAt: null,
    dataPoints: 0,
    googleEmail: '',
    loading: true,
    error: null
  });

  const [syncState, setSyncState] = useState({
    syncing: false,
    error: null
  });

  const [dataState, setDataState] = useState({
    data: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      pages: 0
    }
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    sort: 'sessions',
    order: 'desc'
  });

  // Property selection state
  const [propertyState, setPropertyState] = useState({
    properties: [],
    loading: false,
    error: null,
    showSelector: false
  });

  // API helper functions
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await apiService.request(endpoint, options);
      return response;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  };

  // Load initial status
  const loadStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiCall(`/projects/${projectId}/analytics/status`);
      
      setStatus({
        connected: response.connected,
        serviceEnabled: response.serviceEnabled,
        analyticsPropertyId: response.analyticsPropertyId,
        lastSyncAt: response.lastSyncAt,
        dataPoints: response.dataPoints || 0,
        googleEmail: response.googleEmail || '',
        loading: false,
        error: null
      });

    } catch (error) {
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  // Load performance data
  const loadData = async (page = 1) => {
    try {
      setDataState(prev => ({ ...prev, loading: true, error: null }));
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: filters.limit.toString(),
        sort: filters.sort,
        order: filters.order
      });
      
      const response = await apiCall(`/projects/${projectId}/analytics/data?${params}`);
      
      setDataState({
        data: Array.isArray(response.data) ? response.data : [],  // FIX: Defensive array check
        loading: false,
        error: null,
        pagination: {
          page: response.pagination?.page ?? 1,                    // FIX: Defensive pagination
          limit: response.pagination?.limit ?? 50,
          total: response.pagination?.total ?? 0,
          pages: response.pagination?.pages ?? 1
        }
      });

    } catch (error) {
      setDataState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  // Load available properties
  const loadProperties = async () => {
    try {
      setPropertyState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiCall(`/projects/${projectId}/analytics/properties`);
      
      setPropertyState({
        properties: response.properties || [],
        loading: false,
        error: null,
        showSelector: true
      });

    } catch (error) {
      setPropertyState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  // Select analytics property
  const selectProperty = async (propertyId) => {
    try {
      setPropertyState(prev => ({ ...prev, loading: true, error: null }));
      
      await apiCall(`/projects/${projectId}/analytics/select-property`, {
        method: 'POST',
        body: JSON.stringify({ propertyId })
      });
      
      // Reload status to get updated property info
      await loadStatus();
      
      setPropertyState({
        properties: [],
        loading: false,
        error: null,
        showSelector: false
      });

    } catch (error) {
      setPropertyState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  // Manual sync
  const handleSync = async () => {
    try {
      setSyncState({ syncing: true, error: null });
      
      const response = await apiCall(`/projects/${projectId}/analytics/sync`, {
        method: 'POST'
      });
      
      // Reload status and data on success
      await loadStatus();
      await loadData(1);
      
      setSyncState({ syncing: false, error: null });

    } catch (error) {
      setSyncState({
        syncing: false,
        error: error.message
      });
    }
  };

  // Pagination and sorting
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    loadData(newPage);
  };

  const handleSortChange = (newSort) => {
    const newOrder = filters.sort === newSort && filters.order === 'desc' ? 'asc' : 'desc';
    setFilters(prev => ({ ...prev, sort: newSort, order: newOrder, page: 1 }));
    loadData(1);
  };

  // Effects
  useEffect(() => {
    if (projectId) {
      loadStatus();
    }
  }, [projectId]);

  useEffect(() => {
    console.log('[AnalyticsTab] Data loading effect triggered:', {
      connected: status.connected,
      serviceEnabled: status.serviceEnabled,
      dataPoints: status.dataPoints
    });
    
    if (status.connected && status.serviceEnabled) {
      // Always try to load data when service is enabled
      // This ensures data is refetched when switching tabs
      console.log('[AnalyticsTab] Loading performance data...');
      loadData(1);
    } else {
      console.log('[AnalyticsTab] Skipping data load - service not enabled');
    }
  }, [status.connected, status.serviceEnabled]);

  // Loading skeleton
  if (status.loading) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-4 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </Card>
      </div>
    );
  }

  // Error state
  if (status.error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-red-600">
          <ErrorIcon className="h-5 w-5" />
          <div>
            <h3 className="font-medium">Connection Error</h3>
            <p className="text-sm text-red-600">{status.error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadStatus}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  // Not connected state
  if (!status.connected) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Google Analytics Not Connected</h3>
          <p className="text-gray-600 mb-4">
            Connect your Google account to access Analytics data
          </p>
          <Button onClick={() => window.location.href = `/projects/${projectId}/google-visibility`}>
            Connect Google Account
          </Button>
        </div>
      </Card>
    );
  }

  // Property selection state
  if (!status.serviceEnabled || !status.analyticsPropertyId) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium">Select Analytics Property</h3>
              <p className="text-sm text-gray-600">
                Choose a Google Analytics property to sync data from
              </p>
            </div>
          </div>

          {!propertyState.showSelector ? (
            <Button onClick={loadProperties} disabled={propertyState.loading}>
              {propertyState.loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Browse Properties
            </Button>
          ) : (
            <div className="space-y-3">
              {propertyState.loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : propertyState.error ? (
                <div className="text-red-600 text-sm">
                  Error: {propertyState.error}
                </div>
              ) : propertyState.properties.length === 0 ? (
                <div className="text-gray-600 text-sm">
                  No Analytics properties found. Make sure you have access to at least one GA4 property.
                </div>
              ) : (
                <div className="space-y-2">
                  {propertyState.properties.map((property) => (
                    <div
                      key={property.propertyId}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => selectProperty(property.propertyId)}
                    >
                      <div className="font-medium">{property.displayName}</div>
                      <div className="text-sm text-gray-600">
                        Property ID: {property.propertyId}
                      </div>
                      {property.websiteUrl && (
                        <div className="text-sm text-gray-500">
                          {property.websiteUrl}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => setPropertyState(prev => ({ ...prev, showSelector: false }))}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status and sync controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-medium">Analytics Connected</h3>
              <p className="text-sm text-gray-600">
                {status.googleEmail} • Property: {status.analyticsPropertyId}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {status.lastSyncAt && (
              <Badge variant="outline">
                Last sync: {new Date(status.lastSyncAt).toLocaleDateString()}
              </Badge>
            )}
            
            <Button
              onClick={handleSync}
              disabled={syncState.syncing}
              size="sm"
            >
              {syncState.syncing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Data
            </Button>
          </div>
        </div>

        {syncState.error && (
          <div className="flex items-center gap-3 text-red-600 text-sm">
            <ErrorIcon className="h-4 w-4" />
            {syncState.error}
          </div>
        )}

        {status.dataPoints > 0 && (
          <div className="text-sm text-gray-600">
            {status.dataPoints} data points available
          </div>
        )}
      </Card>

      {/* Data loading state */}
      {dataState.loading && (
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      )}

      {/* Data error state */}
      {dataState.error && (
        <Card className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <ErrorIcon className="h-5 w-5" />
            <div>
              <h3 className="font-medium">Data Loading Error</h3>
              <p className="text-sm text-red-600">{dataState.error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => loadData(1)}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Data table */}
      {!dataState.loading && !dataState.error && dataState.data.length > 0 && Array.isArray(dataState.data) && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Analytics Performance Data</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Page {dataState.pagination.page} of {dataState.pagination.pages}</span>
              <span>{dataState.pagination.total} total pages</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th 
                    className="text-left py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSortChange('pagePath')}
                  >
                    Page Path
                    {filters.sort === 'pagePath' && (
                      <span className="ml-1">{filters.order === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th 
                    className="text-right py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSortChange('sessions')}
                  >
                    Sessions
                    {filters.sort === 'sessions' && (
                      <span className="ml-1">{filters.order === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th 
                    className="text-right py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSortChange('activeUsers')}
                  >
                    Active Users
                    {filters.sort === 'activeUsers' && (
                      <span className="ml-1">{filters.order === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th 
                    className="text-right py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSortChange('pageViews')}
                  >
                    Page Views
                    {filters.sort === 'pageViews' && (
                      <span className="ml-1">{filters.order === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th 
                    className="text-right py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSortChange('engagementRate')}
                  >
                    Engagement Rate
                    {filters.sort === 'engagementRate' && (
                      <span className="ml-1">{filters.order === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {dataState.data.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{item.pagePath || ''}</td>
                    <td className="text-right py-2 px-4">{(item.sessions || 0).toLocaleString()}</td>
                    <td className="text-right py-2 px-4">{(item.activeUsers || 0).toLocaleString()}</td>
                    <td className="text-right py-2 px-4">{(item.pageViews || 0).toLocaleString()}</td>
                    <td className="text-right py-2 px-4">{((item.engagementRate || 0) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {dataState.pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(dataState.pagination.page - 1)}
                disabled={dataState.pagination.page === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {dataState.pagination.page} of {dataState.pagination.pages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(dataState.pagination.page + 1)}
                disabled={dataState.pagination.page === dataState.pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* No data state */}
      {!dataState.loading && !dataState.error && dataState.data.length === 0 && (
        <Card className="p-6">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
            <p className="text-gray-600 mb-4">
              {status.lastSyncAt 
                ? 'No data available for the selected date range'
                : 'Sync your Analytics data to see performance metrics'
              }
            </p>
            {!status.lastSyncAt && (
              <Button onClick={handleSync} disabled={syncState.syncing}>
                {syncState.syncing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Data Now
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
