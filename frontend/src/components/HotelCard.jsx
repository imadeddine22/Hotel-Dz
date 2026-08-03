import Link from 'next/link';
import { MapPin, Star, ThumbsUp, Bed, Ticket, Car, Bus, ChevronRight, Check } from 'lucide-react';
import { formatDZD } from '@/lib/data';
import FavoriteButton from '@/components/FavoriteButton';

export default function HotelCard({ hotel, list = false, onHover }) {
  if (list) {
    return (
      <Link
        href={`/hotels/${hotel.id}`}
        onMouseEnter={() => onHover && onHover(hotel.id || hotel._id)}
        onMouseLeave={() => onHover && onHover(null)}
        className="group flex flex-col md:flex-row overflow-hidden rounded-xl bg-white shadow-sm border border-brand-100 transition hover:shadow-md md:h-[240px]"
      >
        {/* Left: Image */}
        <div className="relative h-48 md:h-full w-full md:w-[280px] shrink-0">
          <img
            src={hotel.img || '/placeholder.jpg'}
            alt={hotel.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {hotel.rating >= 4 && (
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-black/40 backdrop-blur-md px-2 py-1 text-xs font-bold text-white">
              <ThumbsUp className="h-3.5 w-3.5" /> RECOMMENDED
            </div>
          )}
          <div className="absolute right-3 top-3 z-50" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <FavoriteButton type="hotel" id={hotel.id || hotel._id} className="bg-white/80 hover:bg-white" />
          </div>
        </div>

        {/* Middle: Details */}
        <div className="flex flex-1 flex-col justify-between p-4 px-5 border-b md:border-b-0 md:border-r border-gray-100">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">
              <Star className="h-3.5 w-3.5" /> {hotel.type}
            </div>
            <h3 className="text-xl font-extrabold text-ink leading-tight">{hotel.name}</h3>
            
            <div className="mt-3 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-[#f5df4d] px-2 py-0.5 text-sm font-bold text-ink">
                {hotel.rating}/5
              </span>
              <span className="font-bold text-ink">{hotel.rating >= 4.5 ? 'Excellent' : hotel.rating >= 4 ? 'Amazing' : 'Great'}</span>
              <span className="text-sm text-gray-500">({hotel.reviews} reviews)</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-400 mb-1 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {hotel.city}</p>
            <p className="font-bold text-red-600 text-sm">Save 15% (Book by {new Date(Date.now() + 864000000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})</p>
          </div>
        </div>

        {/* Right: Amenities & Action */}
        <div className="flex w-full md:w-[220px] shrink-0 flex-col bg-gray-50/50">
          <div className="flex-1 p-4 pb-0">
            <h4 className="font-bold text-ink mb-3 text-sm">Package Includes</h4>
            <ul className="flex flex-col gap-2.5 text-sm font-medium text-gray-600">
              <li className="flex items-center gap-2.5"><Bed className="h-4 w-4 text-gray-400" /> Lodging</li>
              <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-gray-400" /> WiFi Gratuit</li>
              <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-gray-400" /> Petit-déjeuner</li>
              {hotel.amenities?.slice(0,2).map((am, i) => (
                <li key={i} className="flex items-center gap-2.5"><Check className="h-4 w-4 text-gray-400" /> {am}</li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 mt-auto">
             <div className="w-full flex items-center justify-center gap-2 rounded bg-brand-500 py-3 text-sm font-bold text-white transition hover:bg-brand-600">
                CHECK PRICE <ChevronRight className="h-4 w-4" />
             </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view (original)
  return (
    <Link
      href={`/hotels/${hotel.id}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1"
    >
      <div className="relative h-52 w-full">
        <img
          src={hotel.img}
          alt={hotel.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-amber-600 shadow">
          {hotel.stars} ★
        </span>
        {(hotel.id || hotel._id) && (
          <div className="absolute left-3 top-3 z-50" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <FavoriteButton type="hotel" id={hotel.id || hotel._id} />
          </div>
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
