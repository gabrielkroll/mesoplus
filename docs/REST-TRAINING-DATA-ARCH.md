# Rest vs Training — Data Architecture Discussion

> Captured from session 2026-04-30. Read before touching rest state, Sheets sync, or V3 data design.

---

## The core principle settled here

**`isRest` is a flag. It never owns or overwrites `activities`.**

A session record holds both independently:

```js
session: {
  date:       '2026-04-30',
  isRest:     true,           // ← flag only
  activities: [...sets],      // ← never touched by rest toggle
  sleep, energy, soreness, perf, notes, extra, ...
}
```

Switching rest on or off only changes `session.isRest`. Training data survives
in both directions — mark rest, switch back, every set is still there.

---

## Why this matters for the database

### V1 current state

| Store | What it knows |
|---|---|
| localStorage | `isRest` + `activities` — full picture |
| Sheets | Training rows OR a "Rest" row — never both |

`toRows(session)` decides what Sheets receives:
- If `activities` has sets with data → writes Gym/Custom rows, `isRest` is invisible to Sheets
- If no training data → writes one "Rest" row

**The upsert guarantee:** Apps Script always does delete-then-insert per date.
There is never duplication. One version per date in Sheets, always.

### The gap

When training data exists alongside `isRest: true`:
- localStorage: knows both
- Sheets: only sees training rows (rest flag is lost)

If localStorage is cleared and user re-imports from Sheets:
```js
const isRest = (first[3]||'')==='Rest' ? true : null;
// Gym rows → isRest=null → rest flag gone after import
```

The day appears as training again. No data loss, but rest state is not recoverable
from Sheets alone.

### A second gap: rest flag change doesn't trigger Sheets re-sync

`_applyRestFlag()` calls `persist()` but NOT `markDirty()`. The date stays in
`_synced`. So `autoSaveCurrentDay()` skips re-syncing when the rest flag changes.
Sheets is not updated when you mark rest on a day that was already synced as training.

---

## The right fix (targetted, not V3)

Two small changes close both gaps without waiting for full bidirectional sync:

### Fix 1 — `_applyRestFlag` should invalidate the sync cache

```js
function _applyRestFlag(value){
  ...
  _synced.delete(d);   // ← add this
  persist();
  renderSummary(); renderActionBar(); renderCards();
}
```

This ensures the next `autoSaveCurrentDay()` (on navigation, tab switch, or
page close) re-syncs with the updated rest flag.

### Fix 2 — `toRows` should carry `isRest` as a column on every row

Currently `isRest` only appears in Sheets as the row type "Rest" when there are
no training rows. Instead, add it as a dedicated column appended to every row:

```js
// Append to every row:
s.isRest === true ? '1' : ''
```

And on import, read it back:
```js
const isRest = row[22] === '1' ? true : null;   // column 23
```

This is backward-compatible — extra trailing columns don't break existing data.
After this fix, Sheets faithfully records both the training sets AND the rest
flag on the same date. Import restores both.

### AC for slice S-Rest-Data-2

| # | Criterion |
|---|---|
| 1 | `_applyRestFlag` deletes date from `_synced` so next auto-save re-syncs |
| 2 | `toRows` appends `isRest` as column 23 (`'1'` or `''`) on every row |
| 3 | `importFromSheets` reads column 23 to restore `isRest` on each session |
| 4 | Full resync (Profile → Sheets setup) sends `isRest` column for all sessions |
| 5 | A day with training + rest flag: after import, both are restored correctly |
| 6 | A pure rest day (no sets): still writes one "Rest" row with isRest='1' |

---

## What to defer to V3

V3 is full bidirectional sync — real accounts, multi-device, Sheets as primary
store. At that point:

- Sheets becomes source of truth, not localStorage
- `isRest` needs its own column (done by Fix 2 above — already there)
- The Apps Script upsert logic may need to merge records rather than replace
- Session schema versioning becomes important
- The "training + rest on same day" edge case needs a UX decision:
  is a day allowed to be both? (e.g. morning training + deliberate rest
  from additional sessions)

### The user control principle (confirmed)

Users can modify past days. A user who didn't open the app for several days
should be able to navigate back and mark each missed day as rest. This is
a valid and expected use case. The app should be a faithful record of reality,
including retroactive corrections.

---

## Usability heuristics applied (Nielsen)

| Heuristic | How it applies here |
|---|---|
| #3 User control and freedom | Toggle rest ↔ training is always reversible. Data is never destroyed. |
| #5 Error prevention | Confirmation gate when training sets exist before marking rest. |
| #9 Help users recover from errors | One tap to switch back — training data immediately visible. |

### Confirmation gate logic

```
"Rest instead" tapped:
  ├─ No training sets → apply immediately (no friction)
  └─ Training sets exist → show inline confirm row
       ├─ "Mark as rest" → _applyRestFlag(true), sets preserved
       └─ "Keep training" → dismiss, no change
```

Confirmation is inline in the TRAINING section header — no modal, no sheet.
Context stays visible while deciding.

---

## Implementation history

| Commit | What shipped |
|---|---|
| `e003b75` | S-Rest-Data-1: non-destructive rest toggle, confirmation gate, correct persistence. `_applyRestFlag()` as single source of truth. Past-day rest marking. |
| `89c1344` | S-Rest-Data-2: `_synced` invalidation in `_applyRestFlag` + isRest as column 23 in `toRows` (non-BJJ rows) + `importFromSheets` reads col 22 to restore flag. BJJ+rest edge case (col 22 conflict) documented as V3 work. |
