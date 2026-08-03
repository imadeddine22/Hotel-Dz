'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import MapPicker from '@/components/MapPicker';
import ImageUploader from '@/components/ImageUploader';
import { useWilayas } from '@/hooks/useWilayas';
import api from '@/lib/api';

const TYPES = ['Luxe', 'Affaires', 'Balnéaire', 'Riad', 'Boutique', 'Montagne', 'Désert', 'Appart-hôtel', 'Économique'];

export default function NewHotelPage() {
  const router = useRouter();
  const { wilayas } = useWilayas();
  const [form, setForm] = useState({
    name: '', description: '', wilaya: 'Alger', city: '', address: '',
    type: 'Économique', starRating: 3, amenities: '', lat: '', lng: '', suitableFor: [],
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'suitableFor') fd.append(k, v.join(','));
        else fd.append(k, v);
      });
      files.forEach((f) => fd.append('images', f));
      await api.post('/hotels', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      router.push('/owner/my-hotels');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <DashboardShell role="owner" title="Ajouter un hôtel">
      <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}

        <Input label="Nom de l'hôtel" value={form.name} onChange={(v) => set('name', v)} />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description} onChange={(e) => set('description', e.target.value)} rows={3}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Wilaya</label>
            <select value={form.wilaya} onChange={(e) => set('wilaya', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-brand-500">
              {wilayas.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <Input label="Ville / Commune" value={form.city} onChange={(v) => set('city', v)} />
        </div>

        <Input label="Adresse" value={form.address} onChange={(v) => set('address', v)} required={false} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-brand-500">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Étoiles</label>
            <select value={form.starRating} onChange={(e) => set('starRating', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-brand-500">
              {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s} ★</option>)}
            </select>
          </div>
        </div>

        <Input label="Équipements (séparés par des virgules)" value={form.amenities}
          onChange={(v) => set('amenities', v)} required={false} placeholder="Wifi, Parking, Piscine" />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Idéal pour (Cochez les options applicables)</label>
          <div className="flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            {['Familles', 'Amis', 'Couples', 'Solo', 'Affaires'].map(opt => (
              <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.suitableFor.includes(opt)}
                  onChange={(e) => {
                    if (e.target.checked) set('suitableFor', [...form.suitableFor, opt]);
                    else set('suitableFor', form.suitableFor.filter(x => x !== opt));
                  }}
                /> {opt}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Localisation sur la carte</label>
          <MapPicker
            value={{ lat: form.lat, lng: form.lng }}
            onChange={(lat, lng) => setForm((f) => ({ ...f, lat: lat ?? '', lng: lng ?? '' }))}
            accent="#00bcd4"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Photos (la première sera la photo principale)</label>
          <ImageUploader 
            onChange={(selectedFiles) => setFiles(Array.from(selectedFiles))} 
            maxFiles={6} 
          />
        </div>

        <button disabled={saving}
          className="w-full rounded-lg bg-brand-500 py-3 font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {saving ? 'Enregistrement...' : 'Créer l\'hôtel (en attente d\'approbation)'}
        </button>
      </form>
    </DashboardShell>
  );
}

function Input({ label, value, onChange, type = 'text', required = true, placeholder }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input type={type} required={required} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500" />
    </div>
  );
}
