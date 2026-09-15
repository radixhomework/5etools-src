# Guide: translating 5etools content to French

This document describes the method used to translate **Baldur's Gate: Descent into Avernus (BGDIA)** — adventure, bestiary, items, etc. — so the process can be reproduced for any other source. It also covers the traps we hit (links, `_copy`, fluff, sidebar index).

---

## 1. Inventorying a source's content

First, list everything belonging to the source (here `BGDIA`) under `data/`:

```js
// Lists all data files containing entries of the source
const fs = require("fs");
for (const f of fs.readdirSync("data").filter(f => f.endsWith(".json"))) {
  const s = fs.readFileSync("data/" + f, "utf8");
  if (s.includes('"source": "BGDIA"')) console.log(f);
}
```

A source typically touches: `adventure/adventure-*.json`, `bestiary/bestiary-*.json`,
`bestiary/fluff-bestiary-*.json`, `items.json`, `magicvariants.json`, `rewards.json`,
`vehicles.json`, `trapshazards.json`, `backgrounds.json`, `fluff-items.json`,
`fluff-vehicles.json`, `fluff-backgrounds.json`, `adventures.json` (sidebar),
sometimes `spells/`, `tables.json`, `objects.json`, `deities.json`,
`bestiary/legendarygroups.json`.

---

## 2. Translation rules (strict)

The 5etools renderer **parses** the JSON files. Only translate **display strings**.

### Translate
- `name` of entries (monsters, items, chapters, sections…)
- `entries` (prose), read-aloud text, table captions and cells
- Statblock trait/action/reaction/legendary names
- `_mod` replacement text (`replaceTxt`, `replaceArr`, `appendArr`)
- `reqAttune` when it is a sentence, free-form `note`/`header` fields
- Units in prose: `feet` → `pieds`/`mètres`, `miles` → `kilomètres` (numbers kept, or converted consistently)

### NEVER touch
- JSON **keys** and structure (identical array lengths)
- **Dice formulas**, numbers, `ac`, `hp`, `cr`, `page`, `source`
- Parsed strings: `speed` (`"fly 40 ft."`), `senses` (`"darkvision 60 ft."`),
  `save`/`skill` keys (`"DEX"`), `type`, `size`, `alignment`, `rarity`,
  `skillProficiencies` (`"arcana"`), language identifiers
- `_copy.name`/`_copy.source` (references to the English base creature)
- `mapRegions` arrays, image paths, `token`, metadata

### Inline tags `{@tag identifier|source|display text}`
- The **first segment** after the tag name is a **machine identifier**: it stays in ENGLISH
- Only the **display text** (last segment after `|`) may be translated
  - ✅ `{@item sword of zariel|BGDIA|épée de Zariel}`
  - ❌ `{@item épée de Zariel|BGDIA|épée de Zariel}` (broken link)
- Never alter the inside of `{@dice}`, `{@hit}`, `{@dc}`, `{@atk}`, `{@h}`, `{@recharge}`
- `{@book Text|SOURCE|chapter|page}`: the first segment IS the display text (translatable)

> ⚠️ Exception: if the **target entity itself** was renamed to French, the identifier
> MUST point to the new French name (see §4).

---

## 3. The `_copy` trap: copied monsters stay English

Many monsters are `_copy` references to a creature from another book (MM, MTF…).
Even when translated (name + `_mod`), their body renders in English because it comes
from the base creature.

**Solution**: resolve and expand each copy into a full inline statblock:

1. Load the base creature from `data/bestiary/bestiary-*.json`
2. Apply the `_mod` operations: `replaceTxt` (case-insensitive global text replace),
   `replaceArr`/`appendArr` (replace/append a trait or action matched by `name`),
   `addSkills` (merge into `skill`), `replaceSpells` (replace `{@spell ...}`)
3. Merge the copy's own fields (`name`, `size`, `languages`…) on top
4. Remove `_copy`, translate the result, re-insert

This is what was done for BGDIA's 22 `_copy` monsters (Traxigor ← MM Archmage,
Zariel ← MTF Zariel, Lulu ← Hollyphant, Raggadragga ← Wereboar…).

Same problem for backgrounds copied from the PHB and for item variants
(`magicvariants.json`: translate only `inherits.entries`, **not** `namePrefix`,
which is concatenated onto English base-weapon names).

---

## 4. Renaming = repoint every reference

When an entity is renamed (e.g. `Abyssal Chicken` → `Poulet des Abysses`), **all**
links targeting it by name break, because the renderer resolves tags by looking up
the `name` field.

After translating, repoint tags across **all** of `data/`:

```js
// {@creature/item/reward/vehicle/hazard/background <EnglishName>|BGDIA → French name
const re = new RegExp(`\\{@creature ${englishName}\\|BGDIA`, "gi");
s = s.replace(re, `{@creature ${frenchName}|BGDIA`);
```

Watch out for:
- Tag identifiers are often **lowercase** → match case-insensitively
- **Other books** reference the source (e.g. `book-hf.json` → `{@creature abyssal chicken|BGDIA}`,
  `adventure-coa.json` → soul coins): scan all of `data/`, not just the translated files
- Align names across parallel files: `fluff-bestiary` ↔ `bestiary`,
  `fluff-items` ↔ `items`, `fluff-vehicles` ↔ `vehicles`, `fluff-backgrounds` ↔ `backgrounds`
  (fluff is resolved **by name**: a case mismatch breaks the link)

Final check — no tag may point to a non-existent name:

```js
const names = new Set(bestiary.monster.map(m => m.name.toLowerCase()));
// for every {@creature X|BGDIA encountered: names.has(X.toLowerCase()) must be true
```

---

## 5. The sidebar (table of contents)

An adventure's left menu comes from the `contents` field in **`data/adventures.json`**
— not from the adventure file. It must be updated separately:

- `contents[i].name`: chapter name **without** the prefix ("Chapitre 4 :" is rendered
  separately from `ordinal`)
- `contents[i].headers`: section titles, including
  `{"depth":1,"header":"E1. Taproom"}` objects

**Navigation uses text matching** (`bookutils.js`, `_scrollClick`): every
`header` must match the translated `name` of the corresponding entry in the chapter
EXACTLY. The reliable method: structurally align the English original and the
translation (same keys/ids in the same order) and generate `contents` from the
actually-translated names.

---

## 6. Recommended workflow (BGDIA retrospective)

1. Extract the content to translate (adventure chapters into separate files,
   source entries out of shared files) so work can be parallelized
2. Translate using the §2 protocol; official French names when they exist,
   otherwise keep the English name (proper nouns: Lulu, Bel, Traxigor…)
3. Expand `_copy` entries (§3) before translating
4. Re-insert, then repoint every reference (§4)
5. Regenerate `contents` in `adventures.json` (§5)
6. Verify: `JSON.parse` on every file, structure identical to the original
   (ordered `id` lists), zero translated tag identifiers, zero dead references,
   fluff names aligned
7. `docker compose up -d --build` to see the result (the image copies files at
   build time) + hard-refresh (the service worker caches aggressively)

## 7. Known limitations

- The **UI** (labels like "Armor Class", "Saving Throws", filters, menus) is
  hard-coded English in `js/render.js`: translating it is a separate i18n project
- Content copied from untranslated books (PHB, MM) renders in English until those
  books are translated (e.g. ideals/bonds/flaws tables of PHB backgrounds)
- `spellcheck` and some `npm test` suites expect English

---

## 8. Error Prevention Checklist

Run through this checklist **after every translation campaign** before committing.
Each item corresponds to a real error encountered during the IDRotF, TCE/XGE and
VGM/MTF campaigns.

### 8.1 — `_copy._mod` match keys vs renamed base entities

When a base entity (monster, race, item…) is renamed to French, any dependent
entity that copies it and has a `_mod` with `replaceArr`/`removeArr`/`renameArr`
must have its match keys updated to the **French** names.

**Detection**: for each entity with `_copy._mod`, resolve the base, collect its
current entry names (headers, traits, actions…), and flag any `replaceArr.replace`,
`removeArr.names` or `renameArr.rename` that doesn't match.

**Prevention**: after renaming base entities, scan all files that `_copy` from
them and translate the match keys via a positional EN→FR name map built from
upstream vs the translated file.

```
# Pseudo-code: detect stale match keys
for each entity with _copy._mod:
    base = resolve(_copy.name, _copy.source)
    for each op in _mod.*:
        if op.replace/names not in base's current (French) names:
            FLAG: stale match key
```

### 8.2 — Fluff file names vs bestiary names

Monster fluff entries resolve by name against their bestiary. If bestiary
monster names are renamed, the fluff file names must be renamed identically.

**Detection**: build a set of bestiary names, then check every fluff entry name
against it. Flag mismatches and orphans.

```
bestiary_names = set of all monster.name (lowercased)
for each fluff entry:
    if fluff.name not in bestiary_names: FLAG
```

Also check the reverse: monsters with `hasFluff: true` must have a matching
fluff entry. Group lore pages (e.g. "Hags", "Mind Flayers") are legitimate
orphans — they're linked from book chapters, not from individual monsters.

### 8.3 — Statblock embeds in books

Books and adventures embed statblocks via
`{"type": "statblock", "tag": "creature|item|race|spell|...", "name": "...", "source": "..."}`.
These resolve by name against the data pools at render time.

**Detection**: walk the JSON tree, collect every `type === "statblock"` node,
and check that `name + "|" + source` exists in the corresponding data pool.

**Key trap**: the `tag` field may be **empty** (`""`) if a translation agent
strips it. Always verify it's set to the correct type (`creature`, `item`,
`race`…). Also check `_versions` and `_abstract` sub-objects for the same issue.

### 8.4 — `_versions` / `_abstract` match keys

Race subraces with `_versions` containing `_abstract: true` blocks use
`_mod.entries` with `replaceArr`/`removeArr` targeting the **parent race's**
entry names. These must be updated when the parent race headers are translated.

**Detection**: for each nameless subrace with `raceName`, collect the parent
race's entry names and flag any version `_mod` key that doesn't match.

```
for each nameless subrace with _versions:
    parent_headers = collect entry names from parent race
    for each version._mod.entries op:
        if op.replace/names not in parent_headers: FLAG
```

### 8.5 — Inline `{@tag}` identifiers

All `{@creature}`, `{@item}`, `{@spell}`, `{@condition}`, `{@skill}`, `{@sense}`,
`{@feat}`, `{@background}`, `{@optfeature}`, `{@class}`, `{@subclass}`,
`{@table}`, `{@deity}`… tags resolve against the data pools. When the target
entity is renamed, **every** inline tag referencing it must be repointed.

**Detection**: extract all tags, build a resolution pool per tag type, and flag
any identifier that doesn't resolve.

**Key trap**: the 5etools renderer resolves tags **case-insensitively** but the
data files are case-sensitive. Always compare lowercased.

### 8.6 — `_copy.name` cross-file references

Entities can `_copy` from entities in **other files** (e.g. a bestiary monster
copying from MM). When the source entity is renamed, the `_copy.name` must be
repointed — even though the files are different.

**Detection**: collect all `_copy.name + '|' + _copy.source` pairs across all
files and check them against the combined entity pool.

### 8.7 — `replaceSpells` match keys

`_mod._.replaceSpells.spells[N]` blocks contain `replace` strings that must
match the **French** spell names in the base creature's spellcasting lists.

### 8.8 — Deities and shared files: avoid positional merge

When merging translated entries back into shared files (`deities.json`,
`items.json`, `races.json`…), **never** use positional zip without verifying
that the chunk and the data file have the **same count and same order**.
A count mismatch will silently insert nulls or misplace entries.

**Prevention**: always merge by (name + source) identity, never by array index.

### 8.9 — books.json TOC headers

The left sidebar navigation in books matches content **by text**. After
translating a book, regenerate the `contents` array in `books.json` from the
actually-translated chapter/section names. A mismatch means the sidebar links
won't navigate.

### 8.10 — items.json `itemGroup` entries

`itemGroup` entries (parent items grouping variants) are easy to miss because
they're in a separate top-level array. Remember to translate them alongside the
`item` entries.

### 8.11 — Character encoding: straight apostrophes

Always use `'` (U+0027) never `'` (U+2019) in JSON output. The 5etools renderer
handles both but the data files conventionally use straight apostrophes.

### 8.12 — Service worker cache

After every deploy, the browser may serve stale data from the workbox precache.
Hard-refresh (Ctrl+Shift+R) or unregister the service worker + clear Cache
Storage to see the new data.

---

## 9. Automated validation

The following checks should be run before committing:

```js
// 1. JSON.parse on every modified file
// 2. _copy/_mod resolution: every _copy.name+source resolves to an existing entity
// 3. _mod match keys: every replaceArr.replace and removeArr.names resolves
//    against the base entity's current (French) entry names
// 4. Inline tag resolution: every {@creature X|SRC} resolves against the
//    combined bestiary pool, every {@spell X|SRC} against the spells pool, etc.
// 5. Statblock embeds: every {type:"statblock"} has a non-empty tag and
//    resolves against the data pool
// 6. Fluff linkage: every monster with hasFluff has a fluff entry with the
//    same name+source, and vice versa
// 7. books.json contents: every header matches a translated entry name
// 8. No null entries in any data array
```

The browser console is the final arbiter: load every page of the translated
source and check for zero uncaught errors and zero "Failed to load" inline
messages.
