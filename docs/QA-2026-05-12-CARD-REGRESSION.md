# QA Findings — Card Regression Pass

Date: 2026-05-12  
Scope: `feature/codex-experiments` shared image-card primitive and Train tab regression pass.  
Tester: Gabriel in the in-app browser. Codex guided only; user performed the tests.

---

## Summary

The shared image-card direction is visually promising and several baseline flows pass. The original sheet open/close blockers and reload persistence bug have been fixed and retested; remaining merge risk is now rest orb animation debt and unfinished filled-state visuals.

Recommended fix order:

1. Rest orb animation/parallax.
2. Visual refinements for filled card states and quick views.

---

## Passed

### Boot / Navigation

- App loads from `http://localhost:3001/`.
- App is visible and not stuck on blank page.
- Top nav is visible.
- Train page loads.
- Week/day nav is visible.
- Check-in section is visible.
- Training section is visible.
- No large broken layout or missing app chunks observed.

Note: week nav arrows/days may be blocked by design when outside valid mesocycle/date range. Do not treat unavailable past-before-start navigation as a bug unless a valid visible day cannot be selected.

### Empty Card Text

- Readiness: left `READINESS`, right `Start`.
- Resistance: left `RESISTANCE`, right `Start`.
- Custom: left `CUSTOM`, right `Start`.
- BJJ: left `BJJ`, right `Start`.
- Performance: left `PERFORMANCE`, right `Start`.
- Notes: left `NOTES`, right `Start`.
- Rest: no visible `Start`; Gabriel currently likes it as a hidden interaction, so this is not a regression.

### Readiness

- Readiness card opens the readiness sheet.
- Sheet header passes (`Check-in` / `Readiness`).
- Empty outcome says `How are you feeling?`.
- Sleep / Energy / Soreness chips are visible.
- Sheet closes.
- Selecting Sleep, Energy, and Soreness works.
- Outcome shows numeric score/tier.
- Closing the sheet updates the Readiness card.
- Card compact/reveal state passes after values are selected.

Minor UX note:

- Readiness sheet close button hover now matches the other sheet close buttons.

### Performance

- Performance sheet arrows functionally pass:
  - `↓ Below par`
  - `→ On track`
  - `↑ Exceeded`
- Active chip green state works.
- Arrows remain visible with labels.
- Closing updates the Performance card.

Design debt:

- Performance quick view now follows the readiness card pattern:
  - compact state shows `→ On track` on the right.
  - hover/reveal shows `PERFORMANCE` / `On track` on the left.
  - right value lane shows the large serif `→`.

### Rest Mode

- Training header menu can switch to Rest.
- Training cards hide.
- Rest/orb card appears.
- Rest/orb card opens the breathing sheet.
- Breathing sheet closes.
- Switching back to Train restores the training cards.

Animation debt:

- Rest/orb card ambient oscillation now passes: orb stays centered and pulses slowly.
- Ring reverse-parallax to cursor on the card passes.
- Breathing sheet ring behavior passes for now; transition could be refined later.

### Mobile Layout

- Cards become single-column.
- Bottom nav is visible.
- Tap targets generally feel usable.
- Enough scroll clearance above bottom nav/action bar when scrolling down.
- Sheets open and close for the sheets that currently open.

### Desktop Layout

- Training/Reflect cards use intended two-column layout.
- Check-in card keeps desktop card width and does not stretch full-width.
- Desktop hover states work.
- No obvious footer text clipping.
- Large score/value alignment passes on Readiness.

Design debt:

- Filled-state value alignment/detail design is unfinished for most non-readiness cards.

---

## Fixed / Retested

### Card Opening

Patched the likely root cause in `index.html`: invalid or missing date/meso-start state could make autosave throw before a sheet opened. Also hardened the alpha gate after it became temporarily stuck on the local test login.

Retest at `http://localhost:3001/?alphaGateFix=1778612600000`:

- Resistance opens on first tap: pass.
- Resistance closes: pass.
- Custom opens on first tap: pass.
- Custom closes: pass.
- BJJ opens on first tap: pass.
- BJJ closes: pass.
- Notes opens: pass.
- Notes closes: pass.

### Persistence

Patched profile startup migration so the alpha `gabriel` profile is no longer remapped back to `gabriel-main` after reload when alpha data/PIN exists.

Retest:

- Set Readiness: pass.
- Set Performance: pass.
- Add a short Note: pass.
- Hard refresh: pass.
- Readiness, Performance, and Notes remain after reload: pass.

### Final MR Smoke

Retest at `http://localhost:3001/?mrSmoke=1778701000000`:

- Login: pass.
- Reload persistence: pass.
- Open/close each card sheet: pass.
- Rest mode: pass.
- Performance quick view: pass.

---

## Failed / Blocked

No current P0 sheet-opening blocker remains after the retest above.
No current P0 persistence blocker remains after the retest above.

---

## Open Tickets

### P1 / Interaction Debt

- Refine breathing sheet transition behavior later if it becomes part of a broader interaction pass.

### P2 / Visual Refinement

- Refine filled/in-progress quick-view semantics for Resistance, Custom, BJJ, Performance, and Notes. Caveat: quick views must provide additional glanceable value beyond the default compact card state; do not repeat what is already visible at rest.
- Decide whether Rest should remain a hidden interaction or eventually show a compact action.

---

## Important Context

- Gabriel is testing manually in the in-app browser.
- Codex should guide tests one at a time and log feedback.
- Do not run browser testing or click through flows unless Gabriel explicitly asks Codex to investigate or fix.
- The current practical checklist is [REGRESSION-CHECKLIST.md](./REGRESSION-CHECKLIST.md).
- The current design implementation details are in [DESIGN.md](./DESIGN.md), especially `Image training cards (.sc-train-card)`.
- The current architecture notes are in [ARCHITECTURE.md](./ARCHITECTURE.md), especially `Card dashboard architecture`.
