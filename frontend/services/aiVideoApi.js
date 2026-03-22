/**
 * AI Video Script API Service
 * Handles all API calls for AI video script generation and management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

export const getScript = (projectId) =>
  aiVideoService.getScript(projectId);

export const deleteScript = (projectId) =>
  aiVideoService.deleteScript(projectId);

export const regenerateScript = (projectId, feedback = '') =>
  aiVideoService.regenerateScript(projectId, feedback);

export const getStatus = (projectId) =>
  aiVideoService.getStatus(projectId);

export default aiVideoService;
