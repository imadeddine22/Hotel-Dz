'use client';

import { useEffect, useState } from 'react';
import { Megaphone, Copy, Check, ExternalLink, Download } from 'lucide-react';
import api from '@/lib/api';
import { useT } from '@/lib/i18n/useT';

/** Minimal CSV reader for the preview (quoted cells, "" escapes). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r' && c !== '﻿') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function CopyUrl({ url }) {
  const { t } = useT();
  const [done, setDone] = useState(false);
  return (
    <div className="flex gap-2">
      <input readOnly value={url} dir="ltr" onFocus={(e) => e.target.select()} className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700" />
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(url).catch(() => window.prompt('URL', url));
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        }}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-ink px-3 py-2 text-xs font-bold text-white"
      >
        {done ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />} {done ? t('Copié') : t('Copier')}
      </button>
    </div>
  );
}

/** Admin: the Meta (Facebook / Instagram) catalog of all published listings, for catalog ads. */
export default function AdminMetaPage() {
  const { t } = useT();
  const base = `${api.defaults.baseURL}/feeds/meta-catalog.csv`;
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/feeds/meta-catalog.csv', { responseType: 'text', localize: false })
      .then(({ data }) => setRows(parseCsv(String(data))))
      .catch((e) => setError(e.message));
  }, []);

  const header = rows?.[0] || [];
  const items = (rows || []).slice(1).filter((r) => r.length > 1);
  const col = (r, name) => r[header.indexOf(name)] || '';
  const counts = items.reduce((m, r) => ({ ...m, [col(r, 'custom_label_0')]: (m[col(r, 'custom_label_0')] || 0) + 1 }), {});

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-blue-600" aria-hidden="true" /> {t('Publicité Meta (Facebook & Instagram)')}
        </h1>
        <p className="admin-page-subtitle">{t('Toutes vos annonces publiées, prêtes pour les publicités catalogue de Meta.')}</p>
      </div>

      <section className="mb-6 rounded-2xl bg-white p-5 shadow-card">
        <h2 className="mb-3 text-lg font-bold text-ink">{t('Lien du catalogue')}</h2>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-500">{t('Catalogue en français')}</p>
            <CopyUrl url={base} />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-500">{t('Catalogue en arabe')}</p>
            <CopyUrl url={`${base}?lang=ar`} />
          </div>
        </div>

        <ol className="mt-5 list-decimal space-y-1.5 ps-5 text-sm text-gray-700">
          <li>{t('Ouvrez Meta Commerce Manager et créez un catalogue (type « E-commerce »).')}</li>
          <li>{t('Sources de données → Flux de données programmé → collez le lien ci-dessus, mise à jour quotidienne.')}</li>
          <li>{t('Dans Ads Manager, créez une campagne « Ventes du catalogue » (Advantage+) avec ce catalogue.')}</li>
          <li>{t('Meta crée alors automatiquement des pubs (carrousels) avec vos hôtels, maisons et biens, et les montre aux personnes intéressées.')}</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="https://business.facebook.com/commerce/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90">
            {t('Ouvrir Commerce Manager')} <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href="https://adsmanager.facebook.com/adsmanager/manage/campaigns" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50">
            {t('Ouvrir Meta Ads Manager')} <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href={base} download className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" aria-hidden="true" /> {t('Télécharger le fichier (CSV)')}
          </a>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          {t('Le lien doit être celui du site en ligne (pas localhost) pour que Meta puisse le lire. Les propriétaires peuvent aussi promouvoir chaque annonce depuis leur espace (bouton « Promouvoir »).')}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-ink">{t('Aperçu du catalogue')}</h2>
          {rows && (
            <p className="text-sm text-gray-500">
              {t('{n} annonce(s)', { n: items.length })} · {t('Hôtels')} {counts.hotel || 0} · {t('Maisons')} {counts.house || 0} · {t('Ventes')} {counts.sale || 0}
            </p>
          )}
        </div>
        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : !rows ? (
          <p className="text-sm text-gray-400">{t('Chargement...')}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400">{t('Aucune annonce publiée avec photo et prix.')}</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.slice(0, 30).map((r) => (
              <li key={col(r, 'id')} className="flex items-center gap-3 py-2.5">
                <img src={col(r, 'image_link')} alt="" className="h-12 w-16 shrink-0 rounded-lg bg-gray-100 object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{col(r, 'title')}</p>
                  <p className="truncate text-xs text-gray-500">{col(r, 'product_type')}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-brand-600" dir="ltr">{col(r, 'price')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
