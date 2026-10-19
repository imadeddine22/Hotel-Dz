'use client';

import { MapPin, Maximize2, Handshake, Users } from 'lucide-react';
import Link from '@/components/LocaleLink';
import { getImageUrl } from '@/lib/api';
import { formatDZD } from '@/lib/data';
import { formatArea, PROJECT_COLORS } from '@/lib/projects';
import { useT } from '@/lib/i18n/useT';

/** Card of an investment project (land or property + project idea) in the /investir list. */
export default function ProjectCard({ project: p }) {
  const { t, lang } = useT();
  const cover = getImageUrl(p.images?.[0]?.url || p.images?.[0]);
  return (
    <Link href={`/investir/${p._id}`} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {cover && <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
        <span className="absolute start-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold shadow" style={{ color: PROJECT_COLORS.ink }}>
          {t(p.assetType || 'Terrain')} · {t(p.projectType)}
        </span>
        <span className="absolute bottom-3 start-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" /> {formatArea(p.area, lang)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-bold leading-snug" style={{ color: PROJECT_COLORS.ink }} dir="auto">{p.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-4 w-4 shrink-0 text-[#00B3D2]" aria-hidden="true" /> {t(p.city)}, {t(p.wilaya)}
        </p>
        <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
          <Handshake className="h-4 w-4" aria-hidden="true" /> {t(p.partnership)}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
          <div>
            <p className="text-[11px] text-slate-400">{t('Investissement estimé')}</p>
            <p className="font-extrabold" style={{ color: PROJECT_COLORS.ink }}>{p.budget ? formatDZD(p.budget) : t('À définir')}</p>
          </div>
          {p.interestsCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500" title={t('Investisseurs intéressés')}>
              <Users className="h-4 w-4" aria-hidden="true" /> {p.interestsCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
