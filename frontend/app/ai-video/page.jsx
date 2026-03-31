"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { generateScript, generateVideo, getJobStatus } from '@/services/aiVideoApi';
import { 
  Play, 
  Download, 
  Clock, 
  FileText, 
  Volume2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

export default function AIVideoReport() {
  const { user, logout, isLoading } = useAuth();
  const { activeProject, projects, isLoading: projectsLoading, setActiveProject } = useProject();
  const router = useRouter();

  // Video generation state
  const [videoJobId, setVideoJobId] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [videoStatus, setVideoStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);

  // Keep script state for fallback/reference
  const [script, setScript] = useState('');
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [scriptMetadata, setScriptMetadata] = useState(null);

  // Generate script handler
  const handleGenerateScript = async () => {
    if (!activeProject) {
      setScriptError('No project selected');
      return;
    }

    setScriptLoading(true);
    setScriptError('');
    setScript('');

    try {
      console.log('Generating script for project:', activeProject._id);

      const response = await generateScript(activeProject._id);

      if (response.success && response.script) {
        setScript(response.script);
        setScriptMetadata({
          isExisting: response.isExisting,
          processingTime: response.processingTime,
          generatedAt: new Date().toLocaleString()
        });
        console.log('Script generated successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error generating script:', error);
      setScriptError(error.message || 'Failed to generate script. Please try again.');
    } finally {
      setScriptLoading(false);
    }
  };

  // Generate video handler
  const handleGenerateVideo = async () => {
    if (!activeProject) {
      setVideoError('No project selected');
      return;
    }

    setVideoLoading(true);
    setVideoError('');
    setVideoJobId('');
    setVideoStatus('');
    setVideoUrl('');

    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    try {
      console.log('Generating video for project:', activeProject._id);

      const response = await generateVideo(activeProject._id);

      if (response.success && response.jobId) {
        setVideoJobId(response.jobId);
        setVideoStatus('pending');
        console.log('Video generation job created:', response.jobId);
        
        // Start polling for job status
        startPolling(response.jobId);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      setVideoError(error.message || 'Failed to start video generation. Please try again.');
      setVideoLoading(false);
    }
  };

  // Start polling for job status
  const startPolling = (jobId) => {
    console.log('Starting polling for job:', jobId);
    
    const interval = setInterval(async () => {
      try {
        const jobResponse = await getJobStatus(jobId);
        
        if (jobResponse.success && jobResponse.data) {
          const { status, result_data, error } = jobResponse.data;
          
          console.log('Job status update:', { jobId, status, result_data, error });
          setVideoStatus(status);
          
          if (status === 'completed') {
            // Job completed successfully
            clearInterval(interval);
            setPollingInterval(null);
            setVideoLoading(false);
            
            if (result_data && result_data.videoUrl) {
              setVideoUrl(result_data.videoUrl);
              console.log('Video generation completed:', result_data.videoUrl);
            }
          } else if (status === 'failed') {
            // Job failed
            clearInterval(interval);
            setPollingInterval(null);
            setVideoLoading(false);
            setVideoError(error?.message || 'Video generation failed. Please try again.');
            console.log('Video generation failed:', error);
          }
          // For other statuses (pending, processing), continue polling
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        // Don't stop polling on network errors, just log them
      }
    }, 3000); // Poll every 3 seconds
    
    setPollingInterval(interval);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Copy to clipboard handler
  const handleCopyScript = () => {
    if (script) {
      navigator.clipboard.writeText(script).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }).catch((error) => {
        console.error('Failed to copy:', error);
      });
    }
  };

  // Show loading state while checking authentication and projects
  if (isLoading || projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading AI Video Report...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access AI Video Report</h1>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  if (!activeProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">No Project Selected</h1>
          <p className="text-muted-foreground mb-6">
            {projects && projects.length > 0 
              ? "Please select a project to generate an AI video report."
              : "You need to create a project first before generating an AI video report."
            }
          </p>
          
          {/* Project List if available */}
          {projects && projects.length > 0 && (
            <div className="mb-6 text-left">
              <h3 className="text-sm font-medium mb-3">Available Projects:</h3>
              <div className="space-y-2">
                {projects.slice(0, 3).map(project => (
                  <button
                    key={project._id}
                    onClick={() => setActiveProject(project)}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-sm">
                      {project.project_name || project.name || 'Unknown Project'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {project._id?.slice(-8)}
                    </div>
                  </button>
                ))}
                {projects.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    ... and {projects.length - 3} more projects
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/dashboard')}>
              {projects && projects.length > 0 ? 'Go to Dashboard' : 'Create Project'}
            </Button>
            {projects && projects.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveProject(projects[0]);
                }}
              >
                Select First Project
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                AI Video Report
              </h1>
              <p className="text-muted-foreground">
                Generate a professional narrated video summary of your SEO & AI audit
              </p>
              <div className="flex items-center gap-4 mt-3">
                {/* Project Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Project:</span>
                  {projects && projects.length > 1 ? (
                    <select
                      value={activeProject?._id || ''}
                      onChange={(e) => {
                        const project = projects.find(p => p._id === e.target.value);
                        if (project) {
                          setActiveProject(project);
                          setScript('');
                          setScriptError('');
                          setScriptMetadata(null);
                        }
                      }}
                      className="text-sm bg-background border border-border rounded-md px-3 py-1 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {projects.map(project => (
                        <option key={project._id} value={project._id}>
                          {project.project_name || project.name || 'Unknown Project'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      {activeProject?.project_name || activeProject?.name || 'Unknown'}
                    </Badge>
                  )}
                </div>
                
                <Badge variant="outline" className="text-xs">
                  ID: {activeProject?._id?.slice(-8) || 'N/A'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Generate Video Section */}
          <Card className="p-6 border-2 border-primary/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Generate Your Video</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click the button below to generate a professional narrated video summary of your audit
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {videoError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">Error</h4>
                    <p className="text-sm text-red-700 mt-1">{videoError}</p>
                  </div>
                </div>
              )}

              {/* Video Status Display */}
              {videoJobId && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {videoStatus === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : videoStatus === 'failed' ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">
                        Video Generation Status
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {videoStatus === 'pending' && 'Job queued...'}
                        {videoStatus === 'processing' && 'Generating video...'}
                        {videoStatus === 'completed' && 'Video completed successfully!'}
                        {videoStatus === 'failed' && 'Video generation failed'}
                        {!videoStatus && 'Initializing...'}
                      </p>
                      {videoJobId && (
                        <p className="text-xs text-blue-600 mt-1">
                          Job ID: {videoJobId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div>
                <Button 
                  onClick={handleGenerateVideo}
                  disabled={videoLoading}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {videoLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Video
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Video Display */}
          {videoUrl && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Your Generated Video
                  </h3>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <video 
                    controls 
                    className="w-full"
                    src={videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Video
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Script Display */}
          {script && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Your Video Script
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyScript}
                  >
                    {copySuccess ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                {/* Script Content */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700 max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-mono">
                    {script}
                  </pre>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <Button 
                    variant="outline" 
                    onClick={handleGenerateScript}
                    disabled={scriptLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const element = document.createElement('a');
                      const file = new Blob([script], { type: 'text/plain' });
                      element.href = URL.createObjectURL(file);
                      element.download = `script-${activeProject?._id?.slice(-8)}-${new Date().getTime()}.txt`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
