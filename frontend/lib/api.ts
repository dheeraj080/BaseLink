import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1', // Assuming the app proxies to the backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh or redirects
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the request was for login and it failed with 401, just return the error so the login page can show it
    if (error.response?.status === 401 && originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post('/api/v1/auth/refresh', { refreshToken });
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
