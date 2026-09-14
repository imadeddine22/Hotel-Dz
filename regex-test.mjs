const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const current = (w) => new RegExp(w.replace(/[-\s]/g, '[-s]'), 'i');
const fixed = (w) => new RegExp(escapeRegex(w).replace(/[-\s]/g, '[\\s-]'), 'i');

const cases = [
  ['Tizi-Ouzou', 'Tizi Ouzou'],
  ['Oum-El-Bouaghi', 'Oum El Bouaghi'],
  ['Alger', 'Alger'],
];

console.log('slug -> stored            current  fixed');
for (const [slug, stored] of cases) {
  console.log(
    `${slug.padEnd(18)} -> ${stored.padEnd(18)} ${String(current(slug).test(stored)).padEnd(8)} ${fixed(slug).test(stored)}`
  );
}

console.log('\nmalicious/invalid input:');
for (const bad of ['(((', 'a{2,', '\\']) {
  let cur;
  try { new RegExp(bad, 'i'); cur = 'ok'; } catch (e) { cur = 'THROWS -> 500'; }
  let fx;
  try { new RegExp(escapeRegex(bad), 'i'); fx = 'ok (escaped)'; } catch (e) { fx = 'THROWS'; }
  console.log(`  input ${JSON.stringify(bad).padEnd(8)} current=${cur.padEnd(15)} fixed=${fx}`);
}
