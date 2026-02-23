"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, X, ExternalLink } from 'lucide-react';

const PageDetailsModal = ({ isOpen, toggle, projectId, pageUrl }) => {
  const [loading, setLoading] = useState(false);
  const [issuesData, setIssuesData] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Analysis');

  useEffect(() => {
    const loadIssuesData = async () => {
      if (!isOpen || !projectId || !pageUrl) return;
      
      setLoading(true);
      setError('');
      try {
        // Use the existing API service from our codebase
        const apiService = (await import('@/lib/apiService')).default;
        const response = await apiService.getPageIssues(projectId, pageUrl);
        
        if (response?.success) {
          setIssuesData(response.data);
          console.log('📊 ISSUES DATA LOADED:', response.data);
          console.log('🖼️ PAGE SCREENSHOT:', response.data?.page_screenshot);
        } else {
          setError(response?.message || 'Failed to load page details');
        }
      } catch (error) {
        console.error('Error loading page details:', error);
        setError(error.message || 'Failed to load page details');
      } finally {
        setLoading(false);
      }
    };

    loadIssuesData();
  }, [isOpen, projectId, pageUrl]);

  const tabs = ['Analysis', 'Keywords', 'Backlinks', 'Elements'];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Tech & Meta':
      case 'Technical':
        return '#5BA3E0';
      case 'Performance':
        return '#9C27B0';
      case 'Accessibility':
        return '#FF6B6B';
      case 'Content':
        return '#FF9800';
      case 'Schema':
        return '#7C4DFF';
      case 'International':
        return '#00BCD4';
      case 'Tracking':
        return '#607D8B';
      case 'Social':
        return '#E91E63';
      default:
        return '#6C757D';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusCodeColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return 'default';
    if (statusCode >= 300 && statusCode < 400) return 'secondary';
    if (statusCode >= 400 && statusCode < 500) return 'secondary';
    if (statusCode >= 500) return 'destructive';
    return 'secondary';
  };

  const getPreviewValue = (issue, pageDataPreview) => {
    if (!issue.data_key || !pageDataPreview) return null;
    
    let value = pageDataPreview[issue.data_key];
    
    // Apply data_path filtering if specified (generic filtering only)
    if (issue.data_path && value) {
      if (value[issue.data_path]) {
        value = value[issue.data_path];
      }
    }
    
    return value;
  };

  const formatPreviewValue = (value) => {
    if (value === null || value === undefined) return 'Not available';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      return value.slice(0, 3).map(item => 
        typeof item === 'object' ? JSON.stringify(item) : String(item)
      ).join(', ');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const toggleExpanded = () => {
    // This function is no longer needed
  };

  const renderIssue = (issue, index) => (
    <div key={issue.id} className="flex items-start p-3 border-b">
      {/* Issue Index */}
      <div className="mr-3 text-muted-foreground text-sm" style={{ minWidth: '30px' }}>
        #{index + 1}
      </div>

      {/* Issue Content */}
      <div className="flex-grow">
        {/* Issue Message */}
        <div className="font-medium mb-2">
          {issue.issue_message}
        </div>

        {/* Issue Details */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <div className="text-muted-foreground text-sm mb-1">
              Rule ID: <span className="font-medium">{issue.rule_id || 'N/A'}</span>
            </div>
            <div className="text-muted-foreground text-sm mb-1">
              Issue Code: <span className="font-medium">{issue.issue_code || 'N/A'}</span>
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm mb-1">
              Detected: {formatDate(issue.created_at)}
            </div>
          </div>
        </div>

        {/* Value Comparison */}
        {(issue.detected_value || issue.expected_value) && (
          <div className="mb-2 p-2 bg-muted rounded">
            {issue.detected_value && (
              <div className="text-muted-foreground text-sm mb-1">
                <span className="text-destructive">Detected:</span> {issue.detected_value}
              </div>
            )}
            {issue.expected_value && (
              <div className="text-muted-foreground text-sm">
                <span className="text-green-600">Expected:</span> {issue.expected_value}
              </div>
            )}
          </div>
        )}

        {/* Preview Content - Shows actual value from seo_page_data */}
        {issue.data_key && issuesData?.page_data_preview && (
          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <div className="text-muted-foreground text-sm mb-1">
              <span className="text-blue-600">
                Actual Value:
              </span>
            </div>
            <div className="text-sm text-foreground">
              {formatPreviewValue(getPreviewValue(issue, issuesData.page_data_preview))}
            </div>
          </div>
        )}

        {/* Category and Severity Badges */}
        <div className="flex gap-2 mt-2">
          <Badge 
            variant="outline"
            style={{ 
              backgroundColor: getCategoryColor(issue.category) + '20',
              color: getCategoryColor(issue.category),
              borderColor: getCategoryColor(issue.category) + '40'
            }}
          >
            {issue.category}
          </Badge>
          <Badge variant={getSeverityColor(issue.severity)}>
            {issue.severity?.toUpperCase()}
          </Badge>
        </div>
      </div>
    </div>
  );

  // Simple ScreenshotViewer component placeholder
  const ScreenshotViewer = ({ screenshotData, maxHeight }) => {
    // Debug logging
    console.log('🖼️ ScreenshotViewer received:', screenshotData);
    
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    if (!screenshotData?.screenshot_path) {
      console.log('❌ No screenshot_path found in screenshotData');
      return (
        <div className="w-full h-[500px] rounded-xl border bg-muted overflow-hidden flex items-center justify-center text-sm text-muted-foreground">
          <div className="text-center">
            <div className="text-xs mb-1">Page Screenshot</div>
            <div className="text-xs font-mono truncate max-w-[180px]">Not available</div>
          </div>
        </div>
      );
    }

    if (isFullscreen) {
      // Full-screen scrollable viewer
      return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-8">
          <div className="bg-card rounded-lg max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Page Screenshot</h3>
              <button 
                onClick={() => setIsFullscreen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            {/* Scrollable screenshot */}
            <div className="flex-1 overflow-auto p-4">
              <img 
                src={screenshotData.screenshot_path} 
                alt="Page Screenshot"
                className="max-w-full h-auto"
                style={{ 
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Scroll to view full page</span>
                <button 
                  onClick={() => setIsFullscreen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Simple card-style preview matching Image 1
    return (
      <div className="w-full h-[280px] rounded-lg border border-gray-200 overflow-hidden bg-card shadow-sm relative">
        <img 
          src={screenshotData.screenshot_path} 
          alt="Page Screenshot"
          className="w-full h-full object-cover object-top"
          style={{ 
            objectPosition: 'top center',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
            console.log('❌ Screenshot failed to load:', screenshotData.screenshot_path);
          }}
        />
        
        {/* Fallback state */}
        <div className="w-full h-full flex items-center justify-center text-sm text-gray-500" style={{ display: 'none' }}>
          <div className="text-center">
            <div className="text-xs mb-1">Page Screenshot</div>
            <div className="text-xs font-mono truncate max-w-[180px]">Failed to load</div>
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-card/90 backdrop-blur text-xs py-1 px-2 h-auto"
            onClick={() => setIsFullscreen(true)}
          >
            Show page
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogContent className="max-w-[1200px] max-h-[85vh] p-0 overflow-hidden bg-card rounded-lg shadow-2xl flex flex-col">
        {/* Hidden accessibility elements */}
        <DialogTitle className="sr-only">Page Details</DialogTitle>
        <DialogDescription className="sr-only">
          Detailed information about the page including screenshot, metadata, and SEO issues
        </DialogDescription>
        
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 flex-shrink-0 pr-12">
          <h1 className="text-base font-semibold text-gray-900">PAGE DETAILS</h1>
          <div className="bg-gray-50 px-3 py-1.5 rounded border border-gray-300 max-w-xs">
            <span className="text-xs text-gray-600 font-mono truncate block">
              {issuesData?.page_url || pageUrl || 'Loading...'}
            </span>
          </div>
        </div>

        {/* Page Title and Tabs - Fixed */}
        <div className="px-6 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">
              {issuesData?.page_data?.title || 'Loading page title...'}
            </h2>
            <div className="flex items-center space-x-2">
              
              <HelpCircle className="w-3 h-3 text-gray-400" />
            </div>
          </div>
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-sm text-gray-600">Loading page details...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-red-600 text-center">
                  <div className="text-sm font-medium mb-2">Error</div>
                  <div className="text-xs">{error}</div>
                  <Button variant="default" onClick={toggle} className="mt-3 text-sm">
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Page Details Section */}
                <div className="grid grid-cols-[320px_1fr] gap-8">
                  {/* Left Column - Preview Card */}
                  <div className="space-y-3">
                    {/* Page Score Section */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Page score</h3>
                        <div className="flex items-center mt-1">
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 transform -rotate-90">
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="#E5E7EB"
                                strokeWidth="4"
                                fill="none"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke={issuesData?.page_score >= 80 ? "#10B981" : issuesData?.page_score >= 60 ? "#F59E0B" : "#EF4444"}
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 20 * (issuesData?.page_score || 0) / 100} ${2 * Math.PI * 20}`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-900">{Math.round(issuesData?.page_score || 0)}</span>
                            </div>
                          </div>
                          <span className={`ml-2 text-sm font-semibold ${issuesData?.page_score >= 80 ? "text-green-600" : issuesData?.page_score >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                            +{Math.round(issuesData?.page_score || 0)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Issues */}
                      <div className="text-right">
                        <h3 className="text-sm font-semibold text-gray-900">Issues</h3>
                        <div className="text-xl font-bold text-red-600 mt-0.5">
                          {issuesData?.summary?.totalIssues || 0}
                        </div>
                        <Button variant="link" className="text-blue-600 p-0 h-auto text-xs">
                          Upgrade now
                        </Button>
                      </div>
                    </div>

                    {/* HTML Page Preview Card */}
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">HTML Page</h3>
                        <HelpCircle className="w-3 h-3 text-gray-400 ml-1" />
                      </div>
                      <div className="relative">
                        <ScreenshotViewer 
                          screenshotData={issuesData?.page_screenshot}
                          maxHeight={280}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Page Details */}
                  <div className="space-y-3">
                    {/* Page Details */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Page Details</h3>
                      
                      {/* Page Title */}
                      <div className="mb-3">
                        <div className="text-xs text-gray-600 mb-1">Page title</div>
                        <div className="text-sm font-medium text-gray-900 leading-tight">
                          {issuesData?.page_data?.title || 'N/A'}
                        </div>
                      </div>

                      {/* Meta Description */}
                      <div className="mb-3">
                        <div className="text-xs text-gray-600 mb-1">Meta description</div>
                        <div className="text-xs text-gray-700 leading-relaxed">
                          {issuesData?.page_data?.meta_description || 'N/A'}
                        </div>
                      </div>

                      {/* URL */}
                      <div className="mb-4">
                        <div className="text-xs text-gray-600 mb-1">URL</div>
                        <a 
                          href={issuesData?.page_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs underline flex items-center"
                        >
                          {issuesData?.page_url}
                          <ExternalLink className="w-2.5 h-2.5 ml-1" />
                        </a>
                      </div>

                      {/* Status and Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Left Column - Badges */}
                        <div className="space-y-2">
                          {/* Status Code */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Status code:</span>
                            <Badge 
                              variant={getStatusCodeColor(
                                issuesData?.page_data?.status_code || 
                                issuesData?.page_metadata?.http_status_code
                              )}
                              className="bg-green-100 text-green-800 border-green-200 text-xs"
                            >
                              {issuesData?.page_data?.status_code || issuesData?.page_metadata?.http_status_code || 'N/A'}
                            </Badge>
                          </div>

                          {/* Page Status */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Page status:</span>
                            <div className="flex space-x-1">
                              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                Follow
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                Index
                              </Badge>
                            </div>
                          </div>

                          {/* Language */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Language:</span>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                              {issuesData?.page_data?.language?.toUpperCase() || 'EN-US'}
                            </Badge>
                          </div>
                        </div>

                        {/* Right Column - Stats */}
                        <div className="space-y-2">
                          {/* Response Time */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Response time:</span>
                            <span className="text-xs font-medium text-gray-900">
                              {issuesData?.page_data?.response_time || issuesData?.page_metadata?.response_time_ms ? 
                                `${(issuesData.page_data?.response_time || issuesData.page_metadata?.response_time_ms / 1000).toFixed(2)} ms` : 
                                'N/A'
                              }
                            </span>
                          </div>

                          {/* File Size */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">File size:</span>
                            <span className="text-xs font-medium text-gray-900">
                              {issuesData?.page_data?.size ? 
                                `${(issuesData.page_data.size / 1024).toFixed(1)} kB` : 
                                'N/A'
                              }
                            </span>
                          </div>

                          {/* Word Count */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Word count:</span>
                            <span className="text-xs font-medium text-gray-900">
                              {issuesData?.page_data?.word_count ? 
                                issuesData.page_data.word_count.toLocaleString() : 
                                'N/A'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ISSUES Section - Below Page Details */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <h3 className="text-sm font-semibold text-gray-900">ISSUES</h3>
                    <HelpCircle className="w-3 h-3 text-gray-400 ml-1" />
                  </div>
                  
                  {/* Issues List */}
                  {issuesData?.issues && issuesData.issues.length > 0 ? (
                    <Card>
                      <CardContent className="p-0">
                        {issuesData.issues.map((issue, index) => renderIssue(issue, index))}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="text-sm text-gray-600">No issues found for this page.</div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PageDetailsModal;
