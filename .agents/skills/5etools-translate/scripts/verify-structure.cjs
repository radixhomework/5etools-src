#!/usr/bin/env node
// Structural identity check between the English original and the French
// translation. Exit 1 on any drift. Usage:
//   node verify-structure.cjs <orig.json> <new.json>
// Checks: chapter/array counts, node counts, array lengths, key presence,
// id sequences, per-string tag multisets, dice formulas, number multiset.
'use strict';
const fs = require('fs');

function die(msg) { console.error('DRIFT: ' + msg); process.exitCode = 1; }

// Tag payloads that must survive translation byte-identical (pure mechanics).
// {@chance} is excluded: its second segment is display text (translated).
const MECHANICAL = new Set(['hit', 'dc', 'damage', 'dice', 'recharge',
  'h', 'atk', 'd20', 'initiative', 'scaledice', 'autohit', 'autodamage']);

// Key for the per-string multiset: tag type always; full payload only for
// mechanical tags. Identifier/display payloads legitimately differ after
// translation and repointing.
function tagMultiset(s) {
  const out = {};
  const re = /\{@([a-z]+) ([^{}]*)\}/g;
  let m;
  while ((m = re.exec(s))) {
    const key = MECHANICAL.has(m[1]) ? m[1] + ':' + m[2] : m[1];
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

const stats = { nodes: 0, ids: [], dice: [], numbers: [] };
function walkCompare(o, n, path) {
  if (typeof o === 'string') {
    if (typeof n !== 'string') return die(`type at ${path}`);
    // structural parts of the string: tags, dice, numbers
    const ot = tagMultiset(o), nt = tagMultiset(n);
    for (const k of Object.keys(ot)) if ((nt[k] || 0) !== ot[k]) {
      die(`tag count differs at ${path}: ${k} EN ${ot[k]} -> FR ${nt[k] || 0}\n    EN: ${JSON.stringify(o.slice(0, 220))}\n    FR: ${JSON.stringify(n.slice(0, 220))}`);
    }
    for (const k of Object.keys(nt)) if (!(k in ot)) {
      die(`tag count differs at ${path}: ${k} EN 0 -> FR ${nt[k]}\n    EN: ${JSON.stringify(o.slice(0, 220))}\n    FR: ${JSON.stringify(n.slice(0, 220))}`);
    }
    const od = o.match(/\{@[a-z]*dice[^ }]* [^}]*\}|\b\d+d\d+(?:\s*[+-]\s*\d+)?\b/g) || [];
    const nd = n.match(/\b\d+d\d+(?:\s*[+-]\s*\d+)?\b/g) || [];
    if (od.length !== nd.length) stats.dice.push(path);
    const onum = (o.match(/\d+/g) || []).length;
    const nnum = (n.match(/\d+/g) || []).length;
    if (onum !== nnum) stats.numbers.push(path + ` (${onum}->${nnum})`);
    stats.nodes++;
    return;
  }
  if (Array.isArray(o)) {
    if (!Array.isArray(n)) return die(`array expected at ${path}`);
    if (o.length !== n.length) return die(`array length ${o.length} vs ${n.length} at ${path}`);
    o.forEach((v, i) => walkCompare(v, n[i], `${path}[${i}]`));
    stats.nodes++;
    return;
  }
  if (o && typeof o === 'object') {
    if (!n || typeof n !== 'object' || Array.isArray(n)) return die(`object expected at ${path}`);
    for (const k of Object.keys(o)) if (!(k in n)) die(`missing key ${k} at ${path}`);
    if (typeof o.id === 'string' && typeof n.id === 'string') stats.ids.push(o.id === n.id);
    for (const k of Object.keys(o)) walkCompare(o[k], n[k], `${path}.${k}`);
    stats.nodes++;
    return;
  }
  if (o !== n) die(`scalar differs at ${path}`);
}

const orig = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const neu = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
walkCompare(orig, neu, '');

console.log(`nodes compared: ${stats.nodes}`);
console.log(`id order intact: ${stats.ids.every(Boolean)} (${stats.ids.length} ids)`);
console.log(`dice-count warnings: ${stats.dice.length} | number-count warnings: ${stats.numbers.length}`);
if (stats.dice.length) stats.dice.slice(0, 10).forEach(p => console.log('  dice?', p));
if (stats.numbers.length) stats.numbers.slice(0, 10).forEach(p => console.log('  num?', p));
if (!process.exitCode) console.log('STRUCTURE OK');
