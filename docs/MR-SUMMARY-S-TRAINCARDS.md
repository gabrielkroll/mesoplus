# MR Summary — S-TrainCards Shared Card Primitive

## Summary

Implements the Figma-driven Train tab image-card direction as a shared card primitive across Readiness, Training, Reflect, and Rest cards.

## What Changed

- Rebuilt Readiness as an image face plus caption footer, with Figma-aligned hover/reveal animation.
- Extracted the same card anatomy to Resistance, Custom, BJJ, Performance, Notes, and the large Rest/orb card.
- Moved card text out of notches and off images; notches are silhouette only.
- Added shared compact/reveal behavior:
  - empty cards show label + `Start`
  - filled cards use compact right-side summaries
  - hover reveals richer footer detail and optional large serif value
- Aligned Readiness score and Performance quick view to the shared right-side value lane.
- Fixed card/sheet regressions uncovered during QA:
  - Resistance, Custom, BJJ, and Notes open/close reliably
  - alpha Gabriel profile persists across reload
  - alpha login gate no longer dead-clicks
  - Rest orb stays centered, pulses slowly, and keeps ring parallax
  - Readiness sheet close hover matches other sheets

## Documentation

- Added card dashboard architecture notes.
- Added design-system notes for the image-card primitive.
- Added manual regression checklist.
- Added QA findings/retest log.
- Added Codex handoff notes for continuing this worktree.
- Recorded roadmap caveat: quick views must add glanceable value beyond the compact card state, not repeat it.

## QA

Manual QA by Gabriel in the in-app browser:

- Login: pass.
- Reload persistence: pass.
- Open/close each card sheet: pass.
- Rest mode: pass.
- Performance quick view: pass.

See `docs/QA-2026-05-12-CARD-REGRESSION.md` for full findings.

## Deferred

- Refine filled/in-progress quick-view semantics per card.
- Refine breathing sheet transition polish.
- Decide whether Rest remains a hidden interaction or gains a visible compact affordance.
