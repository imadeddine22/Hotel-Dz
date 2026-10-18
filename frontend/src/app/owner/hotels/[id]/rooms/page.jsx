'use client';

import { useEffect, useId, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Trash2, Pencil, Users, BedDouble, Image as ImageIcon, X } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import ImageUploader from '@/components/ImageUploader';
import api, { getImageUrl } from '@/lib/api';
import { formatDZD } from '@/lib/data';

import { useT } from '@/lib/i18n/useT';
import DiscountFields from '@/components/DiscountFields';
const ROOM_TYPES = ['single', 'double', 'suite', 'family'];
const ROOM_TYPE_LABELS = { single: 'Simple', double: 'Double', suite: 'Suite', family: 'Familiale' };
const EMPTY_ROOM = { type: 'double', title: '', pricePerNight: '', capacity: 2, bedsCount: 1, quantity: 1, amenities: '', discountPercent: 0, discountUntil: '' };

export default function ManageRoomsPage() {
  const { t } = useT();
  const { id } = useParams();
  const [rooms, setRooms] = useState([]);
  const [currency, setCurrency] = useState('DZD');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_ROOM);
  const [editingId, setEditingId] = useState(null); // room being edited; null = adding a new one
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try { const { data } = await api.get(`/hotels/${id}/rooms`, { localize: false }); setRooms(data.rooms); setCurrency(data.currency || 'DZD'); } catch (e) { setError(e.message); }
  };
  useEffect(() => { load(); }, [id]);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_ROOM);
    setFiles([]);
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setForm({
      type: r.type, title: r.title, pricePerNight: r.pricePerNight, capacity: r.capacity,
      bedsCount: r.bedsCount ?? 1, quantity: r.quantity, amenities: (r.amenities || []).join(', '),
      discountPercent: r.discountPercent || 0, discountUntil: r.discountUntil ? String(r.discountUntil).slice(0, 10) : '',
    });
    setFiles([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveRoom = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('images', f));
      const opts = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingId) await api.put(`/rooms/${editingId}`, fd, opts);
      else await api.post(`/hotels/${id}/rooms`, fd, opts);
      closeForm();
      load();
    } catch (err) { setError(err.message); }
  };

  const remove = async (rid) => {
    if (!confirm(t('Supprimer cette chambre ?'))) return;
    try { await api.delete(`/rooms/${rid}`); load(); } catch (e) { alert(e.message); }
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <DashboardShell role="owner" title={t('Gérer les chambres')}>
      <div className="mb-6 flex justify-end">
        <button onClick={() => (showForm ? closeForm() : setShowForm(true))} className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
          <Plus className="h-4 w-4" /> {showForm ? t('Fermer') : t('Ajouter une chambre')}
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      {showForm && (
        <form onSubmit={saveRoom} className="mb-6 grid gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sm:grid-cols-2">
          <h2 className="sm:col-span-2 text-lg font-bold text-gray-900">{editingId ? t('Modifier la chambre') : t('Nouvelle chambre')}</h2>
          <div>
            <label htmlFor="room-type" className="mb-1 block text-sm font-medium text-gray-700">{t('Type')}</label>
            <select id="room-type" value={form.type} onChange={(e) => set('type', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-brand-500">
              {ROOM_TYPES.map((t) => <option key={t} value={t}>{ROOM_TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <Field label={t('Titre')} value={form.title} onChange={(v) => set('title', v)} />
          <Field label={`${t('Prix / nuit')} (${currency})`} type="number" value={form.pricePerNight} onChange={(v) => set('pricePerNight', v)} />
          <DiscountFields percent={form.discountPercent} until={form.discountUntil} onChange={(d) => setForm((f) => ({ ...f, ...d }))} />
          <Field label={t('Capacité')} type="number" value={form.capacity} onChange={(v) => set('capacity', v)} />
          <div>
            <label htmlFor="room-beds" className="mb-1 block text-sm font-medium text-gray-700">{t('Nombre de lits')}</label>
            <select id="room-beds" value={form.bedsCount} onChange={(e) => set('bedsCount', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-brand-500">
              <option value={1}>{t('1 lit')}</option>
              <option value={2}>{t('2 lits')}</option>
              <option value={3}>{t('3 lits')}</option>
              <option value={4}>{t('4 lits')}</option>
              <option value={5}>{t('5 lits')}</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">{t('Permet aux clients de filtrer (1 lit, 2 lits, 3+ lits)')}</p>
          </div>
          <Field label={t('Quantité disponible')} type="number" value={form.quantity} onChange={(v) => set('quantity', v)} />
          <Field label={t('Équipements (virgules)')} value={form.amenities} onChange={(v) => set('amenities', v)} required={false} />

          {/* Photo de la chambre */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {editingId ? t('Ajouter des photos') : t('Photos de la chambre (la première sera principale)')}
            </label>
            <ImageUploader 
              onChange={(selectedFiles) => setFiles(Array.from(selectedFiles))} 
              maxFiles={6} 
            />
          </div>

          <div className="sm:col-span-2">
            <button className="rounded-lg bg-brand-500 px-6 py-2.5 font-semibold text-white hover:bg-brand-600">
              {editingId ? t('Enregistrer les modifications') : t('Ajouter la chambre')}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => (
          <div key={r._id} className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition hover:shadow-md">
            {r.images?.[0]?.url ? (
              <img src={getImageUrl(r.images[0].url)} alt={t(r.title)} className="h-32 w-full object-cover" />
            ) : (
              <div className="flex h-32 w-full items-center justify-center bg-gray-50 text-gray-300">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-gray-900">{t(r.title)}</h3>
              <p className="text-xs text-gray-400">{ROOM_TYPE_LABELS[r.type] || r.type}</p>
              <p className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" />{r.capacity}</span>
                <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{r.bedsCount}</span>
                <span>x{r.quantity}</span>
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold text-brand-600">{formatDZD(r.pricePerNight, currency)}</span>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(r)} aria-label={t('Modifier {title}', { title: r.title })} title={t('Modifier')}
                    className="grid h-9 w-9 place-items-center rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(r._id)} aria-label={t('Supprimer {title}', { title: r.title })} title={t('Supprimer')}
                    className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {rooms.length === 0 && <p className="text-gray-500">{t('Aucune chambre.')}</p>}
      </div>
    </DashboardShell>
  );
}

function Field({ label, value, onChange, type = 'text', required = true }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input id={id} type={type} required={required} min={type === 'number' ? 0 : undefined} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500" />
    </div>
  );
}
