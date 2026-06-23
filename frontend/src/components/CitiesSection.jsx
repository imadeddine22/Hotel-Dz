import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { CITIES } from '@/lib/data';

export default function CitiesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow">
          <MapPin className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-2xl font-extrabold text-ink">Découvrez par ville</h2>
          <p className="text-sm text-gray-500">Explorez les meilleurs hôtels de chaque ville</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CITIES.map((c) => (
          <Link
            key={c.name}
            href={`/hotels?wilaya=${encodeURIComponent(c.name)}`}
            className="group relative h-40 overflow-hidden rounded-2xl shadow-card"
          >
            <img
              src={c.img}
              alt={c.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 text-right">
              <h3 className="text-lg font-bold text-white">{c.name}</h3>
              <p className="text-xs text-gray-200">{c.count} hôtels</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
