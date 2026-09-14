// Temporary static analysis: verify every relative import resolves and that
// named imports actually exist as exports in the target file.
import fs from 'fs';
import path from 'path';

const ROOTS = ['backend/src', 'backend/server.js', 'backend/dev-local.js', 'frontend/src'];
const EXTS = ['', '.js', '.jsx', '.mjs', '.json', '/index.js', '/index.jsx'];

function walk(p, out = []) {
  const st = fs.statSync(p);
  if (st.isFile()) { out.push(p); return out; }
  for (const e of fs.readdirSync(p)) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    walk(path.join(p, e), out);
  }
  return out;
}

const files = [];
for (const r of ROOTS) { if (fs.existsSync(r)) walk(r, files); }
const code = files.filter(f => /\.(js|jsx|mjs)$/.test(f));

// Collect exports per file
const exportsMap = new Map();
for (const f of code) {
  const src = fs.readFileSync(f, 'utf8');
  const names = new Set();
  let m;
  const reNamed = /export\s+(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z0-9_$]+)/g;
  while ((m = reNamed.exec(src))) names.add(m[1]);
  const reBrace = /export\s*\{([^}]+)\}/g;
  while ((m = reBrace.exec(src))) {
    for (const part of m[1].split(',')) {
      const seg = part.trim(); if (!seg) continue;
      const as = seg.split(/\s+as\s+/);
      names.add((as[1] || as[0]).trim());
    }
  }
  if (/export\s+default/.test(src)) names.add('default');
  if (/export\s*\*/.test(src)) names.add('*');
  exportsMap.set(path.resolve(f), names);
}

const problems = [];
for (const f of code) {
  const src = fs.readFileSync(f, 'utf8');
  const reImport = /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = reImport.exec(src))) {
    const clause = m[1] || '';
    const spec = m[2] || m[3];
    if (!spec) continue;
    let resolvedBase = null;
    if (spec.startsWith('.')) {
      resolvedBase = path.resolve(path.dirname(f), spec);
    } else if (spec.startsWith('@/')) {
      resolvedBase = path.resolve('frontend/src', spec.slice(2));
    } else {
      continue; // bare package import, checked separately
    }
    let hit = null;
    for (const ext of EXTS) {
      const cand = resolvedBase + ext;
      if (fs.existsSync(cand) && fs.statSync(cand).isFile()) { hit = cand; break; }
    }
    if (!hit) { problems.push(`${f}: UNRESOLVED import '${spec}'`); continue; }
    const avail = exportsMap.get(path.resolve(hit));
    if (!avail || avail.has('*')) continue;
    // default import
    const defaultMatch = clause.match(/^\s*([A-Za-z0-9_$]+)\s*(?:,|$)/);
    if (defaultMatch && !clause.trim().startsWith('{') && !clause.trim().startsWith('*')) {
      if (!avail.has('default')) problems.push(`${f}: '${spec}' has NO DEFAULT export (imported as ${defaultMatch[1]})`);
    }
    const braceMatch = clause.match(/\{([^}]+)\}/);
    if (braceMatch) {
      for (const part of braceMatch[1].split(',')) {
        const seg = part.trim(); if (!seg) continue;
        const name = seg.split(/\s+as\s+/)[0].trim();
        if (!avail.has(name)) problems.push(`${f}: '${spec}' does NOT export '${name}'`);
      }
    }
  }
}

console.log(problems.length ? problems.join('\n') : 'No import/export problems found.');
console.log(`\nScanned ${code.length} files.`);
