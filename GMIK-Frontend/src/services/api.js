import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dynamically get API URL based on host
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If accessing from phone (not localhost), use same host with port 5000
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5000/api`;
    }
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  console.log('API Request:', config.method?.toUpperCase(), config.url, 'Token:', token ? 'YES' : 'NO');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Log responses and errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export const authService = {
  register: (email, password, displayName) =>
    apiClient.post('/auth/register', { email, password, displayName }),
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  verifyEmail: (email, code) =>
    apiClient.post('/auth/verify-email', { email, code }),
};

export const taskService = {
  getTasks: (params) =>
    apiClient.get('/tasks', { params }),
  getUserTasks: (params) =>
    apiClient.get('/tasks/user-tasks', { params }),
  getTaskById: (taskId) =>
    apiClient.get(`/tasks/${taskId}`),
  createTask: (taskData) =>
    apiClient.post('/tasks', taskData),
  updateTask: (taskId, taskData) =>
    apiClient.put(`/tasks/${taskId}`, taskData),
  acceptTask: (taskId) =>
    apiClient.post(`/tasks/${taskId}/accept`),
  updateTaskStatus: (taskId, status) =>
    apiClient.put(`/tasks/${taskId}/status`, { status }),
  deleteTask: (taskId) =>
    apiClient.delete(`/tasks/${taskId}`),
};

export const userService = {
  getUserProfile: () =>
    apiClient.get('/users/profile'),
  getUserById: (userId) =>
    apiClient.get(`/users/${userId}`),
  getUserRatings: (userId) =>
    apiClient.get(`/users/${userId}/ratings`),
  rateUser: (userId, rating, comment) =>
    apiClient.post(`/users/${userId}/rate`, { rating, comment }),
  updateProfile: (data) =>
    apiClient.put('/users/profile', data),
  deleteAccount: () =>
    apiClient.delete('/users/profile'),
};

export const messageService = {
  getMessages: (taskId) =>
    apiClient.get(`/messages/task/${taskId}`),
  sendMessage: (taskId, content) =>
    apiClient.post(`/messages/task/${taskId}`, { content }),
  getDirectMessages: (userId) =>
    apiClient.get(`/messages/direct/${userId}`),
  sendDirectMessage: (userId, content) =>
    apiClient.post(`/messages/direct/${userId}`, { content }),
};

export const paymentService = {
  confirmPayment: (taskId, paymentMethod) =>
    apiClient.post('/payments/confirm', { taskId, paymentMethod }),
  getPaymentHistory: () =>
    apiClient.get('/payments/history'),
  getPaymentMethods: () =>
    apiClient.get('/payments/methods'),
  addPaymentMethod: (paymentData) =>
    apiClient.post('/payments/methods', paymentData),
  setDefaultPaymentMethod: (method_id) =>
    apiClient.post(`/payments/methods/${method_id}/default`),
  removePaymentMethod: (method_id) =>
    apiClient.delete(`/payments/methods/${method_id}`),
};

export const settingsService = {
  getSettings: () =>
    apiClient.get('/settings'),
  updateSettings: (settings) =>
    apiClient.put('/settings', settings),
};

export const supportService = {
  sendMessage: (subject, message) =>
    apiClient.post('/support/ticket', { subject, message }),
  getTickets: () =>
    apiClient.get('/support/tickets'),
};

export default apiClient;
