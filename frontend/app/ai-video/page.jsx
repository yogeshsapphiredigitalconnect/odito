"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { generateScript, generateVideo, getJobStatus, getGeneratedVideo, downloadVideo } from '@/services/aiVideoApi';
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
  
  // Video persistence state
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [existingVideoLoading, setExistingVideoLoading] = useState(false);
  const [videoFileName, setVideoFileName] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  // Progress tracking state
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [lastProgressUpdate, setLastProgressUpdate] = useState(null);

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
    
    // Reset progress state
    setProgress(0);
    setCurrentStep('');
    setLastProgressUpdate(Date.now());

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
        
        // Store jobId in localStorage for page refresh handling
        localStorage.setItem(`videoJob_${activeProject._id}`, response.jobId);
        
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
          const { status, progress: jobProgress = 0, currentStep: step = '', result_data } = jobResponse.data;
          
          console.log('Job status update:', { jobId, status, progress: jobProgress, currentStep: step });
          
          // Update state with new progress information
          setVideoStatus(status);
          
          // Validate and update progress (safety checks)
          const validatedProgress = Math.max(0, Math.min(100, jobProgress));
          setProgress(prevProgress => {
            // Ensure progress never decreases
            return validatedProgress > prevProgress ? validatedProgress : prevProgress;
          });
          
          setCurrentStep(step);
          
          // Check for completion
          if (status === 'completed' && result_data) {
            console.log('Video generation completed!');
            clearInterval(interval);
            setPollingInterval(null);
            setVideoLoading(false);
            setVideoUrl(result_data.videoUrl);
            setVideoFileName(result_data.videoFileName || '');
            setIsVideoReady(true);
            setLastProgressUpdate(null);
            localStorage.removeItem(`videoJob_${activeProject._id}`);
            // Fetch the saved video record to ensure consistency
            setTimeout(() => fetchExistingVideo(), 1000);
            return;
          }
          
          // Check for failure
          if (status === 'failed') {
            console.error('Video generation failed');
            clearInterval(interval);
            setPollingInterval(null);
            setVideoError('Video generation failed. Please try again.');
            setVideoLoading(false);
            setLastProgressUpdate(null);
            localStorage.removeItem(`videoJob_${activeProject._id}`);
            return;
          }
          
          // Update last progress time
          setLastProgressUpdate(Date.now());
        } else {
          console.error('Invalid job response:', jobResponse);
        }
        
        // For other statuses (pending, processing), continue polling
      } catch (error) {
        console.error('Error polling job status:', error);
        
        // Handle specific errors
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          console.error('Job not found - may have been deleted');
          clearInterval(interval);
          setPollingInterval(null);
          setVideoError('Job was deleted or not found. Please start a new video generation.');
          setVideoLoading(false);
          // CRITICAL: Clean up all job state
          setVideoJobId(null);
          setVideoStatus('');
          setProgress(0);
          setCurrentStep('');
          setLastProgressUpdate(null);
          localStorage.removeItem(`videoJob_${activeProject._id}`);
          return;
        }
        
        // For other errors, continue polling but don't break
        console.warn('Temporary polling error, continuing...');
      }
    }, 3000); // Check every 3 seconds
    
    setPollingInterval(interval);
    
    // Enhanced timeout detection
    const timeoutCheck = setInterval(() => {
      if (lastProgressUpdate && Date.now() - lastProgressUpdate > 30000) {
        console.warn('Job progress timeout detected - no updates for 30 seconds');
        setVideoError('Video generation is taking longer than expected. The process is still running, but you may want to check back later.');
        clearInterval(timeoutCheck);
      }
    }, 10000); // Check every 10 seconds
    
    // Store timeout check for cleanup
    setTimeout(() => {
      clearInterval(timeoutCheck);
    }, 180000); // Stop checking after 3 minutes
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Fetch existing video on component mount and project change
  useEffect(() => {
    if (activeProject && !videoLoading && !videoJobId) {
      fetchExistingVideo();
    }
  }, [activeProject]);

  // Fetch existing video function
  const fetchExistingVideo = async () => {
    if (!activeProject) return;
    
    setExistingVideoLoading(true);
    try {
      console.log('Fetching existing video for project:', activeProject._id);
      const response = await getGeneratedVideo(activeProject._id);
      
      if (response && response.success && response.video) {
        const { video } = response;
        console.log('Found existing video:', video);
        
        if (video.status === 'RENDERED' && video.videoUrl) {
          setVideoUrl(video.videoUrl);
          setVideoFileName(video.videoFileName || '');
          setIsVideoReady(true);
          setVideoStatus('completed');
          console.log('Video is ready for display', { videoUrl: video.videoUrl, fileName: video.videoFileName });
        } else if (video.status === 'PROCESSING') {
          console.log('Video is still processing, checking for job...');
          // Optionally resume polling if there's an active job
          if (video.jobId) {
            setVideoJobId(video.jobId);
            setVideoLoading(true);
            setVideoStatus('processing');
            startPolling(video.jobId);
          }
        } else if (video.status === 'FAILED') {
          setVideoError('Previous video generation failed. Please try again.');
        }
      } else {
        console.log('No existing video found for project - this is normal if no video has been generated yet');
        setIsVideoReady(false);
      }
    } catch (error) {
      console.error('Error fetching existing video:', error);
      // Don't show error to user for 404 (no video exists)
      if (!error.message.includes('404')) {
        setVideoError('Failed to check for existing video');
      }
      setIsVideoReady(false);
    } finally {
      setExistingVideoLoading(false);
    }
  };

  // Handle page refresh - resume polling if there's an active job
  useEffect(() => {
    if (activeProject && !videoLoading && !videoUrl && !existingVideoLoading) {
      const storedJobId = localStorage.getItem(`videoJob_${activeProject._id}`);
      
      if (storedJobId) {
        console.log('Found active job after page refresh:', storedJobId);
        
        // CRITICAL: First verify if job still exists before resuming
        const verifyJob = async () => {
          try {
            const jobResponse = await getJobStatus(storedJobId);
            if (!jobResponse.success || !jobResponse.data) {
              console.log('Job no longer exists, cleaning up:', storedJobId);
              // Clean up stale job
              localStorage.removeItem(`videoJob_${activeProject._id}`);
              setVideoJobId(null);
              setVideoLoading(false);
              setVideoStatus('');
              setProgress(0);
              setCurrentStep('');
              setLastProgressUpdate(null);
              // Try fetching existing video instead
              fetchExistingVideo();
              return;
            }
            
            // Job exists, resume polling
            setVideoJobId(storedJobId);
            setVideoLoading(true);
            setVideoStatus('processing');
            setLastProgressUpdate(Date.now());
            startPolling(storedJobId);
          } catch (error) {
            console.log('Job verification failed, cleaning up:', error);
            // Job likely deleted, clean up
            localStorage.removeItem(`videoJob_${activeProject._id}`);
            setVideoJobId(null);
            setVideoLoading(false);
            setVideoStatus('');
            setProgress(0);
            setCurrentStep('');
            setLastProgressUpdate(null);
            // Try fetching existing video instead
            fetchExistingVideo();
          }
        };
        
        verifyJob();
      }
    }
  }, [activeProject, existingVideoLoading]); // Include existingVideoLoading to prevent race conditions

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

  // Download video handler
  const handleDownloadVideo = async () => {
    if (!videoFileName) {
      setVideoError('Video filename not available for download');
      return;
    }

    setDownloadLoading(true);
    try {
      console.log('Starting video download:', videoFileName);
      
      // Call backend download API
      const blob = await downloadVideo(videoFileName);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate dynamic filename with project name and timestamp
      const projectName = activeProject?.project_name || activeProject?.name || 'video';
      const cleanProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const timestamp = new Date().toISOString().slice(0, 10);
      const dynamicFilename = `${cleanProjectName}_video_${timestamp}.mp4`;
      
      link.download = dynamicFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL
      window.URL.revokeObjectURL(url);
      
      console.log('Video download completed:', dynamicFilename);
      
    } catch (error) {
      console.error('Download failed:', error);
      setVideoError(error.message || 'Failed to download video. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };

  // Manual cleanup handler for stuck jobs
  const handleClearJob = () => {
    console.log('Manual job cleanup triggered');
    
    // Clear all job state
    setVideoJobId(null);
    setVideoLoading(false);
    setVideoStatus('');
    setProgress(0);
    setCurrentStep('');
    setVideoError('');
    setLastProgressUpdate(null);
    
    // Clear polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    // Clear localStorage
    if (activeProject) {
      localStorage.removeItem(`videoJob_${activeProject._id}`);
    }
    
    console.log('Job state cleared successfully');
  };

  // Show loading state while checking authentication, projects, and existing video
  if (isLoading || projectsLoading || existingVideoLoading) {
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
                    {videoError.includes('deleted') || videoError.includes('not found') ? (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearJob}
                          className="text-xs"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Clear Job State
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Enhanced Progress Display */}
              {videoJobId && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="space-y-3">
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
                          {videoStatus === 'completed' ? '🎉 Your video is ready!' : 
                           videoStatus === 'failed' ? 'Video generation failed' :
                           'Your video is being generated...'}
                        </h4>
                        {videoStatus === 'processing' && currentStep && (
                          <p className="text-sm text-blue-700 mt-1">{currentStep}</p>
                        )}
                        {videoStatus === 'pending' && (
                          <p className="text-sm text-blue-700 mt-1">Job queued...</p>
                        )}
                        {videoStatus === 'completed' && (
                          <p className="text-sm text-green-700 mt-1">Video completed successfully!</p>
                        )}
                        {videoStatus === 'failed' && (
                          <p className="text-sm text-red-700 mt-1">Video generation failed</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {videoStatus === 'processing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-blue-700">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                      </div>
                    )}
                    
                    {/* Job ID */}
                    {videoJobId && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-blue-600">
                          Job ID: {videoJobId}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearJob}
                          className="text-xs h-6 px-2"
                          title="Clear this job if it's stuck or deleted"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Generate Button - Hidden during processing or when video is ready */}
              {!videoLoading && !isVideoReady && (
                <div>
                  <Button 
                    onClick={handleGenerateVideo}
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={existingVideoLoading}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {existingVideoLoading ? 'Checking...' : 'Generate Video'}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Video Display - Enhanced for completion */}
          {(videoUrl && isVideoReady) && (
            <Card className="p-6 border-2 border-green-200 bg-green-50/50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-green-800">
                    <Play className="h-5 w-5" />
                    🎉 Your video is ready!
                  </h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                </div>
                
                <div className="border-2 border-green-200 rounded-lg overflow-hidden bg-white">
                  <video 
                    controls 
                    className="w-full"
                    src={videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownloadVideo}
                    disabled={downloadLoading || !videoFileName}
                  >
                    {downloadLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download Video
                      </>
                    )}
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
