/**
 * Small staged load test of READ-ONLY public endpoints (no dependencies; k6-like summary).
 *
 *   node tests/load.mjs [apiUrl] [stages] [secondsPerStage]
 *   node tests/load.mjs http://localhost:5056/api/v1 1,5,10,25,50 15
 *
 * Refuses deployed URLs unless LOAD_TEST_ALLOW_REMOTE=1 — never point this at production
 * without an agreed test window: Render / Atlas free tiers are easy to saturate.
 * The API rate limit (RATE_LIMIT_MAX, per IP) also applies: raise it on the test server.
 */
const API = (process.argv[2] || 'http://localhost:5056/api/v1').replace(/\/$/, '');
const STAGES = (process.argv[3] || '1,5,10,25,50').split(',').map(Number);
const SECONDS = Number(process.argv[4] || 15);
if (!/localhost|127\.0\.0\.1/.test(API) && process.env.LOAD_TEST_ALLOW_REMOTE !== '1') {
  console.error('Refusing to load-test a remote API (set LOAD_TEST_ALLOW_REMOTE=1 if you really mean it).');
  process.exit(1);
}

// Mix of what a visitor's pages call
const get = async (p) => (await fetch(API + p)).json();
const hotels = (await get('/hotels?limit=12')).hotels || [];
const houses = (await get('/houses?limit=12')).houses || [];
const PATHS = [
  '/hotels?limit=12',
  '/houses?limit=12&sort=newest',
  '/sales?limit=12',
  '/hotels?wilaya=Alger&limit=12',
  '/sales?q=appartement&limit=12',
  '/wilayas',
  '/wilayas/popular',
  '/testimonials',
  ...hotels.slice(0, 4).map((h) => `/hotels/${h._id}`),
  ...houses.slice(0, 4).map((h) => `/houses/${h._id}`),
  ...hotels.slice(0, 2).map((h) => `/hotels/${h._id}/rooms`),
];

const pct = (arr, p) => (arr.length ? arr[Math.min(arr.length - 1, Math.floor((p / 100) * arr.length))] : 0);

async function stage(vus) {
  const lat = [];
  const codes = {};
  let errors = 0;
  const end = Date.now() + SECONDS * 1000;
  const worker = async () => {
    let i = Math.floor(Math.random() * PATHS.length);
    while (Date.now() < end) {
      const p = PATHS[i++ % PATHS.length];
      const t = performance.now();
      try {
        const r = await fetch(API + p, { signal: AbortSignal.timeout(10000) });
        await r.arrayBuffer();
        codes[r.status] = (codes[r.status] || 0) + 1;
        if (r.status >= 500 || r.status === 429) errors++;
      } catch {
        codes.timeout = (codes.timeout || 0) + 1;
        errors++;
      }
      lat.push(performance.now() - t);
    }
  };
  const t0 = Date.now();
  await Promise.all(Array.from({ length: vus }, worker));
  const secs = (Date.now() - t0) / 1000;
  lat.sort((a, b) => a - b);
  return { vus, requests: lat.length, rps: lat.length / secs, p50: pct(lat, 50), p90: pct(lat, 90), p95: pct(lat, 95), max: lat.at(-1) || 0, errorRate: errors / Math.max(1, lat.length), codes };
}

console.log(`Load test ${API} — stages ${STAGES.join(' → ')} VUs, ${SECONDS}s each, ${PATHS.length} read-only endpoints\n`);
console.log('VUs  requests   req/s    p50     p90     p95     max    errors  status codes');
const rows = [];
for (const vus of STAGES) {
  const r = await stage(vus);
  rows.push(r);
  const f = (ms) => `${ms.toFixed(0)}ms`.padStart(7);
  console.log(`${String(vus).padStart(3)}  ${String(r.requests).padStart(8)}  ${r.rps.toFixed(1).padStart(6)} ${f(r.p50)} ${f(r.p90)} ${f(r.p95)} ${f(r.max)}  ${(r.errorRate * 100).toFixed(1).padStart(5)}%  ${JSON.stringify(r.codes)}`);
  if (r.errorRate > 0.05) {
    console.log('Error rate above 5 % — stopping before the next stage.');
    break;
  }
}
// recovery: one request after the load
const t = performance.now();
const ok = (await fetch(`${API}/health`)).status;
console.log(`\nRecovery: /health → ${ok} in ${(performance.now() - t).toFixed(0)}ms`);
