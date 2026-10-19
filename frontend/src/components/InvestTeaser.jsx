'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Search, ShieldCheck, MapPinned, Handshake, MessagesSquare, MapPin, Maximize2, PlusCircle } from 'lucide-react';
import Link from '@/components/LocaleLink';
import BrandLogo from '@/components/BrandLogo';
import api, { getImageUrl } from '@/lib/api';
import { formatDZD } from '@/lib/data';
import { formatArea, assetLabel, PROJECT_COLORS, projectGradient } from '@/lib/projects';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/lib/i18n/useT';

const FEATURES = [
  { icon: ShieldCheck, label: 'Projets vérifiés' },
  { icon: MapPinned, label: 'Terrains et locaux' },
  { icon: Handshake, label: 'Partenariats flexibles' },
  { icon: MessagesSquare, label: 'Contact direct' },
];

// Shown in the mock-up until (or if no) real projects are published
const SAMPLE = [
  { _id: 'a', title: 'Terrain en bord de mer', assetType: 'Terrain', wilaya: 'Tipaza', area: 12000, budget: 450000000, img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=60' },
  { _id: 'b', title: 'Local pour un restaurant', assetType: 'Local commercial', wilaya: 'Alger', area: 250, budget: 25000000, img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=60' },
  { _id: 'c', title: 'Terre agricole irriguée', assetType: 'Terrain', wilaya: 'Biskra', area: 50000, budget: 60000000, img: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=400&q=60' },
];
const TYPES = [
  { label: 'Terrain', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&q=60' },
  { label: 'Local commercial', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=60' },
  { label: 'Bâtiment / immeuble', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=60' },
  { label: 'Ferme', img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=300&q=60' },
];
const MOCKUP_SRC = '/brand/invest-mockup.png';
const LIGHT = '#EEF3F6'; // picture side (matches the mock-up's white background with multiply)
const HERO_IMG = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=70';

/** Home page, before the footer: invitation to the investment section (/investir) with a Meskan mock-up. */
export default function InvestTeaser() {
  const { t, lang } = useT();
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = useState(SAMPLE);
  const [hasImage, setHasImage] = useState(true);

  // Real published projects in the mock-up when there are some
  useEffect(() => {
    api
      .get('/projects', { params: { limit: 3 } })
      .then(({ data }) => data.projects?.length >= 3 && setProjects(data.projects.slice(0, 3)))
      .catch(() => {});
  }, []);

  const proposeHref = user ? '/investor/projects?new=1' : '/login?redirect=%2Finvestor%2Fprojects%3Fnew%3D1';

  return (
    <section aria-labelledby="invest-teaser-title" className="relative mb-16 mt-16 overflow-hidden" style={{ background: LIGHT }}>
      <div className="grid lg:grid-cols-[1fr_1.05fr]">
        {/* Text side: dark brand gradient; on large screens its inner edge is cut on a slant */}
        <div
          className="relative overflow-hidden px-6 py-14 text-white sm:px-10 lg:py-20 lg:pe-20 lg:ps-[max(2.5rem,calc((100vw-80rem)/2+1.5rem))] lg:[clip-path:var(--slant)]"
          style={{
            background: `linear-gradient(135deg, ${PROJECT_COLORS.ink} 0%, #123a4e 60%, #0b5566 100%)`,
            '--slant': lang === 'ar' ? 'polygon(0 0, 100% 0, 100% 100%, 9% 100%)' : 'polygon(0 0, 100% 0, 91% 100%, 0 100%)',
          }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -start-24 h-80 w-80 rounded-full bg-[#0DD5C4]/15 blur-3xl" />
          <div className="relative">
          <BrandLogo variant="light" className="h-12 md:h-14" textClassName="text-4xl md:text-5xl" alt="" />
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.45em] text-white/70 rtl:tracking-normal">{t('Investissement')}</p>
          <span className="mt-6 block h-1 w-14 rounded-full" style={{ background: projectGradient }} aria-hidden="true" />

          <h2 id="invest-teaser-title" className="mt-6 text-3xl font-light leading-tight md:text-5xl">
            {t('Terrains, locaux, projets…')}
            <span className="mt-1 block font-extrabold" style={{ color: PROJECT_COLORS.from }}>
              {t('Investissez là où ça compte.')}
            </span>
          </h2>
          <p className="mt-4 max-w-xl text-base text-white/80 md:text-lg">
            {t('Des propriétaires cherchent un investisseur ou un associé dans les 69 wilayas. Trouvez le projet qui vous ressemble.')}
          </p>

          <ul className="mt-8 grid max-w-xl grid-cols-2 gap-5 sm:grid-cols-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col gap-2">
                <Icon className="h-7 w-7" style={{ color: PROJECT_COLORS.from }} strokeWidth={1.6} aria-hidden="true" />
                <span className="text-sm font-semibold leading-snug text-white/85">{t(label)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/investir" className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold text-[#0b2a3a] shadow-lg transition hover:scale-105" style={{ background: projectGradient }}>
              {t('Découvrir les projets')}
              <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            </Link>
            <Link href={proposeHref} className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-bold text-white transition hover:bg-white/10">
              <PlusCircle className="h-5 w-5" aria-hidden="true" /> {t('Proposer mon projet')}
            </Link>
          </div>
          </div>
        </div>

        {/* Picture side: Meskan on a laptop (public/brand/invest-mockup.png); drawn in code until the file is there */}
        <div className="flex items-center justify-center px-6 py-10 lg:px-10 lg:py-14">
          {hasImage ? (
            <img
              src={MOCKUP_SRC}
              alt={t('Meskan sur ordinateur : la page Investir et les projets')}
              loading="lazy"
              width={1680}
              height={940}
              onError={() => setHasImage(false)}
              className="h-auto w-full max-w-2xl select-none mix-blend-multiply"
              draggable={false}
            />
          ) : (
            <Mockup projects={projects} />
          )}
        </div>
      </div>
    </section>
  );
}

/** Fallback mock-up drawn in code: laptop with the "Investir" page + a sheet of projects coming out of it. */
function Mockup({ projects }) {
  const { t, lang } = useT();
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-xl select-none pb-10 sm:pb-40 lg:pb-44" dir="ltr">
      {/* Laptop */}
      <div className="relative ms-auto w-[92%] rounded-[1.4rem] bg-slate-900 p-2 shadow-2xl ring-1 ring-white/10 md:p-2.5">
        <div className="overflow-hidden rounded-xl bg-white text-slate-800">
          {/* mini navbar */}
          <div className="flex items-center justify-between px-3 py-2">
            <BrandLogo className="h-4" textClassName="text-[11px]" alt="" />
            <div className="hidden gap-2.5 text-[7px] font-semibold text-slate-500 sm:flex">
              <span>{t('Hôtels')}</span>
              <span>{t('Ventes')}</span>
              <span style={{ color: PROJECT_COLORS.to }}>{t('Investir')}</span>
              <span>{t('Reels')}</span>
            </div>
            <span className="rounded-full px-2 py-0.5 text-[7px] font-bold text-white" style={{ background: projectGradient }}>{t('Proposer mon projet')}</span>
          </div>
          {/* mini hero */}
          <div className="relative aspect-[16/7.5]">
            <img src={HERO_IMG} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${PROJECT_COLORS.ink}e6, ${PROJECT_COLORS.ink}55 60%, transparent)` }} />
            <div className="relative flex h-full flex-col justify-center gap-1.5 px-4 text-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <p className="max-w-[65%] text-[13px] font-extrabold leading-tight md:text-base">{t('Votre bien, leur investissement, un projet ensemble')}</p>
              <p className="max-w-[60%] text-[7px] text-white/80 md:text-[8px]">{t('Des propriétaires cherchent un investisseur ou un associé dans les 69 wilayas. Trouvez le projet qui vous ressemble.')}</p>
              <div className="mt-1 flex w-[62%] items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[7px] text-slate-400">
                <Search className="h-2.5 w-2.5" /> {t('Rechercher un projet, une ville, une référence')}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* laptop base */}
      <div className="ms-auto h-2.5 w-[98%] rounded-b-2xl bg-gradient-to-b from-slate-700 to-slate-900 shadow-xl" />

      {/* Sheet of projects, tilted like a page coming out of the screen */}
      <div
        className="absolute bottom-0 start-0 hidden w-[68%] rounded-2xl bg-white p-3 text-slate-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.55)] sm:block md:p-4"
        style={{ transform: 'perspective(1400px) rotateX(14deg) rotateY(-10deg) rotateZ(-5deg)', transformOrigin: 'top right' }}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] font-extrabold" style={{ color: PROJECT_COLORS.ink }}>{t('Projets à la une')}</p>
          <span className="text-[7px] font-bold" style={{ color: PROJECT_COLORS.to }}>{t('Voir tout')} →</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {projects.map((p) => {
            const cover = p.img || getImageUrl(p.images?.[0]?.url || p.images?.[0]);
            return (
              <div key={p._id} className="overflow-hidden rounded-lg ring-1 ring-slate-100">
                <div className="aspect-[4/3] bg-slate-100">{cover && <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />}</div>
                <div className="p-1.5">
                  <p className="line-clamp-1 text-[7px] font-bold" dir="auto">{p.title}</p>
                  <p className="text-[8px] font-extrabold" style={{ color: PROJECT_COLORS.ink }}>{p.budget ? formatDZD(p.budget) : t('À définir')}</p>
                  <p className="mt-0.5 flex items-center gap-0.5 text-[6px] text-slate-500">
                    <MapPin className="h-2 w-2" /> {t(p.wilaya)}
                    <Maximize2 className="ms-1 h-2 w-2" /> {formatArea(p.area, lang)}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[6px] font-semibold" style={{ color: PROJECT_COLORS.to }}>{assetLabel(p, t)}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[10px] font-extrabold" style={{ color: PROJECT_COLORS.ink }}>{t('Types de biens')}</p>
        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
          {TYPES.map(({ label, img }) => (
            <div key={label} className="relative aspect-[4/3] overflow-hidden rounded-md">
              <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1 pb-0.5 pt-2 text-[6px] font-bold text-white">{t(label)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
