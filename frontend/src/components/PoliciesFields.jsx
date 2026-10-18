'use client';

import { useState } from 'react';
import { Zap, Plus, X } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

export const DEFAULT_POLICIES = {
  checkInFrom: '14:00',
  checkOutUntil: '12:00',
  freeCancellationDays: 2,
  childrenAllowed: true,
  petsAllowed: false,
  smokingAllowed: false,
  instantBooking: false,
  customRules: [],
};

/** Policies of a listing as edited in a form (defaults filled in). */
export const policiesOf = (listing) => ({ ...DEFAULT_POLICIES, ...(listing?.policies || {}) });

const CANCEL_DAYS = [0, 1, 2, 3, 5, 7, 14, 30];

// Frequent house rules in Algeria, one click to add (the owner can also type any rule)
export const RULE_SUGGESTIONS = [
  'Familles uniquement',
  'Couples mariés uniquement (livret de famille)',
  'Pas de fêtes ni d’événements',
  'Calme après 22 h',
  'Pièce d’identité exigée à l’arrivée',
];
const MAX_RULES = 10;

/** Booking.com-style policies section of an owner/admin listing form. */
export default function PoliciesFields({ value, onChange }) {
  const { t } = useT();
  const p = { ...DEFAULT_POLICIES, ...(value || {}) };
  const set = (k, v) => onChange({ ...p, [k]: v });
  const [draft, setDraft] = useState('');
  const rules = p.customRules || [];
  const addRule = (text) => {
    const r = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    if (!r || rules.length >= MAX_RULES || rules.some((x) => x.toLowerCase() === r.toLowerCase())) return;
    set('customRules', [...rules, r]);
    setDraft('');
  };
  const input = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500';

  return (
    <fieldset className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4" style={{ gridColumn: '1 / -1' }}>
      <legend className="px-1 text-sm font-bold text-gray-800">{t('Règles et conditions')}</legend>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/70 p-3">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-amber-500" checked={p.instantBooking} onChange={(e) => set('instantBooking', e.target.checked)} />
        <span>
          <span className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
            <Zap className="h-4 w-4 text-amber-500" aria-hidden="true" /> {t('Réservation instantanée')}
          </span>
          <span className="block text-xs text-gray-500">
            {t('Les réservations sont confirmées immédiatement, sans votre validation. Sinon, chaque demande attend votre réponse (48 h).')}
          </span>
        </span>
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-semibold text-gray-600">
          {t('Arrivée à partir de')}
          <input type="time" className={`${input} mt-1`} value={p.checkInFrom} onChange={(e) => set('checkInFrom', e.target.value)} />
        </label>
        <label className="text-xs font-semibold text-gray-600">
          {t('Départ avant')}
          <input type="time" className={`${input} mt-1`} value={p.checkOutUntil} onChange={(e) => set('checkOutUntil', e.target.value)} />
        </label>
        <label className="text-xs font-semibold text-gray-600">
          {t('Annulation gratuite')}
          <select className={`${input} mt-1`} value={p.freeCancellationDays} onChange={(e) => set('freeCancellationDays', Number(e.target.value))}>
            {CANCEL_DAYS.map((d) => (
              <option key={d} value={d}>
                {d === 0 ? t('Non remboursable / pas d’annulation gratuite') : t("Jusqu'à {n} jour(s) avant l'arrivée", { n: d })}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-700">
        {[
          ['childrenAllowed', t('Enfants acceptés')],
          ['petsAllowed', t('Animaux acceptés')],
          ['smokingAllowed', t('Fumeurs acceptés')],
        ].map(([k, label]) => (
          <label key={k} className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="h-4 w-4 accent-brand-500" checked={p[k]} onChange={(e) => set(k, e.target.checked)} />
            {label}
          </label>
        ))}
      </div>

      {/* Owner's own rules, e.g. "Familles uniquement" */}
      <div className="space-y-2 border-t border-gray-100 pt-3">
        <p className="text-xs font-semibold text-gray-600">{t('Autres règles (facultatif)')}</p>
        {rules.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {rules.map((r) => (
              <li key={r} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {t(r)}
                <button type="button" onClick={() => set('customRules', rules.filter((x) => x !== r))} aria-label={`${t('Retirer')} : ${t(r)}`} className="rounded-full p-0.5 hover:bg-brand-100">
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-1.5">
          {RULE_SUGGESTIONS.filter((r) => !rules.includes(r)).map((r) => (
            <button key={r} type="button" onClick={() => addRule(r)} disabled={rules.length >= MAX_RULES}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-xs text-gray-600 transition hover:border-brand-400 hover:text-brand-600 disabled:opacity-40">
              <Plus className="h-3 w-3" aria-hidden="true" /> {t(r)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label htmlFor="custom-rule" className="sr-only">{t('Ajouter une règle')}</label>
          <input
            id="custom-rule"
            value={draft}
            maxLength={80}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRule(draft); } }}
            placeholder={t('Ex : Familles uniquement')}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button type="button" onClick={() => addRule(draft)} disabled={!draft.trim() || rules.length >= MAX_RULES}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-40">
            <Plus className="h-4 w-4" aria-hidden="true" /> {t('Ajouter')}
          </button>
        </div>
      </div>
    </fieldset>
  );
}
