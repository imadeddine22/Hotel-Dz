'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';

// ─── localStorage helpers for anonymous favorites ───────────────────
const ANON_KEY = 'anon_favorites';

function getAnonFavs() {
  if (typeof window === 'undefined') return { hotels: [], houses: [] };
  try {
    return JSON.parse(localStorage.getItem(ANON_KEY)) || { hotels: [], houses: [] };
  } catch {
    return { hotels: [], houses: [] };
  }
}

function setAnonFavs(favs) {
  localStorage.setItem(ANON_KEY, JSON.stringify(favs));
}

/**
 * Heart toggle for saving a hotel or house.
 * – Logged-in users use the API-backed favoritesStore.
 * – Anonymous users get localStorage-based favorites.
 * – Clicking fills the heart and navigates to /favorites.
 *
 * Props: type ('hotel' | 'house'), id, and optional className for positioning.
 */
export default function FavoriteButton({ type, id, className = '', size = 18 }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { isHotelFav, isHouseFav, toggleHotel, toggleHouse } = useFavoritesStore();
  const [animating, setAnimating] = useState(false);
  const [anonFav, setAnonFav] = useState(false);

  // Check anon favorites on mount
  useEffect(() => {
    if (!user) {
      const favs = getAnonFavs();
      const list = type === 'house' ? favs.houses : favs.hotels;
      setAnonFav(list.includes(id));
    }
  }, [user, type, id]);

  const fav = user
    ? (type === 'house' ? isHouseFav(id) : isHotelFav(id))
    : anonFav;

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Trigger pulse animation
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    if (user) {
      // Logged-in: use API-backed store
      try {
        let isFav;
        if (type === 'house') isFav = await toggleHouse(id);
        else isFav = await toggleHotel(id);

        // Navigate to favorites if we just added (not removed)
        if (isFav) {
          setTimeout(() => router.push('/favorites'), 400);
        }
      } catch {
        /* store handles rollback */
      }
    } else {
      // Anonymous: toggle in localStorage
      const favs = getAnonFavs();
      const key = type === 'house' ? 'houses' : 'hotels';
      const has = favs[key].includes(id);

      if (has) {
        favs[key] = favs[key].filter((x) => x !== id);
        setAnonFav(false);
      } else {
        favs[key].push(id);
        setAnonFav(true);
      }
      setAnonFavs(favs);

      // Navigate to favorites if we just added
      if (!has) {
        setTimeout(() => router.push('/favorites'), 400);
      }
    }
  };

  return (
    <>
      <style>{`
        @keyframes heart-pop {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.5); }
          60%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes heart-ripple {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .fav-btn-animating .fav-heart {
          animation: heart-pop 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both;
        }
        .fav-btn-animating .fav-ripple {
          animation: heart-ripple 0.5s ease-out forwards;
        }
      `}</style>
      <button
        onClick={onClick}
        aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        className={`fav-btn relative grid place-items-center rounded-full shadow transition-all duration-200 hover:scale-110 active:scale-95 ${animating ? 'fav-btn-animating' : ''} ${className}`}
        style={{
          width: 36,
          height: 36,
          background: fav ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.95)',
          border: fav ? '1.5px solid rgba(239,68,68,0.3)' : '1.5px solid rgba(255,255,255,0.8)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {/* Ripple ring */}
        <span
          className="fav-ripple pointer-events-none absolute inset-0 rounded-full"
          style={{ border: '2px solid #ef4444', opacity: 0 }}
        />
        <Heart
          size={size}
          className={`fav-heart transition-colors duration-200 ${fav ? 'fill-red-500 text-red-500' : 'fill-transparent text-gray-500'}`}
        />
      </button>
    </>
  );
}

