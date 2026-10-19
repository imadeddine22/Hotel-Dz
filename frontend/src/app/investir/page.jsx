'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Landmark, Handshake, MessagesSquare, PlusCircle, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from '@/components/LocaleLink';
import ProjectCard from '@/components/ProjectCard';
import api from '@/lib/api';
import { useWilayas } from '@/hooks/useWilayas';
import { ASSET_TYPES, PROJECT_TYPES, PARTNERSHIP_TYPES, PROJECT_COLORS, projectGradient } from '@/lib/projects';
import { useT } from '@/lib/i18n/useT';
import { useInitialData } from '@/components/InitialData';
import { useAuthStore } from '@/store/authStore';

const EMPTY = { q: '', wilaya: '', assetType: '', projectType: '', partnership: '' };

/** Owners of land or property who don't want to sell look for an investor / partner for the project they have in mind. */
export default function InvestPage() {
  const { t } = useT();
  const initial = useInitialData();
  const user = useAuthStore((s) => s.user);
  const { wilayas } = useWilayas();
  const [projects, setProjects] = useState(initial?.projects ?? []);
  const [total, setTotal] = useState(initial?.total ?? 0);
  const [pages, setPages] = useState(initial?.pages ?? 1);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [filters, setFilters] = useState(EMPTY);
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(!initial);
  const silentFirst = useRef(Boolean(initial));
  const lastRequest = useRef(0);

  useEffect(() => {
    (async () => {
      const id = ++lastRequest.current;
      if (!silentFirst.current) setLoading(true);
      silentFirst.current = false;
      try {
        const params = { page, limit: 12, sort, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
        const { data } = await api.get('/projects', { params });
        if (id !== lastRequest.current) return;
        setProjects(data.projects || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      } catch {
        if (id === lastRequest.current) setProjects([]);
      } finally {
        if (id === lastRequest.current) setLoading(false);
      }
    })();
  }, [page, filters, sort]);

  const apply = (e) => {
    e.preventDefault();
    setPage(1);
    setFilters(form);
  };
  const reset = () => {
    setForm(EMPTY);
    setFilters(EMPTY);
    setPage(1);
  };
  const proposeHref = user ? '/projects/mine?new=1' : '/login?redirect=%2Fprojects%2Fmine%3Fnew%3D1';
  const select = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00B3D2]';

  return (
    <main className="min-h-screen bg-[#F5FBFC]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-14 text-center text-white" style={{ background: `linear-gradient(135deg, ${PROJECT_COLORS.ink}, #0b4a5c 60%, #00B3D2)` }}>
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur">
            <Landmark className="h-4 w-4" aria-hidden="true" /> {t('Projets et investissement')}
          </span>
          <h1 className="text-3xl font-black leading-tight md:text-5xl">{t('Votre bien, leur investissement, un projet ensemble')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 md:text-lg">
            {t('Vous avez un terrain, un local, un bâtiment ou un autre bien que vous ne voulez pas vendre ? Proposez le projet que vous imaginez et trouvez un investisseur ou un associé. Investisseurs : découvrez des biens prêts pour vos projets partout en Algérie.')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={proposeHref} className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold text-white shadow-lg transition hover:scale-105" style={{ background: projectGradient }}>
              <PlusCircle className="h-5 w-5" aria-hidden="true" /> {t('Proposer mon projet')}
            </Link>
            <a href="#projets" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold transition hover:bg-slate-100" style={{ color: PROJECT_COLORS.ink }}>
              <Search className="h-5 w-5" aria-hidden="true" /> {t('Voir les projets')}
            </a>
          </div>
          {!user ? (
            <Link href="/register?role=investor" className="mt-5 inline-block text-sm font-semibold text-white/85 underline-offset-4 hover:underline">
              {t('Vous êtes investisseur ? Créez votre espace gratuit')}
            </Link>
          ) : user.role === 'investor' ? (
            <Link href="/investor/dashboard" className="mt-5 inline-block text-sm font-semibold text-white/85 underline-offset-4 hover:underline">
              {t('Mon espace investisseur')}
            </Link>
          ) : null}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto -mt-8 grid max-w-6xl gap-4 px-4 sm:grid-cols-3">
        {[
          { icon: Landmark, title: 'Le propriétaire publie', text: 'Terrain, local, bâtiment… sa surface, ses papiers et le projet qu’il imagine (commerce, résidence, hôtel, agriculture…).' },
          { icon: MessagesSquare, title: 'L’investisseur se manifeste', text: 'Il envoie sa demande avec le montant envisagé ; le propriétaire la reçoit dans son espace.' },
          { icon: Handshake, title: 'Ils s’associent', text: 'Parts du projet, exploitation en commun, logements contre terrain, location longue durée… selon leur accord.' },
        ].map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="relative rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/5">
            <span className="absolute end-4 top-4 text-3xl font-black text-slate-100">{i + 1}</span>
            <span className="mb-3 grid h-11 w-11 place-items-center rounded-full text-white" style={{ background: projectGradient }}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="font-bold" style={{ color: PROJECT_COLORS.ink }}>{t(title)}</p>
            <p className="mt-1 text-sm text-slate-500">{t(text)}</p>
          </div>
        ))}
      </section>

      {/* Filters + list */}
      <section id="projets" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6">
        <form onSubmit={apply} className="mb-6 grid gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5 sm:grid-cols-2 lg:grid-cols-6">
          <label className="relative lg:col-span-2">
            <span className="sr-only">{t('Rechercher')}</span>
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} placeholder={t('Rechercher un projet, une ville, une référence')} className={`${select} ps-9`} />
          </label>
          <select value={form.wilaya} onChange={(e) => setForm({ ...form, wilaya: e.target.value })} className={select} aria-label={t('Wilaya')}>
            <option value="">{t('Toutes les wilayas')}</option>
            {wilayas.map((w) => (
              <option key={w} value={w}>{t(w)}</option>
            ))}
          </select>
          <select value={form.assetType} onChange={(e) => setForm({ ...form, assetType: e.target.value })} className={select} aria-label={t('Type de bien')}>
            <option value="">{t('Tous les biens')}</option>
            {ASSET_TYPES.map((x) => (
              <option key={x} value={x}>{t(x)}</option>
            ))}
          </select>
          <select value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })} className={select} aria-label={t('Type de projet')}>
            <option value="">{t('Tous les projets')}</option>
            {PROJECT_TYPES.map((x) => (
              <option key={x} value={x}>{t(x)}</option>
            ))}
          </select>
          <select value={form.partnership} onChange={(e) => setForm({ ...form, partnership: e.target.value })} className={select} aria-label={t('Type de partenariat')}>
            <option value="">{t('Tous les partenariats')}</option>
            {PARTNERSHIP_TYPES.map((x) => (
              <option key={x} value={x}>{t(x)}</option>
            ))}
          </select>
          <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2 lg:col-span-6">
            <p className="text-sm text-slate-500">{t('{n} projet(s)', { n: total })}</p>
            <div className="flex flex-wrap gap-2">
              <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" aria-label={t('Trier')}>
                <option value="newest">{t('Plus récents')}</option>
                <option value="area">{t('Plus grande surface')}</option>
                <option value="budget">{t('Plus gros investissement')}</option>
              </select>
              <button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <RefreshCw className="h-4 w-4" aria-hidden="true" /> {t('Réinitialiser')}
              </button>
              <button type="submit" className="rounded-xl px-5 py-2 text-sm font-bold text-white" style={{ background: projectGradient }}>
                {t('Rechercher')}
              </button>
            </div>
          </div>
        </form>

        {loading ? (
          <p className="py-16 text-center text-slate-400">{t('Chargement...')}</p>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-14 text-center">
            <p className="font-bold" style={{ color: PROJECT_COLORS.ink }}>{t('Aucun projet ne correspond à votre recherche.')}</p>
            <Link href={proposeHref} className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white" style={{ background: projectGradient }}>
              <PlusCircle className="h-4 w-4" aria-hidden="true" /> {t('Proposer mon projet')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={n === page ? 'page' : undefined}
                className={`h-10 w-10 rounded-full text-sm font-bold ${n === page ? 'text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}
                style={n === page ? { background: projectGradient } : undefined}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
