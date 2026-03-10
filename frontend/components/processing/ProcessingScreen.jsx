"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StepList from './StepList';
import apiService from '@/lib/apiService';

const ProcessingScreen = ({ projectId, onDone }) => {
  const router = useRouter();
  
  // Complete backend pipeline stages with icons and display names
  const steps = [
    { label: "Discover Links", icon: "�", key: 'LINK_DISCOVERY' },
    { label: "Technical Domain", icon: "⚙️", key: 'TECHNICAL_DOMAIN' },
    { label: "Crawl Pages", icon: "🕷", key: 'PAGE_SCRAPING' },
    { label: "Page Analysis", icon: "📊", key: 'PAGE_ANALYSIS' },
    { label: "SEO Scoring", icon: "🎯", key: 'SEO_SCORING' },
    { label: "Mobile Performance", icon: "📱", key: 'PERFORMANCE_MOBILE' },
    { label: "Desktop Performance", icon: "�", key: 'PERFORMANCE_DESKTOP' },
    { label: "Accessibility", icon: "♿", key: 'HEADLESS_ACCESSIBILITY' },
    { label: "Crawl Graph", icon: "�️", key: 'CRAWL_GRAPH' },
    { label: "AI Visibility", icon: "🧠", key: 'AI_VISIBILITY' },
    { label: "AI Visibility Scoring", icon: "✨", key: 'AI_VISIBILITY_SCORING' }
  ];

  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Map backend job types to step indices
  const jobStepMap = {
    'LINK_DISCOVERY': 0,
    'TECHNICAL_DOMAIN': 1,
    'PAGE_SCRAPING': 2,
    'PAGE_ANALYSIS': 3,
    'SEO_SCORING': 4,
    'PERFORMANCE_MOBILE': 5,
    'PERFORMANCE_DESKTOP': 6,
    'HEADLESS_ACCESSIBILITY': 7,
    'CRAWL_GRAPH': 8,
    'AI_VISIBILITY': 9,
    'AI_VISIBILITY_SCORING': 10
  };

  useEffect(() => {
    if (!projectId) {
      setError('Project ID is required to track audit progress');
      return;
    }

    // Real job polling logic - backend as source of truth
    const pollJobStatus = async () => {
      try {
        const response = await apiService.getAuditStatus(projectId);
        if (response.success) {
          setJobStatus(response.data);

          // Calculate completed and active steps from backend job status
          const completedSteps = [];
          const failedSteps = [];
          let currentActiveStep = -1; // -1 means no active step

          Object.entries(response.data).forEach(([jobType, status]) => {
            const stepIndex = jobStepMap[jobType];
            if (stepIndex !== undefined) {
              if (status.completed > 0) {
                completedSteps.push(stepIndex);
              }
              if (status.failed > 0) {
                failedSteps.push(stepIndex);
              }
              if (status.processing > 0) {
                currentActiveStep = Math.max(currentActiveStep, stepIndex);
              }
            }
          });

          // Check if all jobs are completed (no pending or processing jobs)
          const allJobsCompleted = Object.values(response.data).every(
            status => status.completed > 0 || status.failed > 0 || status.pending === 0
          );

          // Check if any job failed
          const hasFailedJobs = Object.values(response.data).some(
            status => status.failed > 0
          );

          if (hasFailedJobs) {
            setError('One or more jobs failed during the audit');
          } else if (allJobsCompleted && completedSteps.length > 0) {
            setIsCompleted(true);
            setTimeout(onDone, 1000);
          }
        }
      } catch (err) {
        console.error('Error polling job status:', err);
        setError('Failed to check job status');
      }
    };

    // Start polling immediately and then every 2 seconds
    pollJobStatus();
    const interval = setInterval(pollJobStatus, 2000);

    return () => clearInterval(interval);
  }, [projectId, onDone]);

  // Calculate progress based on pipeline stage completion (not job counts)
  // Each stage counts as 1 unit regardless of how many jobs it spawns
  const calculateProgress = () => {
    if (!jobStatus) return 0;

    const totalStages = steps.length;
    let completedStages = 0;

    steps.forEach((step) => {
      const stageData = jobStatus[step.key.toLowerCase()];
      if (stageData && (stageData.completed > 0 || stageData.failed > 0)) {
        completedStages++;
      }
    });

    return totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
  };

  const progress = calculateProgress();

  // Get step status from backend job data
  const getStepStatus = (stepIndex) => {
    if (!jobStatus) return 'pending';

    const step = steps[stepIndex];
    const jobData = jobStatus[step.key.toLowerCase()];

    if (!jobData) return 'pending';

    if (jobData.failed > 0) return 'failed';
    if (jobData.completed > 0) return 'completed';
    if (jobData.processing > 0) return 'processing';
    if (jobData.pending > 0) return 'pending';

    return 'pending';
  };

  // Get completed steps array for StepList
  const completedSteps = steps
    .map((_, index) => index)
    .filter(index => getStepStatus(index) === 'completed');

  // Get current active step
  const activeStep = steps
    .map((_, index) => index)
    .find(index => getStepStatus(index) === 'processing') ?? -1;

  // Auto-redirect when audit completes
  useEffect(() => {
    if (progress === 100 && completedSteps.length === steps.length) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 1500); // Wait 1.5 seconds before redirect

      return () => clearTimeout(timer);
    }
  }, [progress, completedSteps.length, steps.length, router]);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div className="glass-card" style={{ width: "100%", maxWidth: 480, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Something went wrong</div>
          <div style={{ fontSize: 14, color: "var(--text3)", marginBottom: 24 }}>{error}</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              backgroundColor: "var(--grad1)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: 480, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="url(#proc-grad)" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - progress / 100)}`}
                strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.5s" }}
              />
              <defs>
                <linearGradient id="proc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#00e5ff" />
                </linearGradient>
              </defs>
              <text x="40" y="44" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" fontFamily="'Syne', sans-serif">{Math.round(progress)}%</text>
            </svg>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            Analyzing Your Site
          </div>
          <div style={{ fontSize: 13, color: "var(--text3)" }}>
            {jobStatus
              ? `Checking progress... ${completedSteps.length}/${steps.length} stages completed`
              : 'Initializing audit...'
            }
          </div>
        </div>

        <StepList steps={steps} done={completedSteps} active={activeStep} jobStatus={jobStatus} getStepStatus={getStepStatus} />
      </div>
    </div>
  );
};

export default ProcessingScreen;
