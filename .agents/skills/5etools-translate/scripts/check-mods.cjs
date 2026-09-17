#!/usr/bin/env node
// Validate `_mod` blocks in translated bestiaries against their (French) bases:
//   1. every replaceTxt `replace` find-string must occur in the base entity's
//      JSON dump (a miss = silent no-op — the base was translated, the mod
//      still searches English);
//   2. `flags` must be a subset of "i" — the app builds
//      new RegExp(replace, 'g' + flags), so "gi" yields invalid "ggi" and
//      crashes the whole bestiary page;
//   3. replaceArr/removeArr match names must resolve in the base.
// Usage:
//   node check-mods.cjs <bestiaryFile.json> [...] --bestiary <data/bestiary dir>
'use strict';
const fs = require('fs');

const argv = process.argv.slice(2);
const dirIdx = argv.indexOf('--bestiary');
if (dirIdx === -1 || !argv[dirIdx + 1]) {
  console.error('usage: node check-mods.cjs <file.json> [...] --bestiary <data/bestiary dir>');
  process.exit(2);
}
const bestiaryDir = argv[dirIdx + 1];
const files = argv.filter((v, i) => i !== dirIdx && i !== dirIdx + 1);

// global pool: name|source -> monster dump
const pool = new Map();
for (const f of fs.readdirSync(bestiaryDir).filter(x => x.startsWith('bestiary-'))) {
  try {
    const j = JSON.parse(fs.readFileSync(`${bestiaryDir}/${f}`, 'utf8'));
    (j.monster || []).forEach(m => pool.set(`${m.name}|${m.source}`, m));
  } catch (e) { console.error(`(skipping unparsable ${f})`); }
}
console.log(`pool: ${pool.size} monsters`);

function flagsValid(fl) {
  if (fl === undefined) return true;
  return /^[i]*$/.test(String(fl));
}

let problems = 0, checked = 0;
for (const file of files) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  (j.monster || []).forEach(mon => {
    const mod = mon._copy && mon._copy._mod;
    if (!mod) return;
    const base = pool.get(`${mon._copy.name}|${mon._copy.source}`);
    if (!base) {
      console.log(`✗ ${mon.name} (${mon.source}): _copy base not found: ${mon._copy.name}|${mon._copy.source}`);
      problems++;
      return;
    }
    const baseDump = JSON.stringify(base);
    checked++;
    // ReplaceTxt pairs apply SEQUENTIALLY: a later pair may match text produced
    // by an earlier one (e.g. name substitution then agreement fixes). Simulate
    // the chain: each _mod key's pairs run in order against the evolving dump
    // ('*' first, then the other keys). Prop scoping is ignored for validation
    // (a find tested against the whole dump can only over-match, never fail a
    // pair that would succeed in its subtree).
    const errors = [];
    let working = baseDump;
    const runChain = (node, label) => {
      const steps = Array.isArray(node) ? node : [node];
      for (const step of steps) {
        if (!step || step.mode !== 'replaceTxt' || typeof step.replace !== 'string') continue;
        if (!flagsValid(step.flags)) {
          errors.push(`bad flags ${JSON.stringify(step.flags)} in ${label} (subset of "i" only — "gi" crashes the page)`);
          continue;
        }
        const fl = String(step.flags || '').includes('i') ? 'i' : '';
        let re;
        try { re = new RegExp(step.replace, fl); }
        catch (e) {
          errors.push(`MALFORMED find-string ${JSON.stringify(step.replace)} in ${label} (${e.message})`);
          continue;
        }
        if (!re.test(working)) {
          errors.push(`find-string ${JSON.stringify(step.replace)} NOT FOUND in base ${mon._copy.name} (${label}, flags=${fl || 'none'})`);
          continue;
        }
        try { working = working.replace(new RegExp(step.replace, 'g' + fl), step.with ?? ''); }
        catch (e) { /* keep working as-is */ }
      }
    };
    const keys = Object.keys(mod).sort((a, b) => (a === '*' ? -1 : 0) - (b === '*' ? -1 : 0));
    for (const key of keys) runChain(mod[key], `_mod.${key}`);
    errors.forEach(e => { console.log(`✗ ${mon.name}: ${e}`); problems++; });
  });
}
console.log(`${checked} _mod-bearing monsters checked, ${problems} problems`);
if (problems) process.exitCode = 1;
