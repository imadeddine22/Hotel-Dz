'use client';

import { useEffect, useState } from 'react';
import { Mail, Trash2, CheckCircle, Search, User, Clock } from 'lucide-react';
import api from '@/lib/api';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/messages');
      setMessages(data.messages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/messages/${id}/read`);
      setMessages((prev) =>
        prev.map((msg) => (msg._id === id ? { ...msg, isRead: true } : msg))
      );
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage({ ...selectedMessage, isRead: true });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Supprimer ce message définitivement ?')) return;
    try {
      await api.delete(`/messages/${id}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Messages reçus</h1>
        <p className="admin-page-subtitle">
          {unreadCount > 0 ? `${unreadCount} message(s) non lu(s)` : 'Tous les messages sont lus'}
        </p>
      </div>

      <div className="flex h-[calc(100vh-200px)] gap-6">
        {/* Left: Message List */}
        <div className="flex w-1/3 flex-col rounded-2xl bg-white shadow-card">
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
              <Search className="h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
            {loading ? (
              <p className="p-4 text-center text-sm text-gray-400">Chargement...</p>
            ) : messages.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-400">Aucun message.</p>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg._id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.isRead) markAsRead(msg._id);
                  }}
                  className={`w-full rounded-xl p-4 text-left transition hover:bg-gray-50 ${
                    selectedMessage?._id === msg._id ? 'bg-brand-50' : ''
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className={`truncate text-sm ${msg.isRead ? 'text-gray-700' : 'font-bold text-ink'}`}>
                      {msg.name}
                    </p>
                    <span className="shrink-0 text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className={`truncate text-sm ${msg.isRead ? 'text-gray-500' : 'font-bold text-brand-600'}`}>
                    {msg.subject}
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-400">{msg.content}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Message Details */}
        <div className="flex flex-1 flex-col rounded-2xl bg-white shadow-card overflow-hidden">
          {selectedMessage ? (
            <>
              {/* Header */}
              <div className="border-b border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="mb-2 text-xl font-bold text-ink">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4 text-gray-400" /> {selectedMessage.name} ({selectedMessage.email})
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />{' '}
                        {new Date(selectedMessage.createdAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => markAsRead(selectedMessage._id)}
                      title="Marquer comme lu"
                      className="grid h-9 w-9 place-items-center rounded-lg bg-gray-50 text-gray-500 transition hover:bg-gray-100 hover:text-ink"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteMessage(selectedMessage._id)}
                      title="Supprimer"
                      className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                <div className="rounded-xl bg-gray-50 p-6">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {selectedMessage.content}
                  </p>
                </div>
              </div>
              
              {/* Reply box placeholder (mailto) */}
              <div className="border-t border-gray-100 p-4">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="block w-full rounded-lg bg-brand-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Répondre par Email
                </a>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
              <Mail className="mb-4 h-16 w-16 opacity-20" />
              <p>Sélectionnez un message pour le lire</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
