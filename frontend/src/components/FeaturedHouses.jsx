'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, ChevronLeft, ChevronRight, MapPin, BedDouble, Bath, Users, Plus } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore, useLangStore } from '@/store/authStore';
import { TRANSLATIONS } from '@/lib/data';
import FavoriteButton from '@/components/FavoriteButton';

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
function resolveImg(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${SERVER}${url}`;
}

const MOCK_HOUSES = [
  {
    id: 'hm1', name: 'Villa Yasmine', city: 'Alger', wilaya: 'Alger', type: 'Villa',
    rooms: 4, bathrooms: 2, capacity: 8, pricePerNight: 15000,
    img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  },
  {
    id: 'hm2', name: 'Chalet Forêt de Tikjda', city: 'Bouira', wilaya: 'Bouira', type: 'Chalet',
    rooms: 3, bathrooms: 1, capacity: 6, pricePerNight: 9000,
    img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
  },
  {
    id: 'hm3', name: 'Appartement Vue Mer Béjaïa', city: 'Béjaïa', wilaya: 'Béjaïa', type: 'Appartement',
    rooms: 2, bathrooms: 1, capacity: 4, pricePerNight: 6000,
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  },
  {
    id: 'hm4', name: 'Riad Tlemcen', city: 'Tlemcen', wilaya: 'Tlemcen', type: 'Riad',
    rooms: 3, bathrooms: 2, capacity: 6, pricePerNight: 11000,
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  },
  {
    id: 'hm5', name: 'Ferme Ouargla', city: 'Ouargla', wilaya: 'Ouargla', type: 'Ferme',
    rooms: 5, bathrooms: 3, capacity: 10, pricePerNight: 8000,
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  },
];

export default function FeaturedHouses({ selectedCity }) {
  const [houses, setHouses] = useState(MOCK_HOUSES);
  const scroller = { current: null };
  const user = useAuthStore((s) => s.user);
  const { lang } = useLangStore();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  const isOwner = user?.role === 'owner';

  useEffect(() => {
    api.get('/houses', { params: { limit: 6, sort: 'newest' } })
      .then(({ data }) => { if (data.houses?.length) setHouses(data.houses); })
      .catch(() => {});
  }, []);

  const filteredHouses = selectedCity
    ? houses.filter((h) =>
        (h.city || h.wilaya || '').toLowerCase().includes(selectedCity.toLowerCase())
      )
    : houses;

  const scroll = (dir) => {
    const el = document.getElementById('houses-scroller');
    el?.scrollBy({ left: dir * 380, behavior: 'smooth' });
  };

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            display: 'grid', placeItems: 'center', width: 48, height: 48,
            borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff',
            boxShadow: '0 4px 14px rgba(168,85,247,0.35)'
          }}>
            <Home size={22} />
          </span>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>{t.featuredHouses}</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '2px 0 0' }}>{t.featuredHousesSubtitle}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isOwner && (
            <Link href="/owner/my-houses?new=1" style={{
              display: 'flex', alignItems: 'center', gap: 6, borderRadius: 999,
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              padding: '8px 20px', fontSize: 13, fontWeight: 700,
              color: '#fff', textDecoration: 'none', boxShadow: '0 4px 14px rgba(168,85,247,0.35)'
            }}>
              <Plus size={15} /> {t.becomeOwner}
            </Link>
          )}
          <Link href="/houses" style={{
            display: 'flex', alignItems: 'center', gap: 4, borderRadius: 999,
            border: '1px solid #e2e8f0', background: '#fff', padding: '8px 20px',
            fontSize: 13, fontWeight: 500, color: '#374151', textDecoration: 'none'
          }}>
            {t.seeAll} <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Carousel */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => scroll(-1)}
          style={{
            position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, width: 40, height: 40, borderRadius: '50%',
            background: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            cursor: 'pointer', display: 'grid', placeItems: 'center'
          }}
        >
          <ChevronLeft size={20} />
        </button>

        <div
          id="houses-scroller"
          style={{
            display: 'flex', gap: 20, overflowX: 'auto', scrollBehavior: 'smooth',
            paddingBottom: 8, scrollSnapType: 'x mandatory',
          }}
          className="no-scrollbar"
        >
          {filteredHouses.length > 0 ? (
            filteredHouses.map((h) => {
              const rawImg = h.images?.[0]?.url || h.img || null;
              const img = resolveImg(rawImg) || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';
              const price = h.pricePerNight ?? h.price ?? 0;
              return (
                <Link
                  key={h._id || h.id}
                  href={`/houses/${h._id || h.id}`}
                  style={{
                    position: 'relative', height: 288, width: 320, flexShrink: 0,
                    borderRadius: 20, overflow: 'hidden', scrollSnapAlign: 'start',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'block', textDecoration: 'none'
                  }}
                  className="group"
                >
                  <img src={img} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                  {/* Type badge */}
                  <span style={{
                    position: 'absolute', top: 12, left: 12,
                    background: 'rgba(168,85,247,0.9)', color: '#fff',
                    borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 700
                  }}>
                    {h.type || 'Maison'}
                  </span>
                  {/* Favorite Button */}
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <FavoriteButton type="house" id={h._id || h.id} />
                  </div>
                  {/* Details overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
                    padding: '0 16px 16px'
                  }}>
                    <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{h.name}</h3>
                      <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#e2e8f0', margin: '0 0 8px' }}>
                        <MapPin size={14} /> {h.city}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#cbd5e1' }}>
                          {h.rooms && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><BedDouble size={13} /> {h.rooms} ch.</span>}
                          {h.capacity && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users size={13} /> {h.capacity} pers.</span>}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#e9d5ff' }}>
                          {price > 0 ? new Intl.NumberFormat('fr-DZ').format(price) + ' DZD' : '—'}
                          <span style={{ fontWeight: 400, fontSize: 11 }}>/nuit</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <p style={{ padding: '40px 0', color: '#94a3b8', fontSize: 14 }}>Aucune maison disponible dans cette ville.</p>
          )}
        </div>

        <button
          onClick={() => scroll(1)}
          style={{
            position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, width: 40, height: 40, borderRadius: '50%',
            background: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            cursor: 'pointer', display: 'grid', placeItems: 'center'
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
