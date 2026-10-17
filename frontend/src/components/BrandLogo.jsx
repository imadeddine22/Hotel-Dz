'use client';

import { useT } from '@/lib/i18n/useT';

const ICON = { dark: '/brand/meskan-mark.png', light: '/brand/meskan-mark-white.png' };

/** Brand name as shown in each language. */
export const brandName = (lang) => (lang === 'ar' ? 'مسكن' : 'Meskan dz');

/**
 * Logo = icon + brand name as live text («مسكن» in Arabic, "Meskan dz" otherwise).
 * `className` sets the icon height (e.g. "h-10"), `textClassName` the name's size.
 * Pass alt="" when the surrounding link/element already names the brand.
 */
export default function BrandLogo({ variant = 'dark', className = 'h-10', textClassName = 'text-2xl', alt, priority = false }) {
  const { lang } = useT();
  const name = brandName(lang);
  const decorative = alt === '';
  return (
    <span
      className={`inline-flex items-center gap-2 select-none ${variant === 'light' ? 'text-white' : 'text-brand-500'}`}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : alt ?? name}
      aria-hidden={decorative ? true : undefined}
    >
      <img
        src={ICON[variant]}
        alt=""
        width={208}
        height={208}
        className={`${className} w-auto`}
        draggable={false}
        fetchPriority={priority ? 'high' : undefined}
      />
      <span className={`${textClassName} whitespace-nowrap font-bold leading-none tracking-tight`}>{name}</span>
    </span>
  );
}
