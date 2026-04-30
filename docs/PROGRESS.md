# Meso+ V1 Extension — Slice Progress

> Token-lean orientation file. Read this first, every session.
> One row per completed slice. Update before pushing each slice commit.

---

## Now

**S-Rest-3 — Breathing Orb (rest empty state)**
AC discussed, not yet coded. See spec below.

**Still open: S11.5 item 3**
Extra session card re-added to Training section. AC not yet discussed — discuss before coding.

**After S11.5:** S8 — Insights → Weekly Review Flow (AC not yet discussed).

---

## S-Rest-3 Spec — Breathing Orb

Replace the portal door SVG with a breathing orb in the same visual language
(dark bg, warm glow, green `#C8F04A` rim accent, tilt-reactive line).

### Ambient state (always on)
- Soft glowing circle, warm gold fill (`#F5C842` → `#FFE8A0` radial gradient)
- CSS `@keyframes` scale animation: expand 4s → hold 2s → contract 6s (12s loop)
- Green rim accent arc (same `.tilt-edge` pattern) — shifts with cursor/tilt
- No copy — the orb speaks for itself

### Guided state (tap to activate)
- Tap orb → enters guided box breathing: 4s in / 4s hold / 4s out / 4s hold
- Orb scale locked to the guided rhythm (overrides ambient animation)
- Subtle phase label fades in/out: `inhale` · `hold` · `exhale` · `hold`
- Mono font, very small, centre-aligned below orb
- After 4 rounds → returns to ambient state automatically

### Copy
- No persistent copy line (remove "Today is yours." — not specific to rest)
- Phase label only appears during guided mode

### Implementation notes
- SVG `<circle>` with CSS animation, same defs/gradients as door
- `.tilt-edge` is an arc near the orb rim — same JS listener reused
- Guided mode: JS drives `animation-play-state` + `animation-duration` override
- State: ambient → guided → ambient (no persist needed)
- AC fully discussed — ready to implement next session

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
| S11.5-1 — Page Titles + Summary Cards | `67512da` | .page-title class (serif italic 32px) on all 5 tabs. Summary: old phase header removed, replaced with "Summary" title + third card (sum-phase-card). Card label-first architecture: SESSIONS / SETS / MICROCYCLE labels at top of each card. Microcycle card: 44px phase name in phase colour + W1·W2 indicators (current=ink, future=line) mirroring sessions card layout. |
| S11.5-2 — Profile Sheet Modal | `f927bd4` | Circular initials button fixed top-right on mobile. Tap opens tall sheet from bottom (drag handle, avatar, user name, nav rows). Nav rows portal existing tab divs (Plan/Stats/Setup/Edit profile) into a slide-in detail panel within the sheet. hub-only tables hidden in detail to prevent recursive nav. nav() closes sheet + portal on tab switch. Bottom nav Profile → openProfileSheet(). |
| S-Rest-1 — Rest Day UX | `bc5e665` | Check-in "Rest today" trigger (worst-case inputs OR poor tier) + equal-weight Done/Rest today buttons. TRAINING section header: Rest instead / Train instead tertiary button. 150ms cross-fade on section body. Card visibility: training hidden, performance hidden, notes visible. startRestDay() sets S.isRest=true. |
| S-Rest-2 — Portal Illustration + Tilt | `b641660` | Inline SVG portal door. viewBox 0 180 800 720 → 0 150 800 520 (compact). Tilt-edge JS: desktop mousemove + mobile deviceorientation, inverted parallax ±12px. |

---

## Upcoming — prioritized and sequenced

| # | Slice | Goal | Depends on |
|---|---|---|---|
| S-Rest-3 | Breathing Orb | Replace portal door with orb in same visual language. Ambient CSS breathing animation + tap-to-guided box breathing (4/4/4/4). Tilt-reactive rim arc. No persistent copy. Full spec above. | S-Rest-2 |
| S11.5-3 | Extra Session Card | Extra session card (m-extra) re-added to Training section. AC not yet discussed. | 11 |
| 8 | Insights → Weekly Review Flow | Surface weekly volume, sessions, readiness in Insights tab. | 4, 5 |
| 9 | RIR → Stimulus Signal | RIR trends per muscle group as fatigue signal. | existing data |
| 10 | Summary Upgrade | Richer summary using S9 signal data. | 5, 9 |
| S-Summary-Detail | Summary Card Drill-downs | Two distinct tap zones per card: title tap → historical data view; data tap → today's detail / filter. AC not yet discussed. | S10 |
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
- **Touch target expansion pattern**: use padding + negative margin (not min-height) to extend tap area without inflating layout height.
- **Rest day UX**: rest triggered from check-in (worst inputs) OR section header button OR dot menu. Three entry points, all kept.
- **S-Rest-3**: orb replaces door. Same SVG visual language. Ambient breathing + tap-to-guided. No persistent copy. AC fully discussed.

## Bugs fixed this session (not slice commits)

| Commit | Fix |
|---|---|
| `07c9a41` | iOS touch: touch-action:manipulation on cards/close buttons, safe-area wrap padding |
| `5634688` | viewport-fit=cover — env(safe-area-inset-bottom) was always 0 without it |
| `d0d5a3f` | Insights hidden for alpha testers — removed from _applyAlphaUI, only Sheets setup hidden |
| `821d32f` | Profile key collision: mp7_profile='gabriel' remapped to 'gabriel-main' on load |
| `6fadc85` | importFromSheets rebuilt to use S11 activities model (was using old top-level supersets) |
| `bbcf88b` | Apps Script: deleteRowsForDate batch read + Date object handling — upsert now reliable |
| `2a2fe00` | td() uses local date (not UTC); loadSess/resetForm call renderActionBar(); visibilitychange advances to today on new day |
| `ea97157` | Empty session bug: derivedGymDay/fixGymDays guard against empty template sessions; goToday() cleans up empty past sessions; action bar + resistance card no longer show in-progress for empty template; "Remove session" added to resistance sheet dot menu |
| `f9d8c07` | gymDone + day indicators: added sessionHasData guard — empty template sessions no longer counted as done |
| `e7f9168` | Removed sets pace label (behind/on pace) — bar + numbers self-explanatory |
| `de09f06` | Touch target expansion on section header button — padding+negative margin, no layout inflation |

## Known Debt

- **Sheets duplication via direct API fallback** — appendRows() falls back to direct Sheets API when S.scriptUrl is empty; this path always appends (no upsert). Risk only when scriptUrl is not configured. Apps Script path is now fully safe (deleteRowsForDate fixed in bbcf88b).
- **Meso phase weeks not in Sheets** — weeks-per-phase config lives in localStorage only. A reset wipes it. Needs to sync to Sheets alongside session data.
- **No Sheets → app restore path** — V3 work. Tracked in roadmap.
- **Mobile: Sheets setup cannot be configured from Safari on iPhone** — scriptUrl, apiKey, sheetId live in Profile setup which requires desktop. V3 (bidirectional sync) will address this properly.
- **Portal door SVG still in place** — S-Rest-2 shipped the door; S-Rest-3 will replace it with the breathing orb. Door is intentional placeholder.
