import { apiGetListing, NOT_FOUND, absoluteImage, truncate } from '@/lib/seo';
import { getT, pageMeta } from '@/lib/i18n/server';
import { localized } from '@/lib/i18n/localizeData';
import { InitialData } from '@/components/InitialData';

// NOT_FOUND = doesn't exist or isn't public yet (an owner previewing a pending project): never indexed
const getProject = async (id) => {
  const data = await apiGetListing(`/projects/${encodeURIComponent(id)}?noview=1`);
  if (data === NOT_FOUND) return { notFound: true };
  return localized(data, getT().lang);
};

export async function generateMetadata({ params }) {
  const data = await getProject(params.id);
  const p = data?.project;
  if (!p) {
    return { title: 'Projet d’investissement', alternates: { canonical: `/investir/${params.id}` }, robots: data?.notFound ? { index: false, follow: true } : undefined };
  }
  const { t } = getT();
  const meta = pageMeta({
    path: `/investir/${p._id}`,
    title: t('{title} — terrain à {city} cherche investisseur', { title: p.title, city: t(p.city) }),
    description:
      truncate(p.description, 155) ||
      t('Terrain de {area} m² à {city} ({wilaya}) pour un projet {type}. Partenariat : {partnership}.', { area: p.area, city: t(p.city), wilaya: t(p.wilaya), type: t(p.projectType), partnership: t(p.partnership) }),
    robots: p.status === 'approved' ? undefined : { index: false, follow: false },
  });
  return { ...meta, openGraph: { ...meta.openGraph, images: (p.images || []).slice(0, 1).map(absoluteImage), type: 'website' } };
}

export default async function Layout({ children, params }) {
  const data = await getProject(params.id);
  return <InitialData value={data?.project ? data : null}>{children}</InitialData>;
}
