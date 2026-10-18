// Lists string literals that look like user-visible French text but are not passed through t()/<T>.
// Usage: node scripts/i18n-report.cjs frontend/src/app frontend/src/components
const fs = require('fs');
const path = require('path');
const nextBabel = path.join(__dirname, '..', 'frontend', 'node_modules', 'next', 'dist', 'compiled', 'babel');
const { parse } = require(path.join(nextBabel, 'parser.js'));
const tr = require(path.join(nextBabel, 'traverse.js'));
const traverse = tr.default || tr;

const IGNORE_ATTRS = new Set(['className', 'href', 'src', 'id', 'type', 'name', 'key', 'rel', 'target', 'role', 'htmlFor', 'value', 'autoComplete', 'inputMode', 'variant', 'list', 'method', 'action', 'd', 'viewBox', 'fill', 'stroke']);
const looksText = (s) => /[a-zà-ÿ]{3,}\s+[a-zà-ÿ'’]{2,}/i.test(s) && !/^[\w-]+(\s[\w:/.[\]-]+)*$/.test(s.trim()) || /[àâçéèêëîïôûùüœ]/i.test(s) && !/[{}=<>]/.test(s);
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.jsx?$/.test(e.name) ? [path.join(d, e.name)] : []));

let n = 0;
const byFile = {};
for (const root of process.argv.slice(2)) for (const f of walk(root)) {
  if (/lib[\\/]i18n|keys\.json/.test(f)) continue;
  const code = fs.readFileSync(f, 'utf8');
  let ast;
  try { ast = parse(code, { sourceType: 'module', plugins: ['jsx'] }); } catch { continue; }
  traverse(ast, {
    StringLiteral(p) {
      const v = p.node.value;
      if (!looksText(v) || /[؀-ۿ]/.test(v)) return;
      if (p.parentPath.isImportDeclaration() || p.parentPath.isExportNamedDeclaration()) return;
      if (p.parentPath.isJSXAttribute() && IGNORE_ATTRS.has(p.parentPath.node.name.name)) return;
      if (p.findParent((q) => q.isCallExpression() && q.node.callee.name === 't') || p.findParent((q) => q.isJSXElement() && q.node.openingElement.name.name === 'T')) return;
      if (p.parentPath.isObjectProperty() && p.key === 'key') return;
      if (p.findParent((q) => q.isExportNamedDeclaration() && /metadata|generateMetadata/.test(code.slice(q.node.start, q.node.start + 80)))) return; // SEO metadata stays French
      (byFile[f] ||= []).push(`${p.node.loc.start.line}: ${v.slice(0, 90)}`);
      n++;
    },
  });
}
for (const [f, l] of Object.entries(byFile)) console.log(`\n${path.relative(process.cwd(), f)} (${l.length})\n  ${l.slice(0, 12).join('\n  ')}${l.length > 12 ? `\n  … +${l.length - 12}` : ''}`);
console.log(`\n${n} candidate string(s)`);
