---
name: prepare-translation
description: Rebuild the French translation memory (TM) from git history in this 5etools repo clone — required on a fresh clone or new machine before any translation campaign, and after every merge to main. Use when the user mentions preparing a translation environment, rebuilding the TM, "fresh clone", "new machine", or when 5etools-translate dispatch fails because _translation-work/tm.db is missing.
---

# Prepare the translation environment (rebuild the TM)

The translation memory is a SQLite db at `_translation-work/tm.db`. It is **never committed**: it is rebuilt deterministically from git history (every data file that is French at HEAD is paired with the latest English blob in its own history, per JSON path) plus `references/glossary.md`. Committed artifacts are the tm tool itself and the exported name maps — the db is an index over them.

## When to run this

- Fresh clone / new machine (the `5etools-translate` skill depends on the db).
- After every merge to main (folds the new campaign into the TM).
- Any time bootstrap feels stale: re-running is always safe — it rebuilds from scratch.

## Steps

1. **Preconditions**
   - Complete HEAD history: the English bases live in git history, so the clone must reach the repo root. Check `git rev-list --max-parents=0 HEAD | wc -l` is ≥ 1 (root `feat: initial commit`, 2024). Do NOT trust `git rev-parse --is-shallow-repository` — a `.git/shallow` graft from a partial *upstream* fetch makes it print `true` while HEAD's own history is complete; only a truncated origin history matters. If the root is unreachable: `git fetch origin --unshallow`.
   - Node ≥ 22 (uses the built-in `node:sqlite`): `node --version`.
2. **Rebuild**: `node .agents/skills/5etools-translate/scripts/tm.cjs bootstrap`
   - Takes ~1-4 min cold, under ~70s with warm git objects. Expected scale: ~170 files mined, ~156k segments, ~27k name pairs.
   - Files French since their first appearance in history are reported as skipped (e.g. `data/bestiary/fluff-bestiary-dc.json`) — expected, there is no English base for them in this repo.
   - The `ExperimentalWarning` from `node:sqlite` is noise; run with `--no-warnings` if it bothers you.
3. **Sanity-check** (two lookups that must return hits):
   - `node .agents/skills/5etools-translate/scripts/tm.cjs lookup "Waterdeep"` → glossary hit `Waterdeep => Eauprofonde`.
   - `node .agents/skills/5etools-translate/scripts/tm.cjs lookup "Multiattack. The ogre makes two attacks with its greatclub."` → fuzzy hits with « effectue deux attaques avec son grand gourdin ».
   - `node .agents/skills/5etools-translate/scripts/tm.cjs stats` → segment/name_map/glossary counts.
4. **Refresh name maps** only if references/names/ is missing or stale (e.g. after a merge that renamed entities): `node .agents/skills/5etools-translate/scripts/tm.cjs export --names` — writes `references/names/<kind>-names.json`; commit them if they changed.

## Failure modes

- `git show <commit>:<file>` failures during the walk are tolerated (blob skipped); a *file-level* skip with no English base is reported, not fatal.
- If bootstrap dies mid-run, the db is left partially built — just re-run; it starts by deleting the db.
- Do not point `TM_DB` elsewhere casually: the `5etools-translate` skill and its scripts expect the default path.
