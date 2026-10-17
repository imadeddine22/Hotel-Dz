'use client';

import { useCommunes } from '@/hooks/useCommunes';
import { useT } from '@/lib/i18n/useT';

/**
 * <datalist> of the communes of `wilaya`. Attach it to a text input with `list={id}`:
 * the user gets suggestions but can still type a neighbourhood that isn't a commune.
 */
export default function CommuneDatalist({ id, wilaya }) {
  const communes = useCommunes(wilaya);
  const { lang } = useT();
  return (
    <datalist id={id}>
      {communes.map((c) => (
        // the value stays the French name (stored as-is); Arabic visitors also see the Arabic label
        <option key={c.name} value={c.name} label={lang === 'ar' ? c.arabic : undefined} />
      ))}
    </datalist>
  );
}
