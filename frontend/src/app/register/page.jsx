'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === 'owner') router.push('/owner/dashboard');
      else router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <Link href="/" className="mb-6 block text-center text-2xl font-extrabold text-ink">
          hotels<span className="text-brand-500">dz</span>
        </Link>
        <h1 className="mb-1 text-2xl font-bold text-ink">Créer un compte</h1>
        <p className="mb-6 text-sm text-gray-500">Rejoignez DzHotels</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
        )}

        {/* Role switch */}
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
          {[
            { v: 'customer', label: 'Voyageur' },
            { v: 'owner', label: 'Hôtelier' },
          ].map((r) => (
            <button
              key={r.v}
              type="button"
              onClick={() => setForm({ ...form, role: r.v })}
              className={`rounded-lg py-2 text-sm font-medium transition ${
                form.role === r.v ? 'bg-white text-brand-600 shadow' : 'text-gray-500'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Nom complet" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
          <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Téléphone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required={false} />
          <Field label="Mot de passe" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          <button
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 py-2.5 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Déjà inscrit ?{' '}
          <Link href="/login" className="font-semibold text-brand-600">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = true }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500"
      />
    </div>
  );
}
