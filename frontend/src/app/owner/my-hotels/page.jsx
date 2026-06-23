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

export default function MyHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/hotels/my/list');
      setHotels(data.hotels);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm('Supprimer cet hôtel et toutes ses chambres ?')) return;
    try { await api.delete(`/hotels/${id}`); load(); } catch (e) { alert(e.message); }
  };

  return (
    <DashboardShell role="owner" title="Mes hôtels">
      <div className="mb-6 flex justify-end">
        <Link href="/owner/hotels/new" className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
          <Plus className="h-4 w-4" /> Ajouter un hôtel
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-red-600">{error}</p>
      ) : hotels.length === 0 ? (
        <p className="text-gray-400">Aucun hôtel. Ajoutez votre premier hôtel.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((h) => (
            <div key={h._id} className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="relative h-40">
                {h.images?.[0]?.url && <img src={h.images[0].url} alt={h.name} className="h-full w-full object-cover" />}
                <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS[h.status]}`}>
                  {h.status}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-ink">{h.name}</h3>
                <p className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="h-4 w-4" /> {h.city}, {h.wilaya}</p>
                <div className="mt-3 flex gap-2">
                  <Link href={`/owner/hotels/${h._id}/rooms`} className="flex-1 rounded-lg bg-brand-50 py-2 text-center text-sm font-medium text-brand-600 hover:bg-brand-100">
                    Chambres
                  </Link>
                  <Link href={`/owner/hotels/${h._id}/edit`} className="grid w-10 place-items-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button onClick={() => remove(h._id)} className="grid w-10 place-items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
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
