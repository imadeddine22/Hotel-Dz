'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Hotel, Home, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HouseCard from '@/components/HouseCard';
import api, { getImageUrl, resolveImg } from '@/lib/api';
import { formatDZD } from '@/lib/data';
import { useAuthStore } from '@/store/authStore';
import { HOTELS as MOCK_HOTELS, FEATURED } from '@/lib/data';

// ── localStorage helpers (shared with FavoriteButton) ──────────────
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

// Mock houses for anonymous favorites
const MOCK_HOUSES = [
  { _id: 'hm1', name: 'Villa Yasmine', city: 'Alger', wilaya: 'Alger', type: 'Villa', rooms: 4, bathrooms: 2, capacity: 8, pricePerNight: 15000, images: [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' }] },
  { _id: 'hm2', name: 'Chalet Tikjda', city: 'Bouira', wilaya: 'Bouira', type: 'Chalet', rooms: 3, bathrooms: 1, capacity: 6, pricePerNight: 9000, images: [{ url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80' }] },
  { _id: 'hm3', name: 'Appartement Vue Mer', city: 'Béjaïa', wilaya: 'Béjaïa', type: 'Appartement', rooms: 2, bathrooms: 1, capacity: 4, pricePerNight: 6000, images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80' }] },
  { _id: 'hm4', name: 'Riad Tlemcen', city: 'Tlemcen', wilaya: 'Tlemcen', type: 'Riad', rooms: 3, bathrooms: 2, capacity: 6, pricePerNight: 11000, images: [{ url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80' }] },
];

// Combine all known mock hotels
const ALL_MOCK_HOTELS = [...MOCK_HOTELS, ...FEATURED].reduce((acc, h) => {
  if (!acc.find((x) => (x._id || x.id) === (h._id || h.id))) acc.push(h);
  return acc;
}, []);

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const [hotels, setHotels] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('hotels');

  const loadFavorites = async () => {
    setLoading(true);

    if (user) {
      // ── Logged-in: fetch from API ──
      try {
        const { data } = await api.get('/favorites');
        setHotels(data.favorites?.hotels || []);
        setHouses(data.favorites?.houses || []);
      } catch {
        /* offline */
      }
    } else {
      // ── Anonymous: read from localStorage ──
      const favs = getAnonFavs();

      // Try to resolve favorite hotels from API, fallback to mocks
      let resolvedHotels = [];
      for (const hid of favs.hotels) {
        try {
          const { data } = await api.get(`/hotels/${hid}`);
          resolvedHotels.push(data.hotel || data);
        } catch {
          const mock = ALL_MOCK_HOTELS.find((m) => (m._id || m.id) === hid);
          if (mock) resolvedHotels.push({ _id: mock._id || mock.id, name: mock.name, city: mock.city, wilaya: mock.wilaya || '', images: mock.images || (mock.img ? [{ url: mock.img }] : []), starRating: mock.stars || mock.starRating || 0, price: mock.price || 0 });
        }
      }

      let resolvedHouses = [];
      for (const hid of favs.houses) {
        try {
          const { data } = await api.get(`/houses/${hid}`);
          resolvedHouses.push(data.house || data);
        } catch {
          const mock = MOCK_HOUSES.find((m) => m._id === hid);
          if (mock) resolvedHouses.push(mock);
        }
      }

      setHotels(resolvedHotels);
      setHouses(resolvedHouses);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Remove anonymous favorite
  const removeAnonFav = (type, id) => {
    const favs = getAnonFavs();
    const key = type === 'house' ? 'houses' : 'hotels';
    favs[key] = favs[key].filter((x) => x !== id);
    setAnonFavs(favs);
    // Refresh state
    if (type === 'hotel') setHotels((prev) => prev.filter((h) => (h._id || h.id) !== id));
    else setHouses((prev) => prev.filter((h) => (h._id || h.id) !== id));
  };

  if (authLoading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <p className="py-20 text-center text-gray-400">Chargement...</p>
      </main>
    );
  }

  const total = hotels.length + houses.length;

  return (
    <main className="min-h-screen" style={{ background: '#f8fafc' }}>
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-rose-500 to-pink-600 py-14 text-center text-white">
        <div className="mx-auto flex max-w-xl flex-col items-center px-4">
          <span className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-white/20">
            <Heart className="h-7 w-7 fill-white" />
          </span>
          <h1 className="text-3xl font-extrabold">Mes favoris</h1>
          <p className="mt-2 text-rose-50">
            {total > 0 ? `${total} hébergement(s) sauvegardé(s)` : 'Vous n\'avez pas encore de favoris'}
          </p>
          {!user && (
            <p className="mt-3 text-sm text-rose-100 bg-white/10 rounded-full px-4 py-1.5">
              💡 <Link href="/login" className="underline font-semibold">Connectez-vous</Link> pour synchroniser vos favoris sur tous vos appareils
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Tabs */}
        <div className="mb-8 flex justify-center gap-2">
          <button
            onClick={() => setTab('hotels')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              tab === 'hotels' ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 shadow-sm'
            }`}
          >
            <Hotel className="h-4 w-4" /> Hôtels ({hotels.length})
          </button>
          <button
            onClick={() => setTab('houses')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              tab === 'houses' ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 shadow-sm'
            }`}
          >
            <Home className="h-4 w-4" /> Maisons ({houses.length})
          </button>
        </div>

        {loading ? (
          <p className="py-16 text-center text-gray-400">Chargement...</p>
        ) : tab === 'hotels' ? (
          hotels.length === 0 ? (
            <EmptyState
              icon={<Hotel className="h-12 w-12" />}
              text="Aucun hôtel en favori"
              href="/hotels"
              cta="Découvrir les hôtels"
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hotels.map((h) => (
                <div key={h._id || h.id} className="relative group">
                  <Link
                    href={`/hotels/${h._id || h.id}`}
                    className="group overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1 block"
                  >
                    <div className="relative h-48">
                      <img
                        src={resolveImg(h.images?.[0]?.url) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'}
                        alt={h.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow flex items-center gap-1">
                        <Heart className="h-3 w-3 fill-white" /> Favori
                      </span>
                      {h.starRating > 0 && (
                        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-amber-600 shadow">
                          {h.starRating} ★
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-ink">{h.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{h.city}{h.wilaya ? `, ${h.wilaya}` : ''}</p>
                      {h.price > 0 && (
                        <p className="mt-2 text-lg font-extrabold text-brand-600">{formatDZD(h.price)}</p>
                      )}
                    </div>
                  </Link>
                  {!user && (
                    <button
                      onClick={() => removeAnonFav('hotel', h._id || h.id)}
                      className="absolute right-3 bottom-3 grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                      title="Retirer des favoris"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        ) : houses.length === 0 ? (
          <EmptyState
            icon={<Home className="h-12 w-12" />}
            text="Aucune maison en favori"
            href="/houses"
            cta="Découvrir les maisons"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {houses.map((h) => (
              <div key={h._id || h.id} className="relative group">
                <HouseCard house={h} />
                {!user && (
                  <button
                    onClick={() => removeAnonFav('house', h._id || h.id)}
                    className="absolute right-3 bottom-3 grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                    title="Retirer des favoris"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function EmptyState({ icon, text, href, cta }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-white py-16 text-center shadow-card">
      <span className="text-gray-300">{icon}</span>
      <p className="text-lg font-semibold text-gray-500">{text}</p>
      <Link
        href={href}
        className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
      >
        {cta}
      </Link>
    </div>
  );
}
