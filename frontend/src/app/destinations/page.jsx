'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, MapPin, Compass, Navigation, Building2, Home, Star, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { HOTELS as MOCK_HOTELS } from '@/lib/data';
import { formatDZD } from '@/lib/data';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically load Map component to prevent window references and SSR hydrations mismatches
const NearbyMap = dynamic(() => import('@/components/NearbyMap'), { ssr: false });

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
  }
];

const CITY_COORDS = {
  'Alger': { lat: 36.7538, lng: 3.0588 },
  'Oran': { lat: 35.6987, lng: -0.6349 },
  'Constantine': { lat: 36.3650, lng: 6.6147 },
  'Tlemcen': { lat: 34.8783, lng: -1.3150 },
  'Béjaïa': { lat: 36.7525, lng: 5.0560 },
  'Bouira': { lat: 36.3749, lng: 3.9020 },
  'Timimoun': { lat: 29.2639, lng: 0.2310 },
  'Ouargla': { lat: 31.9493, lng: 5.3250 }
};

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

export default function DestinationsPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedKind, setSelectedKind] = useState('all'); // 'all' | 'hotel' | 'house'
  
  // Geolocation state
  const [userPos, setUserPos] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [radius, setRadius] = useState(50); // radius in km
  
  const [activeId, setActiveId] = useState(null);
  const [showMapOnMobile, setShowMapOnMobile] = useState(false);

  // Fetch approved hotels and houses
  useEffect(() => {
    Promise.all([
      api.get('/hotels', { params: { limit: 100 } }).catch(() => ({ data: { hotels: [] } })),
      api.get('/houses', { params: { limit: 100 } }).catch(() => ({ data: { houses: [] } }))
    ]).then(([hotelsRes, housesRes]) => {
      const hList = hotelsRes.data.hotels || [];
      const mList = housesRes.data.houses || [];

      // Fallbacks if backend DB is clean/empty
      const finalHotels = hList.length ? hList : MOCK_HOTELS;
      const finalHouses = mList.length ? mList : MOCK_HOUSES;

      const normalized = [
        ...finalHotels.map(h => ({
          id: h._id || h.id,
          kind: 'hotel',
          type: h.type || 'Luxe',
          name: h.name,
          city: h.city,
          price: h.price || 0,
          coordinates: h.coordinates || CITY_COORDS[h.city] || CITY_COORDS['Alger'],
          rating: h.avgRating ?? h.rating ?? 0,
          reviews: h.reviewsCount ?? h.reviews ?? 0,
          stars: h.starRating ?? h.stars ?? 3,
          img: h.images?.[0]?.url || h.img,
        })),
        ...finalHouses.map(m => ({
          id: m._id || m.id,
          kind: 'house',
          type: m.type || 'Maison',
          name: m.name,
          city: m.city,
          price: m.pricePerNight ?? m.price ?? 0,
          coordinates: m.coordinates || CITY_COORDS[m.city] || CITY_COORDS['Alger'],
          rooms: m.rooms,
          capacity: m.capacity,
          img: m.images?.[0]?.url || m.img,
        }))
      ];

      setProperties(normalized);
      setLoading(false);
    });
  }, []);

  // Geolocation trigger
  const handleGpsSearch = () => {
    if (gpsActive) {
      setGpsActive(false);
      setUserPos(null);
      return;
    }

    setGpsLoading(true);
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setGpsActive(true);
        setGpsLoading(false);
      },
      (err) => {
        console.error(err);
        alert("Impossible d'accéder à votre position. Veuillez accorder l'autorisation d'accès GPS.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Filter and Sort properties
  const processedProperties = useMemo(() => {
    let result = properties.map(p => {
      if (userPos && p.coordinates?.lat && p.coordinates?.lng) {
        const dist = getDistance(userPos.lat, userPos.lng, p.coordinates.lat, p.coordinates.lng);
        return { ...p, distance: dist };
      }
      return { ...p, distance: null };
    });

    // 1. Text Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q)
      );
    }

    // 2. Kind filter (Hotel / House)
    if (selectedKind === 'hotel') {
      result = result.filter(p => p.kind === 'hotel');
    } else if (selectedKind === 'house') {
      result = result.filter(p => p.kind === 'house');
    }

    // 3. Proximity Filter
    if (gpsActive && userPos) {
      result = result.filter(p => p.distance !== null && p.distance <= radius);
      // Sort by nearest first
      result.sort((a, b) => a.distance - b.distance);
    } else {
      // Default sorting by rating
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [properties, search, selectedKind, gpsActive, userPos, radius]);

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left pane: search filters and accommodation list */}
        <div className={`flex flex-col h-full overflow-y-auto w-full lg:w-[55%] border-r border-slate-100 ${showMapOnMobile ? 'hidden sm:flex' : 'flex'}`}>
          {/* Filters header section */}
          <div className="bg-white p-5 border-b border-slate-100 shadow-sm shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2.5 rounded-full bg-cyan-50 text-cyan-600">
                <Compass className="h-6 w-6 animate-spin-slow" />
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Recherche géolocalisée</h1>
                <p className="text-xs text-slate-400 font-medium">Découvrez les hébergements en location les plus proches</p>
              </div>
            </div>

            {/* Keyword Input */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50 focus-within:border-cyan-500 focus-within:bg-white transition-all">
              <Search className="h-4.5 w-4.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une destination, ville ou nom..."
                className="w-full outline-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 font-medium"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-xs font-bold text-slate-400 hover:text-slate-600 px-1">
                  ✕
                </button>
              )}
            </div>

            {/* Kind Selector & Geolocation Button */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg bg-slate-100 p-0.5 select-none">
                <button
                  onClick={() => setSelectedKind('all')}
                  className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                    selectedKind === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setSelectedKind('hotel')}
                  className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                    selectedKind === 'hotel' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" /> Hôtels
                </button>
                <button
                  onClick={() => setSelectedKind('house')}
                  className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                    selectedKind === 'house' ? 'bg-purple-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Home className="h-3.5 w-3.5" /> Maisons
                </button>
              </div>

              {/* Geolocation Button */}
              <button
                onClick={handleGpsSearch}
                disabled={gpsLoading}
                className={`ml-auto flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition-all hover:scale-102 ${
                  gpsActive 
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-md'
                }`}
              >
                <Navigation className={`h-3.5 w-3.5 ${gpsLoading ? 'animate-pulse' : ''} ${gpsActive ? 'fill-rose-600 rotate-45' : ''}`} />
                {gpsLoading ? 'Localisation...' : gpsActive ? 'Désactiver le GPS' : 'Autour de moi (GPS)'}
              </button>
            </div>

            {/* GPS Range Slider */}
            {gpsActive && userPos && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl animate-fade-in">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-extrabold text-slate-600">Rayon de recherche</span>
                  <span className="text-xs font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md">{radius} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                  <span>5 km</span>
                  <span>100 km</span>
                  <span>200 km</span>
                </div>
              </div>
            )}
          </div>

          {/* List Scroll Area */}
          <div className="p-4 sm:p-5 flex-1 bg-slate-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                {processedProperties.length} hébergements trouvés
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col gap-4 py-8 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                <p className="text-sm font-semibold text-slate-400">Recherche des hébergements...</p>
              </div>
            ) : processedProperties.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">Aucun résultat</h3>
                <p className="text-xs text-slate-400 mt-1">Aucun hôtel ou maison ne correspond à votre recherche à cette distance.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {processedProperties.map((p) => {
                  const isHotel = p.kind === 'hotel';
                  const linkHref = isHotel ? `/hotels/${p.id}` : `/houses/${p.id}`;
                  return (
                    <div
                      key={p.id}
                      onMouseEnter={() => setActiveId(p.id)}
                      onMouseLeave={() => setActiveId(null)}
                      className={`group relative flex flex-col md:flex-row bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md ${
                        activeId === p.id ? 'border-cyan-500 ring-1 ring-cyan-500/20' : 'border-slate-100'
                      }`}
                    >
                      {/* Left: Image banner */}
                      <div className="relative h-44 md:h-full w-full md:w-48 shrink-0 bg-slate-100">
                        <img
                          src={p.img || '/placeholder.jpg'}
                          alt={p.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-102"
                        />
                        <span className={`absolute left-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm ${
                          isHotel ? 'bg-cyan-500' : 'bg-purple-500'
                        }`}>
                          {isHotel ? '🏨 Hôtel' : '🏠 Maison'}
                        </span>
                      </div>

                      {/* Right: details info */}
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black text-slate-400 tracking-wide uppercase">
                              {p.type}
                            </span>
                            {isHotel && p.rating > 0 && (
                              <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                                <Star className="h-3.5 w-3.5 fill-amber-500" /> {p.rating}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-slate-800 mt-1 leading-tight group-hover:text-cyan-600 transition-colors">
                            {p.name}
                          </h3>

                          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {p.city}
                          </p>

                          {/* House specific details */}
                          {!isHotel && (p.rooms || p.capacity) && (
                            <div className="flex gap-3 text-[11px] text-slate-500 font-bold mt-2 bg-slate-50 p-1.5 px-2 rounded-lg w-fit">
                              {p.rooms && <span>{p.rooms} ch.</span>}
                              {p.capacity && <span>{p.capacity} pers.</span>}
                            </div>
                          )}
                        </div>

                        <div className="flex items-end justify-between mt-4 pt-3 border-t border-slate-50">
                          {/* Distance badge if geolocation is active */}
                          {p.distance !== null ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-extrabold text-emerald-600">
                              📍 À {p.distance < 1 ? Math.round(p.distance * 1000) + ' m' : p.distance.toFixed(1) + ' km'}
                            </span>
                          ) : (
                            <div />
                          )}

                          <div className="text-right flex items-center gap-4">
                            <div>
                              <span className="text-lg font-black text-slate-800">
                                {formatDZD(p.price)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold"> / nuit</span>
                            </div>
                            <Link 
                              href={linkHref}
                              className={`p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-cyan-500 hover:text-white transition-all`}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <Footer />
        </div>

        {/* Right pane: Map (desktop: 45% width, mobile: overlay map view) */}
        <div className={`lg:w-[45%] h-full bg-slate-100 relative shadow-inner z-0 ${showMapOnMobile ? 'flex w-full' : 'hidden lg:flex'}`}>
          <NearbyMap
            properties={processedProperties}
            userPos={userPos}
            activeId={activeId}
            onPropertyHover={setActiveId}
          />
          
          {/* Mobile view toggles */}
          <button
            onClick={() => setShowMapOnMobile(false)}
            className="absolute bottom-4 left-4 lg:hidden z-10 flex items-center gap-1.5 bg-slate-800 text-white px-4 py-2.5 rounded-full shadow-lg font-bold text-xs"
          >
            📋 Afficher la liste
          </button>
        </div>

        {/* Mobile floating map toggle button */}
        {!showMapOnMobile && (
          <button
            onClick={() => setShowMapOnMobile(true)}
            className="absolute bottom-4 right-4 lg:hidden z-10 flex items-center gap-1.5 bg-cyan-600 text-white px-4 py-2.5 rounded-full shadow-lg font-bold text-xs"
          >
            🗺️ Afficher la carte
          </button>
        )}
      </div>

      <style jsx global>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          font-family: inherit;
        }
        .user-location-marker {
          background: none !important;
          border: none !important;
        }
        .custom-pin-container {
          background: none !important;
          border: none !important;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
