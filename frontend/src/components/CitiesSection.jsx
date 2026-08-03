'use client';

import { MapPin } from 'lucide-react';
import { CITIES, TRANSLATIONS } from '@/lib/data';
import { useLangStore } from '@/store/authStore';

export default function CitiesSection({ selectedCity, onSelectCity }) {
  const { lang } = useLangStore();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow">
            <MapPin className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-ink">{t.discoverByCity}</h2>
            <p className="text-sm text-gray-500">{t.discoverSubtitle}</p>
          </div>
        </div>
        {selectedCity && (
          <button
            onClick={() => onSelectCity('')}
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            {t.showAllCities}
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CITIES.map((c) => {
          const isSelected = selectedCity === c.name;
          return (
            <button
              key={c.name}
              onClick={() => {
                const nextCity = isSelected ? '' : c.name;
                onSelectCity(nextCity);
                const el = document.getElementById('hotels-list');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`group relative h-40 w-full overflow-hidden rounded-2xl text-left shadow-card transition-all duration-300 ${
                isSelected ? 'ring-4 ring-brand-500 scale-105 shadow-lg' : 'hover:scale-102'
              }`}
            >
              <img
                src={c.img}
                alt={c.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-right">
                <h3 className="text-lg font-bold text-white">{c.name}</h3>
                <p className="text-xs text-gray-200">{c.count} {t.hotelsCount}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
