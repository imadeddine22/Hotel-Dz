'use client';

import { useEffect, useState } from 'react';
import { Plus, MapPin, Trash2, BedDouble, Bath, Users, X, Home, Pencil } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import MapPicker from '@/components/MapPicker';
import api from '@/lib/api';

const STATUS = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-600',
};

const HOUSE_TYPES = ['Villa', 'Appartement', 'Maison', 'Chalet', 'Studio', 'Duplex', 'Riad', 'Ferme'];
const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar',
  'Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger',
  'Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma',
  'Constantine','Médéa','Mostaganem',"M'Sila",'Mascara','Ouargla','Oran','El Bayadh',
  'Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt',
  'El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma',
  'Aïn Témouchent','Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar',
  'Ouled Djellal','Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet',
  "El M'Ghair",'El Meniaa'
];

const emptyForm = {
  name: '', description: '', wilaya: '', city: '', address: '',
  type: 'Maison', rooms: 1, bathrooms: 1, capacity: 2,
  pricePerNight: '', amenities: '', lat: '', lng: '',
};

export default function MyHousesPage() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const openEdit = (house) => {
    setForm({
      name: house.name, description: house.description || '', wilaya: house.wilaya,
      city: house.city, address: house.address || '', type: house.type,
      rooms: house.rooms, bathrooms: house.bathrooms, capacity: house.capacity,
      pricePerNight: house.pricePerNight, amenities: house.amenities?.join(', ') || '',
      lat: house.coordinates?.lat ?? '', lng: house.coordinates?.lng ?? ''
    });
    setEditingId(house._id);
    setShowModal(true);
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/houses/my/list');
      setHouses(data.houses);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm('Supprimer cette maison ?')) return;
    try { await api.delete(`/houses/${id}`); load(); } catch (e) { alert(e.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => payload.append(k, v));
      if (files) {
        Array.from(files).forEach((f) => payload.append('images', f));
      }
      
      if (editingId) {
        await api.put(`/houses/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/houses', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      
      setShowModal(false);
      setForm(emptyForm);
      setFiles(null);
      setEditingId(null);
      load();
    } catch (e) {
      setFormError(e.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell role="owner" title="Mes maisons">
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => { setEditingId(null); setForm(emptyForm); setShowModal(true); }}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" /> Ajouter une maison
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-red-600">{error}</p>
      ) : houses.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card">
          <Home className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-400">Aucune maison. Ajoutez votre première maison.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {houses.map((h) => (
            <div key={h._id} className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="relative h-40">
                {h.images?.[0]?.url ? (
                  <img src={h.images[0].url} alt={h.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-purple-50">
                    <Home className="h-12 w-12 text-purple-200" />
                  </div>
                )}
                <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS[h.status]}`}>
                  {h.status}
                </span>
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-purple-600">
                  {h.type}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{h.name}</h3>
                <p className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" /> {h.city}, {h.wilaya}
                </p>
                <div className="mt-2 flex gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {h.rooms} ch.</span>
                  <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {h.bathrooms} SDB</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {h.capacity} pers.</span>
                </div>
                {h.pricePerNight > 0 && (
                  <p className="mt-2 font-bold text-purple-600">
                    {h.pricePerNight.toLocaleString('fr-DZ')} DZD<span className="text-xs font-normal text-gray-400">/nuit</span>
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEdit(h)} className="grid w-10 place-items-center rounded-lg bg-gray-50 py-2 text-gray-500 hover:bg-gray-100">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(h._id)} className="grid w-10 place-items-center rounded-lg bg-red-50 py-2 text-red-500 hover:bg-red-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add House Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 600,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '22px 26px', borderBottom: '1px solid #f1f5f9',
              position: 'sticky', top: 0, background: '#fff', borderRadius: '20px 20px 0 0', zIndex: 10
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
                  {editingId ? 'Modifier la maison' : 'Ajouter une maison'}
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#94a3b8' }}>Votre maison sera soumise pour approbation</p>
              </div>
              <button onClick={() => { setShowModal(false); setFormError(''); setForm(emptyForm); setFiles(null); setEditingId(null); }}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#64748b' }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {formError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Nom *</label>
                  <input required style={inputStyle} placeholder="ex: Villa Yasmine" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Type *</label>
                  <select required style={inputStyle} value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {HOUSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Wilaya *</label>
                  <select required style={inputStyle} value={form.wilaya}
                    onChange={(e) => setForm({ ...form, wilaya: e.target.value })}>
                    <option value="">Choisir</option>
                    {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Ville *</label>
                  <input required style={inputStyle} placeholder="ex: Alger Centre" value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Prix/nuit (DZD) *</label>
                  <input type="number" min="0" required style={inputStyle} placeholder="5000" value={form.pricePerNight}
                    onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Chambres</label>
                  <input type="number" min="1" style={inputStyle} value={form.rooms}
                    onChange={(e) => setForm({ ...form, rooms: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>SDB</label>
                  <input type="number" min="1" style={inputStyle} value={form.bathrooms}
                    onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Capacité</label>
                  <input type="number" min="1" style={inputStyle} value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Adresse</label>
                  <input style={inputStyle} placeholder="Adresse" value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Décrivez votre maison..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Équipements (séparés par virgule)</label>
                  <input style={inputStyle} placeholder="Wi-Fi, Piscine, Parking..." value={form.amenities}
                    onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Localisation sur la carte</label>
                  <MapPicker
                    value={{ lat: form.lat, lng: form.lng }}
                    onChange={(lat, lng) => setForm((f) => ({ ...f, lat: lat ?? '', lng: lng ?? '' }))}
                    accent="#7c3aed"
                  />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Photos</label>
                  <input type="file" multiple accept="image/*" style={inputStyle}
                    onChange={(e) => setFiles(e.target.files)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                <button type="button"
                  onClick={() => { setShowModal(false); setFormError(''); setForm(emptyForm); setFiles(null); setEditingId(null); }}
                  style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  style={{
                    padding: '10px 24px', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: submitting ? 0.7 : 1
                  }}>
                  {submitting ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0',
  fontSize: 14, color: '#1e293b', outline: 'none', background: '#f8fafc', boxSizing: 'border-box',
};
