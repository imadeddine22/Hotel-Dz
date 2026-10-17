'use client';

import Link from '@/components/LocaleLink';
import BrandLogo from '@/components/BrandLogo';
import { Mail, Phone, MapPin } from 'lucide-react';
import { WILAYA_LIST } from '@/lib/wilayas';
import { wilayaPath } from '@/lib/wilayaInfo';
import { useT } from '@/lib/i18n/useT';

const POPULAR = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Béjaïa', 'Tlemcen', 'Tipaza', 'Jijel', 'Sétif', 'Ghardaïa', 'Tamanrasset', 'Djanet'];

export default function Footer() {
  const { t, lang } = useT();

  return (
    <footer className="relative bg-slate-950 text-slate-400 overflow-hidden pt-24 md:pt-36 rounded-t-[50%_40px] md:rounded-t-[50%_100px] border-t border-slate-900">
      
      {/* ─── Soft Radial Glow inside the Dome ─── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] md:w-[60%] aspect-square bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.1),transparent_50%)] pointer-events-none rounded-full"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center pb-16">
        <h3 className="text-3xl md:text-5xl font-black font-serif text-white tracking-tight leading-tight">
          {t('Laissez Meskan dz gérer vos séjours.')} <br />
          {lang === 'ar' ? 'ابدأ اليوم مجاناً وسهّل عملياتك' : t('Simplifiez vos réservations dès aujourd\'hui.')}
        </h3>
        <p className="text-slate-400 text-xs md:text-sm font-medium mt-4 max-w-md mx-auto leading-relaxed">
          {lang === 'ar' 
            ? 'سجّل فندقك أو منزلك في دقائق معدودة. بدون عمولات، وبأمان تام.' 
            : t('Inscrivez votre établissement en quelques minutes. Sans frais de service, sans commission, et touchez des milliers de clients.')}
        </p>
        <div className="mt-8">
          <Link
            href="/register"
            className="inline-block bg-white hover:bg-slate-50 text-slate-900 font-bold px-8 py-3.5 rounded-full text-xs transition shadow-md hover:scale-102"
          >
            {lang === 'ar' ? 'ابدأ مجاناً' : t('Commencer gratuitement')}
          </Link>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 border-t border-slate-900">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 items-start">
          
          {/* Column 1: Navigation */}
          <div>
            <h4 className="text-[10px] font-black tracking-widest text-white uppercase mb-4">
              {lang === 'ar' ? 'التصفح' : t('Navigation')}
            </h4>
            <ul className="space-y-3 text-xs font-semibold">
              <li><Link href="/" className="hover:text-white transition">{t.navHome}</Link></li>
              <li><Link href="/hotels" className="hover:text-white transition">{t.navHotels}</Link></li>
              <li><Link href="/houses" className="hover:text-white transition">{t.navHouses}</Link></li>
              <li><Link href="/sales" className="hover:text-white transition">{t.navSales}</Link></li>
              <li><Link href="/destinations" className="hover:text-white transition">{t.navDestinations}</Link></li>
              <li><Link href="/outils" className="hover:text-white transition">{lang === 'ar' ? 'أدوات مجانية' : t('Outils gratuits')}</Link></li>
              <li><Link href="/comparatif" className="hover:text-white transition">{t('Meskan dz vs Booking, Airbnb, Ouedkniss')}</Link></li>
            </ul>
          </div>

          {/* Column 2: Espace Client */}
          <div>
            <h4 className="text-[10px] font-black tracking-widest text-white uppercase mb-4">
              {lang === 'ar' ? 'حساب الزبون' : t('Espace Client')}
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
              {lang === 'ar' ? 'الملاك' : t('Propriétaires')}
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
              {lang === 'ar' ? 'معلومات الاتصال' : t('Contact & Info')}
            </h4>
            <ul className="space-y-3 text-xs font-semibold mb-4">
              <li><Link href="/about" className="hover:text-white transition">{lang === 'ar' ? 'عن الموقع' : t('À propos')}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">{t.helpCenter}</Link></li>
            </ul>
            
            {/* Real Website Information */}
            <div className="pt-4 border-t border-slate-900/60 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                <span className="truncate">{t('support@hotelsdz.dz')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                <span>+213 (0) 21 00 00 00</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                <span>{t('Alger Centre, Alger')}</span>
              </div>
            </div>
          </div>

        </div>

        <nav aria-label={lang === 'ar' ? 'وجهات شائعة' : t('Destinations populaires')} className="mt-12 border-t border-slate-900/60 pt-8">
          <p className="text-[10px] font-black tracking-widest text-white uppercase mb-4">{lang === 'ar' ? 'وجهات شائعة' : t('Destinations populaires')}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold">
            {POPULAR.map((w) => (
              <li key={w}><Link href={wilayaPath(w)} className="hover:text-white transition">{lang === 'ar' ? `فنادق ${WILAYA_LIST.find((x) => x.name === w)?.arabic || w}` : t('Hôtels à {w}', { w })}</Link></li>
            ))}
          </ul>
        </nav>

        {/* ─── Massive Branding Watermark Logo at the Bottom ─── */}
        <div aria-hidden="true" className="mt-16 flex justify-center select-none opacity-[0.06] transition duration-700 hover:opacity-[0.1]">
          <BrandLogo variant="light" alt="" className="h-20 md:h-40" textClassName="text-6xl md:text-9xl" />
        </div>

        {/* Mini Bottom Bar */}
        <div className="border-t border-slate-900/60 py-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
          © {new Date().getFullYear()} {t('Meskan dz.')} {t.copyright}
        </div>

      </div>
    </footer>
  );
}
