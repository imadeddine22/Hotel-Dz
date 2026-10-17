'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import Link from '@/components/LocaleLink';
import BrandLogo from '@/components/BrandLogo';
import { useAuthStore, useLangStore } from '@/store/authStore';
import { useT } from '@/lib/i18n/useT';

export default function ResetPasswordPage() {
  const { t } = useT();
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-gray-400">{t('Chargement...')}</div>}>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const { t } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const setLang = useLangStore((s) => s.setLang);
  // the emailed link carries the language the request was made in
  useEffect(() => {
    const l = params.get('lang');
    if (['fr', 'ar', 'en'].includes(l)) setLang(l);
  }, [params, setLang]);
  const validToken = /^[a-f0-9]{64}$/i.test(token);
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [linkError, setLinkError] = useState(false); // the server refused the link (expired, already used)
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLinkError(false);
    if (form.password.length < 6) return setError(t('Le mot de passe doit contenir au moins 6 caractères.'));
    if (form.password !== form.confirm) return setError(t('Les mots de passe ne correspondent pas.'));
    setLoading(true);
    try {
      const user = await resetPassword(token, form.password);
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'owner') router.push('/owner/dashboard');
      else if (user.role === 'seller') router.push('/seller/dashboard');
      else router.push('/');
    } catch (err) {
      setError(err.message);
      setLinkError(err.status === 400);
      setLoading(false);
    }
  };

  const input = 'w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500';

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <Link href="/" className="mb-6 flex justify-center">
          <BrandLogo className="h-12" textClassName="text-3xl" />
        </Link>
        <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-ink">
          <KeyRound className="h-6 w-6 text-brand-500" aria-hidden="true" /> {t('Nouveau mot de passe')}
        </h1>

        {!validToken ? (
          <div className="mt-4 space-y-4">
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{t('Ce lien de réinitialisation est invalide ou a expiré.')}</p>
            <Link href="/forgot-password" className="block w-full rounded-lg bg-brand-500 py-2.5 text-center font-semibold text-white hover:bg-brand-600">
              {t('Demander un nouveau lien')}
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-gray-500">{t('Choisissez un nouveau mot de passe : vous serez connecté juste après.')}</p>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
                {linkError && (
                  <>
                    {' '}
                    <Link href="/forgot-password" className="font-semibold underline">{t('Demander un nouveau lien')}</Link>
                  </>
                )}
              </div>
            )}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="reset-password" className="mb-1 block text-sm font-medium text-gray-700">{t('Nouveau mot de passe')}</label>
                <div className="relative">
                  <input
                    id="reset-password"
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`${input} pe-11`}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? t('Masquer le mot de passe') : t('Afficher le mot de passe')}
                    className="absolute inset-y-0 end-0 grid w-11 place-items-center text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">{t('Au moins 6 caractères.')}</p>
              </div>
              <div>
                <label htmlFor="reset-confirm" className="mb-1 block text-sm font-medium text-gray-700">{t('Confirmer le mot de passe')}</label>
                <input
                  id="reset-confirm"
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className={input}
                  placeholder="••••••••"
                />
              </div>
              <button disabled={loading} className="w-full rounded-lg bg-brand-500 py-2.5 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60">
                {loading ? t('Enregistrement...') : t('Enregistrer et me connecter')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
