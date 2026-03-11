"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/apiService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Globe, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Pause,
  Eye,
  ExternalLink,
  Pencil
} from 'lucide-react';

export default function ProjectsList() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjects(1, 10);
      
      if (response.success) {
        setProjects(response.data.projects);
        setStats(response.data.stats);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-orange-500" />;
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
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-12 w-16" />
            </Card>
          ))}
        </div>
        
        {/* Projects Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3 mb-3">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-4 w-20 flex-1" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
                <Skeleton className="h-3 w-14 mx-auto" />
                <Skeleton className="h-3 w-24 mx-auto" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
              
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Projects</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchProjects}>Try Again</Button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first SEO project to get started with website analysis.
        </p>
        <Button onClick={() => window.location.href = '/dashboard/on-page/new'}>
          Create Your First Project
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeProjects}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pages</p>
                <p className="text-2xl font-bold">{stats.totalPages || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Issues Found</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalIssues || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map((project) => (
          <Card key={project._id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            {/* Project Header */}
            <div className="space-y-3 mb-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold line-clamp-2 flex-1">{project.project_name}</h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {getStatusIcon(project.status)}
                  <Badge className={`${getStatusColor(project.status)} text-xs px-2 py-1`}>
                    {project.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <a 
                  href={project.main_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline line-clamp-1"
                >
                  {project.main_url}
                </a>
              </div>
            </div>

            {/* Footer Info */}
            <div className="space-y-2">
              {project.business_type && (
                <div className="text-xs text-muted-foreground text-center">
                  Business Type: {project.business_type}
                </div>
              )}
              {project.industry && (
                <div className="text-xs text-muted-foreground text-center">
                  Industry: {project.industry}
                </div>
              )}
              {project.location && (
                <div className="text-xs text-muted-foreground text-center">
                  Location: {project.location}
                </div>
              )}
              <div className="text-xs text-muted-foreground text-center">
                Created: {new Date(project.created_at).toLocaleDateString()}
              </div>
              {project.last_scraped_at && (
                <div className="text-xs text-muted-foreground text-center">
                  Last scraped: {new Date(project.last_scraped_at).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={() => router.push(`/dashboard/on-page/${project._id}`)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button 
                size="sm"
                className="flex-1 text-xs h-8"
              >
                <Pencil className="h-3 w-3 mr-1" />
                Edit Project
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
