#!/usr/bin/env node
// English-residue scanner for translated JSON data files. Strips inline tags
// before matching, skips names/paths/image titles by default. Usage:
//   node scan-english.cjs <file.json> [more.json...]
// Every hit needs triage: phonetic guides, book titles, bibliography author
// names, and image paths are legitimate; anything else is a defect.
// NOTE: the stopword list includes "of" — detectors without it shipped bugs
// ("Warden of Waterdeep", "One of Manshoon's lieutenants").
'use strict';
const fs = require('fs');

const STOP = /\b(the|and|with|that|from|your|attack|creature|dungeon|magic|monster|spell|while|which|wizard|each|has|have|had|into|them|they|when|will|must|of|off|its|his|her|was|were|been|being|who|whom|whose|those|these|most|many|other|more|some|any|all|area|door|room|floor|character|rounds?|hours?|days?|feet|swarm|doesn|won|can't|cannot)\b/gi;

// multi-stopword threshold: >=2 hits in one string = suspicious
const strip = (s) => s
  .replace(/\{@[a-z]+ [^}]*\}/g, '')   // entity/nav tags incl. payload
  .replace(/\{@\.[^}]*\}/g, '');        // style tags {@b}, {@i}, {@link}...

let total = 0;
for (const file of process.argv.slice(2)) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  const hits = [];
  (function walk(o, p, key) {
    if (typeof o === 'string') {
      const isPath = /\.(webp|png|jpg|json)$/i.test(o) || /^adventure\/|^bestiary\/|^covers\//.test(o);
      const isName = key === 'name' || key === 'header';
      if (!isPath && !isName && o.length > 2) {
        const t = strip(o);
        const m = t.match(STOP);
        if (m && m.length >= 2) hits.push({ p: p + ' (' + key + ')', s: o });
      }
      return;
    }
    if (Array.isArray(o)) { o.forEach((v, i) => walk(v, `${p}[${i}]`, key)); return; }
    if (o && typeof o === 'object') { for (const k of Object.keys(o)) walk(o[k], `${p}.${k}`, k); }
  })(j, '');
  total += hits.length;
  console.log(`=== ${file}: ${hits.length} suspicious strings`);
  const seen = new Set();
  for (const h of hits) {
    const sig = h.s.slice(0, 60);
    if (seen.has(sig)) continue;
    seen.add(sig);
    console.log('  • ' + h.p + ' :: ' + JSON.stringify(h.s.slice(0, 110)));
    if (seen.size >= 25) { console.log('  … truncated'); break; }
  }
}
console.log(`TOTAL suspicious: ${total} (triage each; see header comment)`);
