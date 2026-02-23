/**
 * AI Visibility Service - Handles all AI Visibility API calls
 * Follows clean architecture principles
 */
class AIVisibilityService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  /**
   * Handle API responses with proper error handling
   */
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }

  /**
   * Generic request method with authentication
   */
  async request(endpoint, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    return this.handleResponse(response);
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
}

// Create singleton instance
const aiVisibilityService = new AIVisibilityService();

export default aiVisibilityService;
