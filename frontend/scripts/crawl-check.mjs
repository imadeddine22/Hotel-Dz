/**
 * Crawls the site from the home page (all languages) and reports pages that don't answer 200,
 * internal links that are broken, and pages missing a <title>, meta description or canonical.
 *   node scripts/crawl-check.mjs [baseUrl] [maxPages]
 */
const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const MAX = Number(process.argv[3] || 400);
const SKIP = /^\/(admin|owner|seller|booking|my-bookings|messages|favorites|profile|_next|api|uploads)(\/|$)/;

const queue = ['/', '/ar', '/en', '/sitemap.xml', '/robots.txt'];
const seen = new Set(queue);
const problems = [];
const meta = [];
let crawled = 0;
const t0 = Date.now();

while (queue.length && crawled < MAX) {
  const path = queue.shift();
  crawled++;
  let res, html;
  const t = Date.now();
  try {
    res = await fetch(BASE + path, { redirect: 'manual' });
    html = await res.text();
  } catch (e) {
    problems.push(`${path} → network error ${e.message}`);
    continue;
  }
  const ms = Date.now() - t;
  if (res.status >= 300 && res.status < 400) {
    const to = res.headers.get('location');
    if (to) {
      const u = new URL(to, BASE);
      if (u.origin === new URL(BASE).origin && !seen.has(u.pathname)) {
        seen.add(u.pathname);
        queue.push(u.pathname + u.search);
      }
    }
    continue;
  }
  if (res.status !== 200) problems.push(`${path} → HTTP ${res.status}`);
  const type = res.headers.get('content-type') || '';
  if (!type.includes('html')) {
    if (path === '/sitemap.xml') {
      for (const m of html.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        const u = new URL(m[1]);
        const p = u.pathname;
        if (!seen.has(p)) {
          seen.add(p);
          queue.push(p);
        }
      }
    }
    continue;
  }
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = /<meta name="description" content="[^"]+"/.test(html);
  const canonical = /<link rel="canonical"/.test(html);
  meta.push({ path, ms, title, desc, canonical, bytes: html.length });
  if (!title) problems.push(`${path} → no <title>`);
  for (const m of html.matchAll(/href="(\/[^"#?]*)(\?[^"#]*)?"/g)) {
    const p = m[1];
    if (SKIP.test(p.replace(/^\/(ar|en)(?=\/|$)/, '')) || /\.(png|jpg|svg|ico|webp|xml|txt|css|js|json|woff2?)$/.test(p)) continue;
    if (!seen.has(p)) {
      seen.add(p);
      queue.push(p);
    }
  }
}

const noDesc = meta.filter((m) => !m.desc).map((m) => m.path);
const noCanon = meta.filter((m) => !m.canonical).map((m) => m.path);
const titles = new Map();
for (const m of meta) titles.set(m.title, [...(titles.get(m.title) || []), m.path]);
const dupTitles = [...titles].filter(([, p]) => p.length > 3);
const slow = meta.filter((m) => m.ms > 1500).sort((a, b) => b.ms - a.ms).slice(0, 10);

console.log(`Crawled ${crawled} URLs (${meta.length} HTML pages) in ${((Date.now() - t0) / 1000).toFixed(1)} s; ${queue.length} left in queue`);
console.log(`\nProblems (${problems.length}):\n${problems.map((p) => '  ' + p).join('\n') || '  none'}`);
console.log(`\nPages without meta description (${noDesc.length}): ${noDesc.slice(0, 15).join(', ')}`);
console.log(`Pages without canonical (${noCanon.length}): ${noCanon.slice(0, 15).join(', ')}`);
console.log(`Titles shared by >3 pages: ${dupTitles.map(([t, p]) => `"${t}" ×${p.length}`).join('; ') || 'none'}`);
console.log(`Slowest pages (dev server): ${slow.map((m) => `${m.path} ${m.ms}ms`).join(', ') || 'none over 1.5 s'}`);
