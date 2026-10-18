'use client';

import { useT } from '@/lib/i18n/useT';

/**
 * Translated text for server components, which can't call hooks:
 *   <T>Questions fréquentes</T>   <T k="Séjourner à {name}" vars={{ name }} />
 * (Use `k` when there are placeholders: inside JSX children `{name}` would be evaluated.)
 */
export default function T({ children, k, vars }) {
  const { t } = useT();
  // Text values are translated too (wilaya names, region labels…); unknown ones pass through unchanged
  const tv = vars && Object.fromEntries(Object.entries(vars).map(([key, v]) => [key, typeof v === 'string' ? t(v) : v]));
  return t(k ?? (Array.isArray(children) ? children.join('') : children), tv);
}
