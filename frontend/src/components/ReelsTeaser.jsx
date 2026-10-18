'use client';

import { useEffect, useState } from 'react';
import { Clapperboard, Play, ChevronRight } from 'lucide-react';
import Link from '@/components/LocaleLink';
import api, { getImageUrl } from '@/lib/api';
import { useT } from '@/lib/i18n/useT';

const TAB = { hotel: 'hotels', house: 'houses', sale: 'sales' };
const BADGE = { hotel: 'Hôtel', house: 'Location', sale: 'À vendre' };

/** Home page strip of the latest reels, with the way into the Reels page (hidden when there are none). */
export default function ReelsTeaser() {
  const { t } = useT();
  const [reels, setReels] = useState(null);

  useEffect(() => {
    api
      .get('/reels', { params: { limit: 8 } })
      .then(({ data }) => setReels(data.reels || []))
      .catch(() => setReels([]));
  }, []);

  if (!reels?.length) return null;

  return (
    <section className="bg-gradient-to-br from-gray-950 via-gray-900 to-pink-950 py-12 text-white" aria-labelledby="reels-teaser">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg">
              <Clapperboard className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 id="reels-teaser" className="text-2xl font-extrabold">{t('Reels')}</h2>
              <p className="text-sm text-white/70">{t('Visitez en vidéo avant de réserver ou d’acheter')}</p>
            </div>
          </div>
          <Link
            href="/reels"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-bold shadow-lg ring-2 ring-white/20 transition hover:scale-105"
          >
            <Play className="h-4 w-4 fill-current" aria-hidden="true" /> {t('Regarder les reels')}
          </Link>
        </div>

        <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
          {reels.map((r) => {
            const cover = getImageUrl(r.reel.poster) || getImageUrl(r.image);
            const title = r.name || r.title;
            return (
              <li key={`${r.kind}-${r._id}`} className="w-40 shrink-0 snap-start sm:w-44">
                <Link href={`/reels?type=${TAB[r.kind]}`} className="group relative block aspect-[9/16] overflow-hidden rounded-2xl bg-gray-800">
                  {cover && <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <span className="absolute start-2 top-2 rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold">{t(BADGE[r.kind])}</span>
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/25 backdrop-blur transition group-hover:scale-110 group-hover:bg-white/40">
                      <Play className="ms-0.5 h-5 w-5 fill-current" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="absolute inset-x-2 bottom-2">
                    <span className="line-clamp-2 text-xs font-bold leading-snug" dir="auto">{title}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-white/70">{t(r.city)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="w-40 shrink-0 snap-start sm:w-44">
            <Link href="/reels" className="grid aspect-[9/16] place-items-center rounded-2xl border border-dashed border-white/25 text-center text-sm font-bold text-white/80 transition hover:border-white/60 hover:text-white">
              <span>
                <ChevronRight className="mx-auto mb-1 h-6 w-6 rtl:rotate-180" aria-hidden="true" />
                {t('Tous les reels')}
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
