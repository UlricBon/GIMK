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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  getTaskById: (taskId) =>
    apiClient.get(`/tasks/${taskId}`),
  createTask: (taskData) =>
    apiClient.post('/tasks', taskData),
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
