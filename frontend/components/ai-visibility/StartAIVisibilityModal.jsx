"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import aiVisibilityService from '@/services/aiVisibilityService';

export default function StartAIVisibilityModal({ 
  isOpen, 
  onClose, 
  onStartAnalysis,
  onRefresh,
  isLoading = false 
}) {
  const [type, setType] = useState('existing');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [url, setUrl] = useState('');
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [error, setError] = useState('');
  const [urlError, setUrlError] = useState('');

  // URL validation function
  const validateUrl = (urlString) => {
    if (!urlString || urlString.trim() === '') {
      return 'Please enter a valid website URL';
    }
    
    const trimmedUrl = urlString.trim();
    
    // Check if URL has proper protocol
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return 'URL must include http:// or https://';
    }
    
    try {
      new URL(trimmedUrl);
      return '';
    } catch {
      return 'Please enter a valid website URL';
    }
  };

  // Normalize URL function
  const normalizeUrl = (urlString) => {
    if (!urlString) return '';
    
    let normalized = urlString.trim();
    
    // Add protocol if missing
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    
    // Add trailing slash if missing
    try {
      const urlObj = new URL(normalized);
      if (!urlObj.pathname.endsWith('/')) {
        urlObj.pathname += '/';
      }
      return urlObj.toString();
    } catch {
      return normalized;
    }
  };

  // Fetch projects when modal opens and type is 'existing'
  const fetchProjects = async () => {
    if (type !== 'existing') return;
    
    setProjectsLoading(true);
    setError('');
    
    try {
      console.log('Fetching projects...');
      const response = await aiVisibilityService.getSeoProjects();
      
      // ✅ CORRECT: Handle both response structures safely
      const projects = 
        response.data?.data?.projects ||
        response.data?.projects ||
        [];
      
      console.log('✅ Projects extracted:', projects.length, 'projects found');
      setProjects(projects);
      
      if (projects.length === 0) {
        setError('No projects found');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setProjectsLoading(false);
    }
  };

  // Monitor projects state changes
  useEffect(() => {
    console.log('Projects state updated:', projects.length, 'projects');
  }, [projects]);

  // Monitor modal open/close
  useEffect(() => {
    if (isOpen && type === 'existing') {
      fetchProjects();
    }
  }, [isOpen, type]);

  // Handle type change
  const handleTypeChange = (newType) => {
    setType(newType);
    setSelectedProjectId('');
    setUrl('');
    setError('');
    setUrlError('');
    
    if (newType === 'existing') {
      fetchProjects();
    }
  };

  // Handle URL change
  const handleUrlChange = (value) => {
    setUrl(value);
    setUrlError('');
    setError('');
  };

  // Handle URL blur (validate on blur)
  const handleUrlBlur = () => {
    if (type === 'new' && url) {
      const validationError = validateUrl(url);
      setUrlError(validationError);
    }
  };

  // Check if continue button should be disabled
  const isContinueDisabled = () => {
    if (isLoading) return true;
    
    if (!type) return true;
    
    if (type === 'existing') {
      if (!selectedProjectId) return true;
      
      // Find selected project
      const selectedProject = projects.find((p) => p._id === selectedProjectId);
      
      // Disable if project is not scraped
      if (selectedProject && selectedProject.crawl_status !== "completed") {
        return true;
      }
      
      return false;
    }
    
    if (type === 'new') {
      if (!url || url.trim() === '') return true;
      const validationError = validateUrl(url);
      return validationError !== '';
    }
    
    return false;
  };

  // Check if selected project is scraped for helper text
  const isProjectScraped = () => {
    if (type !== 'existing' || !selectedProjectId) return true;
    
    const selectedProject = projects.find((p) => p._id === selectedProjectId);
    return selectedProject?.crawl_status === "completed";
  };

  // Handle continue button click
  const handleContinue = async () => {
    setError('');
    setUrlError('');
    
    // Final validation
    if (type === 'new') {
      const validationError = validateUrl(url);
      if (validationError) {
        setUrlError(validationError);
        return;
      }
      
      // Normalize URL before sending
      const normalizedUrl = normalizeUrl(url);
      setUrl(normalizedUrl);
      
      try {
        await onStartAnalysis(type, null, normalizedUrl);
        onClose();
        
        // Refresh project data after successful creation
        if (onRefresh) {
          await onRefresh();
        }
      } catch (err) {
        if (err.response?.status === 409) {
          setError('AI Visibility analysis is already running for this URL.');
        } else if (err.response?.status === 400) {
          setError(err.message || 'Invalid URL or request format.');
        } else {
          setError(err.message || 'Failed to start analysis');
        }
      }
    } else if (type === 'existing') {
      if (!selectedProjectId) {
        setError('Please select a project');
        return;
      }
      
      // Validate that selected project has been scraped
      const selectedProject = projects.find((p) => p._id === selectedProjectId);
      
      if (!selectedProject) {
        setError('Selected project not found');
        return;
      }
      
      // Check if project is scraped (crawl_status === "completed")
      if (selectedProject.crawl_status !== "completed") {
        setError('Please scrape the selected project first before starting AI Audit.');
        return; // ❌ STOP execution - do NOT proceed with AI Audit API call
      }
      
      try {
        await onStartAnalysis(type, selectedProjectId);
        onClose();
        
        // Refresh project data after successful creation
        if (onRefresh) {
          await onRefresh();
        }
      } catch (err) {
        if (err.response?.status === 409) {
          setError('AI Visibility analysis is already running for this project.');
        } else if (err.response?.status === 400) {
          setError(err.message || 'Invalid project selection.');
        } else {
          setError(err.message || 'Failed to start analysis');
        }
      }
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isLoading && !projectsLoading) {
      onClose();
    }
  };

  // Check if continue button should be enabled
  const canContinue = type === 'new' ? url.trim() && !urlError : selectedProjectId;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start AI Visibility Analysis</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Type Selection */}
          <div className="space-y-3">
            <Label>Analysis Type</Label>
            <RadioGroup value={type} onValueChange={handleTypeChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing">Continue with existing project</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new">Create new AI Visibility project</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Project Selection */}
          {type === 'existing' && (
            <div className="space-y-3">
              <Label>Select Project</Label>
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
                disabled={projectsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={projectsLoading ? "Loading projects..." : "Select a project"} />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.project_name || project.name || project.url || `Project ${project._id.slice(-6)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Inline Error Display */}
              {error && (
                <div className="mt-2 text-sm text-red-500">
                  {error}
                </div>
              )}
              
              {/* Helper text for unscraped projects */}
              {type === 'existing' && selectedProjectId && !isProjectScraped() && (
                <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ This project must be scraped before starting AI Audit.
                </div>
              )}
              
              {projects.length === 0 && !projectsLoading && (
                <p className="text-sm text-muted-foreground">
                  No projects found. Create a new project first.
                </p>
              )}
            </div>
          )}

          {/* URL Input */}
          {type === 'new' && (
            <div className="space-y-3">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className={urlError ? 'border-red-500' : ''}
              />
              {urlError && (
                <p className="text-sm text-red-500">{urlError}</p>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading || projectsLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={isContinueDisabled()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
