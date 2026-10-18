'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Trash2, ExternalLink, Clapperboard, XCircle } from 'lucide-react';
import Link from '@/components/LocaleLink';
import api, { getImageUrl } from '@/lib/api';
import { useT } from '@/lib/i18n/useT';
import { dateLocale } from '@/lib/i18n/format';

const FILTERS = [
  { key: 'pending', label: 'En attente' },
  { key: 'approved', label: 'Publiés' },
  { key: 'rejected', label: 'Refusés' },
];
// one click for the usual reasons; the admin can also write their own
const REASONS = [
  'La vidéo n’est pas au format vertical (9:16)',
  'Qualité insuffisante (floue, sombre ou qui tremble)',
  'La vidéo ne montre pas ce bien',
  'Contenu inapproprié',
  'Contient un numéro de téléphone, un lien ou une publicité',
];
const PATH = { hotel: '/hotels', house: '/houses', sale: '/sales' };
const KIND = { hotel: 'Hôtel', house: 'Location', sale: 'À vendre' };

/** Admin: owners' listing videos wait here before going public. */
export default function AdminReelsPage() {
  const { t } = useT();
  const [status, setStatus] = useState('pending');
  const [reels, setReels] = useState([]);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [rejecting, setRejecting] = useState(null); // id of the reel whose reject form is open
  const [reason, setReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/reels', { params: { status }, localize: false });
      setReels(data.reels);
      setPending(data.pending);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [status]);

  const act = async (r, action) => {
    if (action === 'delete' && !confirm(t('Supprimer cette vidéo définitivement ?'))) return;
    setBusy(`${r.kind}-${r._id}`);
    try {
      if (action === 'approve') await api.put(`/admin/reels/${r.kind}/${r._id}/approve`);
      else if (action === 'reject') await api.put(`/admin/reels/${r.kind}/${r._id}/reject`, { reason: reason.trim() });
      else await api.delete(`/reels/${r.kind}/${r._id}`);
      setRejecting(null);
      setReason('');
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title flex items-center gap-2">
          <Clapperboard className="h-6 w-6 text-pink-600" aria-hidden="true" /> {t('Reels')}
        </h1>
        <p className="admin-page-subtitle">
          {pending > 0 ? t('{n} vidéo(s) en attente de validation', { n: pending }) : t('Aucune vidéo en attente')}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label={t('Filtrer les vidéos')}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={status === f.key}
            onClick={() => setStatus(f.key)}
            className={`min-h-[40px] rounded-full px-4 text-sm font-semibold transition ${status === f.key ? 'bg-brand-500 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
          >
            {t(f.label)}
            {f.key === 'pending' && pending > 0 && <span className="ms-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs text-white">{pending}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">{t('Chargement...')}</p>
      ) : error ? (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-red-600">{error}</p>
      ) : reels.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-gray-400 shadow-card">{t('Aucune vidéo.')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reels.map((r) => {
            const id = `${r.kind}-${r._id}`;
            return (
              <article key={id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-card">
                <video src={getImageUrl(r.reel.url)} poster={getImageUrl(r.reel.poster) || undefined} controls playsInline preload="metadata" className="aspect-[9/16] max-h-[420px] w-full bg-black object-contain" />
                <div className="flex flex-1 flex-col p-4">
                  <span className="mb-1 inline-block w-fit rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-bold text-pink-700">{t(KIND[r.kind])}</span>
                  <p className="font-bold text-ink">{r.title}</p>
                  <p className="text-xs text-gray-500">
                    {t(r.city)}, {t(r.wilaya)} · {r.owner?.fullName} ({r.owner?.email})
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(r.reel.uploadedAt).toLocaleString(dateLocale())}
                    {r.reel.duration ? ` · ${r.reel.duration} s` : ''}
                    {r.reel.width ? ` · ${r.reel.width}×${r.reel.height}` : ''}
                    {r.listingStatus !== 'approved' && ` · ${t('annonce pas encore publiée')}`}
                  </p>
                  {r.reel.status === 'rejected' && r.reel.rejectionReason && (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                      <strong>{t('Motif du refus :')}</strong> {t(r.reel.rejectionReason)}
                    </p>
                  )}
                  {rejecting === id && (
                    <form
                      className="mt-3 space-y-2 rounded-xl border border-red-100 bg-red-50/40 p-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (reason.trim().length >= 3) act(r, 'reject');
                      }}
                    >
                      <p className="text-xs font-bold text-red-800">{t('Motif du refus (envoyé au propriétaire)')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {REASONS.map((x) => (
                          <button key={x} type="button" onClick={() => setReason(t(x))} className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${reason === t(x) ? 'border-red-400 bg-red-100 text-red-800' : 'border-red-100 bg-white text-red-700 hover:bg-red-50'}`}>
                            {t(x)}
                          </button>
                        ))}
                      </div>
                      <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={300} placeholder={t('Ou écrivez le motif…')} className="w-full resize-none rounded-lg border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:border-red-300" />
                      <div className="flex gap-2">
                        <button type="submit" disabled={busy === id || reason.trim().length < 3} className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40">
                          <XCircle className="h-4 w-4" aria-hidden="true" /> {t('Confirmer le refus')}
                        </button>
                        <button type="button" onClick={() => { setRejecting(null); setReason(''); }} className="min-h-[34px] rounded-lg px-3 text-xs font-semibold text-gray-500 hover:bg-gray-100">
                          {t('Annuler')}
                        </button>
                      </div>
                    </form>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-50 pt-3">
                    {r.reel.status !== 'approved' && (
                      <button disabled={busy === id} onClick={() => act(r, 'approve')} className="inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                        <CheckCircle className="h-4 w-4" aria-hidden="true" /> {t('Publier')}
                      </button>
                    )}
                    {r.reel.status !== 'rejected' && rejecting !== id && (
                      <button disabled={busy === id} onClick={() => { setRejecting(id); setReason(''); }} className="inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                        <XCircle className="h-4 w-4" aria-hidden="true" /> {t('Refuser')}
                      </button>
                    )}
                    <button disabled={busy === id} onClick={() => act(r, 'delete')} className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                      <Trash2 className="h-4 w-4" aria-hidden="true" /> {t('Supprimer')}
                    </button>
                    <Link href={`${PATH[r.kind]}/${r._id}`} target="_blank" className="ms-auto inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                      {t('Voir l’annonce')} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
