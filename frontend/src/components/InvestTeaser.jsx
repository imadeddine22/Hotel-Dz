'use client';

import { ArrowRight, FileText, ShieldCheck, MapPin, ChartNoAxesCombined } from 'lucide-react';
import Link from '@/components/LocaleLink';
import BrandLogo from '@/components/BrandLogo';
import { useT } from '@/lib/i18n/useT';

// Brand colours (same as the /investir pages)
const INK = '#152A41';
const TEAL = '#0CB2AE';

const FEATURES = [
  { icon: FileText, label: 'Des choix variés pour tous' },
  { icon: ShieldCheck, label: 'Un cadre sûr et fiable' },
  { icon: MapPin, label: 'Des emplacements stratégiques en Algérie' },
  { icon: ChartNoAxesCombined, label: 'Des opportunités prometteuses' },
];

/**
 * Home page, before the footer: invitation to the investment section (/investir).
 * Text and logo are live (translated); the picture is the designer's laptop + page mock-up,
 * cut out of its background (public/brand/invest-mockup.webp, 1123×928, transparent).
 */
export default function InvestTeaser() {
  const { t } = useT();

  return (
    <section aria-labelledby="invest-teaser-title" className="relative mt-16 overflow-hidden">
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl:gap-24 lg:py-20">
        {/* Text: second column on large screens (the picture comes first) */}
        <div className="flex flex-col lg:order-2">
          <div className="flex justify-center">
            <BrandLogo className="h-14 md:h-20" textClassName="text-5xl md:text-7xl !text-[#152A41]" alt="" />
          </div>

          <h2 id="invest-teaser-title" className="mt-6 text-center text-4xl font-black leading-[1.15] lg:text-start lg:text-5xl xl:text-[3.5rem]" style={{ color: INK }}>
            <span className="block">{t('Découvrez votre opportunité')}</span>
            <span className="block">
              <span style={{ color: TEAL }}>{t('d’investissement')}</span> {t('en Algérie')}
            </span>
          </h2>

          <p className="mt-4 text-center text-base text-slate-600 md:text-lg lg:text-start">
            {t('Terrains, locaux commerciaux et projets d’investissement prometteurs vous attendent.')}
          </p>

          <span aria-hidden="true" className="mt-7 hidden h-1 w-20 self-start rounded-full lg:block" style={{ background: TEAL }} />

          {/* 4 points, separated by thin teal lines */}
          <ul className="mt-8 grid grid-cols-2 gap-y-6 sm:grid-cols-4 lg:mt-6">
            {FEATURES.map(({ icon: Icon, label }, i) => (
              <li
                key={label}
                className={`flex flex-col items-center gap-2 px-2 text-center ${i % 2 ? 'border-s-2' : ''} ${i === 2 ? 'sm:border-s-2' : ''}`}
                style={{ borderColor: `${TEAL}55` }}
              >
                <Icon className="h-10 w-10" style={{ color: INK }} strokeWidth={1.6} aria-hidden="true" />
                <span className="text-sm font-semibold leading-snug md:text-base" style={{ color: INK }}>{t(label)}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/investir"
            className="mt-10 inline-flex items-center justify-center gap-3 self-center rounded-full px-8 py-4 text-base font-bold text-white shadow-lg transition hover:scale-[1.03] hover:shadow-xl md:text-lg lg:self-start"
            style={{ background: INK }}
          >
            {t('Découvrez les opportunités d’investissement')}
            <ArrowRight className="h-6 w-6 rtl:rotate-180" style={{ color: TEAL }} aria-hidden="true" />
          </Link>
        </div>

        {/* Laptop + scrolling page mock-up (transparent background) */}
        <div className="flex justify-center lg:order-1">
          <img
            src="/brand/invest-mockup.webp"
            alt={t('Meskan sur ordinateur : la page Investir et les projets')}
            width={1123}
            height={928}
            loading="lazy"
            draggable={false}
            className="h-auto w-full max-w-[640px] select-none drop-shadow-[0_30px_40px_rgba(21,42,65,0.18)]"
          />
        </div>
      </div>
    </section>
  );
}
