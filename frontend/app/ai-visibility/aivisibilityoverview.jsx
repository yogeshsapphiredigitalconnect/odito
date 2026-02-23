"use client"

import { useState, useEffect, useMemo } from 'react';
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

// Helper to determine color based on score
const getScoreColor = (score) => {
  if (score >= 75) return {
    text: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/30',
    glow: 'glow-cyan'
  };
  if (score >= 40) return {
    text: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    glow: 'glow-amber'
  };
  return {
    text: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    glow: 'glow-red'
  };
};

// Helper to calculate progress ring stroke-dashoffset
const getStrokeDashoffset = (score, radius) => {
  const circumference = 2 * Math.PI * radius;
  return circumference - (score / 100) * circumference;
};

// Reusable Category Card Component
const CategoryCard = ({ categoryKey, score }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const colorConfig = AI_CATEGORY_COLOR_MAP[categoryKey] || {
    text: "text-slate-400",
    gradient: "from-slate-400 to-slate-600"
  };
  
  // Direct color values for SVG to avoid Tailwind class limitations
  const categoryColors = {
    ai_impact: { color: "#06b6d4", glow: 'glow-cyan' },
    citation_probability: { color: "#10b981", glow: 'glow-green' },
    llm_readiness: { color: "#a855f7", glow: 'glow-purple' },
    aeo_score: { color: "#3b82f6", glow: 'glow-blue' },
    topical_authority: { color: "#ec4899", glow: 'glow-pink' },
    voice_intent: { color: "#f97316", glow: 'glow-amber' }
  };
  
  const currentCategory = categoryColors[categoryKey] || { color: "#64748b", glow: 'glow-red' };
  const scoreBasedGlow = score >= 75 ? 'glow-green' : score >= 40 ? 'glow-amber' : 'glow-red';
  
  const formatCategoryLabel = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };
  
  const getCategoryIcon = (key) => {
    const iconMap = {
      ai_impact: 'terminal',
      citation_probability: 'description',
      llm_readiness: 'model_training',
      aeo_score: 'architecture',
      topical_authority: 'hub',
      voice_intent: 'record_voice_over'
    };
    return iconMap[key] || 'category';
  };
  
  const getStatusLabel = (score) => {
    if (score >= 75) return 'Optimal';
    if (score >= 40) return 'Moderate';
    return 'Critical';
  };

  return (
    <div className={`glass-card rounded-[20px] p-8 ${scoreBasedGlow} transition-all duration-500 ease-out hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className={`size-8 rounded-lg ${colorConfig.text}/20 flex items-center justify-center ${colorConfig.text}`}>
              <span className="material-symbols-outlined text-sm">{getCategoryIcon(categoryKey)}</span>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              score >= 75 ? 'bg-green-400/20 text-green-400 border border-green-400/30' :
              score >= 40 ? 'bg-orange-400/20 text-orange-400 border border-orange-400/30' :
              'bg-red-400/20 text-red-400 border border-red-400/30'
            }`}>
              {getStatusLabel(score)}
            </span>
          </div>
          <h4 className="font-bold text-lg text-slate-200 mb-1">{formatCategoryLabel(categoryKey)}</h4>
          <p className="text-sm text-slate-500">
            {categoryKey === 'ai_impact' && 'Schema.org and LLM-friendly structures'}
            {categoryKey === 'citation_probability' && 'Content citation likelihood in AI responses'}
            {categoryKey === 'llm_readiness' && 'Tokenization efficiency for training data'}
            {categoryKey === 'aeo_score' && 'Answer Engine Optimization readiness'}
            {categoryKey === 'topical_authority' && 'Domain expertise and topical depth'}
            {categoryKey === 'voice_intent' && 'Voice search and conversational AI compatibility'}
          </p>
        </div>
        
        <div className="relative size-14 shrink-0">
          <svg className="size-full -rotate-90">
            <circle 
              cx="28" 
              cy="28" 
              fill="transparent" 
              r={radius} 
              stroke="#374151" 
              strokeWidth="4"
            />
            <circle
              cx="28"
              cy="28"
              fill="transparent"
              r={radius}
              stroke={currentCategory.color}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              strokeWidth="4"
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-bold ${colorConfig.text}`}>
            {Math.round(score)}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Hero Score Card Component
const HeroScoreCard = ({ overallScore, pagesScored, scoring_version }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;
  const scoreColors = getScoreColor(overallScore);
  const grade = overallScore >= 90 ? 'GRADE A+' : overallScore >= 80 ? 'GRADE A' : overallScore >= 70 ? 'GRADE B' : 'GRADE C';

  return (
    <div className="xl:col-span-2 glass-card rounded-[20px] p-10 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 blur-[100px] -z-10"></div>
      
      {/* Circular Progress Ring */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="size-[180px] -rotate-90">
          <circle className="text-slate-700" cx="90" cy="90" fill="transparent" r={radius} stroke="currentColor" strokeWidth="12"></circle>
          <circle 
            className={scoreColors.text} 
            cx="90" 
            cy="90" 
            fill="transparent" 
            r={radius} 
            stroke="currentColor" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth="12"
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          ></circle>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tracking-tight text-slate-200">{overallScore}<span className="text-2xl text-cyan-400">%</span></span>
          <div className="mt-1 px-3 py-0.5 bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 rounded-full text-xs font-bold">{grade}</div>
        </div>
      </div>

      {/* Executive Summary Content */}
      <div className="flex-1 space-y-4">
        <h3 className="text-2xl font-bold text-slate-200">AI Visibility Health</h3>
        <p className="text-slate-400 leading-relaxed max-w-lg">
          Your domain maintains an excellence grade in LLM training readiness and semantic density. Crawler accessibility is fully optimized across all major AI agents (OpenAI, Anthropic, Perplexity).
        </p>
        <div className="flex gap-4 pt-4">
          <button className="bg-cyan-400 hover:bg-cyan-400/90 text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-cyan-400/20">
            Download Detailed Audit
          </button>
          <button className="bg-slate-700/50 hover:bg-slate-700 text-slate-200 px-6 py-2.5 rounded-full font-bold text-sm border border-slate-600 transition-all">
            Historical Compare
          </button>
        </div>
      </div>
    </div>
  );
};

// Metric Panel Component
const MetricPanel = ({ pagesScored, scoring_version, aiStatus }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="glass-card rounded-[20px] p-6 flex flex-col justify-between border-l-4 border-l-cyan-400/40">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pages Analyzed</p>
        <div className="mt-4">
          <p className="text-2xl font-bold font-mono text-slate-200">{pagesScored.toLocaleString()}</p>
          <p className="text-green-400 text-xs font-bold mt-1">+12.4% vs last week</p>
        </div>
      </div>
      
      <div className="glass-card rounded-[20px] p-6 flex flex-col justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Last Processed</p>
        <div className="mt-4">
          <p className="text-2xl font-bold font-mono text-slate-200">140<span className="text-sm text-slate-500 uppercase ml-1">ms</span></p>
          <p className="text-slate-500 text-xs font-bold mt-1">Global average latency</p>
        </div>
      </div>
      
      <div className="glass-card rounded-[20px] p-6 flex flex-col justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scoring Engine</p>
        <div className="mt-4">
          <p className="text-2xl font-bold font-mono text-slate-200">{scoring_version}</p>
          <p className="text-cyan-400 text-xs font-bold mt-1">Stable Release</p>
        </div>
      </div>
      
      <div className="glass-card rounded-[20px] p-6 flex flex-col justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Status</p>
        <div className="mt-4">
          <p className="text-2xl font-bold font-mono text-green-400">{aiStatus}</p>
          <p className="text-slate-500 text-xs font-bold mt-1">Zero critical crawl blocks</p>
        </div>
      </div>
    </div>
  );
};

// Insights Section Component
const InsightsSection = () => {
  return (
    <section>
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-cyan-400">auto_awesome</span>
        AI Performance Intelligence
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Key Strengths */}
        <div className="glass-card rounded-[20px] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-green-400/10 flex items-center justify-center text-green-400">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <h4 className="font-bold text-slate-200">Key Strengths</h4>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-4 group">
              <div className="mt-1 size-5 rounded-full border-2 border-green-400/30 flex items-center justify-center shrink-0">
                <span className="size-1.5 rounded-full bg-green-400"></span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">High Content Semantic Density</p>
                <p className="text-xs text-slate-500 mt-0.5">Top 5% in industry for entity recognition readiness.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 group">
              <div className="mt-1 size-5 rounded-full border-2 border-green-400/30 flex items-center justify-center shrink-0">
                <span className="size-1.5 rounded-full bg-green-400"></span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Optimized Robots.txt</p>
                <p className="text-xs text-slate-500 mt-0.5">Perfect delegation of agent permissions for GPT-Bot.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 group">
              <div className="mt-1 size-5 rounded-full border-2 border-green-400/30 flex items-center justify-center shrink-0">
                <span className="size-1.5 rounded-full bg-green-400"></span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Schema.org Compliance</p>
                <p className="text-xs text-slate-500 mt-0.5">98% valid semantic markup across core templates.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Optimization Opportunities */}
        <div className="glass-card rounded-[20px] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400">
              <span className="material-symbols-outlined">priority_high</span>
            </div>
            <h4 className="font-bold text-slate-200">Optimization Opportunities</h4>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-4 group">
              <div className="mt-1 size-5 rounded-full border-2 border-red-400/30 flex items-center justify-center shrink-0">
                <span className="size-1.5 rounded-full bg-red-400"></span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Knowledge Graph Connectivity</p>
                <p className="text-xs text-slate-500 mt-0.5">Fragmented internal linking preventing entity association.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 group">
              <div className="mt-1 size-5 rounded-full border-2 border-orange-400/30 flex items-center justify-center shrink-0">
                <span className="size-1.5 rounded-full bg-orange-400"></span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Attribution Latency</p>
                <p className="text-xs text-slate-500 mt-0.5">Slow crawler refresh rate for new blog updates (4d delay).</p>
              </div>
            </li>
            <li className="flex items-start gap-4 group">
              <div className="mt-1 size-5 rounded-full border-2 border-orange-400/30 flex items-center justify-center shrink-0">
                <span className="size-1.5 rounded-full bg-orange-400"></span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Image Descriptive Meta</p>
                <p className="text-xs text-slate-500 mt-0.5">40% of visual assets lack GPT-vision accessible descriptions.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

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

      {/* NEW DASHBOARD DESIGN */}
      <main className="max-w-[1440px] mx-auto space-y-8">
        {/* Breadcrumb & Last Updated */}
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <span>Analytics</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-slate-300">Visibility Overview</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Enterprise Health Report</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Last Scanned</p>
            <p className="text-sm font-medium text-slate-200">2 minutes ago • <span className="text-primary">{project?.scoring_version || 'v2.4'}</span></p>
          </div>
        </div>

        {/* Hero Card Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <HeroScoreCard 
            overallScore={Math.round(project?.summary?.overallScore || 0)} 
            pagesScored={project?.summary?.pagesScored || 0} 
            scoring_version={project?.scoring_version || 'v2.4'} 
          />
          <MetricPanel 
            pagesScored={project?.summary?.pagesScored || 0} 
            scoring_version={project?.scoring_version || 'v2.4'} 
            aiStatus={project?.aiStatus || 'Unknown'} 
          />
        </div>

        {/* Category Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Category Analysis</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="size-2 rounded-full bg-red-400"></span>
                Critical
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-3">
                <span className="size-2 rounded-full bg-orange-400"></span>
                Warning
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-3">
                <span className="size-2 rounded-full bg-green-400"></span>
                Optimal
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(project?.summary?.categoryAverages || {}).map(([categoryKey, score]) => (
              <CategoryCard
                key={categoryKey}
                categoryKey={categoryKey}
                score={score}
              />
            ))}
          </div>
        </section>

        {/* Strategic Insights Section */}
        <InsightsSection />
      </main>

      
            
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
