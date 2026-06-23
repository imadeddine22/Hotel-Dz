'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';

/**
 * Heart toggle for saving a hotel or house. Requires login — anonymous clicks
 * redirect to the login page. Used as an absolutely-positioned overlay on cards.
 *
 * Props: type ('hotel' | 'house'), id, and optional className for positioning.
 */
export default function FavoriteButton({ type, id, className = '', size = 18 }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { isHotelFav, isHouseFav, toggleHotel, toggleHouse } = useFavoritesStore();

  const fav = type === 'house' ? isHouseFav(id) : isHotelFav(id);

  const onClick = async (e) => {
    // Cards are wrapped in <Link>; don't navigate when hitting the heart.
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/login?redirect=' + (type === 'house' ? '/houses' : '/hotels'));
      return;
    }
    try {
      if (type === 'house') await toggleHouse(id);
      else await toggleHotel(id);
    } catch {
      /* store handles rollback */
    }
  };

  return (
    <button
      onClick={onClick}
      aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`grid place-items-center rounded-full bg-white/95 shadow transition hover:scale-110 ${className}`}
      style={{ width: 34, height: 34 }}
    >
      <Heart
        size={size}
        className={fav ? 'fill-red-500 text-red-500' : 'text-gray-500'}
      />
    </button>
  );
}
