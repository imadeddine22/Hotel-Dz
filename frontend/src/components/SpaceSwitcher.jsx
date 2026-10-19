'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { SPACES } from '@/lib/spaces';
import { useT } from '@/lib/i18n/useT';

/**
 * "Passer à…" — the list of spaces of the account (traveller, host, seller, investor).
 * Clicking one switches the account to it and opens its dashboard. Admins don't switch.
 */
export default function SpaceSwitcher({ onDone }) {
  const { t } = useT();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const switchSpace = useAuthStore((s) => s.switchSpace);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  if (!user || user.role === 'admin') return null;

  const go = async (space) => {
    setError('');
    setBusy(space.role);
    try {
      await switchSpace(space.role);
      onDone?.();
      router.push(space.href);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <div>
      <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-400 rtl:tracking-normal">{t('Mes espaces')}</p>
      <ul className="space-y-1">
        {SPACES.map((s) => {
          const Icon = s.icon;
          const current = user.role === s.role;
          return (
            <li key={s.role}>
              <button
                type="button"
                onClick={() => go(s)}
                disabled={Boolean(busy)}
                aria-current={current ? 'true' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition disabled:opacity-60 ${
                  current ? 'bg-brand-50 ring-1 ring-brand-200' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${current ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-gray-800">{t(s.label)}</span>
                  <span className="block truncate text-xs text-gray-500">{busy === s.role ? t('Ouverture...') : current ? t('Espace actuel') : t(s.desc)}</span>
                </span>
                {current && <Check className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>
      {error && <p className="mt-2 px-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
