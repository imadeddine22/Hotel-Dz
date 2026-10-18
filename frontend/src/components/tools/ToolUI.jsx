'use client';

import { useId } from 'react';

import { useT } from '@/lib/i18n/useT';
export const fmt = (n) =>
  Number.isFinite(n) ? new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(Math.round(n)) : '—';

export const fmtPct = (n) => (Number.isFinite(n) ? `${n.toFixed(1).replace('.', ',')} %` : '—');

/** Labelled numeric input with unit suffix and optional helper text. */
export function NumberField({ label, value, onChange, unit, min = 0, max, step = 1, help }) {
  const id = useId();
  const helpId = help ? `${id}-help` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="mt-1 flex items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-cyan-600 focus-within:ring-2 focus-within:ring-cyan-600/20">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-describedby={helpId}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className="min-h-[44px] w-full px-3 text-base tabular-nums text-slate-900 outline-none"
        />
        {unit && (
          <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">{unit}</span>
        )}
      </div>
      {help && (
        <p id={helpId} className="mt-1 text-xs text-slate-500">
          {help}
        </p>
      )}
    </div>
  );
}

export function ResultCard({ label, value, unit = 'DA', highlight = false }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-900'}`}>
      <dt className={`text-xs font-semibold uppercase tracking-wide ${highlight ? 'text-slate-300' : 'text-slate-500'}`}>{label}</dt>
      <dd className="mt-1 text-2xl font-bold tabular-nums">
        {value}
        {unit && value !== '—' && <span className="ml-1 text-sm font-medium">{unit}</span>}
      </dd>
    </div>
  );
}

/** Two-column calculator layout: inputs on the left, live results on the right. */
export function ToolLayout({ inputs, results }) {
  const { t } = useT();
  return (
    <div className="grid gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 md:p-6">
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label={t('Paramètres du calcul')}>
        {inputs}
      </form>
      <section aria-live="polite" aria-label={t('Résultats')}>
        <dl className="grid gap-3">{results}</dl>
      </section>
    </div>
  );
}
