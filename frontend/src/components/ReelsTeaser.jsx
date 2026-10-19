'use client';

import { useEffect, useState } from 'react';
import { Clapperboard, Play, ChevronRight, MapPin, Upload } from 'lucide-react';
import Link from '@/components/LocaleLink';
import api, { getImageUrl } from '@/lib/api';
import { useT } from '@/lib/i18n/useT';
import { useAuthStore } from '@/store/authStore';

const TAB = { hotel: 'hotels', house: 'houses', sale: 'sales' };
// where an owner adds the video of a listing (the "Reel" button on each listing)
const OWNER_LISTINGS = { owner: '/owner/my-hotels', seller: '/seller/my-listings', admin: '/admin/reels' };
const BADGE = { hotel: 'Hôtel', house: 'Location', sale: 'À vendre' };

// Decorations cut out of the designer's mock-up (public/brand/reels-bg.webp, 1983×793):
// the palm-leaf shadow on the left and the Algiers skyline (Maqam Echahid) line art on the right.
// Everything else (titles, cards, buttons) is live, translated content.
const ART = { src: '/brand/reels-bg.webp', w: 1983, h: 793 };
const COLORS = { bg: '#F5FBFC', ink: '#152A41', sub: '#475569', from: '#0DD5C4', to: '#00B3D2', swash: '#20B7BD' };
const gradient = `linear-gradient(135deg, ${COLORS.from}, ${COLORS.to})`;

/** A rectangle (x, y, w, h in artwork pixels) of the mock-up, scaled to `height` (CSS) and placed by `style`. */
function ArtPiece({ x, y, w, h, height, style, className = '' }) {
  return (
    <div className={`pointer-events-none absolute overflow-hidden ${className}`} style={{ height, aspectRatio: `${w} / ${h}`, ...style }} aria-hidden="true">
      <img
        src={ART.src}
        alt=""
        loading="lazy"
        draggable={false}
        className="absolute max-w-none select-none"
        style={{ width: `${(ART.w / w) * 100}%`, height: `${(ART.h / h) * 100}%`, left: `${(-x / w) * 100}%`, top: `${(-y / h) * 100}%` }}
      />
    </div>
  );
}

/**
 * Home page strip of the latest reels, with the way into the Reels page.
 * Before the first video is published it stays visible and invites owners to add theirs.
 */
export default function ReelsTeaser() {
  const { t } = useT();
  const user = useAuthStore((st) => st.user);
  const [reels, setReels] = useState(null);

  useEffect(() => {
    api
      .get('/reels', { params: { limit: 8 } })
      .then(({ data }) => setReels(data.reels || []))
      .catch(() => setReels([]));
  }, []);

  if (reels === null) return null; // loading
  const empty = reels.length === 0;
  const publishHref = OWNER_LISTINGS[user?.role] || (user ? '/owner/my-hotels' : '/register?role=owner');

  return (
    <section className="relative overflow-hidden py-12 lg:py-20" style={{ background: COLORS.bg }} aria-labelledby="reels-teaser">
      {/* palm shadow (left edge) and Algiers skyline (bottom right), behind the content */}
      <ArtPiece x={0} y={0} w={185} h={793} height="100%" style={{ left: 0, top: 0 }} className="opacity-80" />
      <ArtPiece x={1550} y={395} w={433} h={245} height="44%" style={{ right: 0, bottom: 0 }} className="opacity-70 max-lg:opacity-30" />
      <ArtPiece x={1900} y={60} w={83} h={335} height="62%" style={{ right: 0, top: 0 }} className="opacity-70 max-lg:hidden" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-6">
        {/* Title */}
        <div className="flex shrink-0 flex-col items-center text-center lg:w-60 lg:items-start lg:text-start">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full text-white shadow-lg" style={{ background: gradient }}>
              <Clapperboard className="h-8 w-8" aria-hidden="true" />
            </span>
            <h2 id="reels-teaser" className="text-5xl font-black tracking-tight" style={{ color: COLORS.ink }}>
              {t('Reels')}
            </h2>
          </div>
          <p className="mt-3 text-base font-medium" style={{ color: COLORS.sub }}>
            {t('Visitez en vidéo avant de réserver ou d’acheter')}
          </p>
        </div>

        {/* Cards — or, before the first published video, an invitation to owners */}
        {empty ? (
          <div className="w-full rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center backdrop-blur lg:min-w-0 lg:flex-1">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full text-white shadow" style={{ background: gradient }}>
              <Clapperboard className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="text-lg font-extrabold" style={{ color: COLORS.ink }}>{t('Les premières vidéos arrivent bientôt')}</p>
            <p className="mx-auto mt-1 max-w-md text-sm" style={{ color: COLORS.sub }}>
              {t('Propriétaires d’hôtels, de maisons ou de biens à vendre : ajoutez une courte vidéo verticale à votre annonce, elle apparaîtra ici après validation.')}
            </p>
          </div>
        ) : (
        <ul className="-mx-4 flex w-[calc(100%+2rem)] snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:w-auto lg:min-w-0 lg:flex-1 lg:px-1">
          {reels.map((r) => {
            const cover = getImageUrl(r.reel.poster) || getImageUrl(r.image);
            const title = r.name || r.title;
            return (
              <li key={`${r.kind}-${r._id}`} className="w-40 shrink-0 snap-start xl:w-44">
                <Link href={`/reels?type=${TAB[r.kind]}`} className="group relative block aspect-[3/5] overflow-hidden rounded-2xl bg-slate-200 shadow-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
                  {cover && <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  <span className="absolute inset-0 bg-gradient-to-t from-[#0b2236]/90 via-transparent to-transparent" />
                  <span className="absolute end-2 top-2 rounded-full bg-pink-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow">{t(BADGE[r.kind])}</span>
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/35 text-white backdrop-blur transition group-hover:scale-110 group-hover:bg-white/50">
                      <Play className="ms-0.5 h-5 w-5 fill-current" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="absolute inset-x-2.5 bottom-2.5 text-white">
                    <span className="line-clamp-2 text-xs font-bold leading-snug" dir="auto">{title}</span>
                    <span className="mt-1 flex items-center gap-1 truncate text-[11px] text-white/80">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" /> {t(r.city)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="w-40 shrink-0 snap-start xl:w-44">
            <Link href="/reels" className="grid aspect-[3/5] place-items-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/40 text-center text-sm font-bold transition hover:border-[#00B3D2] hover:bg-white" style={{ color: COLORS.ink }}>
              <span>
                <ChevronRight className="mx-auto mb-1 h-6 w-6 rtl:rotate-180" aria-hidden="true" />
                {t('Tous les reels')}
              </span>
            </Link>
          </li>
        </ul>
        )}

        {/* Call to action */}
        <div className="flex shrink-0 flex-col items-center gap-6 lg:w-52">
          <Link
            href={empty ? publishHref : '/reels'}
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
            style={{ background: gradient }}
          >
            {empty ? <Upload className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4 fill-current" aria-hidden="true" />}
            {empty ? t('Publier une vidéo') : t('Regarder les reels')}
          </Link>
          <p className="relative -rotate-2 text-center text-2xl font-extrabold leading-snug" style={{ color: COLORS.ink }}>
            {t('Découvrez')}
            <br />
            {t('les plus beaux endroits')}
            <svg viewBox="0 0 120 12" className="mx-auto mt-1 h-3 w-24" aria-hidden="true">
              <path d="M2 9 C 35 2, 80 2, 118 6" fill="none" stroke={COLORS.swash} strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </p>
        </div>
      </div>
    </section>
  );
}
