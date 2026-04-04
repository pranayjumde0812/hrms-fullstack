import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Basic global error handling
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
