"use client"

import apiService from '@/lib/apiService';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StartAIVisibilityModal from '@/components/ai-visibility/StartAIVisibilityModal';
import AIVisibilityStatusRenderer from '@/components/ai-visibility/AIVisibilityStatusRenderer';
import { useAIVisibilityPolling } from '@/hooks/useAIVisibilityPolling';
import aiVisibilityService from '@/services/aiVisibilityService';
import { AI_CATEGORY_COLOR_MAP } from "@/utils/aiCategoryColors";
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
  RefreshCw
} from 'lucide-react';
import AIVisibilityOverview from './aivisibilityoverview.jsx';
import AIOptimization from './aioptimization.jsx';
import AIPageIssues from './aipageissues.jsx';

export default function AIVisibility() {
  const { user, logout, isLoading } = useAuth()
  const [activeView, setActiveView] = useState('overview')
  const [project, setProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null);
  const [issues, setIssues] = useState({ issues: [] });
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState(null);
  
  // AI Visibility specific state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);
  const [aiVisibilityProject, setAiVisibilityProject] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  
  // Polling hook
  const { 
    status: analysisStatus, 
    loading: analysisLoading, 
    error: analysisError,
    isPolling,
    startPolling,
    stopPolling
  } = useAIVisibilityPolling(analysisId, {
    interval: 3000,
    onComplete: (data) => {
      // Refresh project data when analysis completes
      fetchProject();
    },
    onError: (data) => {
      console.error('AI Visibility analysis failed:', data);
    }
  });

  const handleStartAnalysis = async (type, projectId = null, url = null, onRefresh = null) => {
    setIsStartingAnalysis(true);
    
    try {
      const response = await aiVisibilityService.startAnalysis(type, projectId, url);
      
      if (response.success && response.data) {
        setAnalysisId(response.data._id);
        
        // Start polling for status updates
        startPolling();
        
        // Update active view to overview to show progress
        handleTabChange('overview');
        
        // Refresh project data after successful creation
        if (onRefresh) {
          await onRefresh();
        }
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError('AI Visibility analysis is already running.');
      } else {
        setError(err.message || 'Failed to start AI Visibility analysis');
      }
    } finally {
      setIsStartingAnalysis(false);
    }
  };

  // Determine button label based on project state
  const getButtonLabel = () => {
    if (!project) return "Check AI Visibility";
    if (project.aiStatus === "processing") return "Audit Running...";
    if (project.aiStatus === "completed") return "Re-run Audit";
    return "Start AI Audit";
  };

  const handlePrimaryAction = () => {
    if (!project) {
      // No project → open modal
      setIsModalOpen(true);
      return;
    }

    // Project exists → trigger audit
    triggerAiAudit();
  };

  const triggerAiAudit = async () => {
    try {
      setIsStartingAnalysis(true);

      await apiService.post("/ai-visibility/start-audit", {
        aiProjectId: project._id
      });

      // Refresh project state
      await fetchProject();

    } catch (error) {
      console.error("Failed to start AI audit:", error);
    } finally {
      setIsStartingAnalysis(false);
    }
  };

  const handleCheckVisibility = () => {
    setIsModalOpen(true);
  };

  const handleRetryAnalysis = () => {
    setAnalysisId(null);
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    logout()
  }

  // Function to update URL with tab parameter
  const updateTabInUrl = (tabValue) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      if (tabValue === 'overview') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', tabValue);
      }
      window.history.replaceState({}, '', url);
    }
  }

  // Function to handle tab changes
  const handleTabChange = (view) => {
    setActiveView(view);
    // Map activeView values to URL parameter values
    switch(view) {
      case 'page-level-issues':
        updateTabInUrl('page-level-issues');
        break;
      case 'entity-graph':
        updateTabInUrl('ai-optimization');
        break;
      case 'overview':
      default:
        updateTabInUrl('overview');
        break;
    }
  }

  const fetchAIIssues = async (filters = {}) => {
    try {
      setIssuesLoading(true);
      setIssuesError(null);
      
      // This would be replaced with actual API call when AI visibility endpoint is ready
      // const response = await apiService.getAIVisibilityIssues(filters);
      
      // For now, return empty state
      setTimeout(() => {
        setIssues({ issues: [] });
        setIssuesLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error fetching AI issues:', err);
      setIssuesError(err.message || 'Failed to fetch AI issues');
      setIssuesLoading(false);
    }
  };

  const fetchProject = async () => {
    try {
      // Use the correct AI Visibility projects endpoint
      const projectsResponse = await aiVisibilityService.getAIVisibilityProjects();
      const latestProject = projectsResponse?.data;
      
      // Update page state
      if (latestProject) {
        setProject(latestProject);
        setAiVisibilityProject(latestProject);
      } else {
        setProject(null);
        setAiVisibilityProject(null);
      }
      
      setLoading(false);
      
      // Trigger a custom event to notify AIVisibilityOverview to refresh
      const refreshEvent = new CustomEvent('refresh-ai-visibility-overview');
      window.dispatchEvent(refreshEvent);
      
    } catch (error) {
      console.error('Error fetching AI Visibility project:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIIssues();
    fetchProject();
    
    // Handle tab navigation from query parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam) {
        // Map URL parameter values to activeView values
        switch(tabParam) {
          case 'page-level-issues':
            setActiveView('page-level-issues');
            break;
          case 'ai-optimization':
            setActiveView('entity-graph');
            break;
          case 'overview':
          default:
            setActiveView('overview');
            break;
        }
      }
    }
    
    // Cleanup polling on unmount
    return () => {
      stopPolling();
    };
  }, []);

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

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access this page</h1>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
  <div className="space-y-6 p-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">AI Visibility</h1>
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            
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
                onClick={handlePrimaryAction}
                disabled={isPolling || analysisLoading || isStartingAnalysis || project?.aiStatus === "processing"}
              >
                <Play className="h-3 w-3 mr-1" />
                {getButtonLabel()}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Start AI visibility analysis</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button size="sm" variant="outline" className="h-8">
          <Settings className="h-3 w-3 mr-1" />
          Settings
        </Button>
      </div>
    </div>

    {/* Navigation Tabs */}
    <div className="border-b border-gray-200">
      <div className="flex items-center gap-8 py-3">
        <Button
          variant="ghost"
          className={`font-semibold text-base pb-1 ${
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
          className={`font-semibold text-base pb-1 ${
            activeView === 'entity-graph'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => handleTabChange('entity-graph')}
        >
          AI Optimization
        </Button>

        <Button
          variant="ghost"
          className={`font-semibold text-base pb-1 ${
            activeView === 'page-level-issues'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => handleTabChange('page-level-issues')}
        >
          <Eye className="h-4 w-4 mr-1" />
          Page Level Issues
        </Button>
      </div>
    </div>

    {/* Content */}
    {activeView === 'entity-graph' ? (
      <AIOptimization project={project} />
    ) : activeView === 'page-level-issues' ? (
      <AIPageIssues project={project} />
    ) : (
      <div>
        {/* Always render Overview component */}
        {analysisStatus || analysisId || isPolling ? (
          <AIVisibilityStatusRenderer
            status={analysisStatus?.aiStatus || 'pending'}
            progressPercentage={analysisStatus?.progressPercentage || 0}
            error={analysisStatus?.error || analysisError}
            onRetry={handleRetryAnalysis}
          />
        ) : (
          <AIVisibilityOverview 
            isAIModalOpen={isModalOpen}
            setIsAIModalOpen={setIsModalOpen}
            onProjectRefresh={fetchProject}
            project={project}
          />
        )}
      </div>
    )}
    
    {/* Start Analysis Modal */}
    <StartAIVisibilityModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onStartAnalysis={handleStartAnalysis}
      onRefresh={fetchProject}
      isLoading={isStartingAnalysis}
    />
  </div>
);
}
