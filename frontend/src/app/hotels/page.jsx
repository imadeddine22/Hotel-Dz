'use client';

import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HotelCard from '@/components/HotelCard';
import api from '@/lib/api';
import { useWilayas } from '@/hooks/useWilayas';
import { HOTELS as MOCK_HOTELS } from '@/lib/data';

import HotelsMap from '@/components/HotelsMap';

const TYPES = ['Luxe', 'Affaires', 'Balnéaire', 'Riad', 'Boutique', 'Montagne', 'Désert', 'Appart-hôtel', 'Économique'];

export default function HotelsPage() {
  const { wilayas } = useWilayas();
  const [filters, setFilters] = useState({ wilaya: '', type: '', minStars: '', q: '' });
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [activeHotelId, setActiveHotelId] = useState(null);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await api.get('/hotels', { params });
      setHotels(data.hotels);
      setUsingMock(false);
    } catch {
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
  }, [filters.type, filters.wilaya]); // fetch automatically on filter change

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
    amenities: h.amenities || [],
    coordinates: h.coordinates || null,
  });

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-white">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANE - List */}
        <div className="flex w-full flex-col overflow-y-auto lg:w-[55%]">
          
          {/* Header & Filters (Sticky) */}
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
            <h1 className="mb-4 text-2xl font-extrabold text-ink">Trouvez votre hôtel de rêve</h1>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 focus-within:border-brand-500 focus-within:bg-white transition-colors">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  value={filters.q}
                  onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && fetchHotels()}
                  placeholder="Rechercher une destination ou un hôtel..."
                  className="w-full outline-none bg-transparent text-sm"
                />
              </div>

              <select
                value={filters.wilaya}
                onChange={(e) => setFilters({ ...filters, wilaya: e.target.value })}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none hover:border-brand-300 transition-colors"
              >
                <option value="">Toutes les wilayas</option>
                {wilayas.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Type Filter Bar */}
            <div className="no-scrollbar mt-4 flex items-center gap-2 overflow-x-auto pb-1">
              <SlidersHorizontal className="mr-1 h-4 w-4 shrink-0 text-gray-400" />
              <button
                onClick={() => setFilters({ ...filters, type: '' })}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!filters.type ? 'bg-brand-500 text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Tous
              </button>
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilters({ ...filters, type: t })}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filters.type === t ? 'bg-[#00bcd4] text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* List Content */}
          <div className="p-4 sm:p-6 bg-gray-50/30 flex-1">
            {usingMock && (
              <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700 border border-amber-100">
                API hors ligne — affichage de données de démonstration.
              </p>
            )}

            <h2 className="mb-4 text-lg font-bold text-ink flex items-center gap-2">
              Résultats de recherche <span className="rounded bg-brand-50 px-2 py-0.5 text-sm text-brand-600">{hotels.length} propriétés</span>
            </h2>

            {loading ? (
              <p className="py-10 text-center text-gray-400">Recherche en cours...</p>
            ) : hotels.length === 0 ? (
              <p className="py-10 text-center text-gray-400">Aucun hôtel trouvé pour ces critères.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {hotels.map((h) => (
                  <HotelCard 
                    key={h._id || h.id} 
                    hotel={normalize(h)} 
                    list={true} 
                    onHover={setActiveHotelId} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE - Map */}
        <div className="hidden lg:block lg:w-[45%] h-full bg-gray-100 relative shadow-inner z-0">
          <HotelsMap 
            hotels={hotels.map(normalize)} 
            activeHotelId={activeHotelId} 
            onHotelHover={setActiveHotelId} 
          />
        </div>
      </div>
    </main>
  );
}
