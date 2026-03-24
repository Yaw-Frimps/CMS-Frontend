import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
export const getImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  // Prefix relative paths with the backend base URL (removing the /api/v1 suffix if needed, 
  // but since the backend serves /uploads at the root, we use the base origin)
  const baseUrl = 'http://localhost:8081';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};
