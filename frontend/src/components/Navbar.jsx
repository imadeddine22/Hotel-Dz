'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, Heart, User, Globe } from 'lucide-react';
import { useAuthStore, useLangStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import BrandLogo, { brandName } from '@/components/BrandLogo';
import { useT } from '@/lib/i18n/useT';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { setLang } = useLangStore();
  const { t, lang } = useT();

  const { hotelIds, houseIds, load } = useFavoritesStore();
  const [anonCount, setAnonCount] = useState(0);

  const updateAnonCount = () => {
    if (typeof window !== 'undefined') {
      try {
        const favs = JSON.parse(localStorage.getItem('anon_favorites')) || { hotels: [], houses: [] };
        const count = (favs.hotels?.length || 0) + (favs.houses?.length || 0);
        setAnonCount(count);
      } catch {
        setAnonCount(0);
      }
    }
  };

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user, load]);

  useEffect(() => {
    updateAnonCount();
    window.addEventListener('favorites-updated', updateAnonCount);
    window.addEventListener('storage', updateAnonCount);
    return () => {
      window.removeEventListener('favorites-updated', updateAnonCount);
      window.removeEventListener('storage', updateAnonCount);
    };
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    if (!langOpen) return;
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [langOpen]);

  const totalFavorites = user ? (hotelIds.length + houseIds.length) : anonCount;

  // Reload after switching so listings already loaded are fetched again in the new language
  // (they are localized when received). <html dir/lang> is handled by AuthInit on every page.
  const changeLang = (code) => {
    if (code === lang) return;
    setLang(code);
    window.location.reload();
  };

  const dashHref =
    user?.role === 'admin' ? '/admin' : user?.role === 'owner' ? '/owner/dashboard' : user?.role === 'seller' ? '/seller/dashboard' : '/my-bookings';

  const navLinks = [
    { label: t.navHome, href: '/' },
    { label: t.navHotels, href: '/hotels' },
    { label: t.navHouses, href: '/houses' },
    { label: t.navSales || 'Ventes', href: '/sales' },
    { label: t.navDestinations, href: '/destinations' },
    { label: t.navPricing, href: '/pricing' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center shrink-0 group" aria-label={`${brandName(lang)} — ${t.tagline}`}>
          <span className="inline-block transition-transform duration-300 group-hover:scale-[1.03]"><BrandLogo className="h-10 sm:h-11" textClassName="text-2xl sm:text-[1.7rem]" alt="" priority /></span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-gray-50/80 p-1.5 rounded-full border border-gray-200/60">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-brand-600 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {t(link.label)}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Favorites */}
          <Link
            href="/favorites"
            aria-label={t.favorites}
            className={`relative grid h-10 w-10 place-items-center rounded-full transition ${
              pathname.startsWith('/favorites')
                ? 'bg-rose-50 text-rose-500'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="h-5 w-5" />
            {totalFavorites > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white ring-2 ring-white select-none leading-none">
                {totalFavorites}
              </span>
            )}
          </Link>

          {/* Add Hotel Button */}
          <Link
            href="/register?role=owner"
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600 hover:shadow-md"
          >
            {t.suggestHotel}
          </Link>

          {/* User Account / Espace */}
          <Link
            href={user ? dashHref : '/login'}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            <User className="h-4 w-4 text-brand-500" />
            {user ? t.mySpace : t.login}
          </Link>

          {/* Language Switcher Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              <Globe className="h-3.5 w-3.5 text-brand-500" />
              {lang.toUpperCase()}
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-2xl bg-white p-1.5 shadow-xl border border-gray-100 z-50">
                {[
                  { code: 'fr', label: 'Français' },
                  { code: 'ar', label: 'العربية' },
                  { code: 'en', label: 'English' },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      changeLang(l.code);
                      setLangOpen(false);
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold text-left transition ${
                      lang === l.code
                        ? 'bg-brand-50 text-brand-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t(l.label)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="grid h-11 w-11 place-items-center rounded-xl text-gray-700 hover:bg-gray-100 lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-6 lg:hidden space-y-3">
          {/* Mobile Language Switcher */}
          <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-xl justify-center">
            <Globe className="h-4 w-4 text-brand-500" />
            {['fr', 'ar', 'en'].map((code) => (
              <button
                key={code}
                onClick={() => changeLang(code)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  lang === code ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-4 py-3 font-bold text-base transition ${
                  isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t(link.label)}
              </Link>
            );
          })}

          {/* Mobile Favorites Link */}
          <Link
            href="/favorites"
            onClick={() => setOpen(false)}
            className={`flex items-center justify-between rounded-xl px-4 py-3 font-bold text-base transition ${
              pathname.startsWith('/favorites') ? 'bg-rose-50 text-rose-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              {t.favorites}
            </span>
            {totalFavorites > 0 && (
              <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-bold text-white">
                {totalFavorites}
              </span>
            )}
          </Link>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <Link
              href="/register?role=owner"
              onClick={() => setOpen(false)}
              className="w-full rounded-xl bg-brand-500 py-3 text-center text-sm font-bold text-white shadow-sm"
            >
              {t.suggestHotel}
            </Link>
            <Link
              href={user ? dashHref : '/login'}
              onClick={() => setOpen(false)}
              className="w-full rounded-xl border border-gray-200 py-3 text-center text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              {user ? t.mySpace : t.login}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
