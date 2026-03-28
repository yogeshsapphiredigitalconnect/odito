"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ScreenshotPreviewModal from '@/components/ScreenshotPreviewModal';

const PageDetailsContent = ({ projectId, pageUrl }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [issuesData, setIssuesData] = useState(null);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState('Analysis');
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);

  useEffect(() => {
    const loadIssuesData = async () => {
      if (!projectId || !pageUrl) return;
      
      console.log("🔍 Sending projectId:", projectId, "pageUrl:", pageUrl);
      
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
  }, [projectId, pageUrl]);

  const tabs = ['Analysis', 'Keywords', 'Backlinks', 'Elements'];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      case 'notice': return 'info';
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

  return (
    <div className="flex-1 p-6 lg:px-10 lg:py-8 max-w-[1600px] mx-auto w-full">
      {/* Breadcrumbs & Meta */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-wrap gap-2 text-sm">
          <a className="text-gray-500 hover:text-white transition-colors" href="#">Projects</a>
          <span className="text-gray-600">/</span>
          <a className="text-gray-500 hover:text-white transition-colors" href="#">Sapphire Digital</a>
          <span className="text-gray-600">/</span>
          <span className="text-blue-400 font-medium bg-blue-400/10 px-2 py-0.5 rounded text-xs border border-blue-400/20 flex items-center">PAGE DETAILS</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex flex-col gap-3 max-w-4xl">
            <h1 className="text-white text-3xl font-bold leading-tight tracking-tight">
              {issuesData?.page_data?.title || 'Loading page title...'}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-mono text-slate-400">
              <a className="hover:text-blue-400 transition-colors flex items-center gap-1" href={issuesData?.page_url} target="_blank" rel="noopener noreferrer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {issuesData?.page_url || pageUrl}
              </a>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20 text-xs font-bold">
                {issuesData?.page_data?.status_code || issuesData?.page_metadata?.http_status_code || '200'} OK
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20 text-xs font-bold">Index</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span className="text-gray-300 bg-gray-700/50 px-2 py-0.5 rounded border border-gray-600 text-xs">Follow</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span className="text-gray-300">{issuesData?.page_data?.language?.toUpperCase() || 'EN-US'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 transition-all text-sm font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-analyze
            </button>
            <button 
              onClick={() => router.push(`/projects/${projectId}?tab=projectsubpages`)}
              className="flex items-center justify-center w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 transition-all text-sm font-medium"
              title="Close and go to project subpages"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {/* Score Card */}
        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Overall Score</h3>
          <div className="flex items-center gap-4">
            <div className="relative size-20">
              <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
                <path className="text-gray-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                <path className="text-blue-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${(issuesData?.page_score || 0)}, 100`} strokeWidth="3"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-bold text-white">{Math.round(issuesData?.page_score || 0)}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">{(issuesData?.page_score || 0) >= 80 ? 'Good' : (issuesData?.page_score || 0) >= 60 ? 'Fair' : 'Poor'}</span>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
                +4.2% vs last week
              </span>
            </div>
          </div>
        </div>

        {/* Issues Summary */}
        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Issues Breakdown</h3>
            <span className="bg-gray-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">{issuesData?.issues?.length || 0} Total</span>
          </div>
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-300"><div className="size-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div> Critical</span>
              <span className="font-mono text-white">{issuesData?.issues?.filter(i => i.severity === 'critical' || i.severity === 'high').length || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-300"><div className="size-2 rounded-full bg-yellow-500"></div> Warnings</span>
              <span className="font-mono text-white">{issuesData?.issues?.filter(i => i.severity === 'medium').length || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-300"><div className="size-2 rounded-full bg-blue-500"></div> Notices</span>
              <span className="font-mono text-white">{issuesData?.issues?.filter(i => i.severity === 'low' || i.severity === 'notice').length || 0}</span>
            </div>
          </div>
          <div className="w-full h-1.5 flex rounded-full overflow-hidden mt-3">
            <div className="bg-red-500 w-[20%]"></div>
            <div className="bg-yellow-500 w-[35%]"></div>
            <div className="bg-blue-500 w-[45%]"></div>
          </div>
        </div>

        {/* Vitals Grid */}
        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 flex flex-col justify-between">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Page Vitals</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-600/50">
              <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Response Time</p>
              <p className="text-white font-mono font-medium">
                {issuesData?.page_data?.response_time || issuesData?.page_metadata?.response_time_ms ? 
                  `${Math.round(issuesData.page_data?.response_time || issuesData.page_metadata?.response_time_ms / 1000)}ms` : 
                  'N/A'
                }
              </p>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-600/50">
              <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Word Count</p>
              <p className="text-white font-mono font-medium">
                {issuesData?.page_data?.word_count?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-600/50">
              <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Page Size</p>
              <p className="text-white font-mono font-medium">
                {issuesData?.page_data?.size ? 
                  `${(issuesData.page_data.size / 1024 / 1024).toFixed(1)} MB` : 
                  'N/A'
                }
              </p>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-600/50">
              <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Int. Links</p>
              <p className="text-white font-mono font-medium">{issuesData?.page_data?.internal_links || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Snapshot */}
        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 relative overflow-hidden flex flex-col justify-between group cursor-pointer">
          <div className="absolute inset-0 bg-cover bg-top opacity-40 group-hover:opacity-60 transition-all duration-500 group-hover:scale-105" 
               style={{backgroundImage: issuesData?.page_screenshot?.screenshot_path ? `url("${issuesData.page_screenshot.screenshot_path}")` : 'none'}}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-800/80 to-transparent"></div>
          <div className="relative z-10 flex justify-between items-start">
            <h3 className="text-gray-300 text-xs font-bold uppercase tracking-wider">Snapshot</h3>
            <span className="bg-black/50 backdrop-blur-sm text-white p-1 rounded-md border border-white/10 hover:bg-black/70 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
          <div className="relative z-10 mt-auto">
            {issuesData?.page_screenshot?.screenshot_path ? (
              <button 
                onClick={() => setIsScreenshotModalOpen(true)}
                className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-lg text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                View Full Snapshot
              </button>
            ) : (
              <div className="w-full py-2 px-3 bg-white/5 border border-white/5 rounded-lg text-gray-400 text-xs text-center">
                Screenshots disabled for performance
              </div>
            )}
          </div>
        </div>

        {/* Screenshot Modal */}
        <ScreenshotPreviewModal 
          isOpen={isScreenshotModalOpen}
          onClose={() => setIsScreenshotModalOpen(false)}
          screenshotPath={issuesData?.page_screenshot?.screenshot_path || null}
        />
      </div>
      {/* Sticky Tabs */}
      <div className="sticky top-[73px] z-40 mb-6 -mx-2 px-2 pb-2 pt-2 bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
        <nav className="flex gap-6 overflow-x-auto">
          <button className="text-white border-b-2 border-blue-500 pb-3 px-1 text-sm font-bold flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            Analysis
            <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{issuesData?.issues?.length || 0}</span>
          </button>
          <button className="text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-600 pb-3 px-1 text-sm font-medium transition-colors">
            Keywords
          </button>
          <button className="text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-600 pb-3 px-1 text-sm font-medium transition-colors">
            Backlinks
          </button>
          <button className="text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-600 pb-3 px-1 text-sm font-medium transition-colors">
            Structure
          </button>
          <button className="text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-600 pb-3 px-1 text-sm font-medium transition-colors">
            Speed
          </button>
        </nav>
      </div>

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
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {issuesData?.issues?.map((issue) => (
            <div key={issue.id} className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
              {/* Header */}
              <div 
                className="p-5 flex items-center justify-between border-b border-gray-700 bg-gray-900/30 cursor-pointer"
                onClick={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
              >
                <div className="flex items-center gap-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedId === issue.id ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                  </svg>
                  <div className={`size-3 rounded-full ${
                    issue.severity === 'critical' || issue.severity === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                    issue.severity === 'medium' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                  }`}></div>
                  <h3 className="text-white font-bold text-lg">{issue.issue_message}</h3>
                  <span className="bg-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded border border-gray-600 font-mono">
                    {issue.category}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 font-mono">ID: {issue.rule_id || issue.id}</span>
                  <span className={`text-xs font-bold ${
                    issue.severity === 'critical' || issue.severity === 'high' ? 'text-red-500 bg-red-500/10 border-red-500/20' :
                    issue.severity === 'medium' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' :
                    'text-blue-500 bg-blue-500/10 border-blue-500/20'
                  } px-2 py-1 rounded border`}>
                    {issue.severity?.toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* Expanded Body */}
              {expandedId === issue.id && (
                <div className="p-6 bg-gray-900">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Details & AI Fix */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                      {/* Status Comparison */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                          <p className="text-xs text-red-500 font-bold uppercase mb-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                            </svg> Detected
                          </p>
                          <p className="text-gray-300 font-medium">{issue.detected_value || 'Issue detected'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                          <p className="text-xs text-green-500 font-bold uppercase mb-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg> Expected
                          </p>
                          <p className="text-gray-300 font-medium">{issue.expected_value || 'Fix required'}</p>
                        </div>
                      </div>
                      
                      {/* AI Suggestion Box */}
                      {issue.aiSuggestion && (
                        <div className="relative p-1 rounded-xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30">
                          <div className="bg-gray-800 rounded-[10px] p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                            <div className="flex items-start gap-4 relative z-10">
                              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM12 14a1 1 0 00-.707.293l-.707.707a1 1 0 101.414 1.414l.707-.707A1 1 0 0012 14zM16.95 11.536a1 1 0 10-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707z"/>
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-bold mb-2">Odito AI Fix Suggestion</h4>
                                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                  {issue.aiSuggestion}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Right: Metadata & Actions */}
                    <div className="flex flex-col gap-6">
                      <div className="p-5 rounded-xl bg-gray-800 border border-gray-700">
                        <h4 className="text-white text-sm font-bold mb-4 border-b border-gray-700 pb-2">Issue Metadata</h4>
                        <div className="flex flex-col gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">First Detected</span>
                            <span className="text-white">{formatDate(issue.created_at)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Impact Score</span>
                            <span className={`font-bold ${
                              issue.severity === 'critical' || issue.severity === 'high' ? 'text-red-500' :
                              issue.severity === 'medium' ? 'text-yellow-500' :
                              'text-blue-500'
                            }`}>
                              {issue.severity === 'critical' || issue.severity === 'high' ? 'High (8/10)' :
                               issue.severity === 'medium' ? 'Medium (5/10)' : 'Low (3/10)'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Category</span>
                            <span className="text-white">{issue.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Difficulty</span>
                            <span className="text-yellow-500 font-bold">Medium</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          Mark as Fixed
                        </button>
                        <button className="w-full py-3 bg-transparent hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-600 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          View Documentation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Screenshot Modal */}
      <ScreenshotPreviewModal 
        isOpen={isScreenshotModalOpen}
        onClose={() => setIsScreenshotModalOpen(false)}
        screenshotPath={issuesData?.page_screenshot?.screenshot_path || null}
      />
    </div>
  );
};

export default PageDetailsContent;
