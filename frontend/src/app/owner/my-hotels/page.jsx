'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, MapPin, Trash2, Pencil } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import api from '@/lib/api';

const STATUS = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-600',
};

const TYPES = ['Luxe', 'Affaires', 'Balnéaire', 'Riad', 'Boutique', 'Montagne', 'Désert', 'Appart-hôtel', 'Économique'];

export default function MyHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = typeFilter ? { type: typeFilter } : {};
      const { data } = await api.get('/hotels/my/list', { params });
      setHotels(data.hotels);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [typeFilter]);

  const remove = async (id) => {
    if (!confirm('Supprimer cet hôtel et toutes ses chambres ?')) return;
    try { await api.delete(`/hotels/${id}`); load(); } catch (e) { alert(e.message); }
  };

  return (
    <DashboardShell role="owner" title="Mes hôtels">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1" style={{ maxWidth: '100%' }}>
          <button
            onClick={() => setTypeFilter('')}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${!typeFilter ? 'bg-brand-500 text-white' : 'border border-gray-200 text-gray-600 bg-white'}`}
          >
            Tous les types
          </button>
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${typeFilter === t ? 'bg-brand-500 text-white' : 'border border-gray-200 text-gray-600 bg-white'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <Link href="/owner/hotels/new" className="shrink-0 flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600">
          <Plus className="h-4 w-4" /> Ajouter un hôtel
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-red-600 border border-red-100">{error}</p>
      ) : hotels.length === 0 ? (
        <p className="text-gray-500">Aucun hôtel. Ajoutez votre premier hôtel.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((h) => (
            <div key={h._id} className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition hover:shadow-md">
              <div className="relative h-40">
                {h.images?.[0]?.url && <img src={h.images[0].url} alt={h.name} className="h-full w-full object-cover" />}
                <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS[h.status]}`}>
                  {h.status}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{h.name}</h3>
                <p className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="h-4 w-4 text-brand-500" /> {h.city}, {h.wilaya}</p>
                <div className="mt-3 flex gap-2">
                  <Link href={`/owner/hotels/${h._id}/rooms`} className="flex-1 rounded-lg bg-brand-50 py-2 text-center text-sm font-semibold text-brand-700 hover:bg-brand-100 transition">
                    Chambres
                  </Link>
                  <Link href={`/owner/hotels/${h._id}/edit`} className="grid w-10 place-items-center rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button onClick={() => remove(h._id)} className="grid w-10 place-items-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
