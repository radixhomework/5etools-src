#!/usr/bin/env node
// Translation memory (TM) for the French campaign. A single SQLite db rebuilt
// deterministically from git history: for every data file that is French at
// HEAD, the latest ENGLISH blob in its history is located, and the two trees
// are walked in parallel — every JSON path holding an English-looking string
// on one side and a different string at HEAD yields a TM segment. Entity
// `name`/`alias` fields additionally yield name-map pairs (the committed,
// ground-truth replacement for agent sidecars). references/glossary.md tables
// are imported as-is.
//
// The db itself is NEVER committed (see _translation-work/tm.db); committed
// artifacts are the exported name maps (references/names/) which
// repoint-tags.cjs consumes via --maps.
//
// Usage:
//   node tm.cjs bootstrap                 rebuild tm.db from history + glossary
//   node tm.cjs stats                     db overview
//   node tm.cjs lookup "some English text"
//   node tm.cjs hints <chunk.json> [-o out.json]   TM suggestions for a chunk
//   node tm.cjs export --names [dir]      write <kind>-names.json maps
//   node tm.cjs check <orig.json> <new.json>       TM consistency report
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { DatabaseSync } = require('node:sqlite');

const SKILL_DIR = path.resolve(__dirname, '..');
const REPO = path.resolve(SKILL_DIR, '..', '..', '..');
const DB_FILE = process.env.TM_DB || path.join(REPO, '_translation-work', 'tm.db');
const NAMES_DIR = path.join(SKILL_DIR, 'references', 'names');

// ---------------------------------------------------------------- helpers

function git(args, opts = {}) {
  return execSync(`git ${args}`, { cwd: REPO, encoding: 'utf8', maxBuffer: 128 << 20, stdio: ['pipe', 'pipe', 'pipe'], ...opts });
}

const FR_CHARS = /[àâäçéèêëîïôöùûüœ«»]/gi;   // for .match() only
const FR_ANY = /[àâäçéèêëîïôöùûüœ«»]/i;       // stateless, for .test()
const frenchPerKb = (s) => (s.match(FR_CHARS) || []).length / Math.max(1, s.length) * 1000;
const isFrenchFile = (s) => frenchPerKb(s) > 1;

// Would this string have needed translating? Strip tags, then require letters
// and no French marks / function words. Numbers, dice, paths, ids -> false.
// Frenchness is tested on the STRIPPED text: mixed-history blobs hold English
// prose whose tag identifiers were already repointed to French
// ({@skill Perspicacité}); the prose is still a valid English source.
function looksEnglish(s) {
  const t = s.replace(/\{@[^}]*\}/g, ' ').replace(/\{[^}]*\}/g, ' ');
  if (!/[a-z]{2}/i.test(t)) return false;
  if (FR_ANY.test(t)) return false;
  if (/\b(des|du|les|une|est|avec|dans|pour|par|sur|son|sa|ses|aux|ée|és)\b/i.test(t)) return false;
  if (/^(https?:)?\/\/|[\w-]+\.(png|jpe?g|svg|gif|webp)$/i.test(s.trim())) return false;
  if (/^[\ds%+.,()×—–-]+$/i.test(s)) return false;
  return true;
}

// Mixed-history bases carry French tag identifiers inside English prose. TM
// source keys are canonicalized back to English tag identifiers with the
// reverse of the mined name pairs, so untranslated chunks (English tags) hit
// them exactly.
function buildReverseMap(pairs) {
  // pairs: iterable of [en, fr, ...extra]; optional numeric 3rd element = weight
  const byFr = new Map(); // fr.lower -> Map(en -> weight)
  for (const p of pairs) {
    const en = p[0], fr = p[1], w = typeof p[2] === 'number' ? p[2] : 1;
    const k = String(fr).toLowerCase();
    if (!byFr.has(k)) byFr.set(k, new Map());
    const m = byFr.get(k);
    m.set(en, (m.get(en) || 0) + w);
  }
  const rev = new Map();
  for (const [k, m] of byFr) {
    let best = null, bw = -1;
    for (const [en, w] of m) if (w > bw) { best = en; bw = w; }
    if (best !== null) rev.set(k, best);
  }
  return rev;
}

function canonTags(src, rev) {
  if (!rev || !/\{@/.test(src)) return src;
  return src.replace(/\{@([a-z]+) ([^{}]*)\}/g, (full, tag, payload) => {
    const parts = payload.split('|');
    const en = rev.get(parts[0].toLowerCase());
    if (!en) return full;
    parts[0] = en;
    return `{@${tag} ${parts.join('|')}}`;
  });
}

const revFromDb = (db) => buildReverseMap(db.prepare(`SELECT en, fr, COUNT(*) c FROM name_map GROUP BY en, fr`).all().map((r) => [r.en, r.fr, r.c]));

function entityKind(file) {
  const m = [
    [/fluff-bestiary|bestiary-/, 'creature'], [/^items|^magicvariants|fluff-items/, 'item'],
    [/^spells\//, 'spell'], [/^feats/, 'feat'], [/^backgrounds|fluff-backgrounds/, 'background'],
    [/^races|fluff-races/, 'race'], [/^objects|fluff-objects/, 'object'],
    [/^vehicles|fluff-vehicles/, 'vehicle'], [/^decks/, 'deck'], [/^tables/, 'table'],
    [/^actions|foundry-actions/, 'action'], [/^senses/, 'sense'], [/^skills/, 'skill'],
    [/^conditionsdiseases|fluff-conditionsdiseases/, 'condition'], [/^cultsboons/, 'cult'],
    [/^optionalfeatures|foundry-optionalfeatures/, 'variantrule'], [/^trapshazards/, 'trap'],
    [/^rewards/, 'boon'], [/^psionics/, 'psionic'], [/^class\//, 'class'],
    [/^adventures\.json/, 'adventure'], [/^books\.json/, 'book'],
  ].find(([re]) => re.test(file));
  return m ? m[1] : null;
}

const NAME_KEYS = new Set(['name', 'alias', 'shortName']);

// Parallel tree walk. cb(path, key, en, fr) for every string pair whose two
// sides are both strings. Structural drift between base and HEAD (entries
// added/removed upstream) silently skips the subtree.
function walkPairs(o, n, key, cb, p) {
  if (typeof o === 'string') {
    if (typeof n === 'string' && o !== n) cb(p, key, o, n);
    return;
  }
  if (Array.isArray(o)) {
    if (!Array.isArray(n) || o.length !== n.length) return;
    o.forEach((v, i) => walkPairs(v, n[i], key, cb, `${p}[${i}]`));
    return;
  }
  if (o && typeof o === 'object' && n && typeof n === 'object' && !Array.isArray(n)) {
    for (const k of Object.keys(o)) {
      if (!(k in n)) continue;
      walkPairs(o[k], n[k], NAME_KEYS.has(k) ? k : key, cb, `${p}.${k}`);
    }
  }
}

function collectSegments(enJson, frJson, file, kind, segs, names) {
  walkPairs(enJson, frJson, null, (p, key, en, fr) => {
    if (!looksEnglish(en)) return;
    segs.push([en, fr, kind || 'other', file, p.slice(0, 500)]);
    if (key && kind && NAME_KEYS.has(key) && looksEnglish(en) && !/\{@|\|/.test(en)) {
      names.push([en, fr, kind, file]);
    }
  }, '');
}

function parseGlossary(md) {
  const rows = [];
  let section = '';
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^#+\s+(.*)/);
    if (h) { section = h[1]; continue; }
    const m = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
    if (!m || /^[-: ]+$/.test(m[1])) continue;
    const clean = (x) => x.replace(/^`|`$/g, '').replace(/^«\s*|»$/g, '').trim();
    rows.push([clean(m[1]), clean(m[2]), section]);
  }
  return rows.filter(([en, fr]) => en && fr && en !== fr && !/^(EN|Settled)/i.test(en));
}

const openDb = () => new DatabaseSync(DB_FILE);
const ensureDb = () => {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  const db = openDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS segment(id INTEGER PRIMARY KEY, source TEXT NOT NULL, target TEXT NOT NULL,
      kind TEXT, file TEXT, path TEXT);
    CREATE INDEX IF NOT EXISTS seg_src ON segment(source);
    CREATE VIRTUAL TABLE IF NOT EXISTS segment_fts USING fts5(source, content='segment', content_rowid='id', tokenize='trigram');
    CREATE TABLE IF NOT EXISTS name_map(en TEXT NOT NULL, fr TEXT NOT NULL, kind TEXT NOT NULL, file TEXT,
      PRIMARY KEY(en, kind, fr)) WITHOUT ROWID;
    CREATE TABLE IF NOT EXISTS glossary(en TEXT PRIMARY KEY, fr TEXT NOT NULL, section TEXT);
    CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT);`);
  return db;
};

// ---------------------------------------------------------------- bootstrap

function cmdBootstrap() {
  const t0 = Date.now();
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  if (fs.existsSync(DB_FILE)) fs.rmSync(DB_FILE);
  const db = ensureDb();

  // Candidate files: everything under data/ except generated internals and
  // foundry packs. English-at-HEAD files skip themselves (no flip to find).
  const files = git('ls-tree -r --name-only HEAD data/').trim().split('\n')
    .filter((f) => f.endsWith('.json') && !/^(data\/generated\/(?!bookref)|data\/foundry-)/.test(f));

  // Per-file commit lists (newest -> oldest) from one log pass.
  const hist = new Map();
  for (const line of git('log --no-renames --name-only --format="C %H" -r -- data/').split('\n')) {
    if (line.startsWith('C ')) { var cur = line.slice(2); continue; }
    const f = line.trim();
    if (!f || !files.includes(f)) continue;
    if (!hist.has(f)) hist.set(f, []);
    hist.get(f).push(cur);
  }

  const insSeg = db.prepare('INSERT INTO segment(source, target, kind, file, path) VALUES(?,?,?,?,?)');
  const insName = db.prepare('INSERT OR IGNORE INTO name_map(en, fr, kind, file) VALUES(?,?,?,?)');
  let mined = 0, skipped = [];
  const allSegs = [], allNames = [];
  for (const f of files) {
    const head = (() => { try { return git(`show HEAD:${f}`); } catch { return null; } })();
    if (head === null || !isFrenchFile(head)) continue;
    // newest -> oldest, first English-ish blob is the closest EN base
    let base = null, baseC = null;
    for (const c of hist.get(f) || []) {
      let s; try { s = git(`show ${c}:${f}`); } catch { continue; }
      if (!isFrenchFile(s)) { base = s; baseC = c; break; }
    }
    if (base === null) { skipped.push(f); continue; }
    try {
      const nSeg = allSegs.length, nName = allNames.length;
      collectSegments(JSON.parse(base), JSON.parse(head), f.replace(/^data\//, ''), entityKind(f.replace(/^data\//, '')), allSegs, allNames);
      mined++;
      console.log(`  ${f}: ${allSegs.length - nSeg} segments (${baseC.slice(0, 8)} -> HEAD)`);
    } catch (e) {
      console.log(`  ${f}: SKIP (${e.message.split('\n')[0]})`);
      skipped.push(f);
    }
  }

  // Canonicalize TM source keys: mixed-history bases hold French tag
  // identifiers inside English prose — reverse-map them to English so
  // untranslated chunks (English tags) hit exactly.
  const rev = buildReverseMap(allNames);
  let canonCount = 0;
  for (const row of allSegs) {
    const c = canonTags(row[0], rev);
    if (c !== row[0]) { row[0] = c; canonCount++; }
  }

  db.exec('BEGIN');
  for (const r of allSegs) insSeg.run(...r);
  for (const r of allNames) insName.run(...r);
  db.exec('COMMIT');

  db.exec('BEGIN');
  const insGlo = db.prepare('INSERT OR REPLACE INTO glossary(en, fr, section) VALUES(?,?,?)');
  const glo = parseGlossary(fs.readFileSync(path.join(SKILL_DIR, 'references', 'glossary.md'), 'utf8'));
  glo.forEach((r) => insGlo.run(...r));
  db.exec('COMMIT');

  db.exec(`INSERT INTO segment_fts(segment_fts) VALUES('rebuild')`);
  const insMeta = db.prepare('INSERT OR REPLACE INTO meta(key, value) VALUES(?,?)');
  insMeta.run('bootstrap_at', new Date().toISOString());
  insMeta.run('git_head', git('rev-parse HEAD').trim());
  db.close();
  console.log(`\nbootstrapped ${DB_FILE}`);
  console.log(`files mined: ${mined} | segments: ${allSegs.length} (${canonCount} tag-canonicalized) | name pairs: ${allNames.length} | glossary: ${glo.length} | ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  if (skipped.length) {
    console.log(`no English base found (French since birth) or unparseable: ${skipped.length}`);
    skipped.forEach((f) => console.log('  ?', f));
  }
}

const STOP_WORDS = new Set(['that', 'this', 'with', 'from', 'they', 'them', 'have', 'been', 'were', 'will', 'your', 'which', 'their', 'there', 'where', 'when', 'what', 'whom', 'than', 'then', 'into', 'onto', 'over', 'under', 'about', 'after', 'before', 'while', 'during', 'these', 'those', 'some', 'more', 'most', 'other', 'such', 'only', 'also', 'each', 'make', 'makes', 'made', 'area', 'areas', 'attack', 'attacks', 'creature', 'creatures']);

// Similarity search over the trigram index. A full-sentence MATCH phrase is
// contiguous-substring only, so fuzzy matching OR-joins the query's
// distinctive words (bm25 ranks docs sharing more of them higher), then
// filters by word-overlap score in JS.
function fuzzySearch(db, q, limit = 5) {
  const words = q.replace(/\{@[^}]*\}/g, ' ').toLowerCase().match(/[a-zàâäçéèêëîïôöùûüœ]{4,}/g) || [];
  const uniq = [...new Set(words)].filter((w) => !STOP_WORDS.has(w)).sort((a, b) => b.length - a.length).slice(0, 10);
  if (!uniq.length) return [];
  const match = uniq.map((w) => `"${w}"`).join(' OR ');
  let rows;
  try { rows = db.prepare(`SELECT s.source, s.target FROM segment_fts f JOIN segment s ON s.id=f.rowid WHERE segment_fts MATCH ? ORDER BY rank LIMIT 200`).all(match); }
  catch { return []; }
  const qw = new Set(words);
  const scored = rows
    .map((r) => {
      const sw = new Set((r.source.toLowerCase().match(/[a-zàâäçéèêëîïôöùûüœ]{4,}/g) || []));
      let hit = 0; for (const w of qw) if (sw.has(w)) hit++;
      return { r, score: hit / qw.size, hit };
    })
    .filter((x) => x.score >= 0.5 && x.hit >= 2)
    .sort((a, b) => b.score - a.score);
  const seen = new Set(), out = [];
  for (const { r, score } of scored) {
    if (seen.has(r.source)) continue;
    seen.add(r.source);
    out.push({ source: r.source, target: r.target, score });
    if (out.length >= limit) break;
  }
  return out;
}

// ---------------------------------------------------------------- lookup

function cmdLookup(q) {
  const db = openDb();
  q = canonTags(q, revFromDb(db));
  console.log(`glossary:`);
  const esc = q.replace(/[\\%_]/g, (c) => '\\' + c);
  db.prepare(`SELECT en, fr FROM glossary WHERE ? LIKE '%' || en || '%' ESCAPE '\\' LIMIT 8`).all(q)
    .forEach((r) => console.log(`  ${r.en}  =>  ${r.fr}`));
  console.log(`exact:`);
  const ex = db.prepare(`SELECT target, COUNT(*) c, COUNT(DISTINCT file) f FROM segment WHERE source=? GROUP BY target ORDER BY c DESC LIMIT 5`).all(q);
  if (!ex.length) console.log('  (none)');
  ex.forEach((r) => console.log(`  [${r.c}x in ${r.f} files]  ${r.target}`));
  if (q.length >= 12) {
    console.log(`fuzzy:`);
    const rows = fuzzySearch(db, q).filter((r) => r.source !== q);
    if (!rows.length) console.log('  (none)');
    rows.forEach((r) => console.log(`  ~ ${Math.round(r.score * 100)}%  ${JSON.stringify(r.source.slice(0, 140))}\n    ${JSON.stringify(r.target.slice(0, 140))}`));
  }
  db.close();
}

// ---------------------------------------------------------------- hints

function cmdHints(chunkFile, out) {
  const j = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
  const strings = [];
  (function walk(o) {
    if (typeof o === 'string') strings.push(o);
    else if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === 'object') Object.values(o).forEach(walk);
  })(j);
  const db = openDb();
  const rev = revFromDb(db);
  const exact = db.prepare(`SELECT target, COUNT(*) c FROM segment WHERE source=? GROUP BY target ORDER BY c DESC LIMIT 1`);
  const hints = {};
  let nExact = 0, nFuzzy = 0;
  for (const s of new Set(strings)) {
    if (!looksEnglish(s) || s.length < 12) continue;
    const key = canonTags(s, rev);
    const e = exact.get(key);
    if (e) { hints[s] = { exact: e.target }; nExact++; continue; }
    // fuzzy only for strings with enough content words to be signal, not noise
    const contentWords = (s.replace(/\{@[^}]*\}/g, ' ').toLowerCase().match(/[a-zàâäçéèêëîïôöùûüœ]{4,}/g) || [])
      .filter((w) => !STOP_WORDS.has(w));
    if (new Set(contentWords).size >= 4) {
      const rows = fuzzySearch(db, s, 3).filter((r) => r.source !== s);
      if (rows.length) { hints[s] = { fuzzy: rows.map((r) => ({ src: r.source, tgt: r.target })) }; nFuzzy++; }
    }
  }
  db.close();
  const dest = out || chunkFile.replace(/\.json$/, '-tm.json');
  fs.writeFileSync(dest, JSON.stringify(hints, null, '\t') + '\n');
  const total = strings.filter((s) => looksEnglish(s) && s.length >= 12).length;
  console.log(`${dest}: ${Object.keys(hints).length}/${total} strings covered (exact: ${nExact}, fuzzy: ${nFuzzy})`);
}

// ---------------------------------------------------------------- export

function cmdExportNames(dir) {
  const db = openDb();
  const rows = db.prepare(`SELECT en, fr, kind, COUNT(*) c FROM name_map GROUP BY en, kind, fr`).all();
  fs.mkdirSync(dir, { recursive: true });
  const byKind = new Map();
  for (const r of rows) {
    if (!byKind.has(r.kind)) byKind.set(r.kind, new Map());
    const m = byKind.get(r.kind);
    if (!m.has(r.en) || m.get(r.en).c < r.c) m.set(r.en, r);
  }
  let conflicts = 0, total = 0;
  const dropped = [];
  for (const [kind, m] of byKind) {
    const flat = {};
    for (const [en, r] of m) {
      const rivals = rows.filter((x) => x.en === en && x.kind === kind && x.fr !== r.fr);
      if (rivals.length) { conflicts++; dropped.push(`${kind}: ${en} => ${r.fr} (also: ${rivals.map((x) => x.fr).join(' / ')})`); }
      if (r.fr !== en) { flat[en] = r.fr; total++; }
    }
    const f = path.join(dir, `${kind}-names.json`);
    fs.writeFileSync(f, JSON.stringify(flat, null, '\t') + '\n');
    console.log(`${f}: ${Object.keys(flat).length} pairs`);
  }
  db.close();
  if (conflicts) {
    console.log(`\nconflicting pairs resolved by frequency (${conflicts}) — review before trusting:`);
    dropped.slice(0, 20).forEach((d) => console.log('  !', d));
  }
  console.log(`total exported pairs: ${total}`);
}

// ---------------------------------------------------------------- check

function cmdCheck(origFile, newFile) {
  const en = JSON.parse(fs.readFileSync(origFile, 'utf8'));
  const fr = JSON.parse(fs.readFileSync(newFile, 'utf8'));
  const db = openDb();
  const rev = revFromDb(db);
  const exact = db.prepare(`SELECT target, COUNT(*) c FROM segment WHERE source=? GROUP BY target ORDER BY c DESC LIMIT 2`);
  const diffs = [];
  let nExact = 0, nFuzzy = 0;
  walkPairs(en, fr, null, (p, key, o, n) => {
    if (!looksEnglish(o)) return;
    const hits = exact.all(canonTags(o, rev));
    if (hits.length) {
      nExact++;
      if (!hits.some((h) => h.target === n)) diffs.push({ p, kind: 'exact', tm: hits[0].target, n });
      return;
    }
    // exact key may have drifted with an older EN base — near-identical fuzzy
    if (o.length >= 40) {
      const fz = fuzzySearch(db, o, 1)[0];
      if (fz && fz.score >= 0.8 && fz.target !== n) {
        nFuzzy++;
        diffs.push({ p, kind: `fuzzy ${Math.round(fz.score * 100)}%`, tm: `${fz.source}  =>  ${fz.target}`, n });
      }
    }
  }, '');
  db.close();
  console.log(`checked ${nExact} exact + ${nFuzzy} near-match segments; ${diffs.length} diverge from recorded translations (triage: intentional re-wording | regression)`);
  diffs.slice(0, 30).forEach((d) => console.log(`  [${d.kind}] ${d.p}\n    TM:   ${JSON.stringify(String(d.tm).slice(0, 160))}\n    new:  ${JSON.stringify(String(d.n).slice(0, 160))}`));
}

// ---------------------------------------------------------------- stats

function cmdStats() {
  const db = openDb();
  for (const t of ['segment', 'name_map', 'glossary']) console.log(`${t}: ${db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c}`);
  console.log(`\nname_map by kind:`);
  db.prepare(`SELECT kind, COUNT(*) c FROM name_map GROUP BY kind ORDER BY c DESC`).all().forEach((r) => console.log(`  ${r.kind}: ${r.c}`));
  db.prepare(`SELECT * FROM meta`).all().forEach((r) => console.log(`${r.key}: ${r.value}`));
  db.close();
}

// ---------------------------------------------------------------- main

const [cmd, ...rest] = process.argv.slice(2);
try {
  if (cmd === 'bootstrap') cmdBootstrap();
  else if (cmd === 'stats') cmdStats();
  else if (cmd === 'lookup') { if (rest.length) cmdLookup(rest.join(' ')); else { console.error('usage: node tm.cjs lookup "text"'); process.exit(2); } }
  else if (cmd === 'hints') {
    let file = null, out;
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === '-o') out = rest[++i];
      else if (file === null) file = rest[i];
    }
    if (!file) { console.error('usage: node tm.cjs hints <chunk.json> [-o out.json]'); process.exit(2); }
    cmdHints(file, out);
  } else if (cmd === 'export') {
    if (rest[0] !== '--names') { console.error('usage: node tm.cjs export --names [dir]'); process.exit(2); }
    cmdExportNames(rest[1] || NAMES_DIR);
  } else if (cmd === 'check') { if (rest.length < 2) { console.error('usage: node tm.cjs check <orig.json> <new.json>'); process.exit(2); } cmdCheck(rest[0], rest[1]); }
  else { console.error('usage: node tm.cjs bootstrap|stats|lookup|hints|export|check  (see header comment)'); process.exit(2); }
} catch (e) {
  console.error(`tm: ${e.message}`);
  process.exit(1);
}
