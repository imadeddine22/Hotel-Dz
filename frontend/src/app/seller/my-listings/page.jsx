'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Pencil, Trash2, X, Eye, Clock, CheckCircle, XCircle, MapPin, ChevronDown, Tag } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import ImageUploader from '@/components/ImageUploader';
import api, { getImageUrl } from '@/lib/api';
import { formatDZD } from '@/lib/data';
import { useWilayas } from '@/hooks/useWilayas';

const PROPERTY_TYPES = ['Appartement', 'Villa', 'Maison', 'Duplex', 'Studio', 'Terrain', 'Local commercial', 'Ferme', 'Chalet', 'Immeuble'];

const STATUS_BADGE = {
  pending: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  approved: { label: 'Approuvée', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  rejected: { label: 'Rejetée', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
};

const emptyForm = {
  title: '', description: '', wilaya: '', city: '', address: '',
  type: 'Appartement', price: '', area: '', rooms: '1', bathrooms: '1',
  amenities: '', contactPhone: '', contactEmail: '',
};

function SellerListingsContent() {
  const params = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(params.get('new') === '1');
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [openSelect, setOpenSelect] = useState(null); // 'type' | 'wilaya'
  const { wilayas } = useWilayas();

  const fetchListings = async () => {
    try {
      const { data } = await api.get('/seller/listings');
      setListings(data.listings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setFiles([]);
    setExistingImages([]);
    setShowForm(true);
  };

  const openEdit = (listing) => {
    setEditId(listing._id);
    setForm({
      title: listing.title || '',
      description: listing.description || '',
      wilaya: listing.wilaya || '',
      city: listing.city || '',
      address: listing.address || '',
      type: listing.type || 'Appartement',
      price: listing.price?.toString() || '',
      area: listing.area?.toString() || '',
      rooms: listing.rooms?.toString() || '1',
      bathrooms: listing.bathrooms?.toString() || '1',
      amenities: (listing.amenities || []).join(', '),
      contactPhone: listing.contactPhone || '',
      contactEmail: listing.contactEmail || '',
    });
    setFiles([]);
    setExistingImages(listing.images || []);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Client-side validation
    if (!form.wilaya) {
      setError('Veuillez sélectionner une wilaya.');
      setSaving(false);
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      // files is always an array of File objects
      files.forEach((f) => fd.append('images', f));

      if (editId) {
        await api.put(`/seller/listings/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/seller/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      setFiles([]);
      fetchListings();
    } catch (err) {
      // api interceptor already extracts the message into err.message
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette annonce ?')) return;
    try {
      await api.delete(`/seller/listings/${id}`);
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression.');
    }
  };

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  return (
    <DashboardShell role="seller" title="Mes Annonces">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Mes Annonces</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos biens immobiliers à vendre</p>
        </div>
        {!showForm && (
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-bold text-white shadow-md hover:bg-emerald-700 transition-all hover:scale-105"
          >
            <Plus className="h-5 w-5" /> Nouvelle annonce
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">{error}</div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              {editId ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
            </h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="rounded-full p-2 hover:bg-gray-100 transition">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Titre *</label>
                <input
                  required value={form.title} onChange={(e) => set('title', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-emerald-500 transition"
                  placeholder="Ex: Villa 4 pièces vue mer"
                />
              </div>
              <div className="relative">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Type *</label>
                <div 
                  onClick={() => setOpenSelect(openSelect === 'type' ? null : 'type')}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none bg-white cursor-pointer flex items-center justify-between transition focus-within:border-emerald-500 shadow-sm"
                >
                  <span className="font-serif font-bold text-slate-800">{form.type || 'Sélectionner...'}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${openSelect === 'type' ? 'rotate-180' : ''}`} />
                </div>
                {openSelect === 'type' && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-60 overflow-y-auto rounded-xl bg-white py-1.5 shadow-xl border border-gray-100">
                    {PROPERTY_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          set('type', t);
                          setOpenSelect(null);
                        }}
                        className={`w-full text-left px-5 py-2.5 text-sm font-serif font-bold transition-all border-l-2 ${
                          form.type === t
                            ? 'text-teal-600 border-teal-500 bg-teal-50/30'
                            : 'text-slate-800 border-transparent hover:bg-slate-50/50 hover:text-teal-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Description</label>
              <textarea
                rows={3} value={form.description} onChange={(e) => set('description', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-emerald-500 transition resize-none"
                placeholder="Décrivez le bien..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Wilaya *</label>
                <div 
                  onClick={() => setOpenSelect(openSelect === 'wilaya' ? null : 'wilaya')}
                  className={`w-full rounded-xl border px-4 py-2.5 outline-none bg-white cursor-pointer flex items-center justify-between transition shadow-sm ${
                    !form.wilaya ? 'border-red-300' : 'border-gray-200 focus-within:border-emerald-500'
                  }`}
                >
                  <span className={`font-serif font-bold ${form.wilaya ? 'text-slate-800' : 'text-gray-400'}`}>
                    {form.wilaya || 'Sélectionner...'}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${openSelect === 'wilaya' ? 'rotate-180' : ''}`} />
                </div>
                {openSelect === 'wilaya' && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-60 overflow-y-auto rounded-xl bg-white py-1.5 shadow-xl border border-gray-100">
                    {wilayas?.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => {
                          set('wilaya', w);
                          setOpenSelect(null);
                        }}
                        className={`w-full text-left px-5 py-2.5 text-sm font-serif font-bold transition-all border-l-2 ${
                          form.wilaya === w
                            ? 'text-teal-600 border-teal-500 bg-teal-50/30'
                            : 'text-slate-800 border-transparent hover:bg-slate-50/50 hover:text-teal-600'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Ville *</label>
                <input
                  required value={form.city} onChange={(e) => set('city', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-emerald-500 transition"
                  placeholder="Ex: Hydra"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Adresse</label>
                <input
                  value={form.address} onChange={(e) => set('address', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-emerald-500 transition"
                  placeholder="Ex: Rue..."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Prix (DZD) *</label>
                <input
                  type="number" required min="0" value={form.price} onChange={(e) => set('price', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-emerald-500 transition"
                  placeholder="15000000"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Surface (m²)</label>
                <input
                  type="number" min="0" value={form.area} onChange={(e) => set('area', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-emerald-500 transition"
                  placeholder="120"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Pièces</label>
                <input
                  type="number" min="0" value={form.rooms} onChange={(e) => set('rooms', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Salles de bain</label>
                <input
                  type="number" min="0" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Téléphone de contact</label>
                <input
                  value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-emerald-500 transition"
                  placeholder="0555 123 456"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Email de contact</label>
                <input
                  type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-emerald-500 transition"
                  placeholder="vendeur@email.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Équipements (séparés par des virgules)</label>
              <input
                value={form.amenities} onChange={(e) => set('amenities', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-emerald-500 transition"
                placeholder="Garage, Jardin, Piscine, Ascenseur..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Photos</label>
              <ImageUploader
                key={editId || 'new'}
                existingImages={existingImages}
                onChange={(fileList) => setFiles(Array.from(fileList))}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit" disabled={saving}
                className="rounded-full bg-emerald-600 px-8 py-3 font-bold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {saving ? 'Enregistrement...' : editId ? 'Mettre à jour' : 'Publier l\'annonce'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditId(null); }}
                className="rounded-full border border-gray-200 px-6 py-3 font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listings Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-gray-100">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-50">
            <Tag className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune annonce</h3>
          <p className="text-sm text-gray-500 mb-6">Commencez par publier votre première annonce immobilière</p>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-bold text-white shadow-md hover:bg-emerald-700 transition"
          >
            <Plus className="h-5 w-5" /> Publier une annonce
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const badge = STATUS_BADGE[listing.status] || STATUS_BADGE.pending;
            const BadgeIcon = badge.icon;
            return (
              <div key={listing._id} className="group rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                {/* Image */}
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  {listing.images?.[0] ? (
                    <img src={getImageUrl(listing.images[0].url)} alt={listing.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <Tag className="h-10 w-10" />
                    </div>
                  )}
                  <div className={`absolute top-3 left-3 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${badge.color}`}>
                    <BadgeIcon className="h-3 w-3" /> {badge.label}
                  </div>
                  <div className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-emerald-600">
                    {listing.type}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 truncate">{listing.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <MapPin className="h-3.5 w-3.5" /> {listing.city}, {listing.wilaya}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-lg font-extrabold text-emerald-600">{formatDZD(listing.price)}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Eye className="h-3.5 w-3.5" /> {listing.views || 0}
                    </div>
                  </div>

                  {listing.area > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{listing.area} m² · {listing.rooms} pcs · {listing.bathrooms} sdb</p>
                  )}

                  {listing.status === 'rejected' && (
                    <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                      <span className="font-bold block text-red-800">⚠️ Annonce rejetée par l'administration :</span>
                      <p className="mt-1 text-red-600 font-medium italic">
                        "{listing.rejectionReason || 'Aucun motif spécifié. Veuillez réviser les informations.'}"
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openEdit(listing)}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(listing._id)}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-red-100 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}

export default function SellerListings() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">Chargement...</div>}>
      <SellerListingsContent />
    </Suspense>
  );
}
