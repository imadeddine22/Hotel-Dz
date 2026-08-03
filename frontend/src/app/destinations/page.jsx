'use client';

import { useState, useMemo } from 'react';
import { Search, MapPin, Compass } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WilayaCard from '@/components/WilayaCard';
import { useWilayas } from '@/hooks/useWilayas';

export default function DestinationsPage() {
  const { wilayas, loading } = useWilayas();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return wilayas;
    const q = search.toLowerCase();
    return wilayas.filter((w) => w.toLowerCase().includes(q));
  }, [wilayas, search]);

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />

      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0e7490 0%, #06b6d4 40%, #22d3ee 100%)',
          padding: '56px 24px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', top: 30, left: '50%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <span
              style={{
                display: 'grid', placeItems: 'center', width: 48, height: 48,
                borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff',
              }}
            >
              <Compass size={24} />
            </span>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>
                Explorez l'Algérie
              </h1>
              <p style={{ color: '#cffafe', fontSize: 15, marginTop: 4, fontWeight: 500 }}>
                Choisissez une wilaya pour découvrir ses hôtels et maisons
              </p>
            </div>
          </div>

          {/* Search */}
          <div
            style={{
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#fff',
              borderRadius: 14,
              padding: '6px 6px 6px 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              maxWidth: 500,
            }}
          >
            <Search size={18} color="#06b6d4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une wilaya..."
              style={{
                flex: 1, border: 'none', outline: 'none', fontSize: 14,
                background: 'transparent', color: '#1e293b',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  background: 'none', border: 'none', color: '#94a3b8',
                  cursor: 'pointer', fontSize: 18, padding: '0 8px',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Wilayas Grid */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={20} color="#06b6d4" />
              Les 58 Wilayas
              <span style={{
                background: '#e0f7fa', color: '#0891b2', fontSize: 13,
                fontWeight: 700, padding: '2px 10px', borderRadius: 999,
              }}>
                {filtered.length}
              </span>
            </span>
          </h2>
        </div>

        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16,
          }}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 18, height: 120,
                  background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <MapPin size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: 16, fontWeight: 600 }}>Aucune wilaya trouvée</p>
            <p style={{ fontSize: 14 }}>Essayez un autre nom</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            {filtered.map((name, idx) => (
              <WilayaCard key={name} name={name} index={idx} />
            ))}
          </div>
        )}
      </section>

      <Footer />

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </main>
  );
}
