// Apply the MM aidedd-alignment renames across every data JSON file.
// Longest-first; case variants: exact, lowercase; plural variants only when
// neither side already ends in 's'.
'use strict';
const fs = require('fs');
const path = require('path');

const pairs = JSON.parse(fs.readFileSync('_translation-work/enhanced/rename-pairs.json', 'utf8'));

function listJson(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listJson(p, out);
    else if (e.name.endsWith('.json')) out.push(p);
  }
  return out;
}
const files = listJson('data', []);

let total = 0;
const touched = [];
for (const p of files) {
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  let n = 0;
  for (const [oldFr, newFr] of pairs) {
    const variants = [[oldFr, newFr], [oldFr.toLowerCase(), newFr.toLowerCase()]];
    if (!oldFr.endsWith('s') && !newFr.endsWith('s')) variants.push([oldFr + 's', newFr + 's'], [oldFr.toLowerCase() + 's', newFr.toLowerCase() + 's']);
    for (const [a, b] of variants) {
      const c = s.split(a).length - 1;
      if (c) { s = s.split(a).join(b); n += c; }
    }
  }
  if (s !== before) {
    fs.writeFileSync(p, s);
    touched.push(`${p}: ${n}`);
    total += n;
  }
}
console.log(touched.join('\n'));
console.log('TOTAL replacements:', total, 'across', touched.length, 'files');
