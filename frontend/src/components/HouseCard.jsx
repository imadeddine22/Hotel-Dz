'use client';

import Link from '@/components/LocaleLink';
import { MapPin, BedDouble, Bath, Users } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';

import { getImageUrl } from '@/lib/api';

import { useT } from '@/lib/i18n/useT';
export default function HouseCard({ house, list = false }) {
  const { t, lang } = useT();
  const rawImg = house.images?.[0]?.url || house.img || null;
  const img = getImageUrl(rawImg) ||
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';

  const price = house.pricePerNight ?? house.price ?? 0;

  return (
    <div
      className={`group overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1 relative ${list ? 'flex' : ''}`}
    >
      <Link
        href={`/houses/${house._id || house.id}`}
        className="flex flex-col flex-1"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        {/* Image */}
        <div className={`relative ${list ? 'h-auto w-56 shrink-0' : 'h-52 w-full'}`}>
          <img
            src={img}
            alt={house.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {/* Type badge */}
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-500 shadow">
            {t(house.type || 'Maison')}
          </span>
          {/* Price badge */}
          <span className="absolute right-3 top-3 rounded-full bg-brand-500 px-2.5 py-1 text-xs font-bold text-white shadow">
            {price > 0 ? new Intl.NumberFormat('fr-DZ').format(price) + ' DZD' : t('Sur demande')}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-base font-bold text-gray-900">{house.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4 text-brand-500" />
            {t(house.city)}{house.wilaya && house.wilaya !== house.city ? `${lang === 'ar' ? '، ' : ', '}${t(house.wilaya)}` : ''}
          </p>

          {/* Details row */}
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
            {house.rooms && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" /> {house.rooms} {t('ch.')}
              </span>
            )}
            {house.bathrooms && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" /> {house.bathrooms} {t('SDB')}
              </span>
            )}
            {house.capacity && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {house.capacity} {t('pers.')}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-auto pt-4">
            <span className="text-xl font-extrabold text-brand-500">
              {price > 0 ? new Intl.NumberFormat('fr-DZ').format(price) + ' DZD' : '—'}
            </span>
            <span className="text-sm text-gray-400"> {t('/ nuit')}</span>
          </div>
        </div>
      </Link>
      {(house._id || house.id) && (
        // on the photo (bottom corner), never over the price; outside the Link so a click doesn't navigate
        <div className={`absolute z-20 ${list ? 'left-3 bottom-3' : 'right-3 top-[10.25rem]'}`}>
          <FavoriteButton type="house" id={house._id || house.id} />
        </div>
      )}
    </div>
  );
}
