'use client';

import { useEffect, useMemo, useState } from 'react';
import { Megaphone, X, Copy, Check, Facebook, MessageCircle, ExternalLink, Download, Instagram } from 'lucide-react';
import { getImageUrl } from '@/lib/api';
import { translate } from '@/lib/i18n';
import { useT } from '@/lib/i18n/useT';

const PATHS = { hotel: '/hotels', house: '/houses', sale: '/sales' };
const ICON = { hotel: '🏨', house: '🏡', sale: '🏠' };

/** Link to the listing in `lang`, tagged so Meta ad visits show up in analytics. */
const listingUrl = (kind, listing, lang, source = 'facebook', medium = 'paid') => {
  const u = new URL(`${lang === 'fr' ? '' : `/${lang}`}${PATHS[kind]}/${listing._id}`, window.location.origin);
  u.searchParams.set('utm_source', source);
  u.searchParams.set('utm_medium', medium);
  u.searchParams.set('utm_campaign', `${kind}_${listing._id}`);
  return u.toString();
};

/** Ready-to-paste ad text in `lang` (French or Arabic). */
function adText(kind, listing, lang, link) {
  const tr = (k, v) => translate(lang, k, v);
  const name = listing.name || listing.title || '';
  const city = tr(listing.city || '');
  const wilaya = tr(listing.wilaya || '');
  const price = Number(listing.price || listing.pricePerNight || 0);
  const amount = price ? `${price.toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')} ${listing.currency || 'DZD'}` : '';
  const lines = [
    `${ICON[kind]} ${name} — ${city}${wilaya && wilaya !== city ? `, ${wilaya}` : ''}`,
    kind === 'sale' && amount ? tr('💰 Prix : {amount}', { amount }) : '',
    kind === 'house' && amount ? tr('💰 {amount} la nuit', { amount }) : '',
    kind === 'sale' ? tr('📞 Contactez le vendeur directement sur Meskan') : tr('✅ Réservation gratuite sur Meskan, paiement sur place à l’arrivée'),
    `👉 ${link}`,
  ];
  return lines.filter(Boolean).join('\n');
}

function CopyField({ label, value, rows = 1 }) {
  const { t } = useT();
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      window.prompt(label, value);
    }
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };
  const Field = rows > 1 ? 'textarea' : 'input';
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-gray-500">{label}</p>
      <div className="flex gap-2">
        <Field readOnly value={value} rows={rows} dir="auto" className="min-w-0 flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700" onFocus={(e) => e.target.select()} />
        <button type="button" onClick={copy} className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg bg-ink px-3 py-2 text-xs font-bold text-white hover:opacity-90">
          {done ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {done ? t('Copié') : t('Copier')}
        </button>
      </div>
    </div>
  );
}

/**
 * "Promouvoir" for an owner's / seller's published listing: free sharing, plus everything needed
 * to run a paid Facebook / Instagram ad in Meta Ads Manager (text in French and Arabic, tracked link, photo).
 */
export default function PromoteListing({ kind, listing, className = '' }) {
  const { t, lang: uiLang } = useT();
  const [open, setOpen] = useState(false);
  const [adLang, setAdLang] = useState(uiLang === 'ar' ? 'ar' : 'fr');
  const published = listing.status === 'approved';
  const [fbNotice, setFbNotice] = useState('');
  const local = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open]);

  const data = useMemo(() => {
    if (!open) return null;
    const adLink = listingUrl(kind, listing, adLang);
    return {
      adLink,
      text: adText(kind, listing, adLang, adLink),
      shareLink: listingUrl(kind, listing, adLang, 'facebook', 'share'),
      whatsapp: listingUrl(kind, listing, adLang, 'whatsapp', 'share'),
    };
  }, [open, adLang, kind, listing]);

  const image = getImageUrl(listing.images?.[0]?.url || listing.images?.[0]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setAdLang(uiLang === 'ar' ? 'ar' : 'fr'); // same language as the owner's screen
          setOpen(true);
        }}
        disabled={!published}
        title={published ? t('Promouvoir sur Facebook et Instagram') : t('Disponible une fois l’annonce validée')}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      >
        <Megaphone className="h-4 w-4" aria-hidden="true" /> {t('Promouvoir')}
      </button>

      {open && data && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="promote-title"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="promote-title" className="flex items-center gap-2 text-lg font-extrabold text-ink">
                  <Megaphone className="h-5 w-5 text-blue-600" aria-hidden="true" /> {t('Promouvoir sur Facebook et Instagram')}
                </h2>
                <p className="text-xs text-gray-500">{listing.name || listing.title}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={t('Fermer')} className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-100">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* 1. Free */}
            <section className="mb-5">
              <h3 className="mb-2 text-sm font-bold text-ink">{t('1. Partagez gratuitement')}</h3>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.shareLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    // Facebook never lets a site pre-fill the post text: copy it, the owner pastes it
                    navigator.clipboard
                      ?.writeText(data.text.replace(data.adLink, data.shareLink))
                      .then(() => setFbNotice(t('Texte copié : collez-le dans votre publication Facebook (Ctrl+V ou appui long → Coller).')))
                      .catch(() => {});
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] py-2.5 text-sm font-bold text-white hover:opacity-90">
                  <Facebook className="h-4 w-4" aria-hidden="true" /> Facebook
                </a>
                <a href={`https://wa.me/?text=${encodeURIComponent(data.text.replace(data.adLink, data.whatsapp))}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white hover:opacity-90">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
                </a>
              </div>
              {fbNotice && <p role="status" className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">{fbNotice}</p>}
              {local && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {t('En local, Facebook ne peut pas afficher l’aperçu du lien : il apparaîtra une fois le site en ligne.')}
                </p>
              )}
            </section>

            {/* 2. Paid ad */}
            <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
              <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-ink">
                {t('2. Lancez une publicité (Meta Ads)')} <Instagram className="h-4 w-4 text-pink-500" aria-hidden="true" />
              </h3>
              <ol className="mb-4 list-decimal space-y-0.5 ps-5 text-xs text-gray-600">
                <li>{t('Ouvrez Meta Ads Manager (ou « Booster » depuis votre Page Facebook).')}</li>
                <li>{t('Objectif « Trafic » ou « Messages », zone : votre wilaya et les grandes villes.')}</li>
                <li>{t('Ajoutez la photo, collez le texte et le lien ci-dessous, choisissez votre budget.')}</li>
              </ol>

              <div className="mb-3 flex gap-1.5" role="tablist" aria-label={t('Langue de la publicité')}>
                {[['fr', 'Français'], ['ar', 'العربية']].map(([code, label]) => (
                  <button key={code} type="button" role="tab" aria-selected={adLang === code} onClick={() => setAdLang(code)}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${adLang === code ? 'bg-ink text-white' : 'border border-gray-200 bg-white text-gray-600'}`}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 rounded-xl border border-gray-100 bg-white p-2.5">
                  {image ? <img src={image} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" /> : <div className="h-20 w-28 shrink-0 rounded-lg bg-gray-100" />}
                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-line text-xs leading-relaxed text-gray-700" dir={adLang === 'ar' ? 'rtl' : 'ltr'}>{data.text.split('\n').slice(0, -1).join('\n')}</p>
                    {image && (
                      <a href={image} download target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline">
                        <Download className="h-3.5 w-3.5" aria-hidden="true" /> {t('Télécharger la photo')}
                      </a>
                    )}
                  </div>
                </div>
                <CopyField label={t('Texte de la publicité')} value={data.text} rows={5} />
                <CopyField label={t('Lien de destination (suivi des visites)')} value={data.adLink} />
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a href="https://adsmanager.facebook.com/adsmanager/manage/campaigns" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] py-2.5 text-sm font-bold text-white hover:opacity-90">
                  {t('Ouvrir Meta Ads Manager')} <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                <a href="https://business.facebook.com/latest/ad_center" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50">
                  {t('Booster depuis ma Page')} <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
                {t('La publicité est payée directement à Meta avec votre propre compte. Meskan ne prélève rien.')}
              </p>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
