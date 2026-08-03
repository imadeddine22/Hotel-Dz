'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Send, MapPin, Mail, Phone, ArrowUp, Instagram, Facebook, Twitter } from 'lucide-react';
import { TRANSLATIONS } from '@/lib/data';
import { useLangStore } from '@/store/authStore';

const QUICK_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Nos hôtels', href: '/hotels' },
  { label: 'Nos maisons', href: '/houses' },
  { label: 'Destinations', href: '/hotels' },
  { label: 'À propos', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const EXPLORE = [
  { label: 'Devenir hôtelier', href: '/register?role=owner' },
  { label: 'Mes réservations', href: '/my-bookings' },
  { label: "Centre d'aide", href: '/contact' },
];

const GALLERY = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=240&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=240&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=240&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=240&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=240&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=240&q=80',
];

/* ── Brand colors for inline styles ── */
const CYAN   = '#00bcd4';
const CYAN_D = '#00acc1';
const GOLD   = '#ffc107';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const { lang } = useLangStore();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;

  const QUICK_LINKS = [
    { label: t.navHome, href: '/' },
    { label: t.navHotels, href: '/hotels' },
    { label: t.navHouses, href: '/houses' },
    { label: t.navDestinations, href: '/destinations' },
    { label: t.navPricing, href: '/pricing' },
  ];

  const EXPLORE = [
    { label: t.becomeOwner, href: '/register?role=owner' },
    { label: t.myBookings, href: '/my-bookings' },
    { label: t.helpCenter, href: '/contact' },
  ];

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail('');
    setTimeout(() => setDone(false), 3500);
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative mt-16 overflow-hidden" style={{ background: '#1a2332' }}>

      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top wave separator */}
      <div className="relative" style={{ height: 60, overflow: 'hidden', marginTop: -1 }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <path
            d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,0 L0,0 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-0 pt-10 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12">

          {/* ─── Brand + Subscribe ─── */}
          <div className="lg:col-span-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span
                className="grid h-11 w-11 place-items-center rounded-xl text-white"
                style={{ background: `linear-gradient(135deg, ${CYAN}, ${CYAN_D})` }}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                hotels<span style={{ color: CYAN }}>dz</span>
              </span>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
              {t.footerDesc}
            </p>

            {/* Social */}
            <div className="mt-6 flex items-center gap-3">
              {[
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Twitter, href: '#', label: 'Twitter' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg transition"
                  style={{ background: 'rgba(255,255,255,0.07)', color: '#94a3b8' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `rgba(0,188,212,0.2)`; e.currentTarget.style.color = CYAN; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Subscribe */}
            <form onSubmit={subscribe} className="mt-7 flex overflow-hidden rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-slate-500"
                style={{ color: '#e2e8f0' }}
              />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition"
                style={{ background: GOLD, color: '#1a2332' }}
                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
              >
                <Send className="h-4 w-4" />
                {done ? t.subscribed : t.subscribe}
              </button>
            </form>
          </div>

          {/* ─── Quick Links ─── */}
          <div className="lg:col-span-2">
            <FooterHeading accent={CYAN}>{t.quickLinks}</FooterHeading>
            <ul className="mt-6 space-y-3">
              {QUICK_LINKS.map((l) => (
                <FooterLink key={l.label} {...l} accent={CYAN} />
              ))}
            </ul>
          </div>

          {/* ─── Explore ─── */}
          <div className="lg:col-span-2">
            <FooterHeading accent={CYAN}>{t.explore}</FooterHeading>
            <ul className="mt-6 space-y-3">
              {EXPLORE.map((l) => (
                <FooterLink key={l.label} {...l} accent={CYAN} />
              ))}
            </ul>
          </div>

          {/* ─── Gallery ─── */}
          <div className="lg:col-span-4">
            <FooterHeading accent={CYAN}>{t.gallery}</FooterHeading>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {GALLERY.map((src, i) => (
                <Link
                  key={i}
                  href="/hotels"
                  className="group relative aspect-square overflow-hidden rounded-xl"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <img
                    src={src}
                    alt="HotelsDZ"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <span
                    className="absolute inset-0 opacity-0 transition group-hover:opacity-100"
                    style={{ background: 'rgba(0,188,212,0.25)' }}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Contact Cards ─── */}
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            { icon: MapPin,  label: 'Adresse',    value: 'Alger Centre, Alger, Algérie', href: null },
            { icon: Mail,    label: 'Email',       value: 'info@hotelsdz.dz',            href: 'mailto:info@hotelsdz.dz' },
            { icon: Phone,   label: 'Téléphone',   value: '+213 (0) 21 00 00 00',        href: 'tel:+21321000000' },
          ].map(({ icon: Icon, label, value, href }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl px-5 py-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                style={{ background: 'rgba(0,188,212,0.15)', color: CYAN }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>{label}</p>
                {href ? (
                  <a href={href} className="text-sm font-semibold transition hover:underline" style={{ color: '#e2e8f0' }}>
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Divider ─── */}
        <div className="mt-12" style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />

        {/* ─── Copyright ─── */}
        <div className="flex items-center justify-between py-6">
          <p className="text-sm" style={{ color: '#475569' }}>
            © {new Date().getFullYear()} <span style={{ color: CYAN }}>HotelsDZ</span> — Tous droits réservés.
          </p>
          <button
            onClick={scrollTop}
            aria-label="Haut de page"
            className="grid h-10 w-10 place-items-center rounded-full transition"
            style={{ background: 'rgba(0,188,212,0.15)', color: CYAN, border: `1px solid rgba(0,188,212,0.3)` }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,188,212,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,188,212,0.15)'}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children, accent }) {
  return (
    <div>
      <h4 className="text-base font-bold text-white">{children}</h4>
      <span
        className="mt-2 block h-0.5 w-10 rounded-full"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
    </div>
  );
}

function FooterLink({ label, href, accent }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-2 text-sm transition"
        style={{ color: '#64748b' }}
        onMouseEnter={(e) => e.currentTarget.style.color = accent}
        onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
      >
        <ChevronRight
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
          style={{ color: accent }}
        />
        {label}
      </Link>
    </li>
  );
}
