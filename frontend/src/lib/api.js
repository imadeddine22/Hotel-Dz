import axios from 'axios';

const PRODUCTION_API = 'https://backend-yikc.onrender.com/api/v1';
const PRODUCTION_SERVER = 'https://backend-yikc.onrender.com';
const LOCAL_API = 'http://localhost:5000/api/v1';
const LOCAL_SERVER = 'http://localhost:5000';

const isProduction = () =>
  typeof window !== 'undefined' && window.location.hostname !== 'localhost';

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return isProduction() ? PRODUCTION_API : LOCAL_API;
};

export const getServerURL = () => {
  if (process.env.NEXT_PUBLIC_SERVER_URL) return process.env.NEXT_PUBLIC_SERVER_URL;
  return isProduction() ? PRODUCTION_SERVER : LOCAL_SERVER;
};

export const getImageUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return url?.url ? getImageUrl(url.url) : '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
  const serverUrl = getServerURL();
  return `${serverUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const resolveImg = getImageUrl;


const api = axios.create({
  baseURL: getBaseURL(),
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
