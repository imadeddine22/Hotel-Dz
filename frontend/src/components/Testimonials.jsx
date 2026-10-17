'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Star, MessageSquarePlus, CheckCircle2, Clock } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/lib/i18n/useT';

const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

function Stars({ value, size = 'h-6 w-6' }) {
  return (
    <div className="flex gap-0.5 text-amber-400" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= value ? 'fill-current' : 'text-slate-200'}`} />
      ))}
    </div>
  );
}

/**
 * Home page "Satisfied clients": approved testimonials + a form for logged-in users.
 * A new or edited testimonial is pending until an admin approves it (/admin/testimonials).
 */
export default function Testimonials() {
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [mine, setMine] = useState(null);
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get('/testimonials')
      .then(({ data }) => setItems(data.testimonials || []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Prefill the form with the user's existing testimonial (they can edit it)
  useEffect(() => {
    if (!user) return setMine(null);
    api.get('/testimonials/mine', { localize: false })
      .then(({ data }) => {
        setMine(data.testimonial);
        if (data.testimonial) {
          const { rating, title, comment } = data.testimonial;
          setForm({ rating, title: title || '', comment });
        }
      })
      .catch(() => {});
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const { data } = await api.post('/testimonials', form, { localize: false });
      setMine(data.testimonial);
      setSent(true);
      setFormOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const count = items.length;
  const current = items[active % Math.max(count, 1)];
  const go = (step) => setActive((i) => (i + step + count) % count);

  return (
    <div id="avis" className="scroll-mt-24 text-center space-y-8 py-10">
      <h2 className="text-3xl md:text-5xl font-black font-serif text-slate-800 leading-none">
        {t('Hear From Our Awesome')} <br className="hidden md:inline" />
        <span className="text-teal-500 italic font-medium font-serif leading-none mt-2 inline-block">{t('Satisfied Clients')}</span>
      </h2>

      <div className="max-w-5xl mx-auto bg-slate-50/50 rounded-3xl border border-slate-100 p-8 md:p-16 relative flex flex-col items-center">
        {!loaded ? (
          <div className="h-40 w-full max-w-3xl animate-pulse rounded-2xl bg-slate-100" />
        ) : !current ? (
          <p className="text-base md:text-xl font-medium text-slate-500">
            {t('Aucun avis pour le moment. Soyez le premier à partager votre expérience !')}
          </p>
        ) : (
          <>
            <p className="text-base md:text-2xl font-medium text-slate-600 leading-relaxed italic max-w-3xl text-center">
              “{current.comment}”
            </p>

            <div className="flex items-center gap-1.5 mt-8">
              <Stars value={current.rating} />
              <span className="text-sm font-bold text-slate-500 ms-2" dir="ltr">{current.rating.toFixed(1)}/5.0</span>
              <span className="sr-only">{t('{n} étoiles sur 5', { n: current.rating })}</span>
            </div>

            <div className="flex items-center gap-4 mt-8">
              {current.user?.avatar?.url ? (
                <img src={current.user.avatar.url} alt="" className="w-12 h-12 rounded-full object-cover shadow-sm border border-white" />
              ) : (
                <span className="grid w-12 h-12 place-items-center rounded-full bg-teal-500 text-sm font-bold text-white shadow-sm" aria-hidden="true">
                  {initials(current.name)}
                </span>
              )}
              <div className="text-start leading-tight">
                <h3 className="text-base font-bold text-slate-800">{current.name}</h3>
                {current.title && <p className="text-xs font-bold text-slate-400 mt-0.5">{current.title}</p>}
              </div>
            </div>

            {count > 1 && (
              <div className="flex items-center gap-4 mt-8 select-none">
                <button
                  onClick={() => go(-1)}
                  className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-sm"
                  aria-label={t('Previous Testimonial')}
                >
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                </button>
                <span className="text-xs font-bold text-slate-400 tracking-wider" dir="ltr">
                  {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                </span>
                <button
                  onClick={() => go(1)}
                  className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-sm"
                  aria-label={t('Next Testimonial')}
                >
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Leave a review ─── */}
      <div className="max-w-2xl mx-auto">
        {sent && (
          <p role="status" className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {t('Merci ! Votre avis sera publié après validation par notre équipe.')}
          </p>
        )}
        {!sent && mine && !formOpen && (
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
            {mine.status === 'approved' ? (
              <><CheckCircle2 className="h-4 w-4 text-teal-600" aria-hidden="true" /> {t('Votre avis est publié.')}</>
            ) : (
              <><Clock className="h-4 w-4 text-amber-500" aria-hidden="true" /> {t('Votre avis est en attente de validation.')}</>
            )}
          </p>
        )}

        {!formOpen ? (
          <div>
            {user ? (
              <button
                onClick={() => { setFormOpen(true); setSent(false); }}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600"
              >
                <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
                {mine ? t('Modifier mon avis') : t('Laisser un avis')}
              </button>
            ) : (
              <Link
                href="/login?redirect=/%23avis"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600"
              >
                <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
                {t('Connectez-vous pour laisser un avis')}
              </Link>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 text-start shadow-card md:p-8">
            <h3 className="text-lg font-bold text-slate-800">{t('Votre avis sur Meskan dz')}</h3>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-600">{t('Note')}</legend>
              <div className="flex gap-1" dir="ltr">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    aria-label={t('{n} étoiles sur 5', { n })}
                    aria-pressed={form.rating === n}
                    className="rounded-md p-0.5 text-amber-400 transition hover:scale-110"
                  >
                    <Star className={`h-8 w-8 ${n <= form.rating ? 'fill-current' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="t-title" className="mb-1 block text-sm font-semibold text-slate-600">
                {t('Qui êtes-vous ? (facultatif)')}
              </label>
              <input
                id="t-title"
                maxLength={80}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t('Ex : Cliente, Oran')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label htmlFor="t-comment" className="mb-1 block text-sm font-semibold text-slate-600">{t('Votre avis')}</label>
              <textarea
                id="t-comment"
                required
                minLength={10}
                maxLength={600}
                rows={4}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder={t('Racontez votre expérience avec Meskan dz…')}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
              />
              <p className="mt-1 text-end text-xs text-slate-400" dir="ltr">{form.comment.length}/600</p>
            </div>

            <p className="text-xs text-slate-400">{t('Votre avis sera visible après validation par notre équipe.')}</p>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

            <div className="flex flex-wrap gap-3">
              <button
                disabled={sending}
                className="rounded-full bg-brand-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
              >
                {sending ? t('Envoi...') : t('Envoyer mon avis')}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className="rounded-full px-6 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100">
                {t('Annuler')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
