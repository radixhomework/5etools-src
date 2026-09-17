#!/usr/bin/env node
// Audit entity-tag identifiers in a translated file against its English
// original (positional zip: structures must be identical) and against the
// current entity pool. Reports FR tags whose identifier changed from the EN
// original AND does not resolve in the pool — i.e. dead links introduced by
// translation or repointing.
// Usage:
//   node audit-tags.cjs <frFile.json> <enOriginal.json> [--pool <data/bestiary>] [--items <data/items.json>]
'use strict';
const fs = require('fs');

const argv = process.argv.slice(2);
const frPath = argv[0];
const enPath = argv[1];
const poolIdx = argv.indexOf('--pool');
const itemsIdx = argv.indexOf('--items');
const poolDir = poolIdx !== -1 ? argv[poolIdx + 1] : 'data/bestiary';
const itemsPath = itemsIdx !== -1 ? argv[itemsIdx + 1] : null;

// pool: lowercase identifier -> true, built from ALL entity data dirs
const pool = new Set();
const addNames = (j, keys) => { for (const k of keys) for (const arr of (j[k] || [])) if (arr && arr.name) pool.add(arr.name.toLowerCase()); };
for (const f of fs.readdirSync(poolDir).filter(x => x.startsWith('bestiary-') && !x.startsWith('fluff'))) {
  try { addNames(JSON.parse(fs.readFileSync(`${poolDir}/${f}`, 'utf8')), ['monster']); } catch (e) { /* skip */ }
}
const addFile = (p, keys) => { try { addNames(JSON.parse(fs.readFileSync(p, 'utf8')), keys); } catch (e) { /* skip */ } };
for (const f of fs.readdirSync('data/spells').filter(x => x.startsWith('spells-'))) addFile(`data/spells/${f}`, ['spell']);
addFile('data/items.json', ['item', 'itemGroup']);
addFile('data/items-base.json', ['baseitem']);
addFile('data/conditionsdiseases.json', ['condition', 'disease']);
addFile('data/backgrounds.json', ['background']);
addFile('data/feats.json', ['feat']);
addFile('data/races.json', ['race', 'subrace']);
addFile('data/actions.json', ['action']);
addFile('data/objects.json', ['object']);
addFile('data/vehicles.json', ['vehicle']);
addFile('data/decks.json', ['deck']);
addFile('data/trapshazards.json', ['trap', 'hazard']);
addFile('data/cultsboons.json', ['cult', 'boon']);
try { (JSON.parse(fs.readFileSync('data/magicvariants.json', 'utf8')).magicvariant || []).forEach(v => { if (v.name) pool.add(v.name.toLowerCase()); }); } catch (e) { /* skip */ }
addFile('data/languages.json', ['language']);
for (const f of fs.readdirSync('data/class').filter(x => x.startsWith('class-'))) addFile(`data/class/${f}`, ['class', 'subclass']);

const TAG_RE = /\{@([a-z]+) ([^{}]*)\}/g;
const ENTITY = new Set(['creature', 'item', 'spell', 'condition', 'disease', 'action', 'feat', 'background', 'race', 'object', 'vehicle', 'trap', 'hazard', 'cult', 'boon']);

function strings(o, out) {
  if (typeof o === 'string') { out.push(o); return out; }
  if (Array.isArray(o)) { o.forEach(v => strings(v, out)); return out; }
  if (o && typeof o === 'object') { Object.values(o).forEach(v => strings(v, out)); return out; }
  return out;
}

const enStrs = strings(JSON.parse(fs.readFileSync(enPath, 'utf8')), []);
const frStrs = strings(JSON.parse(fs.readFileSync(frPath, 'utf8')), []);
if (enStrs.length !== frStrs.length) {
  console.error(`structure drift: EN ${enStrs.length} strings vs FR ${frStrs.length}`);
  process.exit(2);
}

let checked = 0, dead = 0;
for (let i = 0; i < enStrs.length; i++) {
  const enTags = [], frTags = [];
  let m;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(enStrs[i]))) if (ENTITY.has(m[1])) enTags.push(m);
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(frStrs[i]))) if (ENTITY.has(m[1])) frTags.push(m);
  const n = Math.min(enTags.length, frTags.length);
  for (let k = 0; k < n; k++) {
    const [, enTag, enPayload] = enTags[k];
    const [, frTag, frPayload] = frTags[k];
    if (enTag !== frTag) continue;
    checked++;
    const ident = frPayload.split('|')[0];
    const enIdent = enPayload.split('|')[0];
    if (ident === enIdent) continue;               // identifier unchanged
    if (pool.has(ident.toLowerCase())) continue;   // resolves in French pool
    dead++;
    console.log(`✗ ${frPath}\n  EN tag: {@${enTag} ${enPayload}}\n  FR tag: {@${frTag} ${frPayload}}  (identifier "${ident}" resolves nowhere)`);
  }
}
console.log(`${checked} zipped tags compared, ${dead} dead links`);
if (dead) process.exitCode = 1;
