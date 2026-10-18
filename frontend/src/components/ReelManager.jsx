'use client';

import { useEffect, useRef, useState } from 'react';
import { Clapperboard, X, Upload, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import api, { getImageUrl } from '@/lib/api';
import { useT } from '@/lib/i18n/useT';

const MAX_BYTES = 50 * 1024 * 1024;
const MAX_SECONDS = 90;
const MIN_SECONDS = 3;
// Reels format: vertical ~9:16 (9:19.5 phone screens up to 2:3), at least 480×854 — same rules as the API
const RATIO = { min: 0.45, max: 0.67 };
const MIN_W = 480;
const MIN_H = 854;
const TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/** Duration (s) and displayed size of a local video file, read by the browser (phone rotation included). */
const videoInfo = (file) =>
  new Promise((resolve) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(v.src);
      resolve({ duration: v.duration, width: v.videoWidth, height: v.videoHeight });
    };
    v.onerror = () => resolve({ duration: NaN, width: 0, height: 0 });
    v.src = URL.createObjectURL(file);
  });

/**
 * "Reel" of an owner's / seller's listing: upload a short vertical video (≤ 90 s, ≤ 50 MB),
 * see whether it is published or waiting for the admin, replace or delete it.
 * kind: 'hotel' | 'house' | 'sale'
 */
export default function ReelManager({ kind, listing, onChange, className = '' }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [reel, setReel] = useState(listing.reel || {});
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const input = useRef(null);

  useEffect(() => setReel(listing.reel || {}), [listing.reel]);
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === 'Escape' && progress === null && setOpen(false);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, progress]);

  const has = reel?.status && reel.status !== 'none' && reel.url;

  const upload = async (file) => {
    setError('');
    if (!file) return;
    if (!TYPES.includes(file.type)) return setError(t('Format accepté : MP4, WebM ou MOV.'));
    if (file.size > MAX_BYTES) return setError(t('Vidéo trop lourde (50 Mo maximum).'));
    const { duration: seconds, width, height } = await videoInfo(file);
    if (!width || !height) return setError(t('Impossible de lire cette vidéo. Essayez un fichier MP4.'));
    if (width / height < RATIO.min || width / height > RATIO.max) {
      return setError(t('Seules les vidéos verticales au format reel (9:16) sont acceptées. Cette vidéo fait {w}×{h}.', { w: width, h: height }));
    }
    if (width < MIN_W || height < MIN_H) return setError(t('Qualité trop faible : {w}×{h} (minimum 480×854, idéal 1080×1920).', { w: width, h: height }));
    // some files don't state their length (Infinity / 0): the server and the admin check those
    const known = Number.isFinite(seconds) && seconds > 0;
    if (known && seconds > MAX_SECONDS + 1) return setError(t('Vidéo trop longue ({n} secondes maximum).', { n: MAX_SECONDS }));
    if (known && seconds < MIN_SECONDS) return setError(t('Vidéo trop courte ({n} secondes minimum).', { n: MIN_SECONDS }));
    const fd = new FormData();
    fd.append('video', file);
    fd.append('width', String(width));
    fd.append('height', String(height));
    if (known) fd.append('duration', String(Math.round(seconds)));
    setProgress(0);
    try {
      const { data } = await api.put(`/reels/${kind}/${listing._id}`, fd, {
        onUploadProgress: (e) => e.total && setProgress(Math.round((e.loaded / e.total) * 100)),
      });
      setReel(data.reel);
      onChange?.(data.reel);
    } catch (e) {
      setError(e.message);
    } finally {
      setProgress(null);
      if (input.current) input.current.value = '';
    }
  };

  const remove = async () => {
    if (!confirm(t('Supprimer la vidéo de cette annonce ?'))) return;
    setError('');
    try {
      await api.delete(`/reels/${kind}/${listing._id}`);
      const empty = { status: 'none', url: '' };
      setReel(empty);
      onChange?.(empty);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={t('Vidéo de l’annonce (reel)')}
        className={`relative inline-flex items-center justify-center gap-1.5 rounded-lg bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-700 transition hover:bg-pink-100 ${className}`}
      >
        <Clapperboard className="h-4 w-4" aria-hidden="true" /> {t('Reel')}
        {['pending', 'rejected'].includes(reel?.status) && (
          <span className={`absolute -end-1 -top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white ${reel.status === 'rejected' ? 'bg-red-500' : 'bg-amber-400'}`} aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={() => progress === null && setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="reel-title" onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="reel-title" className="flex items-center gap-2 text-lg font-extrabold text-ink">
                  <Clapperboard className="h-5 w-5 text-pink-600" aria-hidden="true" /> {t('Vidéo de l’annonce (reel)')}
                </h2>
                <p className="text-xs text-gray-500">{listing.name || listing.title}</p>
              </div>
              <button type="button" disabled={progress !== null} onClick={() => setOpen(false)} aria-label={t('Fermer')} className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-100 disabled:opacity-30">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {has ? (
              <div className="mb-4">
                <video src={getImageUrl(reel.url)} poster={getImageUrl(reel.poster) || undefined} controls playsInline className="mx-auto aspect-[9/16] max-h-[45vh] rounded-2xl bg-black object-cover" />
                {reel.status === 'rejected' ? (
                  <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    <p className="flex items-center gap-1.5 font-bold">
                      <XCircle className="h-4 w-4" aria-hidden="true" /> {t('Vidéo refusée par l’administration')}
                    </p>
                    {reel.rejectionReason && <p className="mt-1">{t('Motif :')} {t(reel.rejectionReason)}</p>}
                    <p className="mt-1 text-xs text-red-600">{t('Envoyez une autre vidéo : elle sera de nouveau vérifiée.')}</p>
                  </div>
                ) : (
                  <p className={`mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold ${reel.status === 'approved' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {reel.status === 'approved' ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <Clock className="h-4 w-4" aria-hidden="true" />}
                    {reel.status === 'approved' ? t('Publiée : visible sur l’annonce et dans les Reels') : t('En attente de validation par l’administration')}
                  </p>
                )}
              </div>
            ) : (
              <p className="mb-4 rounded-2xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500">
                {t('Une courte vidéo verticale (visite des lieux, vue, piscine…) attire beaucoup plus de clients. Elle apparaît sur l’annonce et dans la page Reels.')}
              </p>
            )}

            <ul className="mb-4 space-y-1 text-xs text-gray-500">
              <li>• {t('Format reel uniquement : vidéo verticale 9:16 (filmée au téléphone, idéal 1080×1920)')}</li>
              <li>• {t('MP4, WebM ou MOV · de {min} à {s} secondes · 50 Mo maximum', { min: MIN_SECONDS, s: MAX_SECONDS })}</li>
              <li>• {t('Publiée après validation par l’administration')}</li>
            </ul>

            {progress !== null && (
              <div className="mb-4" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-pink-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-center text-xs text-gray-500">{t('Envoi de la vidéo… {n} %', { n: progress })}</p>
              </div>
            )}
            {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <input ref={input} type="file" accept={TYPES.join(',')} className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
            <div className="flex gap-2">
              <button type="button" disabled={progress !== null} onClick={() => input.current?.click()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-600 py-3 text-sm font-bold text-white transition hover:bg-pink-700 disabled:opacity-50">
                <Upload className="h-4 w-4" aria-hidden="true" /> {has ? t('Remplacer la vidéo') : t('Ajouter une vidéo')}
              </button>
              {has && (
                <button type="button" disabled={progress !== null} onClick={remove} aria-label={t('Supprimer la vidéo')} className="grid w-12 place-items-center rounded-xl border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
