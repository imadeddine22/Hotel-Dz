import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { useFavoritesStore } from '@/store/favoritesStore';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  init: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, loading: false });
      useFavoritesStore.getState().load();
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) localStorage.setItem('token', data.token);
    set({ user: data.user });
    useFavoritesStore.getState().load();
    return data.user;
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    if (data.token) localStorage.setItem('token', data.token);
    set({ user: data.user });
    useFavoritesStore.getState().load();
    return data.user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('token');
    set({ user: null });
    useFavoritesStore.getState().clear();
  },

  isRole: (...roles) => roles.includes(get().user?.role),
}));

export const useLangStore = create(
  persist(
    (set) => ({
      lang: 'fr',
      setLang: (lang) => {
        if (typeof document !== 'undefined') {
          document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = lang;
        }
        set({ lang });
      },
    }),
    {
      name: 'dz-lang-storage',
    }
  )
);
