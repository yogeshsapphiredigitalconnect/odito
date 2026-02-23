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
  Building2,
  MapPin,
  Phone,
  Globe,
  Star,
  Eye,
  MousePointer,
  Navigation
} from 'lucide-react'
import apiService from '@/lib/apiService'

/**
 * Business Profile Tab Component
 * 
 * Handles Google My Business data sync and display
 * 
 * Features:
 * - Account and location selection before sync
 * - Manual sync with loading states
 * - Status display
 * - Data table with pagination
 * - Comprehensive error handling
 */

export default function BusinessProfileTab({ projectId }) {
  console.log('BusinessProfileTab mounted with projectId:', projectId);
  
  // State management
  const [status, setStatus] = useState({
    connected: false,
    serviceEnabled: false,
    businessAccountId: null,
    businessLocationId: null,
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
    sort: 'viewsSearch',
    order: 'desc'
  });

  // Account selection state
  const [accountState, setAccountState] = useState({
    accounts: [],
    loading: false,
    error: null,
    showSelector: false,
    selectedAccount: null,
    selectedLocation: null
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
      
      const response = await apiCall(`/projects/${projectId}/business-profile/status`);
      
      setStatus({
        connected: response.connected,
        serviceEnabled: response.serviceEnabled,
        businessAccountId: response.businessAccountId,
        businessLocationId: response.businessLocationId,
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
      
      const response = await apiCall(`/projects/${projectId}/business-profile/data?${params}`);
      
      setDataState({
        data: Array.isArray(response.data) ? response.data : [],  // Defensive array check
        loading: false,
        error: null,
        pagination: {
          page: response.pagination?.page ?? 1,                    // Defensive pagination
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

  // Load available accounts
  const loadAccounts = async () => {
    try {
      setAccountState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiCall(`/projects/${projectId}/business-profile/accounts`);
      
      setAccountState({
        accounts: response.accounts || [],
        loading: false,
        error: null,
        showSelector: true,
        selectedAccount: null,
        selectedLocation: null
      });

    } catch (error) {
      console.error('[BusinessProfileTab] Failed to load accounts:', error);
      
      // ✅ Handle 429 gracefully - don't treat as fatal
      if (error.status === 429) {
        setAccountState(prev => ({
          ...prev,
          loading: false,
          error: 'Google rate limit reached. Please wait 1 minute and retry.'
        }));
        return;
      }
      
      setAccountState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load accounts'
      }));
    }
  };

  // Select business profile account and location
  const selectAccount = async (accountId, locationId) => {
    try {
      setAccountState(prev => ({ ...prev, loading: true, error: null }));
      
      await apiCall(`/projects/${projectId}/business-profile/select-account`, {
        method: 'POST',
        body: JSON.stringify({ accountId, locationId })
      });
      
      // Reload status to get updated account info
      await loadStatus();
      
      setAccountState({
        accounts: [],
        loading: false,
        error: null,
        showSelector: false,
        selectedAccount: null,
        selectedLocation: null
      });

    } catch (error) {
      setAccountState(prev => ({
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
      
      const response = await apiCall(`/projects/${projectId}/business-profile/sync`, {
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

  // ✅ REMOVED: Auto-load data on mount - only load when service is enabled AND user explicitly requests
  // Business Profile APIs must be user-triggered, not lifecycle-triggered

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
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Google Business Profile Not Connected</h3>
          <p className="text-gray-600 mb-4">
            Connect your Google account to access Business Profile data
          </p>
          <Button onClick={() => window.location.href = `/projects/${projectId}/google-visibility`}>
            Connect Google Account
          </Button>
        </div>
      </Card>
    );
  }

  // Account selection state
  if (!status.serviceEnabled || !status.businessAccountId || !status.businessLocationId) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium">Select Business Profile Account</h3>
              <p className="text-sm text-gray-600">
                Choose a Google My Business account and location to sync data from
              </p>
            </div>
          </div>

          {!accountState.showSelector ? (
            <Button onClick={loadAccounts} disabled={accountState.loading}>
              {accountState.loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Browse Business Accounts
            </Button>
          ) : (
            <div className="space-y-3">
              {accountState.loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : accountState.error ? (
                <div className="text-red-600 text-sm">
                  Error: {accountState.error}
                </div>
              ) : accountState.accounts.length === 0 ? (
                <div className="text-gray-600 text-sm">
                  No Business Profile accounts found. Make sure you have access to at least one Google My Business account.
                </div>
              ) : (
                <div className="space-y-4">
                  {accountState.accounts.map((account) => (
                    <div key={account.accountId} className="border rounded-lg p-4">
                      <div className="font-medium mb-2">{account.accountName}</div>
                      {account.locations.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">Select a location:</div>
                          {account.locations.map((location) => (
                            <div
                              key={location.locationId}
                              className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => selectAccount(account.accountId, location.locationId)}
                            >
                              <div className="font-medium">{location.locationName}</div>
                              <div className="text-sm text-gray-600">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {location.address}
                              </div>
                              {location.category && (
                                <div className="text-sm text-gray-500">
                                  Category: {location.category}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No locations found for this account</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => setAccountState(prev => ({ ...prev, showSelector: false }))}
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
              <h3 className="font-medium">Business Profile Connected</h3>
              <p className="text-sm text-gray-600">
                {status.googleEmail} • Account: {status.businessAccountId}
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
            <h3 className="text-lg font-medium mb-2">Business Profile Performance Data</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Page {dataState.pagination.page} of {dataState.pagination.pages}</span>
              <span>{dataState.pagination.total} total records</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th 
                    className="text-left py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSortChange('viewsSearch')}
                  >
                    <Eye className="h-4 w-4 inline mr-1" />
                    Search Views
                    {filters.sort === 'viewsSearch' && (
                      <span className="ml-1">{filters.order === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th 
                    className="text-left py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSortChange('viewsMaps')}
                  >
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Maps Views
                    {filters.sort === 'viewsMaps' && (
                      <span className="ml-1">{filters.order === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th 
                    className="text-left py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSortChange('actionsWebsite')}
                  >
                    <Globe className="h-4 w-4 inline mr-1" />
                    Website Clicks
                    {filters.sort === 'actionsWebsite' && (
                      <span className="ml-1">{filters.order === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th 
                    className="text-left py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSortChange('actionsCalls')}
                  >
                    <Phone className="h-4 w-4 inline mr-1" />
                    Call Clicks
                    {filters.sort === 'actionsCalls' && (
                      <span className="ml-1">{filters.order === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th 
                    className="text-left py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSortChange('actionsDirections')}
                  >
                    <Navigation className="h-4 w-4 inline mr-1" />
                    Directions Clicks
                    {filters.sort === 'actionsDirections' && (
                      <span className="ml-1">{filters.order === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th 
                    className="text-left py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSortChange('reviewsCount')}
                  >
                    <Star className="h-4 w-4 inline mr-1" />
                    Reviews
                    {filters.sort === 'reviewsCount' && (
                      <span className="ml-1">{filters.order === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                  <th 
                    className="text-left py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSortChange('averageRating')}
                  >
                    Avg Rating
                    {filters.sort === 'averageRating' && (
                      <span className="ml-1">{filters.order === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {dataState.data.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{(item.viewsSearch || 0).toLocaleString()}</td>
                    <td className="py-2 px-4">{(item.viewsMaps || 0).toLocaleString()}</td>
                    <td className="py-2 px-4">{(item.actionsWebsite || 0).toLocaleString()}</td>
                    <td className="py-2 px-4">{(item.actionsCalls || 0).toLocaleString()}</td>
                    <td className="py-2 px-4">{(item.actionsDirections || 0).toLocaleString()}</td>
                    <td className="py-2 px-4">{(item.reviewsCount || 0).toLocaleString()}</td>
                    <td className="py-2 px-4">
                      {item.averageRating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          {item.averageRating.toFixed(1)}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
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
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Business Profile Data</h3>
            <p className="text-gray-600 mb-4">
              {status.lastSyncAt 
                ? 'No data available for the selected date range'
                : 'Sync your Business Profile data to see performance metrics'
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
