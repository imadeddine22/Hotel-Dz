'use client';

import { useT } from '@/lib/i18n/useT';
import { SCORE_CATEGORIES, scoreWord } from '@/lib/scores';
import { formatDZD } from '@/lib/data';

/** Booking.com-style score: "8,7" square + "Très bien · 12 avis" ("Nouveau" without reviews). */
export function ScoreBadge({ score, count, size = 'md', className = '' }) {
  const { t, lang } = useT();
  const has = count > 0 && score > 0;
  const box = size === 'lg' ? 'h-11 min-w-[2.75rem] text-lg' : 'h-8 min-w-[2rem] text-sm';
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {has && (
        <span className={`${box} inline-flex items-center justify-center rounded-lg rounded-bl-none bg-brand-600 px-1.5 font-extrabold text-white`} dir="ltr">
          {Number(score).toLocaleString(lang === 'ar' ? 'ar-DZ' : lang === 'en' ? 'en-GB' : 'fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </span>
      )}
      <span className="leading-tight">
        <span className="block text-sm font-bold text-gray-900">{t(scoreWord(score, count))}</span>
        {has && <span className="block text-xs text-gray-500">{t('{n} avis', { n: count })}</span>}
      </span>
    </span>
  );
}

/** Category bars (cleanliness, location…) from the listing's `scores`. */
export function ScoreBars({ scores }) {
  const { t } = useT();
  const rows = SCORE_CATEGORIES.filter(([k]) => scores?.[k] > 0);
  if (!rows.length) return null;
  return (
    <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
      {rows.map(([k, label]) => (
        <div key={k}>
          <div className="mb-1 flex justify-between text-sm">
            <dt className="text-gray-600">{t(label)}</dt>
            <dd className="font-bold text-gray-900" dir="ltr">{Number(scores[k]).toFixed(1)}</dd>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${(scores[k] / 10) * 100}%` }} />
          </div>
        </div>
      ))}
    </dl>
  );
}

/** Price with a running deal: strikethrough original + "-15 %" chip. */
export function DealPrice({ price, original, discountPercent, currency, className = 'text-xl font-extrabold text-brand-600' }) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      {discountPercent > 0 && original > price && (
        <>
          <span className="rounded bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white" dir="ltr">-{discountPercent} %</span>
          <s className="text-sm text-gray-400">{formatDZD(original, currency)}</s>
        </>
      )}
      <span className={className}>{formatDZD(price, currency)}</span>
    </span>
  );
}
