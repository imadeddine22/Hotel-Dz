// Static check: report identifiers that are referenced but never declared or imported
// (e.g. a helper used without its import — which `next build` does not catch and which
// crashes the page at runtime). Uses the Babel copy bundled with Next.js.
//
// Usage: node scripts/check-undefined.cjs frontend/src backend/src
const fs = require('fs');
const path = require('path');

const nextBabel = path.join(__dirname, '..', 'frontend', 'node_modules', 'next', 'dist', 'compiled', 'babel');
const { parse } = require(path.join(nextBabel, 'parser.js'));
const traverse = require(path.join(nextBabel, 'traverse.js')).default || require(path.join(nextBabel, 'traverse.js'));

const GLOBALS = new Set([
  // JS / browser / node runtime
  'window', 'document', 'navigator', 'location', 'localStorage', 'sessionStorage', 'console', 'process', 'Buffer',
  'fetch', 'Response', 'Request', 'Headers', 'FormData', 'Blob', 'File', 'URL', 'URLSearchParams', 'AbortSignal',
  'AbortController', 'DataTransfer', 'Event', 'CustomEvent', 'Image', 'HTMLElement', 'IntersectionObserver',
  'ResizeObserver', 'MutationObserver', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'requestAnimationFrame', 'cancelAnimationFrame', 'alert', 'confirm', 'prompt', 'atob', 'btoa', 'crypto',
  'structuredClone', 'queueMicrotask', 'globalThis', 'require', 'module', 'exports', '__dirname', '__filename',
  'Object', 'Array', 'String', 'Number', 'Boolean', 'Symbol', 'Math', 'Date', 'JSON', 'Promise', 'Map', 'Set',
  'WeakMap', 'WeakSet', 'RegExp', 'Error', 'TypeError', 'RangeError', 'SyntaxError', 'Intl', 'Reflect', 'Proxy',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent', 'encodeURI',
  'decodeURI', 'Infinity', 'NaN', 'undefined', 'Uint8Array', 'ArrayBuffer', 'TextEncoder', 'TextDecoder',
  'arguments', 'L', 'google', 'React',
]);

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === 'node_modules' || e.name.startsWith('.')) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.(jsx?|mjs)$/.test(e.name) ? [p] : [];
  });

let problems = 0;
for (const root of process.argv.slice(2)) {
  for (const file of walk(root)) {
    const code = fs.readFileSync(file, 'utf8');
    let ast;
    try {
      ast = parse(code, { sourceType: 'module', plugins: ['jsx', 'importAttributes'], errorRecovery: true });
    } catch (e) {
      console.log(`${file}: parse error ${e.message}`);
      problems++;
      continue;
    }
    const seen = new Set();
    traverse(ast, {
      ReferencedIdentifier(p) {
        const { name } = p.node;
        if (GLOBALS.has(name) || p.scope.hasBinding(name, true)) return;
        // <Foo.Bar> / JSX intrinsic elements (lowercase) are not identifiers we care about
        if (p.isJSXIdentifier() && /^[a-z]/.test(name)) return;
        const key = `${name}:${p.node.loc?.start.line}`;
        if (seen.has(key)) return;
        seen.add(key);
        console.log(`${file}:${p.node.loc?.start.line}  '${name}' is not defined`);
        problems++;
      },
    });
  }
}
console.log(problems ? `\n${problems} problem(s)` : 'No undefined identifiers found.');
process.exit(problems ? 1 : 0);
