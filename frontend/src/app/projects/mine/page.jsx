'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlusCircle, Pencil, Trash2, Eye, Users, X, Clock, CheckCircle2, XCircle, Phone, Mail, ExternalLink, ImagePlus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from '@/components/LocaleLink';
import api, { getImageUrl } from '@/lib/api';
import { formatDZD } from '@/lib/data';
import { useWilayas } from '@/hooks/useWilayas';
import { ASSET_TYPES, PROJECT_TYPES, PARTNERSHIP_TYPES, LAND_DOCUMENTS, PROJECT_COLORS, projectGradient, formatArea } from '@/lib/projects';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/lib/i18n/useT';
import { dateLocale } from '@/lib/i18n/format';

const EMPTY = { assetType: 'Terrain', title: '', description: '', projectType: 'Résidentiel', partnership: 'À discuter', wilaya: '', city: '', address: '', area: '', landDocument: 'Acte notarié', budget: '', ownerShare: '', contactPhone: '', contactEmail: '' };
const STATUS = {
  pending: { label: 'En attente de validation', icon: Clock, cls: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Publié', icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Refusé', icon: XCircle, cls: 'bg-red-50 text-red-700' },
};

export default function MyProjectsPage() {
  const { t } = useT();
  return (
    <Suspense fallback={<p className="py-24 text-center text-slate-400">{t('Chargement...')}</p>}>
      <MyProjects />
    </Suspense>
  );
}

function MyProjects() {
  const { t, lang } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading: authLoading } = useAuthStore();
  const [projects, setProjects] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | project
  const [openInterests, setOpenInterests] = useState(null); // project id
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/projects/mine', { localize: false })
      .then(({ data }) => setProjects(data.projects))
      .catch((e) => setError(e.message));

  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.replace('/login?redirect=%2Fprojects%2Fmine');
    load();
    if (params.get('new')) setEditing('new');
  }, [user, authLoading]);

  const showInterests = async (p) => {
    if (openInterests === p._id) return setOpenInterests(null);
    setOpenInterests(p._id);
    setInterests([]);
    const { data } = await api.get(`/projects/${p._id}/interests`);
    setInterests(data.interests);
    setProjects((list) => list.map((x) => (x._id === p._id ? { ...x, unreadInterests: 0 } : x)));
  };

  const remove = async (p) => {
    if (!confirm(t('Supprimer ce projet et les demandes reçues ?'))) return;
    try {
      await api.delete(`/projects/${p._id}`);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5FBFC]">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black md:text-3xl" style={{ color: PROJECT_COLORS.ink }}>{t('Mes projets')}</h1>
            <p className="text-sm text-slate-500">{t('Vos biens proposés aux investisseurs et les demandes reçues.')}</p>
          </div>
          <button type="button" onClick={() => setEditing('new')} className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold text-white shadow" style={{ background: projectGradient }}>
            <PlusCircle className="h-5 w-5" aria-hidden="true" /> {t('Proposer mon projet')}
          </button>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        {projects === null ? (
          <p className="py-16 text-center text-slate-400">{t('Chargement...')}</p>
        ) : projects.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-14 text-center">
            <p className="font-bold" style={{ color: PROJECT_COLORS.ink }}>{t('Vous n’avez pas encore proposé de projet.')}</p>
            <p className="mt-1 text-sm text-slate-500">{t('Décrivez votre bien (terrain, local, bâtiment…) et le projet que vous imaginez : les investisseurs vous contacteront.')}</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {projects.map((p) => {
              const st = STATUS[p.status] || STATUS.pending;
              return (
                <li key={p._id} className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-black/5">
                  <div className="flex flex-col gap-4 p-4 sm:flex-row">
                    <img src={getImageUrl(p.images?.[0]?.url) || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=60'} alt="" className="h-32 w-full shrink-0 rounded-2xl object-cover sm:w-48" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${st.cls}`}>
                          <st.icon className="h-3.5 w-3.5" aria-hidden="true" /> {t(st.label)}
                        </span>
                        <span className="text-xs text-slate-400">{p.reference}</span>
                      </div>
                      <p className="mt-1 truncate text-lg font-bold" style={{ color: PROJECT_COLORS.ink }}>{p.title}</p>
                      <p className="text-sm text-slate-500">
                        {t(p.city)}, {t(p.wilaya)} · {t(p.assetType || 'Terrain')} · {formatArea(p.area, lang)} · {t(p.projectType)} · {p.budget ? formatDZD(p.budget) : t('Budget à définir')}
                      </p>
                      {p.status === 'rejected' && p.rejectionReason && (
                        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                          <strong>{t('Motif du refus :')}</strong> {p.rejectionReason} — {t('modifiez le projet pour le renvoyer en validation.')}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => showInterests(p)} className="relative inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-100">
                          <Users className="h-4 w-4" aria-hidden="true" /> {t('Demandes d’investisseurs')} ({p.interestsCount || 0})
                          {p.unreadInterests > 0 && <span className="absolute -end-1.5 -top-1.5 rounded-full bg-pink-500 px-1.5 text-[11px] font-bold text-white">{p.unreadInterests}</span>}
                        </button>
                        <button type="button" onClick={() => setEditing(p)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                          <Pencil className="h-4 w-4" aria-hidden="true" /> {t('Modifier')}
                        </button>
                        <Link href={`/investir/${p._id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                          <Eye className="h-4 w-4" aria-hidden="true" /> {t('Voir')} · {p.views || 0}
                        </Link>
                        <button type="button" onClick={() => remove(p)} aria-label={t('Supprimer')} className="inline-flex items-center rounded-lg border border-red-100 px-3 py-2 text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {openInterests === p._id && (
                    <div className="border-t border-slate-100 bg-[#F5FBFC] p-4">
                      {interests.length === 0 ? (
                        <p className="text-sm text-slate-500">{t('Aucune demande pour le moment.')}</p>
                      ) : (
                        <ul className="space-y-3">
                          {interests.map((i) => (
                            <li key={i._id} className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="font-bold" style={{ color: PROJECT_COLORS.ink }}>{i.name}</p>
                                <span className="text-xs text-slate-400">{new Date(i.createdAt).toLocaleString(dateLocale())}</span>
                              </div>
                              {i.amount ? <p className="text-sm font-semibold text-emerald-700">{t('Montant envisagé :')} {formatDZD(i.amount)}</p> : null}
                              <p className="mt-1 whitespace-pre-line text-sm text-slate-700" dir="auto">{i.message}</p>
                              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                                <a href={`tel:${i.phone.replace(/[^\d+]/g, '')}`} dir="ltr" className="inline-flex items-center gap-1 font-semibold text-[#00B3D2] hover:underline"><Phone className="h-4 w-4" aria-hidden="true" /> {i.phone}</a>
                                {i.email && <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1 font-semibold text-[#00B3D2] hover:underline"><Mail className="h-4 w-4" aria-hidden="true" /> {i.email}</a>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {editing && (
        <ProjectForm
          project={editing === 'new' ? null : editing}
          user={user}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      <Footer />
    </main>
  );
}

/** Create / edit a project: land or property, project idea, partnership, photos. Saving sends it to moderation. */
function ProjectForm({ project, user, onClose, onSaved }) {
  const { t } = useT();
  const { wilayas } = useWilayas();
  const [form, setForm] = useState(() =>
    project
      ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, project[k] ?? EMPTY[k]]))
      : { ...EMPTY, contactPhone: user?.phone || '', contactEmail: user?.email || '' }
  );
  const [keep, setKeep] = useState(project?.images || []);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.title.trim().length < 5) return setError(t('Donnez un titre d’au moins 5 caractères.'));
    if (!form.wilaya || !form.city.trim()) return setError(t('Indiquez la wilaya et la commune du bien.'));
    if (!(Number(form.area) > 0)) return setError(t('Indiquez la surface du bien.'));
    if (!project && files.length === 0) return setError(t('Ajoutez au moins une photo du bien.'));
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v ?? '').trim()));
    if (project) fd.append('keepImages', JSON.stringify(keep.map((i) => i.publicId)));
    files.forEach((f) => fd.append('images', f));
    setSaving(true);
    try {
      if (project) await api.put(`/projects/${project._id}`, fd);
      else await api.post('/projects', fd);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00B3D2]';
  const label = 'block text-xs font-semibold text-slate-600';
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={() => !saving && onClose()}>
      <form
        onSubmit={submit}
        noValidate
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="project-form-title" className="text-xl font-black" style={{ color: PROJECT_COLORS.ink }}>{project ? t('Modifier le projet') : t('Proposer mon projet')}</h2>
            <p className="text-xs text-slate-500">{t('Publié après validation par l’administration.')}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t('Fermer')} className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset className="sm:col-span-2">
            <legend className={label}>{t('Ce que vous proposez')} *</legend>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {ASSET_TYPES.map((x) => (
                <button
                  key={x}
                  type="button"
                  aria-pressed={form.assetType === x}
                  onClick={() => setForm((f) => ({ ...f, assetType: x }))}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${form.assetType === x ? 'text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  style={form.assetType === x ? { background: projectGradient } : undefined}
                >
                  {t(x)}
                </button>
              ))}
            </div>
          </fieldset>
          <label className={`${label} sm:col-span-2`}>
            {t('Titre')} *
            <input value={form.title} onChange={set('title')} maxLength={120} placeholder={t('Ex : Local de 200 m² cherche associé pour un restaurant')} className={`${input} mt-1`} />
          </label>
          <label className={label}>
            {t('Type de projet')}
            <select value={form.projectType} onChange={set('projectType')} className={`${input} mt-1`}>
              {PROJECT_TYPES.map((x) => <option key={x} value={x}>{t(x)}</option>)}
            </select>
          </label>
          <label className={label}>
            {t('Partenariat proposé')}
            <select value={form.partnership} onChange={set('partnership')} className={`${input} mt-1`}>
              {PARTNERSHIP_TYPES.map((x) => <option key={x} value={x}>{t(x)}</option>)}
            </select>
          </label>
          <label className={`${label} sm:col-span-2`}>
            {t('Le projet que vous imaginez')}
            <textarea value={form.description} onChange={set('description')} rows={4} maxLength={5000} placeholder={t('Ce que vous voulez construire, ce que vous apportez, ce que vous attendez de l’investisseur…')} className={`${input} mt-1 resize-y`} />
          </label>
          <label className={label}>
            {t('Wilaya')} *
            <select value={form.wilaya} onChange={set('wilaya')} className={`${input} mt-1`}>
              <option value="">{t('Choisir…')}</option>
              {wilayas.map((w) => <option key={w} value={w}>{t(w)}</option>)}
            </select>
          </label>
          <label className={label}>
            {t('Commune')} *
            <input value={form.city} onChange={set('city')} className={`${input} mt-1`} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            {t('Adresse ou lieu-dit')}
            <input value={form.address} onChange={set('address')} className={`${input} mt-1`} />
          </label>
          <label className={label}>
            {t('Surface (m²)')} *
            <input value={form.area} onChange={set('area')} inputMode="numeric" dir="ltr" className={`${input} mt-1 rtl:text-right`} />
          </label>
          <label className={label}>
            {t('Papiers du bien')}
            <select value={form.landDocument} onChange={set('landDocument')} className={`${input} mt-1`}>
              {LAND_DOCUMENTS.map((x) => <option key={x} value={x}>{t(x)}</option>)}
            </select>
          </label>
          <label className={label}>
            {t('Investissement estimé (DZD)')}
            <input value={form.budget} onChange={set('budget')} inputMode="numeric" dir="ltr" placeholder={t('Laisser vide si à définir')} className={`${input} mt-1 rtl:text-right`} />
          </label>
          <label className={label}>
            {t('Part que vous gardez (%)')}
            <input value={form.ownerShare} onChange={set('ownerShare')} inputMode="numeric" dir="ltr" placeholder="40" className={`${input} mt-1 rtl:text-right`} />
          </label>
          <label className={label}>
            {t('Téléphone de contact')}
            <input value={form.contactPhone} onChange={set('contactPhone')} type="tel" dir="ltr" className={`${input} mt-1 rtl:text-right`} />
          </label>
          <label className={label}>
            {t('Email de contact')}
            <input value={form.contactEmail} onChange={set('contactEmail')} type="email" className={`${input} mt-1`} />
          </label>

          <div className="sm:col-span-2">
            <p className={label}>{t('Photos du bien')} {project ? '' : '*'}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {keep.map((img) => (
                <div key={img.publicId} className="relative h-20 w-28 overflow-hidden rounded-xl">
                  <img src={getImageUrl(img.url)} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setKeep((k) => k.filter((x) => x.publicId !== img.publicId))} aria-label={t('Retirer la photo')} className="absolute end-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white">
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} className="relative h-20 w-28 overflow-hidden rounded-xl">
                  <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))} aria-label={t('Retirer la photo')} className="absolute end-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white">
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
              <label className="grid h-20 w-28 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-[#00B3D2] hover:text-[#00B3D2]">
                <ImagePlus className="h-6 w-6" aria-hidden="true" />
                <span className="sr-only">{t('Ajouter des photos')}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles((fs) => [...fs, ...Array.from(e.target.files || [])].slice(0, 10))} />
              </label>
            </div>
          </div>
        </div>

        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">{t('Annuler')}</button>
          <button type="submit" disabled={saving} className="rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ background: projectGradient }}>
            {saving ? t('Enregistrement...') : project ? t('Enregistrer') : t('Envoyer pour validation')}
          </button>
        </div>
      </form>
    </div>
  );
}
