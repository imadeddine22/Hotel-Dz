'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, Lock, Save, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const ROLE_LABELS = { customer: 'Client', owner: 'Hôtelier', admin: 'Administrateur' };

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [form, setForm] = useState({ fullName: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/login?redirect=/profile');
    if (user) setForm((f) => ({ ...f, fullName: user.fullName || '', phone: user.phone || '' }));
  }, [user, loading, router]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
  };

  const validate = () => {
    const errs = {};
    if (form.fullName.trim().length < 2) errs.fullName = 'Le nom doit contenir au moins 2 caractères.';
    if (form.password && form.password.length < 6)
      errs.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    if (form.password && form.password !== form.confirm)
      errs.confirm = 'Les mots de passe ne correspondent pas.';
    return errs;
  };

  const submit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const payload = { fullName: form.fullName.trim(), phone: form.phone.trim() };
      if (form.password) payload.password = form.password;

      const { data } = await api.put('/auth/update-profile', payload);
      useAuthStore.setState({ user: data.user });
      setForm((f) => ({ ...f, password: '', confirm: '' }));
      setSaved(true);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center text-gray-400">Chargement...</div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Header card */}
        <div className="mb-6 flex items-center gap-5 rounded-2xl bg-white p-6 shadow-card">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-500 text-2xl font-bold text-white">
            {user.fullName?.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-ink">{user.fullName}</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" /> {user.email}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 font-medium text-brand-700">
                <ShieldCheck className="h-3.5 w-3.5" /> {ROLE_LABELS[user.role] || user.role}
              </span>
            </p>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={submit} noValidate className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
          <h2 className="mb-6 text-lg font-bold text-ink">Modifier mon profil</h2>

          {apiError && (
            <p role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </p>
          )}
          {saved && (
            <p role="status" className="mb-5 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
              <CheckCircle2 className="h-5 w-5" /> Profil mis à jour avec succès.
            </p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-gray-700">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={set('fullName')}
                  autoComplete="name"
                  className={`w-full rounded-xl border py-3 pl-11 pr-4 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
                    errors.fullName ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.fullName && <p className="mt-1.5 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                  placeholder="05 XX XX XX XX"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                  placeholder="Laisser vide pour ne pas changer"
                  className={`w-full rounded-xl border py-3 pl-11 pr-4 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
                    errors.password ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  autoComplete="new-password"
                  className={`w-full rounded-xl border py-3 pl-11 pr-4 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
                    errors.confirm ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.confirm && <p className="mt-1.5 text-sm text-red-600">{errors.confirm}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-7 flex items-center gap-2 rounded-full bg-brand-500 px-8 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </section>

      <Footer />
    </main>
  );
}
