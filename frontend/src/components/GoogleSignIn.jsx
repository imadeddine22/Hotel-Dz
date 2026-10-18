'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/lib/i18n/useT';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCRIPT = 'https://accounts.google.com/gsi/client';

let scriptPromise;
const loadScript = () =>
  (scriptPromise ||= new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement('script');
    s.src = SCRIPT;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error('Google script failed to load'));
    };
    document.head.appendChild(s);
  }));

/**
 * "Continuer avec Google" button (Google Identity Services) followed by an "ou" separator.
 * Hidden when NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. `role` only applies to a new account.
 */
export default function GoogleSignIn({ role, onSuccess, onError }) {
  const { t, lang } = useT();
  const ref = useRef(null);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const [busy, setBusy] = useState(false);
  // latest props for the Google callback, registered once per language
  const latest = useRef({ role, onSuccess, onError });
  latest.current = { role, onSuccess, onError };

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          ux_mode: 'popup',
          callback: async ({ credential }) => {
            const { role: r, onSuccess: ok, onError: ko } = latest.current;
            setBusy(true);
            try {
              ok?.(await loginWithGoogle(credential, r));
            } catch (err) {
              ko?.(err.message);
            } finally {
              setBusy(false);
            }
          },
        });
        ref.current.innerHTML = '';
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          locale: lang,
          width: Math.min(400, ref.current.offsetWidth || 320),
        });
      })
      .catch(() => latest.current.onError?.(t('Connexion avec Google indisponible pour le moment.')));
    return () => {
      cancelled = true;
    };
  }, [lang, loginWithGoogle, t]);

  if (!CLIENT_ID) return null;
  return (
    <div className="mb-5">
      <div ref={ref} className={`flex min-h-[44px] justify-center ${busy ? 'pointer-events-none opacity-60' : ''}`} aria-busy={busy} />
      <div className="mt-5 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        {t('ou avec votre email')}
        <span className="h-px flex-1 bg-gray-200" />
      </div>
    </div>
  );
}
