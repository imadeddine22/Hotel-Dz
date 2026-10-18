'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/lib/i18n/useT';
import { dateLocale } from '@/lib/i18n/format';

const POLL_MS = 15000;

/** Guest ↔ owner messages: conversation list + thread (one conversation per booking). */
export default function MessagesPage() {
  const { t } = useT();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const [list, setList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  const loadList = useCallback(async () => {
    try {
      const { data } = await api.get('/conversations');
      setList(data.conversations || []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const loadThread = useCallback(async (id) => {
    if (!id) return;
    try {
      const { data } = await api.get(`/conversations/${id}`);
      setThread(data.conversation);
      // reading marks messages as read: refresh unread counters
      window.dispatchEvent(new Event('messages-read'));
    } catch (e) {
      setError(e.message);
    }
  }, []);

  // Auth + opening from a booking (?booking=…) or a conversation (?c=…)
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    const q = new URLSearchParams(window.location.search);
    (async () => {
      let id = q.get('c');
      if (q.get('booking')) {
        try {
          const { data } = await api.get(`/conversations/booking/${q.get('booking')}`);
          id = data.conversationId;
        } catch (e) {
          setError(e.message);
        }
      }
      await loadList();
      if (id) setActiveId(id);
    })();
  }, [user, authLoading, router, loadList]);

  useEffect(() => {
    if (!activeId) return undefined;
    loadThread(activeId);
    const timer = setInterval(() => {
      loadThread(activeId);
      loadList();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [activeId, loadThread, loadList]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [thread?.messages?.length]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !activeId) return;
    setSending(true);
    try {
      await api.post(`/conversations/${activeId}/messages`, { text: body });
      setText('');
      await Promise.all([loadThread(activeId), loadList()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const me = String(user?._id || '');
  const other = (c) => (String(c.customer?._id) === me ? c.owner : c.customer);
  const fmt = (d) => new Date(d).toLocaleString(dateLocale(), { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-extrabold text-ink">{t('Messages')}</h1>
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="grid min-h-[60vh] grid-cols-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:grid-cols-[320px_1fr]">
          {/* Conversation list (hidden on mobile while a thread is open) */}
          <aside className={`min-w-0 border-gray-100 md:border-e ${activeId ? 'hidden md:block' : ''}`}>
            {list.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                <MessageCircle className="mx-auto mb-3 h-8 w-8 text-gray-300" aria-hidden="true" />
                {t('Aucune conversation. Vous pouvez écrire à l’établissement depuis « Mes réservations ».')}
              </div>
            ) : (
              <ul>
                {list.map((c) => (
                  <li key={c._id}>
                    <button
                      onClick={() => setActiveId(c._id)}
                      className={`w-full border-b border-gray-50 px-4 py-3 text-start transition hover:bg-gray-50 ${activeId === c._id ? 'bg-brand-50' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`truncate text-sm ${c.unread ? 'font-extrabold text-ink' : 'font-semibold text-gray-800'}`}>{other(c)?.fullName}</span>
                        {c.unread > 0 && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-white">{c.unread}</span>}
                      </div>
                      <p className="truncate text-xs text-gray-500">{c.propertyName}</p>
                      {c.lastMessage && <p className="mt-0.5 truncate text-xs text-gray-400">{c.lastMessage.text}</p>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Thread */}
          <section className={`flex min-w-0 flex-col ${activeId ? '' : 'hidden md:flex'}`} aria-label={t('Conversation')}>
            {!thread ? (
              <p className="m-auto p-8 text-sm text-gray-400">{t('Choisissez une conversation.')}</p>
            ) : (
              <>
                <header className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                  <button onClick={() => { setActiveId(null); setThread(null); }} className="md:hidden" aria-label={t('Retour')}>
                    <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
                  </button>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{other(thread)?.fullName}</p>
                    <p className="truncate text-xs text-gray-500">
                      {thread.propertyName}
                      {thread.booking?.checkIn && ` · ${new Date(thread.booking.checkIn).toLocaleDateString(dateLocale())} → ${new Date(thread.booking.checkOut).toLocaleDateString(dateLocale())}`}
                    </p>
                  </div>
                </header>
                <ol className="flex-1 space-y-3 overflow-y-auto bg-gray-50/50 p-4" style={{ maxHeight: '55vh' }}>
                  {thread.messages.length === 0 && <li className="text-center text-sm text-gray-400">{t('Écrivez le premier message.')}</li>}
                  {thread.messages.map((m) => {
                    const mine = String(m.sender) === me;
                    return (
                      <li key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${mine ? 'rounded-ee-sm bg-brand-500 text-white' : 'rounded-es-sm bg-white text-gray-800'}`}>
                          <p className="whitespace-pre-line break-words">{m.text}</p>
                          <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                            {fmt(m.createdAt)}{mine && m.readAt ? ` · ${t('Lu')}` : ''}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                  <li ref={endRef} aria-hidden="true" />
                </ol>
                <form onSubmit={send} className="flex gap-2 border-t border-gray-100 p-3">
                  <label htmlFor="msg" className="sr-only">{t('Votre message')}</label>
                  <textarea
                    id="msg"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) send(e); }}
                    maxLength={2000}
                    rows={1}
                    placeholder={t('Votre message…')}
                    className="max-h-32 flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                  />
                  <button disabled={sending || !text.trim()} className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40" aria-label={t('Envoyer')}>
                    <Send className="h-4 w-4 rtl:rotate-180" />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
