'use client';

import { useState, useMemo } from 'react';
import { LayoutGrid, List, SlidersHorizontal, Check } from 'lucide-react';
import { CATEGORIES, HOTELS } from '@/lib/data';
import HotelCard from './HotelCard';

export default function HotelsList() {
  const [active, setActive] = useState('Tous');
  const [view, setView] = useState('grid');

  const hotels = useMemo(() => {
    if (active === 'Tous') return HOTELS;
    return HOTELS.filter((h) => h.type === active);
  }, [active]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-ink">
          Hôtels <span className="text-gray-400">({hotels.length})</span>
        </h2>
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
