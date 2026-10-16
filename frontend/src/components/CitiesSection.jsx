'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import api from '@/lib/api';
import { CITIES, TRANSLATIONS } from '@/lib/data';
import { useLangStore } from '@/store/authStore';

export default function CitiesSection({ selectedCity, onSelectCity }) {
  const { lang } = useLangStore();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  const [counts, setCounts] = useState({});

  // Real number of approved hotels per city (the static data only had placeholder counts)
  useEffect(() => {
    Promise.all(
      CITIES.map((c) =>
        api
          .get('/hotels', { params: { wilaya: c.name, limit: 1 } })
          .then(({ data }) => [c.name, data.total ?? 0])
          .catch(() => [c.name, null])
      )
    ).then((entries) => setCounts(Object.fromEntries(entries)));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow">
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
              aria-pressed={isSelected}
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
                {counts[c.name] != null && (
                  <p className="text-xs text-gray-200">{counts[c.name]} {t.hotelsCount}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
