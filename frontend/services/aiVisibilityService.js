/**
 * AI Visibility Service - Handles all AI Visibility API calls
 * Follows clean architecture principles - PRODUCTION READY
 */
import apiClient from '@/utils/apiClient';

class AIVisibilityService {
  constructor() {
    // No baseURL needed - using centralized API client
  }

  /**
   * Generic request method - using centralized API client
   */
  async request(endpoint, options = {}) {
    return apiClient.request(endpoint, options);
  }

  /**
   * Start AI Visibility Analysis
   * POST /ai-visibility/start
   */
  async startAnalysis(type, projectId = null, url = null) {
    const payload = { type };
    if (type === 'existing' && projectId) {
      payload.projectId = projectId;
    } else if (type === 'new' && url) {
      payload.url = url;
    }

    return this.request('/ai-visibility/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get AI Visibility Analysis Status
   * GET /ai-visibility/:id
   */
  async getAnalysisStatus(id) {
    return this.request(`/ai-visibility/${id}`);
  }

  /**
   * Get AI Visibility projects from seo_ai_visibility_project collection
   * GET /ai-visibility/projects
   */
  async getAIVisibilityProjects() {
    return this.request('/ai-visibility/projects');
  }

  /**
   * Get available SEO projects for dropdown
   */
  async getSeoProjects() {
    return this.request('/app_user/projects?page=1&limit=50');
  }

  /**
   * Get AI Visibility data for a project
   */
  async getProjectAIVisibility(projectId) {
    return this.request(`/app_user/projects/${projectId}/ai-visibility`);
  }

  /**
   * Get AI Visibility worst performing pages
   */
  async getWorstPages(projectId, limit = 5) {
    return this.request(`/app_user/projects/${projectId}/ai-visibility/worst-pages?limit=${limit}`);
  }

  /**
   * Get AI Visibility entity graph
   */
  async getEntityGraph(projectId) {
    return this.request(`/app_user/projects/${projectId}/ai-visibility/entity-graph`);
  }

  /**
   * Get AI Visibility page details
   */
  async getPageDetails(projectId, url) {
    const encodedUrl = encodeURIComponent(url);
    return this.request(`/app_user/projects/${projectId}/ai-visibility/page?url=${encodedUrl}`);
  }

  /**
   * Start AI Audit for existing AI project
   * POST /ai-visibility/start-audit
   */
  async startAudit(aiProjectId) {
    return this.request('/ai-visibility/start-audit', {
      method: 'POST',
      body: JSON.stringify({ aiProjectId }),
    });
  }

  /**
   * Get AI Visibility pages with pagination and filters
   */
  async getPages(projectId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/app_user/projects/${projectId}/ai-visibility/pages?${queryString}`
      : `/app_user/projects/${projectId}/ai-visibility/pages`;
    
    return this.request(endpoint);
  }

  /**
   * Get Website Optimization Aggregation
   * GET /api/ai-visibility/projects/:projectId/website-optimization
   */
  async getWebsiteOptimization(projectId) {
    const response = await this.request(`/ai-visibility/projects/${projectId}/website-optimization`);
    return response.data;  // ✅ FIXED: No double unwrapping
  }
}

// Create singleton instance
const aiVisibilityService = new AIVisibilityService();

// Export individual function for easy importing
export const getWebsiteOptimization = (projectId) => aiVisibilityService.getWebsiteOptimization(projectId);

export default aiVisibilityService;
