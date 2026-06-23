'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, BedDouble, Bath, Users, Wifi, Home, Star, Phone, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FavoriteButton from '@/components/FavoriteButton';
import LocationMap from '@/components/LocationMap';
import api from '@/lib/api';

const MOCK = {
  name: 'Villa Yasmine', city: 'Alger', wilaya: 'Alger', type: 'Villa',
  rooms: 4, bathrooms: 2, capacity: 8, pricePerNight: 15000,
  description: 'Magnifique villa spacieuse avec jardin et piscine, idéalement située à Alger. Profitez d\'un séjour exceptionnel dans un cadre luxueux avec tous les équipements modernes.',
  amenities: ['Wi-Fi', 'Piscine', 'Climatisation', 'Parking', 'Jardin', 'BBQ', 'Cuisine équipée'],
  images: [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80' }],
  avgRating: 4.7, reviewsCount: 32,
  owner: { fullName: 'Ahmed Proprietaire', email: 'contact@villa.dz', phone: '+213 555 123 456' }
};

export default function HouseDetailPage() {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [mock, setMock] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/houses/${id}`);
        setHouse(data.house);
      } catch {
        setHouse({ ...MOCK, _id: id });
        setMock(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <main className="min-h-screen"><Navbar />
      <p style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontSize: 16 }}>Chargement...</p>
    </main>
  );

  if (!house) return (
    <main className="min-h-screen"><Navbar />
      <p style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>Maison introuvable.</p>
    </main>
  );

  const images = house.images?.length ? house.images : [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80' }];
  const price = house.pricePerNight ?? 0;

  return (
    <main className="min-h-screen" style={{ background: '#f8fafc' }}>
      <Navbar />

      {/* Image gallery */}
      <div style={{ position: 'relative', height: 420, overflow: 'hidden', background: '#1e293b' }}>
        <img
          src={images[activeImg]?.url}
          alt={house.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)' }} />

        {/* Favorite */}
        <div style={{ position: 'absolute', top: 20, right: 24 }}>
          <FavoriteButton type="house" id={house._id || id} size={20} />
        </div>

        {/* Type + title overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 32px 28px', maxWidth: 1280, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', marginBottom: 8,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff', borderRadius: 999, padding: '4px 14px', fontSize: 12, fontWeight: 700
          }}>
            {house.type || 'Maison'}
          </span>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>{house.name}</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e2e8f0', fontSize: 15, margin: 0 }}>
            <MapPin size={16} /> {house.city}{house.wilaya !== house.city ? `, ${house.wilaya}` : ''}
          </p>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: 16, right: 24, display: 'flex', gap: 6 }}>
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                style={{
                  width: 52, height: 38, borderRadius: 8, overflow: 'hidden',
                  border: i === activeImg ? '2px solid #a855f7' : '2px solid transparent',
                  cursor: 'pointer', padding: 0
                }}
              >
                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}
        className="house-detail-grid">
        {/* Left column */}
        <div>
          {mock && (
            <p style={{ marginBottom: 16, background: '#fef3c7', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#92400e' }}>
              API hors ligne — données de démonstration.
            </p>
          )}

          {/* Quick stats */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 16, background: '#fff',
            borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.05)'
          }}>
            {[
              { icon: <BedDouble size={20} />, label: 'Chambres', value: house.rooms },
              { icon: <Bath size={20} />, label: 'Salles de bain', value: house.bathrooms },
              { icon: <Users size={20} />, label: 'Capacité', value: `${house.capacity} personnes` },
              { icon: <Home size={20} />, label: 'Type', value: house.type },
            ].map((item) => item.value && (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 130 }}>
                <span style={{
                  width: 40, height: 40, borderRadius: 10, background: '#f3e8ff',
                  color: '#7c3aed', display: 'grid', placeItems: 'center', flexShrink: 0
                }}>
                  {item.icon}
                </span>
                <div>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 12px' }}>À propos</h2>
            <p style={{ color: '#64748b', lineHeight: 1.7, margin: 0 }}>{house.description || 'Aucune description disponible.'}</p>
          </div>

          {/* Amenities */}
          {house.amenities?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>Équipements</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {house.amenities.map((a) => (
                  <span key={a} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: '#f3e8ff', color: '#7c3aed',
                    borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 500
                  }}>
                    <Wifi size={13} /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location map */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Localisation</h2>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>
              <MapPin size={14} /> {house.address || `${house.city}, ${house.wilaya}`}
            </p>
            <LocationMap
              lat={house.coordinates?.lat}
              lng={house.coordinates?.lng}
              label={house.name}
              accent="#7c3aed"
            />
          </div>

          {/* Rating */}
          {house.avgRating > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 12px' }}>Note globale</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontSize: 42, fontWeight: 900, color: '#7c3aed'
                }}>{house.avgRating}</span>
                <div>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} style={{ fill: i < Math.round(house.avgRating) ? '#a855f7' : '#e2e8f0', color: i < Math.round(house.avgRating) ? '#a855f7' : '#e2e8f0' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{house.reviewsCount || 0} avis</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: booking card */}
        <aside>
          <div style={{
            position: 'sticky', top: 88, background: '#fff', borderRadius: 20,
            boxShadow: '0 8px 32px rgba(124,58,237,0.12)', overflow: 'hidden',
            border: '1px solid #ede9fe'
          }}>
            {/* Price header */}
            <div style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)', padding: '20px 24px' }}>
              <p style={{ color: '#e9d5ff', fontSize: 13, margin: '0 0 4px' }}>Prix par nuit</p>
              <p style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>
                {price > 0 ? new Intl.NumberFormat('fr-DZ').format(price) : '—'}
                <span style={{ fontSize: 14, fontWeight: 400, color: '#c4b5fd' }}> DZD</span>
              </p>
            </div>

            <div style={{ padding: 24 }}>
              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {[
                  { icon: <BedDouble size={16} />, label: `${house.rooms || '—'} chambres` },
                  { icon: <Bath size={16} />, label: `${house.bathrooms || '—'} salles de bain` },
                  { icon: <Users size={16} />, label: `Jusqu'à ${house.capacity || '—'} personnes` },
                ].map((f) => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#475569' }}>
                    <span style={{ color: '#a855f7' }}>{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>

              {/* Contact button */}
              <button
                onClick={() => alert('Contactez le propriétaire pour réserver cette maison.')}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.35)', marginBottom: 12
                }}
              >
                Réserver maintenant
              </button>

              <button
                onClick={() => alert(house.owner?.phone || '+213 XXX XXX XXX')}
                style={{
                  width: '100%', padding: '12px', borderRadius: 14,
                  border: '1px solid #ede9fe', background: '#faf5ff',
                  color: '#7c3aed', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <Phone size={16} /> Contacter le propriétaire
              </button>

              {/* Owner info */}
              {house.owner && (
                <div style={{
                  marginTop: 20, paddingTop: 20, borderTop: '1px solid #f1f5f9'
                }}>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Propriétaire</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                      color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 16
                    }}>
                      {house.owner.fullName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>{house.owner.fullName}</p>
                      {house.owner.email && (
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={11} /> {house.owner.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .house-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer />
    </main>
  );
}
