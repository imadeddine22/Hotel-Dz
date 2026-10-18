'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import api from '@/lib/api';
import { useT } from '@/lib/i18n/useT';
import { SCORE_CATEGORIES, scoreWord } from '@/lib/scores';

const SCORES = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

/** Guest review of a completed stay: overall score /10, optional category scores, comment. */
export default function ReviewForm({ booking, onDone }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(9);
  const [categories, setCategories] = useState({});
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const isHouse = booking.propertyType === 'house';
  const propertyId = isHouse ? booking.house?._id : booking.hotel?._id;
  if (!propertyId) return null;

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await api.post(`/${isHouse ? 'houses' : 'hotels'}/${propertyId}/reviews`, { bookingId: booking._id, score, categories, comment });
      onDone?.(booking._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <Star className="h-4 w-4" aria-hidden="true" /> {t('Donner mon avis')}
      </button>
    );
  }

  const select = 'rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-500';
  return (
    <form onSubmit={submit} className="mt-3 w-full space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <label className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-700">
        {t('Note globale')}
        <select value={score} onChange={(e) => setScore(Number(e.target.value))} className={select}>
          {SCORES.map((s) => <option key={s} value={s}>{s} — {t(scoreWord(s))}</option>)}
        </select>
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {SCORE_CATEGORIES.map(([k, label]) => (
          <label key={k} className="flex items-center justify-between gap-2 text-sm text-gray-600">
            {t(label)}
            <select value={categories[k] || ''} onChange={(e) => setCategories({ ...categories, [k]: e.target.value ? Number(e.target.value) : undefined })} className={select}>
              <option value="">—</option>
              {SCORES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} rows={3}
        placeholder={t('Racontez votre séjour (facultatif)')}
        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button disabled={sending} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
          {sending ? t('Envoi...') : t('Publier mon avis')}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">{t('Annuler')}</button>
      </div>
    </form>
  );
}
