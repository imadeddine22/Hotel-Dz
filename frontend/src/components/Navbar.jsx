'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, Menu, X, User, LogOut, Heart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Hôtels', href: '/hotels' },
  { label: 'Maisons', href: '/houses' },
  { label: 'Destinations', href: '/hotels' },
  { label: 'À propos', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const dashHref =
    user?.role === 'admin' ? '/admin' : user?.role === 'owner' ? '/owner/dashboard' : '/my-bookings';

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-white">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="leading-none">
            <span className="block text-xl font-extrabold tracking-tight text-ink">
              hotels<span className="text-brand-500">dz</span>
            </span>
            <span className="block text-[11px] text-gray-400">séjournez en Algérie</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/hotels" className="grid h-10 w-10 place-items-center rounded-full text-gray-500 hover:bg-gray-100">
            <Search className="h-5 w-5" />
          </Link>
          {LINKS.map((l, i) => (
            <Link
              key={l.label}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                i === 0 ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link
                href="/favorites"
                className="grid h-10 w-10 place-items-center rounded-full text-gray-500 hover:bg-gray-100"
                title="Mes favoris"
                aria-label="Mes favoris"
              >
                <Heart className="h-5 w-5" />
              </Link>
              <Link
                href={dashHref}
                className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                <User className="h-4 w-4" /> {user.fullName.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="grid h-10 w-10 place-items-center rounded-full text-gray-500 hover:bg-gray-100"
                title="Déconnexion"
                aria-label="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-ink">
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
              >
                S&apos;inscrire
              </Link>
            </>
          )}
          <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600">
            Fr <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-lg hover:bg-gray-100 lg:hidden"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 lg:hidden">
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/favorites" className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
                Mes favoris
              </Link>
              <Link href={dashHref} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
                Mon espace
              </Link>
              <button onClick={handleLogout} className="block w-full rounded-lg px-3 py-2 text-left text-red-600">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
                Connexion
              </Link>
              <Link
                href="/register"
                className="mt-2 block rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 text-center text-sm font-semibold text-white"
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
