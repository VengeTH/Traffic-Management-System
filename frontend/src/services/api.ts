import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiError } from '../types';

/**
 * * Determines the API base URL based on environment
 * * Priority:
 * * 1. REACT_APP_API_URL environment variable (highest priority)
 * * 2. Auto-detect based on current hostname
 * * 3. Default to localhost for development
 */
const getApiBaseUrl = (): string => {
  // * Use environment variable if explicitly set
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // * Auto-detect based on current location (client-side only)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // * Development: localhost or 127.0.0.1
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:5000`;
    }

    // * Production: Use same origin if API is on same domain, otherwise use environment variable
    // * For GitHub Pages deployment, API is typically on a separate server
    // * Set REACT_APP_API_URL in your build environment or use a relative URL
    // * If API is on same domain, use relative URL
    if (hostname.includes('github.io')) {
      // * GitHub Pages: API should be on separate server
      // * Set REACT_APP_API_URL during build: REACT_APP_API_URL=https://your-api-domain.com npm run build
      // * For now, try relative URL (if API is proxied) or use window.location.origin
      // * If API is on different domain, you MUST set REACT_APP_API_URL
      console.warn(
        '⚠️ REACT_APP_API_URL not set. Using relative URL. ' +
        'If API is on a different domain, set REACT_APP_API_URL environment variable during build.'
      );
      // * Use relative URL - assumes API is on same origin or proxied
      return '';
    }

    // * Other production domains: use same origin
    return '';
  }

  // * Server-side rendering fallback
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

// Create axios instance
// * API versioning: Currently using v1 endpoints
// * Backward compatibility: Non-versioned endpoints still work but are deprecated
const API_VERSION = process.env.REACT_APP_API_VERSION || 'v1';
const API_BASE_URL = getApiBaseUrl();
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api/${API_VERSION}` : `/api/${API_VERSION}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && originalRequest) {
      try {
        const refreshToken = typeof window !== 'undefined' && window.localStorage 
          ? localStorage.getItem('refreshToken') 
          : null;
      
      if (refreshToken) {
        try {
          // * Use versioned endpoint for token refresh
          const refreshUrl = API_BASE_URL 
            ? `${API_BASE_URL}/api/${API_VERSION}/auth/refresh`
            : `/api/${API_VERSION}/auth/refresh`;
          const response = await axios.post(refreshUrl, {
            refreshToken,
          });
          
          const { token } = response.data.data;
            if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('token', token);
            }
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token failed, redirect to login
            if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
            }
          window.location.href = '/login';
        }
      } else {
        // No refresh token, redirect to login
          if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
          }
          window.location.href = '/login';
        }
      } catch {
        // If localStorage access fails, just redirect to login
        if (typeof window !== 'undefined') {
        window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API service class
class ApiService {
  // Auth endpoints
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: any) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  }

  async verifyEmail(token: string) {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }

  // Violation endpoints
  async searchViolations(searchType: string, searchValue: string) {
    const paramMap: { [key: string]: string } = {
      ovr: 'ovrNumber',
      plate: 'plateNumber',
      license: 'driverLicenseNumber'
    };
    
    const response = await api.get('/violations/search', {
      params: { [paramMap[searchType]]: searchValue },
    });
    return response.data;
  }

  async getViolation(id: string) {
    const response = await api.get(`/violations/${id}`);
    return response.data;
  }

  async createViolation(violationData: any) {
    const response = await api.post('/violations', violationData);
    return response.data;
  }

  async getEnforcerViolations(params?: any) {
    const response = await api.get('/violations/enforcer', { params });
    return response.data;
  }

  async updateViolation(id: string, violationData: any) {
    const response = await api.put(`/violations/${id}`, violationData);
    return response.data;
  }

  async submitDispute(id: string, disputeData: any) {
    const response = await api.post(`/violations/${id}/dispute`, disputeData);
    return response.data;
  }

  async getViolationQR(id: string) {
    const response = await api.get(`/violations/${id}/qr`);
    return response.data;
  }

  async getOverdueViolations() {
    const response = await api.get('/violations/overdue');
    return response.data;
  }

  async getViolationStatistics() {
    const response = await api.get('/violations/statistics');
    return response.data;
  }

  // Payment endpoints
  async initiatePayment(paymentData: any) {
    const response = await api.post('/payments/initiate', paymentData);
    return response.data;
  }

  async confirmPayment(confirmationData: any) {
    const response = await api.post('/payments/confirm', confirmationData);
    return response.data;
  }

  async getPayment(id: string) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  }

  async getPaymentReceipt(id: string) {
    const response = await api.get(`/payments/${id}/receipt`);
    return response.data;
  }

  async getPaymentByReceipt(receiptNumber: string) {
    const response = await api.get(`/payments/receipt/${receiptNumber}`);
    return response.data;
  }

  async getUserPayments(userId?: string) {
    if (userId) {
      const response = await api.get(`/payments/user/${userId}`);
      return response.data;
    } else {
      const response = await api.get('/users/payments');
      return response.data;
    }
  }

  // User endpoints
  async getUserProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  }

  async updateUserProfile(profileData: any) {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  }

  async changePassword(passwordData: any) {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  }

  async getUserViolations(params?: any) {
    const response = await api.get('/users/violations', { params });
    return response.data;
  }

  async getUserStatistics() {
    const response = await api.get('/users/statistics');
    return response.data;
  }

  async enable2FA() {
    const response = await api.post('/users/enable-2fa');
    return response.data;
  }

  async disable2FA() {
    const response = await api.post('/users/disable-2fa');
    return response.data;
  }

  async deactivateAccount() {
    const response = await api.delete('/users/account');
    return response.data;
  }

  // Admin endpoints
  async getAdminDashboard() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  }

  async getAdminDashboardStats() {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  }

  async getAdminUsers(params?: any) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  }

  async updateUser(id: string, userData: any) {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  }

  async deactivateUser(id: string) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  }

  async getAdminViolations(params?: any) {
    const response = await api.get('/admin/violations', { params });
    return response.data;
  }

  async processDispute(id: string, disputeData: any) {
    const response = await api.post(`/admin/violations/${id}/process-dispute`, disputeData);
    return response.data;
  }

  async sendReminders() {
    const response = await api.post('/admin/notifications/send-reminders');
    return response.data;
  }

  async getViolationReport(params?: any) {
    const response = await api.get('/admin/reports/violations', { params });
    return response.data;
  }

  async getPaymentReport(params?: any) {
    const response = await api.get('/admin/reports/payments', { params });
    return response.data;
  }

  async getSystemSettings() {
    const response = await api.get('/admin/settings');
    return response.data;
  }

  async updateSystemSettings(settings: any) {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  }

  // Health check
  // Notification endpoints
  async getNotifications(params?: any) {
    const response = await api.get('/users/notifications', { params });
    return response.data;
  }

  async getUnreadNotificationCount() {
    const response = await api.get('/users/notifications/unread-count');
    return response.data;
  }

  async markNotificationAsRead(id: string) {
    const response = await api.put(`/users/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await api.put('/users/notifications/read-all');
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default api;

