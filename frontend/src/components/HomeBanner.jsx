'use client';

import { ArrowRight, BedDouble, MapPinned, Building2, House } from 'lucide-react';
import Link from '@/components/LocaleLink';
import BrandLogo from '@/components/BrandLogo';
import { useT } from '@/lib/i18n/useT';

// Colours sampled from the designer's banner artwork (the photos were removed at the owner's request).
const COLORS = { panel: '#F6FAFD', ink: '#152A41', teal: '#0CB2AE', button: '#01C2C2', icon: '#0A8F96', label: '#396465' };

const CATEGORIES = [
  { href: '/hotels', label: 'Hôtels et complexes', icon: BedDouble },
  { href: '/sales?type=Terrain', label: 'Terrains et projets', icon: MapPinned },
  { href: '/sales?type=Appartement', label: 'Appartements de toutes catégories', icon: Building2 },
  { href: '/houses', label: 'Maisons à vendre et à louer', icon: House },
];

/** Home page banner: brand, headline, categories and "start now" (→ properties for sale). */
export default function HomeBanner() {
  const { t } = useT();

  return (
    <section
      aria-label={t('Meskan : immobilier, séjours et opportunités en Algérie')}
      className="mt-12 overflow-hidden rounded-3xl shadow-lg ring-1 ring-black/5"
      style={{ background: COLORS.panel }}
    >
      {/* Live text panel (translated) */}
      <div className="relative flex flex-col items-center gap-4 px-5 py-10 text-center lg:gap-5 lg:py-12">
        <BrandLogo className="h-12 xl:h-16" textClassName="text-4xl xl:text-5xl !text-[#152A41]" alt="" />

        <h2 className="font-extrabold leading-tight">
          <span className="block text-2xl xl:text-[2.1rem]" style={{ color: COLORS.ink }}>
            {t('Immobilier, séjours et opportunités…')}
          </span>
          <span className="mt-1 block text-2xl xl:text-[2.1rem]" style={{ color: COLORS.teal }}>
            {t('Tout commence ici.')}
          </span>
        </h2>

        <ul className="grid w-full max-w-md grid-cols-4 divide-x divide-gray-200 rtl:divide-x-reverse">
          {CATEGORIES.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="group flex flex-col items-center gap-1.5 px-1 py-1 transition hover:-translate-y-0.5">
                <Icon className="h-7 w-7 xl:h-8 xl:w-8" style={{ color: COLORS.icon }} strokeWidth={1.6} aria-hidden="true" />
                <span className="text-[11px] font-semibold leading-tight xl:text-xs" style={{ color: COLORS.label }}>
                  {t(label)}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/sales"
          className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-95 hover:shadow-xl"
          style={{ background: COLORS.button }}
        >
          <span>{t('Commencez votre recherche')}</span>
          <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
