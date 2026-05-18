# Meso+ — Claude Code Context

> Personal gym + BJJ training tracker. Single-file PWA. Mobile-first. Personal use through V2.

---

## What this is

Meso+ is a progressive overload training log for one user (Gabriel). It tracks gym sessions, BJJ training, readiness metrics, and syncs everything to Google Sheets. It runs as a PWA from a single `index.html` file — no build system, no framework, no backend.

**Live:** https://mesoplus.openorbit.studio
**Repo:** github.com/gabrielkroll/mesoplus (main branch → GitHub Pages)
**Local dev:** `python3 -m http.server 3001` from this directory → `http://localhost:3001`

---

## Stack

| Layer | What |
|---|---|
| App | Single `index.html` — all HTML, CSS, JS inline |
| Fonts | Google Fonts CDN — Instrument Serif + DM Mono |
| QR codes | QRCode.js CDN (device transfer feature) |
| Data (local) | `localStorage` key `mp7` |
| Data (remote) | Google Sheets via Apps Script + Sheets API v4 |
| AI | Claude API (`claude-sonnet-4-6`) direct from browser |
| Hosting | GitHub Pages, custom domain |

No npm. No build step. No transpilation. Edit `index.html` → push → deployed.

---

## File structure

```
MesoPlus/
├── index.html          # The entire app (~1850 lines)
├── serve.sh            # Local dev: python3 http.server 3001
├── .gitignore          # Ignores .claude/, serve.sh, mesoplus.html
├── CLAUDE.md           # This file
└── docs/
    ├── PRODUCT.md      # Roadmap, decisions, terminology
    ├── ARCHITECTURE.md # Data model, APIs, JS patterns
    └── DESIGN.md       # Design system, CSS patterns, components
```

---

## Local dev workflow

```bash
# Start local server
python3 -m http.server 3001 --directory "/path/to/MesoPlus"
# Open http://localhost:3001 in Chrome
# Edit index.html → hard refresh (Cmd+Shift+R) → see changes
```

**No hot reload.** Changes require a manual refresh.

**Password on first load:** The app will show the password gate. In Chrome DevTools console, run:
```javascript
function hashPw(pw){const s=pw+'mp7salt';let h=5381;for(let i=0;i<s.length;i++){h=((h<<5)+h)^s.charCodeAt(i);h=h>>>0;}return h.toString(36);}
localStorage.setItem('mp7_pin', hashPw('test'));
location.reload();
```
Then log in with password `test`.

---

## Deploy

```bash
git add index.html
git commit -m "description"
git push origin main
# GitHub Pages deploys automatically in ~60 seconds
```

Only commit `index.html` (and docs). Never commit `.claude/`, `serve.sh`, or `mesoplus.html`.

---

## Architecture in 60 seconds

**One global state object:**
```javascript
let S = {
  phases, phaseIdx, mesoStart,     // mesocycle config
  selectedDate, viewWeekOffset,     // navigation
  gymDay, dtype,                    // current session type
  sleep, energy, soreness, perf,   // readiness
  supersets,                        // current exercises
  sessions,                         // all historical sessions
  apiKey, sheetId, sheetTab,       // Sheets config
  claudeKey, scriptUrl             // AI + Apps Script
}
```

**Data flow:**
```
User input → markDirty() → persist() [localStorage]
                         → debounced syncDayToSheets() [Sheets]
```

**Navigation:** `nav('log' | 'progress' | 'analysis' | 'profile' | 'program' | 'setup')`

**Key functions:**
- `init()` — bootstraps from localStorage, renders everything
- `buildCurrentSession()` — serializes current form to session object
- `toRows(sess)` — converts session to Sheets row array (A–AE)
- `markDirty()` — saves locally + triggers auto-sync
- `renderTable()` — re-renders the exercise table from S.supersets
- `computeSug()` — calculates progressive overload suggestions

---

## Google Sheets integration

**Two sync paths:**
1. **Apps Script URL** (`S.scriptUrl`) — preferred, handles write conflicts
2. **API key direct** (`S.apiKey` + `S.sheetId`) — read-only import + fallback write

**Column layout (A–AE):**
```
A:Date  B:Week  C:Phase  D:Type  E:GymDay  F:Superset  G:Exercise
H:Muscle  I:Resistance  J:Side  K:kg  L:Reps  M:RIR  N:Sets  O:Vol
P:Sleep  Q:Energy  R:Soreness  S:Performance  T:Flagged  U:Extra  V:Notes
W:BJJ_GC  X:BJJ_Desc  Y:BJJ_Positions  Z:BJJ_Partner
AA:BJJ_Drilling  AB:BJJ_Good  AC:BJJ_Bad  AD:BJJ_Subs  AE:BJJ_Next
```

**BJJ rows are wider than gym rows (31 cols vs 22).** The Apps Script handles dynamic column widths — do not hardcode `HEADERS.length` in range writes.

---

## Critical constraints

- **16px minimum** on all inputs — prevents iOS auto-zoom
- **44px minimum** tap targets — WCAG AA requirement
- **`env(safe-area-inset-bottom)`** on bottom-fixed elements — iPhone home indicator
- **No `return` in eval** — `preview_eval` / Chrome JS tool needs expressions not statements
- **iCloud Drive paths** cannot be served directly via localhost — use the local python server
- **`appendRows` HTTP 200 ≠ success** — Apps Script returns 200 with `{ok:false}` on errors. Always parse response body.

---

## Session data model

```javascript
{
  date: '2026-04-02',          // ISO date string
  week: 4,                      // mesocycle week number
  phase: 'Push',                // phase name
  phaseIdx: 2,                  // index into PHASES array
  dtype: 'Gym',                 // 'Gym' | 'BJJ + Gym' | 'BJJ' | 'Rest'
  gymDay: 2,                    // 1-4 (A/B/C/D template)
  sleep: '7.5h',               // from SLEEP_C options
  energy: 'Good',              // from ENERGY_C options
  soreness: 'Mild',            // from SORENESS_C options
  perf: 'On track',            // from PERF_C options
  extra: '',                    // free text
  notes: '',                    // free text
  flagged: ['Barbell Bench'],  // exercises flagged for pain
  bjj: null | { gc, desc, positions[], partner, drilling, good, bad, subs, next },
  supersets: [{
    label: 'Chest + Back',
    exercises: [{
      name, muscle, muscle2, res, side,
      rf, rc,                   // rep floor/ceiling (from template)
      sets, kg, reps, rir,      // logged values
      sugKg, sugReps, sugRIR,   // computed suggestions
      lastStr,                  // display string from last session
      flagged
    }]
  }]
}
```

---

## Design system quick ref

```css
/* Colors */
--accent: #7aad2a    /* green — primary action, active states */
--danger: #d44040    /* red — errors, destructive actions */
--ink: #1a1a1a       /* primary text (light) / #e8e8e8 (dark) */
--ink2: #555         /* secondary text */
--ink3: #999         /* tertiary, labels, placeholders */
--surf: #f5f5f3      /* card/chip backgrounds */
--lift: #fff         /* page background */
--line: #e0e0e0      /* borders, dividers */

/* Typography */
--serif: 'Instrument Serif'    /* italic headings, wordmark, big numbers */
--mono: 'DM Mono'              /* everything else */

/* Spacing tokens */
--sp1:4px  --sp2:8px  --sp3:12px  --sp4:16px  --sp5:24px  --sp6:32px  --sp7:48px

/* Breakpoint */
@media(max-width:600px) { /* mobile — bottom nav, sheet entry, stacked layouts */ }
```

---

## Roadmap snapshot

| Version | Status | Focus |
|---|---|---|
| V1 | Done ✅ | Personal tracking, Sheets sync, mobile UX |
| V2 | Next | Template builder, progress rebuild, goal tracking |
| V3 | Planned | Intelligence layer, AI recommendations |
| V4 | Future | User accounts, multi-device, go to market |

See `docs/PRODUCT.md` for full roadmap and all decisions.

---

## What NOT to do

- Do not add npm / package.json / build tooling
- Do not split into multiple files
- Do not add a backend or database other than Google Sheets
- Do not add features beyond the current version spec
- Do not commit `.claude/`, `serve.sh`, or `mesoplus.html`
- Do not push to production for UI-only iterations — use localhost:3001
