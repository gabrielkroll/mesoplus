# Meso+ — Design System

---

## Design language

Meso+ uses a minimal, typographic aesthetic. No icons beyond SVG nav icons. No illustrations. The design communicates precision and focus — like a training notebook, not a consumer fitness app.

**References:** Apple HIG (sheet patterns, tap targets), Linear (density, mono type), Notion (calm productivity)

---

## Typography

| Role | Font | Style | Size |
|---|---|---|---|
| Wordmark | Instrument Serif | Italic | 22px (nav), 52px (login) |
| Section headings | Instrument Serif | Italic | 20–32px |
| Big numbers (W1, 44) | Instrument Serif | Italic | 38–44px |
| Exercise sheet name | Instrument Serif | Italic | 24px |
| Body / UI text | DM Mono | Regular 400 | 13px desktop, 14px mobile |
| Labels, metadata | DM Mono | Regular 400 | 9–11px |
| Input text | DM Mono | Regular 400 | 16px minimum (prevents iOS zoom) |
| Exercise sheet inputs | DM Mono | Light 300 | 26px |

**Rule:** Instrument Serif is italic always. Never use it upright. DM Mono handles all functional text.

---

## Color system

```css
/* Light mode */
--ink:  #1a1a1a    /* primary text */
--ink2: #555       /* secondary text, labels */
--ink3: #999       /* tertiary, placeholders, metadata */
--line: #e0e0e0    /* borders, dividers */
--line2: #bbb      /* stronger borders, focus states */
--surf: #f5f5f3    /* card/chip/row backgrounds */
--lift: #fff       /* page background */

/* Dark mode (auto via prefers-color-scheme) */
--ink:  #e8e8e8
--ink2: #aaa
--ink3: #666
--line: #2a2a2a
--line2: #444
--surf: #1e1e1e
--lift: #141414
--danger-bg: #2a0808

/* Brand (same in both modes) */
--accent:  #7aad2a    /* green — active, success, accent */
--adim:    #7aad2a14  /* green at 8% opacity — active chip bg */
--danger:  #d44040    /* red — errors, warnings, destructive */
--danger-bg: #fff0f0  /* red at ~6% opacity — light mode */
```

**Accent green (#7aad2a)** is used for:
- Active nav items (border-bottom, text color)
- Active chips (border + text + ::before dot)
- Active day pills
- Suggestion / adoption UI
- Save success messages
- Progress bars

**Danger red (#d44040)** is used for:
- Error messages
- Flagged exercise icon (active)
- Destructive action hover states
- Log out button text

---

## Spacing system

```css
--sp1: 4px
--sp2: 8px
--sp3: 12px
--sp4: 16px
--sp5: 24px
--sp6: 32px
--sp7: 48px
```

Use these tokens. Don't hardcode pixel values for spacing unless there's a specific reason.

---

## Component patterns

### Chip (`.chip`)
Used for readiness selections (sleep, energy, soreness, performance).

```
Default:  border: 1px solid --line,  color: --ink2,  bg: none
Active:   border: --accent, color: --accent, bg: --adim, ::before dot
Mobile:   padding: 10px 14px, min-height: 44px, font-size: 12px
Desktop:  padding: 5px 11px, font-size: 11px
```

Active chips show a 5px green dot before the label (via `::before`).

### Day pill (`.dpill`)
Small calendar pill for the week nav.

```
States: default, today (darker border), on (accent), future (25% opacity), logged (dot indicator)
```

### Button hierarchy

| Class | Use case | Appearance |
|---|---|---|
| `.btn-s` | Primary action | Solid dark bg, white text |
| `.btn-o` | Secondary action | Outlined |
| `.btn-t` | Tertiary / ghost | No border, muted text |
| `.btn-ghost` | Inline text action | Underlined |

All buttons: `min-height: 44px` on mobile.

### Nav items

**Desktop top nav (`.nl`):**
- Subtle text button with bottom border active state
- Active: `color: --accent, border-bottom: 2px solid --accent`

**Mobile bottom nav (`.bnav-item`):**
- Fixed bottom bar, 52px height, icon + label
- Active: `color: --accent`
- Safe area: `padding-bottom: env(safe-area-inset-bottom, 0)`

### Settings rows (`.s-row`)

Two-column grid on desktop: `160px label | 1fr content`
Single column on mobile (stacked).

### Settings hub (mobile)

Navigation table rows with chevron `›`:
- Min height: 56px
- Label: 13–14px ink
- Subtitle: 10–11px ink3
- Hover/active: `--surf` background

### Exercise table

Fixed-layout table. Column widths defined via `colgroup`. On mobile, data-entry columns are hidden (`.c-kg-td`, `.c-reps-td`, etc.) — entry happens via the bottom sheet.

Exercise rows (`.ex-row`) are tappable on mobile — tap highlight + active background.

### Exercise entry sheet

iOS-style bottom sheet:
- Border radius: 14px 14px 0 0
- Handle: 36×5px pill, `--line2` colour
- Animation: `transform: translateY(100% → 0)`, 320ms, `cubic-bezier(0.32, 0.72, 0, 1)`
- Swipe-down dismiss: 80px threshold
- Backdrop: `rgba(0,0,0,.45)` + `backdrop-filter: blur(3px)`
- Inputs: 26px font, `--surf` background, 8px border-radius, 14px vertical padding

---

## Layout

### Desktop
- Max width: 900px, centered, 20px 16px padding
- Top sticky nav bar
- Inline exercise table with all columns visible

### Mobile (`max-width: 600px`)
- Top nav hidden
- Bottom nav shown
- Content padding: 16px 16px 88px (extra bottom for nav bar)
- Exercise data columns hidden (`.c-*-td`)
- Exercise entry via bottom sheet
- Progress grid: single column
- Analysis selects: stacked

### Safe areas (iPhone notch / home indicator)
- Bottom nav: `padding-bottom: env(safe-area-inset-bottom, 0)`
- Bottom bar: `padding-bottom: calc(16px + env(safe-area-inset-bottom, 0))`
- Exercise sheet: `padding-bottom: env(safe-area-inset-bottom, 0)`

---

## Interaction patterns

### Active states
- Chips, pills, nav items: color shift to `--accent`
- Buttons: opacity 0.8 hover / background `--surf` hover
- Table rows on mobile: `--surf` background on `:active`

### Tap targets (WCAG AA)
- Minimum 44×44px on all interactive elements on mobile
- Chips: `min-height: 44px, padding: 10px 14px`
- Buttons: `min-height: 44px`
- Day pills: `min-height: 44px, padding: 8px 4px`
- Bottom nav items: 52px height
- Exercise sheet buttons: 52px height

### Save feedback
- Bottom-left save indicator: `Auto-saved · HH:MM` (ink3)
- On success: `Synced ✓` (accent green)
- On error: `Sync error: …` (danger red)
- Auto-clears after 3s

### Transitions
- Color/background transitions: 0.12s ease (most interactive elements)
- Bottom sheet open/close: 0.32s `cubic-bezier(0.32, 0.72, 0, 1)`
- Backdrop fade: 0.25s
- Undo button appearance: instant

---

## Icon style

Only 4 SVG icons used (in bottom nav):
- Calendar (Log tab) — rect + lines
- Pulse/activity (Progress tab) — polyline waveform
- Bar chart (Analysis tab) — vertical bars
- Person (Profile tab) — circle head + arc body

Specs: `viewBox="0 0 24 24"`, `stroke-width="1.8"`, `stroke-linecap/linejoin="round"`, no fill, `width/height="22"`.

No icon library. Keep it that way — add SVGs inline only as needed.

---

## Dark mode

Automatic via `@media (prefers-color-scheme: dark)`. All colors are CSS variables — dark mode overrides the root variables. No JavaScript involved.

Note: `color-scheme: dark` is set on `body` — this forces dark system UI (scrollbars, date pickers). Consider moving to `:root` and making it conditional in future.

---

## Responsive breakpoints

| Breakpoint | What changes |
|---|---|
| `max-width: 600px` | Mobile layout — bottom nav, sheet entry, stacked grids |
| `min-width: 601px` | Desktop — top nav, inline table, profile card stripped |
| `max-width: 640px` | Progress grid goes single column (slightly wider than mobile break) |

---

## Design anti-patterns to avoid

- No drop shadows (except profile menu popup)
- No gradients
- No illustrations or decorative images
- No coloured backgrounds on sections (use `--surf` only for cards/quads)
- No Instrument Serif upright — always italic
- No font sizes below 9px
- No tap targets below 44px on mobile
- No auto-adopting user data without explicit confirmation
