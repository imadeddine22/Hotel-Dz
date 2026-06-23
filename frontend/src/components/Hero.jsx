'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, ArrowRight, Menu, X, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const LEFT_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Hôtels', href: '/hotels' },
  { label: 'Destinations', href: '/hotels' },
];
const RIGHT_LINKS = [
  { label: 'À propos', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const STATS = [
  { value: '650+', label: 'hôtels partenaires' },
  { value: '58', label: 'wilayas couvertes' },
  { value: '4.6', label: 'note des clients' },
];

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  const dashHref =
    user?.role === 'admin' ? '/admin' : user?.role === 'owner' ? '/owner/dashboard' : '/my-bookings';

  const goSearch = () => {
    const q = query.trim();
    router.push(q ? `/hotels?wilaya=${encodeURIComponent(q)}` : '/hotels');
  };

  return (
    <section className="p-3 sm:p-4">
      <div className="relative min-h-[92dvh] overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
        {/* Background */}
        <img
          src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1920&q=80"
          alt="Hôtel de luxe avec piscine au coucher du soleil"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/50" />

        {/* ---- Top nav (inside the image) ---- */}
        <nav className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-10">
          {/* Left links */}
          <div className="hidden flex-1 items-center gap-6 lg:flex">
            {LEFT_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm text-white/90 transition hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Center monogram */}
          <Link
            href="/"
            className="grid h-12 w-12 place-items-center rounded-full border border-white/40 text-white backdrop-blur-sm"
            aria-label="HotelsDZ — Accueil"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {/* Right links + CTA */}
          <div className="hidden flex-1 items-center justify-end gap-6 lg:flex">
            {RIGHT_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm text-white/90 transition hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <Link
                href={dashHref}
                className="flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-white"
              >
                <User className="h-4 w-4" /> {user.fullName.split(' ')[0]}
              </Link>
            ) : (
              <Link
                href="/register"
                className="rounded-full bg-white/95 px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-white"
              >
                Réservation toute l&apos;année
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm lg:hidden"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="absolute inset-x-5 top-20 z-30 rounded-2xl bg-white p-4 shadow-xl lg:hidden">
            {[...LEFT_LINKS, ...RIGHT_LINKS].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="block rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={user ? dashHref : '/login'}
              className="mt-2 block rounded-full bg-brand-500 px-5 py-2.5 text-center text-sm font-semibold text-white"
            >
              {user ? 'Mon espace' : 'Connexion'}
            </Link>
          </div>
        )}

        {/* ---- Headline ---- */}
        <div className="relative z-10 px-5 pt-6 sm:px-10 sm:pt-10">
          <h1 className="font-display lowercase leading-[0.92] text-white">
            <span className="flex items-baseline gap-5">
              <span className="block text-[16vw] font-medium tracking-tight sm:text-[8rem]">
                hôtels
              </span>
              <span className="hidden max-w-[9rem] font-sans text-sm normal-case leading-snug text-white/85 sm:block">
                plateforme de réservation
              </span>
            </span>
            <span className="block text-[16vw] font-medium tracking-tight sm:text-[8rem]">
              d&apos;algérie
            </span>
          </h1>
        </div>

        {/* ---- Left paragraph ---- */}
        <div className="relative z-10 mt-8 px-5 sm:absolute sm:bottom-10 sm:left-10 sm:mt-0 sm:px-0">
          <p className="max-w-[16rem] text-sm leading-relaxed text-white/90">
            Un lieu où l&apos;architecture, la lumière et la nature créent
            l&apos;atmosphère d&apos;un séjour parfait — dans les 58 wilayas.
          </p>
        </div>

        {/* ---- Right glass stat cards ---- */}
        <div className="relative z-10 mt-6 flex gap-3 px-5 sm:absolute sm:right-8 sm:top-32 sm:mt-0 sm:flex-col sm:px-0">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex-1 rounded-2xl bg-white/20 px-5 py-4 text-white shadow-sm backdrop-blur-md sm:w-36 sm:flex-none"
            >
              <p className="font-display text-3xl font-medium">{s.value}</p>
              <p className="mt-0.5 text-xs leading-snug text-white/85">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ---- Bottom search pill ---- */}
        <div className="relative z-10 mt-8 px-5 pb-8 sm:absolute sm:inset-x-0 sm:bottom-8 sm:mt-0 sm:flex sm:justify-center sm:px-0 sm:pb-0">
          <div className="flex w-full items-center gap-2 rounded-full bg-white/95 p-2 pl-5 shadow-2xl backdrop-blur-md sm:w-[28rem]">
            <MapPin className="h-5 w-5 shrink-0 text-brand-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && goSearch()}
              placeholder="Où séjournerez-vous ? Ville ou wilaya..."
              className="w-full bg-transparent py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-500"
              aria-label="Rechercher une ville ou une wilaya"
            />
            <button
              onClick={goSearch}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#d9b98a] text-white shadow-sm transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              aria-label="Rechercher"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
