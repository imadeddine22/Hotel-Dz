'use client';

import { useCommunes } from '@/hooks/useCommunes';

/**
 * <datalist> of the communes of `wilaya`. Attach it to a text input with `list={id}`:
 * the user gets suggestions but can still type a neighbourhood that isn't a commune.
 */
export default function CommuneDatalist({ id, wilaya }) {
  const communes = useCommunes(wilaya);
  return (
    <datalist id={id}>
      {communes.map((c) => (
        <option key={c.name} value={c.name} label={c.arabic} />
      ))}
    </datalist>
  );
}
