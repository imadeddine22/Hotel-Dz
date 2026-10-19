'use client';

import { useEffect, useState } from 'react';
import Link from '@/components/LocaleLink';
import DashboardShell from '@/components/DashboardShell';
import InvestorRequestRow from '@/components/InvestorRequestRow';
import api from '@/lib/api';
import { useT } from '@/lib/i18n/useT';

/** Every "I'm interested" request the investor sent, with the owner's read status. */
export default function InvestorRequestsPage() {
  const { t } = useT();
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/investor/requests')
      .then(({ data }) => setRequests(data.requests))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardShell role="investor" title={t('Mes demandes')}>
      <h1 className="mb-1 text-2xl font-extrabold text-gray-900">{t('Mes demandes')}</h1>
      <p className="mb-6 text-sm text-gray-500">{t('Les propriétaires vous contactent par téléphone ou par email. Ici vous voyez s’ils ont lu votre demande.')}</p>
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}
      {!requests ? (
        <p className="py-10 text-center text-gray-400">{t('Chargement...')}</p>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="font-semibold text-gray-700">{t('Aucune demande pour l’instant.')}</p>
          <Link href="/investir" className="mt-3 inline-block font-bold text-[#00B3D2] hover:underline">{t('Explorer les projets')}</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => <InvestorRequestRow key={r._id} request={r} full />)}
        </ul>
      )}
    </DashboardShell>
  );
}
