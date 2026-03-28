"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import apiService from '@/lib/apiService'
import { 
  Globe, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Eye,
  ExternalLink,
  Pencil,
  Plus,
  RefreshCw,
  AlertTriangle as ErrorIcon
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import { AuthGuard } from '@/components/guards/AuthGuard'
import DashboardLayout from "@/components/layout/dashboard-layout"
import ScoreGrid from "@/components/dashboard/overview/ScoreGrid"
import AISummaryCard from "@/components/dashboard/overview/AISummaryCard"
import SEOSummaryPanel from "@/components/dashboard/overview/SEOSummaryPanel"
import AIVisibilityPanel from "@/components/dashboard/overview/AIVisibilityPanel"

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { user, logout, isLoading, isInitialized } = useAuth()
  const { activeProject } = useProject()
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [project, setProject] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [technicalHealth, setTechnicalHealth] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [issueCounts, setIssueCounts] = useState({
    critical: 0,
    warnings: 0,
    informational: 0,
    passed: 0
  })

  useEffect(() => {
  // Only fetch projects when auth is complete and user is available
  if (!isLoading && isInitialized && user) {
    fetchProjects();
  }
}, [user, isLoading, isInitialized]);

  useEffect(() => {
  if (!activeProject) return
  
  setLoading(true);
  
  // Fetch all data in parallel
  const fetchData = async () => {
    try {
      await Promise.all([
        fetchProjectData(activeProject._id),
        fetchIssueCounts(activeProject._id),
        fetchDashboardData(activeProject._id),
        fetchTechnicalHealth(activeProject._id)
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [activeProject])

  const fetchProjectData = async (projectId) => {
  try {
    const res = await apiService.getProjectById(projectId);
    if (res.success) {
      setProject(res.data);
    }
  } catch (err) {
    console.error('Error fetching project data:', err);
  }
};

const fetchIssueCounts = async (projectId) => {
  try {
    const response = await apiService.request(`/pdf/${projectId}/executive`);

    if (response && response.success && response.data) {
      const executiveData = response.data;
      
      // Try multiple possible structures
      let issues = null;
      
      if (executiveData.success && executiveData.data && executiveData.data.issues) {
        issues = executiveData.data.issues;
      } else if (executiveData.data && executiveData.data.issues) {
        issues = executiveData.data.issues;
      } else if (executiveData.issues) {
        issues = executiveData.issues;
      }
      
      if (issues && typeof issues === 'object' && issues.critical !== undefined) {
        setIssueCounts(issues);
      }
    }
  } catch (error) {
    console.error('Error fetching issue counts:', error);
  }
};

const fetchDashboardData = async (projectId) => {
  try {
    const response = await apiService.request(`/app_user/projects/${projectId}/dashboard`);
    if (response.success) {
      setDashboardData(response.data);
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

const fetchTechnicalHealth = async (projectId) => {
  try {
    const response = await apiService.getTechnicalChecks(projectId);
    if (response.success && response.data?.summary?.healthScore !== undefined) {
      setTechnicalHealth(response.data.summary.healthScore);
    }
  } catch (error) {
    console.error('Error fetching technical health:', error);
    setTechnicalHealth(0);
  }
};

  const fetchProjects = async () => {
  try {
    const response = await apiService.getProjects(1, 10);
    
    if (response.success) {
      setProjects(response.data.projects || []);
    } else {
      setError(response?.message || 'Failed to load projects');
    }
  } catch (err) {
    console.error('Error fetching projects:', err);
    setError('Failed to load projects');
  } finally {
    setLoading(false);
  }
};

  const handleProjectAction = (action, projectId) => {
    switch (action) {
      case 'view':
        router.push(`/projects/${projectId}`)
        break
      case 'edit':
        router.push(`/projects/${projectId}/edit`)
        break
      case 'audit':
        router.push(`/projects/${projectId}/audit`)
        break
      case 'delete':
        console.log('Delete project:', projectId)
        break
      default:
        break
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'paused':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'paused':
        return 'bg-orange-100 text-orange-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Map backend data to dashboard metrics
  const seoHealth = project ? Math.round(project.website_score || 0) : 0
  const aiVisibility = project ? (project.ai_visibility?.score || 0) : 0
  const performance = dashboardData?.performance?.performanceScore || 0
  const technicalHealthScore = technicalHealth // From backend API

  
  // SEO summary data - USE REAL AGGREGATION DATA
  const pagesCrawled = project ? (project.pages_crawled || 0) : 0
  const totalIssues = issueCounts ? 
    (issueCounts.critical || 0) + (issueCounts.warnings || 0) + (issueCounts.informational || 0) : 
    (project ? (project.total_issues || 0) : 0)
  const criticalIssues = issueCounts ? (issueCounts.critical || 0) : 0

  // AI visibility summary data
  const aiReadiness = project ? Math.round(project.ai_visibility?.categories?.llm_readiness || 0) : 0
  const aiCitation = project ? Math.round(project.ai_visibility?.categories?.citation_probability || 0) : 0
  const topicalAuthority = project ? Math.round(project.ai_visibility?.categories?.topical_authority || 0) : 0

  
  const renderProjectCards = () => (
    <div className="space-y-3">
      {projects.map((project) => (
        <div 
          key={project._id} 
          className="group bg-card border rounded-lg shadow-sm hover:shadow-md hover:bg-muted transition-all duration-200 cursor-pointer"
          onClick={() => handleProjectAction('view', project._id)}
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              {/* Left Section - Primary Identity */}
              <div className="flex items-start space-x-4 flex-1">
                {/* Project Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Globe className="h-6 w-6 text-card" />
                  </div>
                </div>
                
                {/* Project Name & URL */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1 truncate">
                    {project.project_name}
                  </h3>
                  <a 
                    href={project.main_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-blue-600 hover:underline flex items-center gap-1 truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    {project.main_url}
                  </a>
                </div>
              </div>

              {/* Right Section - Status & Actions */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                  <Badge className={`${getStatusColor(project.status)} text-xs px-3 py-1.5 font-medium`}>
                    {getStatusIcon(project.status)}
                    <span className="ml-1">{project.status}</span>
                  </Badge>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm"
                    className="text-xs h-9 px-4"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleProjectAction('view', project._id)
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1.5" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs h-9 px-4"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleProjectAction('edit', project._id)
                    }}
                  >
                    <Pencil className="h-3 w-3 mr-1.5" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>

            {/* Middle Section - Metadata Strip */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                {project.business_type && (
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span className="font-medium">{project.business_type}</span>
                  </div>
                )}
                
                {project.industry && (
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span className="font-medium">{project.industry}</span>
                  </div>
                )}
                
                {project.location && (
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span className="font-medium">{project.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1.5">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                
                {project.last_scraped_at && (
                  <div className="flex items-center space-x-1.5">
                    <TrendingUp className="h-3 w-3 text-gray-400" />
                    <span>Scraped {new Date(project.last_scraped_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Loading projects...</span>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <Card className="border-0 shadow-sm">
          <div className="p-8 text-center">
            <ErrorIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-3">Oops! Something went wrong</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchProjects}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </Card>
      )
    }

    return renderProjectCards()
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access dashboard</h1>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Breadcrumb equivalent */}
        <div className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Overview Dashboard
              </h1>
              <p className="text-muted-foreground">SEO & AI Visibility Audit</p>
            </div>
          </div>
        </div>
        
        {/* AuditIQ Overview Dashboard Content */}
        <div>
          {/* SECTION 1 - Score Grid */}
          <ScoreGrid 
            seoHealth={seoHealth}
            aiVisibility={aiVisibility}
            performance={performance}
            technicalHealth={technicalHealthScore}
          />

          {/* SECTION 2 - ARIA AI Explainer Card */}
          <AISummaryCard />

          {/* SECTION 3 - Two Column Grid */}
          <div className="two-col">
            <SEOSummaryPanel 
              pagesCrawled={pagesCrawled}
              totalIssues={totalIssues}
              criticalIssues={criticalIssues}
              mediumIssues={issueCounts?.warnings || 0}
              infoIssues={issueCounts?.informational || 0}
            />
            <AIVisibilityPanel 
              aiReadiness={aiReadiness}
              aiCitation={aiCitation}
              topicalAuthority={topicalAuthority}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
