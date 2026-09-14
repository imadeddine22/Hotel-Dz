'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import { Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminPricingPage() {
  const [form, setForm] = useState({
    growthMonthlyPrice: '',
    growthYearlyPrice: '',
    proMonthlyPrice: '',
    proYearlyPrice: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPrices = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/pricing/prices');
      if (data.success && data.settings) {
        setForm({
          growthMonthlyPrice: data.settings.growthMonthlyPrice || '',
          growthYearlyPrice: data.settings.growthYearlyPrice || '',
          proMonthlyPrice: data.settings.proMonthlyPrice || '',
          proYearlyPrice: data.settings.proYearlyPrice || '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de récupérer la tarification.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put('/pricing/prices', form);
      if (data.success) {
        setSuccess('Tarification enregistrée avec succès !');
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Tarification des Abonnements</h1>
            <p className="text-sm text-slate-500 mt-1">Configurez les prix des abonnements mensuels et annuels pour les propriétaires.</p>
          </div>
          <button
            onClick={fetchPrices}
            disabled={loading}
            className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition disabled:opacity-40"
            title="Rafraîchir"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 p-4 flex items-start gap-3 text-red-600 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-3 text-emerald-600 text-sm animate-fade-in">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            <p className="text-sm font-semibold text-slate-400">Chargement des paramètres de prix...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Growth Plan Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 font-serif mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                Growth Plan (Plan Croissance)
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Prix Mensuel (DZD) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.growthMonthlyPrice}
                    onChange={(e) => handleChange('growthMonthlyPrice', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 font-semibold text-slate-800 transition shadow-sm"
                    placeholder="Ex: 2900"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Prix Annuel (DZD) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.growthYearlyPrice}
                    onChange={(e) => handleChange('growthYearlyPrice', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 font-semibold text-slate-800 transition shadow-sm"
                    placeholder="Ex: 29000"
                  />
                </div>
              </div>
            </div>

            {/* Pro Plan Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 font-serif mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                Pro Plan (Plan Professionnel)
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Prix Mensuel (DZD) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.proMonthlyPrice}
                    onChange={(e) => handleChange('proMonthlyPrice', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500 font-semibold text-slate-800 transition shadow-sm"
                    placeholder="Ex: 6900"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Prix Annuel (DZD) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.proYearlyPrice}
                    onChange={(e) => handleChange('proYearlyPrice', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500 font-semibold text-slate-800 transition shadow-sm"
                    placeholder="Ex: 69000"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-8 py-3.5 font-bold shadow-md hover:bg-slate-800 transition disabled:opacity-60 hover:scale-102"
              >
                <Save className="h-4.5 w-4.5" />
                {saving ? 'Enregistrement...' : 'Enregistrer les prix'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
