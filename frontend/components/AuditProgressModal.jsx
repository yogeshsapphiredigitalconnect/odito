"use client";

import { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  AlertCircle, 
  X,
  ExternalLink
} from 'lucide-react';
import { ConcentricLoader } from '@/components/ui/concentric-loader';

const AUDIT_STAGES = [
  { 
    key: 'LINK_DISCOVERY', 
    name: 'Discover Links', 
    description: 'Finding all internal and external URLs',
    estimatedTime: '2-5 min'
  },
  { 
    key: 'PAGE_SCRAPING', 
    name: 'Crawl Pages', 
    description: 'Analyzing page content and structure',
    estimatedTime: '3-8 min'
  },
  { 
    key: 'PERFORMANCE_MOBILE', 
    name: 'Mobile Performance', 
    description: 'Testing mobile user experience',
    estimatedTime: '1-3 min'
  },
  { 
    key: 'PERFORMANCE_DESKTOP', 
    name: 'Desktop Performance', 
    description: 'Testing desktop user experience',
    estimatedTime: '1-3 min'
  },
  { 
    key: 'PAGE_ANALYSIS', 
    name: 'SEO Analysis', 
    description: 'Analyzing SEO metrics and issues',
    estimatedTime: '2-4 min'
  }
];

const initialStageState = {
  currentStage: null,
  overallProgress: 0,
  message: 'Initializing audit...',
  subtext: 'Starting analysis process',
  completedStages: [],
  isCompleted: false,
  hasError: false,
  errorMessage: '',
  projectUrl: ''
};

export default function AuditProgressModal({
  isOpen,
  onClose,
  isRunning,
  currentStage,
  percentage,
  message,
  onCancel,
  onViewResults,
  jobType = "SEO"
}) {
  console.log(" MODAL STATE CHECK", { isOpen, isRunning });
  const [internalProgress, setInternalProgress] = useState({
    currentStage: currentStage || null,
    overallProgress: percentage || 0,
    message: message || 'Initializing audit...',
    subtext: 'Starting analysis process',
    completedStages: [],
    isCompleted: false,
    hasError: false,
    errorMessage: ''
  });
  const [showCompletion, setShowCompletion] = useState(false);

  // Update internal progress when props change
  useEffect(() => {
    console.log('🔥 PROGRESS UPDATE:', { currentStage, percentage, message });
    setInternalProgress({
      currentStage: currentStage || null,
      overallProgress: percentage || 0,
      message: message || 'Initializing audit...',
      subtext: 'Starting analysis process',
      completedStages: [],
      isCompleted: percentage === 100,
      hasError: currentStage === 'ERROR',
      errorMessage: currentStage === 'ERROR' ? message : ''
    });
    
    // Reset completion state when progress updates
    if (percentage < 100) {
      setShowCompletion(false);
    }
  }, [currentStage, percentage, message]);

  // Auto-close on completion after delay
  useEffect(() => {
    if (internalProgress.isCompleted && !showCompletion) {
      setShowCompletion(true);
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-close after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [internalProgress.isCompleted, showCompletion, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl shadow-2xl border">
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
              🔍
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {jobType === "AI" ? "AI Visibility Analysis" : "SEO Audit"} in progress
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                We're analyzing your website
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-6 px-6 py-10">

          {/* Loader */}
          <div className="[animation-duration:1.6s]">
            <ConcentricLoader />
          </div>

          {/* Status text */}
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-700">
              {internalProgress.hasError ? 'Audit Failed' : 
               internalProgress.isCompleted ? 'Audit Completed' : 
               internalProgress.message || 'Initializing audit'}
            </p>
            <p className="text-xs text-blue-600">
              {internalProgress.hasError ? internalProgress.errorMessage : internalProgress.subtext}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Overall progress</span>
              <span>{internalProgress.overallProgress}%</span>
            </div>

            <Progress value={internalProgress.overallProgress} className="h-2" />
          </div>

        </div>

        <DialogFooter className="flex justify-end px-6 py-4 border-t bg-muted/30">
          {isRunning && !internalProgress.isCompleted && (
            <Button variant="ghost" className="text-destructive" onClick={onCancel}>
              Cancel audit
            </Button>
          )}
          {internalProgress.isCompleted && (
            <Button onClick={onViewResults || onClose}>
              View Results
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
