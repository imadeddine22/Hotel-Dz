'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Star, Users, BedDouble, Wifi, Image as ImageIcon } from 'lucide-react';

const ROOM_PLACEHOLDER = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FavoriteButton from '@/components/FavoriteButton';
import LocationMap from '@/components/LocationMap';
import api from '@/lib/api';
import { formatDZD, HOTELS as MOCK_HOTELS } from '@/lib/data';

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
function resolveImg(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${SERVER}${url}`;
}

export default function HotelDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mock, setMock] = useState(false);
  const [bedFilter, setBedFilter] = useState('all'); // 'all' | '1' | '2' | '3plus'

  // Bucket a room into the beds filter groups (1 / 2 / 3+).
  const bedBucket = (n) => (n >= 3 ? '3plus' : String(n || 1));
  const filteredRooms = useMemo(
    () => (bedFilter === 'all' ? rooms : rooms.filter((r) => bedBucket(r.bedsCount) === bedFilter)),
    [rooms, bedFilter]
  );
  const BED_FILTERS = [
    { key: 'all', label: 'Toutes les chambres' },
    { key: '1', label: '1 lit' },
    { key: '2', label: '2 lits' },
    { key: '3plus', label: '3+ lits' },
  ];

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/hotels/${id}`);
        setHotel(data.hotel);
        setRooms(data.rooms || []);
        try {
          const r = await api.get(`/hotels/${id}/reviews`);
          setReviews(r.data.reviews || []);
        } catch { /* no reviews */ }
      } catch {
        // Mock fallback
        const m = MOCK_HOTELS.find((h) => h.id === id) || MOCK_HOTELS[0];
        setHotel({
          _id: m.id, name: m.name, city: m.city, wilaya: m.city, type: m.type,
          starRating: m.stars, avgRating: m.rating, reviewsCount: m.reviews,
          description: 'Un hôtel confortable avec un excellent service, idéalement situé.',
          images: [{ url: m.img }], amenities: ['Wifi', 'Parking', 'Restaurant', 'Climatisation'],
        });
        setRooms([
          { _id: 'r1', title: 'Chambre Simple', type: 'single', pricePerNight: Math.round(m.price * 0.7), capacity: 1, bedsCount: 1, quantity: 5, amenities: ['Wifi', 'TV'], images: [{ url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80' }] },
          { _id: 'r2', title: 'Chambre Double', type: 'double', pricePerNight: m.price, capacity: 2, bedsCount: 2, quantity: 5, amenities: ['Wifi', 'Climatisation', 'TV'], images: [{ url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80' }] },
          { _id: 'r3', title: 'Suite Exécutive', type: 'suite', pricePerNight: Math.round(m.price * 1.6), capacity: 3, bedsCount: 2, quantity: 2, amenities: ['Wifi', 'Vue mer', 'Minibar'], images: [{ url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80' }] },
          { _id: 'r4', title: 'Chambre Familiale', type: 'family', pricePerNight: Math.round(m.price * 1.9), capacity: 6, bedsCount: 3, quantity: 3, amenities: ['Wifi', 'Cuisine', 'Balcon'], images: [{ url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80' }] },
        ]);
        setMock(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen"><Navbar /><p className="py-20 text-center text-gray-400">Chargement...</p></main>
    );
  }
  if (!hotel) {
    return (
      <main className="min-h-screen"><Navbar /><p className="py-20 text-center text-gray-400">Hôtel introuvable.</p></main>
    );
  }

  const cover = resolveImg(hotel.images?.[0]?.url);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Gallery */}
      <div className="relative h-80 w-full overflow-hidden sm:h-96">
        {cover && <img src={cover} alt={hotel.name} className="h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {(hotel._id || hotel.id) && (
          <div className="absolute right-4 top-4">
            <FavoriteButton type="hotel" id={hotel._id || hotel.id} size={20} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-7xl px-4 pb-6 sm:px-6">
          <span className="mb-2 inline-block rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-amber-600">
            {hotel.starRating} ★ · {hotel.type}
          </span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{hotel.name}</h1>
          <p className="flex items-center gap-1 text-gray-200">
            <MapPin className="h-4 w-4" /> {hotel.city}, {hotel.wilaya}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3">
        {/* Left: description, amenities, rooms, reviews */}
        <div className="lg:col-span-2">
          {mock && (
            <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
              API hors ligne — données de démonstration.
            </p>
          )}

          <h2 className="mb-2 text-xl font-bold text-ink">À propos</h2>
          <p className="mb-6 text-gray-600">{hotel.description || 'Aucune description.'}</p>

          {hotel.amenities?.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 font-semibold text-ink">Équipements</h3>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((a) => (
                  <span key={a} className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
                    <Wifi className="h-3.5 w-3.5" /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location map */}
          <div className="mb-8">
            <h3 className="mb-1 font-semibold text-ink">Localisation</h3>
            <p className="mb-3 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" /> {hotel.address || `${hotel.city}, ${hotel.wilaya}`}
            </p>
            <LocationMap lat={hotel.coordinates?.lat} lng={hotel.coordinates?.lng} label={hotel.name} accent="#00bcd4" />
          </div>

          <h2 className="mb-3 text-xl font-bold text-ink">Chambres disponibles</h2>

          {/* Beds filter bar (Booking.com style) */}
          {rooms.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {BED_FILTERS.map((f) => {
                  const active = bedFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setBedFilter(f.key)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                        active
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
              <span className="text-sm text-gray-400">
                {filteredRooms.length} sur {rooms.length} chambre{rooms.length > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="space-y-4">
            {filteredRooms.map((room) => (
              <div key={room._id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm sm:flex-row">
                {/* Room image */}
                <div className="relative h-44 w-full shrink-0 bg-gray-100 sm:h-auto sm:w-60">
                  <img
                    src={resolveImg(room.images?.[0]?.url) || ROOM_PLACEHOLDER}
                    alt={room.title}
                    className="h-full w-full object-cover"
                  />
                  {room.images?.length > 1 && (
                    <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                      <ImageIcon className="h-3 w-3" /> {room.images.length}
                    </span>
                  )}
                </div>

                {/* Info + price */}
                <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-bold text-ink">{room.title}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 font-medium text-brand-700">
                        <BedDouble className="h-3.5 w-3.5" /> {room.bedsCount} lit{room.bedsCount > 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {room.capacity} pers.</span>
                      <span className="capitalize">{room.type}</span>
                    </p>
                    {room.amenities?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {room.amenities.slice(0, 3).map((a) => (
                          <span key={a} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <span className="text-lg font-extrabold text-brand-600">{formatDZD(room.pricePerNight)}<span className="text-xs font-normal text-gray-400"> /nuit</span></span>
                    <button
                      onClick={() => router.push(`/booking/${room._id}?hotel=${hotel._id}`)}
                      className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600"
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {rooms.length === 0 && <p className="text-gray-400">Aucune chambre disponible.</p>}
            {rooms.length > 0 && filteredRooms.length === 0 && (
              <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center text-gray-400">
                Aucune chambre avec ce nombre de lits. Essayez un autre filtre.
              </p>
            )}
          </div>

          {/* Reviews */}
          <h2 className="mb-4 mt-10 text-xl font-bold text-ink">Avis ({reviews.length})</h2>
          <div className="space-y-4">
            {reviews.length === 0 && <p className="text-gray-400">Pas encore d&apos;avis.</p>}
            {reviews.map((rev) => (
              <div key={rev._id} className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold text-ink">{rev.customer?.fullName || 'Client'}</span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {rev.rating}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: summary card */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 font-bold text-amber-700">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {hotel.avgRating || '—'}
              </span>
              <span className="text-sm text-gray-500">{hotel.reviewsCount || 0} avis</span>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              À partir de{' '}
              <span className="text-xl font-extrabold text-brand-600">
                {rooms.length ? formatDZD(Math.min(...rooms.map((r) => r.pricePerNight))) : '—'}
              </span>{' '}
              / nuit
            </p>
            <button
              onClick={() => rooms[0] && router.push(`/booking/${rooms[0]._id}?hotel=${hotel._id}`)}
              className="w-full rounded-lg bg-brand-500 py-3 font-semibold text-white hover:bg-brand-600"
            >
              Réserver maintenant
            </button>
          </div>
        </aside>
      </div>

      <Footer />
    </main>
  );
}
