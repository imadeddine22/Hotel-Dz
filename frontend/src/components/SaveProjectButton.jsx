'use client';

import { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/lib/i18n/useT';

/** "Sauvegarder" on a project page — investors only; the list lives in their space. */
export default function SaveProjectButton({ projectId }) {
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const isInvestor = user?.role === 'investor';
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isInvestor) return;
    api
      .get('/investor/saved')
      .then(({ data }) => setSaved((data.ids || []).includes(String(projectId))))
      .catch(() => {});
  }, [isInvestor, projectId]);

  if (!isInvestor) return null;

  const toggle = async () => {
    setBusy(true);
    try {
      if (saved) await api.delete(`/investor/saved/${projectId}`);
      else await api.post(`/investor/saved/${projectId}`);
      setSaved(!saved);
    } catch {
      /* keep the previous state */
    } finally {
      setBusy(false);
    }
  };

  const Icon = saved ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold shadow-md transition disabled:opacity-60 ${saved ? 'bg-amber-400 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" /> {saved ? t('Sauvegardé') : t('Sauvegarder')}
    </button>
  );
}
