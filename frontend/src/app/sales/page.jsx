'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Search, ChevronDown, Eye, Home, ArrowUp, ArrowDown, Tag, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api, { getImageUrl } from '@/lib/api';
import { formatDZD } from '@/lib/data';
import { useWilayas } from '@/hooks/useWilayas';

const PROPERTY_TYPES = [
  'Appartement',
  'Bureau',
  'Commerce',
  'Garage / Parking',
  'Immeuble',
  'Locaux d\'activité / Entrepôts',
  'Maison',
  'Terrain',
  'Chalet',
  'Duplex',
  'Studio',
  'Ferme'
];

const PRICE_RANGES = [
  { value: '0-10000', label: '0 - 10 000' },
  { value: '10000-25000', label: '10 000 - 25 000' },
  { value: '25000-50000', label: '25 000 - 50 000' },
  { value: '50000-100000', label: '50 000 - 100 000' },
  { value: '100000-250000', label: '100 000 - 250 000' },
  { value: '250000-500000', label: '250 000 - 500 000' },
  { value: '500000-1000000', label: '500 000 - 1 000 000' },
];

export default function SalesPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const { wilayas } = useWilayas();

  // Applied filters
  const [filters, setFilters] = useState({
    wilaya: '',
    type: 'Appartement',
    reference: '',
    priceRanges: []
  });

  // Temp filters (unapplied until search click)
  const [tempFilters, setTempFilters] = useState({
    wilaya: '',
    type: 'Appartement',
    reference: '',
    priceRanges: []
  });

  const [sort, setSort] = useState('updatedAt');
  const [order, setOrder] = useState('desc');
  const [openDropdown, setOpenDropdown] = useState(null); // 'vente' | 'type' | 'ville' | 'prix'
  const [openSortDropdown, setOpenSortDropdown] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filters.wilaya) params.city = filters.wilaya; // Using city query parameter for wilaya matching
      if (filters.type && filters.type !== 'Tous') params.type = filters.type;
      if (filters.reference) params.reference = filters.reference;
      if (filters.priceRanges.length > 0) {
        params.priceRanges = filters.priceRanges.join(',');
      }
      params.sort = sort;
      params.order = order;

      const { data } = await api.get('/sales', { params });
      setListings(data.listings || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, filters, sort, order]);

  const handlePriceRangeChange = (value) => {
    setTempFilters(prev => {
      const current = [...prev.priceRanges];
      const idx = current.indexOf(value);
      if (idx > -1) {
        current.splice(idx, 1);
      } else {
        current.push(value);
      }
      return { ...prev, priceRanges: current };
    });
  };

  const handleSearchClick = () => {
    setFilters({ ...tempFilters });
    setPage(1);
    setOpenDropdown(null);
  };

  const getPriceLabel = () => {
    if (tempFilters.priceRanges.length === 0) return 'Prix';
    if (tempFilters.priceRanges.length === 1) {
      const range = PRICE_RANGES.find(r => r.value === tempFilters.priceRanges[0]);
      return range ? range.label : 'Prix';
    }
    return `${tempFilters.priceRanges.length} sélectionnés`;
  };

  const getSortLabel = () => {
    if (sort === 'updatedAt') return 'Date de mise à jour';
    if (sort === 'price') return 'Prix';
    if (sort === 'newest') return 'Plus récents';
    return 'Trier par';
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f8f9fc]">
        
        {/* Hero Section */}
        <div 
          className="relative h-[440px] w-full bg-cover bg-center flex flex-col justify-end pb-12 px-4 shadow-inner animate-fade-in"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80')` }}
        >
          <div className="absolute inset-0 bg-black/15"></div>
          
          {/* Main floating search bar */}
          <div className="relative z-10 mx-auto w-full max-w-7xl">
            <div 
              ref={dropdownRef}
              className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-white/10"
            >
              {/* Vente selector */}
              <div className="relative flex-1 select-none">
                <div 
                  onClick={() => setOpenDropdown(openDropdown === 'vente' ? null : 'vente')}
                  className="bg-white rounded-xl px-4 py-3.5 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                >
                  <span className="font-serif font-bold text-slate-800">Vente</span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${openDropdown === 'vente' ? 'rotate-180' : ''}`} />
                </div>
                {openDropdown === 'vente' && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-xl bg-white py-1 shadow-xl border border-gray-100">
                    <button onClick={() => setOpenDropdown(null)} className="w-full text-left px-5 py-2.5 text-sm font-serif font-bold text-teal-600 border-l-2 border-teal-500 bg-teal-50/30">
                      Vente
                    </button>
                  </div>
                )}
              </div>

              {/* Property type selector */}
              <div className="relative flex-1 select-none">
                <div 
                  onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                  className="bg-white rounded-xl px-4 py-3.5 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                >
                  <span className="font-serif font-bold text-slate-800 truncate">{tempFilters.type || 'Type'}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${openDropdown === 'type' ? 'rotate-180' : ''}`} />
                </div>
                {openDropdown === 'type' && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-64 overflow-y-auto rounded-xl bg-white py-1 shadow-xl border border-gray-100">
                    {PROPERTY_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTempFilters({ ...tempFilters, type: t });
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-5 py-2.5 text-sm font-serif font-bold transition-all border-l-2 ${
                          tempFilters.type === t
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

              {/* Ville/Wilaya selector */}
              <div className="relative flex-1 select-none">
                <div 
                  onClick={() => setOpenDropdown(openDropdown === 'ville' ? null : 'ville')}
                  className="bg-white rounded-xl px-4 py-3.5 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                >
                  <span className="font-serif font-bold text-slate-800 truncate">{tempFilters.wilaya || 'Ville'}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${openDropdown === 'ville' ? 'rotate-180' : ''}`} />
                </div>
                {openDropdown === 'ville' && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-64 overflow-y-auto rounded-xl bg-white py-1 shadow-xl border border-gray-100">
                    <div className="px-4 py-1.5 border-b border-gray-100 mb-1 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400">WILAYA</span>
                      {tempFilters.wilaya && (
                        <button onClick={() => setTempFilters({ ...tempFilters, wilaya: '' })} className="text-[10px] text-teal-600 hover:underline font-bold">
                          Réinitialiser
                        </button>
                      )}
                    </div>
                    {wilayas?.map((w) => (
                      <button
                        key={w}
                        onClick={() => {
                          setTempFilters({ ...tempFilters, wilaya: w });
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-5 py-2.5 text-sm font-serif font-bold transition-all border-l-2 ${
                          tempFilters.wilaya === w
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

              {/* Prix Range checklist */}
              <div className="relative flex-1 select-none">
                <div 
                  onClick={() => setOpenDropdown(openDropdown === 'prix' ? null : 'prix')}
                  className="bg-white rounded-xl px-4 py-3.5 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                >
                  <span className="font-serif font-bold text-slate-800 truncate">{getPriceLabel()}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${openDropdown === 'prix' ? 'rotate-180' : ''}`} />
                </div>
                {openDropdown === 'prix' && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 w-72 rounded-xl bg-white p-3 shadow-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-400">FOURCHETTE DE PRIX</span>
                      {tempFilters.priceRanges.length > 0 && (
                        <button 
                          onClick={() => setTempFilters({ ...tempFilters, priceRanges: [] })}
                          className="text-[10px] text-teal-600 hover:underline font-bold"
                        >
                          Réinitialiser
                        </button>
                      )}
                    </div>
                    <div className="space-y-1 max-h-56 overflow-y-auto">
                      {PRICE_RANGES.map((range) => {
                        const isChecked = tempFilters.priceRanges.includes(range.value);
                        return (
                          <label key={range.value} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50/50 p-2 rounded-lg transition select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handlePriceRangeChange(range.value)}
                              className="accent-teal-600 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm font-serif font-bold text-slate-800">{range.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Reference Selector */}
              <div className="relative flex-1">
                <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm flex items-center justify-between">
                  <input 
                    type="text" 
                    placeholder="Référence" 
                    value={tempFilters.reference}
                    onChange={(e) => setTempFilters({ ...tempFilters, reference: e.target.value })}
                    className="w-full bg-transparent outline-none text-slate-800 placeholder:text-gray-400 font-serif font-bold"
                  />
                </div>
              </div>

              {/* Search Button */}
              <button 
                onClick={handleSearchClick}
                className="flex items-center justify-center h-[52px] w-[52px] shrink-0 rounded-full border border-white/20 bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
          
          {/* Title & Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-gray-200/60 pb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 leading-tight font-serif">
                Notre catalogue de biens à vendre
              </h2>
              <p className="text-sm font-medium text-gray-500 mt-2">
                Découvrez notre sélection d'annonces immobilières en vente.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setOpenSortDropdown(!openSortDropdown)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all select-none shadow-sm"
                >
                  <span>{getSortLabel()}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${openSortDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {openSortDropdown && (
                  <div className="absolute right-0 top-full mt-2 z-20 w-52 rounded-xl bg-white py-1.5 shadow-xl border border-gray-100 animate-slide-down">
                    {[
                      { value: 'updatedAt', label: 'Date de mise à jour' },
                      { value: 'price', label: 'Prix' },
                      { value: 'newest', label: 'Plus récents' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSort(opt.value);
                          setOpenSortDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors ${
                          sort === opt.value ? 'text-emerald-600 bg-emerald-50/30' : 'text-gray-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Order Direction toggle */}
              <button
                onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-3 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                title={order === 'asc' ? 'Tri croissant' : 'Tri décroissant'}
              >
                {order === 'asc' ? (
                  <ArrowUp className="h-4.5 w-4.5 text-emerald-600 font-bold" />
                ) : (
                  <ArrowDown className="h-4.5 w-4.5 text-emerald-600 font-bold" />
                )}
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-3xl bg-white border border-gray-100 shadow-sm"></div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-3xl bg-white p-16 text-center shadow-sm border border-gray-100">
              <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-emerald-50/60 animate-bounce">
                <Home className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun bien trouvé</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">Nous n'avons trouvé aucune annonce correspondant à vos critères de filtrage actuel.</p>
              <button 
                onClick={() => {
                  setTempFilters({ wilaya: '', type: 'Appartement', reference: '', priceRanges: [] });
                  setFilters({ wilaya: '', type: 'Tous', reference: '', priceRanges: [] });
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-emerald-700 transition"
              >
                <RefreshCw className="h-4 w-4" /> Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <Link
                    key={listing._id}
                    href={`/sales/${listing._id}`}
                    className="group rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                  >
                    {/* Image */}
                    <div className="relative h-56 bg-gray-100 overflow-hidden">
                      {listing.images?.[0] ? (
                        <img 
                          src={getImageUrl(listing.images[0].url)} 
                          alt={listing.title} 
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-300">
                          <Home className="h-12 w-12" />
                        </div>
                      )}
                      
                      {/* Reference Badge */}
                      {listing.reference && (
                        <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-white select-none">
                          {listing.reference}
                        </div>
                      )}

                      <div className="absolute top-3 right-3 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-bold text-emerald-600">
                        {listing.type}
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-24" />
                      <p className="absolute bottom-4 left-4 text-xl font-extrabold text-white drop-shadow-sm">
                        {formatDZD(listing.price)}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1.5 truncate group-hover:text-emerald-600 transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-4">
                        <MapPin className="h-4 w-4 text-emerald-500 shrink-0" /> 
                        <span className="truncate">{listing.city}, {listing.wilaya}</span>
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-semibold">
                        <div className="flex items-center gap-3">
                          {listing.area > 0 && <span>{listing.area} m²</span>}
                          {listing.rooms > 0 && <span>{listing.rooms} pcs</span>}
                        </div>
                        <span className="flex items-center gap-1 font-medium text-gray-400">
                          <Eye className="h-3.5 w-3.5" /> {listing.views || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-11 w-11 rounded-full text-sm font-bold transition-all ${
                        page === p
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
