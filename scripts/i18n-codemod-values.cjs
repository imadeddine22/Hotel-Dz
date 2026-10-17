// i18n pass 2: wrap rendered *values* that come from constant tables in t() / <T>:
//   {s.label} {f.q} {f.a} {item.title} {h.type} {h.wilaya}   → {t(s.label)} …
//   {TYPES.map((x) => <option>{x}</option>)}                   → {t(x)}
// t() returns unknown keys unchanged, so wrapping a value that isn't in the dictionary is harmless.
// Usage: node scripts/i18n-codemod-values.cjs [--dry] <dir...>
const fs = require('fs');
const path = require('path');
const nextBabel = path.join(__dirname, '..', 'frontend', 'node_modules', 'next', 'dist', 'compiled', 'babel');
const { parse } = require(path.join(nextBabel, 'parser.js'));
const tr = require(path.join(nextBabel, 'traverse.js'));
const traverse = tr.default || tr;

const DRY = process.argv.includes('--dry');
const PROPS = new Set(['label', 'title', 'text', 'desc', 'q', 'a', 'subtitle', 'role', 'tag', 'type', 'wilaya', 'city', 'short', 'blurb', 'value_label']);
const ATTRS = new Set(['placeholder', 'title', 'aria-label', 'alt', 'label', 'help']);
const SKIP_FILES = /[\\/](lib[\\/]i18n|T\.jsx|BrandLogo\.jsx|CtaBanner\.jsx)/;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.jsx$/.test(e.name) ? [path.join(d, e.name)] : []));
const isTranslator = (b) => b && b.path.isVariableDeclarator() && b.path.node.init?.type === 'CallExpression' && b.path.node.init.callee.name === 'useT';

let total = 0;
for (const root of process.argv.slice(2).filter((a) => !a.startsWith('--'))) for (const file of walk(root)) {
  if (SKIP_FILES.test(file)) continue;
  const code = fs.readFileSync(file, 'utf8');
  const isClient = /^\s*['"]use client['"]/.test(code);
  const ast = parse(code, { sourceType: 'module', plugins: ['jsx'] });
  const edits = [];
  const hooks = new Map();
  const renames = [];

  const componentOf = (p) => {
    let fn = p.getFunctionParent();
    while (fn) {
      let name = fn.node.id?.name;
      if (!name && fn.parentPath.isVariableDeclarator()) name = fn.parentPath.node.id.name;
      if ((name && /^[A-Z]/.test(name)) || fn.parentPath.isExportDefaultDeclaration()) return fn;
      fn = fn.getFunctionParent();
    }
    return null;
  };
  const alreadyWrapped = (p) =>
    p.findParent((q) => (q.isCallExpression() && q.node.callee.name === 't') || (q.isJSXElement() && q.node.openingElement.name.name === 'T'));

  const wrapExpr = (exprPath, containerPath) => {
    if (alreadyWrapped(exprPath)) return;
    const src = code.slice(exprPath.node.start, exprPath.node.end);
    if (isClient) {
      const comp = componentOf(exprPath);
      if (!comp) return;
      const b = exprPath.scope.getBinding('t');
      if (b && !isTranslator(b)) {
        if (b.scope === comp.scope || b.path.isVariableDeclarator()) return; // a real local `t` we shouldn't touch
        if (!renames.includes(b)) renames.push(b); // e.g. .map((t) => …) param → rename
      }
      if (!hooks.has(comp.node)) {
        const body = comp.node.body;
        const has = body.type === 'BlockStatement' && body.body.some((st) => code.slice(st.start, st.end).includes('useT('));
        hooks.set(comp.node, has || body.type !== 'BlockStatement' ? null : body.start + 1);
        if (body.type !== 'BlockStatement' && !has) return; // concise arrow without hook: skip (rare)
      }
      // pure insertions: they never shift each other or a rename inside the expression
      edits.push({ start: exprPath.node.start, end: exprPath.node.start, text: 't(' });
      edits.push({ start: exprPath.node.end, end: exprPath.node.end, text: ')' });
    } else if (containerPath.parentPath.isJSXElement() || containerPath.parentPath.isJSXFragment()) {
      edits.push({ start: containerPath.node.start, end: containerPath.node.start, text: '<T>' });
      edits.push({ start: containerPath.node.end, end: containerPath.node.end, text: '</T>' });
    }
    total++;
  };

  traverse(ast, {
    JSXExpressionContainer(p) {
      const e = p.get('expression');
      const inAttr = p.parentPath.isJSXAttribute();
      if (inAttr && !ATTRS.has(p.parentPath.node.name.name)) return;
      if (inAttr && !isClient) return;
      // {obj.label}
      if (e.isMemberExpression() && !e.node.computed && PROPS.has(e.node.property.name)) return wrapExpr(e, p);
      // {c.name} where c iterates over an UPPER_CASE constant table (categories, menus…)
      if (e.isMemberExpression() && !e.node.computed && e.node.property.name === 'name' && e.node.object.type === 'Identifier') {
        const b = e.scope.getBinding(e.node.object.name);
        const call = b?.kind === 'param' ? b.path.parentPath.parentPath : null;
        if (call?.isCallExpression() && call.node.callee.property?.name === 'map' && /^[A-Z][A-Z0-9_]+$/.test(call.node.callee.object?.name || '')) return wrapExpr(e, p);
      }
      // {STATUS[x].label} handled above; {x} where x is a .map param over an UPPER_CASE array
      if (e.isIdentifier() && !inAttr) {
        const b = e.scope.getBinding(e.node.name);
        if (!b || b.kind !== 'param') return;
        const fn = b.path.parentPath;
        const call = fn.parentPath;
        if (!call?.isCallExpression() || call.node.callee.type !== 'MemberExpression' || call.node.callee.property.name !== 'map') return;
        const arr = call.node.callee.object;
        if (arr.type === 'Identifier' && /^[A-Z][A-Z0-9_]+$/.test(arr.name)) return wrapExpr(e, p);
      }
    },
  });

  if (!edits.length) continue;

  // rename shadowing params (e.g. `.map((t) => …)`) before applying text edits: do it textually
  // on every reference of those bindings
  for (const b of renames) {
    let name = 'item';
    for (let i = 2; b.scope.hasBinding(name, true); i++) name = `item${i}`;
    for (const ref of [b.identifier, ...b.referencePaths.map((r) => r.node)]) edits.push({ start: ref.start, end: ref.end, text: name, rename: true });
  }
  for (const [, at] of hooks) if (at != null) edits.push({ start: at, end: at, text: '\n  const { t } = useT();' });

  // apply from the end of the file backwards; at the same offset, closing insertions (')', '</T>')
  // go after opening ones so `x` → `t(x)` rather than `)t(x`
  // and a rename (`t` → `item`) at the same offset as an opening `t(` must be applied first,
  // otherwise it rewrites the `t` of the inserted `t(` (→ `item(t)`)
  const rank = (e) => (e.rename ? 2 : e.text === ')' || e.text === '</T>' ? 0 : 1);
  edits.sort((a, b) => b.start - a.start || rank(b) - rank(a));
  let out = code;
  for (const ed of edits) out = out.slice(0, ed.start) + ed.text + out.slice(ed.end);
  const importLine = isClient ? "import { useT } from '@/lib/i18n/useT';" : "import T from '@/components/T';";
  if (!out.includes(importLine)) {
    const imports = [...out.matchAll(/^import[^;]+;\s*$/gm)];
    const last = imports[imports.length - 1];
    out = out.slice(0, last.index + last[0].length) + '\n' + importLine + out.slice(last.index + last[0].length);
  }
  try {
    parse(out, { sourceType: 'module', plugins: ['jsx'] });
  } catch (err) {
    console.log(`${path.relative(process.cwd(), file)}: REWRITE PARSE ERROR ${err.message} — left unchanged`);
    continue;
  }
  if (!DRY) fs.writeFileSync(file, out);
  console.log(`${path.relative(process.cwd(), file)}: ${edits.filter((x) => x.text === 't(' || x.text === '<T>').length} value(s)${renames.length ? `, renamed ${renames.length} shadowing param(s)` : ''}`);
}
console.log(`\n${total} value expression(s) wrapped${DRY ? ' (dry run)' : ''}`);
