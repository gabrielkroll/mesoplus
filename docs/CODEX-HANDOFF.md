# Codex Handoff — S-TrainCards Card Primitive

Read this first when resuming the `feature/codex-experiments` worktree.

## Workspace

- Worktree: `/Users/hof/FabaOrigin/OpenOrbitStudio/mesoplus-worktrees/mesoplus-codex`
- Branch: `feature/codex-experiments`
- Local test URL: `http://localhost:3001/`
- User tests in the browser. Do not spend time driving the app unless explicitly asked.

## Active Slice

`S-TrainCards / shared card primitive` is an active experiment, not a completed shipped slice.

The Readiness card direction was accepted and has now been extracted into a shared notched card primitive for Train tab cards. Keep changes scoped to this feature surface and preserve existing sheet/open/rest flows.

Before merging or comparing against main/Claude trees, run `docs/REGRESSION-CHECKLIST.md`. It is the practical QA list for this experiment and supersedes ad hoc visual spot checks.

Latest manual QA findings are captured in `docs/QA-2026-05-12-CARD-REGRESSION.md`. Read that before fixing blockers; it records what Gabriel tested, what passed, and what is currently blocking merge readiness.

## Figma Source

- File: `Meso-`
- Node: `197:2397` (`Animation`)
- Prototype: hover state uses Smart Animate, `600ms`, `EASE_OUT`

Important geometry from Figma:

- Image shape: `430 x 380`
- Caption band: `430 x 83`
- Caption row: `y=20`, `h=43`
- Caption row animation: `x=-20 -> x=0`
- Left stroke: `1 x 43`, at caption row `x=0`
- Left copy inset: `20px`
- Left copy should flex-fill responsively
- Score lane: fixed `83px` on the right
- Score inner inset: `20px` left
- Score typography: Instrument Serif Italic, `50px`, muted gray at 60% opacity
- Title/status typography: DM Mono, `11px`, `0.72px` letter spacing

## Design Direction

Current accepted direction:

- Keep the clipped image shape as the expressive object.
- Keep the top-left and bottom-right notches as silhouette only.
- Do not put text inside notches.
- Do not put text over the image.
- Title and quick-view data live in the caption band below the image.
- Hover reveals the caption row from `-20px` to `0` and subtly zooms the image inside the clipped SVG shape.
- The caption left copy flex-fills available width; score remains fixed on the right.
- The row must not overflow the right edge on narrow widths.

## State / Interaction

Preserve existing user interaction semantics:

- Tap opens the readiness sheet.
- Long-press can peek sleep / energy / soreness.
- Release from long-press must not open the sheet.
- Rest/training state must keep the existing main-branch behavior.
- Resting state must still show the large orb card and open the box breathing sheet.

## Tier Color Rule

The tier word must use the same semantic color everywhere it appears, including the readiness sheet and the card quick view:

- Poor: `#d44040`
- Low: `#d46a20`
- Moderate: `#e8a020`
- High: `#7aad2a`
- Prime: `#9a6fd4`

## Current Files Touched

- `index.html` — shared image-card primitive, readiness/performance/rest card behavior, alpha/profile date hardening
- `docs/ARCHITECTURE.md` — card dashboard architecture and shared helper rules
- `docs/DESIGN.md` — card primitive visual contract
- `docs/PRODUCT.md` — recent UX decisions and quick-view roadmap caveat
- `docs/PROGRESS.md` — slice progress notes
- `docs/S-TRAINCARDS-AC.md` — active experiment note above legacy AC
- `docs/QA-2026-05-12-CARD-REGRESSION.md` — manual QA findings and retest record
- `docs/REGRESSION-CHECKLIST.md` — practical manual regression checklist

## Important Caution

The old `docs/S-TRAINCARDS-AC.md` notch-text rules are legacy for this experiment. The active note at the top supersedes them until the experiment is accepted or discarded.

Do not "fix" the card back to text-in-notch behavior.

## Last Known Feedback

Gabriel said the current flows are working for now. Filled-card quick-view semantics are intentionally deferred for more thought: the quick view must add glanceable value and not repeat the compact card state.

Recent refinements applied:

- Quick-view tier color now shares the same tier color map as the readiness sheet.
- Readiness sheet score now uses an `83px` score lane with `20px` left inset to echo the card quick view.
- Caption row uses `left:-20px`, `width:100%`, and reveals with `translateX(20px)` so the animation is preserved without overflowing right.
- Readiness now uses the same shared golden-ratio notch path builder as the other image cards, so notch widths scale from the live card width. Current production test uses an asymmetric notch depth: top `15px`, bottom `20px`, radius `10px`.
- Performance quick view follows the readiness pattern: compact `→ On track`, hover left `On track`, large serif `→`.
- Rest orb card stays centered, slowly pulses by animating SVG circle radius, and keeps reverse-parallax ring behavior.
- Readiness sheet `×` hover now matches other sheet close buttons.
- P0 sheet-opening and reload-persistence regressions were fixed and manually retested.

## Current Implementation State

The shared primitive is in `index.html`:

- `.sc-train-card` is the outer card shell.
- `.sc-card-face` / `.sc-readiness-face` hold the clipped SVG image shape.
- `.sc-card-caption` / `.sc-readiness-caption` hold the 83px caption band.
- `.sc-card-caption-row` / `.sc-readiness-caption-row` animate from `left:-20px` to visual `x=0` via `translateX(20px)`.
- `.sc-card-copy` flex-fills the left side.
- `.sc-card-value-box` / `.sc-score-box` keep the fixed right-side value lane.

Cards now using the primitive:

- Check-in: `Readiness`
- Training: `Resistance`, `Custom`, `BJJ`
- Resting: large `rest-orb-card`
- Reflect: `Performance`, `Notes`

Gabriel liked the large rest card after the primitive was applied.

## Deferred / Roadmap

- Refine filled/in-progress quick-view semantics for Resistance, Custom, BJJ, Performance, and Notes. Caveat: hover/peek must add information beyond the default compact state.
- Refine breathing-sheet transition polish later.
- Decide whether Rest remains a hidden interaction long-term or gains a compact visible affordance.

Do not revert the primitive to the old card system. Preserve the accepted large rest-card design and shared image-card primitive.
