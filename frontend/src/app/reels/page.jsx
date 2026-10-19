'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Volume2, VolumeX, MapPin, Play, Clapperboard, ExternalLink, X, ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from '@/components/LocaleLink';
import ShareButton from '@/components/ShareButton';
import api, { getImageUrl } from '@/lib/api';
import { formatDZD } from '@/lib/data';
import { localePath } from '@/lib/i18n/locale';
import { useT } from '@/lib/i18n/useT';

const TABS = [
  { type: '', label: 'Tout' },
  { type: 'hotels', label: 'Hôtels' },
  { type: 'houses', label: 'Locations' },
  { type: 'sales', label: 'À vendre' },
];
const PATH = { hotel: '/hotels', house: '/houses', sale: '/sales' };
const BADGE = { hotel: 'Hôtel', house: 'Location', sale: 'À vendre' };
const CTA = { hotel: 'Réserver', house: 'Réserver', sale: 'Voir le bien' };

export default function ReelsPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black" />}>
      <Reels />
    </Suspense>
  );
}

function Reels() {
  const { t, lang } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const type = TABS.some((x) => x.type === params.get('type')) ? params.get('type') : '';
  const wilaya = params.get('wilaya') || '';
  const [wilayas, setWilayas] = useState([]); // [{ wilaya, count }] with published reels, for this category
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true); // browsers only autoplay muted videos
  const feed = useRef(null);

  const load = useCallback(
    async (p) => {
      setLoading(true);
      try {
        const { data } = await api.get('/reels', { params: { type: type || undefined, wilaya: wilaya || undefined, page: p, limit: 6 } });
        setItems((prev) => (p === 1 ? data.reels : [...prev, ...data.reels.filter((r) => !prev.some((x) => x._id === r._id))]));
        setHasMore(data.hasMore);
        setPage(p);
      } catch {
        if (p === 1) setItems([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [type, wilaya]
  );

  // wilayas offered in the picker: only those with reels in the chosen category
  useEffect(() => {
    api
      .get('/reels/wilayas', { params: { type: type || undefined } })
      .then(({ data }) => setWilayas(data.wilayas || []))
      .catch(() => setWilayas([]));
  }, [type]);

  // new category → back to the top
  useEffect(() => {
    feed.current?.scrollTo({ top: 0 });
    load(1);
  }, [load]);

  // ✕: back where the visitor came from on this site, else the home page
  const exit = () => {
    const fromHere = document.referrer && new URL(document.referrer).origin === window.location.origin;
    if (fromHere && window.history.length > 1) router.back();
    else router.push(localePath(lang, '/'));
  };

  // category and wilaya are both kept in the URL (shareable, back button friendly)
  const go = (next) => {
    const q = new URLSearchParams();
    if (next.type) q.set('type', next.type);
    if (next.wilaya) q.set('wilaya', next.wilaya);
    const qs = q.toString();
    router.replace(localePath(lang, qs ? `/reels?${qs}` : '/reels'), { scroll: false });
  };
  const pick = (next) => go({ type: next, wilaya });
  const pickWilaya = (next) => go({ type, wilaya: next });
  const options = wilaya && !wilayas.some((w) => w.wilaya === wilaya) ? [...wilayas, { wilaya, count: 0 }] : wilayas;
  const totalCount = wilayas.reduce((n, w) => n + w.count, 0);

  return (
    <main className="flex h-[100dvh] flex-col bg-black">
      <Navbar />
      <div className="relative min-h-0 flex-1">
        {/* Categories */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent px-3 pb-6 pt-3">
          <button
            type="button"
            onClick={exit}
            aria-label={t('Quitter les reels')}
            title={t('Quitter les reels')}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        <nav className="flex min-w-0 flex-1 justify-start gap-1.5 overflow-x-auto [scrollbar-width:none] sm:justify-center" aria-label={t('Catégories de reels')}>
          {TABS.map((tab) => (
            <button
              key={tab.type || 'all'}
              type="button"
              aria-pressed={type === tab.type}
              onClick={() => pick(tab.type)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition ${type === tab.type ? 'bg-white text-ink' : 'bg-white/15 text-white backdrop-blur hover:bg-white/25'}`}
            >
              {t(tab.label)}
            </button>
          ))}
        </nav>
          {/* keeps the tabs centred against the ✕ on wide screens */}
          <span className="hidden h-9 w-9 shrink-0 sm:block" aria-hidden="true" />
        </div>

        {/* Wilaya: all of them, or only one (whatever the category) */}
        <div className="absolute inset-x-0 top-14 z-20 flex justify-center px-3">
          <label className={`relative inline-flex max-w-full items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold backdrop-blur transition ${wilaya ? 'bg-pink-500 text-white' : 'bg-white/15 text-white hover:bg-white/25'}`}>
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{wilaya ? t(wilaya) : t('Toutes les wilayas')}</span>
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
            <select
              value={wilaya}
              onChange={(e) => pickWilaya(e.target.value)}
              aria-label={t('Wilaya')}
              // the pill is white text: give the dropdown list its own dark-on-white colours (Chrome on Windows inherits them)
              className="absolute inset-0 cursor-pointer bg-white text-gray-900 opacity-0"
            >
              <option value="" className="bg-white text-gray-900">{t('Toutes les wilayas')} ({totalCount})</option>
              {options.map((w) => (
                <option key={w.wilaya} value={w.wilaya} className="bg-white text-gray-900">
                  {t(w.wilaya)} ({w.count})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div ref={feed} className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none]">
          {items.map((r, i) => (
            <ReelItem
              key={`${r.kind}-${r._id}`}
              reel={r}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
              onVisible={() => hasMore && !loading && i >= items.length - 2 && load(page + 1)}
            />
          ))}

          {!loading && items.length === 0 && (
            <div className="grid h-full place-items-center px-6 text-center text-white">
              <div>
                <Clapperboard className="mx-auto mb-3 h-12 w-12 text-pink-400" aria-hidden="true" />
                <p className="text-lg font-bold">{wilaya ? t('Aucun reel à {place} pour le moment', { place: t(wilaya) }) : t('Aucun reel pour le moment')}</p>
                <p className="mt-1 text-sm text-white/60">{t('Les propriétaires publient bientôt des vidéos de leurs annonces.')}</p>
                {wilaya ? (
                  <button type="button" onClick={() => pickWilaya('')} className="mt-5 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink">
                    {t('Voir toutes les wilayas')}
                  </button>
                ) : (
                  <Link href="/hotels" className="mt-5 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink">
                    {t('Voir les annonces')}
                  </Link>
                )}
              </div>
            </div>
          )}
          {loading && items.length === 0 && <div className="grid h-full place-items-center text-sm text-white/60">{t('Chargement...')}</div>}
        </div>
      </div>
    </main>
  );
}

/** One full-height reel: plays while on screen, pauses otherwise. */
function ReelItem({ reel, muted, onToggleMute, onVisible }) {
  const { t, lang } = useT();
  const visibleCb = useRef(onVisible);
  visibleCb.current = onVisible; // latest callback, without re-creating the observer
  const box = useRef(null);
  const video = useRef(null);
  const [paused, setPaused] = useState(true);
  const title = reel.name || reel.title;
  const href = `${PATH[reel.kind]}/${reel._id}`;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const v = video.current;
        if (!v) return;
        if (entry.isIntersecting) {
          visibleCb.current?.();
          v.play().catch(() => setPaused(true));
        } else {
          v.pause();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <section ref={box} className="relative flex h-full snap-start snap-always items-center justify-center" aria-label={title}>
      <div className="relative h-full w-full max-w-[460px] overflow-hidden bg-neutral-900 sm:my-3 sm:h-[calc(100%-1.5rem)] sm:rounded-3xl">
        <video
          ref={video}
          src={getImageUrl(reel.reel.url)}
          poster={getImageUrl(reel.reel.poster) || getImageUrl(reel.image) || undefined}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onClick={toggle}
          className="h-full w-full cursor-pointer object-cover"
        />
        {paused && (
          <button type="button" onClick={toggle} aria-label={t('Lire la vidéo')} className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-black/40 text-white backdrop-blur">
              <Play className="ms-1 h-8 w-8 fill-current" aria-hidden="true" />
            </span>
          </button>
        )}

        {/* Actions */}
        <div className="absolute bottom-36 end-3 z-10 flex flex-col items-center gap-4">
          <ShareButton compact url={localePath(lang, href)} title={`${title} — ${t(reel.city)}`} text={t('Regarde ce reel sur Meskan : {title}', { title })} />
          <button type="button" onClick={onToggleMute} aria-label={muted ? t('Activer le son') : t('Couper le son')} className="grid h-12 w-12 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60">
            {muted ? <VolumeX className="h-5 w-5" aria-hidden="true" /> : <Volume2 className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        {/* Listing */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-4 pb-5 pt-16 text-white">
          <span className="mb-2 inline-block rounded-full bg-pink-500 px-2.5 py-0.5 text-xs font-bold">{t(BADGE[reel.kind])}</span>
          <h2 className="text-lg font-extrabold leading-tight" dir="auto">
            {title}
            {reel.starRating ? <span className="ms-1 text-amber-300">{'★'.repeat(reel.starRating)}</span> : null}
          </h2>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-white/80">
            <MapPin className="h-4 w-4" aria-hidden="true" /> {t(reel.city)}, {t(reel.wilaya)}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            {reel.price ? (
              <p className="text-base font-extrabold">
                {reel.kind === 'hotel' && <span className="text-xs font-medium text-white/70">{t('dès')} </span>}
                {formatDZD(reel.price, reel.currency)}
                {reel.perNight && <span className="text-xs font-medium text-white/70"> {t('/nuit')}</span>}
              </p>
            ) : (
              <span />
            )}
            <Link href={href} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-pink-50">
              {t(CTA[reel.kind])} <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
