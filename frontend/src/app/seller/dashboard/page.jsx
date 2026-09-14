'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tag, Eye, Clock, CheckCircle, Plus, ArrowRight } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import api from '@/lib/api';

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/seller/stats');
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
    <DashboardShell role="seller" title="Dashboard">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-500 px-10 py-12 mb-10 shadow-lg shadow-emerald-200">
        <div className="relative z-10 max-w-xl">
          <p className="mb-2 text-sm font-bold tracking-wider text-emerald-100 uppercase">Espace Vendeur</p>
          <h2 className="mb-6 text-4xl font-extrabold text-white leading-tight">
            Gérez vos annonces immobilières et vendez vos biens
          </h2>
          <div className="flex gap-4">
            <Link 
              href="/seller/my-listings?new=1" 
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-emerald-600 shadow-md hover:bg-gray-50 hover:scale-105 transition-all"
            >
              <Plus className="h-5 w-5" /> Publier une annonce
            </Link>
            <Link 
              href="/sales" 
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-bold text-white shadow-md hover:bg-emerald-400 hover:scale-105 transition-all border border-emerald-400"
            >
              <ArrowRight className="h-5 w-5" /> Voir le marché
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute right-20 bottom-10">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
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
          {/* Total Listings */}
          <div className="flex items-center gap-4 rounded-full bg-white px-6 py-4 shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-default">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Annonces</p>
              <h3 className="text-xl font-extrabold text-gray-900 leading-none">{stats.totalListings}</h3>
            </div>
          </div>

          {/* Approved */}
          <div className="flex items-center gap-4 rounded-full bg-white px-6 py-4 shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-default">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Approuvées</p>
              <h3 className="text-xl font-extrabold text-gray-900 leading-none">{stats.approvedListings}</h3>
            </div>
          </div>

          {/* Pending */}
          <div className="flex items-center gap-4 rounded-full bg-white px-6 py-4 shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-default">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">En attente</p>
              <h3 className="text-xl font-extrabold text-gray-900 leading-none">{stats.pendingListings}</h3>
            </div>
          </div>

          {/* Views */}
          <div className="flex items-center gap-4 rounded-full bg-white px-6 py-4 shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-default">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-purple-50 text-purple-600">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vues totales</p>
              <h3 className="text-xl font-extrabold text-gray-900 leading-none">{stats.totalViews}</h3>
            </div>
          </div>
        </div>
      ) : null}

      {/* Quick Access Cards */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-extrabold text-gray-900">Accès Rapide</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <Link href="/seller/my-listings" className="group flex flex-col rounded-3xl bg-white p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-gray-100 mb-4">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80" alt="Listings" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-emerald-600">
              Mes Annonces
            </div>
          </div>
          <div className="px-2 pb-2">
            <h4 className="font-extrabold text-gray-900 text-lg mb-1">Gérer vos Annonces</h4>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                <Tag className="h-3 w-3" />
              </span>
              Ajouter, modifier et suivre vos biens
            </p>
          </div>
        </Link>

        <Link href="/sales" className="group flex flex-col rounded-3xl bg-white p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-gray-100 mb-4">
            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=80" alt="Market" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-blue-600">
              Marché
            </div>
          </div>
          <div className="px-2 pb-2">
            <h4 className="font-extrabold text-gray-900 text-lg mb-1">Explorer le Marché</h4>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                <Eye className="h-3 w-3" />
              </span>
              Voir toutes les annonces publiées
            </p>
          </div>
        </Link>
      </div>
      
    </DashboardShell>
  );
}
