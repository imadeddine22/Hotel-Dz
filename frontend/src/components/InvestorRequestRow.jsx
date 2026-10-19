'use client';

import { CheckCheck, Clock } from 'lucide-react';
import Link from '@/components/LocaleLink';
import { getImageUrl } from '@/lib/api';
import { formatDZD } from '@/lib/data';
import { PROJECT_COLORS } from '@/lib/projects';
import { dateLocale } from '@/lib/i18n/format';
import { useT } from '@/lib/i18n/useT';

/** One request an investor sent: the project, the amount, the message, and whether the owner has read it. */
export default function InvestorRequestRow({ request: r, full = false }) {
  const { t } = useT();
  const p = r.project;
  const cover = getImageUrl(p.images?.[0]?.url || p.images?.[0]);
  return (
    <li className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
      <Link href={`/investir/${p._id}`} className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {cover && <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Link href={`/investir/${p._id}`} className="line-clamp-1 font-bold hover:underline" style={{ color: PROJECT_COLORS.ink }} dir="auto">
            {p.title}
          </Link>
          {r.seen ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" /> {t('Lue par le propriétaire')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {t('Pas encore lue')}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {t(p.assetType || 'Terrain')} · {t(p.city)}, {t(p.wilaya)} · {p.reference}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {t('Envoyée le {date}', { date: new Date(r.createdAt).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'long', year: 'numeric' }) })}
          {r.amount ? ` · ${t('Montant proposé')} : ${formatDZD(r.amount)}` : ''}
        </p>
        {full && <p className="mt-2 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm text-slate-700" dir="auto">{r.message}</p>}
      </div>
    </li>
  );
}
