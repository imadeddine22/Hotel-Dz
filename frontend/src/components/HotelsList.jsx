'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayoutGrid, List, SlidersHorizontal, Check } from 'lucide-react';
import { CATEGORIES, HOTELS } from '@/lib/data';
import HotelCard from './HotelCard';

function HotelsListContent({ selectedCity, onSelectCity }) {
  const searchParams = useSearchParams();
  const urlWilaya = searchParams.get('wilaya') || '';
  const wilaya = selectedCity !== undefined ? selectedCity : urlWilaya;

  const [active, setActive] = useState('Tous');
  const [view, setView] = useState('grid');

  const hotels = useMemo(() => {
    let list = HOTELS;
    if (active !== 'Tous') {
      list = list.filter((h) => h.type === active);
    }
    if (wilaya) {
      list = list.filter((h) => h.city.toLowerCase().includes(wilaya.toLowerCase()));
    }
    return list;
  }, [active, wilaya]);

  return (
    <section id="hotels-list" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 scroll-mt-24">
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">
            {wilaya ? `Hôtels à ${wilaya}` : 'Tous les hôtels'}{' '}
            <span className="text-gray-400">({hotels.length})</span>
          </h2>
          {wilaya && (
            <button
              onClick={() => onSelectCity && onSelectCity('')}
              className="mt-1 text-xs font-semibold text-brand-600 hover:underline"
            >
              Effacer le filtre de la ville
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-ink">
            <SlidersHorizontal className="h-4 w-4" /> Filtres
          </button>
          <div className="flex overflow-hidden rounded-lg border border-gray-200">
            <button
              onClick={() => setView('grid')}
              aria-label="Vue grille"
              className={`grid h-9 w-9 place-items-center ${
                view === 'grid' ? 'bg-brand-50 text-brand-600' : 'text-gray-500'
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView('list')}
              aria-label="Vue liste"
              className={`grid h-9 w-9 place-items-center ${
                view === 'list' ? 'bg-brand-50 text-brand-600' : 'text-gray-500'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category circles */}
      <div className="no-scrollbar mb-8 flex gap-6 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => {
          const isActive = active === c.name;
          return (
            <button
              key={c.name}
              onClick={() => setActive(c.name)}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <span
                className={`relative h-20 w-20 overflow-hidden rounded-full ring-2 transition ${
                  isActive ? 'ring-brand-500' : 'ring-transparent'
                }`}
              >
                <img src={c.img} alt="" className="h-full w-full object-cover" />
                {isActive && (
                  <span className="absolute inset-0 grid place-items-center bg-brand-500/40">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-white">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                  </span>
                )}
              </span>
              <span
                className={`text-sm ${
                  isActive ? 'font-semibold text-brand-600' : 'text-gray-600'
                }`}
              >
                {c.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hotel cards */}
      {view === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {hotels.map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {hotels.map((h) => (
            <HotelCard key={h.id} hotel={h} list />
          ))}
        </div>
      )}

      {hotels.length === 0 && (
        <p className="py-10 text-center text-gray-400">Aucun hôtel dans cette catégorie.</p>
      )}
    </section>
  );
}

export default function HotelsList({ selectedCity, onSelectCity }) {
  return (
    <Suspense fallback={<div className="py-20 text-center">Chargement des hôtels...</div>}>
      <HotelsListContent selectedCity={selectedCity} onSelectCity={onSelectCity} />
    </Suspense>
  );
}

