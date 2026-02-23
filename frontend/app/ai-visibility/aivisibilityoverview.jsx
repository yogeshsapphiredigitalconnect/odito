"use client"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MoreVertical, ChevronRight, Info, TriangleAlert, BarChart3, ChevronDown, Circle, FileDown, RefreshCw, Globe } from 'lucide-react';
import aiVisibilityService from '@/services/aiVisibilityService';
import { useExportReport } from '@/hooks/useExportReport';
import CircularProgress from '@/components/CircularProgress';
import socketService from '@/lib/socketService';
import AuditProgressModal from '@/components/AuditProgressModal.jsx';
import { AI_CATEGORY_COLOR_MAP } from "@/utils/aiCategoryColors";

export default function AIVisibilityOverview({ isAIModalOpen, setIsAIModalOpen, onProjectRefresh }) {
  // Debug: Component mount
  console.log("🔍 AIVisibilityOverview MOUNTED");

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [worstPages, setWorstPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);
  
  // AI Progress Modal State (match SEO exactly)
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [aiProgressUI, setAiProgressUI] = useState({
    jobId: null,
    stage: null,
    percentage: 0,
    message: "",
    isRunning: false
  });

  // Separate modal open state to prevent flicker
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug: Monitor aiProgressUI changes (must be after all useState)
  useEffect(() => {
    console.log("🔍 AI PROGRESS UI CHANGED:", aiProgressUI);
  }, [aiProgressUI]);

  // 🎯 EVENT-DRIVEN MODAL: Open modal when AI audit is running (match SEO exactly)
  useEffect(() => {
    if (aiProgressUI.isRunning && !isModalOpen) {
      console.log('🟢 Opening AI audit modal (event-driven)');
      setIsModalOpen(true);
    } else if (!aiProgressUI.isRunning && isModalOpen) {
      console.log('🔴 Closing AI audit modal (event-driven)');
      setIsModalOpen(false);
    }
  }, [aiProgressUI.isRunning, isModalOpen]);

  // Export functionality
  const { exportReport, loading: isExporting, error: exportError, clearError: clearExportError } = useExportReport();

  // 🎯 View Results Handler - Soft refresh with modal close
  const handleViewResults = async () => {
    console.log("🔵 View Results clicked");

    // 1️⃣ Close modal instantly
    setAiProgressUI(prev => ({
      ...prev,
      isRunning: false,
      isCompleted: true
    }));

    // 2️⃣ Slight delay to prevent UI race conditions, then refresh data
    setTimeout(() => {
      fetchAIVisibilityData(); // Your existing API call
    }, 200);
  };

  // Helper function to get grade color
  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-100 text-emerald-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-amber-100 text-amber-800';
      case 'D':
        return 'bg-orange-100 text-orange-800';
      case 'F':
        return 'bg-red-100 text-red-800';
    }
  };

  // ----------------------------
  // FETCH WORST PAGES (OUTSIDE)
  // ----------------------------
  const fetchWorstPages = async (projectId) => {
    if (!projectId) return;

    setPagesLoading(true);
    try {
      const response = await aiVisibilityService.getWorstPages(projectId, 5);
      
      const pagesArray =
        response?.data?.data ||
        response?.data ||
        [];
      
      setWorstPages(Array.isArray(pagesArray) ? pagesArray : []);
    } catch (err) {
      console.error("Failed to fetch worst pages:", err);
      setWorstPages([]);
    } finally {
      setPagesLoading(false);
    }
  };

  // ----------------------------
  // FETCH AI VISIBILITY DATA
  // ----------------------------
  const fetchAIVisibilityData = async () => {
    try {
      setLoading(true);

      const projectsRes = await aiVisibilityService.getAIVisibilityProjects();
      const latestProject = projectsRes?.data;

      // Always set project state (null if no project found)
      setProject(latestProject || null);

      if (latestProject?._id) {
        await fetchWorstPages(latestProject._id);
      } else {
        // Clear worst pages when no project exists
        setWorstPages([]);
      }

    } catch (err) {
      console.error("AI Visibility fetch error:", err);
      setError("Failed to load AI visibility data.");
      // Reset project to null on error
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // SOCKET LISTENERS + DATA FETCH
  // ----------------------------
  useEffect(() => {
    fetchAIVisibilityData();
    
    // Connect to socket service
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      socketService.connect(token);
    }
    
    // Listen for refresh events from parent
    const handleRefreshEvent = () => {
      fetchAIVisibilityData();
    };
    
    window.addEventListener('refresh-ai-visibility-overview', handleRefreshEvent);
    
    // AI Progress event handlers
    const handleAuditStarted = (data) => {
      console.log("🔍 AI RECEIVED audit:started", data);
      // Remove strict jobId filtering - allow any audit:started to update UI
      setAiProgressUI(prev => ({
        ...prev,
        jobId: data.jobId,
        stage: data.jobType || 'Start',
        percentage: data.percentage || 0,
        message: data.message || 'Starting AI Visibility analysis...',
        isRunning: true
      }));
    };
    
    const handleAuditProgress = (data) => {
      console.log("🔍 AI RECEIVED audit:progress", data);
      // Remove strict jobId filtering - allow progress updates
      setAiProgressUI(prev => {
        if (!prev.jobId) return prev;
        
        const isFinalStage = prev.stage === 'AI Visibility Scoring';
        const shouldComplete = data.percentage === 100 && isFinalStage;
        
        return {
          ...prev,
          percentage: data.percentage,
          message: data.message || prev.message,
          isRunning: !shouldComplete // Only set isRunning false on final stage completion
        };
      });
    };
    
    const handleAuditCompleted = (data) => {
      console.log("🔍 AI RECEIVED audit:completed", data);
      // Remove strict jobId filtering - allow completion
      setAiProgressUI(prev => {
        if (!prev.jobId) return prev;
        
        return {
          ...prev,
          percentage: 100,
          stage: "Complete",
          message: data.message || 'AI Visibility analysis completed successfully',
          isRunning: false // This will trigger modal close via useEffect
        };
      });
      
      // Leave audit room
      socketService.leaveAudit(data.jobId);
      
      // 🎯 Optional: Auto-close modal after 1.5 seconds for final completion
      setTimeout(() => {
        setIsModalOpen(false);
        console.log('🔴 AI audit modal auto-closed after completion');
      }, 1500);
      
      // Refresh data after completion
      fetchAIVisibilityData();
    };
    
    const handleAuditError = (data) => {
      console.log("🔍 AI RECEIVED audit:error", data);
      // Remove strict jobId filtering - allow error handling
      setAiProgressUI(prev => {
        if (!prev.jobId) return prev;
        
        return {
          ...prev,
          stage: 'ERROR',
          percentage: 0,
          message: data.message || 'AI Visibility analysis failed',
          isRunning: false
        };
      });
      
      // Leave audit room
      socketService.leaveAudit(data.jobId);
      
      // Close modal immediately on error
      setIsModalOpen(false);
      console.log('🔴 AI audit modal closed due to error');
    };
    
    // CRITICAL: Add audit:stageChanged handler for AI job chaining (match SEO exactly)
    const handleAuditStageChanged = (data) => {
      console.log("🔍 AI RECEIVED audit:stageChanged", data);
      console.log('🔄 AI STAGE CHANGED:', data);
      
      if (!data.newJobId) return;
      
      // Leave old job room and join new job room (match SEO exactly)
      socketService.leaveAudit(aiProgressUI.jobId);
      socketService.joinAudit(data.newJobId);
      
      // IMPORTANT: Do NOT reset percentage or isRunning - prevent flicker
      setAiProgressUI(prev => ({
        ...prev,
        jobId: data.newJobId, // Update to new jobId from chained job
        stage: data.stageName || data.to, // Use stageName from backend
        percentage: prev.percentage, // DO NOT RESET - keep current progress
        message: `Starting ${data.stageName || data.to}...`
        // DO NOT change isRunning - keep it true
        // DO NOT change any other properties
      }));
    };
    
    // Register socket event listeners
    console.log("🔍 REGISTERING AI SOCKET LISTENERS");
    
    // Debug: Add raw event listeners to verify payloads
    socketService.getSocket().on("audit:progress", (data) => {
      console.log("🔍 AI audit:progress received:", data);
    });
    
    socketService.getSocket().on("audit:stageChanged", (data) => {
      console.log("🔍 AI audit:stageChanged received:", data);
    });
    
    socketService.getSocket().on("audit:completed", (data) => {
      console.log("🔍 AI audit:completed received:", data);
    });
    
    socketService.onAuditStarted(handleAuditStarted);
    socketService.onAuditProgress(handleAuditProgress);
    socketService.onAuditCompleted(handleAuditCompleted);
    socketService.onAuditError(handleAuditError);
    
    // CRITICAL: Register stageChanged handler for AI job chaining
    socketService.onAuditStageChanged(handleAuditStageChanged);
    
    // Cleanup
    return () => {
      window.removeEventListener('refresh-ai-visibility-overview', handleRefreshEvent);
      
      // Unregister socket listeners
      socketService.offAuditStarted(handleAuditStarted);
      socketService.offAuditProgress(handleAuditProgress);
      socketService.offAuditCompleted(handleAuditCompleted);
      socketService.offAuditError(handleAuditError);
      socketService.offAuditStageChanged(handleAuditStageChanged);
      
      // CRITICAL: Clean up raw socket listeners
      const socket = socketService.getSocket();
      socket.off("audit:progress");
      socket.off("audit:stageChanged");
      socket.off("audit:completed");
      socket.off("audit:stageChanged", handleAuditStageChanged);
      
      // Leave audit room if active
      if (aiProgressUI.jobId) {
        socketService.leaveAudit(aiProgressUI.jobId);
      }
    };
  }, [aiProgressUI.jobId]);

  // Loading state
  if (loading) {
    return <div className="p-6">Loading AI visibility data...</div>;
  }

  // Error state
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  // Extract backend fields — mapped to current MongoDB schema
  const score = project?.summary?.overallScore || 0;
  const grade = project?.summary?.grade || "F";
  const totalIssues = project?.summary?.totalIssues || 0;
  const highIssues = project?.summary?.highSeverityIssues || 0;
  const mediumIssues = project?.summary?.mediumSeverityIssues || 0;
  const lowIssues = project?.summary?.lowSeverityIssues || 0;
  const pagesScored = project?.summary?.pagesScored || 0;
  const totalPages = project?.summary?.totalPages || 0;
  const status = project?.aiStatus || "pending";
  const updatedAt = project?.updatedAt;

  // Calculate percentages for severity breakdown
  const total = totalIssues || 1;
  const highPercent = (highIssues / total) * 100;
  const mediumPercent = (mediumIssues / total) * 100;
  const lowPercent = (lowIssues / total) * 100;

  // ----------------------------
  // TRIGGER AI AUDIT
  // ----------------------------
  const triggerAiAudit = async () => {
    if (!project?._id) {
      console.error('No AI project found');
      return;
    }

    try {
      setIsStartingAnalysis(true);

      const response = await aiVisibilityService.startAudit(project._id);
      
      console.log("🔍 AI START RESPONSE:", response);
      
      if (response.success && response.data) {
        console.log("🔍 AI PROGRESS STATE SET:", response.data.jobId);
        
        // Set AI progress state with jobId
        setAiProgressUI({
          jobId: response.data.jobId,
          stage: "Start",
          percentage: 0,
          message: "Initializing AI Visibility analysis...",
          isRunning: true
        });

        // Join audit room for real-time updates
        console.log("🔍 Joining audit room:", response.data.jobId);
        socketService.joinAudit(response.data.jobId);
        
        console.log('✅ AI audit started:', response.data);
      }
    } catch (error) {
      console.error("Failed to start AI audit:", error);
      setError(error.message || 'Failed to start AI Visibility analysis');
    } finally {
      setIsStartingAnalysis(false);
    }
  };
  
  return (
    <div className="bg-background min-h-screen p-6">
      {/* PROJECT HEADER SECTION - Always renders */}
      <Card className="mb-6 p-4 border border-border bg-card shadow-sm rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Website URL */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Website</p>
                <p className="text-sm font-medium text-foreground">
                  {project?.config?.url || 'Not configured'}
                </p>
              </div>
            </div>

            {/* AI Status */}
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                project?.aiStatus === 'completed' ? 'bg-success' :
                project?.aiStatus === 'running' ? 'bg-primary' :
                project?.aiStatus === 'analyzing' ? 'bg-primary' :
                project?.aiStatus === 'scoring' ? 'bg-primary' :
                project?.aiStatus === 'failed' ? 'bg-destructive' :
                project?.aiStatus === 'cancelled' ? 'bg-warning' :
                project ? 'bg-muted' :
                'bg-muted'
              }`}></div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">AI Status</p>
                <p className="text-sm font-medium text-foreground capitalize">
                  {project?.aiStatus || 'No AI Visibility Project'}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="w-16 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${project?.progressPercentage || 0}%` }}
                ></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Progress</p>
                <p className="text-sm font-medium text-foreground">
                  {project?.progressPercentage || 0}%
                </p>
              </div>
            </div>

            {/* Created Date */}
            {project?.createdAt && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Created</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            {project ? (
              <>
                {project.aiStatus === 'completed' ? (
                  <>
                    <Badge variant="success" className="text-xs font-medium">
                      Completed
                    </Badge>
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium"
                      onClick={triggerAiAudit}
                      disabled={aiProgressUI.isRunning}
                    >
                      Re-run Analysis
                    </Button>
                  </>
                ) : project.aiStatus === 'running' || project.aiStatus === 'analyzing' || project.aiStatus === 'scoring' ? (
                  <Badge variant="info" className="text-xs font-medium">
                    Running
                  </Badge>
                ) : project.aiStatus === 'failed' ? (
                  <>
                    <Badge variant="critical" className="text-xs font-medium">
                      Analysis Failed
                    </Badge>
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium"
                      onClick={triggerAiAudit}
                      disabled={aiProgressUI.isRunning}
                    >
                      Retry Analysis
                    </Button>
                  </>
                ) : project.aiStatus === 'cancelled' ? (
                  <>
                    <Badge variant="info" className="text-xs font-medium">
                      Processing
                    </Badge>
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium"
                      disabled
                    >
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Running... ({aiProgressUI.progress}%)
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary" className="text-xs font-medium">
                      Pending
                    </Badge>
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium"
                      onClick={triggerAiAudit}
                      disabled={aiProgressUI.isRunning}
                    >
                      Start AI Audit
                    </Button>
                  </>
                )}
              </>
            ) : (
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium"
                onClick={() => setIsAIModalOpen(true)}
              >
                Create AI Visibility Project
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* HERO CARD LAYOUT - Left Content + Right Circles */}
      <Card className="motion-safe:transition-all duration-300 ease-out rounded-2xl border shadow-sm bg-card p-8 hover:shadow-lg hover:-translate-y-[2px] hover:border-muted-foreground/30">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* LEFT SIDE - Content Section */}
          <div className="flex-1">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">AI SEO Scores</h2>
              
              <p className="text-muted-foreground leading-relaxed">
                Comprehensive AI-powered analysis of your website's SEO performance. Our advanced algorithms evaluate technical optimization, content intelligence, and authority metrics to provide actionable insights for improved search visibility.
              </p>
              
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                  Technical Optimization
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                  Content Intelligence
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                  Authority & Performance Metrics
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT SIDE - 7 Small Circles */}
          <div className="flex-1">
            <div className="space-y-6">
              {/* Row 1: 2 Circles */}
              <div className="flex justify-center gap-6">
                {/* Tech Circle */}
                <div className="flex flex-col items-center">
                  <CircularProgress 
                    percentage={Math.round(project?.summary?.categoryAverages?.ai_impact || 0)} 
                    size={100} 
                    strokeWidth={8} 
                    color={AI_CATEGORY_COLOR_MAP["AI Impact"]?.text || "text-white"} 
                  />
                  <span className="text-xs text-muted-foreground mt-2">Ai Impact</span>
                </div>
                
                {/* Meta Circle */}
                <div className="flex flex-col items-center">
                  <CircularProgress 
                    percentage={Math.round(project?.summary?.categoryAverages?.aeo_score || 0)} 
                    size={100} 
                    strokeWidth={8} 
                    color={AI_CATEGORY_COLOR_MAP["AEO Score"]?.text || "text-white"} 
                  />
                  <span className="text-xs text-muted-foreground mt-2">AEO </span>
                </div>
              </div>
              
              {/* Row 2: 3 Circles - Center circle larger */}
              <div className="flex justify-center gap-6">
                {/* Structure Circle */}
                <div className="flex flex-col items-center">
                  <CircularProgress 
                    percentage={Math.round(project?.summary?.categoryAverages?.citation_probability || 0)} 
                    size={100} 
                    strokeWidth={8} 
                    color={AI_CATEGORY_COLOR_MAP["Citation Probability"]?.text || "text-white"} 
                  />
                  <span className="text-xs text-muted-foreground mt-2">Citation Probability</span>
                </div>
                
                {/* Content Circle - LARGER AND PROMINENT */}
                <div className="flex flex-col items-center">
                  <CircularProgress 
                    percentage={Math.round(project?.summary?.overallScore || 0)} 
                    size={120} 
                    strokeWidth={10} 
                    color={AI_CATEGORY_COLOR_MAP["Overall AI Score"]?.text || "text-yellow-400"} 
                  />
                  <span className="text-xs text-muted-foreground mt-2 font-semibold text-blue-600">Overall Ai Score</span>
                </div>
                
                {/* Authority Circle */}
                <div className="flex flex-col items-center">
                  <CircularProgress 
                    percentage={Math.round(project?.summary?.categoryAverages?.topical_authority || 0)} 
                    size={100} 
                    strokeWidth={8} 
                    color={AI_CATEGORY_COLOR_MAP["Topical Authority"]?.text || "text-white"} 
                  />
                  <span className="text-xs text-muted-foreground mt-2">Topical Authority</span>
                </div>
              </div>
              
              {/* Row 3: 2 Circles */}
              <div className="flex justify-center gap-6">
                {/* Performance Circle */}
                <div className="flex flex-col items-center">
                  <CircularProgress 
                    percentage={Math.round(project?.summary?.categoryAverages?.voice_intent || 0)} 
                    size={100} 
                    strokeWidth={8} 
                    color={AI_CATEGORY_COLOR_MAP["Voice Intent"]?.text || "text-white"} 
                  />
                  <span className="text-xs text-muted-foreground mt-2">Voice intent</span>
                </div>
                
                {/* UX Circle */}
                <div className="flex flex-col items-center">
                  <CircularProgress 
                    percentage={Math.round(project?.summary?.categoryAverages?.llm_readiness || 0)} 
                    size={100} 
                    strokeWidth={8} 
                    color={AI_CATEGORY_COLOR_MAP["LLM Readiness"]?.text || "text-white"} 
                  />
                  <span className="text-xs text-muted-foreground mt-2">LLM Readliness</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      
            
      {/* AI PROGRESS MODAL */}
      {console.log("🔍 RENDER CHECK - isModalOpen:", isModalOpen)}
      <AuditProgressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isRunning={aiProgressUI.isRunning}
        currentStage={aiProgressUI.stage}
        percentage={aiProgressUI.percentage}
        message={aiProgressUI.message}
        jobType="AI"
        onViewResults={handleViewResults}
      />
    </div>
  );
}
