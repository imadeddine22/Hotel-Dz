'use client';

import { useEffect, useState } from 'react';
import Link from '@/components/LocaleLink';
import { useRouter } from 'next/navigation';
import { Heart, Hotel, Home, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HouseCard from '@/components/HouseCard';
import api, { getImageUrl, resolveImg } from '@/lib/api';
import { formatDZD } from '@/lib/data';
import { useAuthStore } from '@/store/authStore';

import { useT } from '@/lib/i18n/useT';
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

// Combine all known mock hotels


export default function FavoritesPage() {
  const { t } = useT();
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
          /* deleted or no longer approved → drop it */
        }
      }

      let resolvedHouses = [];
      for (const hid of favs.houses) {
        try {
          const { data } = await api.get(`/houses/${hid}`);
          resolvedHouses.push(data.house || data);
        } catch {
          /* deleted or no longer approved → drop it */
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
        <p className="py-20 text-center text-gray-400">{t('Chargement...')}</p>
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
          <h1 className="text-3xl font-extrabold">{t('Mes favoris')}</h1>
          <p className="mt-2 text-rose-50">
            {total > 0 ? t('{total} hébergement(s) sauvegardé(s)', { total }) : t('Vous n\'avez pas encore de favoris')}
          </p>
          {!user && (
            <p className="mt-3 text-sm text-rose-100 bg-white/10 rounded-full px-4 py-1.5">
              💡 <Link href="/login" className="underline font-semibold">{t('Connectez-vous')}</Link> {t('pour synchroniser vos favoris sur tous vos appareils')}
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
            <Hotel className="h-4 w-4" /> {t('Hôtels (')}{hotels.length})
          </button>
          <button
            onClick={() => setTab('houses')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              tab === 'houses' ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 shadow-sm'
            }`}
          >
            <Home className="h-4 w-4" /> {t('Maisons (')}{houses.length})
          </button>
        </div>

        {loading ? (
          <p className="py-16 text-center text-gray-400">{t('Chargement...')}</p>
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
                        <Heart className="h-3 w-3 fill-white" /> {t('Favori')}
                      </span>
                      {h.starRating > 0 && (
                        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-amber-600 shadow">
                          {h.starRating} ★
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-ink">{h.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{t(h.city)}{h.wilaya ? `, ${h.wilaya}` : ''}</p>
                      {h.price > 0 && (
                        <p className="mt-2 text-lg font-extrabold text-brand-600">{formatDZD(h.price)}</p>
                      )}
                    </div>
                  </Link>
                  {!user && (
                    <button
                      onClick={() => removeAnonFav('hotel', h._id || h.id)}
                      className="absolute right-3 bottom-3 grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                      title={t('Retirer des favoris')}
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
                    title={t('Retirer des favoris')}
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
