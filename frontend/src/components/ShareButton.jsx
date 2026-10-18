'use client';

import { useEffect, useRef, useState } from 'react';
import { Share2, Facebook, MessageCircle, Send, Mail, Link2, Check, Twitter } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

/** Page URL to share: this page, without the query, tagged so shared visits show up in analytics. */
const shareUrl = (source) => {
  const u = new URL(window.location.href);
  u.search = '';
  u.hash = '';
  u.searchParams.set('utm_source', source);
  u.searchParams.set('utm_medium', 'share');
  return u.toString();
};

/**
 * "Partager" for a hotel, house or property: the phone's own share sheet when there is one
 * (WhatsApp, Messenger, Instagram… all at once), otherwise a menu of the usual networks + copy link.
 * The shared link shows the listing photo and title thanks to the page's Open Graph tags.
 */
export default function ShareButton({ title, text = '', className = '' }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alignRight, setAlignRight] = useState(true); // menu opens toward the side with room
  const [notice, setNotice] = useState('');
  const box = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => !box.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    // phones: native share sheet
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title, text: text || title, url: shareUrl('native') });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return; // closed by the user
      }
    }
    const r = e.currentTarget.getBoundingClientRect();
    setAlignRight(r.left + r.width / 2 > window.innerWidth / 2);
    setOpen((o) => !o);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl('copy'));
    } catch {
      window.prompt(t('Copiez ce lien :'), shareUrl('copy'));
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Facebook never lets a site pre-fill the post text: copy it so the user only has to paste it
  const facebookCopy = async () => {
    const local = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
    try {
      await navigator.clipboard.writeText(`${text || title}\n${shareUrl('facebook')}`);
      setNotice(t('Texte copié : collez-le dans votre publication Facebook (Ctrl+V ou appui long → Coller).') + (local ? ` ${t('En local, Facebook ne peut pas afficher l’aperçu du lien : il apparaîtra une fois le site en ligne.')}` : ''));
    } catch {
      if (local) setNotice(t('En local, Facebook ne peut pas afficher l’aperçu du lien : il apparaîtra une fois le site en ligne.'));
    }
    setTimeout(() => setNotice(''), 9000);
  };

  const enc = encodeURIComponent;
  const message = text || title;
  const targets = [
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-500', href: () => `https://wa.me/?text=${enc(`${message}\n${shareUrl('whatsapp')}`)}` },
    { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600', href: () => `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl('facebook'))}` },
    { key: 'telegram', label: 'Telegram', icon: Send, color: 'text-sky-500', href: () => `https://t.me/share/url?url=${enc(shareUrl('telegram'))}&text=${enc(message)}` },
    { key: 'x', label: 'X (Twitter)', icon: Twitter, color: 'text-gray-900', href: () => `https://twitter.com/intent/tweet?url=${enc(shareUrl('x'))}&text=${enc(message)}` },
    { key: 'email', label: t('Email'), icon: Mail, color: 'text-gray-500', href: () => `mailto:?subject=${enc(title)}&body=${enc(`${message}\n\n${shareUrl('email')}`)}` },
  ];

  return (
    <div ref={box} className={`relative ${className}`}>
      <button
        type="button"
        onClick={onClick}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('Partager')}
        title={t('Partager')}
        className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-gray-700 shadow-md backdrop-blur transition hover:scale-105 hover:text-brand-600"
      >
        <Share2 className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>

      {open && (
        <div role="menu" className={`absolute ${alignRight ? 'right-0' : 'left-0'} top-12 z-30 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white py-1.5 text-sm shadow-xl`}>
          <p className="px-4 pb-1 pt-1.5 text-xs font-bold uppercase tracking-wide text-gray-400 rtl:tracking-normal">{t('Partager')}</p>
          {targets.map(({ key, label, icon: Icon, color, href }) => (
            <a
              key={key}
              role="menuitem"
              href={href()}
              target={key === 'email' ? undefined : '_blank'}
              rel="noopener noreferrer"
              onClick={() => {
                if (key === 'facebook') facebookCopy();
                setOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" /> {label}
            </a>
          ))}
          <button type="button" role="menuitem" onClick={copy} className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-2.5 text-start font-semibold text-gray-700 hover:bg-gray-50">
            {copied ? <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" /> : <Link2 className="h-4 w-4 text-gray-500" aria-hidden="true" />}
            {copied ? t('Lien copié !') : t('Copier le lien')}
          </button>
        </div>
      )}

      {notice && (
        <p role="status" className="fixed inset-x-4 bottom-4 z-[120] mx-auto max-w-md rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-2xl">
          {notice}
        </p>
      )}
    </div>
  );
}
