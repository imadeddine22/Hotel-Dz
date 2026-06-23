'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Hotel, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HouseCard from '@/components/HouseCard';
import api from '@/lib/api';
import { formatDZD } from '@/lib/data';
import { useAuthStore } from '@/store/authStore';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const [hotels, setHotels] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('hotels');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?redirect=/favorites');
      return;
    }
    (async () => {
      try {
        const { data } = await api.get('/favorites');
        setHotels(data.favorites?.hotels || []);
        setHouses(data.favorites?.houses || []);
      } catch {
        /* offline */
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, router]);

  if (authLoading || !user) {
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
            {total > 0 ? `${total} hébergement(s) sauvegardé(s)` : 'Vous n’avez pas encore de favoris'}
          </p>
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
              tab === 'houses' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 shadow-sm'
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
                <Link
                  key={h._id}
                  href={`/hotels/${h._id}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1"
                >
                  <div className="relative h-48">
                    <img
                      src={h.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'}
                      alt={h.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {h.starRating > 0 && (
                      <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-amber-600 shadow">
                        {h.starRating} ★
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-ink">{h.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{h.city}, {h.wilaya}</p>
                  </div>
                </Link>
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
              <HouseCard key={h._id} house={h} />
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
