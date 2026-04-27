# Meso+ V1 Extension — Slice Progress

> Token-lean orientation file. Read this first, every session.
> One row per completed slice. Update before pushing each slice commit.

---

## Now

**Slice S11.5 — Nav + IA Polish**
Goal: (1) Page titles on all tabs — large serif italic matching tab label. Phase/week info moves to a card under Summary. (2) Profile button top-right on mobile, circular dark-grey icon. (3) Extra session card re-added to Training section.
Status: Not started — discuss acceptance criteria before touching code.

**After S11.5:** S8 — Insights → Weekly Review Flow (acceptance criteria not yet discussed).

---

## Done

| Slice | Commit | Key decisions |
|---|---|---|
| 1 — Navigation Refactor | `8e36b7c` | Log→Train, Stats→Summary (placeholder), Analysis→Insights. Nav order: Summary→Train→Insights→Plan→Profile. Old Stats preserved under Profile→Stats. |
| 2 — Summary MVP | `2a0e50a` | Today card (Day X · Full Body · Focus, done ✓/in progress). Week card (gymDone/4, ABCD indicators, days left, urgency). DAY_FOCUS: A/C=Posterior & Biceps, B/D=Quads & Chest. Week = Mon–Sun. |
| 3 — Plan → Train Clarity | `0fdf3f0` | Focus labels on Plan day headers. Activity block header = "Day A · Full Body · Posterior & Biceps" (no duplication). completed flag added to completeDay(). ABCD indicators: faded=pending, grey=in progress, green=done. |
| 4 — Weekly Completion Loop | `d0e013c` | Pull created by ABCD indicators (S2). Summary header: phase name in phase color (serif italic 32px) + microcycle week label (mono). Deselect fix: Summary updates immediately when Train deselected. Active nudge deferred to S6. |
| 5 — Volume Awareness | `1ec753b` | Two cards: sessions (gymDone/4 + ABCD) and sets (actual/planned + pace bar). Planned from TEMPLATES + setGoals. Actual from logged sets. Pace = actual vs (planned/4 × sessions done). Cards data-only — action layer deferred to S6. 44px serif + 13px mono across all cards. |
| 6 — Adaptive Action Bar | `7fd8763` | Full-screen training sheet (full-screen modal, no Complete Day footer). Floating pill action bar (Apple Music pattern): whole pill = open sheet, ··· dot menu = "Wrap up Day X". State machine: not-started / in-progress / done. TODAY card owns session identity, action bar owns state. Shadow removed, 68px mobile gap. DOM ID conflict fix for ex-tbody. |
| 7 — Readiness Integration | `9bd611b` | Full-screen readiness check-in sheet (sleep/energy/soreness chips → score → tier). Nine action bar states: checkin-needed, rest-suggested, not-started (tier label), in-progress, done, rest, + tomorrow/future variants. TODAY card removed — action bar owns today identity. Frosted glass blur behind action bar (blur 48px + rgba(20,20,20,.8)→.35 gradient). |
| 11 — Train Tab: Card Shell | `abac535` | Card dashboard: CHECK-IN / TRAINING / REFLECT sections. 6 cards, 4 states (not-started/in-progress/done/disabled). computeCardStates() single source of truth → renderCards() + renderActionBar(). #csheet reuses appendActivityBlock for BJJ/Custom. S.notes/S.extra moved from DOM to state. Rest mutual exclusivity. Dot menu on BJJ/Custom sheets. Gabriel added as alpha tester (mp7_gabriel storage, type "gabriel"). |

---

## Upcoming — prioritized and sequenced

| # | Slice | Goal | Depends on |
|---|---|---|---|
| S11.5 | Nav + IA polish | (1) Page titles match tab labels on all tabs — large serif italic. Phase/week info moves to a card under Summary. (2) Profile button moves to top-right on mobile, inline with page title, circular dark-grey icon. (3) Extra session card (m-extra) re-added to Training section as a card. | 11 |
| 8 | Insights → Weekly Review Flow | Surface weekly volume, sessions, readiness in Insights tab. | 4, 5 |
| 9 | RIR → Stimulus Signal | RIR trends per muscle group as fatigue signal. | existing data |
| 10 | Summary Upgrade | Richer summary using S9 signal data. | 5, 9 |
| 14 | Weekly Check-in Shell | Structured weekly reflection before new microcycle. | 8 |
| 15 | AI Check-in | AI-driven check-in using accumulated data. | 14, 9 |

---

## Decisions Log

- Branch: `v1-extension` — main stays stable and live
- Nav order confirmed: Summary → Train → Insights → Plan → Profile
- Tab names: Summary, Train, Insights, Plan, Profile
- "Train" over "Log" — action word, clearer mental model
- Stats page preserved under Profile → Stats, not deleted
- One slice = one commit on v1-extension
- Always discuss acceptance criteria before writing code
- Grep before reading — never load index.html whole
- Extra sessions card (BJJ/custom count) — parked, add after S6
- ?profile= URL param is session-only — never writes to localStorage (fixed 4be72b6)
- **Only implement what was explicitly discussed and scoped — never change working features on the fly**
- **S11: Train tab → card dashboard. See docs/S11-SPEC.md for full design spec.**
- **Gabriel does the testing** — do not use preview tools to click through and test features. Write code and commit; Gabriel tests on his device.
- Alpha tester login shipped (2442bc4): username gate → password → isAlpha profile flag, mp7_erik storage key, UI restrictions
- **Profile keys**: gabriel-main → mp7 (main), gabriel → mp7_gabriel (alpha), erik → mp7_erik (alpha). Migration runs on load: mp7_profile='gabriel' remapped to 'gabriel-main' (commit 821d32f).
- **S11.5 scope agreed**: (1) page titles IA, (2) profile top-right mobile, (3) extra session card. Discuss AC before coding.
- **Data roadmap**: V1=localStorage+Sheets write-only, V2=CSV download, V3=Sheets bidirectional, V4=real accounts+multi-device.

## Bugs fixed this session (not slice commits)

| Commit | Fix |
|---|---|
| `07c9a41` | iOS touch: touch-action:manipulation on cards/close buttons, safe-area wrap padding |
| `5634688` | viewport-fit=cover — env(safe-area-inset-bottom) was always 0 without it |
| `d0d5a3f` | Insights hidden for alpha testers — removed from _applyAlphaUI, only Sheets setup hidden |
| `821d32f` | Profile key collision: mp7_profile='gabriel' remapped to 'gabriel-main' on load |
| `6fadc85` | importFromSheets rebuilt to use S11 activities model (was using old top-level supersets) |

## Known Debt

- **Sheets duplication via direct API fallback** — appendRows() falls back to direct Sheets API when S.scriptUrl is empty; this path always appends (no upsert). Risk only when scriptUrl is not configured. Apps Script path is now fully safe (deleteRowsForDate fixed in bbcf88b).
- **Meso phase weeks not in Sheets** — weeks-per-phase config lives in localStorage only. A reset wipes it. Needs to sync to Sheets alongside session data.
- **No Sheets → app restore path** — V3 work. Tracked in roadmap.
- **Mobile: Sheets setup cannot be configured from Safari on iPhone** — scriptUrl, apiKey, sheetId live in Profile setup which requires desktop. V3 (bidirectional sync) will address this properly.
