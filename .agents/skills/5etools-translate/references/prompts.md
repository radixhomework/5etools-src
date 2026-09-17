# Agent dispatch prompt templates

Proven across the WDH/WDMM campaign (30+ agent dispatches). Fill the placeholders; keep the section order — agents follow the critical-workflow line literally.

## Fresh chunk translation

```
You are translating D&D 5e adventure content to French for the 5etools app.
Working dir: D:\GitHub\radixhomework\5etools-src

TASK: Translate `<chunk path>` (chapters <EN chapter names>, ~<size>K) into
French. Write back to the SAME file.

CRITICAL WORKFLOW: translate ONE CHAPTER AT A TIME and SAVE after each. Work
in slices with intermediate saves.

Read `TRANSLATION_GUIDE.md` at the repo root first.

STRUCTURE RULES (strict):
- Only translate DISPLAY STRINGS. Never change JSON keys, structure, array
  lengths/order, numbers, dice, `id` fields, `source`/`page` values,
  `mapRegions`, image paths, `token`, `colStyles`.
- Chapter `name`s: <EN → « FR » per chapter>
- Entry `name`/`header` fields are display text — translate them; keep proper
  nouns (<list>).
- Read-aloud text, prose, table captions, `colLabels` and table cells:
  translate.

TAGS: `{@tag identifier|source|display}` — NEVER modify identifiers or sources
(renamed entities get a scripted repointing pass afterwards). `{@book Text|SRC|...}`
first segment IS display — translate. Leave `{@dice}`, `{@hit}`, `{@dc}`,
`{@atk}`, `{@h}`, `{@recharge}`, `{@damage 1d6}`, `{@filter ...}` internals
untouched. Damage-type words in prose are French.

GLOSSARY (consistent with already-translated chapters): <campaign terms from
references/glossary.md>

UNITS: feet→meters (comma decimal), gp→po. French typography: « », accents,
straight apostrophe (').

VERIFICATION (mandatory): `node -e "const j=require('<chunk path>');
console.log(j.length);"` — must print <N> and parse cleanly.

SIDECAR (mandatory): write `<chunk dir>/<chunk>-names.json` — flat object
English→French for named entries translated.

Report: chapters done, uncertain choices.
```

## Completion variant (agent died mid-chunk)

Replace TASK with: "The file … may have PARTIAL French content from previous
agents that died early (a few entry names may already be French). Translate
ALL remaining English content to French." Add: "Entries already in French:
skip quickly." Keep everything else identical — the structure rules are what
prevents partial agents from corrupting verified sections.

## Bestiary chunk variant

Additions that proved necessary:
- Names sidecar is the PRIMARY deliverable (it feeds repointing and fluff
  alignment).
- Fingerprint caution: do NOT reorder entries; assembly merges positionally.
- `_mod` blocks: `replaceTxt.replace` must match the FRENCH base text; `flags`
  must be `"i"` at most (never `"gi"` — the app prepends "g" and the page
  crashes).
- `{@creature ...}` self-references inside traits must use the entity's NEW
  French name.

## Books / generated indexes variant

For `data/generated/bookref-*.json`: the `reference` field holds a TOC whose
names and headers must match the translated content EXACTLY (text-matched
navigation). Translate `contents` blocks last, from the translated names —
never alongside.

## Sizing guidance

- ~250-400K chunk per agent; bigger chunks risk dying mid-flight with more
  lost work.
- Waves of 2-4 background agents. On [1302] rate-limit failure, wait for a
  running agent to finish, then re-dispatch with the completion variant.
- Under ~100 strings: translate in the main thread, skip the agent.
