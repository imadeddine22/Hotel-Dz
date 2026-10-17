import axios from 'axios';
import { translateMessage } from './i18n/messages';

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

const currentLang = () => {
  try {
    return JSON.parse(localStorage.getItem('dz-lang-storage'))?.state?.lang || 'fr';
  } catch {
    return 'fr';
  }
};

// Owner/seller/admin screens edit the original text: never hand them a translation,
// or saving the form would overwrite the original with it.
const EDITING_PATHS = /\/(my\/list|seller\/|admin\/|owner\/)/;
const LOCALIZED_FIELDS = ['name', 'title', 'description', 'amenities'];

/**
 * Listings carry machine translations (`translations: { ar: { name, description, … }, en: … }`,
 * filled by the backend). Swap them in for the visitor's language, keeping the original in `_original`.
 */
function localize(node, lang, depth = 0) {
  if (!node || typeof node !== 'object' || depth > 6) return;
  if (Array.isArray(node)) return node.forEach((n) => localize(n, lang, depth + 1));
  const tr = node.translations?.[lang];
  if (tr && node.sourceLang !== lang) {
    node._original = {};
    for (const f of LOCALIZED_FIELDS) {
      if (tr[f] !== undefined && tr[f] !== null && tr[f] !== '') {
        node._original[f] = node[f];
        node[f] = tr[f];
      }
    }
  }
  for (const v of Object.values(node)) if (v && typeof v === 'object') localize(v, lang, depth + 1);
}

api.interceptors.response.use(
  (res) => {
    if (typeof window !== 'undefined' && res.config.localize !== false && !EDITING_PATHS.test(res.config.url || '')) {
      localize(res.data, currentLang());
    }
    return res;
  },
  // Normalize errors to a thrown Error with a friendly message, in the user's language
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Une erreur est survenue';
    return Promise.reject(new Error(typeof window === 'undefined' ? message : translateMessage(currentLang(), message)));
  }
);

export default api;
