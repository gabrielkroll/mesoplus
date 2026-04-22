# Meso+ V1 Extension — Slice Progress

> Token-lean orientation file. Read this first, every session.
> One row per completed slice. Update before pushing each slice commit.

---

## Now

**Slice 6 — Adaptive Action Bar**
Goal: Dedicated action/recommendation space below Summary cards — separates data from instruction.
Status: Not started — discuss acceptance criteria before touching code.

---

## Done

| Slice | Commit | Key decisions |
|---|---|---|
| 1 — Navigation Refactor | `8e36b7c` | Log→Train, Stats→Summary (placeholder), Analysis→Insights. Nav order: Summary→Train→Insights→Plan→Profile. Old Stats preserved under Profile→Stats. |
| 2 — Summary MVP | `2a0e50a` | Today card (Day X · Full Body · Focus, done ✓/in progress). Week card (gymDone/4, ABCD indicators, days left, urgency). DAY_FOCUS: A/C=Posterior & Biceps, B/D=Quads & Chest. Week = Mon–Sun. |
| 3 — Plan → Train Clarity | `0fdf3f0` | Focus labels on Plan day headers. Activity block header = "Day A · Full Body · Posterior & Biceps" (no duplication). completed flag added to completeDay(). ABCD indicators: faded=pending, grey=in progress, green=done. |
| 4 — Weekly Completion Loop | `d0e013c` | Pull created by ABCD indicators (S2). Summary header: phase name in phase color (serif italic 32px) + microcycle week label (mono). Deselect fix: Summary updates immediately when Train deselected. Active nudge deferred to S6. |
| 5 — Volume Awareness | `1ec753b` | Two cards: sessions (gymDone/4 + ABCD) and sets (actual/planned + pace bar). Planned from TEMPLATES + setGoals. Actual from logged sets. Pace = actual vs (planned/4 × sessions done). Cards data-only — action layer deferred to S6. 44px serif + 13px mono across all cards. |

---

## Upcoming

| # | Slice | Depends on |
|---|---|---|
| 6 | Adaptive Action Bar | 2, 3 |
| 7 | Readiness Integration | 6 |
| 8 | Insights → Weekly Review Flow | 4, 5 |
| 9 | RIR → Stimulus Signal | existing data |
| 10 | Summary Upgrade | 5, 9 |
| 11 | Train tab refactor — activity block as full-screen sheet | 6 |
| 12 | Weekly Check-in Shell | 8 |
| 13 | AI Check-in | 12, 9 |

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
- Train tab refactor (activity block → full-screen sheet, shared component) — parked as S11, depends on S6
