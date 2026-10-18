'use client';

import { useEffect, useState } from 'react';
import { BedDouble, MapPin, Phone } from 'lucide-react';
import api from '@/lib/api';
import { useT } from '@/lib/i18n/useT';
import Policies from '@/components/Policies';

const ROOM_TYPE_LABELS = { single: 'Simple', double: 'Double', suite: 'Suite', family: 'Familiale' };

/**
 * Everything the owner entered for a hotel, shown in the admin review modal (between the gallery
 * and the action buttons): owner contact, location + map link, description, amenities,
 * "ideal for", rooms and house rules.
 */
export default function AdminHotelDetails({ hotel }) {
  const { t } = useT();
  const [rooms, setRooms] = useState(null);
  const [currency, setCurrency] = useState(hotel.currency || 'DZD');

  useEffect(() => {
    let alive = true;
    setRooms(null);
    api
      .get(`/hotels/${hotel._id}/rooms`)
      .then(({ data }) => {
        if (!alive) return;
        setRooms(data.rooms || []);
        if (data.currency) setCurrency(data.currency);
      })
      .catch(() => alive && setRooms([]));
    return () => {
      alive = false;
    };
  }, [hotel._id]);

  const { lat, lng } = hotel.coordinates || {};
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  return (
    <>
      {/* Owner & Location */}
      <div className="grid md:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 mb-6 text-sm">
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase">{t('Propriétaire')}</p>
          <p className="font-extrabold text-gray-900">{hotel.owner?.fullName || t('Hôtelier')}</p>
          <p className="text-xs text-gray-500">{hotel.owner?.email || '—'}</p>
          {hotel.owner?.phone && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500" dir="ltr">
              <Phone className="h-3 w-3" aria-hidden="true" /> {hotel.owner.phone}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-400 font-bold uppercase">{t('Emplacement')}</p>
          <p className="font-bold text-gray-900">
            {[t(hotel.city), t(hotel.wilaya), hotel.country && hotel.country !== 'DZ' ? hotel.country : null]
              .filter(Boolean)
              .join(', ')}
          </p>
          {hotel.address && (
            <p className="text-xs text-gray-500">
              {t('Adresse')} : {hotel.address}
            </p>
          )}
          {hasCoords && (
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              <MapPin className="h-3 w-3" aria-hidden="true" /> {t('Voir sur la carte')}
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      {hotel.description && (
        <div className="mb-6">
          <h4 className="font-bold text-gray-900 mb-1 text-sm">{t('Description')}</h4>
          <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100 whitespace-pre-line">
            {hotel.description}
          </p>
        </div>
      )}

      {/* Amenities */}
      {hotel.amenities?.length > 0 && (
        <div className="mb-6">
          <h4 className="font-bold text-gray-900 mb-2 text-sm">{t('Équipements')}</h4>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.map((am, i) => (
              <span key={i} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {am}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ideal for */}
      {hotel.suitableFor?.length > 0 && (
        <div className="mb-6">
          <h4 className="font-bold text-gray-900 mb-2 text-sm">{t('Idéal pour')}</h4>
          <div className="flex flex-wrap gap-2">
            {hotel.suitableFor.map((s) => (
              <span key={s} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {t(s)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rooms */}
      <div className="mb-6">
        <h4 className="font-bold text-gray-900 mb-2 text-sm inline-flex items-center gap-1">
          <BedDouble className="h-4 w-4 text-indigo-500" aria-hidden="true" /> {t('Chambres disponibles')}
        </h4>
        {rooms === null ? (
          <div className="h-12 animate-pulse rounded-xl bg-gray-50" />
        ) : rooms.length === 0 ? (
          <p className="text-sm text-gray-400">{t('Aucune chambre ajoutée')}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-start font-semibold">{t('Type de chambre')}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t('Personnes')}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t('Prix / nuit')}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t('Nombre')}</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r._id} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-semibold text-gray-900">
                      {r.title || t(ROOM_TYPE_LABELS[r.type] || r.type)}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{r.capacity}</td>
                    <td className="px-3 py-2 text-gray-600" dir="ltr">
                      {Number(r.pricePerNight).toLocaleString('fr-FR')} {currency}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{r.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* House rules & policies */}
      <div className="mb-6">
        <Policies policies={hotel.policies} />
      </div>
    </>
  );
}
