'use client';

import { useEffect, useState } from 'react';
import { Check, X, MapPin, Star, Clock } from 'lucide-react';
import api from '@/lib/api';

export default function AdminApprovalsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/hotels/pending');
      setHotels(data.hotels);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (id, action) => {
    try {
      await api.put(`/admin/hotels/${id}/${action}`);
      setHotels((h) => h.filter((x) => x._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Approbations</h1>
        <p className="admin-page-subtitle">
          Hôtels en attente de validation · {hotels.length} en file
        </p>
      </div>

      {loading ? (
        <div className="admin-approval-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="admin-approval-card">
              <div className="admin-skeleton" style={{ width: 200, height: 140, borderRadius: 12, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="admin-skeleton" style={{ width: '60%', height: 20 }} />
                <div className="admin-skeleton" style={{ width: '40%', height: 14 }} />
                <div className="admin-skeleton" style={{ width: '80%', height: 14 }} />
                <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                  <div className="admin-skeleton" style={{ width: 100, height: 38 }} />
                  <div className="admin-skeleton" style={{ width: 80, height: 38 }} />
                </div>
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
              <Check />
            </div>
            <p className="admin-empty-title">Tout est approuvé ! 🎉</p>
            <p className="admin-empty-desc">Aucun hôtel en attente de validation</p>
          </div>
        </div>
      ) : (
        <div className="admin-approval-grid">
          {hotels.map((h) => (
            <div key={h._id} className="admin-approval-card">
              <img
                src={h.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80'}
                alt={h.name}
                className="admin-approval-img"
              />
              <div className="admin-approval-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h3 className="admin-approval-name">{h.name}</h3>
                  <span className="admin-badge pending">
                    <Clock style={{ width: 12, height: 12, marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
                    En attente
                  </span>
                </div>
                <p className="admin-approval-location">
                  <MapPin /> {h.city}, {h.wilaya}
                </p>
                <p className="admin-approval-owner">
                  Propriétaire : <strong>{h.owner?.fullName}</strong> ({h.owner?.email})
                </p>
                {h.description && (
                  <p className="admin-approval-desc">{h.description}</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {h.starRating && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, color: '#f59e0b' }}>
                      <Star style={{ width: 14, height: 14, fill: '#f59e0b' }} /> {h.starRating} étoiles
                    </span>
                  )}
                  {h.type && (
                    <span className="admin-badge customer">{h.type}</span>
                  )}
                </div>
                <div className="admin-approval-actions">
                  <button onClick={() => act(h._id, 'approve')} className="admin-btn admin-btn-approve">
                    <Check /> Approuver
                  </button>
                  <button onClick={() => act(h._id, 'reject')} className="admin-btn admin-btn-reject">
                    <X /> Rejeter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
