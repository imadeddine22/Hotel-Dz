'use client';

import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import Avatar from '@/components/Avatar';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/lib/i18n/useT';

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** The logged-in user's photo with "change" / "remove" — for every role (guest, owner, seller, admin). */
export default function ProfilePhoto({ className = 'h-20 w-20 rounded-full text-3xl' }) {
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file) => {
    setError('');
    if (!file) return;
    if (!TYPES.includes(file.type)) return setError(t('Choisissez une image JPG, PNG, WebP ou GIF.'));
    if (file.size > MAX_BYTES) return setError(t('Image trop lourde (2 Mo maximum).'));
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await api.put('/auth/avatar', fd);
      useAuthStore.setState({ user: data.user });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const remove = async () => {
    setError('');
    setBusy(true);
    try {
      const { data } = await api.delete('/auth/avatar');
      useAuthStore.setState({ user: data.user });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const hasPhoto = Boolean(user?.avatar?.url);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className="group relative rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        aria-label={hasPhoto ? t('Changer la photo de profil') : t('Ajouter une photo de profil')}
      >
        <Avatar user={user} className={className} initialClassName="bg-brand-500 text-white" />
        <span className="absolute bottom-0 end-0 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-ink text-white shadow transition group-hover:scale-110">
          <Camera className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        {busy && <span className="absolute inset-0 grid place-items-center rounded-full bg-white/60 text-xs font-semibold text-gray-600">…</span>}
      </button>
      <input ref={input} type="file" accept={TYPES.join(',')} className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      {hasPhoto && (
        <button type="button" onClick={remove} disabled={busy} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-600 disabled:opacity-50">
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> {t('Retirer la photo')}
        </button>
      )}
      {error && <p role="alert" className="max-w-[12rem] text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
