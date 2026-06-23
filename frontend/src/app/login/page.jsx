'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-gray-400">Chargement...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const redirect = params.get('redirect');
      if (redirect) router.push(redirect);
      else if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'owner') router.push('/owner/dashboard');
      else router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <Link href="/" className="mb-6 block text-center text-2xl font-extrabold text-ink">
          hotels<span className="text-brand-500">dz</span>
        </Link>
        <h1 className="mb-1 text-2xl font-bold text-ink">Connexion</h1>
        <p className="mb-6 text-sm text-gray-500">Accédez à votre compte</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500"
              placeholder="vous@exemple.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500"
              placeholder="••••••••"
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 py-2.5 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Pas de compte ?{' '}
          <Link href="/register" className="font-semibold text-brand-600">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
