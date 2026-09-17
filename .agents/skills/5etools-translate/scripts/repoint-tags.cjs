#!/usr/bin/env node
// Repoint {@entity Identifier|source|...} tags to translated entity names using
// EN->FR name sidecar maps. Rewrites ONLY the first payload segment of
// whitelisted entity tags; display segments and nav tags are untouched.
// Usage:
//   node repoint-tags.cjs <file.json> [more.json...] --maps <dir> [--maps <dir2> ...]
//                         [--pool <data/bestiary dir>]
// Maps: every *-names.json directly inside the given dirs (flat EN->FR objects;
// identity pairs skipped). Later dirs don't override earlier entries.
// --pool enables a fail-safe guard: if a map's FR target is the known French
// name of a DIFFERENT entity, the pair is suspect (positional-zip corruption)
// and the replacement is skipped with a warning.
'use strict';
const fs = require('fs');

const argv = process.argv.slice(2);
const mapDirs = [];
const files = [];
let poolDir = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--maps') { mapDirs.push(argv[++i]); continue; }
  if (argv[i] === '--pool') { poolDir = argv[++i]; continue; }
  files.push(argv[i]);
}
if (!files.length || !mapDirs.length) {
  console.error('usage: node repoint-tags.cjs <file.json> [...] --maps <dir> [...] [--pool <data/bestiary>]');
  process.exit(2);
}

const map = {};
const lowerMap = {};
let mapCount = 0;
for (const dir of mapDirs) {
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('-names.json'))) {
    const j = JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'));
    for (const [k, v] of Object.entries(j)) {
      if (k !== v && !map[k]) { map[k] = v; lowerMap[k.toLowerCase()] = v; mapCount++; }
    }
  }
}
console.log(`loaded ${mapCount} mappings from ${mapDirs.join(', ')}`);

// Fail-safe: cross-validate map pairs against the entity pool.
//   R1: if the FR target is the French name of a DIFFERENT entity, the pair is
//       suspect (positional-zip corruption).
//   R2: if the pool contains an entity whose (current) name equals the EN key,
//       the map value must match it exactly — a disagreeing pair is stale or
//       sloppy (e.g. "Drow" -> "Drows" when the entity is named "Drow").
// Suspect pairs are skipped (fail-safe) and reported.
const frOwner = new Map();
const poolByEn = new Map();
if (poolDir) {
  for (const f of fs.readdirSync(poolDir).filter(x => x.startsWith('bestiary-') && !x.startsWith('fluff'))) {
    try {
      const j = JSON.parse(fs.readFileSync(`${poolDir}/${f}`, 'utf8'));
      (j.monster || []).forEach(m => {
        if (!frOwner.has(m.name.toLowerCase())) frOwner.set(m.name.toLowerCase(), m.name);
        if (!poolByEn.has(m.name.toLowerCase())) poolByEn.set(m.name.toLowerCase(), m.name);
      });
    } catch (e) { /* skip */ }
  }
}
const suspect = new Set();
function lookup(en) {
  const fr = map[en] || lowerMap[en.toLowerCase()];
  if (!fr || fr === en) return undefined;
  if (poolDir) {
    const owner = frOwner.get(fr.toLowerCase());
    if (owner !== undefined && owner.toLowerCase() !== en.toLowerCase()) {
      suspect.add(`"${en}" -> "${fr}" but "${fr}" is already the name of another entity`);
      return undefined;
    }
    const actual = poolByEn.get(en.toLowerCase());
    if (actual !== undefined && actual !== fr) {
      suspect.add(`"${en}" -> "${fr}" but the entity is actually named "${actual}"`);
      return undefined;
    }
  }
  return fr;
}

// Entity tags whose first segment is the entity name. Nav tags ({@book},
// {@adventure}, {@quickref}, {@area}, {@filter}) are handled by other gates.
const ENTITY_TAGS = new Set(['creature', 'item', 'spell', 'condition', 'disease',
  'action', 'feat', 'background', 'race', 'subrace', 'class', 'subclass',
  'object', 'vehicle', 'trap', 'hazard', 'cult', 'boon', 'table', 'deck',
  'charoption', 'psionic', 'sense', 'skill', 'status', 'variantrule']);

const TAG_RE = /\{@([a-z]+) ([^{}]*)\}/g;

const isFrenchy = (s) => /[àâäéèêëîïôöùûüçÀÉÈÊ]/.test(s) ||
  /\b(du|de la|des|le|la|les|d'|l'|éveillé|mineur|supérieur|gardien|lame|bâton|arme|armure|potion|anneau|baguette|sceptre|pierre|cercle|guerrier|mage|prêtre|voleur|nuée|sergent)\b/i.test(s);

let totRepointed = 0;
const flagged = new Set();

for (const file of files) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  const stats = { _samples: 0 };
  (function walk(o) {
    if (typeof o === 'string') {
      return o.replace(TAG_RE, (full, tag, payload) => {
        if (!ENTITY_TAGS.has(tag)) return full;
        const parts = payload.split('|');
        const ident = parts[0];
        if (!ident) return full;
        const fr = lookup(ident);
        if (!fr) {
          // flag unresolved English-looking identifiers for review
          if (/\b(the|of|and|with|greater|lesser|giant|young|adult|ancient|devourer|lord|master|priest|warrior|knight|guard|captain|berserker|shadow|bone|blood|ice|fire|storm|stone|iron|gold|silver|deep|wild|hunt|hound|spawn|swarm|horde|claw|fang|wing|scale)\b/i.test(ident) && !isFrenchy(ident)) {
            flagged.add(`${tag}: ${ident}`);
          }
          return full;
        }
        parts[0] = fr;
        stats[tag] = (stats[tag] || 0) + 1;
        totRepointed++;
        return `{@${tag} ${parts.join('|')}}`;
      });
    }
    if (Array.isArray(o)) { for (let i = 0; i < o.length; i++) o[i] = walk(o[i]); return o; }
    if (o && typeof o === 'object') { for (const k of Object.keys(o)) o[k] = walk(o[k]); return o; }
    return o;
  })(j);
  fs.writeFileSync(file, JSON.stringify(j, null, '\t') + '\n');
  const parts = Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join(', ');
  console.log(`${file}: ${parts || '0 repointed'}`);
}

console.log(`TOTAL repointed: ${totRepointed}`);
console.log(`flagged English identifiers still present: ${flagged.size} (triage: proper noun | untranslated target | defect)`);
[...flagged].slice(0, 40).forEach(f => console.log('  ?', f));
if (suspect.size) {
  console.log(`SUSPECT map pairs skipped (${suspect.size}) — sidecar corruption; fix the sidecar before trusting these:`);
  [...suspect].slice(0, 30).forEach(s => console.log('  !', s));
  process.exitCode = 1;
}
