'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tag, ChevronLeft, ChevronRight, MapPin, BedDouble, ChevronRight as ArrowIcon, Plus } from 'lucide-react';
import api, { getImageUrl } from '@/lib/api';
import { useAuthStore, useLangStore } from '@/store/authStore';
import { TRANSLATIONS } from '@/lib/data';

const MOCK_SALES = [
  {
    _id: 'sale1',
    title: 'Villa Moderne avec Piscine',
    city: 'Alger',
    wilaya: 'Alger',
    type: 'Villa',
    area: 320,
    rooms: 6,
    price: 45000000,
    images: [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' }]
  },
  {
    _id: 'sale2',
    title: 'Appartement F4 à Hydra',
    city: 'Alger',
    wilaya: 'Alger',
    type: 'Appartement',
    area: 120,
    rooms: 4,
    price: 25000000,
    images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80' }]
  },
  {
    _id: 'sale3',
    title: 'Bel Appartement Vue Mer',
    city: 'Béjaïa',
    wilaya: 'Béjaïa',
    type: 'Appartement',
    area: 95,
    rooms: 3,
    price: 14500000,
    images: [{ url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80' }]
  },
  {
    _id: 'sale4',
    title: 'Chalet en Bois à Tikjda',
    city: 'Bouira',
    wilaya: 'Bouira',
    type: 'Chalet',
    area: 150,
    rooms: 5,
    price: 18000000,
    images: [{ url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80' }]
  },
  {
    _id: 'sale5',
    title: 'Duplex Haut Standing Oran',
    city: 'Oran',
    wilaya: 'Oran',
    type: 'Duplex',
    area: 180,
    rooms: 5,
    price: 32000000,
    images: [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80' }]
  }
];

export default function FeaturedSales({ selectedCity }) {
  const [sales, setSales] = useState(MOCK_SALES);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const { lang } = useLangStore();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  const isSeller = user?.role === 'seller';

  useEffect(() => {
    api.get('/sales', { params: { limit: 6, sort: 'newest' } })
      .then(({ data }) => {
        if (data.listings?.length) setSales(data.listings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredSales = selectedCity
    ? sales.filter((s) =>
        (s.city || s.wilaya || '').toLowerCase().includes(selectedCity.toLowerCase())
      )
    : sales;

  const scroll = (dir) => {
    const el = document.getElementById('sales-scroller');
    el?.scrollBy({ left: dir * 380, behavior: 'smooth' });
  };

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            display: 'grid', placeItems: 'center', width: 48, height: 48,
            borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#fff',
            boxShadow: '0 4px 14px rgba(15,23,42,0.25)'
          }}>
            <Tag size={20} />
          </span>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>
              {t.featuredSales || 'Biens à Vendre'}
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '2px 0 0' }}>
              {t.featuredSalesSubtitle || 'Achetez votre futur logement en Algérie'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href={user ? (user.role === 'seller' ? '/seller/my-listings?new=1' : '/seller/dashboard') : '/register?role=seller'} style={{
            display: 'flex', alignItems: 'center', gap: 6, borderRadius: 999,
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            padding: '8px 20px', fontSize: 13, fontWeight: 700,
            color: '#fff', textDecoration: 'none', boxShadow: '0 4px 14px rgba(15,23,42,0.25)'
          }}>
            <Plus size={15} /> Publier un bien
          </Link>
          <Link href="/sales" style={{
            display: 'flex', alignItems: 'center', gap: 4, borderRadius: 999,
            border: '1px solid #e2e8f0', background: '#fff', padding: '8px 20px',
            fontSize: 13, fontWeight: 500, color: '#374151', textDecoration: 'none'
          }}>
            {t.seeAll} <ArrowIcon size={16} />
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
          id="sales-scroller"
          style={{
            display: 'flex', gap: 20, overflowX: 'auto', scrollBehavior: 'smooth',
            paddingBottom: 8, scrollSnapType: 'x mandatory',
          }}
          className="no-scrollbar"
        >
          {filteredSales.length > 0 ? (
            filteredSales.map((item) => {
              const rawUrl = item.images?.[0]?.url;
              const img = rawUrl ? getImageUrl(rawUrl) : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';
              const price = item.price || 0;
              return (
                <Link
                  key={item._id}
                  href={`/sales/${item._id}`}
                  style={{
                    position: 'relative', height: 288, width: 320, flexShrink: 0,
                    borderRadius: 20, overflow: 'hidden', scrollSnapAlign: 'start',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'block', textDecoration: 'none'
                  }}
                  className="group animate-scale-up"
                >
                  <img 
                    src={img} 
                    alt={item.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} 
                    className="group-hover:scale-105"
                  />
                  {/* Type badge */}
                  <span style={{
                    position: 'absolute', top: 12, left: 12,
                    background: 'rgba(15,23,42,0.95)', color: '#fff',
                    borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 700
                  }}>
                    {item.type || 'Maison'}
                  </span>
                  
                  {/* Details overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                    padding: '0 16px 16px'
                  }}>
                    <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </h3>
                      <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#e2e8f0', margin: '0 0 8px' }}>
                        <MapPin size={14} className="text-slate-400" /> {item.city}, {item.wilaya}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#cbd5e1' }}>
                          {item.area > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{item.area} m²</span>}
                          {item.rooms > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><BedDouble size={13} /> {item.rooms} p.</span>}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#cbd5e1' }}>
                          {new Intl.NumberFormat('fr-DZ').format(price)} DZD
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <p style={{ padding: '40px 0', color: '#94a3b8', fontSize: 14 }}>
              {t.noHousesCity || 'Aucun bien à vendre dans cette ville.'}
            </p>
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
