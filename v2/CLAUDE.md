# Meso+ V2 — Claude Code Context

> React + Vite rewrite of V1. Same data model, same design system, distributed component structure.
> **Read this file before touching anything in V2.**

---

## Quick orientation

| What | Where |
|---|---|
| Entry point | `src/App.jsx` — routes to page components by `activeTab` |
| State | `src/store/useStore.js` — single Zustand store, persists to `mp7` localStorage |
| Design system | `DESIGN.md` — tokens, typography, spacing, component contracts |
| Tokens CSS | `src/tokens/tokens.css` — CSS custom properties only |
| Pages | `src/components/{log,stats,analysis,plan,profile}/` |
| Sheets (drawers) | `src/components/sheets/` — modal overlays for log entry |
| Atoms | `src/components/atoms/` — Button, Chip, NumInput, Stepper, ProgressBar, TextArea |
| Molecules | `src/components/molecules/` — ChipGroup |
| Layout | `src/components/layout/BottomNav.jsx` |
| Auth | `src/components/auth/LoginGate.jsx` |
| Transfer | `src/components/transfer/TransferImport.jsx` |

Dev server: `npm run dev` inside `v2/` → `http://localhost:5173`
Build: `npm run build` → `dist/`

---

## Layer map

V2 has four distinct layers. **Changes should stay within one layer per prompt.**

### Layer 1 — Store (`src/store/useStore.js`)
Owns: all persisted state, all actions, the localStorage bridge to V1.

State shape:
```
sessions[]          all logged sessions
phases[]            mesocycle phase names
phaseIdx            current phase index
mesoStart           ISO date string
setGoals            { [day]: { [exerciseName]: setCount } }
globalSetGoal       default set count (number)
scriptUrl           Google Apps Script URL
sheetId             Google Spreadsheet ID
sheetTab            sheet tab name (default: 'Sessions')

activeSheet         UI only — which drawer is open (not persisted)
activeTab           UI only — current nav tab (not persisted)
selectedDate        UI only — date in focus (not persisted)
```

Actions: `openSheet`, `closeSheet`, `setTab`, `setDate`, `addSession`, `removeSession`, `removeTraining`, `updateSetGoal`, `setAllGoals`, `setMesoStart`, `setPhases`, `setPhaseIdx`, `setScriptUrl`, `setSheetId`, `setSheetTab`

**Only touch this file for state shape or action changes. Never add UI logic here.**

### Layer 2 — Components (`src/components/**/*.jsx` + `.module.css`)
Each component pair = one `.jsx` + one `.module.css` in the same folder.
Components read from the store with `useStore(s => s.field)`. They do not write raw state — they call store actions.

**Only touch component files for rendering, layout, and wiring changes.**

### Layer 3 — Tokens (`src/tokens/tokens.css`)
CSS custom properties only. Colours, fonts, spacing, radius. Never edit this without reading `DESIGN.md` section 2 first.

**Touch this only for design token changes. Never add component styles here.**

### Layer 4 — App shell (`src/App.jsx`, `src/main.jsx`, `src/index.css`)
Top-level routing and global resets. Rarely needs touching.

---

## Component registry

What each file owns — use this to find the right file before reading code.

### Pages
| File | Renders |
|---|---|
| `log/LogPage.jsx` | Full log tab — week nav, day pills, readiness brief, session type toggle, sheet entry buttons |
| `stats/StatsPage.jsx` | Stats tab — muscle volume chart, readiness trend, session history list |
| `stats/MuscleChart.jsx` | Bar chart of sets per muscle group |
| `stats/ReadinessTrend.jsx` | Sparkline-style readiness over time |
| `analysis/AnalysisPage.jsx` | AI analysis tab — Claude API integration |
| `plan/PlanPage.jsx` | Program/plan tab — mesocycle config, set goals |
| `profile/ProfilePage.jsx` | Profile/setup tab — Google Sheets config, API keys |

### Sheets (drawers / bottom overlays)
| File | Opens when |
|---|---|
| `sheets/SheetBase.jsx` | Base layout for all sheets — handles open/close, backdrop |
| `sheets/ReadinessSheet.jsx` | `activeSheet === 'readiness'` |
| `sheets/RestSheet.jsx` | `activeSheet === 'rest'` |
| `sheets/ResistanceSheet.jsx` | `activeSheet === 'resistance'` |
| `sheets/BJJSheet.jsx` | `activeSheet === 'bjj'` |
| `sheets/ResistanceBJJSheet.jsx` | `activeSheet === 'resistance+bjj'` |
| `sheets/PerformanceSheet.jsx` | `activeSheet === 'performance'` |
| `sheets/NotesSheet.jsx` | `activeSheet === 'notes'` |

### Atoms
| File | What it is |
|---|---|
| `atoms/Button.jsx` | 3 variants: `primary`, `ghost`, `danger`. Read `DESIGN.md` section 4 before changing. |
| `atoms/Chip.jsx` | Toggle chip. `active` prop = accent style + dot. |
| `atoms/NumInput.jsx` | Numeric stepper input — kg, reps, RIR |
| `atoms/Stepper.jsx` | +/- stepper for set goals |
| `atoms/ProgressBar.jsx` | Progress indicator |
| `atoms/TextArea.jsx` | Auto-resize textarea — bare style, no box |

### Molecules
| File | What it is |
|---|---|
| `molecules/ChipGroup.jsx` | Group of Chip atoms with single-select logic |

### Layout / Auth
| File | What it is |
|---|---|
| `layout/BottomNav.jsx` | Fixed bottom nav — 5 tabs, calls `setTab` |
| `auth/LoginGate.jsx` | Password gate wrapping entire app |
| `transfer/TransferImport.jsx` | QR / manual session import overlay |

---

## Workflow protocol — follow this every session

### Before writing any code

1. **Identify the layer.** State it explicitly: *"This touches Layer 2 (LogPage component)."*
2. **If it crosses layers, sequence it.** State the sequence before starting: *"Step 1: store action. Step 2: component wiring."* Get confirmation before proceeding.
3. **Read only what you need.** For a component change: read that component file + its CSS module. Do not read the full store unless the action doesn't exist yet.

### The pre-flight response

When Gabriel makes a V2 change request, always respond with this before writing code:

> **Layer:** [which layer(s)]
> **Files:** [exact file paths]
> **Scope:** [one sentence — what changes and what stays the same]

If it crosses more than one layer, add:
> **Sequence:** Step 1 → Step 2 → ...

Then wait for a go-ahead or scope adjustment.

### Sizing a prompt

| Change type | Fits in one prompt? |
|---|---|
| Style/layout tweak in one component | ✅ Yes |
| New UI element in one existing page | ✅ Yes |
| New store action + wiring to one component | ✅ Yes (state the two steps) |
| New page from scratch | ⚠️ Split: store first, then component |
| Cross-tab feature (touches 2+ pages) | ❌ Split into separate prompts |
| Design token change + component update | ❌ Split: tokens first, then component |

---

## Critical constraints (same as V1)

- **16px minimum** on all inputs — prevents iOS auto-zoom
- **44px minimum** tap targets — WCAG AA
- **Tokens only** — never hard-code colours, fonts, or spacing that exist in `tokens.css`
- **No new button variants** — exactly three exist: `primary`, `ghost`, `danger`
- **Bare inputs in settings** — bottom-border only, no box (see `DESIGN.md` section 3)
- **Store actions only** — components never call `set()` directly, always via named actions

---

## V1 compatibility

V2 reads and writes the same `mp7` localStorage key as V1. The custom `mp7Storage` adapter in `useStore.js` bridges V1's raw JSON format with Zustand's `{state, version}` envelope. Do not change this adapter without testing against V1 data.

---

## Design decisions — quick ref

For full design system: read `DESIGN.md`.

| Decision | Rule |
|---|---|
| Body font | DM Mono everywhere except serif moments |
| Serif moments | Page titles, week number (44px), sub-section headings, wordmark |
| Accent colour | Signal only — active state, primary CTA, status dots, focus ring |
| Card style | `border: 1px solid var(--color-line); border-radius: 8px; padding: 14px 16px` — no shadow |
| Section label | 9–10px, mono, uppercase, `letter-spacing: .07em`, `color: var(--color-ink3)` |
