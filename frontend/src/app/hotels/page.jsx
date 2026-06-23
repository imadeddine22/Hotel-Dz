'use client';

import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HotelCard from '@/components/HotelCard';
import api from '@/lib/api';
import { WILAYAS } from '@/lib/wilayas';
import { HOTELS as MOCK_HOTELS } from '@/lib/data';

const TYPES = ['Luxe', 'Affaires', 'Balnéaire', 'Riad', 'Boutique', 'Montagne', 'Désert', 'Appart-hôtel', 'Économique'];

export default function HotelsPage() {
  const [filters, setFilters] = useState({ wilaya: '', type: '', minStars: '', q: '' });
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await api.get('/hotels', { params });
      setHotels(data.hotels);
      setUsingMock(false);
    } catch {
      // Backend offline — show mock data so the page still works
      let list = MOCK_HOTELS;
      if (filters.type) list = list.filter((h) => h.type === filters.type);
      if (filters.q) list = list.filter((h) => h.name.toLowerCase().includes(filters.q.toLowerCase()));
      if (filters.minStars) list = list.filter((h) => h.stars >= Number(filters.minStars));
      setHotels(list);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalize = (h) => ({
    id: h._id || h.id,
    name: h.name,
    city: h.city,
    type: h.type,
    stars: h.starRating ?? h.stars ?? 3,
    rating: h.avgRating ?? h.rating ?? 0,
    reviews: h.reviewsCount ?? h.reviews ?? 0,
    price: h.price ?? 0,
    img: h.images?.[0]?.url || h.img,
  });

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Search header */}
      <div className="bg-ink py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="mb-4 text-3xl font-extrabold text-white">Trouvez votre hôtel</h1>
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-xl sm:flex-row">
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-5 w-5 text-brand-500" />
              <input
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchHotels()}
                placeholder="Nom d'hôtel..."
                className="w-full py-2 outline-none"
              />
            </div>
            <select
              value={filters.wilaya}
              onChange={(e) => setFilters({ ...filters, wilaya: e.target.value })}
              className="rounded-lg border border-gray-200 px-3 py-2 text-gray-700"
            >
              <option value="">Toutes les wilayas</option>
              {WILAYAS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            <button
              onClick={fetchHotels}
              className="rounded-xl bg-brand-500 px-6 py-2.5 font-semibold text-white hover:bg-brand-600"
            >
              Rechercher
            </button>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Type filters */}
        <div className="no-scrollbar mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-gray-400" />
          <button
            onClick={() => { setFilters({ ...filters, type: '' }); }}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${!filters.type ? 'bg-brand-500 text-white' : 'border border-gray-200 text-gray-600'}`}
          >
            Tous
          </button>
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilters({ ...filters, type: t })}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${filters.type === t ? 'bg-brand-500 text-white' : 'border border-gray-200 text-gray-600'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {usingMock && (
          <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
            API hors ligne — affichage de données de démonstration.
          </p>
        )}

        <h2 className="mb-4 text-xl font-bold text-ink">
          Hôtels <span className="text-gray-400">({hotels.length})</span>
        </h2>

        {loading ? (
          <p className="py-10 text-center text-gray-400">Chargement...</p>
        ) : hotels.length === 0 ? (
          <p className="py-10 text-center text-gray-400">Aucun hôtel trouvé.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hotels.map((h) => (
              <HotelCard key={h._id || h.id} hotel={normalize(h)} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
