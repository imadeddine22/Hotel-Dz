import Link from '@/components/LocaleLink';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { breadcrumbLd, faqLd, JsonLd } from '@/lib/seo';
import { getLang, pageMeta } from '@/lib/i18n/server';
import { localePath } from '@/lib/i18n/locale';
import { CHECKED, CONTENT, SOURCES } from './content';

const PATH = '/comparatif';

export function generateMetadata() {
  const c = CONTENT[getLang()];
  return pageMeta({ path: PATH, title: c.metaTitle, description: c.metaDescription });
}

/** "Meskan vs Booking.com, Airbnb, Ouedkniss": honest comparison, fully server-rendered. */
export default function ComparisonPage() {
  const lang = getLang();
  const c = CONTENT[lang];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <JsonLd
        data={[
          breadcrumbLd([
            { name: c.crumbs[0], path: localePath(lang, '/') },
            { name: c.crumbs[1], path: localePath(lang, PATH) },
          ]),
          faqLd(c.faq.map(([q, a]) => ({ q, a }))),
        ]}
      />

      <article className="mx-auto max-w-5xl px-4 py-12 text-slate-700 sm:px-6">
        <nav aria-label={c.crumbs[0]} className="mb-4 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900">{c.crumbs[0]}</Link>
          <span aria-hidden="true"> / </span>
          <span className="text-slate-900">{c.crumbs[1]}</span>
        </nav>

        <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl">{c.h1}</h1>
        <p className="mt-2 text-xs text-slate-400">{c.checked} {CHECKED[lang]}</p>
        <p className="mt-5 max-w-3xl text-base leading-relaxed">{c.intro}</p>

        <section className="mt-8 rounded-2xl border border-teal-100 bg-teal-50/60 p-6" aria-labelledby="tldr">
          <h2 id="tldr" className="text-lg font-bold text-slate-900">{c.tldrTitle}</h2>
          <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-relaxed">
            {c.tldr.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </section>

        <section className="mt-10" aria-labelledby="table">
          <h2 id="table" className="text-2xl font-bold text-slate-900">{c.tableTitle}</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
            <table className="w-full min-w-[720px] text-start text-sm">
              <thead className="bg-slate-50 text-slate-900">
                <tr>
                  <th scope="col" className="p-3 text-start"><span className="sr-only">{c.tableTitle}</span></th>
                  {c.columns.map((col, i) => (
                    <th key={col} scope="col" className={`p-3 text-start font-bold ${i === 0 ? 'text-teal-700' : ''}`}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.rows.map(([label, ...cells]) => (
                  <tr key={label} className="border-t border-slate-100 align-top">
                    <th scope="row" className="p-3 text-start font-semibold text-slate-900">{label}</th>
                    {cells.map((cell, i) => (
                      <td key={i} className={`p-3 ${i === 0 ? 'bg-teal-50/40 font-medium text-slate-900' : ''}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {c.sections.map((s) => (
          <section key={s.title} className="mt-10" aria-labelledby={`s-${s.title}`}>
            <h2 id={`s-${s.title}`} className="text-2xl font-bold text-slate-900">{s.title}</h2>
            {s.body.map((p) => <p key={p.slice(0, 40)} className="mt-3 max-w-3xl leading-relaxed">{p}</p>)}
          </section>
        ))}

        <section className="mt-10" aria-labelledby="who">
          <h2 id="who" className="text-2xl font-bold text-slate-900">{c.whoTitle}</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {c.who.map(([need, pick]) => (
              <div key={need} className="rounded-xl border border-slate-100 p-4">
                <dt className="text-sm text-slate-500">{need}</dt>
                <dd className="mt-1 font-bold text-slate-900">{pick}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-bold text-slate-900">{c.faqTitle}</h2>
          <div className="mt-4 space-y-4">
            {c.faq.map(([q, a]) => (
              <div key={q}>
                <h3 className="font-semibold text-slate-900">{q}</h3>
                <p className="mt-1 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10">
          <Link href="/hotels" className="inline-flex rounded-full bg-brand-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600">
            {c.cta}
          </Link>
        </div>

        <section className="mt-12 border-t border-slate-100 pt-6 text-xs text-slate-500" aria-labelledby="sources">
          <h2 id="sources" className="font-semibold text-slate-700">{c.sourcesTitle}</h2>
          <ul className="mt-2 space-y-1">
            {SOURCES.map((s) => (
              <li key={s.url}><a href={s.url} rel="noopener nofollow" target="_blank" className="underline hover:text-slate-800">{s.label}</a></li>
            ))}
          </ul>
        </section>
      </article>
      <Footer />
    </main>
  );
}
