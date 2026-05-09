import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api';

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
  updateProfile: (data) =>
    apiClient.put('/users/profile', data),
};

export const messageService = {
  getMessages: (taskId) =>
    apiClient.get(`/messages/task/${taskId}`),
  sendMessage: (taskId, content) =>
    apiClient.post(`/messages/task/${taskId}`, { content }),
};

export const paymentService = {
  confirmPayment: (taskId, paymentMethod) =>
    apiClient.post('/payments/confirm', { taskId, paymentMethod }),
  getPaymentHistory: () =>
    apiClient.get('/payments/history'),
};

export default apiClient;
