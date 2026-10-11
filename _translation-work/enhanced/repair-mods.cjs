// Repair _mod replaceTxt find-strings broken by the rename wave: if a failing
// find-string references an old renamed term and the mapped version matches the
// current base, rewrite it. Pre-existing failures (already broken at HEAD) are
// counted but left alone.
'use strict';
const fs = require('fs');
const { execSync } = require('child_process');

const pairs = JSON.parse(fs.readFileSync('_translation-work/enhanced/rename-pairs.json', 'utf8'));
// word-level map derived from the pairs (token swaps for partial find-strings)
const wordMap = [
  ['blindée', 'casquée'],
  ['féroce', 'sanguinaire'],
  ['displacée', 'éclipsante'],
  ['de mort', 'funeste'],
];
const mapFind = (s) => {
  let out = s;
  for (const [oldFr, newFr] of pairs) { out = out.split(oldFr).join(newFr); out = out.split(oldFr.toLowerCase()).join(newFr.toLowerCase()); }
  for (const [a, b] of wordMap) out = out.split(a).join(b);
  return out;
};

// current pool
const pool = new Map();
for (const f of fs.readdirSync('data/bestiary').filter(x => x.startsWith('bestiary-'))) {
  try { (JSON.parse(fs.readFileSync('data/bestiary/' + f, 'utf8')).monster || []).forEach(m => pool.set(m.name + '|' + m.source, m)); } catch (e) {}
}
// HEAD pool (pre-rename) — for the "worked at HEAD" test
const headPool = new Map();
for (const f of fs.readdirSync('_tmp/preRename/data/bestiary').filter(x => x.startsWith('bestiary-'))) {
  try { (JSON.parse(fs.readFileSync('_tmp/preRename/data/bestiary/' + f, 'utf8')).monster || []).forEach(m => headPool.set(m.name + '|' + m.source, m)); } catch (e) {}
}

let fixed = 0, preExisting = 0, checked = 0;
for (const f of fs.readdirSync('data/bestiary').filter(x => x.startsWith('bestiary-') && !x.startsWith('fluff'))) {
  const path = 'data/bestiary/' + f;
  const j = JSON.parse(fs.readFileSync(path, 'utf8'));
  let dirty = false;
  (j.monster || []).forEach(mon => {
    const mod = mon._copy && mon._copy._mod;
    if (!mod) return;
    const curBase = pool.get(mon._copy.name + '|' + mon._copy.source);
    if (!curBase) return;
    const headBase = headPool.get(mon._copy.name + '|' + mon._copy.source);
    const curDump = JSON.stringify(curBase);
    const headDump = headBase ? JSON.stringify(headBase) : null;
    checked++;
    const visit = (node) => {
      if (Array.isArray(node)) { node.forEach(visit); return; }
      if (node && typeof node === 'object') {
        if (node.mode === 'replaceTxt' && typeof node.replace === 'string') {
          const fl = String(node.flags || '').includes('i') ? 'i' : '';
          let re = null;
          try { re = new RegExp(node.replace, fl); } catch (e) { return; }
          if (re.test(curDump)) return; // still fine
          // broken: was it working at HEAD?
          const workedAtHead = headDump ? (() => { try { return new RegExp(node.replace, fl).test(headDump); } catch (e) { return false; } })() : false;
          const mapped = mapFind(node.replace);
          let mappedOk = false;
          try { mappedOk = mapped !== node.replace && new RegExp(mapped, fl).test(curDump); } catch (e) {}
          if (mappedOk) {
            node.replace = mapped;
            dirty = true; fixed++;
          } else if (!workedAtHead) {
            // broken before the renames too — pre-existing
            preExisting++;
          } else {
            // broke in the rename wave but auto-map failed — manual
            preExisting++;
            console.log(`MANUAL ${mon.name}: ${JSON.stringify(node.replace)} in base ${mon._copy.name}`);
          }
        }
        Object.values(node).forEach(visit);
      }
    };
    visit(mod);
  });
  if (dirty) fs.writeFileSync(path, JSON.stringify(j, null, '\t') + '\n');
}
console.log(`checked: ${checked} | find-strings repaired: ${fixed} | pre-existing/broken left: ${preExisting}`);
