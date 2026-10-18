'use client';

import { Clock, CalendarX, CalendarCheck, Baby, PawPrint, Cigarette, Zap, Check, X, Info } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';
import { DEFAULT_POLICIES } from '@/components/PoliciesFields';

const of = (policies) => ({ ...DEFAULT_POLICIES, ...(policies || {}) });

/** "Réservation instantanée" / "Annulation gratuite" chips for cards and detail headers. */
export function PolicyBadges({ policies, className = '' }) {
  const { t } = useT();
  const p = of(policies);
  if (!p.instantBooking && !p.freeCancellationDays) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {p.instantBooking && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
          <Zap className="h-3 w-3" aria-hidden="true" /> {t('Réservation instantanée')}
        </span>
      )}
      {p.freeCancellationDays > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
          <Check className="h-3 w-3" aria-hidden="true" /> {t('Annulation gratuite')}
        </span>
      )}
    </div>
  );
}

/** Text of the cancellation policy. */
export function cancellationText(t, policies) {
  const d = of(policies).freeCancellationDays;
  return d > 0
    ? t("Annulation gratuite jusqu'à {n} jour(s) avant l'arrivée.", { n: d })
    : t("Pas d'annulation gratuite : prévenez l'établissement si vous ne pouvez pas venir.");
}

/** House rules section of a hotel / house page. */
export default function Policies({ policies }) {
  const { t } = useT();
  const p = of(policies);
  const Rule = ({ icon: Icon, ok, label }) => (
    <li className="flex items-center gap-3 text-sm text-gray-700">
      <Icon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
      <span className="flex-1">{label}</span>
      {ok === undefined ? null : ok ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check className="h-4 w-4" aria-hidden="true" /> {t('Oui')}</span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500"><X className="h-4 w-4" aria-hidden="true" /> {t('Non')}</span>
      )}
    </li>
  );

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" aria-labelledby="house-rules">
      <h2 id="house-rules" className="text-lg font-bold text-gray-900">{t('Règles et conditions')}</h2>
      {p.instantBooking && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <Zap className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {t('Réservation instantanée : votre réservation est confirmée immédiatement, sans attendre le propriétaire.')}
        </p>
      )}
      <ul className="mt-4 space-y-3">
        <Rule icon={CalendarCheck} label={`${t('Arrivée')} : ${t('à partir de {time}', { time: p.checkInFrom })}`} />
        <Rule icon={Clock} label={`${t('Départ')} : ${t('avant {time}', { time: p.checkOutUntil })}`} />
        <Rule icon={CalendarX} label={cancellationText(t, p)} />
        <Rule icon={Baby} label={t('Enfants')} ok={p.childrenAllowed} />
        <Rule icon={PawPrint} label={t('Animaux')} ok={p.petsAllowed} />
        <Rule icon={Cigarette} label={t('Fumeurs')} ok={p.smokingAllowed} />
        {(p.customRules || []).map((r) => (
          <Rule key={r} icon={Info} label={t(r)} />
        ))}
      </ul>
      <p className="mt-4 text-xs text-gray-400">{t('Paiement sur place, à l’arrivée.')}</p>
    </section>
  );
}
