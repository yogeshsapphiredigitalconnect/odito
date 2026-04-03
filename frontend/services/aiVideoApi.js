/**
 * AI Video Script API Service
 * Handles all API calls for AI video script generation and management
 */

import API_BASE_URL from "@/lib/apiConfig";
import apiService from "@/lib/apiService.js";

class AIVideoService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/ai-video`;
  }

  /**
   * Get auth token from localStorage
   */
  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  /**
   * Make API request with authentication
   */
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    console.log(`[AI Video API] ${options.method || 'GET'} ${endpoint}`, {
      url,
      hasToken: !!token,
    });

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`[AI Video API] Error:`, error);
      throw error;
    }
  }

  /**
   * POST /ai-video/script
   * Generate or retrieve a video narration script for a project
   * @param {string} projectId - Project ID
   * @param {boolean} forceRegenerate - Force regeneration (optional)
   * @returns {Promise<Object>} Generated script response
   */
  async generateScript(projectId, forceRegenerate = false) {
    return this.request('/script', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        forceRegenerate,
      }),
    });
  }

  /**
   * GET /ai-video/script/:projectId
   * Get existing script for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Script data
   */
  async getScript(projectId) {
    return this.request(`/script/${projectId}`, {
      method: 'GET',
    });
  }

  /**
   * DELETE /ai-video/script/:projectId
   * Delete script for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Success response
   */
  async deleteScript(projectId) {
    return this.request(`/script/${projectId}`, {
      method: 'DELETE',
    });
  }

  /**
   * POST /ai-video/script/regenerate/:projectId
   * Force regenerate script for a project with optional feedback
   * @param {string} projectId - Project ID
   * @param {string} feedback - User feedback for regeneration (optional)
   * @returns {Promise<Object>} Regenerated script
   */
  async regenerateScript(projectId, feedback = '') {
    return this.request(`/script/regenerate/${projectId}`, {
      method: 'POST',
      body: JSON.stringify({
        feedback,
      }),
    });
  }

  /**
   * POST /ai-video/video
   * Generate a complete video for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Job ID for tracking
   */
  async generateVideo(projectId) {
    return this.request('/video', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
      }),
    });
  }

  /**
   * GET /jobs/:jobId/status
   * Get job status by ID
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Job status information
   */
  async getJobStatus(jobId) {
    try {
      console.log(`[AI Video API] Getting job status:`, { jobId });
      
      // Use centralized API service for proper authentication handling
      const response = await apiService.request(`/jobs/${jobId}/status`, {
        method: 'GET'
      });
      
      console.log('[AI Video API] Job status retrieved:', response);
      return response;
    } catch (error) {
      console.error(`[AI Video API] Get job status error:`, error);
      throw error;
    }
  }

  /**
   * GET /api/video/ai-generated/:projectId
   * Get existing generated video for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Video metadata or null if not found
   */
  async getGeneratedVideo(projectId) {
    try {
      console.log(`[AI Video API] GET /video/ai-generated/${projectId}`, {
        projectId,
        hasToken: apiService.isAuthenticated()
      });

      // Use centralized API service for proper authentication handling
      const response = await apiService.request(`/video/ai-generated/${projectId}`, {
        method: 'GET'
      });
      
      console.log('[AI Video API] Video data retrieved:', response);
      return response;
    } catch (error) {
      // Handle 404 gracefully - return null instead of throwing
      if (error.message.includes('404') || error.message.includes('No video found')) {
        console.log('[AI Video API] No video found (404)');
        return null;
      }
      
      // Only log as error for non-404 cases
      console.error(`[AI Video API] Get generated video error:`, error);
      throw error;
    }
  }

  /**
   * GET /api/video/ai-generated/download/:filename
   * Download a video file securely
   * @param {string} filename - Video filename
   * @returns {Promise<Blob>} Video file blob
   */
  async downloadVideo(filename) {
    try {
      console.log(`[AI Video API] Download video request: ${filename}`);
      
      const token = this.getToken();
      // Use the correct API endpoint - video downloads are under /api/video/ai-generated/
      const url = `${API_BASE_URL}/video/ai-generated/download/${filename}`;

      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      };

      console.log(`[AI Video API] ${config.method} ${url}`, {
        hasToken: !!token,
      });

      const response = await fetch(url, config);

      if (!response.ok) {
        // Try to parse error as JSON
        let errorMessage = `Download failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Return blob for successful downloads
      const blob = await response.blob();
      console.log('[AI Video API] Video downloaded successfully, blob size:', blob.size);
      return blob;
      
    } catch (error) {
      console.error(`[AI Video API] Download video error:`, error);
      throw error;
    }
  }

  /**
   * Get processing status for a script
   * This is a polling helper function
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Status information
   */
  async getStatus(projectId) {
    // Try to get the script to check its status
    try {
      const scriptData = await this.getScript(projectId);
      return {
        status: scriptData.status || 'completed',
        processingTime: scriptData.processingTime,
      };
    } catch (error) {
      if (error.message.includes('404')) {
        return {
          status: 'not_started',
          processingTime: 0,
        };
      }
      throw error;
    }
  }
}

// Export singleton instance
export const aiVideoService = new AIVideoService();

// Export convenience functions for direct usage
export const generateScript = (projectId, forceRegenerate = false) =>
  aiVideoService.generateScript(projectId, forceRegenerate);

export const generateVideo = (projectId) =>
  aiVideoService.generateVideo(projectId);

export const getScript = (projectId) =>
  aiVideoService.getScript(projectId);

export const deleteScript = (projectId) =>
  aiVideoService.deleteScript(projectId);

export const regenerateScript = (projectId, feedback = '') =>
  aiVideoService.regenerateScript(projectId, feedback);

export const getStatus = (projectId) =>
  aiVideoService.getStatus(projectId);

export const getJobStatus = (jobId) =>
  aiVideoService.getJobStatus(jobId);

export const getGeneratedVideo = (projectId) =>
  aiVideoService.getGeneratedVideo(projectId);

export const downloadVideo = (filename) =>
  aiVideoService.downloadVideo(filename);

export default aiVideoService;
