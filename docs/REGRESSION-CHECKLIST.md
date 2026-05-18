# Meso+ — Regression Checklist

Use this before merging the `feature/codex-experiments` / card primitive work back toward main.

Scope: catch regressions from the shared image-card redesign without turning every iteration into a full product QA pass.

---

## Test Setup

- Serve locally from repo root: `python3 -m http.server 3001`
- Test URL: `http://localhost:3001/?qa=<timestamp>`
- Use the password/profile already configured in localStorage, or set the test password from `AGENTS.md`.
- Hard refresh or use a cache-busting query after every file edit.

---

## Boot And Navigation

- [ ] App loads from `localhost:3001` without using `file://`.
- [ ] Password gate/profile gate still works.
- [ ] Train tab loads without console errors.
- [ ] Summary, Train, Insights, Plan, and Profile navigation still switch views.
- [ ] Desktop top nav and mobile bottom nav active states still update.

---

## Shared Image Cards

### Empty Cards

- [ ] Readiness empty state shows `READINESS` on the left and `Start` on the right.
- [ ] Resistance empty state shows `RESISTANCE` on the left and `Start` on the right.
- [ ] Custom empty state shows `CUSTOM` on the left and `Start` on the right.
- [ ] BJJ empty state shows `BJJ` on the left and `Start` on the right.
- [ ] Performance empty state shows `PERFORMANCE` on the left and `Start` on the right.
- [ ] Notes empty state shows `NOTES` on the left and `Start` on the right.
- [ ] Empty card left vector line is only title-height (`14px`), not full filled-state height.
- [ ] Empty cards do not duplicate action text on left and right.

### Hover / Reveal

- [ ] Desktop hover moves the caption row from `-20px` to visual `0`.
- [ ] Desktop hover fades the compact right label out quickly.
- [ ] Compact right label returns after the hover/score animation without overlap.
- [ ] Image zooms subtly inside the clipped SVG shape.
- [ ] Left vector line is `33px` for filled/two-line states.
- [ ] Large serif values align to the right lane and can visually extend upward without stretching the vector line.

### Filled / In-Progress Details

- [ ] Resistance in-progress shows useful detail, e.g. `Day A · In progress`.
- [ ] Resistance done shows exercise/set summary.
- [ ] Custom done shows exercise/set summary or `Session logged`.
- [ ] BJJ done shows the BJJ outcome/summary.
- [ ] Performance done shows the selected performance label with the correct arrow.
- [ ] Notes done shows the first note line.
- [ ] Filled card compact right status stays short and information-bearing, not generic `Done` unless the card genuinely has no better glanceable value.
- [ ] Hover/peek quick view adds value beyond the compact rest state instead of repeating the same label.

---

## Readiness Flow

- [ ] Tapping Readiness opens the readiness sheet.
- [ ] Empty readiness sheet shows `How are you feeling?`.
- [ ] Selecting Sleep/Energy/Soreness updates the sheet outcome.
- [ ] Selecting all three updates the card without needing a full reload.
- [ ] Readiness tier colors match everywhere:
  - Poor `#d44040`
  - Low `#d46a20`
  - Moderate `#e8a020`
  - High `#7aad2a`
  - Prime `#9a6fd4`
- [ ] Readiness card guidance matches readiness sheet guidance via `readinessMessage(tier)`.
- [ ] Prime says `Let's go`, not `Prime window` or `Prime — let's go`.
- [ ] Sheet score is on the right, matching the quick card.
- [ ] Long-press peek still shows sleep / energy / soreness.
- [ ] Releasing long-press does not open the sheet.

---

## Performance Flow

- [ ] Performance sheet chips show:
  - `↓ Below par`
  - `→ On track`
  - `↑ Exceeded`
- [ ] Active performance chip still shows the green dot.
- [ ] Selecting performance updates the quick card.
- [ ] Performance quick card uses the same arrow as the selected chip.
- [ ] Closing/reopening the sheet preserves the selected performance value.

---

## Training Sheets

- [ ] Tapping Resistance opens the training day sheet.
- [ ] Adding kg/reps/RIR data marks Resistance in progress.
- [ ] Exercise entry sheet still opens from mobile exercise rows.
- [ ] Exercise entry sheet Next/Previous still works.
- [ ] Completing the day still marks the session done.
- [ ] Custom card opens the custom session sheet.
- [ ] BJJ card opens the BJJ sheet.

---

## Rest Mode

- [ ] Training header menu can switch to Rest.
- [ ] Rest mode hides training cards and shows the large rest/orb card.
- [ ] Rest card opens the breathing sheet.
- [ ] Switching back to Train restores training cards.
- [ ] If training data exists, Rest instead still asks for confirmation.
- [ ] Rest/orb ambient animation and tilt still work, or record as known debt if still broken.

---

## Persistence

- [ ] Readiness values persist after reload.
- [ ] Performance value persists after reload.
- [ ] In-progress training data persists after reload.
- [ ] Completed session persists after reload.
- [ ] LocalStorage writes do not clear unrelated profile/settings keys.

---

## Mobile Checks

- [ ] At `max-width:600px`, cards are single-column.
- [ ] Tap targets remain at least `44px`.
- [ ] Bottom nav does not overlap sheets or action bar.
- [ ] Safe-area padding still protects fixed bottom UI.
- [ ] Card captions do not overlap bottom action bar.

---

## Desktop Checks

- [ ] Desktop cards use the max-width/two-column layout where intended.
- [ ] Check-in card does not become full-width on desktop.
- [ ] Hover states are desktop-only; mobile does not get ghost hover expansion.
- [ ] Text does not overflow the card footer at common desktop widths.

---

## Known Risk Areas

- One-file architecture means shared CSS changes can affect readiness, training, reflect, and rest cards at once.
- `buildChips()` is shared across readiness and performance sheets; only performance should use `perfLabel(v)`.
- `_renderScSessionCard()` appends compact metadata dynamically. If a card is replaced manually, confirm the compact layer is recreated.
- The old notch-text rules in `docs/S-TRAINCARDS-AC.md` are legacy context for this experiment. Prefer `docs/DESIGN.md` and this checklist for current behavior.
