'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MailCheck, ArrowLeft } from 'lucide-react';
import Link from '@/components/LocaleLink';
import BrandLogo from '@/components/BrandLogo';
import api from '@/lib/api';
import { useT } from '@/lib/i18n/useT';

export default function ForgotPasswordPage() {
  const { t } = useT();
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-gray-400">{t('Chargement...')}</div>}>
      <ForgotForm />
    </Suspense>
  );
}

function ForgotForm() {
  const { t, lang } = useT();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim(), lang });
      setDevUrl(data.devResetUrl || '');
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <Link href="/" className="mb-6 flex justify-center">
          <BrandLogo className="h-12" textClassName="text-3xl" />
        </Link>

        {sent ? (
          <div className="text-center">
            <MailCheck className="mx-auto mb-3 h-12 w-12 text-emerald-500" aria-hidden="true" />
            <h1 className="mb-2 text-2xl font-bold text-ink">{t('Vérifiez votre boîte email')}</h1>
            <p className="text-sm text-gray-600">
              {t('Si un compte existe pour {email}, vous allez recevoir un lien pour choisir un nouveau mot de passe. Il est valable 30 minutes.', { email: email.trim() })}
            </p>
            <p className="mt-2 text-xs text-gray-400">{t('Rien reçu ? Regardez dans les spams, ou réessayez dans quelques minutes.')}</p>
            {devUrl && (
              <div className="mt-4 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-start text-xs text-amber-800">
                <p className="font-bold">{t('Mode développement (email non configuré)')}</p>
                <a href={devUrl} className="break-all font-semibold underline">{t('Ouvrir le lien de réinitialisation')}</a>
              </div>
            )}
            <button type="button" onClick={() => setSent(false)} className="mt-5 text-sm font-semibold text-brand-600 hover:underline">
              {t('Renvoyer le lien')}
            </button>
          </div>
        ) : (
          <>
            <h1 className="mb-1 text-2xl font-bold text-ink">{t('Mot de passe oublié ?')}</h1>
            <p className="mb-6 text-sm text-gray-500">
              {t('Entrez l’email de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe.')}
            </p>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium text-gray-700">{t('Email')}</label>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500"
                  placeholder={t('vous@exemple.com')}
                />
              </div>
              <button disabled={loading} className="w-full rounded-lg bg-brand-500 py-2.5 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60">
                {loading ? t('Envoi...') : t('Envoyer le lien')}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="inline-flex items-center gap-1 font-semibold text-gray-500 hover:text-brand-600">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t('Retour à la connexion')}
          </Link>
        </p>
      </div>
    </div>
  );
}
