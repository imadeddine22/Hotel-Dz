import { create } from 'zustand';
import api from '@/lib/api';

/**
 * Holds the current user's favorite hotel/house ids so any card can show the
 * correct heart state without re-fetching. Loaded once after login, cleared on
 * logout.
 */
export const useFavoritesStore = create((set, get) => ({
  hotelIds: [],
  houseIds: [],
  loaded: false,

  // Pull the user's favorites (called after the session is restored).
  load: async () => {
    try {
      const { data } = await api.get('/favorites');
      set({
        hotelIds: (data.favorites?.hotels || []).map((h) => h._id),
        houseIds: (data.favorites?.houses || []).map((h) => h._id),
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  clear: () => set({ hotelIds: [], houseIds: [], loaded: false }),

  isHotelFav: (id) => get().hotelIds.includes(id),
  isHouseFav: (id) => get().houseIds.includes(id),

  toggleHotel: async (id) => {
    // Optimistic update, reconciled with the server response.
    const has = get().hotelIds.includes(id);
    set({ hotelIds: has ? get().hotelIds.filter((x) => x !== id) : [...get().hotelIds, id] });
    try {
      const { data } = await api.post(`/favorites/hotels/${id}`);
      set({
        hotelIds: data.isFavorited
          ? Array.from(new Set([...get().hotelIds, id]))
          : get().hotelIds.filter((x) => x !== id),
      });
      return data.isFavorited;
    } catch {
      // Roll back on error.
      set({ hotelIds: has ? Array.from(new Set([...get().hotelIds, id])) : get().hotelIds.filter((x) => x !== id) });
      throw new Error('Impossible de mettre à jour les favoris');
    }
  },

  toggleHouse: async (id) => {
    const has = get().houseIds.includes(id);
    set({ houseIds: has ? get().houseIds.filter((x) => x !== id) : [...get().houseIds, id] });
    try {
      const { data } = await api.post(`/favorites/houses/${id}`);
      set({
        houseIds: data.isFavorited
          ? Array.from(new Set([...get().houseIds, id]))
          : get().houseIds.filter((x) => x !== id),
      });
      return data.isFavorited;
    } catch {
      set({ houseIds: has ? Array.from(new Set([...get().houseIds, id])) : get().houseIds.filter((x) => x !== id) });
      throw new Error('Impossible de mettre à jour les favoris');
    }
  },
}));
