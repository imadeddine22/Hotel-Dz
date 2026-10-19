'use client';

import { useEffect, useState } from 'react';
import Link from '@/components/LocaleLink';
import { Send, CheckCheck, Bookmark, Sparkles, Search, SlidersHorizontal, X, Save } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import ProjectCard from '@/components/ProjectCard';
import InvestorRequestRow from '@/components/InvestorRequestRow';
import api from '@/lib/api';
import { useWilayas } from '@/hooks/useWilayas';
import { ASSET_TYPES, PROJECT_TYPES, PROJECT_COLORS, projectGradient } from '@/lib/projects';
import { useT } from '@/lib/i18n/useT';

const NO_PREFS = { wilayas: [], assetTypes: [], projectTypes: [], maxBudget: '' };

/** Investor's home: counters, projects matching their preferences, latest requests, and the preferences themselves. */
export default function InvestorDashboard() {
  const { t } = useT();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/investor/dashboard')
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.message));
  useEffect(() => {
    load();
  }, []);

  const stats = data?.stats;
  const cards = [
    { icon: Send, label: 'Demandes envoyées', value: stats?.requests, color: '#00B3D2' },
    { icon: CheckCheck, label: 'Lues par les propriétaires', value: stats?.seenRequests, color: '#10b981' },
    { icon: Bookmark, label: 'Projets sauvegardés', value: stats?.saved, color: '#f59e0b' },
    { icon: Sparkles, label: 'Projets pour vous', value: stats?.matches, color: '#8b5cf6' },
  ];

  return (
    <DashboardShell role="investor" title={t('Espace investisseur')}>
      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-[2rem] px-8 py-10 text-white shadow-lg md:px-10" style={{ background: `linear-gradient(135deg, ${PROJECT_COLORS.ink}, #0b4a5c 60%, #00B3D2)` }}>
        <div className="relative z-10 max-w-xl">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-cyan-200 rtl:tracking-normal">{t('Espace investisseur')}</p>
          <h1 className="mb-6 text-3xl font-extrabold leading-tight md:text-4xl">{t('Trouvez le projet dans lequel investir')}</h1>
          <div className="flex flex-wrap gap-3">
            <Link href="/investir" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold shadow-md transition hover:scale-105" style={{ color: PROJECT_COLORS.ink }}>
              <Search className="h-5 w-5" aria-hidden="true" /> {t('Explorer les projets')}
            </Link>
            <a href="#preferences" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-bold text-white transition hover:bg-white/10">
              <SlidersHorizontal className="h-5 w-5" aria-hidden="true" /> {t('Ce que je recherche')}
            </a>
          </div>
        </div>
        <div className="absolute -end-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      </div>

      {error && <div className="mb-8 rounded-xl border border-red-100 bg-red-50 p-4 text-red-600">{error}</div>}

      {/* Counters */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-4 rounded-full border border-gray-100 bg-white px-6 py-4 shadow-sm">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full" style={{ background: `${color}1a`, color }}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 rtl:tracking-normal">{t(label)}</p>
              <p className="text-xl font-extrabold leading-none text-gray-900">{value ?? '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Matching projects */}
      <section className="mb-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">{t('Projets pour vous')}</h2>
            <p className="text-sm text-gray-500">{t('Selon vos préférences : wilayas, type de bien, type de projet et budget.')}</p>
          </div>
          <Link href="/investir" className="text-sm font-bold text-[#00B3D2] hover:underline">{t('Voir tous les projets')}</Link>
        </div>
        {!data ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-white" />)}
          </div>
        ) : data.matches.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
            {t('Aucun projet ne correspond encore à vos préférences. Élargissez-les ou revenez bientôt.')}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.matches.map((p) => <ProjectCard key={p._id} project={p} />)}
          </div>
        )}
      </section>

      {/* Latest requests */}
      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between gap-2">
          <h2 className="text-xl font-extrabold text-gray-900">{t('Mes dernières demandes')}</h2>
          {data?.requests.length > 0 && <Link href="/investor/requests" className="text-sm font-bold text-[#00B3D2] hover:underline">{t('Tout voir')}</Link>}
        </div>
        {data && data.requests.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            {t('Vous n’avez encore envoyé aucune demande. Ouvrez un projet et remplissez « Ce projet vous intéresse ? ».')}
          </p>
        ) : (
          <ul className="space-y-3">
            {data?.requests.map((r) => <InvestorRequestRow key={r._id} request={r} />)}
          </ul>
        )}
      </section>

      {data && <Preferences initial={data.prefs} onSaved={load} />}
    </DashboardShell>
  );
}

/** What the investor is looking for: drives "Projets pour vous". Empty = everything. */
function Preferences({ initial, onSaved }) {
  const { t } = useT();
  const { wilayas } = useWilayas();
  const [prefs, setPrefs] = useState(() => ({ ...NO_PREFS, ...initial, maxBudget: initial?.maxBudget || '' }));
  const [state, setState] = useState(''); // '' | saving | saved | error message

  const toggle = (key, value) =>
    setPrefs((p) => ({ ...p, [key]: p[key].includes(value) ? p[key].filter((x) => x !== value) : [...p[key], value] }));

  const save = async () => {
    setState('saving');
    try {
      await api.put('/investor/preferences', { ...prefs, maxBudget: Number(String(prefs.maxBudget).replace(/\s/g, '')) || 0 });
      setState('saved');
      onSaved();
    } catch (err) {
      setState(err.message);
    }
  };

  const chip = (active) =>
    `rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${active ? 'text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`;

  return (
    <section id="preferences" className="scroll-mt-24 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <h2 className="text-xl font-extrabold text-gray-900">{t('Ce que je recherche')}</h2>
      <p className="mb-5 text-sm text-gray-500">{t('Laissez vide pour voir tous les projets.')}</p>

      <p className="mb-2 text-sm font-bold text-gray-700">{t('Wilayas')}</p>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {prefs.wilayas.map((w) => (
          <span key={w} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-white" style={{ background: projectGradient }}>
            {t(w)}
            <button type="button" onClick={() => toggle('wilayas', w)} aria-label={t('Retirer {name}', { name: t(w) })} className="rounded-full hover:bg-white/20">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </span>
        ))}
        <select
          value=""
          onChange={(e) => e.target.value && toggle('wilayas', e.target.value)}
          aria-label={t('Ajouter une wilaya')}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-gray-900"
        >
          <option value="">{prefs.wilayas.length ? t('+ Ajouter une wilaya') : t('Toutes les wilayas')}</option>
          {wilayas.filter((w) => !prefs.wilayas.includes(w)).map((w) => (
            <option key={w} value={w}>{t(w)}</option>
          ))}
        </select>
      </div>

      <p className="mb-2 text-sm font-bold text-gray-700">{t('Type de bien')}</p>
      <div className="mb-5 flex flex-wrap gap-2">
        {ASSET_TYPES.map((x) => {
          const on = prefs.assetTypes.includes(x);
          return (
            <button key={x} type="button" aria-pressed={on} onClick={() => toggle('assetTypes', x)} className={chip(on)} style={on ? { background: projectGradient } : undefined}>
              {t(x)}
            </button>
          );
        })}
      </div>

      <p className="mb-2 text-sm font-bold text-gray-700">{t('Type de projet')}</p>
      <div className="mb-5 flex flex-wrap gap-2">
        {PROJECT_TYPES.map((x) => {
          const on = prefs.projectTypes.includes(x);
          return (
            <button key={x} type="button" aria-pressed={on} onClick={() => toggle('projectTypes', x)} className={chip(on)} style={on ? { background: projectGradient } : undefined}>
              {t(x)}
            </button>
          );
        })}
      </div>

      <label className="mb-6 block max-w-xs text-sm font-bold text-gray-700">
        {t('Budget maximum (DZD)')}
        <input
          value={prefs.maxBudget}
          onChange={(e) => setPrefs({ ...prefs, maxBudget: e.target.value })}
          inputMode="numeric"
          dir="ltr"
          placeholder={t('Sans limite')}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-[#00B3D2] rtl:text-right"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={state === 'saving'} className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold text-white shadow disabled:opacity-60" style={{ background: projectGradient }}>
          <Save className="h-5 w-5" aria-hidden="true" /> {state === 'saving' ? t('Enregistrement...') : t('Enregistrer mes préférences')}
        </button>
        {state === 'saved' && <span className="text-sm font-semibold text-emerald-600">{t('Préférences enregistrées.')}</span>}
        {state && !['saving', 'saved'].includes(state) && <span className="text-sm font-semibold text-red-600">{state}</span>}
      </div>
    </section>
  );
}
