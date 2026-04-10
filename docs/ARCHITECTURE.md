# Meso+ — Technical Architecture

---

## Overview

Meso+ is a single HTML file (~1850 lines). Everything — HTML structure, CSS, and JavaScript — lives in `index.html`. No build step, no framework, no backend.

```
index.html
├── <head>          Font imports, QRCode.js CDN
├── <style>         All CSS (~375 lines)
├── <body>          All HTML markup
└── <script>        All JavaScript (~1100 lines)
```

---

## Global state

One object holds all runtime state:

```javascript
let S = {
  // Mesocycle config
  phases: [...],          // PHASES array with per-phase week counts
  phaseIdx: 0,            // currently selected phase
  mesoStart: '2026-01-06', // ISO date — Monday of week 1

  // Navigation
  selectedDate: '2026-04-02',  // which day is being viewed/edited
  viewWeekOffset: 0,           // weeks offset from current week

  // Current session (ephemeral — built from form on save)
  gymDay: 1,             // 1-4 (template A/B/C/D)
  dtype: 'Gym',          // 'Gym' | 'BJJ + Gym' | 'BJJ' | 'Rest' | ''
  sleep: '7.5h',
  energy: 'Good',
  soreness: 'Mild',
  perf: 'On track',
  supersets: [],          // current exercise data

  // History
  sessions: [],           // all saved sessions (from localStorage)

  // External services
  apiKey: '',            // Google Sheets API key
  sheetId: '',           // Google Sheet ID
  sheetTab: 'Workout_Log',
  claudeKey: '',         // Claude API key
  scriptUrl: ''          // Google Apps Script web app URL
}
```

**S is never persisted directly.** `persist()` serializes only `{phases, phaseIdx, mesoStart, sessions}` to `localStorage('mp7')`. API keys are in separate localStorage keys.

---

## localStorage keys

| Key | Contents |
|---|---|
| `mp7` | `{phases, phaseIdx, mesoStart, sessions}` — core data |
| `mp7_k` | Google Sheets API key |
| `mp7_s` | Google Sheet ID |
| `mp7_t` | Sheet tab name |
| `mp7_ck` | Claude API key |
| `mp7_su` | Apps Script URL |
| `mp7_pin` | Hashed password (djb2 hash + salt) |
| `mp7_name` | User's display name |
| `mp7_synced` | JSON array of synced dates |
| `mp7_used_tokens` | Array of used setup token hashes (prevents reuse) |

---

## Boot sequence

```
checkSetupToken()   → handles ?setup= URL param (device transfer)
initPin()           → shows password gate or setup screen
  └── submitPassword() → unlockApp() → init()

init()
  ├── load localStorage → restore S
  ├── fixGymDays()     → recalculate A/B/C/D ordering
  ├── buildChips()     → render all readiness chips
  ├── renderPhaseBar() → mesocycle plan bar
  ├── renderAdvBar()   → current phase info
  ├── renderWeekNav()  → week navigation + day pills
  └── loadSess() or loadTemplate()  → current day content
```

---

## Data flow

```
User types in form
  → markDirty()
      ├── buildCurrentSession() → saves to S.sessions
      ├── persist()             → writes to localStorage
      ├── setSave('Auto-saved') → updates save indicator
      └── setTimeout 10s → syncDayToSheets()
                              → appendRows(toRows(sess))
                              → Apps Script or Sheets API
```

**Auto-save fires on every input event.** Sync is debounced 10 seconds after last change.

**`completeDay()`** fires immediately on "Complete day" — saves + syncs without debounce.

---

## Session serialization

### `buildCurrentSession()` → session object
Reads all form fields and S state into a session object. Called before every save.

### `toRows(sess)` → array of arrays
Converts a session to Sheets rows. One row per exercise with data. If no exercises (BJJ-only, Rest), emits one summary row.

**Row width:** 22 columns for gym sessions, 31 columns for BJJ sessions (W–AE).

```javascript
// Standard columns (all sessions)
[date, week, phase, dtype, gymDay, superset, exercise, muscle,
 resistance, side, kg, reps, rir, sets, vol,
 sleep, energy, soreness, perf, flagged, extra, notes]

// BJJ columns (appended for BJJ/BJJ+Gym sessions)
[gc, desc, positions, partner, drilling, good, bad, subs, next]
```

### `sessionHasData(s)` → boolean
Returns true if the session has any meaningful data worth saving. Handles Rest, BJJ, BJJ+Gym, and gym-only sessions. Used to gate auto-sync.

---

## Google Sheets sync

### Write path (preferred): Apps Script
```javascript
fetch(S.scriptUrl, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ date, rows })
})
```
The Apps Script appends rows to the sheet, handling dynamic column widths. HTTP 200 does NOT guarantee success — always parse response body for `{ok, error}`.

### Write path (fallback): Sheets API
```javascript
fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${range}:append
  ?valueInputOption=USER_ENTERED&key=${apiKey}`, {
  method: 'POST',
  body: JSON.stringify({ values: rows })
})
```

### Read path: Sheets API (import only)
```javascript
fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Tab!A:AE?key=${apiKey}`)
```
Reads A:AE (31 columns), groups by date, reconstructs session objects. Skips dates that already exist locally.

---

## Progressive overload logic

Located in `computeSug()`. Runs after every relevant state change.

```
1. Get current phase RIR target (ph().rirNum)
2. Adjust for today's readiness (energy + soreness → mod ±1)
3. For each exercise:
   a. Find last session with same gymDay
   b. If last session had data:
      - If last RIR > phase target: increase load (weight or reps)
      - If last RIR < phase target: reduce reps (hold back)
      - If deload phase: 75% weight, 60% reps
   c. Store as ex.sugKg, ex.sugReps, ex.sugRIR
4. Update suggestion bar text
```

Suggestions are displayed as placeholders. User must explicitly adopt them (row button, "Adopt all", or exercise sheet).

---

## Navigation system

```javascript
nav('log' | 'progress' | 'analysis' | 'profile' | 'program' | 'setup')
```

- Shows/hides `v-{id}` divs
- Syncs top nav (`.nl`) and bottom nav (`.bnav-item`) active states
- Profile tab activates for 'profile', 'program', and 'setup'
- Calls `renderProgress()` when navigating to progress
- Calls `updateHubSubtitles()` when navigating to profile

Mobile navigation uses a fixed bottom bar. Desktop uses a top nav bar. Same page content, different chrome — controlled via `@media(max-width:600px)`.

---

## Mobile exercise entry sheet

The bottom sheet (`#ex-sheet`) is the primary gym logging UI on mobile. Desktop uses the inline table inputs.

**Open:** `openSheet(si, ei)` — superset index + exercise index
**State:** `_sheetSI`, `_sheetEI`, `_sheetOpen`

Flow:
1. User taps exercise row → `openSheet(si, ei)`
2. Sheet animates up (transform: translateY 100% → 0, 320ms spring)
3. User fills KG / Sets / Reps / RIR (26px font, inputmode=numeric)
4. "Next →" → `saveSheetData()` → `sheetNeighbors()` → move to next exercise
5. On last exercise: "Complete day" → `closeSheet()` → `completeDay()`
6. "←" → previous exercise
7. Swipe down >80px → `closeSheet()`

**Backdrop** (`#ex-sheet-backdrop`) covers page with blur, tapping it closes the sheet.

---

## Password system

Simple password gate — not a real auth system. Suitable for personal use (V1/V2).

```javascript
hashPw(pw) // djb2 hash with 'mp7salt' — returns base-36 string
```

- Stored in `localStorage('mp7_pin')`
- Setup mode: first time, no PIN exists → shows confirm field
- Lock: hides app, shows gate → `unlockApp()` on correct password
- In-app change: Profile page → expandable change-password panel

**Device transfer:** generates a signed, encrypted token with 2-min expiry. The token contains API keys and settings but NOT session data. Session data is imported separately via "Import from Sheets".

---

## Key constants

```javascript
PHASES         // 6 training phases with id, name, RIR, color, load description
TEMPLATES      // 4 gym day templates (A/B/C/D) — arrays of supersets with exercises
EX_GROUPS      // exercises grouped by muscle (for select optgroups)
EX_MUSCLE      // exercise → primary muscle lookup
EX_MUSCLE2     // exercise → secondary muscle lookup
EX_RES         // exercise → default resistance type
MUSCLES        // ordered list of all tracked muscles
GC             // 36 Gracie Combatives techniques (BJJ dropdown)
BJJ_POS        // 9 BJJ positions (chips)
SLEEP_C / ENERGY_C / SORENESS_C / PERF_C  // readiness chip options
REST_QUOTES    // 6 motivational quotes for rest day card
```

---

## Apps Script (in Google Sheets)

The Apps Script lives in the Google Sheet (Extensions → Apps Script). It receives POST requests from the app.

**Key behaviours:**
- Receives `{date, rows}` — rows is array of arrays
- Deletes existing rows for that date before appending (idempotent writes)
- Handles dynamic column width: `Math.max(HEADERS.length, ...rows.map(r => r.length))`
- Pads all rows to the same width before `setValues()`
- Returns `{ok: true}` or `{ok: false, error: '...'}`

**The 31-column width is critical** — BJJ rows extend to column AE. Any `setValues()` call must pad all rows to the same width as the widest row.

---

## Performance notes

- No virtual DOM — `renderTable()` does a full innerHTML rebuild every time
- This is fine for the scale (max ~8 exercises × 4 supersets)
- `persist()` serializes the entire sessions array on every save — acceptable for <200 sessions
- `renderProgress()` is only called when the tab is opened, not on every change

---

## Known technical debt

| Item | Notes |
|---|---|
| "Phase" terminology | UI still says "Phase" in several places. Should use microcycle language per V1 spec. |
| `S.weekInPhase` assignment | Line 1247: `S.weekInPhase=Math.min(...)` — `weekInPhase` is not on S (dead code). |
| Analysis tab uses `S.sessions.slice(-8)` | Only last 8 sessions sent to Claude. Should respect scope selector. |
| Import skips existing dates | No merge/overwrite option — can't re-import a date that was already imported. |
| `color-scheme:dark` on body | Forces dark scrollbars even in light mode. |
