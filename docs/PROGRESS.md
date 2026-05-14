# Meso+ V1 Extension — Slice Progress

> Token-lean orientation file. Read this first, every session.
> One row per completed slice. Update before pushing each slice commit.

---

## Now

**Active experiment: S-TrainCards / shared card primitive** — working in `feature/codex-experiments` worktree. Gabriel is testing locally on `localhost:3001`.

Current agreed direction: keep the clipped image shape as the expressive object; do not put text in the notches or over the image. Card title/status live in an 83px caption band below the image. Hover reveals the caption row from `x=-20` to `x=0` over 600ms ease-out and zooms the image inside the clipped shape. Left caption flex-fills; score stays fixed on the right. Readiness tier colour must be shared between the sheet tier label and the card quick-view tier word (`Poor #d44040`, `Low #d46a20`, `Moderate #e8a020`, `High #7aad2a`, `Prime #9a6fd4`). The readiness sheet score uses the same fixed score-lane structure as the card quick view: 83px lane with 20px left inset.

The Readiness anatomy has been extracted into `.sc-train-card` / `.sc-card-face` / `.sc-card-caption` and applied to `Resistance`, `Custom`, `BJJ`, `Performance`, `Notes`, and the large rest orb card. The rest/training toggle regression was fixed by `_setTrainingRestDom(isRest)` and `setRestFromHeader(true/false)`. The rest orb now stays centered, pulses by animating SVG circle radius, and keeps the reverse-parallax ring. Performance quick view follows the readiness value pattern. Remaining design decision: refine filled-card quick-view semantics so hover/peek adds real glanceable value instead of repeating the compact state.

**Next after card experiment:** S8 — Insights → Weekly Review Flow (AC not yet discussed).

S11.5-3 (extra session card) has been retired as originally scoped. Extra sessions need proper product design before implementation — see roadmap item S-ExtraSess below.

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
| S-Rest-3 — Breathing Orb | `bc85dea` | Replaced portal door with warm gold orb. CSS @keyframes: 4s inhale → 2s hold → 6s exhale (12s loop). Glow pulse synced. Tap → guided box breathing 4/4/4/4 × 4 rounds, phase labels fade in/out (DM Mono 11px). Tilt-reactive green rim arc preserved. No persistent copy. |
| S-Rest-4 — Orb Card + Breath Sheet | `8487407` | Rest state: single full-width orb card (184px, same height as 2×2 grid), whole card tappable. Green accent: full closed circle (not arc). clip-path expansion opens card into full-screen breath sheet (#141414). Guided breathing loops indefinitely (no auto-exit). × close reverses animation. TRAINING label → RESTING. 2D parallax ±5px. |
| S-Rest-5a — RAF Loop | `ef94bb0` | Single requestAnimationFrame loop drives all continuous animation. Parallax: events write to _tiltTarget only; RAF lerps _tiltCurrent at factor 0.10 → 60fps inertial ring with no CSS transition lag. Ambient breathing: sine wave (12s, scale 1.0–1.15) replaces CSS @keyframes — applied each tick to both card and sheet orbs. Guided breathing keeps CSS transitions for precise 4s phase timing; RAF skips breath updates while guided active. Fix `6532974`: breath-sheet inline display:none required for RAF visibility check. |
| S-Rest-5b — Sheet Spring | `0b66f3d` | Inverse-FLIP spring: sheet starts at card position via translate+scale, springs to none via cubic-bezier(0.2,0,0,1). background-color #1e1e1e→#141414 + border-radius 10px→0 in same 500ms motion. Close reverses (400ms). toggleRestFromHeader() force-close updated to clear transform. |
| S-Rest-Data-1 — Non-destructive Rest Toggle | `e003b75` | `_applyRestFlag(value)` single source of truth — isRest is a flag only, activities never touched. Confirmation gate when training data exists (inline header row, no modal). Past-day rest marking via S.selectedDate. `overrideRestDay()` fixed to use `_applyRestFlag(null)`. |
| S-Rest-Data-2 — Sheets sync fix for isRest | `89c1344` | `_applyRestFlag` deletes date from `_synced` so rest flag changes trigger re-sync. `toRows` appends isRest as column 23 ('1'/'') on all non-BJJ rows. `importFromSheets` reads col 22 to restore isRest — backward compat with old 'Rest' row type. BJJ+rest edge case noted as limitation. |
| S-Rest-6 — Rest UX: dot menu + card removal | `342e5e3` | TRAINING header "Rest instead" btn replaced with ··· dot menu (toggleTrainingHdrMenu). Menu has single "Rest instead" item — friction to make rest intentional. Rest state still shows "Train instead" as direct visible button. Rest card removed from 2×2 grid (rest is a full UI state, not a card action). nav() closes menu on tab switch. |
| S-IA-a — Sheet max-width | `b854273` | All full-screen sheets (rs-sheet, csheet) constrained to 900px content column on desktop via rs-inner/csheet-inner wrappers matching tday-inner pattern. Sheet background still covers full viewport. |
| S-IA-b — Sheet eyebrow/title unification | `415c7eb` | Pattern: eyebrow=section, title=card. Readiness: title→"Readiness", outcome card shows "How are you feeling?" replacing —. Resistance: eyebrow→"Training", title→"Resistance", day/focus label surfaced via activity-block-hdr above suggestions banner (toggle-btn hidden). BJJ: "BJJ". Custom: "Custom". Performance/Notes unchanged. |
| S-IA-c — BJJ/Custom card not-started when empty | `2786db3` | computeCardStates(): data guards for custom (kg/reps/rir) and bjj (any field) — stub activity no longer promotes card to in-progress. closeCardSheet(): _csheetWasNew flag; on close with no data removes stub and persists clean state. |
| S-BottomBar — Remove bottom strip, move undo to sheet | `0f971a1` | Bottom bar removed entirely (Analyse, Sync, Complete day, save-msg, undo btn). setSave() now error-only via _showToast() fixed overlay, auto-clears after 4s. markDirty() silent. showUndo() no-op. Tday ··· menu: "Undo all changes" appears conditionally when _undoPrev set. clearCsheetEntries(): snapshots + 8s undo banner (undoCsheetClear) matching tday discard pattern — first time BJJ/Custom clear is undoable. |
| S-MenuFix — Dot menu positioning | `b5c57c0` | tday + csheet menus: right:16px anchor (was window.innerWidth-r.right). Training header menu: same fix + remove scroll-close + toggle fix (exclude trigger btn from outside-click handler). section-dot-btn: responsive — slim desktop, extended hit area mobile (padding+negative margin). |
| S-MenuPos — Shared dropdown utility | `ac2bfa2` | `_dropdownPos(el, above?)` single source of truth: right=Math.max(16, innerWidth-r.right), top/bottom from element rect + 8px gap. All 4 menus (csheet, ab-menu, tday, training-hdr) use Object.assign(menu.style, _dropdownPos(btn)). id="ab-more-btn" added to action-bar ··· button so ab-menu anchors precisely to the button, not the whole bar. training-hdr preserves header-bottom top override for extended-hit-area correctness on mobile. |
| S-RemoveSession — Undo + Sheets delete | `313a775` | "Remove session" shows persistent undo. × or nav-away fires Sheets cleanup: deleteFromSheets(date) if session empty, syncDayToSheets if readiness/notes remain. beforeunload uses keepalive:true. syncDayToSheets now calls deleteFromSheets when session missing/empty. Flush hooks in nav(), shiftWeek(), visibilitychange, beforeunload. |
| S-RemoveScope — Scope fix + inline card undo | `1da77e6` | removeTdaySession was removing the entire day (readiness, notes, all activities) — now removes only the template activity, matching csheet scope. Label corrected to "Resistance removed". Floating toast replaced with inline card undo: the removed card transforms in place ("Removed — tap to undo" + × top-right). Tapping the card triggers undo via guard in openTrainingSheet/openCardSheet. No section header changes. _removePending drives renderCards(); flush hooks unchanged. |

---

## Upcoming — prioritized and sequenced

| # | Slice | Goal | Depends on |
|---|---|---|---|
| S-Rest-3 | Breathing Orb | ✓ Done — `bc85dea` | S-Rest-2 |
| S-Rest-4 | Orb Card + Breath Sheet | ✓ Done — `8487407` | S-Rest-3 |
| S-Rest-5a | RAF Loop | ✓ Done — `ef94bb0` | S-Rest-4 |
| S-Rest-5b | Sheet Spring Animation | ✓ Done — `0b66f3d` | S-Rest-5a |
| 8 | Insights → Weekly Review Flow | Surface weekly volume, sessions, readiness in Insights tab. | 4, 5 |
| S-ExtraSess | Extra Sessions — Proper Integration | BJJ + Custom sessions are real training, not footnotes. Needs product design: how they count toward weekly load, how they surface in Summary, whether session count (0/4) should ever reflect them. "+ 1 extra session" text removed from SESSIONS card 2026-05-03 — concept deferred to this slice. Options being considered: (A) separate session type with its own planned target, (B) surface in SETS card alongside resistance volume, (C) new "Activity" card on Summary. | 11, 8 |
| S-TrainCards | Train Tab Card Redesign + Carousel View | In progress in `feature/codex-experiments`: first slice is the Readiness card. Direction: clipped image-only shape, caption/status below, Figma hover reveal (`-20px → 0`, 600ms ease-out), image zoom on hover, responsive caption row. Carousel/grid preference still deferred. | S11 |
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
- **S-TrainCards Readiness experiment (2026-05-12)**: Old notch-text model is retired for this experiment. New rule: image shape is expressive only; notches are silhouette only; no text over image; title/status live in caption band below. Figma animation node `197:2397`: caption row `x=-20 → 0`, 600ms ease-out; left stroke at row x=0; left copy flex-fills; score frame fixed right (`83px`); score typography Instrument Serif Italic 50px at muted 60% gray. Tier colour is semantic and shared between readiness sheet + quick view. Sheet score should align to the same 83px / 20px-inset score-lane structure.
- **S-TrainCards notch geometry (2026-05-13)**: Figma ratio node `234:2065` defines notch widths with golden-ratio/Fibonacci proportions (`430 → 266 → 164 → 102`). Runtime SVG geometry now sets the top notch apex to `width / phi^3` and the bottom-right notch apex offset to `width / phi^2`. Current production test uses asymmetric depth: top `15px`, bottom `20px`, radius `10px`. The Readiness card uses the shared golden-ratio path builder too, so all image-card faces follow the same notch ratio system.
- **S-TrainCards containment rule (2026-05-12)**: Readiness-card selectors should stay scoped to `.sc-train-card`. Rest/training state is out of scope for this slice; keep the main branch implementation for `renderCards()`, `_applyRestFlag()`, `confirmRestToggle()`, and `toggleRestFromHeader()` unless a separate rest-state slice is opened.
- **S-TrainCards primitive extraction (2026-05-12)**: Readiness card anatomy is now a shared notched card primitive. Training cards (`Resistance`, `Custom`, `BJJ`) use the same image face, caption band, hover zoom, `-20px → 0` reveal row, optional value lane, and state mapper while preserving existing IDs/click handlers for sheets.
- **Gabriel does the testing** — do not use preview tools to click through and test features. Write code and commit; Gabriel tests on his device.
- Alpha tester login shipped (2442bc4): username gate → password → isAlpha profile flag, mp7_erik storage key, UI restrictions
- **Profile keys**: gabriel-main → mp7 (main), gabriel → mp7_gabriel (alpha), erik → mp7_erik (alpha). Legacy migration only remaps `mp7_profile='gabriel'` to `gabriel-main` when no alpha-specific Gabriel data/PIN exists, so the alpha profile survives reload.
- **S11.5 scope agreed**: (1) page titles IA, (2) profile top-right mobile. (3) extra session card retired — see S-ExtraSess in roadmap.
- **Data roadmap**: V1=localStorage+Sheets write-only, V2=CSV download, V3=Sheets bidirectional, V4=real accounts+multi-device.
- **Extended hit area pattern** (Apple HIG term): use padding + negative margin (not min-height) to extend the interactive hit area beyond visual bounds without inflating layout height. On mobile the hit area can bleed over adjacent elements intentionally. Background highlight suppressed in those cases to avoid visual bleed over cards.
- **Fixed dropdown menu rules**: Always use `_dropdownPos(el, above?)` — single source of truth. Returns `{top, bottom, right}` for `Object.assign(menu.style, ...)`. Formula: `right=Math.max(16, window.innerWidth-r.right)` — clamps to 16px on mobile (extended hit area), computes precise offset on desktop. `above=true` flips to `bottom` anchor (for bars pinned to viewport bottom). Training-hdr overrides `pos.top` with the section header's bottom to avoid hit-area inflation on mobile.
- **Rest day UX**: rest triggered from check-in (worst inputs) OR section header button OR dot menu. Three entry points, all kept.
- **S-Rest-3**: orb replaces door. Same SVG visual language. Ambient breathing + tap-to-guided. No persistent copy. AC fully discussed.
- **S-Rest-4**: single rest card (184px = 2×2 grid height). Whole card tappable. Green ring = full closed circle. Clip-path expansion into full-screen breath sheet. Guided breathing loops indefinitely — user exits via ×. TRAINING title swaps to RESTING in rest state.
- **S-Rest-5a**: all continuous animation via single RAF loop. Parallax: lerp factor 0.10, 2D translate(x,y), ±5px. Ambient breathing: sine wave, no CSS @keyframes. Guided breathing: CSS transitions for exact 4s phase timing. RAF skips breath updates while guided active.
- **S-Rest-5b**: inverse-FLIP spring — translate+scale start state, cubic-bezier(0.2,0,0,1), bg+radius in same motion. Shipped `0b66f3d`.
- **btn-t hover pattern**: in `.card-section-hdr`, suppress background on hover entirely (color change only) to avoid bleed into adjacent cards from touch-target padding expansion.
- **S-Rest-6**: Rest entry points are now (1) low readiness check-in, (2) dot menu in resistance training sheet, (3) ··· dot menu in TRAINING section header. Rest card removed — rest is a full UI state with its own orb card, not a 2×2 grid item. Recovery ("Train instead") stays as a direct button in rest state for easy override.
- **Microcycle week dots have three states**: `var(--ink)` = current week (primary); `var(--ink2)` = past week with any gym session logged (touched/partial); `var(--line)` = future or empty past week (muted). No accent/green state yet — deferred to when "fully completed week" has a clear definition.
- **Extra sessions (BJJ/Custom) removed from SESSIONS card** (2026-05-03): "+ N extra sessions" text was a placeholder count, not a real product decision. Removed entirely. Proper integration tracked under S-ExtraSess.
- **Readiness sheet is always scoped to S.selectedDate** — never td(). Past days show "Save" not "Start Day X". closeReadinessSheet must never overwrite S.selectedDate.
- **Import merge rule**: existing sessions are never skipped wholesale — if missing sleep/energy/soreness, those fields are filled from Sheets. Local data always wins (only gaps filled).
- **Tilt state reset rule**: _tiltTarget/_tiltCurrent must be zeroed at every rest↔non-rest transition and at breath sheet open/close so ring always starts from centre.

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
| `3a4072c` | Import merges readiness into existing sessions: skipped dates now get sleep/energy/soreness filled from Sheets if missing locally; status shows "X readiness merged" |
| `2ed609a` | Readiness sheet past-day fix: openReadinessSheet/closeReadinessSheet/\_updateRsSheet all used td() — changed to S.selectedDate; past days show "Save" not "Start Day X"; closeReadinessSheet no longer overwrites S.selectedDate or bleeds perf/notes onto today |
| `9ee6584` | Tilt reset on breath sheet open/close and RAF stop: _tiltTarget/\_tiltCurrent now zeroed at open (sheet ring starts fresh), at close (card ring returns to centre), and in \_stopOrbRaf (rest→train→rest no longer carries stale position); orbSvg inline spring transform cleared after 400ms so RAF child writes have clean parent |

## Known Debt

- **Sheets duplication via direct API fallback** — appendRows() falls back to direct Sheets API when S.scriptUrl is empty; this path always appends (no upsert). Risk only when scriptUrl is not configured. Apps Script path is now fully safe (deleteRowsForDate fixed in bbcf88b).
- **Meso phase weeks not in Sheets** — weeks-per-phase config lives in localStorage only. A reset wipes it. Needs to sync to Sheets alongside session data.
- **No Sheets → app restore path** — V3 work. Tracked in roadmap.
- **Mobile: Sheets setup cannot be configured from Safari on iPhone** — scriptUrl, apiKey, sheetId live in Profile setup which requires desktop. V3 (bidirectional sync) will address this properly.
- **Breathing orb replaces portal door** — S-Rest-3 shipped (`bc85dea`). Ambient 12s CSS loop + tap-to-guided box breathing state machine.
