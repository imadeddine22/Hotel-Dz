'use client';

import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, BedDouble, Bath, Users, Home, LayoutGrid, List } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HouseCard from '@/components/HouseCard';
import api from '@/lib/api';
import { useWilayas } from '@/hooks/useWilayas';

const TYPES = ['Villa', 'Appartement', 'Maison', 'Chalet', 'Studio', 'Duplex', 'Riad', 'Ferme'];
// Static WILAYAS list removed, loaded dynamically via useWilayas hook.

const MOCK = [
  { id: 'hm1', name: 'Villa Yasmine', city: 'Alger', wilaya: 'Alger', type: 'Villa', rooms: 4, bathrooms: 2, capacity: 8, pricePerNight: 15000, img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' },
  { id: 'hm2', name: 'Chalet Tikjda', city: 'Bouira', wilaya: 'Bouira', type: 'Chalet', rooms: 3, bathrooms: 1, capacity: 6, pricePerNight: 9000, img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80' },
  { id: 'hm3', name: 'Appartement Vue Mer', city: 'Béjaïa', wilaya: 'Béjaïa', type: 'Appartement', rooms: 2, bathrooms: 1, capacity: 4, pricePerNight: 6000, img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80' },
  { id: 'hm4', name: 'Riad Tlemcen', city: 'Tlemcen', wilaya: 'Tlemcen', type: 'Riad', rooms: 3, bathrooms: 2, capacity: 6, pricePerNight: 11000, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80' },
  { id: 'hm5', name: 'Ferme Oasis Ouargla', city: 'Ouargla', wilaya: 'Ouargla', type: 'Ferme', rooms: 5, bathrooms: 3, capacity: 10, pricePerNight: 8000, img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80' },
  { id: 'hm6', name: 'Studio Moderne Oran', city: 'Oran', wilaya: 'Oran', type: 'Studio', rooms: 1, bathrooms: 1, capacity: 2, pricePerNight: 4500, img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80' },
  { id: 'hm7', name: 'Duplex Constantine', city: 'Constantine', wilaya: 'Constantine', type: 'Duplex', rooms: 3, bathrooms: 2, capacity: 5, pricePerNight: 7500, img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80' },
  { id: 'hm8', name: 'Villa Piscine Tipaza', city: 'Tipaza', wilaya: 'Tipaza', type: 'Villa', rooms: 5, bathrooms: 3, capacity: 10, pricePerNight: 22000, img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80' },
];

export default function HousesPage() {
  const { wilayas } = useWilayas();
  const [filters, setFilters] = useState({ wilaya: '', type: '', q: '', sort: '' });
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [view, setView] = useState('grid');

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await api.get('/houses', { params });
      setHouses(data.houses);
      setUsingMock(false);
    } catch {
      let list = [...MOCK];
      if (filters.type) list = list.filter((h) => h.type === filters.type);
      if (filters.q) list = list.filter((h) => h.name.toLowerCase().includes(filters.q.toLowerCase()));
      if (filters.wilaya) list = list.filter((h) => h.wilaya === filters.wilaya);
      setHouses(list);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHouses(); }, []); // eslint-disable-line

  const normalizeHouse = (h) => ({
    _id: h._id || h.id,
    name: h.name, city: h.city, wilaya: h.wilaya, type: h.type,
    rooms: h.rooms, bathrooms: h.bathrooms, capacity: h.capacity,
    pricePerNight: h.pricePerNight ?? h.price ?? 0,
    images: h.images || (h.img ? [{ url: h.img }] : []),
  });

  return (
    <main className="min-h-screen" style={{ background: '#f8fafc' }}>
      <Navbar />

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)',
        padding: '48px 24px 40px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{
              display: 'grid', placeItems: 'center', width: 44, height: 44,
              borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff'
            }}>
              <Home size={22} />
            </span>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: 0 }}>
              Locations de Maisons
            </h1>
          </div>
          <p style={{ color: '#e9d5ff', marginBottom: 24, fontSize: 15 }}>
            Villas, chalets, appartements et bien plus en Algérie
          </p>

          {/* Search bar */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8,
            background: '#fff', borderRadius: 16, padding: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
              <Search size={18} color="#a855f7" />
              <input
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchHouses()}
                placeholder="Rechercher une maison..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: '#1e293b' }}
              />
            </div>
            <select
              value={filters.wilaya}
              onChange={(e) => setFilters({ ...filters, wilaya: e.target.value })}
              style={{ borderRadius: 10, border: '1px solid #e2e8f0', padding: '8px 12px', fontSize: 13, color: '#374151', background: '#f8fafc' }}
            >
              <option value="">Toutes les wilayas</option>
              {wilayas.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
            <button
              onClick={fetchHouses}
              style={{
                borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff', border: 'none', padding: '10px 24px', fontWeight: 700,
                fontSize: 14, cursor: 'pointer'
              }}
            >
              Rechercher
            </button>
          </div>
        </div>
      </div>

      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {/* Type filters + view toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }} className="no-scrollbar">
            <SlidersHorizontal size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
            <button
              onClick={() => { setFilters({ ...filters, type: '' }); }}
              style={{
                borderRadius: 999, padding: '6px 16px', fontSize: 13, cursor: 'pointer', flexShrink: 0, fontWeight: 500,
                background: !filters.type ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : '#fff',
                color: !filters.type ? '#fff' : '#64748b',
                border: !filters.type ? 'none' : '1px solid #e2e8f0',
              }}
            >
              Tous
            </button>
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setFilters({ ...filters, type: t })}
                style={{
                  borderRadius: 999, padding: '6px 16px', fontSize: 13, cursor: 'pointer', flexShrink: 0, fontWeight: 500,
                  background: filters.type === t ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : '#fff',
                  color: filters.type === t ? '#fff' : '#64748b',
                  border: filters.type === t ? 'none' : '1px solid #e2e8f0',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <button onClick={() => setView('grid')} style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', border: 'none', cursor: 'pointer', background: view === 'grid' ? '#f3e8ff' : '#fff', color: view === 'grid' ? '#7c3aed' : '#94a3b8' }}><LayoutGrid size={18} /></button>
            <button onClick={() => setView('list')} style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', border: 'none', cursor: 'pointer', background: view === 'list' ? '#f3e8ff' : '#fff', color: view === 'list' ? '#7c3aed' : '#94a3b8' }}><List size={18} /></button>
          </div>
        </div>

        {usingMock && (
          <p style={{ marginBottom: 16, background: '#fef3c7', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#92400e' }}>
            API hors ligne — affichage de données de démonstration.
          </p>
        )}

        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>
          Maisons <span style={{ color: '#94a3b8', fontWeight: 400 }}>({houses.length})</span>
        </h2>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
                <div style={{ height: 200, background: '#e2e8f0', animation: 'pulse 1.5s infinite' }} />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ height: 16, background: '#e2e8f0', borderRadius: 8, width: '70%' }} />
                  <div style={{ height: 12, background: '#e2e8f0', borderRadius: 8, width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : houses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <Home size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: 16, fontWeight: 600 }}>Aucune maison trouvée</p>
            <p style={{ fontSize: 14 }}>Modifiez vos filtres ou revenez plus tard</p>
          </div>
        ) : view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {houses.map((h) => <HouseCard key={h._id || h.id} house={normalizeHouse(h)} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {houses.map((h) => <HouseCard key={h._id || h.id} house={normalizeHouse(h)} list />)}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
