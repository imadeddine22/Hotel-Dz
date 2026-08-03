'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, MapPin } from 'lucide-react';
import { QUICK_AREAS, TRANSLATIONS } from '@/lib/data';
import { useLangStore } from '@/store/authStore';

export default function Hero() {
  const router = useRouter();
  const { lang } = useLangStore();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;

  const [wilaya, setWilaya] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (wilaya.trim()) params.set('wilaya', wilaya.trim());
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);

    router.push(`/hotels?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-500/10 via-white to-gray-50 pb-16 pt-12 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Title */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {t.heroTitle}
          </h1>
          <p className="mt-4 text-base text-gray-600 sm:text-lg">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Search Box */}
        <form
          onSubmit={handleSearch}
          className="mx-auto mt-8 max-w-4xl rounded-3xl bg-white p-4 shadow-xl ring-1 ring-gray-100 sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-12">
            {/* Wilaya / City */}
            <div className="sm:col-span-5">
              <label className="mb-1 block text-xs font-bold text-gray-500">
                {t.searchDestination}
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-3.2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  placeholder={t.searchWilayaPlaceholder}
                  className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold outline-none focus:border-brand-500 rtl:pr-10 ltr:pl-10"
                />
              </div>
            </div>

            {/* Check-in */}
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-bold text-gray-500">{t.checkIn}</label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-3.2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-3 text-xs font-semibold outline-none focus:border-brand-500 rtl:pr-10 ltr:pl-10"
                />
              </div>
            </div>

            {/* Check-out */}
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-bold text-gray-500">{t.checkOut}</label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-3.2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-3 text-xs font-semibold outline-none focus:border-brand-500 rtl:pr-10 ltr:pl-10"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="sm:col-span-1 flex items-end">
              <button
                type="submit"
                aria-label={t.searchBtn}
                className="grid h-12 w-full place-items-center rounded-xl bg-brand-500 text-white shadow-md transition hover:bg-brand-600"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Areas */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
            {QUICK_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setWilaya(area)}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition"
              >
                {area}
              </button>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}
