'use client';

import { Plus, Trash2, BedDouble } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

export const ROOM_OPTIONS = [
  { type: 'single', label: 'Chambre simple (1 personne)', capacity: 1 },
  { type: 'double', label: 'Chambre double (2 personnes)', capacity: 2 },
  { type: 'suite', label: 'Suite', capacity: 3 },
  { type: 'family', label: 'Chambre familiale', capacity: 4 },
];

export const newRoomRow = (type = 'double') => ({
  type,
  capacity: ROOM_OPTIONS.find((o) => o.type === type)?.capacity || 2,
  pricePerNight: '',
  quantity: 1,
});

/**
 * Room types a hotel offers, edited as a list (one row per type: single, double…).
 * Sent with the new hotel; photos and details can be added later on the rooms page.
 */
export default function RoomListFields({ rooms, onChange, currency = 'DZD' }) {
  const { t } = useT();
  const update = (i, patch) => onChange(rooms.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const remove = (i) => onChange(rooms.filter((_, j) => j !== i));
  const add = () => {
    // suggest the next type not listed yet
    const next = ROOM_OPTIONS.find((o) => !rooms.some((r) => r.type === o.type))?.type || 'double';
    onChange([...rooms, newRoomRow(next)]);
  };
  const input = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500';

  return (
    <fieldset className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
      <legend className="flex items-center gap-1.5 px-1 text-sm font-bold text-gray-800">
        <BedDouble className="h-4 w-4 text-brand-500" aria-hidden="true" /> {t('Chambres disponibles')}
      </legend>
      <p className="text-xs text-gray-500">{t('Indiquez les types de chambres de votre hôtel. Vous pourrez ajouter des photos et des détails ensuite.')}</p>

      {rooms.map((r, i) => (
        <div key={i} className="grid gap-2 rounded-xl border border-gray-100 bg-white p-3 sm:grid-cols-[1.6fr_0.7fr_1fr_0.7fr_auto] sm:items-end">
          <label className="text-xs font-semibold text-gray-600">
            {t('Type de chambre')}
            <select
              value={r.type}
              onChange={(e) => update(i, { type: e.target.value, capacity: ROOM_OPTIONS.find((o) => o.type === e.target.value)?.capacity || r.capacity })}
              className={`${input} mt-1`}
            >
              {ROOM_OPTIONS.map((o) => <option key={o.type} value={o.type}>{t(o.label)}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-gray-600">
            {t('Personnes')}
            <input type="number" min="1" max="20" value={r.capacity} onChange={(e) => update(i, { capacity: e.target.value })} className={`${input} mt-1`} />
          </label>
          <label className="text-xs font-semibold text-gray-600">
            {t('Prix / nuit')} ({currency})
            <input type="number" min="1" required value={r.pricePerNight} onChange={(e) => update(i, { pricePerNight: e.target.value })} placeholder="8000" className={`${input} mt-1`} />
          </label>
          <label className="text-xs font-semibold text-gray-600">
            {t('Nombre')}
            <input type="number" min="1" max="500" value={r.quantity} onChange={(e) => update(i, { quantity: e.target.value })} className={`${input} mt-1`} />
          </label>
          <button type="button" onClick={() => remove(i)} aria-label={t('Retirer')}
            className="grid h-9 w-9 place-items-center rounded-lg text-red-500 transition hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button type="button" onClick={add}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-brand-300 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50">
        <Plus className="h-4 w-4" aria-hidden="true" /> {t('Ajouter un type de chambre')}
      </button>
    </fieldset>
  );
}
