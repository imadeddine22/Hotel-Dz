'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Trash2, Star } from 'lucide-react';
import api from '@/lib/api';

import { useT } from '@/lib/i18n/useT';
import { dateLocale } from '@/lib/i18n/format';

const FILTERS = [
  { key: 'pending', label: 'En attente' },
  { key: 'approved', label: 'Publiés' },
  { key: '', label: 'Tous' },
];

/** Moderation of the home page testimonials: nothing goes public before an admin approves it. */
export default function AdminTestimonialsPage() {
  const { t } = useT();
  const [items, setItems] = useState([]);
  const [pending, setPending] = useState(0);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      // originals, not machine translations: the admin moderates what the author wrote
      const { data } = await api.get(`/testimonials/admin${filter ? `?status=${filter}` : ''}`, { localize: false });
      setItems(data.testimonials);
      setPending(data.pending);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [filter]);

  const approve = async (id) => {
    setBusyId(id);
    try {
      await api.put(`/testimonials/${id}/approve`);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!confirm(t('Supprimer cet avis définitivement ?'))) return;
    setBusyId(id);
    try {
      await api.delete(`/testimonials/${id}`);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">{t('Avis clients')}</h1>
        <p className="admin-page-subtitle">
          {pending > 0
            ? t('{n} avis en attente de validation', { n: pending })
            : t('Aucun avis en attente')}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label={t('Filtrer les avis')}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`min-h-[40px] rounded-full px-4 text-sm font-semibold transition ${
              filter === f.key ? 'bg-brand-500 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            {t(f.label)}
            {f.key === 'pending' && pending > 0 && (
              <span className="ms-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs text-white">{pending}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">{t('Chargement...')}</p>
      ) : error ? (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-gray-400 shadow-card">{t('Aucun avis.')}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((it) => {
            const busy = busyId === it._id;
            return (
              <article key={it._id} className="flex flex-col rounded-2xl bg-white p-5 shadow-card">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{it.name}</p>
                    <p className="truncate text-xs text-gray-500">
                      {[it.title, it.user?.email].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      it.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {it.status === 'approved' ? t('Publié') : t('En attente')}
                  </span>
                </div>

                <div className="mb-2 flex gap-0.5 text-amber-400" aria-label={t('{n} étoiles sur 5', { n: it.rating })}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`h-4 w-4 ${i <= it.rating ? 'fill-current' : 'text-gray-200'}`} aria-hidden="true" />
                  ))}
                </div>
                <p className="flex-1 whitespace-pre-line break-words text-sm leading-relaxed text-gray-700">{it.comment}</p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-50 pt-3">
                  <span className="text-xs text-gray-400">{new Date(it.updatedAt).toLocaleDateString(dateLocale())}</span>
                  <div className="flex gap-2">
                    {it.status === 'pending' && (
                      <button
                        disabled={busy}
                        onClick={() => approve(it._id)}
                        className="inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" aria-hidden="true" /> {t('Approuver')}
                      </button>
                    )}
                    <button
                      disabled={busy}
                      onClick={() => remove(it._id)}
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" /> {t('Supprimer')}
                    </button>
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
