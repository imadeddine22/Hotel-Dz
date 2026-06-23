'use client';

import { useEffect, useState } from 'react';
import { MapPin, Star, Trash2, Eye, Building2, Plus, X, CheckCircle, XCircle, Pencil } from 'lucide-react';
import MapPicker from '@/components/MapPicker';
import api from '@/lib/api';
import { formatDZD } from '@/lib/data';

export default function AdminAllHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const WILAYA_NAMES = [
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
    starRating: 3, type: 'Économique', amenities: '', status: 'approved', lat: '', lng: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const openEdit = (hotel) => {
    setForm({
      name: hotel.name, description: hotel.description || '', wilaya: hotel.wilaya,
      city: hotel.city, address: hotel.address || '', type: hotel.type,
      starRating: hotel.starRating, status: hotel.status,
      amenities: hotel.amenities?.join(', ') || '',
      lat: hotel.coordinates?.lat ?? '', lng: hotel.coordinates?.lng ?? ''
    });
    setEditingId(hotel._id);
    setShowModal(true);
  };

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.q = search;
      const { data } = await api.get('/admin/hotels/all', { params });
      setHotels(data.hotels);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Êtes-vous sûr de supprimer "${name}" ?`)) return;
    try {
      await api.delete(`/admin/hotels/${id}`);
      setHotels((h) => h.filter((x) => x._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleStatusChange = async (id, action) => {
    try {
      const { data } = await api.put(`/admin/hotels/${id}/${action}`);
      setHotels((prev) => prev.map((h) => h._id === id ? { ...h, status: data.hotel.status } : h));
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => payload.append(k, v));
      
      if (editingId) {
        const { data } = await api.put(`/admin/hotels/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setHotels((prev) => prev.map(h => h._id === editingId ? data.hotel : h));
      } else {
        const { data } = await api.post('/admin/hotels', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setHotels((prev) => [data.hotel, ...prev]);
      }
      
      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (e) {
      setFormError(e.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="admin-page-title">Tous les hôtels</h1>
          <p className="admin-page-subtitle">Hébergements disponibles sur la plateforme</p>
        </div>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => { setEditingId(null); setForm(emptyForm); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14 }}
        >
          <Plus style={{ width: 18, height: 18 }} /> Ajouter un hôtel
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="admin-table-filters">
          {[
            { label: 'Tous', value: '' },
            { label: 'Approuvé', value: 'approved' },
            { label: 'En attente', value: 'pending' },
            { label: 'Rejeté', value: 'rejected' },
          ].map((f) => (
            <button
              key={f.value}
              className={`admin-filter-btn ${statusFilter === f.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} style={{ marginLeft: 'auto' }}>
          <input
            type="text"
            placeholder="Rechercher un hôtel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
            style={{ width: 240 }}
          />
        </form>
      </div>

      {loading ? (
        <div className="admin-hotels-scroll">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="admin-hotel-card">
              <div className="admin-skeleton" style={{ width: '100%', height: 150 }} />
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="admin-skeleton" style={{ width: '70%', height: 16 }} />
                <div className="admin-skeleton" style={{ width: '50%', height: 12 }} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="admin-error">{error}</div>
      ) : hotels.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <Building2 />
            </div>
            <p className="admin-empty-title">Aucun hôtel trouvé</p>
            <p className="admin-empty-desc">Modifiez vos filtres pour voir plus de résultats</p>
          </div>
        </div>
      ) : (
        <div className="admin-hotels-scroll">
          {hotels.map((h) => (
            <div key={h._id} className="admin-hotel-card">
              <div style={{ position: 'relative' }}>
                <img
                  src={h.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80'}
                  alt={h.name}
                  className="admin-hotel-card-img"
                />
                <span className={`admin-hotel-card-status ${h.status}`} style={{ position: 'absolute', top: 10, right: 10 }}>
                  {h.status === 'approved' ? 'Approuvé' : h.status === 'pending' ? 'En attente' : 'Rejeté'}
                </span>
              </div>
              <div className="admin-hotel-card-body">
                <h4 className="admin-hotel-card-name">{h.name}</h4>
                <p className="admin-hotel-card-location">
                  <MapPin /> {h.city}, {h.wilaya}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  {[...Array(h.starRating || 0)].map((_, i) => (
                    <Star key={i} style={{ width: 13, height: 13, fill: '#f59e0b', color: '#f59e0b' }} />
                  ))}
                  {h.avgRating > 0 && (
                    <span style={{ fontSize: 12, color: '#64748b', marginLeft: 6 }}>{h.avgRating}</span>
                  )}
                </div>
                <div className="admin-hotel-card-footer">
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    {h.owner?.fullName || '—'}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {h.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(h._id, 'approve')}
                          className="admin-btn"
                          style={{ padding: '4px 8px', fontSize: 11, background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', borderRadius: 8 }}
                          title="Approuver"
                        >
                          <CheckCircle style={{ width: 13, height: 13 }} />
                        </button>
                        <button
                          onClick={() => handleStatusChange(h._id, 'reject')}
                          className="admin-btn"
                          style={{ padding: '4px 8px', fontSize: 11, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 8 }}
                          title="Rejeter"
                        >
                          <XCircle style={{ width: 13, height: 13 }} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => openEdit(h)}
                      className="admin-btn"
                      style={{ padding: '4px 10px', fontSize: 11, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8 }}
                      title="Modifier"
                    >
                      <Pencil style={{ width: 14, height: 14 }} />
                    </button>
                    <button
                      onClick={() => handleDelete(h._id, h.name)}
                      className="admin-btn admin-btn-danger"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      title="Supprimer"
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Hotel Modal */}
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
              position: 'sticky', top: 0, background: '#fff', borderRadius: '20px 20px 0 0'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
                  {editingId ? 'Modifier l\'hôtel' : 'Ajouter un hôtel'}
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#94a3b8' }}>Remplissez les informations de l'hôtel</p>
              </div>
              <button onClick={() => { setShowModal(false); setFormError(''); setForm(emptyForm); setEditingId(null); }}
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
                  <label style={labelStyle}>Nom de l'hôtel *</label>
                  <input required style={inputStyle} placeholder="ex: Hôtel El Aurassi" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Type *</label>
                  <select required style={inputStyle} value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {['Luxe','Affaires','Balnéaire','Riad','Boutique','Montagne','Désert','Appart-hôtel','Économique'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Étoiles *</label>
                  <select required style={inputStyle} value={form.starRating}
                    onChange={(e) => setForm({ ...form, starRating: e.target.value })}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Wilaya *</label>
                  <select required style={inputStyle} value={form.wilaya}
                    onChange={(e) => setForm({ ...form, wilaya: e.target.value })}>
                    <option value="">Choisir une wilaya</option>
                    {WILAYA_NAMES.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Ville *</label>
                  <input required style={inputStyle} placeholder="ex: Alger Centre" value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Adresse</label>
                  <input style={inputStyle} placeholder="Adresse complète" value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Décrivez l'hôtel..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Équipements (séparés par virgule)</label>
                  <input style={inputStyle} placeholder="ex: Wi-Fi, Piscine, Restaurant, Spa"
                    value={form.amenities}
                    onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Statut</label>
                  <select style={inputStyle} value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="approved">Approuvé</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Localisation sur la carte</label>
                  <MapPicker
                    value={{ lat: form.lat, lng: form.lng }}
                    onChange={(lat, lng) => setForm((f) => ({ ...f, lat: lat ?? '', lng: lng ?? '' }))}
                    accent="#34c77b"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                <button type="button"
                  onClick={() => { setShowModal(false); setFormError(''); setForm(emptyForm); setEditingId(null); }}
                  style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  className="admin-btn admin-btn-primary"
                  style={{ padding: '10px 24px', fontSize: 14, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Ajouter l\'hôtel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6
};
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0',
  fontSize: 14, color: '#1e293b', outline: 'none', background: '#f8fafc',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
};
