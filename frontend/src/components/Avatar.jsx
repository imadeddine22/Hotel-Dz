'use client';

import { useState } from 'react';
import { getImageUrl } from '@/lib/api';

/**
 * A user's profile photo, or the first letter of their name when they have none (or it fails to load).
 * Size and shape come from `className`; `initialClassName` colours the letter version.
 */
export default function Avatar({
  user,
  className = 'h-10 w-10 rounded-full text-sm',
  initialClassName = 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white',
}) {
  const [broken, setBroken] = useState('');
  const src = user?.avatar?.url ? getImageUrl(user.avatar.url) : '';
  const showPhoto = src && broken !== src;
  const initial = (user?.fullName || '?').trim().charAt(0).toUpperCase();
  return (
    <span
      className={`relative grid shrink-0 select-none place-items-center overflow-hidden font-bold ${showPhoto ? 'bg-gray-100' : initialClassName} ${className}`}
      aria-hidden="true"
    >
      {showPhoto ? (
        // Google profile photos refuse requests that carry a referrer
        <img src={src} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" onError={() => setBroken(src)} />
      ) : (
        initial
      )}
    </span>
  );
}
