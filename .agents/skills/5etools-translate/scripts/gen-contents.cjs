#!/usr/bin/env node
// Regenerate the `contents` blocks (sidebar navigation) of an adventure in
// data/adventures.json from the translated chapter data, by positional
// alignment against the committed English originals. Run AFTER all renames.
// Usage:
//   node gen-contents.cjs <ADVENTURE_ID> <data/adventure/adventure-xxx.json>
// Rules encoded here:
//   - contents[i].name: chapter name minus the "Chapitre N : " prefix, unless
//     the English contents kept the full title (titles that contain ": ").
//   - headers are mapped per-chapter first, then globally; misses are reported
//     (they are usually same-in-French proper nouns — verify each).
'use strict';
const fs = require('fs');
const { execSync } = require('child_process');

const adventureId = process.argv[2];
const dataPath = process.argv[3];
if (!adventureId || !dataPath) {
  console.error('usage: node gen-contents.cjs <ADVENTURE_ID> <data/adventure/adventure-xxx.json>');
  process.exit(2);
}

function stripChapterPrefix(n) {
  const i = n.indexOf(': ');
  return i === -1 ? n : n.slice(i + 2);
}

// Parallel walk of two structurally identical objects; collect EN->FR for every
// differing string `name`/`header`/`title` field.
function buildMaps(en, fr, map) {
  if (typeof en === 'string') return;
  if (Array.isArray(en)) {
    if (!Array.isArray(fr) || en.length !== fr.length) throw new Error(`structure drift at parent of ${JSON.stringify(en).slice(0, 60)}`);
    en.forEach((v, i) => buildMaps(v, fr[i], map));
    return;
  }
  if (en && typeof en === 'object') {
    for (const k of Object.keys(en)) {
      if ((k === 'name' || k === 'header' || k === 'title') && typeof en[k] === 'string' && typeof fr[k] === 'string' && en[k] !== fr[k]) {
        if (!map[en[k]]) map[en[k]] = fr[k];
      } else {
        buildMaps(en[k], fr[k], map);
      }
    }
  }
}

const tmp = `_tmp/${adventureId.toLowerCase()}-orig-head.json`;
fs.mkdirSync('_tmp', { recursive: true });
execSync(`git show HEAD:${dataPath} > ${tmp}`, { shell: 'bash' });
const enData = JSON.parse(fs.readFileSync(tmp, 'utf8')).data;
const frData = JSON.parse(fs.readFileSync(dataPath, 'utf8')).data;
if (enData.length !== frData.length) throw new Error(`chapter count drift: EN ${enData.length} vs FR ${frData.length}`);

const maps = enData.map((ch, i) => { const m = {}; buildMaps(ch, frData[i], m); return m; });
const globalMap = {};
maps.forEach(m => Object.assign(globalMap, m));

const advPath = 'data/adventures.json';
const advJson = JSON.parse(fs.readFileSync(advPath, 'utf8'));
const entry = advJson.adventure.find(a => a.id === adventureId);
if (!entry) throw new Error(`no adventure with id ${adventureId}`);
const enTmp = `_tmp/adventures-orig-head.json`;
execSync(`git show HEAD:data/adventures.json > ${enTmp}`, { shell: 'bash' });
const enAdv = JSON.parse(fs.readFileSync(enTmp, 'utf8')).adventure.find(a => a.id === adventureId);
if (enAdv.contents.length !== frData.length) throw new Error(`contents sections ${enAdv.contents.length} != chapters ${frData.length}`);

const misses = [];
entry.contents = enAdv.contents.map((sec, i) => {
  const chapterEn = enData[i].name;
  const chapterFr = frData[i].name;
  // if the English contents kept the full chapter name (e.g. a title that
  // itself contains ": "), keep the French full name as well
  const out = { ...sec, name: sec.name === chapterEn ? chapterFr : stripChapterPrefix(chapterFr) };
  if (sec.headers) {
    out.headers = sec.headers.map(h => {
      const isObj = typeof h === 'object';
      const en = isObj ? h.header : h;
      const fr = maps[i][en] || globalMap[en];
      if (fr === undefined) { misses.push(`sec ${i} (${enAdv.contents[i].name}): ${en}`); return h; }
      return isObj ? { ...h, header: fr } : fr;
    });
  }
  return out;
});

fs.writeFileSync(advPath, JSON.stringify(advJson, null, '\t') + '\n');
console.log(`${adventureId}: ${entry.contents.length} sections regenerated, ${misses.length} unmatched headers`);
misses.forEach(m => console.log('  MISS', m));
console.log('follow up with: node check-headers.cjs ' + adventureId);
