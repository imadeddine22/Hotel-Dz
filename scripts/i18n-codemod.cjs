// i18n codemod: wraps user-visible French strings in JSX with t() (client components) or <T>
// (server components), adds the needed import/hook, and writes the list of keys.
//
// Only touches source ranges it rewrites (no reformatting). Re-runnable: strings already
// inside t(...) / <T> are skipped.
//
// Usage: node scripts/i18n-codemod.cjs [--dry] <dir...>
const fs = require('fs');
const path = require('path');
const nextBabel = path.join(__dirname, '..', 'frontend', 'node_modules', 'next', 'dist', 'compiled', 'babel');
const { parse } = require(path.join(nextBabel, 'parser.js'));
const traverseMod = require(path.join(nextBabel, 'traverse.js'));
const traverse = traverseMod.default || traverseMod;

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const roots = args.filter((a) => !a.startsWith('--'));

const ATTRS = new Set(['placeholder', 'title', 'aria-label', 'alt', 'label']);
const CALLS = new Set(['alert', 'confirm', 'prompt', 'setError', 'setMsg', 'setMessage', 'setSuccess', 'setNotice']);
// CtaBanner ships its own fr/ar/en copy
const SKIP_FILES = /[\\/](lib[\\/]i18n|T\.jsx|BrandLogo\.jsx|CtaBanner\.jsx)/;

const hasLetters = (s) => /[A-Za-zÀ-ÿ]/.test(s);
const hasArabic = (s) => /[؀-ۿ]/.test(s);
// "/hotels/123" is a path, but "/ nuit" or "/nuit" (per night) is text
const looksTechnical = (s) => /^(https?:|\/[a-z0-9-]*\/|\/[a-z0-9-]+$(?<!\/(nuit|mois|an|jour|pers))|#|[\w-]+\.(png|jpe?g|svg|webp)$)/.test(s.trim()) || /^[a-z0-9_-]+$/.test(s) && !/\s/.test(s) && s.length < 3;
const isCandidate = (s) => {
  const v = s.trim();
  return v.length > 0 && hasLetters(v) && !hasArabic(v) && !looksTechnical(v);
};
const jsStr = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.jsx$/.test(e.name) ? [p] : [];
  });

const allKeys = new Set();
const report = [];

for (const root of roots) {
  for (const file of walk(root)) {
    if (SKIP_FILES.test(file)) continue;
    let code = fs.readFileSync(file, 'utf8');
    const isClient = /^\s*['"]use client['"]/.test(code);
    let ast;
    try {
      ast = parse(code, { sourceType: 'module', plugins: ['jsx'] });
    } catch (e) {
      report.push(`${file}: parse error ${e.message}`);
      continue;
    }

    const edits = []; // { start, end, text }
    const needHook = new Map(); // component fn node → insertion offset
    let skipped = 0;

    const insideT = (p) =>
      p.findParent((q) =>
        (q.isCallExpression() && q.node.callee.type === 'Identifier' && q.node.callee.name === 't') ||
        (q.isJSXElement() && q.node.openingElement.name.name === 'T') ||
        (q.isJSXElement() && ['script', 'style', 'code', 'pre'].includes(q.node.openingElement.name.name))
      );

    // Nearest enclosing React component (Capitalised function / arrow, or default export function)
    const componentOf = (p) => {
      let fn = p.getFunctionParent();
      while (fn) {
        const n = fn.node;
        let name = n.id?.name;
        if (!name && fn.parentPath.isVariableDeclarator()) name = fn.parentPath.node.id.name;
        const isDefault = fn.parentPath.isExportDefaultDeclaration();
        if ((name && /^[A-Z]/.test(name)) || isDefault) return fn;
        fn = fn.getFunctionParent();
      }
      return null;
    };

    const scheduleHook = (comp) => {
      if (!comp || needHook.has(comp.node)) return;
      const body = comp.node.body;
      if (body.type === 'BlockStatement') {
        // already has `const { t } = useT()` ?
        const has = body.body.some((st) => st.type === 'VariableDeclaration' && code.slice(st.start, st.end).includes('useT('));
        if (!has) needHook.set(comp.node, { at: body.start + 1, kind: 'block' });
        else needHook.set(comp.node, null);
      } else {
        // concise arrow body: () => (<jsx/>) → () => { const { t } = useT(); return (<jsx/>); }
        needHook.set(comp.node, { kind: 'arrow', start: body.start, end: body.end, paren: code[body.start - 1] === '(' });
      }
    };

    /** Replace a string node with a translated expression; returns false if not possible. */
    const wrap = (p, key, vars, { asJsxChild = false, start, end } = {}) => {
      allKeys.add(key);
      const varsSrc = vars && vars.length ? `, { ${vars.join(', ')} }` : '';
      if (isClient) {
        const comp = componentOf(p);
        if (!comp) { skipped++; return false; }
        scheduleHook(comp);
        const expr = `t(${jsStr(key)}${varsSrc})`;
        edits.push({ start, end, text: asJsxChild ? `{${expr}}` : expr });
      } else {
        if (!asJsxChild) { skipped++; return false; } // server: only JSX children can host <T>
        const v = vars && vars.length ? ` vars={{ ${vars.join(', ')} }}` : '';
        edits.push({ start, end, text: vars && vars.length ? `<T k=${JSON.stringify(key)}${v} />` : `<T>${key.replace(/[{}<>]/g, (c) => `{'${c}'}`)}</T>` });
      }
      return true;
    };

    /** Template literal → key with {name} placeholders (identifiers / simple member paths only). */
    const templateKey = (tl) => {
      const vars = [];
      let key = '';
      for (let i = 0; i < tl.quasis.length; i++) {
        key += tl.quasis[i].value.cooked;
        const ex = tl.expressions[i];
        if (!ex) continue;
        let name;
        if (ex.type === 'Identifier') name = ex.name;
        else if (ex.type === 'MemberExpression' && !ex.computed && ex.property.type === 'Identifier') name = ex.property.name;
        else return null; // complex expression: leave it alone
        const src = code.slice(ex.start, ex.end);
        vars.push(name === src ? name : `${name}: ${src}`);
        key += `{${name}}`;
      }
      return { key, vars: [...new Set(vars)] };
    };

    const handleExprString = (p) => {
      // only strings that end up rendered: direct JSX expression children, or branches of
      // ?: / && / || inside one
      let q = p;
      while (q.parentPath && (q.parentPath.isConditionalExpression() && q.key !== 'test' || q.parentPath.isLogicalExpression() && q.key === 'right')) q = q.parentPath;
      const container = q.parentPath;
      if (!container?.isJSXExpressionContainer()) return;
      const inAttr = container.parentPath.isJSXAttribute();
      if (inAttr && !ATTRS.has(container.parentPath.node.name.name)) return;
      if (insideT(p)) return;
      if (p.isStringLiteral()) {
        if (!isCandidate(p.node.value)) return;
        wrap(p, p.node.value.trim() === p.node.value ? p.node.value : p.node.value, null, { start: p.node.start, end: p.node.end });
      } else if (p.isTemplateLiteral()) {
        const tk = templateKey(p.node);
        if (!tk || !isCandidate(tk.key.replace(/\{\w+\}/g, ''))) return;
        wrap(p, tk.key, tk.vars, { start: p.node.start, end: p.node.end });
      }
    };

    traverse(ast, {
      JSXText(p) {
        const raw = code.slice(p.node.start, p.node.end);
        if (!isCandidate(p.node.value) || insideT(p)) return;
        // keep surrounding whitespace, translate the trimmed core
        const lead = raw.match(/^\s*/)[0].length;
        const trail = raw.match(/\s*$/)[0].length;
        const value = p.node.value.replace(/\s+/g, ' ').trim();
        wrap(p, value, null, { asJsxChild: true, start: p.node.start + lead, end: p.node.end - trail });
      },
      JSXAttribute(p) {
        const name = p.node.name.name;
        const v = p.node.value;
        if (!ATTRS.has(name) || !v || v.type !== 'StringLiteral' || !isCandidate(v.value)) return;
        if (!isClient) return;
        if (wrap(p, v.value, null, { start: v.start, end: v.end })) {
          const last = edits[edits.length - 1];
          last.text = `{${last.text}}`;
        }
      },
      StringLiteral(p) {
        if (p.parentPath.isJSXAttribute()) return;
        if (p.parentPath.isCallExpression() && p.key === 0 || (p.parentPath.isCallExpression() && p.listKey === 'arguments' && p.key === 0)) {
          const callee = p.parentPath.node.callee;
          const fname = callee.type === 'Identifier' ? callee.name : callee.type === 'MemberExpression' ? callee.property.name : '';
          if (CALLS.has(fname) && isCandidate(p.node.value) && !insideT(p)) wrap(p, p.node.value, null, { start: p.node.start, end: p.node.end });
          return;
        }
        handleExprString(p);
      },
      TemplateLiteral(p) {
        if (p.parentPath.isTaggedTemplateExpression()) return;
        if (p.parentPath.isCallExpression() && p.key === 0) {
          const callee = p.parentPath.node.callee;
          const fname = callee.type === 'Identifier' ? callee.name : callee.type === 'MemberExpression' ? callee.property.name : '';
          if (CALLS.has(fname) && !insideT(p)) {
            const tk = templateKey(p.node);
            if (tk && isCandidate(tk.key.replace(/\{\w+\}/g, ''))) wrap(p, tk.key, tk.vars, { start: p.node.start, end: p.node.end });
          }
          return;
        }
        handleExprString(p);
      },
    });

    if (!edits.length) {
      if (skipped) report.push(`${path.relative(process.cwd(), file)}: ${skipped} string(s) skipped (no component scope)`);
      continue;
    }

    // hooks
    for (const [, h] of needHook) {
      if (!h) continue;
      if (h.kind === 'block') edits.push({ start: h.at, end: h.at, text: '\n  const { t } = useT();' });
      else edits.push({ start: h.start, end: h.start, text: '{ const { t } = useT(); return (', wrapEnd: h.end, paren: h.paren });
    }
    // arrow wraps need a closing token at body end
    for (const e of [...edits]) if (e.wrapEnd !== undefined) edits.push({ start: e.wrapEnd, end: e.wrapEnd, text: '); }' });

    // apply from the end so offsets stay valid
    edits.sort((a, b) => b.start - a.start || b.end - a.end);
    let out = code;
    for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);

    // imports
    const importLine = isClient ? "import { useT } from '@/lib/i18n/useT';" : "import T from '@/components/T';";
    if (!out.includes(importLine)) {
      const m = out.match(/^(?:\s*['"]use client['"];?\s*\n)?(?:\s*\n)*/);
      // after the last top-level import
      const imports = [...out.matchAll(/^import[^;]+;\s*$/gm)];
      if (imports.length) {
        const last = imports[imports.length - 1];
        const pos = last.index + last[0].length;
        out = out.slice(0, pos) + '\n' + importLine + out.slice(pos);
      } else {
        const pos = m ? m[0].length : 0;
        out = out.slice(0, pos) + importLine + '\n' + out.slice(pos);
      }
    }

    // sanity: the rewritten file must still parse
    try {
      parse(out, { sourceType: 'module', plugins: ['jsx'] });
    } catch (e) {
      report.push(`${path.relative(process.cwd(), file)}: REWRITE PARSE ERROR ${e.message} — file left unchanged`);
      continue;
    }
    if (!DRY) fs.writeFileSync(file, out);
    report.push(`${path.relative(process.cwd(), file)}: ${edits.filter((e) => !e.wrapEnd && !/useT\(\)/.test(e.text) && e.text !== '); }').length} string(s)${skipped ? `, ${skipped} skipped` : ''}`);
  }
}

const keysFile = path.join(__dirname, '..', 'frontend', 'src', 'lib', 'i18n', 'keys.json');
const existing = fs.existsSync(keysFile) ? JSON.parse(fs.readFileSync(keysFile, 'utf8')) : [];
const merged = [...new Set([...existing, ...allKeys])].sort((a, b) => a.localeCompare(b, 'fr'));
if (!DRY) fs.writeFileSync(keysFile, JSON.stringify(merged, null, 2));
console.log(report.join('\n'));
console.log(`\n${allKeys.size} distinct strings this run, ${merged.length} keys total${DRY ? ' (dry run)' : ''}`);
