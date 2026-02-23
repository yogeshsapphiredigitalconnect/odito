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
  BarChart3
} from 'lucide-react'
import apiService from '@/lib/apiService'

/**
 * Search Console Tab Component
 * 
 * Handles Search Console data sync and display
 * 
 * Features:
 * - Manual sync with loading states
 * - Status display
 * - Data table with pagination
 * - Comprehensive error handling
 */

export default function SearchConsoleTab({ projectId }) {
  console.log('SearchConsoleTab mounted with projectId:', projectId);
  
  // State management
  const [status, setStatus] = useState({
    connected: false,
    service_enabled: false,
    last_sync_at: null,
    data_points: 0,
    google_email: '',
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
    sort: 'clicks',
    order: 'desc'
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
      
      const response = await apiCall(`/projects/${projectId}/search-console/status`);
      
      setStatus({
        connected: response.connected,
        service_enabled: response.service_enabled,
        last_sync_at: response.last_sync_at,
        data_points: response.dataPoints || 0,
        google_email: response.google_email || '',
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

      const response = await apiCall(`/projects/${projectId}/search-console/data?${params}`);
      
      setDataState({
        data: response.data || [],
        loading: false,
        error: null,
        pagination: response.pagination || {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0
        }
      });

      setFilters(prev => ({ ...prev, page }));

    } catch (error) {
      setDataState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  // Manual sync handler
  const handleSync = async () => {
    try {
      setSyncState({ syncing: true, error: null });
      
      const response = await apiCall(`/projects/${projectId}/search-console/sync`, {
        method: 'POST'
      });

      if (response.success) {
        // Show success message
        alert(`Synced ${response.syncedPages} pages successfully!`);
      }

      // Refresh status and load data
      await loadStatus();
      await loadData(1);

      setSyncState({ syncing: false, error: null });

    } catch (error) {
      setSyncState({ syncing: false, error: error.message });
      alert(`Sync failed: ${error.message}`);
    }
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= dataState.pagination.pages) {
      loadData(newPage);
    }
  };

  // Sort handler
  const handleSort = (field) => {
    const newOrder = filters.sort === field && filters.order === 'desc' ? 'asc' : 'desc';
    setFilters(prev => ({ ...prev, sort: field, order: newOrder, page: 1 }));
    loadData(1);
  };

  // Format utilities
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid date';
    }
  };

  const formatNumber = (num, decimals = 0) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatCtr = (ctr) => {
    if (ctr === null || ctr === undefined) return '0%';
    return `${(ctr * 100).toFixed(2)}%`;
  };

  const formatPosition = (position) => {
    if (position === null || position === undefined) return '0';
    return Number(position).toFixed(1);
  };

  // Initial load
  useEffect(() => {
    if (projectId) {
      loadStatus();
    }
  }, [projectId]);

  // Load data when status shows available data OR when service is enabled (for tab switching)
  useEffect(() => {
    console.log('[SearchConsoleTab] Data loading effect triggered:', {
      connected: status.connected,
      service_enabled: status.service_enabled,
      data_points: status.data_points,
      last_sync_at: status.last_sync_at
    });
    
    if (status.connected && status.service_enabled) {
      // Always try to load data when service is enabled
      // This ensures data is refetched when switching tabs
      console.log('[SearchConsoleTab] Loading performance data...');
      loadData(1);
    } else {
      console.log('[SearchConsoleTab] Skipping data load - service not enabled');
    }
  }, [status.connected, status.service_enabled]);

  // Loading skeleton
  if (status.loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (status.error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Connection Error</h3>
          <p className="text-red-600 text-sm">{status.error}</p>
          <button
            onClick={loadStatus}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!status.connected) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">Google Account Not Connected</h3>
              <p className="text-muted-foreground text-sm mt-1">Connect your Google account to access Search Console data</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Please connect your Google account in the Google Visibility settings to enable Search Console integration.
          </p>
        </div>
      </div>
    );
  }

  // Service not enabled - show banner but allow sync
  const showServiceNotEnabledBanner = !status.service_enabled;

  return (
    <div className="space-y-6">
      {/* Service Not Enabled Banner */}
      {showServiceNotEnabledBanner && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">Search Console Not Enabled</h3>
              <p className="text-muted-foreground text-sm mt-1">Sync your data to enable Search Console service</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Connected as: {status.google_email}
          </p>
        </div>
      )}
      {/* Status Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">Search Console Status</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Connected as: <span className="font-medium">{status.google_email}</span></p>
              <p>Last sync: <span className="font-medium">{formatDate(status.last_sync_at)}</span></p>
              <p>Data points: <span className="font-medium">{formatNumber(status.data_points)}</span></p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-3">
            <button
              onClick={handleSync}
              disabled={syncState.syncing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {syncState.syncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Sync Search Console Data</span>
                </>
              )}
            </button>
            
            {syncState.error && (
              <p className="text-sm text-red-600">{syncState.error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      {dataState.data.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-medium text-foreground">Performance Data</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {dataState.data.length} of {formatNumber(dataState.pagination.total)} pages
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('page_url')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Page URL</span>
                      {filters.sort === 'page_url' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d={filters.order === 'desc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('clicks')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Clicks</span>
                      {filters.sort === 'clicks' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d={filters.order === 'desc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('impressions')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Impressions</span>
                      {filters.sort === 'impressions' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d={filters.order === 'desc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('ctr')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>CTR</span>
                      {filters.sort === 'ctr' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d={filters.order === 'desc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('position')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Avg Position</span>
                      {filters.sort === 'position' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d={filters.order === 'desc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                        </svg>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {dataState.data.map((row, index) => (
                  <tr key={index} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground max-w-xs truncate">
                      <span title={row.page_url}>{row.page_url}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatNumber(row.clicks)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatNumber(row.impressions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatCtr(row.ctr)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatPosition(row.position)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {dataState.pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {dataState.pagination.page} of {dataState.pagination.pages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(dataState.pagination.page - 1)}
                    disabled={dataState.pagination.page === 1}
                    className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(dataState.pagination.page + 1)}
                    disabled={dataState.pagination.page === dataState.pagination.pages}
                    className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : dataState.loading ? (
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      ) : dataState.error ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <h3 className="text-destructive font-medium mb-2">Data Load Error</h3>
          <p className="text-destructive/80 text-sm mb-4">{dataState.error}</p>
          <button
            onClick={() => loadData(1)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Data Available</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {status.last_sync_at ? 'No Search Console data found for the selected period.' : 'Sync your Search Console data to see performance metrics.'}
          </p>
          {!status.last_sync_at && (
            <button
              onClick={handleSync}
              disabled={syncState.syncing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {syncState.syncing ? 'Syncing...' : 'Sync Data Now'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
