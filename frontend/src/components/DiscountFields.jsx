'use client';

import { Tag } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

/** Owner "deal" on a room or house: a percentage off the nightly price, optionally until a date. */
export default function DiscountFields({ percent, until, onChange }) {
  const { t } = useT();
  const input = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500';
  return (
    <fieldset className="rounded-2xl border border-red-100 bg-red-50/40 p-4" style={{ gridColumn: '1 / -1' }}>
      <legend className="flex items-center gap-1.5 px-1 text-sm font-bold text-gray-800">
        <Tag className="h-4 w-4 text-red-500" aria-hidden="true" /> {t('Promotion (facultatif)')}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-gray-600">
          {t('Réduction (%)')}
          <input type="number" min="0" max="90" className={`${input} mt-1`} value={percent ?? 0}
            onChange={(e) => onChange({ discountPercent: e.target.value })} />
        </label>
        <label className="text-xs font-semibold text-gray-600">
          {t("Jusqu'au (vide = sans fin)")}
          <input type="date" className={`${input} mt-1`} value={until ? String(until).slice(0, 10) : ''}
            onChange={(e) => onChange({ discountUntil: e.target.value })} />
        </label>
      </div>
      <p className="mt-2 text-xs text-gray-500">{t('Le prix barré et le pourcentage s’affichent sur votre annonce tant que la promotion est active.')}</p>
    </fieldset>
  );
}
