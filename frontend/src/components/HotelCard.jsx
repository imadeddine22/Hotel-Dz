import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { formatDZD } from '@/lib/data';
import FavoriteButton from '@/components/FavoriteButton';

export default function HotelCard({ hotel, list = false }) {
  return (
    <Link
      href={`/hotels/${hotel.id}`}
      className={`group overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1 ${
        list ? 'flex' : ''
      }`}
    >
      <div className={`relative ${list ? 'h-auto w-56 shrink-0' : 'h-52 w-full'}`}>
        <img
          src={hotel.img}
          alt={hotel.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-amber-600 shadow">
          {hotel.stars} ★
        </span>
        {(hotel.id || hotel._id) && (
          <FavoriteButton type="hotel" id={hotel.id || hotel._id} className="absolute left-3 top-3" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold text-ink">{hotel.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-4 w-4 text-brand-500" /> {hotel.city}
          <span className="text-gray-300">•</span>
          <span>{hotel.type}</span>
        </p>

        <div className="mt-3 flex items-center gap-1.5 text-sm">
          <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            {hotel.rating}
          </span>
          <span className="text-gray-400">({hotel.reviews} avis)</span>
        </div>

        <div className="mt-auto pt-4">
          <span className="text-xl font-extrabold text-brand-600">
            {formatDZD(hotel.price)}
          </span>
          <span className="text-sm text-gray-400"> / nuit</span>
        </div>
      </div>
    </Link>
  );
}
