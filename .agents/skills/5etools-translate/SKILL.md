---
name: 5etools-translate
description: French translation campaign workflow for this 5etools repo (books, adventures, bestiaries, fluff, generated indexes). Use whenever the user asks to translate any 5etools content to French, mention "traduction", "campagne de traduction", translating a book/adventure/bestiary name (e.g. DMG, XGE, Gos, ToA, WDH), repointing tags, regenerating sidebars, or validating translated data files — even if they just say "continue the translation" or "check translation consistency".
---

# 5etools French Translation Campaign

This skill encodes the campaign workflow proven across BGDIA, ToA, IDRotF, TCE/XGE, VGM/MTF, XPHB, DMG, bookref, and WDH/WDMM. It tells you what to read, what to never touch, how to parallelize, and which gates to run before anything is committed.

## Phase 0 — Read the ground rules

Read `TRANSLATION_GUIDE.md` at the repo root. It is the authoritative ruleset (translate display strings only; never touch keys, structure, dice, ids, `source`/`page`). Then read `references/glossary.md` in this skill — it carries the settled translations between campaigns. Do not re-coin terms that are already settled there; do add newly coined terms to it at the end of a campaign.

## Phase 1 — Extract campaign chunks

Work in `_translation-work/<campaign>/` (untracked scratch, e.g. `_translation-work/gos/`).

1. Split the source file by chapter (adventures/books) or into ~300-500K entity slices (bestiaries, items). Write chunks as standalone arrays with a manifest of which source ranges they cover.
2. **Verify chunks do not overlap.** During WDMM, two chunks both held levels 1-3; the duplication was only caught at assembly. Assert range disjointness before dispatching.
3. Stage the pristine English originals: `git show HEAD:data/... > _tmp/<name>-orig.json` for later structural verification.
4. For files the campaign renames entities in (bestiaries, items), plan the sidecar name maps now: every translating agent writes `<chunk>-names.json` (flat EN→FR object).

## Phase 2 — Translate (parallel agents)

Dispatch general-purpose agents, one chunk each, with `run_in_background`. The prompt template lives in `references/prompts.md` — use it verbatim, filling in chapter names and campaign glossary. Rules that proved themselves:

- **Waves of 2-4 agents, not more.** This account throttles hard ([1302] rate limit); waves of 6-7 killed 8 agents in one session. When an agent dies mid-chunk, re-dispatch with the *completion* variant of the prompt ("some entries are already French — skip them quickly").
- Each agent must: translate ONE chapter at a time and save after each; never modify tag identifiers/sources; write the names sidecar; run its own verification check (JSON parse + array length).
- Agents write to the **chunk file**, never to `data/`.

While agents run, do main-thread work: translate small files yourself (fluff under ~100 strings is cheaper in-thread than an agent slot), prepare scripts, stage originals.

## Phase 3 — Assemble

1. Concatenate chunk arrays positionally and write to `data/` with the file's original indent (these files are tab-indented, JSON.stringify(x, null, '\t')).
2. Run `node <skill>/scripts/verify-structure.cjs <orig.json> <new.json>` — it checks node counts, array lengths, id order, per-string tag multisets, and dice/number preservation. **Zero drift is the bar**; do not proceed with drift.
3. Merge sidecars into the campaign's name-map set.

## Phase 4 — Repoint tags

Entity references inside prose (`{@creature X|src}`, `{@item X}`, `{@spell X}`) must point at the *actual* names in the (possibly renamed) target files. Run:

```
node <skill>/scripts/repoint-tags.cjs data/adventure/adventure-xxx.json --maps _translation-work/<campaign> --pool data/bestiary
```

The script merges every `*-names.json` under `--maps` (plus the shared `refs-*` maps if passed), rewrites only the first segment of whitelisted entity tags, falls back to case-insensitive matching, and reports unresolved English identifiers. **Always pass `--pool`**: it cross-validates every map pair against the actual entity names and fail-safe-skips corrupt pairs (agents' sidecars contain positional-zip errors — see `references/bugs-catalogue.md` §13). Investigate every reported identifier: it is either a kept proper noun, a pointer into an untranslated file (leave), or a defect (fix).

## Phase 5 — Regenerate sidebars

`data/adventures.json` / `data/books.json` `contents` blocks must text-match the translated entry names or sidebar navigation dies. Run:

```
node <skill>/scripts/gen-contents.cjs WDH data/adventure/adventure-wdh.json
node <skill>/scripts/check-headers.cjs WDH
```

Regenerate **after** all renames (a rename after regen stale-fies headers — this bit us twice: Jalester, Laeral). Every reported miss needs a verdict: same-in-French proper noun (fine) or stale (fix the header).

## Phase 6 — Validation gates (all must pass)

Run every gate; each corresponds to a real shipped bug:

1. `node <skill>/scripts/verify-structure.cjs <orig> <new>` — structural identity.
2. `node <skill>/scripts/scan-english.cjs <files...>` — English residue, tag-stripped. Triage every hit: phonetic guides, book titles, bibliography author names, and image paths are legitimate; anything else is a defect. (The detector includes "of" — an earlier detector without it missed four strings.)
3. `node <skill>/scripts/check-mods.cjs <bestiary files...> --bestiary data/bestiary` — validates `_mod.replaceTxt` find-strings actually occur in the (French) base text and that `flags` are subsets of "i". A `flags: "gi"` crashes the whole bestiary page (`new RegExp(replace, 'g' + flags)` → "ggi" → SyntaxError); an English find-string silently no-ops. Both shipped before this gate existed.
4. Fluff↔entity name alignment: every fluff entry `name` must exist in the entity pool; every `_copy` must resolve against the global pool.
5. Typography: zero U+2019 apostrophes, « » with plain spaces, no NBSP, no double spaces. `grep -c $'\u2019' <file>` should print 0.
6. `git diff --stat` review: insertions ≈ deletions (structural parity smells wrong otherwise).

## Phase 7 — Deploy and sweep

`docker compose up -d --build`, then a browser sweep of every translated page (adventures: one hash per chapter; check the chapter heading renders and the page has no "Loading failed—could not find" text). **After any data change and rebuild, clear the service worker** (unregister registrations + `caches.delete`) — the stale precache serves old data and will make you debug ghosts. If the list/section you expect is missing, first suspect the SW cache, then the source filter, then the data.

## Phase 8 — Commit

Commit on a feature branch (`feat/translate-<campaign>`) and push. The user reviews before merge to main. Commit message: what was translated, what was validated, notable fixes.

## Known pre-existing splits (do not "fix" silently)

- `races.json` uses « Drakéide » for dragonborn; the WDH campaign prose uses « dragonné ». Both are loaded; unify only on explicit instruction.
- ToA/BGDIA creature tags use a `Name|lowercase-display` two-segment form that renders as text but never links. Cosmetic; out of scope unless asked.
- UI chrome (Armor Class, filters…) is hard-coded English in `js/render.js` — a separate i18n project, never in campaign scope.

For the cross-campaign glossary see `references/glossary.md`; for the full bug catalogue with real examples see `references/bugs-catalogue.md`.
