'use client';

import { useEffect, useState } from 'react';
import { Ban, CheckCircle2, Trash2, Search, Users } from 'lucide-react';
import api from '@/lib/api';

const ROLE_COLORS = {
  admin: '#8b5cf6',
  owner: '#3b82f6',
  customer: '#64748b',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.q = search;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const toggleBlock = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/block`);
      setUsers((u) => u.map((x) => (x._id === id ? { ...x, isBlocked: data.user.isBlocked } : x)));
    } catch (e) {
      alert(e.message);
    }
  };

  const deleteUser = async (id, name) => {
    if (!confirm(`Supprimer l'utilisateur "${name}" ?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((u) => u.filter((x) => x._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Utilisateurs</h1>
        <p className="admin-page-subtitle">Gestion des comptes utilisateurs · {users.length} membres</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <div className="admin-table-filters">
            {[
              { label: 'Tous', value: '' },
              { label: 'Clients', value: 'customer' },
              { label: 'Hôteliers', value: 'owner' },
              { label: 'Admins', value: 'admin' },
            ].map((f) => (
              <button
                key={f.value}
                className={`admin-filter-btn ${roleFilter === f.value ? 'active' : ''}`}
                onClick={() => setRoleFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-search-input"
                style={{ width: 200, paddingLeft: 36 }}
              />
            </div>
          </form>
        </div>

        {loading ? (
          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="admin-skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
                <div className="admin-skeleton" style={{ flex: 1, height: 16 }} />
                <div className="admin-skeleton" style={{ width: 80, height: 16 }} />
                <div className="admin-skeleton" style={{ width: 60, height: 24, borderRadius: 20 }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: 22 }}>
            <div className="admin-error">{error}</div>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><Users /></div>
            <p className="admin-empty-title">Aucun utilisateur trouvé</p>
            <p className="admin-empty-desc">Modifiez vos filtres pour voir plus de résultats</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Inscrit le</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="admin-table-user">
                        <div
                          className="admin-table-avatar"
                          style={{ background: `linear-gradient(135deg, ${ROLE_COLORS[u.role]}, ${ROLE_COLORS[u.role]}99)` }}
                        >
                          {u.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="admin-table-username">{u.fullName}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-badge ${u.role}`}>
                        {u.role === 'admin' ? 'Admin' : u.role === 'owner' ? 'Hôtelier' : 'Client'}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${u.isBlocked ? 'blocked' : 'active'}`}>
                        {u.isBlocked ? 'Bloqué' : 'Actif'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: '#94a3b8' }}>
                      {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            onClick={() => toggleBlock(u._id)}
                            className={`admin-btn ${u.isBlocked ? 'admin-btn-approve' : 'admin-btn-reject'}`}
                            style={{ padding: '6px 12px', fontSize: 12 }}
                          >
                            {u.isBlocked ? (
                              <><CheckCircle2 style={{ width: 14, height: 14 }} /> Débloquer</>
                            ) : (
                              <><Ban style={{ width: 14, height: 14 }} /> Bloquer</>
                            )}
                          </button>
                          <button
                            onClick={() => deleteUser(u._id, u.fullName)}
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '6px 10px', fontSize: 12 }}
                            title="Supprimer"
                          >
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
