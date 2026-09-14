'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { TRANSLATIONS } from '@/lib/data';
import { useLangStore } from '@/store/authStore';

export default function Footer() {
  const { lang } = useLangStore();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;

  return (
    <footer className="relative bg-slate-950 text-slate-400 overflow-hidden pt-24 md:pt-36 rounded-t-[50%_40px] md:rounded-t-[50%_100px] border-t border-slate-900">
      
      {/* ─── Soft Radial Glow inside the Dome ─── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] md:w-[60%] aspect-square bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.1),transparent_50%)] pointer-events-none rounded-full"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center pb-16">
        <h3 className="text-3xl md:text-5xl font-black font-serif text-white tracking-tight leading-tight">
          {lang === 'ar' ? 'دع HotelsDZ يدير إقامتك' : 'Laissez HotelsDZ gérer vos séjours.'} <br />
          {lang === 'ar' ? 'ابدأ اليوم مجاناً وسهّل عملياتك' : 'Simplifiez vos réservations dès aujourd\'hui.'}
        </h3>
        <p className="text-slate-400 text-xs md:text-sm font-medium mt-4 max-w-md mx-auto leading-relaxed">
          {lang === 'ar' 
            ? 'سجّل فندقك أو منزلك في دقائق معدودة. بدون عمولات، وبأمان تام.' 
            : 'Inscrivez votre établissement en quelques minutes. Sans frais de service, sans commission, et touchez des milliers de clients.'}
        </p>
        <div className="mt-8">
          <Link
            href="/register"
            className="inline-block bg-white hover:bg-slate-50 text-slate-900 font-bold px-8 py-3.5 rounded-full text-xs transition shadow-md hover:scale-102"
          >
            {lang === 'ar' ? 'ابدأ مجاناً' : 'Start for free'}
          </Link>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 border-t border-slate-900">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 items-start">
          
          {/* Column 1: Navigation */}
          <div>
            <h4 className="text-[10px] font-black tracking-widest text-white uppercase mb-4">
              {lang === 'ar' ? 'التصفح' : 'Navigation'}
            </h4>
            <ul className="space-y-3 text-xs font-semibold">
              <li><Link href="/" className="hover:text-white transition">{t.navHome}</Link></li>
              <li><Link href="/hotels" className="hover:text-white transition">{t.navHotels}</Link></li>
              <li><Link href="/houses" className="hover:text-white transition">{t.navHouses}</Link></li>
              <li><Link href="/sales" className="hover:text-white transition">{t.navSales}</Link></li>
              <li><Link href="/destinations" className="hover:text-white transition">{t.navDestinations}</Link></li>
            </ul>
          </div>

          {/* Column 2: Espace Client */}
          <div>
            <h4 className="text-[10px] font-black tracking-widest text-white uppercase mb-4">
              {lang === 'ar' ? 'حساب الزبون' : 'Espace Client'}
            </h4>
            <ul className="space-y-3 text-xs font-semibold">
              <li><Link href="/my-bookings" className="hover:text-white transition">{t.myBookings}</Link></li>
              <li><Link href="/favorites" className="hover:text-white transition">{t.favorites}</Link></li>
              <li><Link href="/profile" className="hover:text-white transition">{t.mySpace}</Link></li>
            </ul>
          </div>

          {/* Column 3: Espace Propriétaire */}
          <div>
            <h4 className="text-[10px] font-black tracking-widest text-white uppercase mb-4">
              {lang === 'ar' ? 'الملاك' : 'Propriétaires'}
            </h4>
            <ul className="space-y-3 text-xs font-semibold">
              <li><Link href="/pricing" className="hover:text-white transition">{t.navPricing}</Link></li>
              <li><Link href="/register" className="hover:text-white transition">{t.becomeOwner}</Link></li>
              <li><Link href="/login" className="hover:text-white transition">{t.login}</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Info */}
          <div>
            <h4 className="text-[10px] font-black tracking-widest text-white uppercase mb-4 font-sans">
              {lang === 'ar' ? 'معلومات الاتصال' : 'Contact & Info'}
            </h4>
            <ul className="space-y-3 text-xs font-semibold mb-4">
              <li><Link href="/about" className="hover:text-white transition">{lang === 'ar' ? 'عن الموقع' : 'À propos'}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">{t.helpCenter}</Link></li>
            </ul>
            
            {/* Real Website Information */}
            <div className="pt-4 border-t border-slate-900/60 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                <span className="truncate">support@hotelsdz.dz</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                <span>+213 (0) 21 00 00 00</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                <span>Alger Centre, Alger</span>
              </div>
            </div>
          </div>

        </div>

        {/* ─── Massive Branding Watermark Logo at the Bottom ─── */}
        <div className="mt-16 text-center select-none opacity-[0.04] hover:opacity-[0.08] transition duration-700">
          <h2 className="text-[5rem] md:text-[11rem] font-black font-serif tracking-tighter text-white flex items-center justify-center leading-none">
            Hotels
            <span className="inline-block mx-4 transform scale-75 md:scale-100">
              <svg className="h-16 md:h-32 w-24 md:w-48 text-teal-400" viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                <path d="M16 8 C6 8, 6 24, 16 24 C22 24, 26 8, 32 8 C42 8, 42 24, 32 24 C26 24, 22 8, 16 8 Z" />
              </svg>
            </span>
            DZ
          </h2>
        </div>

        {/* Mini Bottom Bar */}
        <div className="border-t border-slate-900/60 py-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()} HotelsDZ. {t.copyright}
        </div>

      </div>
    </footer>
  );
}
