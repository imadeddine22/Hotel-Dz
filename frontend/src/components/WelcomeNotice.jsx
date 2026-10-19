'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, Facebook, Instagram, Youtube, Search, Users, Megaphone, Music2, MoreHorizontal, MapPinned, BadgePercent, CalendarCheck, Send, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { splitLocale } from '@/lib/i18n/locale';
import { useT } from '@/lib/i18n/useT';

// Same list as the Referral model on the API
const SOURCES = [
  { value: 'Facebook', icon: Facebook },
  { value: 'Instagram', icon: Instagram },
  { value: 'TikTok', icon: Music2 },
  { value: 'YouTube', icon: Youtube },
  { value: 'Google', icon: Search },
  { value: 'Ami ou famille', icon: Users },
  { value: 'Publicité', icon: Megaphone },
  { value: 'Autre', icon: MoreHorizontal },
];

const KEY = 'meskan-welcome'; // { state: 'answered' | 'closed', at }
const REMIND_AFTER_CLOSE = 30 * 86400000; // closed without answering: ask again a month later
const DELAY = 4000; // let the visitor see the page first

// Spaces, forms and private pages: never interrupt there
const HIDDEN = /^\/(admin|owner|seller|investor|login|register|forgot-password|reset-password|booking|messages|projects)(\/|$)/;

const INK = '#152A41';
const GRADIENT = 'linear-gradient(135deg, #0DD5C4, #00B3D2)';

/** Small welcome notification (once per visitor): who we are + "How did you hear about us?" → admin. */
export default function WelcomeNotice() {
  const { t, lang } = useT();
  const path = splitLocale(usePathname() || '/').path;
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState('');
  const [other, setOther] = useState('');
  const [state, setState] = useState(''); // '' | sending | done | error message

  useEffect(() => {
    if (HIDDEN.test(path)) return undefined;
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(KEY));
    } catch {
      saved = null;
    }
    if (saved?.state === 'answered') return undefined;
    if (saved?.state === 'closed' && Date.now() - saved.at < REMIND_AFTER_CLOSE) return undefined;
    const timer = setTimeout(() => setOpen(true), DELAY);
    return () => clearTimeout(timer);
  }, [path]);

  useEffect(() => {
    if (!open) return undefined;
    const esc = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  });

  const remember = (value) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ state: value, at: Date.now() }));
    } catch {
      /* private mode: it will simply show again */
    }
  };

  const close = () => {
    if (state !== 'done') remember('closed');
    setOpen(false);
  };

  const send = async (e) => {
    e.preventDefault();
    if (!source) return;
    setState('sending');
    try {
      await api.post('/referrals', { source, other: source === 'Autre' ? other.trim() : '', lang, page: path });
      remember('answered');
      setState('done');
      setTimeout(() => setOpen(false), 2500);
    } catch (err) {
      setState(err.message);
    }
  };

  if (!open || HIDDEN.test(path)) return null;

  return (
    // Centered over a dimmed page (like a pop-up ad); a click outside or Escape closes it
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm animate-[welcome-fade_.25s_ease-out]" onClick={close}>
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 animate-[welcome-in_.35s_ease-out]"
    >
      {/* Header: brand + what Meskan is */}
      <div className="relative px-6 pb-5 pt-6 text-white" style={{ background: `linear-gradient(135deg, ${INK}, #0b4a5c 65%, #00B3D2)` }}>
        <button type="button" onClick={close} aria-label={t('Fermer')} className="absolute end-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/brand/meskan-mark-white.png" alt="" className="h-8 w-8 object-contain" />
          <span className="text-lg font-black">{t('Meskan')}</span>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#0b2a3a] rtl:tracking-normal" style={{ background: GRADIENT }}>
            {t('Bienvenue')}
          </span>
        </div>
        <p id="welcome-title" className="mt-4 text-xl font-extrabold leading-snug">
          {t('Hôtels, locations, ventes et investissement dans toute l’Algérie')}
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
          {[
            [MapPinned, '69 wilayas'],
            [BadgePercent, 'Sans commission'],
            [CalendarCheck, 'Réservation gratuite'],
          ].map(([Icon, label]) => (
            <li key={label} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/20">
              <Icon className="h-3.5 w-3.5 text-[#0DD5C4]" aria-hidden="true" /> {t(label)}
            </li>
          ))}
        </ul>
      </div>

      {/* The question */}
      {state === 'done' ? (
        <p className="flex items-center gap-2 px-5 py-6 text-sm font-bold" style={{ color: INK }}>
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" /> {t('Merci ! Bonne visite sur Meskan.')}
        </p>
      ) : (
        <form onSubmit={send} className="px-6 pb-6 pt-5">
          <p className="text-base font-extrabold" style={{ color: INK }}>{t('Comment nous avez-vous connus ?')}</p>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {SOURCES.map(({ value, icon: Icon }) => {
              const on = source === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSource(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 text-[11px] font-bold leading-tight transition ${on ? 'text-white shadow' : 'bg-slate-50 text-slate-600 ring-1 ring-slate-100 hover:bg-slate-100'}`}
                  style={on ? { background: GRADIENT } : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="line-clamp-2 text-center">{t(value)}</span>
                </button>
              );
            })}
          </div>
          {source === 'Autre' && (
            <input
              value={other}
              onChange={(e) => setOther(e.target.value)}
              maxLength={120}
              autoFocus
              placeholder={t('Dites-nous où (facultatif)')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#00B3D2]"
            />
          )}
          {state && state !== 'sending' && <p className="mt-2 text-xs font-semibold text-red-600">{state}</p>}
          <div className="mt-3 flex items-center justify-between gap-2">
            <button type="button" onClick={close} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
              {t('Plus tard')}
            </button>
            <button type="submit" disabled={!source || state === 'sending'} className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold text-white shadow transition disabled:opacity-40" style={{ background: GRADIENT }}>
              <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" /> {state === 'sending' ? t('Envoi...') : t('Envoyer')}
            </button>
          </div>
        </form>
      )}
    </aside>
    </div>
  );
}
