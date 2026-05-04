import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  
  // User Management
  getUsers: () =>
    apiClient.get('/admin/users'),
  disableUser: (userId) =>
    apiClient.put(`/admin/users/${userId}/disable`),
  
  // Activity Logs
  getActivityLogs: () =>
    apiClient.get('/admin/logs'),
  
  // Metrics
  getMetrics: () =>
    apiClient.get('/admin/metrics'),
  
  // Content Moderation
  moderateContent: (taskId, action) =>
    apiClient.post('/admin/moderate', { taskId, action }),
};

export default apiClient;
