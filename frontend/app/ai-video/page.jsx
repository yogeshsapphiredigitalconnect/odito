"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { AIVideoGenerator } from '@/components/ai-video';
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
  ChevronDown
} from 'lucide-react';

export default function AIVideoReport() {
  const { user, logout, isLoading } = useAuth();
  const { activeProject, projects, isLoading: projectsLoading, setActiveProject } = useProject();
  const router = useRouter();

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
                  // Auto-select first project
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
          {/* AI Video Generator Component */}
          <AIVideoGenerator 
            projectId={activeProject._id}
            className="w-full"
          />

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-700">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-1">AI-Powered Script Generation</h4>
                    <p className="text-slate-400 text-sm">
                      Our advanced AI analyzes your complete SEO audit data, including performance metrics, 
                      technical issues, and AI visibility scores to create a compelling narrated script 
                      tailored to your business needs.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-1">Professional Video Script</h4>
                    <p className="text-slate-400 text-sm">
                      Get a ready-to-use video script with clear narration, professional tone, and 
                      actionable insights. Perfect for creating marketing videos, client presentations, 
                      or team training materials.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Features Card */}
          <Card className="bg-slate-900 border-slate-700">
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium mb-1">What's Included in Your Video Script</h4>
                  <div className="mt-3 grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-slate-300 text-sm">Company introduction & domain overview</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-slate-300 text-sm">Overall performance score & grade</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-slate-300 text-sm">Key metrics breakdown (SEO, AI, Performance)</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-slate-300 text-sm">Top strengths & competitive advantages</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-slate-300 text-sm">Critical issues & business impact</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-slate-300 text-sm">Actionable recommendations & next steps</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
