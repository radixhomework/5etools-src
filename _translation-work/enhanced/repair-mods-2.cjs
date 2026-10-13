// Repair no-op _mod replaceTxt find-strings across all bestiaries:
//  1. case-only failures -> add flags "i"
//  2. EN/base-name failures -> try French self-reference candidates built
//     from the base's French name (the mod's intent: replace the base's
//     self-reference with the copy's name), verified against the base text.
// Unresolvable mods are counted and left untouched.
'use strict';
const fs = require('fs');

const pool = new Map();
for (const f of fs.readdirSync('data/bestiary').filter(x => x.startsWith('bestiary-'))) {
  try { (JSON.parse(fs.readFileSync('data/bestiary/' + f, 'utf8')).monster || []).forEach(m => pool.set(m.name + '|' + m.source, m)); } catch (e) {}
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let fixedCase = 0, fixedName = 0, left = 0, checked = 0;
for (const f of fs.readdirSync('data/bestiary').filter(x => x.startsWith('bestiary-') && !x.startsWith('fluff'))) {
  if (f === 'bestiary-mm.json') continue; // agent-owned
  const path = 'data/bestiary/' + f;
  const j = JSON.parse(fs.readFileSync(path, 'utf8'));
  let dirty = false;
  (j.monster || []).forEach(mon => {
    const mod = mon._copy && mon._copy._mod;
    if (!mod) return;
    const base = pool.get(mon._copy.name + '|' + mon._copy.source);
    if (!base) return;
    const dump = JSON.stringify(base);
    checked++;
    const fix = (node) => {
      if (!node || node.mode !== 'replaceTxt' || typeof node.replace !== 'string') return false;
      const flags = String(node.flags || '');
      let re = null;
      try { re = new RegExp(node.replace, flags.includes('i') ? 'i' : ''); } catch (e) { return false; }
      if (re.test(dump)) return false; // works
      // 1. case-only failure
      if (!flags.includes('i') && new RegExp(node.replace, 'i').test(dump)) {
        node.flags = 'i';
        dirty = true; fixedCase++;
        return true;
      }
      // 2. French self-reference candidates from the base's French name
      const name = base.name;
      const cands = [
        '(?:le |la |l\u2019?|au |à la )' + esc(name),
        "(l|L)(?:e |a |')" + esc(name),
        esc(name),
      ];
      for (const c of cands) {
        let cre;
        try { cre = new RegExp(c, 'i'); } catch (e) { continue; }
        if (cre.test(dump)) {
          node.replace = c;
          if (!String(node.flags || '').includes('i')) node.flags = 'i';
          dirty = true; fixedName++;
          return true;
        }
      }
      return false;
    };
    const walk = (node) => {
      if (Array.isArray(node)) { let any = false; node.forEach(v => { if (fix(v)) any = true; walk(v); }); return any; }
      if (node && typeof node === 'object') {
        let any = false;
        if (fix(node)) any = true;
        for (const k of Object.keys(node)) if (walk(node[k])) any = true;
        return any;
      }
      return false;
    };
    if (walk(mod)) dirty = true;
  });
  if (dirty) fs.writeFileSync(path, JSON.stringify(j, null, '\t') + '\n');
}
console.log(`checked: ${checked} | fixed by flags-i: ${fixedCase} | fixed by FR self-ref candidates: ${fixedName} | left (dead/unresolvable): counted by check-mods rerun`);
