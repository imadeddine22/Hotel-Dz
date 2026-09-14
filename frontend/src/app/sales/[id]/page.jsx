'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, Mail, ArrowLeft, Eye, Home, Ruler, DoorOpen, Bath, Tag, ChevronLeft, ChevronRight, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api, { getImageUrl } from '@/lib/api';
import { formatDZD } from '@/lib/data';

export default function SaleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/sales/${id}`);
        setListing(data.listing);
      } catch {
        router.push('/sales');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>
      </>
    );
  }

  if (!listing) return null;

  const images = listing.images || [];
  const seller = listing.seller || {};

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)] pb-16">
        {/* Back */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left: Images & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[16/10]">
                {images.length > 0 ? (
                  <>
                    <img
                      src={getImageUrl(images[imgIdx]?.url)}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setImgIdx((p) => (p - 1 + images.length) % images.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white transition shadow"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setImgIdx((p) => (p + 1) % images.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white transition shadow"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setImgIdx(i)}
                              className={`h-2 rounded-full transition-all ${i === imgIdx ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    <Home className="h-16 w-16" />
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`h-16 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition ${
                        i === imgIdx ? 'border-emerald-500' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={getImageUrl(img.url)} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Details */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 mb-3">
                      <Tag className="h-3 w-3" /> {listing.type} · À vendre
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{listing.title}</h1>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      {listing.address && `${listing.address}, `}{listing.city}, {listing.wilaya}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-emerald-600">{formatDZD(listing.price)}</p>
                    <p className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-1">
                      <Eye className="h-3 w-3" /> {listing.views} vues
                    </p>
                  </div>
                </div>

                {/* Key specs */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {listing.area > 0 && (
                    <div className="rounded-xl bg-gray-50 p-3 text-center">
                      <Ruler className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                      <p className="text-sm font-bold text-gray-900">{listing.area} m²</p>
                      <p className="text-[10px] text-gray-400">Surface</p>
                    </div>
                  )}
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <DoorOpen className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">{listing.rooms}</p>
                    <p className="text-[10px] text-gray-400">Pièces</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <Bath className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">{listing.bathrooms}</p>
                    <p className="text-[10px] text-gray-400">Salles de bain</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <Home className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">{listing.type}</p>
                    <p className="text-[10px] text-gray-400">Type</p>
                  </div>
                </div>

                {/* Description */}
                {listing.description && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
                  </div>
                )}

                {/* Amenities */}
                {listing.amenities?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Équipements</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.amenities.map((a, i) => (
                        <span key={i} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Contact Card */}
            <div className="space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">Contacter le vendeur</h3>
                
                {/* Seller Info */}
                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-gray-50">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold">
                    {seller.fullName?.charAt(0)?.toUpperCase() || 'V'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{seller.fullName || 'Vendeur'}</p>
                    <p className="text-xs text-gray-400">Vendeur vérifié</p>
                  </div>
                </div>

                {/* Contact buttons */}
                {(listing.contactPhone || seller.phone) && (
                  <a
                    href={`tel:${listing.contactPhone || seller.phone}`}
                    className="flex items-center gap-3 w-full rounded-xl bg-emerald-600 px-5 py-3.5 font-bold text-white shadow-md hover:bg-emerald-700 transition mb-3"
                  >
                    <Phone className="h-5 w-5" />
                    <span>{listing.contactPhone || seller.phone}</span>
                  </a>
                )}

                {(listing.contactEmail || seller.email) && (
                  <a
                    href={`mailto:${listing.contactEmail || seller.email}`}
                    className="flex items-center gap-3 w-full rounded-xl border border-gray-200 px-5 py-3.5 font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Mail className="h-5 w-5 text-emerald-500" />
                    <span className="truncate">{listing.contactEmail || seller.email}</span>
                  </a>
                )}

                <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-xs text-amber-700 font-medium">
                    💡 Conseil : Vérifiez toujours le bien en personne avant tout engagement financier.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
