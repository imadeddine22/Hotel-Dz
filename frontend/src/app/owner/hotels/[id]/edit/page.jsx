'use client';

import { useId, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import MapPicker from '@/components/MapPicker';
import ImageUploader from '@/components/ImageUploader';
import { useWilayas, regionsFor } from '@/hooks/useWilayas';
import CommuneDatalist from '@/components/CommuneDatalist';
import api from '@/lib/api';

import { useT } from '@/lib/i18n/useT';
import CountrySelect from '@/components/CountrySelect';
import { currencyOf } from '@/lib/countries';
import PoliciesFields, { DEFAULT_POLICIES, policiesOf } from '@/components/PoliciesFields';
import { MULTI_COUNTRY } from '@/lib/countries';
const TYPES = ['Luxe', 'Affaires', 'Balnéaire', 'Riad', 'Boutique', 'Montagne', 'Désert', 'Appart-hôtel', 'Économique'];

export default function EditHotelPage() {
  const { t } = useT();
  const router = useRouter();
  const { id } = useParams();
  const { wilayas } = useWilayas();
  const [form, setForm] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHotel = async () => {
      try {
        // localize: false → the form must edit the original text, not its translation
        const { data } = await api.get(`/hotels/${id}`, { localize: false });
        const h = data.hotel;
        setForm({
          name: h.name, description: h.description || '', country: h.country || 'DZ', wilaya: h.wilaya,
          city: h.city, address: h.address || '', type: h.type,
          // Must be loaded too: the form re-sends every field, so missing ones were overwritten on save
          starRating: h.starRating ?? 3,
          amenities: (h.amenities || []).join(', '),
          lat: h.coordinates?.lat ?? '', lng: h.coordinates?.lng ?? '',
          suitableFor: h.suitableFor || [],
          policies: policiesOf(h),
          existingImages: h.images || []
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadHotel();
  }, [id]);

  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'suitableFor') fd.append(k, v.join(','));
        else if (k === 'policies') fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      files.forEach((f) => fd.append('images', f));
      await api.put(`/hotels/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      router.push('/owner/my-hotels');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <DashboardShell role="owner" title={t('Modifier l\'hôtel')}><p className="text-gray-500">{t('Chargement...')}</p></DashboardShell>;
  if (!form) return <DashboardShell role="owner" title={t('Modifier l\'hôtel')}><p className="rounded-lg bg-red-50 px-4 py-3 text-red-600 border border-red-100">{error}</p></DashboardShell>;

  return (
    <DashboardShell role="owner" title={t('Modifier l\'hôtel')}>
      <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}

        <Input label={t('Nom de l\'hôtel')} value={form.name} onChange={(v) => set('name', v)} />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{t('Description')}</label>
          <textarea
            value={form.description} onChange={(e) => set('description', e.target.value)} rows={3}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {MULTI_COUNTRY && (
<div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('Pays')}</label>
            <CountrySelect value={form.country} onChange={(c) => setForm((f) => ({ ...f, country: c, wilaya: regionsFor(c, wilayas)[0] || '' }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-brand-500" />
          </div>
)}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('Wilaya')}</label>
            <select value={form.wilaya} onChange={(e) => set('wilaya', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-brand-500">
              {regionsFor(form.country, wilayas).map((w) => <option key={w} value={w}>{t(w)}</option>)}
            </select>
          </div>
          <Input label={t('Ville / Commune')} value={form.city} onChange={(v) => set('city', v)} list="hotel-communes" placeholder={t('Choisissez ou saisissez une commune')} />
          <CommuneDatalist id="hotel-communes" wilaya={form.wilaya} />
        </div>

        <Input label={t('Adresse')} value={form.address} onChange={(v) => set('address', v)} required={false} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('Type')}</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-brand-500">
              {TYPES.map((item) => <option key={item} value={item}>{t(item)}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('Étoiles')}</label>
            <select value={form.starRating} onChange={(e) => set('starRating', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-brand-500">
              {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s} ★</option>)}
            </select>
          </div>
        </div>

        <Input label={t('Équipements (séparés par des virgules)')} value={form.amenities}
          onChange={(v) => set('amenities', v)} required={false} placeholder={t('Wifi, Parking, Piscine')} />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{t('Idéal pour (Cochez les options applicables)')}</label>
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
          <label className="mb-1 block text-sm font-medium text-gray-700">{t('Localisation sur la carte')}</label>
          <MapPicker
            value={{ lat: form.lat, lng: form.lng }}
            onChange={(lat, lng) => setForm((f) => ({ ...f, lat: lat ?? '', lng: lng ?? '' }))}
            accent="#00bcd4"
          />
        </div>

        <PoliciesFields value={form.policies} onChange={(policies) => setForm((f) => ({ ...f, policies }))} />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{t('Photos (la première sera la photo principale)')}</label>
          <ImageUploader 
            onChange={(selectedFiles) => setFiles(Array.from(selectedFiles))} 
            maxFiles={6}
            existingImages={form.existingImages || []}
          />
        </div>

        <button disabled={saving}
          className="w-full rounded-lg bg-brand-500 py-3 font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {saving ? t('Enregistrement...') : t('Mettre à jour l\'hôtel')}
        </button>
      </form>
    </DashboardShell>
  );
}

function Input({ label, value, onChange, type = 'text', required = true, placeholder, list }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input id={id} type={type} required={required} value={value} placeholder={placeholder} list={list} autoComplete={list ? 'off' : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500" />
    </div>
  );
}
