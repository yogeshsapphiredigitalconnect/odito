/**
 * Centralized API Client - PRODUCTION READY
 * No hardcoded URLs, strict environment variable usage
 */

class ApiClient {
  constructor() {
    this.validateEnvironment();
    this.apiBaseUrl = this.getApiBaseUrl();
    this.mediaUrls = this.getMediaUrls();
  }

  validateEnvironment() {
    const required = ['NEXT_PUBLIC_API_URL'];
    const missing = [];

    for (const envVar of required) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }

    if (missing.length > 0) {
      console.error('❌ CRITICAL: Missing required environment variables:');
      missing.forEach(varName => {
        console.error(`   - ${varName}`);
      });
      console.error('\n💥 Frontend cannot start without these variables.');
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
  }

  getApiBaseUrl() {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  getMediaUrls() {
    const baseUrl = this.getApiBaseUrl();
    return {
      audio: `${baseUrl}/audio`,
      video: `${baseUrl}/video`,
      reports: `${baseUrl}/reports`
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.apiBaseUrl}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ API Error: ${error.message}`);
      throw error;
    }
  }

  getAuthToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  setAuthToken(token) {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }

  // HTTP Methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Media URLs
  getAudioUrl(filename) {
    return `${this.mediaUrls.audio}/${filename}`;
  }

  getVideoUrl(filename) {
    return `${this.mediaUrls.video}/${filename}`;
  }

  getReportUrl(filename) {
    return `${this.mediaUrls.reports}/${filename}`;
  }

  // WebSocket URL
  getWebSocketUrl() {
    const apiUrl = this.getApiBaseUrl();
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    return `${wsUrl}/ws`;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;

// Export convenience methods
export const {
  get,
  post,
  put,
  patch,
  delete: del,
  getAudioUrl,
  getVideoUrl,
  getReportUrl,
  getWebSocketUrl,
  setAuthToken,
  getAuthToken
} = apiClient;
