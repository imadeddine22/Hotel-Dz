'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight, MapPin, Plus } from 'lucide-react';
import { FEATURED, TRANSLATIONS } from '@/lib/data';
import { useAuthStore, useLangStore } from '@/store/authStore';
import FavoriteButton from '@/components/FavoriteButton';

export default function FeaturedHotels() {
  const scroller = useRef(null);
  const user = useAuthStore((s) => s.user);
  const { lang } = useLangStore();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  const isOwner = user?.role === 'owner';

  const scroll = (dir) => {
    scroller.current?.scrollBy({ left: dir * 380, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br bg-brand-500 text-white text-white shadow">
            <Star className="h-6 w-6 fill-white" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-ink">{t.featuredHotels}</h2>
            <p className="text-sm text-gray-500">{t.featuredHotelsSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOwner && (
            <Link
              href="/owner/hotels/new"
              className="flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-600"
            >
              <Plus className="h-4 w-4" /> {t.becomeOwner}
            </Link>
          )}
          <Link
            href="/hotels"
            className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
          >
            {t.seeAll} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="absolute -left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg hover:bg-gray-50"
          aria-label="Précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          ref={scroller}
          className="no-scrollbar flex snap-x gap-5 overflow-x-auto scroll-smooth pb-2"
        >
          {FEATURED.map((h) => (
            <Link
              key={h.id}
              href={`/hotels/${h.id}`}
              className="group relative h-72 w-80 shrink-0 snap-start overflow-hidden rounded-2xl shadow-card"
            >
              <img
                src={h.img}
                alt={h.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br bg-brand-500 text-white text-white shadow">
                <Star className="h-5 w-5 fill-white" />
              </span>
              <div className="absolute right-3 top-3 z-50" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <FavoriteButton type="hotel" id={h.id} />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-lg font-bold text-white">{h.name}</h3>
                <p className="flex items-center gap-1 text-sm text-gray-200">
                  <MapPin className="h-4 w-4" /> {h.city}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={() => scroll(1)}
          className="absolute -right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg hover:bg-gray-50"
          aria-label="Suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
