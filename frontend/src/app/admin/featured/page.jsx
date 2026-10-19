'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Search, Star, X, TrendingUp } from 'lucide-react';
import Link from '@/components/LocaleLink';
import api, { getImageUrl } from '@/lib/api';
import { useT } from '@/lib/i18n/useT';

const PERIODS = [
  { days: 7, label: '7 jours' },
  { days: 30, label: '30 jours' },
  { days: 90, label: '90 jours' },
  { days: 365, label: '1 an' },
  { days: 0, label: 'Depuis le début' },
];

const Thumb = ({ src, alt }) => (
  <img
    src={getImageUrl(src) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=60'}
    alt={alt}
    className="h-12 w-16 shrink-0 rounded-lg object-cover"
    loading="lazy"
  />
);

/** Admin: picks the hotels of the home page "Hôtels en vedette" section, helped by their booking demand. */
export default function AdminFeaturedPage() {
  const { t } = useT();
  const [days, setDays] = useState(90);
  const [hotels, setHotels] = useState([]);
  const [featured, setFeatured] = useState([]); // ordered ids
  const [max, setMax] = useState(12);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(''); // '' | 'saved'
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      // original names (no machine translation) and fresh numbers
      .get('/admin/hotels/demand', { params: { days }, localize: false })
      .then(({ data }) => {
        if (!active) return;
        setHotels(data.hotels);
        setFeatured(data.featured);
        setMax(data.max);
        setError('');
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [days]);

  const byId = useMemo(() => new Map(hotels.map((h) => [h._id, h])), [hotels]);
  const selection = featured.map((id) => byId.get(id)).filter(Boolean);
  const full = featured.length >= max;
  const visible = q.trim()
    ? hotels.filter((h) => `${h.name} ${h.wilaya} ${h.city}`.toLowerCase().includes(q.trim().toLowerCase()))
    : hotels;

  // every change is saved at once; on failure the previous selection comes back
  const save = async (next) => {
    const previous = featured;
    setFeatured(next);
    setSaving(true);
    setStatus('');
    setError('');
    try {
      await api.put('/admin/hotels/featured', { ids: next });
      setStatus('saved');
    } catch (e) {
      setFeatured(previous);
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  const add = (id) => !featured.includes(id) && !full && save([...featured, id]);
  const remove = (id) => save(featured.filter((x) => x !== id));
  const move = (i, dir) => {
    const next = [...featured];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    save(next);
  };

  const iconBtn = 'grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:opacity-30';

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">{t('Hôtels en vedette')}</h1>
        <p className="admin-page-subtitle">
          {t('Choisissez les hôtels affichés sur la page d’accueil ({max} maximum). Les plus demandés sont en haut de la liste.', { max })}
        </p>
      </div>

      {error && <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {/* Current selection, in display order */}
      <section className="mb-6 rounded-2xl bg-white p-5 shadow-card" aria-labelledby="selection-title">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="selection-title" className="flex items-center gap-2 text-lg font-bold text-ink">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden="true" />
            {t('Sélection de la page d’accueil')}
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {featured.length}/{max}
            </span>
          </h2>
          <div className="flex items-center gap-3 text-xs">
            <span aria-live="polite" className={saving ? 'text-gray-400' : 'text-emerald-600'}>
              {saving ? t('Enregistrement...') : status === 'saved' ? t('Enregistré ✓') : ''}
            </span>
            <Link href="/" target="_blank" className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline">
              {t('Voir la page d’accueil')} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">{t('Chargement...')}</p>
        ) : selection.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500">
            {t('Aucun hôtel choisi : la page d’accueil affiche les hôtels les mieux notés. Ajoutez des hôtels depuis la liste ci-dessous.')}
          </p>
        ) : (
          <ol className="space-y-2">
            {selection.map((h, i) => (
              <li key={h._id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">{i + 1}</span>
                <Thumb src={h.image} alt="" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{h.name}</p>
                  <p className="truncate text-xs text-gray-500">
                    {t(h.wilaya)} · {t('{n} demande(s)', { n: h.requests })}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button type="button" className={iconBtn} disabled={i === 0 || saving} onClick={() => move(i, -1)} aria-label={t('Monter {name}', { name: h.name })}>
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" className={iconBtn} disabled={i === selection.length - 1 || saving} onClick={() => move(i, 1)} aria-label={t('Descendre {name}', { name: h.name })}>
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" className={`${iconBtn} hover:border-red-200 hover:text-red-600`} disabled={saving} onClick={() => remove(h._id)} aria-label={t('Retirer {name}', { name: h.name })}>
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Approved hotels ranked by demand */}
      <section className="rounded-2xl bg-white p-5 shadow-card" aria-labelledby="demand-title">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="demand-title" className="flex items-center gap-2 text-lg font-bold text-ink">
            <TrendingUp className="h-5 w-5 text-brand-500" aria-hidden="true" /> {t('Hôtels les plus demandés')}
          </h2>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('Rechercher un hôtel')}
              aria-label={t('Rechercher un hôtel')}
              className="w-56 rounded-lg border border-gray-200 py-2 pe-3 ps-9 text-sm outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label={t('Période')}>
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              role="tab"
              aria-selected={days === p.days}
              onClick={() => setDays(p.days)}
              className={`min-h-[36px] rounded-full px-4 text-sm font-semibold transition ${
                days === p.days ? 'bg-brand-500 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {t(p.label)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">{t('Chargement...')}</p>
        ) : visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">{t('Aucun hôtel publié.')}</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {visible.map((h, i) => {
              const isFeatured = featured.includes(h._id);
              return (
                <li key={h._id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="w-6 shrink-0 text-center text-sm font-bold text-gray-400">{q ? '' : i + 1}</span>
                  <Thumb src={h.image} alt="" />
                  <div className="min-w-[140px] flex-1">
                    <p className="truncate font-semibold text-ink">{h.name}</p>
                    <p className="truncate text-xs text-gray-500">
                      {t(h.city)}, {t(h.wilaya)}
                      {h.avgRating > 0 && <> · ★ {h.avgRating.toFixed(1)}/10 ({h.reviewsCount})</>}
                    </p>
                  </div>
                  <dl className="flex shrink-0 gap-4 text-center text-xs">
                    <div>
                      <dt className="text-gray-400">{t('Demandes')}</dt>
                      <dd className="text-base font-bold text-ink">{h.requests}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">{t('Confirmées')}</dt>
                      <dd className="text-base font-bold text-emerald-600">{h.confirmed}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">{t('Nuits')}</dt>
                      <dd className="text-base font-bold text-ink">{h.nights}</dd>
                    </div>
                  </dl>
                  {isFeatured ? (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => remove(h._id)}
                      className="inline-flex min-h-[36px] w-36 shrink-0 items-center justify-center gap-1 rounded-lg bg-amber-50 px-3 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                    >
                      <Star className="h-4 w-4 fill-current" aria-hidden="true" /> {t('En vedette')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={saving || full}
                      onClick={() => add(h._id)}
                      title={full ? t('Sélection complète ({max} hôtels)', { max }) : undefined}
                      className="inline-flex min-h-[36px] w-36 shrink-0 items-center justify-center gap-1 rounded-lg border border-brand-200 px-3 text-xs font-bold text-brand-600 transition hover:bg-brand-50 disabled:opacity-40"
                    >
                      <Star className="h-4 w-4" aria-hidden="true" /> {t('Mettre en vedette')}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
