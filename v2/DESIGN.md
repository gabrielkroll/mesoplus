# Meso+ Design System
> Source of truth for V2. Read this before writing any component. Update it when decisions change.

---

## 1. Art Direction

Meso+ is a **serious personal training tool** for people who track with precision. It is not a fitness app — it is closer to a pilot's logbook or an athlete's notebook.

**Primary reference: Tobias van Schneider**
Restrained. Editorial. Dark. Every element earns its place. The design does not explain itself. The user is intelligent; the interface respects that.

**Secondary reference: KPR Brand Book (2022)**
- Black/white canvas first — colour only when it signals something
- Typography does the compositional work, not decoration
- Monospace for anything data-adjacent; personality type (serif) reserved for titles and editorial moments
- The grid is structural, not cosmetic — data tables and log blocks should feel like circuit components: modular, precise, technical

**What Meso+ is:**
- Data-forward. Dense where data lives, spacious where reading happens.
- Typographic. The hierarchy is carried by font choice and size, not colour or weight.
- Technical. Grid-aligned. Every layout decision maps to the spacing scale.
- Dark by default. Light mode is an adaptation, not the primary canvas.

**What Meso+ is not:**
- A SaaS dashboard (no boxed input fields everywhere, no blue primary buttons, no card shadows)
- Gamified (no progress bars with celebratory colours, no badges)
- Decorative (no gradients, no icons as decoration, no emojis)
- Generic (no system-default styles that could belong to any app)

---

## 2. Tokens

These are defined in `src/tokens/tokens.css`. Never hard-code values that exist as tokens.

### Colour
| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-ink` | `#1a1a1a` | `#e8e8e8` | Primary text |
| `--color-ink2` | `#555` | `#aaa` | Secondary text, labels |
| `--color-ink3` | `#767676` | `#8a8a8a` | Hints, placeholders, meta |
| `--color-lift` | `#fff` | `#141414` | Page background |
| `--color-surf` | `#f5f5f3` | `#1e1e1e` | Elevated surface (cards, code blocks) |
| `--color-line` | `#e0e0e0` | `#2a2a2a` | Borders, dividers |
| `--color-line2` | `#bbb` | `#444` | Stronger borders (focus, hover) |
| `--color-accent` | `#7aad2a` | `#7aad2a` | Active, selected, CTA signal only |
| `--color-accent-dim` | `#7aad2a14` | `#7aad2a14` | Accent fill (chips, selected rows) |
| `--color-danger` | `#d44040` | `#d44040` | Errors, destructive actions |

**Accent colour rule:** The green is a signal, never decoration. Use it only for:
- Active/selected state (nav item, chip, day pill)
- The one primary CTA on a screen
- Status dots (sync status, logged indicator)
- Focus ring (`outline: 2px solid var(--color-accent)`)

If you are reaching for accent to "make something look nice", stop.

### Typography
| Token | Value |
|---|---|
| `--font-mono` | `'DM Mono', monospace` |
| `--font-serif` | `'Instrument Serif', serif` |

**The body font is monospace.** This is intentional. Every label, value, placeholder, button, input — DM Mono. The app is a logbook; mono makes data feel precise.

**Serif is reserved for personality moments only:**
- Page title (28–32px italic)
- Section sub-headings inside setup/long-form views (18–20px italic) — e.g. "Claude AI", "Google Sheets"
- Week display number (44px italic in log)
- The wordmark (52px italic on login gate, 22px in nav)

Never use serif for labels, hints, body copy, buttons, or data.

### Typography Scale (exact V1 specs)
| Use | Size | Font | Style | Colour |
|---|---|---|---|---|
| Login/wordmark | 52px | serif | italic, tracking -.02em | ink |
| Nav wordmark | 22px | serif | italic, tracking -.02em | ink |
| Page title | 28–32px | serif | italic | ink |
| Sub-section title | 18–20px | serif | italic | ink |
| Week number (log) | 44px | serif | italic | ink |
| Section label | 9–10px | mono | uppercase, tracking .07–.08em | ink3 |
| Body / buttons | 11–13px | mono | normal | ink or ink2 |
| Hints / meta | 10–11px | mono | normal | ink3 |
| Phase RIR indicator | 10px | serif | italic | ink |

### Spacing
`--sp1: 4px` · `--sp2: 8px` · `--sp3: 12px` · `--sp4: 16px` · `--sp5: 24px` · `--sp6: 32px` · `--sp7: 48px`

### Radius
`--radius-sm: 4px` · `--radius-md: 8px` · `--radius-lg: 16px` · `--radius-xl: 24px`

In V1: buttons use `border-radius: 4px` (radius-sm). Cards use `border-radius: 8px` (radius-md). Prefer these two — no large radius except for modals/sheets.

---

## 3. Input Contract

**The standard input in Meso+ has no box.** It is a bottom-border only field.

```css
/* The .bare pattern from V1 — use this in all settings/form contexts */
background: none;
border: none;
border-bottom: 1px solid var(--color-line);
padding: 5px 0;
font-family: var(--font-mono);
font-size: 13px;
color: var(--color-ink);
outline: none;
width: 100%;
transition: border-color 0.12s;
```
```css
/* Focus state */
border-bottom-color: var(--color-line2);
/* or accent if it's a primary field */
```

**Exception — entry point screens (login gate, transfer import):** These use a box input because the user is outside the app context and needs more affordance. `border: 1px solid var(--color-line); border-radius: 6px; padding: 10px 12px;`

**V2 drift to fix:** V2 components currently use `background: var(--color-surf); border: 1px solid var(--color-line); border-radius: 8px` for form fields inside settings — this is wrong. Profile/setup fields should use the bare bottom-border style.

---

## 4. Button Vocabulary

Exactly three variants. Do not add more.

| Variant | Class (V1) | Component (V2) | When |
|---|---|---|---|
| **Primary** | `.btn-s` | `<Button variant="primary">` | One per screen. The main action. |
| **Outline** | `.btn-o` | `<Button variant="ghost">` | Secondary actions, alongside primary. |
| **Danger** | — | `<Button variant="danger">` | Destructive only. Log out, delete, reset. |
| **Text** | `.btn-t` | Inline `<button>` with link style | Tertiary, contextual. e.g. "Reset sync history" |

**Specs (V1 exact):**
- Primary: `background: var(--ink); color: var(--lift); font-family: mono; font-size: 11px; padding: 8px 18px; border-radius: 4px`
- Outline: `background: none; border: 1px solid var(--line); color: var(--ink2); font-size: 11px; padding: 7px 14px; border-radius: 4px`
- Both: mono, no icon unless the icon is the entire button label. Hover: outline border darkens to `line2`, primary dims to 85% opacity.

---

## 5. Component Contracts

### Cards / Sections
```css
border: 1px solid var(--color-line);
border-radius: 8px;
padding: 14px 16px;
```
No shadow. No surface background unless it's a code block. The border is enough.

### Section Label (heading above a block)
```
font-size: 9–10px
font-family: mono
text-transform: uppercase
letter-spacing: .07–.08em
color: var(--color-ink3)
margin-bottom: 12px
```

### Sub-section Title (named group inside a long settings view)
```
font-family: serif
font-style: italic
font-size: 18–20px
color: var(--color-ink)
margin-bottom: 4px
```
Followed by a subtitle in 11px mono ink3 (description/instruction).

### Chips (filter toggles, type selectors)
```
border: 1px solid var(--color-line)
border-radius: 4px
font-size: 11px, mono
padding: 5px 11px
```
Active state: `border-color: accent; color: accent; background: accent-dim` + 5px dot `::before`.

### Nav (bottom navigation in V2)
Active item: accent colour icon + label. Inactive: ink3. No background fill on active item.

### Status dots
3px–5px circle, `background: var(--color-accent)`. Used for: logged indicator on day pill, sync status.

---

## 6. Layout Principles

**Data density first, breathing room second.** The log view should feel like a spreadsheet — tight, structured, scannable. The stats and analysis views can breathe more.

**The grid is structural.** Week views, exercise tables, superset blocks — these are the "computer chip" elements. They should feel modular and precise, not card-stacked.

**Sticky nav.** The week nav in the log sticks. The bottom nav sticks. Nothing else.

**16px horizontal padding** on all page content. Consistent, never less.

**Section spacing:** `padding: 16px 16px 0` per section, with bottom padding on the last section to clear the nav (`calc(72px + env(safe-area-inset-bottom))`).

---

## 7. V1 → V2 Translation Table

| V1 pattern | V2 equivalent | Notes |
|---|---|---|
| `.bare` input | `FieldInput` with bottom-border CSS | V2 currently uses boxed — needs fixing |
| `.btn-s` | `<Button variant="primary">` | Match: ink bg, lift text |
| `.btn-o` | `<Button variant="ghost">` | Match: outline, ink2 |
| `.btn-t` | inline `<button className={styles.resetLink}>` | Text-only, underline |
| `.card-label` | `.sectionTitle` | Match: 9–10px uppercase mono ink3 |
| Serif sub-heading | `.sectionSub` or new `.subHeading` class | V2 currently only has mono caps — needs serif italic option |
| `.chip.on` | `<Chip active>` | Match including `::before` dot |
| `.meso-card` | card div with border + r8 | Match |
| `--ink/ink2/ink3` | `--color-ink/ink2/ink3` | Same values, just prefixed |
| `--mono/--serif` | `--font-mono/--font-serif` | Same values |

---

## 8. KPR Influence — What to Absorb Over Time

KPR (see brand book) shares the same typographic-editorial-dark philosophy. Specific elements to weave in as V2 matures:

- **Grid as texture:** The week log grid and exercise tables can use subtle grid lines (the `--color-line` at low opacity) to create the "KPR grid" editorial texture
- **IBM Plex Mono → DM Mono:** Already aligned. Both mono-for-data.
- **ABC Whyte Inktrap → Instrument Serif:** Different flavour (geometric vs. humanist), but same editorial tier. Meso+ keeps Instrument Serif; its humanity fits the personal log context.
- **Hexaframe CF → nothing (yet):** KPR's display type has no direct equivalent. If Meso+ ever needs a display element (marketing, onboarding), this is the direction — something eccentric and bold.
- **"Computer Chip" pattern:** Exercise superset blocks, the log grid, the phase bar — lean into their modular/technical feel. They are Meso+'s circuit board.
- **Typography-only compositions:** Analysis output, empty states — these should work as typographic compositions. No illustration, no icon decoration.

---

## 9. V2 Parity Backlog

Gaps between V1 quality and current V2 state, roughly prioritised:

| Priority | Area | Gap | Status |
|---|---|---|---|
| P1 | Profile inputs | Boxed inputs → bare bottom-border style | Open |
| P1 | Sub-section headings | Missing serif italic sub-titles ("Claude AI", "Google Sheets") | Open |
| P2 | Log page | Week view density, day pill spec, week number 44px serif | Partial |
| P2 | Log page | Exercise table grid feel | Open |
| P2 | Button atom | Padding/radius exact match to V1 | Open |
| P3 | Stats page | Section label sizing, chart colours | Open |
| P3 | Analysis page | Empty state as typographic composition | Open |
| P3 | Global | Font size baseline 13px body, consistent across all pages | Open |

---

## 10. Process Rules

1. **Read this file first.** Before writing any new component, read sections 3–6.
2. **Check V1 before deciding.** If uncertain how something should look, grep `index.html` for the V1 equivalent.
3. **Tokens only.** Never hard-code colours, fonts, or spacing that exist as tokens.
4. **One new variant max per session.** If you find yourself creating a new button variant or input style, stop and check if an existing one can be adapted.
5. **Update the backlog.** When a parity gap is closed, mark it done in section 9.
6. **Update this document.** When a design decision changes, update the relevant section here.
