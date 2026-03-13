const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    const data = await response.json();

    console.log('📡 API Response:', {
      status: response.status,
      ok: response.ok,
      success: data.success,
      message: data.message,
      dataKeys: data.data ? Object.keys(data.data) : 'no data'
    });

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  }

  // Generic request method with authentication
  async request(endpoint, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    console.log('🔑 API Request:', {
      endpoint,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });

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

  // Generic POST method for axios-like compatibility
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Generic GET method for axios-like compatibility
  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET'
    });
  }

  // Authentication endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async verifyEmailOTP(email, otp) {
    return this.request('/auth/verify-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async generateEmailOTP(email) {
    return this.request('/auth/generate-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resendVerificationEmail(email) {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Project endpoints
  async getProjects(page = 1, limit = 10) {
    return this.request(`/app_user/projects?page=${page}&limit=${limit}`);
  }

  async getProjectById(projectId) {
    const endpoint = `/app_user/projects/${projectId}`;
    console.log('🔍 API Request:', endpoint, 'projectId:', projectId);
    return this.request(endpoint);
  }

  async createProject(projectData) {
    return this.request('/app_user/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  }

  async updateProject(projectId, projectData) {
    return this.request(`/app_user/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
  }

  async deleteProject(projectId) {
    return this.request(`/app_user/projects/${projectId}`, {
      method: 'DELETE'
    });
  }

  // Audit endpoints
  async startAudit(projectId) {
    const endpoint = '/seo/start-scraping';
    const payload = { project_id: projectId };
    console.log('🚀 Starting audit request:', { endpoint, payload });

    try {
      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      console.log('✅ Audit start response:', response);
      return response;
    } catch (error) {
      console.error('❌ Audit start error:', error);
      throw error;
    }
  }

  async getAuditStatus(projectId) {
    return this.request(`/seo/scraping-status/${projectId}`);
  }

  async cancelAudit(projectId, jobId) {
    return this.request('/seo/cancel-audit', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, job_id: jobId })
    });
  }

  // AI Visibility endpoints
  async startAiVisibility(projectId) {
    const endpoint = '/ai-visibility/start';
    const payload = { project_id: projectId };
    console.log('🚀 Starting AI Visibility request:', { endpoint, payload });

    try {
      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      console.log('✅ AI Visibility start response:', response);
      return response;
    } catch (error) {
      console.error('❌ AI Visibility start error:', error);
      throw error;
    }
  }

  // Get AI visibility entity graph
  async getAIVisibilityEntityGraph(projectId) {
    const endpoint = `/app_user/projects/${projectId}/ai-visibility/entity-graph`;
    console.log('🔍 Getting AI visibility entity graph:', { endpoint, projectId });

    try {
      const response = await this.request(endpoint);
      console.log('✅ AI visibility entity graph response:', response);
      return response;
    } catch (error) {
      console.error('❌ AI visibility entity graph error:', error);
      throw error;
    }
  }

  // Get AI visibility page details
  async getAIVisibilityPage(projectId, url) {
    const encodedUrl = encodeURIComponent(url);
    const endpoint = `/app_user/projects/${projectId}/ai-visibility/page?url=${encodedUrl}`;

    console.log('🔍 Getting AI visibility page details:', { endpoint, projectId, url });

    try {
      const response = await this.request(endpoint);
      console.log('✅ AI visibility page response:', response);
      return response;
    } catch (error) {
      console.error('❌ AI visibility page error:', error);
      throw error;
    }
  }

  // Get AI visibility pages with pagination and filters
  async getAIVisibilityPages(projectId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/app_user/projects/${projectId}/ai-visibility/pages?${queryString}`
      : `/app_user/projects/${projectId}/ai-visibility/pages`;

    console.log('🔍 Getting AI visibility pages:', { endpoint, projectId, params });

    try {
      const response = await this.request(endpoint);
      console.log('✅ AI visibility pages response:', response);
      return response;
    } catch (error) {
      console.error('❌ AI visibility pages error:', error);
      throw error;
    }
  }

  // Get AI visibility worst pages
  async getAIVisibilityWorstPages(projectId, limit = 5) {
    const endpoint = `/app_user/projects/${projectId}/ai-visibility/worst-pages?limit=${limit}`;
    console.log('🔍 Getting AI visibility worst pages:', { endpoint, projectId, limit });

    try {
      const response = await this.request(endpoint);
      console.log('✅ AI visibility worst pages response:', response);
      return response;
    } catch (error) {
      console.error('❌ AI visibility worst pages error:', error);
      throw error;
    }
  }

  // Project issues endpoints
  async getProjectIssues(projectId, filters = {}) {
    const { category, severity, search } = filters;
    const params = new URLSearchParams();

    if (category) params.append('category', category);
    if (severity) params.append('severity', severity);
    if (search) params.append('search', search);

    const queryString = params.toString();
    const endpoint = `/app_user/projects/${projectId}/issues${queryString ? '?' + queryString : ''}`;

    console.log('🔍 API Request:', endpoint, 'filters:', filters);
    return this.request(endpoint);
  }

  // Project subpages endpoints
  async getProjectSubpages(projectId, filters = {}) {
    const { filter, search, sortBy, sortOrder, page = 1, limit = 50 } = filters;
    const params = new URLSearchParams();

    if (filter) params.append('filter', filter);
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const queryString = params.toString();
    const endpoint = `/app_user/projects/${projectId}/pages${queryString ? '?' + queryString : ''}`;

    console.log('🔍 API Request:', endpoint, 'filters:', filters);
    return this.request(endpoint);
  }

  // Page issues endpoints
  async getPageIssues(projectId, pageUrl) {
    const params = new URLSearchParams();
    if (pageUrl) params.append('page_url', pageUrl);

    const queryString = params.toString();
    const endpoint = `/app_user/projects/${projectId}/page-issues${queryString ? '?' + queryString : ''}`;

    console.log('🔍 API Request:', endpoint, 'pageUrl:', pageUrl);
    return this.request(endpoint);
  }

  // On-page issues (aggregated by issue_code)
  async getOnPageIssues(projectId) {
    return this.request(`/app_user/projects/${projectId}/onpage-issues`);
  }

  // Get all URLs for a specific issue
  async getIssueUrls(projectId, issueCode) {
    return this.request(`/app_user/projects/${projectId}/onpage-issues/${issueCode}`);
  }

  // Technical checks endpoints
  async getTechnicalChecks(projectId) {
    const endpoint = `/app_user/projects/${projectId}/technical-checks`;
    console.log('🔧 Getting technical checks:', { endpoint, projectId });

    try {
      const response = await this.request(endpoint);
      console.log('✅ Technical checks response:', response);
      return response;
    } catch (error) {
      console.error('❌ Technical checks error:', error);
      throw error;
    }
  }

  async getTechnicalCheckDetail(projectId, checkId) {
    const endpoint = `/app_user/projects/${projectId}/technical-checks/${checkId}`;
    console.log('🔧 Getting technical check detail:', { endpoint, projectId, checkId });

    try {
      const response = await this.request(endpoint);
      console.log('✅ Technical check detail response:', response);
      return response;
    } catch (error) {
      console.error('❌ Technical check detail error:', error);
      throw error;
    }
  }

  // PageSpeed endpoints
  async getPageSpeedData(projectId) {
    const endpoint = `/app_user/projects/${projectId}/performance`;
    console.log('🚀 Getting PageSpeed data:', { endpoint, projectId });

    try {
      const response = await this.request(endpoint);
      console.log('✅ PageSpeed data response:', response);
      return response;
    } catch (error) {
      console.error('❌ PageSpeed data error:', error);
      throw error;
    }
  }

  // Store authentication token
  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  // Get authentication token
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Remove authentication token
  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Redirect to dashboard (or any specified route)
  redirectToDashboard(router, route = '/dashboard') {
    if (router) {
      router.push(route);
    } else if (typeof window !== 'undefined') {
      window.location.href = route;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
