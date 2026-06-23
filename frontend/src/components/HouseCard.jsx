import Link from 'next/link';
import { MapPin, BedDouble, Bath, Users, Home } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';

export default function HouseCard({ house, list = false }) {
  const img = house.images?.[0]?.url || house.img ||
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';

  const price = house.pricePerNight ?? house.price ?? 0;

  return (
    <Link
      href={`/houses/${house._id || house.id}`}
      className={`group overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1 ${list ? 'flex' : ''}`}
    >
      {/* Image */}
      <div className={`relative ${list ? 'h-auto w-56 shrink-0' : 'h-52 w-full'}`}>
        <img
          src={img}
          alt={house.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {/* Type badge */}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-purple-600 shadow">
          {house.type || 'Maison'}
        </span>
        {/* Price badge */}
        <span className="absolute right-3 top-3 rounded-full bg-purple-600 px-2.5 py-1 text-xs font-bold text-white shadow">
          {price > 0 ? new Intl.NumberFormat('fr-DZ').format(price) + ' DZD' : 'Sur demande'}
        </span>
        {(house._id || house.id) && (
          <FavoriteButton type="house" id={house._id || house.id} className="absolute left-3 top-3" />
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold text-gray-900">{house.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-4 w-4 text-purple-500" />
          {house.city}{house.wilaya && house.wilaya !== house.city ? `, ${house.wilaya}` : ''}
        </p>

        {/* Details row */}
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
          {house.rooms && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {house.rooms} ch.
            </span>
          )}
          {house.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {house.bathrooms} SDB
            </span>
          )}
          {house.capacity && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {house.capacity} pers.
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-auto pt-4">
          <span className="text-xl font-extrabold text-purple-600">
            {price > 0 ? new Intl.NumberFormat('fr-DZ').format(price) + ' DZD' : '—'}
          </span>
          <span className="text-sm text-gray-400"> / nuit</span>
        </div>
      </div>
    </Link>
  );
}
