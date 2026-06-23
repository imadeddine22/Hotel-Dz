import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // send the httpOnly cookie
});

// Attach bearer token (also stored in localStorage as a fallback to the cookie)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors to a thrown Error with a friendly message
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Une erreur est survenue';
    return Promise.reject(new Error(message));
  }
);

export default api;
