'use client';

import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import api from '@/lib/api';
import { useT } from '@/lib/i18n/useT';
import { dateLocale } from '@/lib/i18n/format';

const PERIODS = [
  { days: 7, label: '7 jours' },
  { days: 30, label: '30 jours' },
  { days: 90, label: '3 mois' },
  { days: 0, label: 'Tout' },
];
const COLORS = { Facebook: '#1877F2', Instagram: '#E1306C', TikTok: '#111827', YouTube: '#FF0000', Google: '#34A853', 'Ami ou famille': '#F59E0B', Publicité: '#8B5CF6', Autre: '#94A3B8' };
const LANGS = { fr: 'FR', ar: 'AR', en: 'EN' };

/** Admin: answers to "Comment nous avez-vous connus ?" from the welcome notification. */
export default function AdminReferralsPage() {
  const { t } = useT();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    api
      .get('/admin/referrals', { params: { days } })
      .then(({ data }) => {
        setData(data);
        setError('');
      })
      .catch((e) => setError(e.message));
  }, [days]);

  const max = Math.max(1, ...(data?.sources || []).map((s) => s.count));

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-[#00B3D2]" aria-hidden="true" /> {t('Comment ils nous ont connus')}
        </h1>
        <p className="text-sm text-gray-500">{t('Réponses des visiteurs à la notification de bienvenue : utile pour savoir où faire votre publicité.')}</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button key={p.days} type="button" onClick={() => setDays(p.days)} className={`admin-filter-btn ${days === p.days ? 'active' : ''}`}>
            {t(p.label)}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-red-600">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Answers per source */}
        <section className="rounded-2xl bg-white p-5 shadow-card lg:col-span-3">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-bold text-ink">{t('Par source')}</h2>
            <p className="text-sm text-gray-500">{t('{n} réponse(s)', { n: data?.total ?? '…' })}</p>
          </div>
          {!data ? (
            <p className="text-gray-400">{t('Chargement...')}</p>
          ) : (
            <ul className="space-y-3">
              {data.sources.map(({ source, count }) => {
                const pct = data.total ? Math.round((count / data.total) * 100) : 0;
                return (
                  <li key={source}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-semibold text-gray-700">{t(source)}</span>
                      <span className="text-gray-500">
                        {count} · {pct} %
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(count / max) * 100}%`, background: COLORS[source] }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Latest answers */}
        <section className="rounded-2xl bg-white p-5 shadow-card lg:col-span-2">
          <h2 className="mb-4 font-bold text-ink">{t('Dernières réponses')}</h2>
          {data && data.latest.length === 0 ? (
            <p className="text-sm text-gray-400">{t('Aucune réponse pour cette période.')}</p>
          ) : (
            <ul className="max-h-[28rem] divide-y divide-gray-100 overflow-y-auto">
              {data?.latest.map((r) => (
                <li key={r._id} className="flex items-start gap-3 py-2.5 text-sm">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[r.source] }} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800">
                      {t(r.source)}
                      {r.other && <span className="font-normal text-gray-500"> — {r.other}</span>}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleString(dateLocale())} · {LANGS[r.lang] || ''}
                      {r.user ? ` · ${r.user.fullName}` : ` · ${t('Visiteur')}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
