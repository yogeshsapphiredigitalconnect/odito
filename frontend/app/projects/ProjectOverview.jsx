"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import apiService from '@/lib/apiService';
import socketService from '@/lib/socketService';
import { useExportReport } from '@/hooks/useExportReport';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectAuditHeroCard from '@/components/ProjectAuditHeroCard';
import AuditProgressModal from '@/components/AuditProgressModal';
import ProjectSubpages from './ProjectSubpages';
import ProjectGoogleVisibility from './ProjectGoogleVisibility';
import { 
  ArrowLeft,
  Globe, 
  TrendingUp, 
  AlertTriangle,
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Eye,
  ExternalLink,
  Link,
  Search,
  Shield,
  FileText,
  Image,
  BarChart3,
  Building,
  Briefcase,
  MapPin,
  Play,
  Pencil,
  Settings,
  RefreshCw,
  FileDown
} from 'lucide-react';

export default function ProjectOverview({ projectId, onBack }) {
  const searchParams = useSearchParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    project_name: '',
    main_url: '',
    business_type: '',
    industry: '',
    location: '',
    description: ''
  });
  const [settingsForm, setSettingsForm] = useState({
    crawl_frequency: 'weekly',
    max_pages: 100,
    enable_notifications: true,
    auto_analyze: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isStartingAudit, setIsStartingAudit] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [auditStatusCheck, setAuditStatusCheck] = useState(null);
  
  // Issues state management
  const [issues, setIssues] = useState(null);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // View state for navigation
  const [activeView, setActiveView] = useState('overview');
  
  // Screenshot state
  const [screenshot, setScreenshot] = useState(null);
  
  // Audit Progress Modal State
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [auditUI, setAuditUI] = useState({
    jobId: null,
    stage: null,
    percentage: 0,
    message: "",
    isRunning: false
  });

  // Export functionality
  const { exportReport, loading: isExporting, error: exportError, clearError: clearExportError } = useExportReport();

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'subpages' || tab === 'projectsubpages') {
      setActiveView('subpages');
    } else if (tab === 'google-visibility') {
      setActiveView('google-visibility');
    } else if (tab === 'reports') {
      setActiveView('reports');
    } else {
      setActiveView('overview');
    }
  }, [searchParams]);

  // Function to update URL with tab parameter
  const updateTabInUrl = (tabValue) => {
    const url = new URL(window.location);
    if (tabValue === 'overview') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', tabValue);
    }
    window.history.replaceState({}, '', url);
  }

  // Function to handle tab changes
  const handleTabChange = (view) => {
    setActiveView(view);
    // Map activeView values to URL parameter values
    switch(view) {
      case 'subpages':
        updateTabInUrl('subpages');
        break;
      case 'google-visibility':
        updateTabInUrl('google-visibility');
        break;
      case 'reports':
        updateTabInUrl('reports');
        break;
      case 'overview':
      default:
        updateTabInUrl('overview');
        break;
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  // Polling should NOT interfere with modal visibility
  // Commented out to prevent modal auto-close
  /*
  useEffect(() => {
    const interval = setInterval(async () => {
      if (currentJobId && project?.crawl_status === 'running' && !isStartingAudit) {
        try {
          const statusResponse = await apiService.getAuditStatus(projectId);
          if (statusResponse.success) {
            const jobs = statusResponse.data;
            const hasActiveJobs = jobs.link_discovery?.pending > 0 || jobs.link_discovery?.processing > 0 ||
                                 jobs.page_scraping?.pending > 0 || jobs.page_scraping?.processing > 0;
            
            if (!hasActiveJobs) {
              console.warn('⚠️ No active jobs found, but status shows running - updating status');
              // Update project status to reflect reality
              await fetchProjectDetails();
              setAuditStatusCheck('No active jobs found - status updated');
            }
          }
        } catch (error) {
          console.error('Error checking audit status:', error);
        }
      }
    }, 10000); // Check every 10 seconds

    return () => {
      clearInterval(interval);
    };
  }, [currentJobId, project?.crawl_status]);
  */

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token).catch(error => {
        console.warn('Failed to connect to WebSocket:', error);
        // Don't block the UI if socket fails to connect
        // Audit functionality will still work via HTTP polling
      });
    }

    // 🔥 CRITICAL: Join PROJECT room (stable), not job room (ephemeral)
    if (projectId && socketService.isConnected()) {
      socketService.joinAudit(`project-${projectId}`);
      console.log(`📊 Joined PROJECT room for projectId: ${projectId}`);
    }

    // Set up socket event listeners
    const handleAuditStarted = (data) => {
      console.log('🚀 Audit started event received:', data);
      setCurrentJobId(data.job_id);
      
      // Set initial state from backend payload - modal will open via useEffect
      setAuditUI({
        jobId: data.job_id,
        stage: data.jobType || 'LINK_DISCOVERY',
        percentage: data.percentage || 0, // Use backend percentage directly
        message: data.message || 'Your website crawling has been started',
        isRunning: true
      });
    };

    const handleAuditCompleted = (data) => {
      console.log('🎯 Audit completed event received:', data);
      setCurrentJobId(null);
      
      // 🎯 BACKEND COMPLETION: Force percentage to 100, set isRunning false, close modal
      setAuditUI({
        jobId: null,
        stage: 'COMPLETED',
        percentage: 100, // Force to 100 regardless of backend payload
        message: 'Website audit completed successfully',
        isRunning: false
      });
      
      // Auto-close modal after showing completion briefly
      setTimeout(() => {
        setIsProgressModalOpen(false);
        // Refresh project data to show updated stats
        fetchProjectDetails();
        // Refetch issues after audit completion
        fetchProjectIssues();
      }, 2000);
    };

    const handleAuditError = (data) => {
      console.error('Audit error:', data);
      setCurrentJobId(null);
      setError(data.message || 'Audit failed');
      
      // Set error state
      setAuditUI(prev => ({
        ...prev,
        percentage: 0,
        stage: 'ERROR',
        message: data.message || 'Audit failed',
        isRunning: false
      }));
      
      // Close modal on error
      setIsProgressModalOpen(false);
    };

    const handleAuditProgress = (data) => {
      console.log('🔥 SOCKET PROGRESS:', data);
      
      // 🎯 BACKEND TRUTH: Render percentage exactly as received, no computation or mapping
      const backendPercentage = data.percentage;
      const currentStage = data.step || data.stage || 'UNKNOWN';
      
      // Direct rendering of backend percentage - no transformation
      setAuditUI({
        jobId: data.jobId || null,
        stage: currentStage,
        percentage: backendPercentage,
        message: data.message || 'Processing...',
        isRunning: true
      });
    };

    const handleAuditStageChanged = (data) => {
      console.log('🔄 STAGE CHANGED:', data);
      
      // Leave old job room and join new job room (keep project room)
      if (data.oldJobId) {
        socketService.leaveAudit(data.oldJobId);
      }
      if (data.newJobId) {
        socketService.joinAudit(data.newJobId);
      }
      
      // 🎯 STAGE UPDATE ONLY: Update stage and jobId, DO NOT reset or modify progress
      setAuditUI(prev => ({
        ...prev,
        jobId: data.newJobId || null,
        stage: data.to || 'UNKNOWN',
        message: 'Starting next stage...',
        isRunning: true
        // percentage: UNCHANGED - preserve current progress
      }));
      
      // Update current job ID
      setCurrentJobId(data.newJobId || null);
    };

    // Register event listeners
    socketService.onAuditStarted(handleAuditStarted);
    socketService.onAuditCompleted(handleAuditCompleted);
    socketService.onAuditError(handleAuditError);
    socketService.onAuditProgress(handleAuditProgress);
    socketService.onAuditStageChanged(handleAuditStageChanged);

    // Cleanup on unmount
    return () => {
      socketService.offAuditStarted(handleAuditStarted);
      socketService.offAuditCompleted(handleAuditCompleted);
      socketService.offAuditError(handleAuditError);
      socketService.offAuditProgress(handleAuditProgress);
      socketService.offAuditStageChanged(handleAuditStageChanged);
      
      // Leave current job room but stay in project room
      if (currentJobId) {
        socketService.leaveAudit(currentJobId);
      }
      // Don't leave project room - it should persist for the entire session
    };
  }, [projectId, currentJobId]);

  // 🎯 EVENT-DRIVEN MODAL: Open modal when audit is running (not click-driven)
  useEffect(() => {
    if (auditUI.isRunning && !isProgressModalOpen) {
      console.log('🟢 Opening audit modal (event-driven)');
      setIsProgressModalOpen(true);
    }
  }, [auditUI.isRunning, isProgressModalOpen]);

  const fetchProjectDetails = async () => {
    try {
      console.log('🔍 Fetching project details for projectId:', projectId);
      
      // Validate projectId before making API call
      if (!projectId || projectId === 'undefined' || projectId === 'all') {
        throw new Error('Invalid project ID');
      }
      
      setLoading(true);
      const response = await apiService.getProjectById(projectId);
      
      if (response.success) {
        console.log('Project data from backend:', response.data);
        setProject(response.data);
        // Initialize edit form with current project data
        setEditForm({
          project_name: response.data.project_name || '',
          main_url: response.data.main_url || '',
          business_type: response.data.business_type || '',
          industry: response.data.industry || '',
          location: response.data.location || '',
          description: response.data.description || ''
        });
        console.log('Edit form initialized:', {
          project_name: response.data.project_name || '',
          main_url: response.data.main_url || '',
          business_type: response.data.business_type || '',
          industry: response.data.industry || '',
          location: response.data.location || '',
          description: response.data.description || ''
        });
        
        // Fetch issues after project details load successfully
        if (response.data.crawl_status === 'completed') {
          await fetchProjectIssues();
        }
        
        // Set screenshot from project details response - DISABLED
        if (response.data.screenshot_url) {
          console.log('✅ Screenshot URL found but disabled:', response.data.screenshot_url);
          setScreenshot(null); // Screenshots disabled for performance
        }
      } else {
        setError('Failed to fetch project details');
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError(err.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectIssues = async (filters = {}) => {
    try {
      setIssuesLoading(true);
      setIssuesError(null);
      
      const response = await apiService.getProjectIssues(projectId, filters);
      
      if (response.success) {
        console.log('Issues data from backend:', response.data);
        setIssues(response.data);
      } else {
        setIssuesError(response.message || 'Failed to fetch issues');
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
      setIssuesError(err.message || 'Failed to fetch issues');
    } finally {
      setIssuesLoading(false);
    }
  };

  // Helper function to aggregate issues by issue_code
  const aggregateIssuesByCode = (issuesData) => {
    if (!issuesData || !issuesData.issues || issuesData.issues.length === 0) {
      return [];
    }

    const aggregated = {};
    
    issuesData.issues.forEach(issue => {
      const code = issue.issue_code;
      
      if (!aggregated[code]) {
        aggregated[code] = {
          title: issue.issue_message,
          category: issue.category,
          severity: issue.severity,
          pages_affected: 0,
          unique_pages: new Set()
        };
      }
      
      aggregated[code].unique_pages.add(issue.page_url);
    });

    // Convert Sets to counts
    return Object.values(aggregated).map(issue => ({
      title: issue.title,
      category: issue.category,
      severity: issue.severity,
      pages_affected: issue.unique_pages.size
    }));
  };

  const handleEditProject = () => {
    setIsEditModalOpen(true);
  };

  const handleSettings = () => {
    setIsSettingsModalOpen(true);
  };

  // 🎯 Determine button text and state based on audit status
  const getAuditButtonState = () => {
    if (isStartingAudit) {
      return { text: 'Starting...', disabled: true, icon: <Play className="h-3 w-3 mr-1" /> };
    }
    
    if (currentJobId || project?.crawl_status === 'running') {
      return { text: 'Audit Running', disabled: true, icon: <Play className="h-3 w-3 mr-1" /> };
    }
    
    if (project?.crawl_status === 'completed') {
      return { text: 'New Crawl', disabled: false, icon: <RefreshCw className="h-3 w-3 mr-1" /> };
    }
    
    // First time audit or not started
    return { text: 'Start Audit', disabled: false, icon: <Play className="h-3 w-3 mr-1" /> };
  };

  const buttonState = getAuditButtonState();

  const handleStartAudit = async () => {
    try {
      console.log('🚀 Starting audit for projectId:', projectId);
      setIsStartingAudit(true);
      setError(null);
      setAuditStatusCheck(null); // Reset status check
      
      // Check if this is a re-crawl (update existing) or new audit
      const isRecrawl = project?.crawl_status === 'completed';
      const auditType = isRecrawl ? 'Re-crawl' : 'New audit';
      console.log(`🔄 ${auditType} initiated for projectId: ${projectId}`);
      console.log(`📋 ${auditType} will ${isRecrawl ? 'update existing documents' : 'create new documents'}`);
      
      const response = await apiService.startAudit(projectId);
      console.log('📡 API Response:', response);
      
      if (response.success) {
        console.log('✅ Audit started successfully:', response.data);
        // Modal will be opened by audit:started event - no force opening
        setCurrentJobId(response.data.job_id);
        
        // Join audit room for real-time updates (job room for progress, project room for completion)
        const token = localStorage.getItem('token');
        if (token && socketService.isConnected()) {
          console.log('🔌 Joining audit room:', response.data.job_id);
          socketService.joinAudit(response.data.job_id);
          // Already in project room from useEffect
        } else {
          console.warn('⚠️ Cannot join audit room - socket not connected or no token');
        }
        
        // fetchProjectDetails(); // REMOVED - prevents modal auto-close
      } else {
        console.error('❌ Audit start failed:', response);
        setError(response.message || 'Failed to start audit');
        setIsProgressModalOpen(false); // Close on error
      }
    } catch (err) {
      console.error('❌ Error starting audit:', err);
      setError(err.message || 'Failed to start audit');
      setIsProgressModalOpen(false); // Close on error
    } finally {
      setIsStartingAudit(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      const response = await apiService.updateProject(projectId, editForm);
      
      if (response.success) {
        setProject(response.data);
        setIsEditModalOpen(false);
        console.log('Project updated successfully');
      } else {
        setError('Failed to update project');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.message || 'Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      // For now, settings are saved to project metadata
      const response = await apiService.updateProject(projectId, {
        settings: settingsForm
      });
      
      if (response.success) {
        setProject(response.data);
        setIsSettingsModalOpen(false);
        console.log('Settings updated successfully');
      } else {
        setError('Failed to update settings');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewResults = () => {
    // Close the modal
    setIsProgressModalOpen(false);
    // Trigger complete page refresh to show updated data
    window.location.reload();
  };

  const handleCancelAudit = async () => {
    try {
      console.log('🛑 Cancelling audit for projectId:', projectId, 'jobId:', currentJobId);
      
      if (!currentJobId) {
        console.warn('No current job ID to cancel');
        return;
      }

      const response = await apiService.cancelAudit(projectId, currentJobId);
      console.log('📡 Cancel audit response:', response);
      
      if (response.success) {
        console.log('✅ Audit cancellation successful');
        // Close the modal
        setIsProgressModalOpen(false);
        // Reset audit state
        setCurrentJobId(null);
        setAuditUI({
          jobId: null,
          stage: null,
          percentage: 0,
          message: '',
          isRunning: false
        });
        // Refresh project details to get updated status
        await fetchProjectDetails();
      } else {
        console.error('❌ Audit cancellation failed:', response.message);
        setError(response.message || 'Failed to cancel audit');
      }
    } catch (err) {
      console.error('❌ Error cancelling audit:', err);
      setError(err.message || 'Failed to cancel audit');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'paused':
        return <CheckCircle className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-12 w-16" />
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
              {/* Left Section Skeleton */}
              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-[220px] h-[140px] rounded-xl border bg-muted flex items-center justify-center">
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-3 ml-0 md:ml-6 flex-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider Skeleton */}
              <div className="hidden lg:block h-[220px] w-px bg-border"></div>

              {/* Right Section Skeleton */}
              <div className="flex-1 flex items-center justify-between w-full">
                <div className="flex flex-col lg:flex-row items-center gap-8 w-full">
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-[170px] h-[170px] rounded-full" />
                    <Skeleton className="h-6 w-12 mt-4" />
                  </div>
                  <div className="space-y-4 ml-0 lg:ml-10 w-full max-w-[260px]">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between border rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-8" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Project</h3>
            <p className="text-red-600 mb-2">{error}</p>
            {auditStatusCheck && (
              <p className="text-sm text-red-500 mt-2">Status Check: {auditStatusCheck}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={onBack}>
            Back to Projects
          </Button>
          <Button onClick={fetchProjectDetails}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
        <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
        <Button onClick={onBack}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Back button clicked in ProjectOverview');
              onBack();
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.project_name}</h1>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <a 
                href={project.main_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {project.main_url}
              </a>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  className="h-8" 
                  disabled={buttonState.disabled}
                  onClick={handleStartAudit}
                >
                  {buttonState.icon}
                  {buttonState.text}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {project?.crawl_status === 'completed' 
                    ? "Re-crawl website and update existing data" 
                    : "Start initial website audit and analysis"
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8"
            onClick={handleEditProject}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Edit Project
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8"
            onClick={handleSettings}
          >
            <Settings className="h-3 w-3 mr-1" />
            Settings
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8"
            disabled={isExporting || project?.crawl_status !== 'completed'}
            onClick={async () => {
              try {
                clearExportError();
                await exportReport(projectId, 'seo');
              } catch (err) {
                // Error already handled by hook
              }
            }}
          >
            {isExporting ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="h-3 w-3 mr-1" />
                Export SEO
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center gap-8 py-3">
          <Button 
            variant="ghost" 
            className={`font-semibold text-base pb-1 cursor-pointer ${
              activeView === 'overview' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => handleTabChange('overview')}
          >
            Overview
          </Button>
          <Button 
            variant="ghost" 
            className={`font-semibold text-base pb-1 cursor-pointer ${
              activeView === 'subpages' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => handleTabChange('subpages')}
          >
            Subpages
          </Button>
          <Button 
            variant="ghost" 
            className={`font-semibold text-base pb-1 cursor-pointer ${
              activeView === 'google-visibility' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => handleTabChange('google-visibility')}
          >
            <Eye className="h-4 w-4 mr-1" />
            Google Visibility
          </Button>
          <Button 
            variant="ghost" 
            className={`font-semibold text-base pb-1 cursor-pointer ${
              activeView === 'reports' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => handleTabChange('reports')}
          >
            Reports
          </Button>
        </div>
      </div>

      {/* Conditional Content Rendering */}
      {activeView === 'subpages' ? (
        <ProjectSubpages 
          projectId={projectId}
          projectName={project.project_name}
          onBack={() => handleTabChange('overview')}
        />
      ) : activeView === 'google-visibility' ? (
        <ProjectGoogleVisibility 
          projectId={projectId}
          projectName={project.project_name}
          onBack={() => handleTabChange('overview')}
        />
      ) : activeView === 'reports' ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Reports</h2>
          <p className="text-gray-600 mb-6">Reports functionality will be implemented soon.</p>
          <Button onClick={() => handleTabChange('overview')}>
            Back to Overview
          </Button>
        </div>
      ) : (
        <>
      {/* Crawl & Audit Summary */}
      <ProjectAuditHeroCard 
        crawlStatus={project.crawl_status}
        crawlStarted={project.audit_started_at}
        crawlFinished={project.last_analysis_at}
        crawlDuration={project.audit_duration_ms}
        numberOfCrawls={project.total_crawls}
        scheduledCrawls={project.scheduled_crawls}
        websiteUrl={project.main_url}
        overallScore={project.website_score}
        techMetaScore={project.crawl_status === 'completed' ? 14 : 0}
        structureScore={project.crawl_status === 'completed' ? 90 : 0}
        contentScore={project.crawl_status === 'completed' ? 92 : 0}
        screenshotPath={screenshot}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Problems found</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
              <span className="text-xs">−</span>
            </Button>
          </div>
          <div className="text-2xl font-bold mb-1">{project.total_issues || 0}</div>
          <div className="h-12">
            {/* Simple line graph placeholder */}
            <div className="flex items-end justify-between h-full">
              <div className="w-1 bg-blue-200 h-4"></div>
              <div className="w-1 bg-blue-200 h-6"></div>
              <div className="w-1 bg-blue-200 h-8"></div>
              <div className="w-1 bg-blue-200 h-5"></div>
              <div className="w-1 bg-blue-200 h-9"></div>
              <div className="w-1 bg-blue-200 h-7"></div>
              <div className="w-1 bg-blue-200 h-10"></div>
              <div className="w-1 bg-blue-200 h-6"></div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Crawled pages</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
              <span className="text-xs">−</span>
            </Button>
          </div>
          <div className="text-2xl font-bold mb-1">{project.last_crawl_summary?.crawled_pages?.total || project.pages_crawled || 0}</div>
          <div className="h-12">
            {/* Simple line graph placeholder */}
            <div className="flex items-end justify-between h-full">
              <div className="w-1 bg-green-200 h-3"></div>
              <div className="w-1 bg-green-200 h-5"></div>
              <div className="w-1 bg-green-200 h-7"></div>
              <div className="w-1 bg-green-200 h-4"></div>
              <div className="w-1 bg-green-200 h-8"></div>
              <div className="w-1 bg-green-200 h-6"></div>
              <div className="w-1 bg-green-200 h-9"></div>
              <div className="w-1 bg-green-200 h-7"></div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Indexed subpages</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
              <span className="text-xs">−</span>
            </Button>
          </div>
          <div className="text-2xl font-bold mb-1">{project.pages_analyzed || 0}</div>
          <div className="h-12">
            {/* Simple line graph placeholder */}
            <div className="flex items-end justify-between h-full">
              <div className="w-1 bg-purple-200 h-2"></div>
              <div className="w-1 bg-purple-200 h-4"></div>
              <div className="w-1 bg-purple-200 h-6"></div>
              <div className="w-1 bg-purple-200 h-3"></div>
              <div className="w-1 bg-purple-200 h-7"></div>
              <div className="w-1 bg-purple-200 h-5"></div>
              <div className="w-1 bg-purple-200 h-8"></div>
              <div className="w-1 bg-purple-200 h-6"></div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">External links</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
              <span className="text-xs">−</span>
            </Button>
          </div>
          <div className="text-2xl font-bold mb-1">{project.last_crawl_summary?.discovered_links?.external_links || 0}</div>
          <div className="h-12">
            {/* Simple line graph placeholder */}
            <div className="flex items-end justify-between h-full">
              <div className="w-1 bg-orange-200 h-1"></div>
              <div className="w-1 bg-orange-200 h-2"></div>
              <div className="w-1 bg-orange-200 h-3"></div>
              <div className="w-1 bg-orange-200 h-2"></div>
              <div className="w-1 bg-orange-200 h-4"></div>
              <div className="w-1 bg-orange-200 h-3"></div>
              <div className="w-1 bg-orange-200 h-5"></div>
              <div className="w-1 bg-orange-200 h-4"></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Issues & Tips Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">ISSUES & TIPS</h3>
            <p className="text-sm text-gray-600 mt-1">All problems found on your website, ordered from highest to lowest priority.</p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            View all reports
          </Button>
        </div>

        <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="tech">Tech. & Meta</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
            
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search issues..." 
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            {issuesLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading issues...</span>
              </div>
            ) : issuesError ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <p className="text-red-600 mb-2">Error loading issues</p>
                <p className="text-sm text-gray-500">{issuesError}</p>
              </div>
            ) : !issues || !issues.issues || issues.issues.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No issues found</p>
                <p className="text-sm text-gray-400 mt-2">Great job! Your website has no SEO issues.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {aggregateIssuesByCode(issues).map((issue, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        issue.severity === 'high' ? 'bg-red-100' : 
                        issue.severity === 'medium' ? 'bg-orange-100' : 'bg-yellow-100'
                      }`}>
                        {issue.severity === 'high' ? (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : issue.severity === 'medium' ? (
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{issue.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {issue.category === 'Content' && 'Content issues affect your website\'s relevance and ranking.'}
                        {issue.category === 'Technical' && 'Technical SEO issues impact search engine crawling and indexing.'}
                        {issue.category === 'Accessibility' && 'Accessibility issues affect user experience for all visitors.'}
                        {issue.category === 'Structure' && 'Structure issues impact how search engines understand your site hierarchy.'}
                        {issue.category !== 'Content' && issue.category !== 'Technical' && issue.category !== 'Accessibility' && issue.category !== 'Structure' && 'This issue affects your website\'s SEO performance.'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className={`text-xs ${
                          issue.category === 'Content' ? 'bg-green-100 text-green-800' :
                          issue.category === 'Technical' ? 'bg-orange-100 text-orange-800' :
                          issue.category === 'Accessibility' ? 'bg-blue-100 text-blue-800' :
                          issue.category === 'Structure' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {issue.category}
                        </Badge>
                        <span className="text-xs text-gray-500">Found on {issue.pages_affected} pages</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tech" className="mt-0">
            {issuesLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading Tech & Meta issues...</span>
              </div>
            ) : issuesError ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <p className="text-red-600">Error loading Tech & Meta issues</p>
                <p className="text-sm text-gray-500">{issuesError}</p>
              </div>
            ) : !issues || !issues.issues || issues.issues.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No Tech & Meta issues found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {aggregateIssuesByCode(issues)
                  .filter(issue => issue.category === 'Technical' || issue.category === 'Content')
                  .map((issue, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          issue.severity === 'high' ? 'bg-red-100' : 
                          issue.severity === 'medium' ? 'bg-orange-100' : 'bg-yellow-100'
                        }`}>
                          {issue.severity === 'high' ? (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          ) : issue.severity === 'medium' ? (
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{issue.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {issue.category === 'Content' && 'Content issues affect your website\'s relevance and ranking.'}
                          {issue.category === 'Technical' && 'Technical SEO issues impact search engine crawling and indexing.'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className={`text-xs ${
                            issue.category === 'Content' ? 'bg-green-100 text-green-800' :
                            issue.category === 'Technical' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {issue.category}
                          </Badge>
                          <span className="text-xs text-gray-500">Found on {issue.pages_affected} pages</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="content" className="mt-0">
            {issuesLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading Content issues...</span>
              </div>
            ) : issuesError ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <p className="text-red-600">Error loading Content issues</p>
                <p className="text-sm text-gray-500">{issuesError}</p>
              </div>
            ) : !issues || !issues.issues || issues.issues.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No Content issues found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {aggregateIssuesByCode(issues)
                  .filter(issue => issue.category === 'Content')
                  .map((issue, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          issue.severity === 'high' ? 'bg-red-100' : 
                          issue.severity === 'medium' ? 'bg-orange-100' : 'bg-yellow-100'
                        }`}>
                          {issue.severity === 'high' ? (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          ) : issue.severity === 'medium' ? (
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{issue.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">Content issues affect your website's relevance and ranking.</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Content</Badge>
                          <span className="text-xs text-gray-500">Found on {issue.pages_affected} pages</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Edit Project Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project_name" className="text-right">
                Project Name
              </Label>
              <Input
                id="project_name"
                value={editForm.project_name}
                onChange={(e) => setEditForm({...editForm, project_name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="main_url" className="text-right">
                Main URL
              </Label>
              <Input
                id="main_url"
                value={editForm.main_url}
                onChange={(e) => setEditForm({...editForm, main_url: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="business_type" className="text-right">
                Business Type
              </Label>
              <Input
                id="business_type"
                value={editForm.business_type}
                onChange={(e) => setEditForm({...editForm, business_type: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="industry" className="text-right">
                Industry
              </Label>
              <Input
                id="industry"
                value={editForm.industry}
                onChange={(e) => setEditForm({...editForm, industry: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Project Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="crawl_frequency" className="text-right">
                Crawl Frequency
              </Label>
              <Select value={settingsForm.crawl_frequency} onValueChange={(value) => setSettingsForm({...settingsForm, crawl_frequency: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="max_pages" className="text-right">
                Max Pages
              </Label>
              <Input
                id="max_pages"
                type="number"
                value={settingsForm.max_pages}
                onChange={(e) => setSettingsForm({...settingsForm, max_pages: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Notifications
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enable_notifications"
                  checked={settingsForm.enable_notifications}
                  onChange={(e) => setSettingsForm({...settingsForm, enable_notifications: e.target.checked})}
                />
                <Label htmlFor="enable_notifications">Enable email notifications</Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Auto Analyze
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_analyze"
                  checked={settingsForm.auto_analyze}
                  onChange={(e) => setSettingsForm({...settingsForm, auto_analyze: e.target.checked})}
                />
                <Label htmlFor="auto_analyze">Automatically analyze after crawling</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Progress Modal */}
      <AuditProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        isRunning={auditUI.isRunning}
        currentStage={auditUI.stage}
        percentage={auditUI.percentage}
        message={auditUI.message}
        onCancel={handleCancelAudit}
        onViewResults={handleViewResults}
      />
        </>
      )}
    </div>
  );
}
