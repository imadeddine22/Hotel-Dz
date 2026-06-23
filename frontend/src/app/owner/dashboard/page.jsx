'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Hotel, CalendarCheck, Wallet, Plus, Home } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import api from '@/lib/api';
import { formatDZD } from '@/lib/data';

export default function OwnerDashboard() {
  const [stats, setStats] = useState({ hotels: 0, houses: 0, bookings: 0, revenue: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [{ data: h }, { data: hs }, { data: b }] = await Promise.all([
          api.get('/hotels/my/list'),
          api.get('/houses/my/list').catch(() => ({ data: { count: 0 } })),
          api.get('/bookings/owner'),
        ]);
        const revenue = b.bookings
          .filter((x) => x.paymentStatus === 'paid')
          .reduce((s, x) => s + x.totalPrice, 0);
        setStats({ hotels: h.count, houses: hs.count || 0, bookings: b.count, revenue });
      } catch { /* offline */ }
    })();
  }, []);

  const cards = [
    { label: 'Mes hôtels', value: stats.hotels, icon: Hotel, color: 'from-brand-400 to-brand-600' },
    { label: 'Mes maisons', value: stats.houses, icon: Home, color: 'from-purple-400 to-purple-600' },
    { label: 'Réservations', value: stats.bookings, icon: CalendarCheck, color: 'from-sky-400 to-blue-600' },
    { label: 'Revenu (payé)', value: formatDZD(stats.revenue), icon: Wallet, color: 'from-amber-400 to-orange-500' },
  ];

  return (
    <DashboardShell role="owner" title="Tableau de bord">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-500">Vue d&apos;ensemble de votre activité</p>
        <div className="flex gap-2">
          <Link href="/owner/hotels/new" className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
            <Plus className="h-4 w-4" /> Ajouter un hôtel
          </Link>
          <Link href="/owner/my-houses" className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
            <Plus className="h-4 w-4" /> Ajouter une maison
          </Link>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl bg-white p-6 shadow-card">
              <span className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-white`}>
                <Icon className="h-6 w-6" />
              </span>
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className="text-2xl font-extrabold text-ink">{c.value}</p>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
