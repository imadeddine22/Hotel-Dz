'use client';

import { useEffect, useState } from 'react';
import { BookmarkX } from 'lucide-react';
import Link from '@/components/LocaleLink';
import DashboardShell from '@/components/DashboardShell';
import ProjectCard from '@/components/ProjectCard';
import api from '@/lib/api';
import { useT } from '@/lib/i18n/useT';

/** Projects the investor bookmarked from a project page. */
export default function InvestorSavedPage() {
  const { t } = useT();
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/investor/saved')
      .then(({ data }) => setProjects(data.projects))
      .catch((err) => setError(err.message));
  }, []);

  const remove = async (id) => {
    await api.delete(`/investor/saved/${id}`).catch(() => {});
    setProjects((list) => list.filter((p) => p._id !== id));
  };

  return (
    <DashboardShell role="investor" title={t('Projets sauvegardés')}>
      <h1 className="mb-1 text-2xl font-extrabold text-gray-900">{t('Projets sauvegardés')}</h1>
      <p className="mb-6 text-sm text-gray-500">{t('Gardez ici les projets à étudier ; seuls les projets encore en ligne s’affichent.')}</p>
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}
      {!projects ? (
        <p className="py-10 text-center text-gray-400">{t('Chargement...')}</p>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="font-semibold text-gray-700">{t('Aucun projet sauvegardé.')}</p>
          <p className="mt-1 text-sm text-gray-500">{t('Sur la page d’un projet, cliquez sur « Sauvegarder ».')}</p>
          <Link href="/investir" className="mt-3 inline-block font-bold text-[#00B3D2] hover:underline">{t('Explorer les projets')}</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p._id} className="relative">
              <ProjectCard project={p} />
              <button
                type="button"
                onClick={() => remove(p._id)}
                title={t('Retirer des sauvegardés')}
                aria-label={t('Retirer des sauvegardés')}
                className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-red-500 shadow hover:bg-red-50"
              >
                <BookmarkX className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
