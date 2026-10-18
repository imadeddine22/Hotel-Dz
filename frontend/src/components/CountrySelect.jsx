'use client';

import { COUNTRY_LIST, countryName } from '@/lib/countries';
import { useT } from '@/lib/i18n/useT';

/** Country picker for listing forms; the region list and the price currency follow it. */
export default function CountrySelect({ value, onChange, id, className, style }) {
  const { lang } = useT();
  return (
    <select id={id} value={value || 'DZ'} onChange={(e) => onChange(e.target.value)} className={className} style={style}>
      {COUNTRY_LIST.map((c) => (
        <option key={c.code} value={c.code}>
          {countryName(c.code, lang)} ({c.currency})
        </option>
      ))}
    </select>
  );
}
