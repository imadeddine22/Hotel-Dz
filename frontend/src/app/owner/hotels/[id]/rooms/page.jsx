'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Trash2, Users, BedDouble, Image as ImageIcon, X } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import ImageUploader from '@/components/ImageUploader';
import api from '@/lib/api';
import { formatDZD } from '@/lib/data';

const ROOM_TYPES = ['single', 'double', 'suite', 'family'];

export default function ManageRoomsPage() {
  const { id } = useParams();
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'double', title: '', pricePerNight: '', capacity: 2, bedsCount: 1, quantity: 1, amenities: '' });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try { const { data } = await api.get(`/hotels/${id}/rooms`); setRooms(data.rooms); } catch (e) { setError(e.message); }
  };
  useEffect(() => { load(); }, [id]);

  const addRoom = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('images', f));
      await api.post(`/hotels/${id}/rooms`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false);
      setForm({ type: 'double', title: '', pricePerNight: '', capacity: 2, bedsCount: 1, quantity: 1, amenities: '' });
      setFiles([]);
      load();
    } catch (err) { setError(err.message); }
  };

  const remove = async (rid) => {
    if (!confirm('Supprimer cette chambre ?')) return;
    try { await api.delete(`/rooms/${rid}`); load(); } catch (e) { alert(e.message); }
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <DashboardShell role="owner" title="Gérer les chambres">
      <div className="mb-6 flex justify-end">
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
          <Plus className="h-4 w-4" /> {showForm ? 'Fermer' : 'Ajouter une chambre'}
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      {showForm && (
        <form onSubmit={addRoom} className="mb-6 grid gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 capitalize outline-none focus:border-brand-500">
              {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Field label="Titre" value={form.title} onChange={(v) => set('title', v)} />
          <Field label="Prix / nuit (DZD)" type="number" value={form.pricePerNight} onChange={(v) => set('pricePerNight', v)} />
          <Field label="Capacité" type="number" value={form.capacity} onChange={(v) => set('capacity', v)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nombre de lits</label>
            <select value={form.bedsCount} onChange={(e) => set('bedsCount', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-brand-500">
              <option value={1}>1 lit</option>
              <option value={2}>2 lits</option>
              <option value={3}>3 lits</option>
              <option value={4}>4 lits</option>
              <option value={5}>5 lits</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">Permet aux clients de filtrer (1 lit, 2 lits, 3+ lits)</p>
          </div>
          <Field label="Quantité disponible" type="number" value={form.quantity} onChange={(v) => set('quantity', v)} />
          <Field label="Équipements (virgules)" value={form.amenities} onChange={(v) => set('amenities', v)} required={false} />

          {/* Photo de la chambre */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Photos de la chambre (la première sera principale)</label>
            <ImageUploader 
              onChange={(selectedFiles) => setFiles(Array.from(selectedFiles))} 
              maxFiles={6} 
            />
          </div>

          <div className="sm:col-span-2">
            <button className="rounded-lg bg-brand-500 px-6 py-2.5 font-semibold text-white hover:bg-brand-600">Enregistrer</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => (
          <div key={r._id} className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition hover:shadow-md">
            {r.images?.[0]?.url ? (
              <img src={r.images[0].url} alt={r.title} className="h-32 w-full object-cover" />
            ) : (
              <div className="flex h-32 w-full items-center justify-center bg-gray-50 text-gray-300">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-gray-900">{r.title}</h3>
              <p className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" />{r.capacity}</span>
                <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{r.bedsCount}</span>
                <span>x{r.quantity}</span>
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold text-brand-600">{formatDZD(r.pricePerNight)}</span>
                <button onClick={() => remove(r._id)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {rooms.length === 0 && <p className="text-gray-500">Aucune chambre.</p>}
      </div>
    </DashboardShell>
  );
}

function Field({ label, value, onChange, type = 'text', required = true }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500" />
    </div>
  );
}
