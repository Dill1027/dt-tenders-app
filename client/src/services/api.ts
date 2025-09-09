import axios, { AxiosResponse } from 'axios';
import { User, Project, LoginData, ProjectFormData, ProjectsResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(error.message || 'An error occurred'));
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginData): Promise<{ user: User; token: string }> => {
    const response: AxiosResponse = await api.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response: AxiosResponse = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response: AxiosResponse = await api.post('/auth/refresh');
    return response.data;
  },
  
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const response: AxiosResponse = await api.post('/auth/change-password', data);
    return response.data;
  },

  forgotPassword: async (username: string): Promise<{ message: string; resetCode?: string }> => {
    const response: AxiosResponse = await api.post('/auth/forgot-password', { username });
    return response.data;
  },

  resetPassword: async (data: { username: string; resetCode: string; newPassword: string }): Promise<{ message: string }> => {
    const response: AxiosResponse = await api.post('/auth/reset-password', data);
    return response.data;
  }
};

// Projects API
export const projectsAPI = {
  getProjects: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ProjectsResponse> => {
    const response: AxiosResponse = await api.get('/projects', { params });
    return response.data;
  },

  getProject: async (id: string): Promise<Project> => {
    const response: AxiosResponse = await api.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData: ProjectFormData): Promise<{ project: Project }> => {
    const response: AxiosResponse = await api.post('/projects', projectData);
    return response.data;
  },

  updateProjectPart1: async (id: string, data: ProjectFormData): Promise<{ project: Project }> => {
    const response: AxiosResponse = await api.put(`/projects/${id}/part1`, data);
    return response.data;
  },

  updateProjectPart2: async (id: string, data: ProjectFormData): Promise<{ project: Project }> => {
    const response: AxiosResponse = await api.put(`/projects/${id}/part2`, data);
    return response.data;
  },

  updateProjectPart3: async (id: string, data: ProjectFormData): Promise<{ project: Project }> => {
    const response: AxiosResponse = await api.put(`/projects/${id}/part3`, data);
    return response.data;
  },

  updateInvoicePayment: async (id: string, data: ProjectFormData): Promise<{ project: Project }> => {
    const response: AxiosResponse = await api.put(`/projects/${id}/invoice-payment`, data);
    return response.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// Users API
export const usersAPI = {
  getUsers: async (): Promise<User[]> => {
    const response: AxiosResponse = await api.get('/users');
    return response.data;
  },

  getUser: async (id: string): Promise<User> => {
    const response: AxiosResponse = await api.get(`/users/${id}`);
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
    const response: AxiosResponse = await api.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.put('/users/change-password', data);
  },

  getUserStats: async (): Promise<any> => {
    const response: AxiosResponse = await api.get('/users/stats/overview');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getUsersCredentials: async (): Promise<Array<{ username: string; password: string; role: string }>> => {
    const response: AxiosResponse = await api.get('/admin/users-credentials');
    return response.data;
  }
};

export default api;
