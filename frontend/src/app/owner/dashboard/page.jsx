'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Hotel, Home, CalendarCheck, Wallet, Plus, ArrowRight, PlayCircle, Star, MapPin } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import api from '@/lib/api';
import { formatDZD } from '@/lib/data';

export default function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/owner/stats');
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardShell role="owner" title="Dashboard">
      
      {/* Hero Banner Area */}
      <div className="relative overflow-hidden rounded-[2rem] bg-indigo-600 px-10 py-12 mb-10 shadow-lg shadow-indigo-200">
        <div className="relative z-10 max-w-xl">
          <p className="mb-2 text-sm font-bold tracking-wider text-indigo-200 uppercase">Espace Propriétaire</p>
          <h2 className="mb-6 text-4xl font-extrabold text-white leading-tight">
            Gérez vos établissements et boostez vos réservations
          </h2>
          <div className="flex gap-4">
            <Link 
              href="/owner/hotels/new" 
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-indigo-600 shadow-md hover:bg-gray-50 hover:scale-105 transition-all"
            >
              <Plus className="h-5 w-5" /> Ajouter un hôtel
            </Link>
            <Link 
              href="/owner/my-houses?new=1" 
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 font-bold text-white shadow-md hover:bg-indigo-400 hover:scale-105 transition-all border border-indigo-400"
            >
              <Plus className="h-5 w-5" /> Ajouter une maison
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute right-20 bottom-10">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3 7h7l-5 5 2 7-7-4-7 4 2-7-5-5h7z" />
          </svg>
        </div>
        <div className="absolute right-60 top-10">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-4 mb-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 rounded-full bg-white shadow-sm animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-4 text-red-600 border border-red-100 mb-10">{error}</div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {/* Hotels Stat */}
          <div className="flex items-center gap-4 rounded-full bg-white px-6 py-4 shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-default">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600">
              <Hotel className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hôtels</p>
              <h3 className="text-xl font-extrabold text-gray-900 leading-none">{stats.totalHotels}</h3>
            </div>
          </div>

          {/* Houses Stat */}
          <div className="flex items-center gap-4 rounded-full bg-white px-6 py-4 shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-default">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Maisons</p>
              <h3 className="text-xl font-extrabold text-gray-900 leading-none">{stats.totalHouses}</h3>
            </div>
          </div>

          {/* Bookings Stat */}
          <div className="flex items-center gap-4 rounded-full bg-white px-6 py-4 shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-default">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Réservations</p>
              <h3 className="text-xl font-extrabold text-gray-900 leading-none">{stats.totalBookings}</h3>
            </div>
          </div>

          {/* Revenue Stat */}
          <div className="flex items-center gap-4 rounded-full bg-white px-6 py-4 shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-default">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Revenus</p>
              <h3 className="text-xl font-extrabold text-gray-900 leading-none">{formatDZD(stats.totalRevenue)}</h3>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-extrabold text-gray-900">Accès Rapide</h3>
        <div className="flex gap-2">
          <button className="grid h-8 w-8 place-items-center rounded-full bg-white text-gray-400 shadow-sm hover:text-indigo-600 transition-colors">
            &lt;
          </button>
          <button className="grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-colors">
            &gt;
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
        <Link href="/owner/my-hotels" className="group flex flex-col rounded-3xl bg-white p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-gray-100 mb-4">
            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80" alt="Hotel" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-indigo-600">
              Hôtels
            </div>
          </div>
          <div className="px-2 pb-2">
            <h4 className="font-extrabold text-gray-900 text-lg mb-1">Gérer vos Hôtels</h4>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                <Hotel className="h-3 w-3" />
              </span>
              Ajouter des chambres, modifier les prix
            </p>
          </div>
        </Link>

        <Link href="/owner/my-houses" className="group flex flex-col rounded-3xl bg-white p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-gray-100 mb-4">
            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=80" alt="House" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-brand-500">
              Maisons
            </div>
          </div>
          <div className="px-2 pb-2">
            <h4 className="font-extrabold text-gray-900 text-lg mb-1">Gérer vos Maisons</h4>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                <Home className="h-3 w-3" />
              </span>
              Modifier les annonces, ajouter des photos
            </p>
          </div>
        </Link>
        
        <Link href="/owner/bookings" className="group flex flex-col rounded-3xl bg-white p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-gray-100 mb-4">
            <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80" alt="Bookings" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-emerald-600">
              Réservations
            </div>
          </div>
          <div className="px-2 pb-2">
            <h4 className="font-extrabold text-gray-900 text-lg mb-1">Suivi des Réservations</h4>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                <CalendarCheck className="h-3 w-3" />
              </span>
              Consulter et approuver les demandes
            </p>
          </div>
        </Link>
      </div>
      
    </DashboardShell>
  );
}
