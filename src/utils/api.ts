import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function generateImageDescription(imageFile: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post('/ai/describe-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data?.success || !response.data?.description) {
    throw new Error(response.data?.message || 'Failed to generate description');
  }

  return response.data.description as string;
}

export async function fetchImageStats(): Promise<{ totalLikes: number }> {
  const response = await api.get('/images/stats');

  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Failed to fetch stats');
  }

  return {
    totalLikes: response.data.totalLikes ?? 0,
  };
}

export default api;
