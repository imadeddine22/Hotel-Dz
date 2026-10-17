// Finds calls t(...) where `t` resolves to something other than the useT() translator
// (e.g. `.map((t) => …)` callback params) and renames that local binding to `item`.
// Usage: node scripts/i18n-shadow-fix.cjs [--dry] <dir...>
const fs = require('fs');
const path = require('path');
const nextBabel = path.join(__dirname, '..', 'frontend', 'node_modules', 'next', 'dist', 'compiled', 'babel');
const { parse } = require(path.join(nextBabel, 'parser.js'));
const tr = require(path.join(nextBabel, 'traverse.js'));
const traverse = tr.default || tr;

const DRY = process.argv.includes('--dry');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.jsx$/.test(e.name) ? [path.join(d, e.name)] : []));
const isTranslator = (binding) =>
  binding && binding.path.isVariableDeclarator() && binding.path.node.init?.type === 'CallExpression' && binding.path.node.init.callee.name === 'useT';

let fixed = 0;
for (const root of process.argv.slice(2).filter((a) => !a.startsWith('--'))) for (const file of walk(root)) {
  const code = fs.readFileSync(file, 'utf8');
  if (!code.includes('useT')) continue;
  const ast = parse(code, { sourceType: 'module', plugins: ['jsx'] });
  const renames = [];
  traverse(ast, {
    CallExpression(p) {
      if (p.node.callee.type !== 'Identifier' || p.node.callee.name !== 't') return;
      const b = p.scope.getBinding('t');
      if (isTranslator(b)) return;
      if (b && !renames.includes(b)) renames.push(b);
    },
  });
  if (!renames.length) continue;
  // pick a free name per binding scope and rename (Babel handles all references)
  for (const b of renames) {
    let name = 'item';
    for (let i = 2; b.scope.hasBinding(name, true); i++) name = `item${i}`;
    const where = code.slice(b.path.node.start, b.path.node.start + 40).replace(/\s+/g, ' ');
    console.log(`${path.relative(process.cwd(), file)}:${b.path.node.loc.start.line}  t → ${name}   (${where})`);
    b.scope.rename('t', name);
    fixed++;
  }
  // write back by re-printing only the renamed identifiers: collect their ranges from the mutated AST
  const edits = [];
  traverse(ast, {
    Identifier(p) {
      if (p.node.name.startsWith('item') && p.node.start != null && code.slice(p.node.start, p.node.end) === 't') edits.push(p.node);
    },
  });
  let out = code;
  for (const n of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, n.start) + n.name + out.slice(n.end);
  parse(out, { sourceType: 'module', plugins: ['jsx'] });
  if (!DRY) fs.writeFileSync(file, out);
}
console.log(`\n${fixed} shadowing binding(s) ${DRY ? 'found' : 'renamed'}`);
