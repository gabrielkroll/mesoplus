# Meso+ V1 Extension — Slice Progress

> Token-lean orientation file. Read this first, every session.
> One row per completed slice. Update before pushing each slice commit.

---

## Now

**Slice 11 — Train Tab: Card Shell**
Goal: Replace the inline Train tab with a card dashboard (Check-in / Training / Reflect sections). Cards have three visual states (not started / in progress / done). Wires Readiness and Resistance Training to their existing sheets. BJJ, Performance, Notes rendered as stubs. Action bar updated to reflect card-based session identity.
Status: Scoping complete — see docs/S11-SPEC.md. Resolve Extra Training field question, then write acceptance criteria, then code.

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

---

## Upcoming — prioritized and sequenced

| # | Slice | Goal | Depends on |
|---|---|---|---|
| 11 | Train Tab: Card Shell | Card dashboard layout. Readiness + Resistance Training wired. BJJ/Performance/Notes stubs. Action bar updated. | 6, 7 |
| 12 | Train Tab: BJJ Sheet | Full-screen BJJ logging sheet. BJJ card done state. | 11 |
| 13 | Train Tab: Reflect Cards | Performance card (chip sheet) + Notes card (textarea sheet). | 11 |
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
- **S11: Extra Training is its own card in the Training section** — not nested inside Readiness or Notes. Simple textarea sheet. Done when any text entered.
- Alpha tester login shipped (2442bc4): username gate → password → isAlpha profile flag, mp7_erik storage key, UI restrictions

## Known Debt

- **Meso phase weeks not in Sheets** — weeks-per-phase config lives in localStorage only. A reset wipes it. Needs to sync to Sheets alongside session data.
- **No Sheets → app restore path** — if localStorage is lost, session history in Sheets can't be pulled back into the app. Needed for true data resilience.
