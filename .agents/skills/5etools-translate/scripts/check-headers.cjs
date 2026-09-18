#!/usr/bin/env node
// Verify that every `contents` header in data/adventures.json text-matches an
// entry name in the corresponding chapter of the translated adventure data.
// Navigation uses text matching; a stale header is a dead sidebar link.
// Usage:
//   node check-headers.cjs <ADVENTURE_ID> [data/adventures.json]
'use strict';
const fs = require('fs');

const adventureId = process.argv[2];
const advPath = process.argv[3] || 'data/adventures.json';
if (!adventureId) { console.error('usage: node check-headers.cjs <ADVENTURE_ID> [data/adventures.json]'); process.exit(2); }

const advJson = JSON.parse(fs.readFileSync(advPath, 'utf8'));
const a = advJson.adventure.find(x => x.id === adventureId);
if (!a) { console.error(`no adventure ${adventureId}`); process.exit(2); }

const m = adventureId.toLowerCase().match(/^([a-z]+)/);
const dataPath = `data/adventure/adventure-${m[1]}.json`;
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8')).data;

let miss = 0, tot = 0;
a.contents.forEach((sec, ci) => {
  const ch = data[ci];
  if (!ch) { console.log(`${adventureId} sec ${ci} (${sec.name}): NO CHAPTER AT INDEX`); miss++; return; }
  const names = new Set();
  (function walk(o) {
    if (o && typeof o === 'object') {
      if (typeof o.name === 'string') names.add(o.name);
      Object.values(o).forEach(walk);
    }
  })(ch);
  (sec.headers || []).forEach(h => {
    const s = typeof h === 'object' ? h.header : h;
    tot++;
    if (!names.has(s)) { miss++; console.log(`${adventureId} sec ${ci} (${sec.name}) → stale header: ${JSON.stringify(s)}`); }
  });
});
console.log(`${adventureId}: ${tot} headers checked, ${miss} unmatched`);
if (miss) process.exitCode = 1;
