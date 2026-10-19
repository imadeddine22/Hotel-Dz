'use client';

import { useRef, useState } from 'react';
import { Play, Clapperboard, ChevronRight } from 'lucide-react';
import Link from '@/components/LocaleLink';
import { getImageUrl } from '@/lib/api';
import { useT } from '@/lib/i18n/useT';

const REELS_TAB = { hotel: 'hotels', house: 'houses', sale: 'sales' };

/** The listing's published reel on its page (nothing when there is none). */
export default function ListingReel({ kind, listing }) {
  const { t } = useT();
  const video = useRef(null);
  const [playing, setPlaying] = useState(false);
  const reel = listing?.reel;
  if (!reel?.url || reel.status !== 'approved') return null;
  const poster = getImageUrl(reel.poster) || getImageUrl(listing.images?.[0]?.url || listing.images?.[0]) || undefined;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm" aria-labelledby="listing-reel">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="listing-reel" className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Clapperboard className="h-5 w-5 text-pink-600" aria-hidden="true" /> {t('Vidéo')}
        </h2>
        <Link href={`/reels?type=${REELS_TAB[kind]}`} className="inline-flex items-center gap-1 text-sm font-semibold text-pink-600 hover:underline">
          {t('Tous les reels')} <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
      <div className="relative mx-auto aspect-[9/16] max-h-[70vh] w-full max-w-[360px] overflow-hidden rounded-2xl bg-black">
        <video
          ref={video}
          src={getImageUrl(reel.url)}
          poster={poster}
          controls={playing}
          playsInline
          preload="none"
          onPlay={() => setPlaying(true)}
          className="h-full w-full object-cover"
        />
        {!playing && (
          <button
            type="button"
            onClick={() => video.current?.play()}
            aria-label={t('Lire la vidéo')}
            className="absolute inset-0 grid place-items-center bg-black/20 transition hover:bg-black/30"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-pink-600 shadow-xl">
              <Play className="ms-1 h-7 w-7 fill-current" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
