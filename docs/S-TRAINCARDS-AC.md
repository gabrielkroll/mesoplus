# S-TrainCards — Immutable Acceptance Criteria

These ACs define what the S-TrainCards Readiness card **must always preserve**.
No implementation, refactor, or fix may violate these. When in doubt: check here first.

---

## 1. Shape & Geometry

- The card has two corner cut-out notches — top-left (label) and bottom-right (status)
- Notch edges are hard diagonal cuts, not rounded or shadowed
- Both notches are **dynamically sized** to fit their text content — never hardcoded pixel widths
- The SVG fill path and border path are the only shape primitives — no CSS border tricks
- Card aspect ratio is 430:380. The full background image bleeds edge to edge
- `overflow:hidden` always clips card contents — nothing may visually escape the card boundary

## 2. Three States — Content Is Fixed

| State | Trigger | Bottom-right notch shows |
|---|---|---|
| **Empty** | No readiness data for today | "How are you feeling?" |
| **Default** | Data logged | Score · Tier (e.g. `68 · LOW`) |
| **Peek** | Long press held | `sleep VALUE · energy VALUE · soreness VALUE` |

- Score and tier are the only values in the default notch — no additional metrics
- Peek surfaces the three sub-metrics (sleep, energy, soreness) — the values not visible on the card face
- The empty CTA is a prompt, not a score — it must never show numbers

## 3. Gesture Vocabulary

These gestures are locked. Do not add, merge, or remap them.

| Gesture | Action |
|---|---|
| **Tap** | Opens the readiness sheet |
| **Hold (400ms)** | Peek — notch expands, shows sleep/energy/soreness |
| **Release from hold** | Collapses back to default state |
| **Swipe during hold** | Cancels peek, no sheet open |

- Tap and hold are **distinct** — releasing a hold must never open the sheet
- The long-press threshold is 400ms (iOS Haptic Touch standard)
- A `_justPeeked` flag (or equivalent) must guard the click handler after hold release

## 4. Animation

- **Entrance**: label slides in from left (`clip-path` right-to-left), status slides in from right
- **Notch morph**: SVG path interpolates between collapsed and expanded coordinates (`animatePaths`)
- **Expand**: `def` fades out (80ms), `expEl` slides in from right (100ms, after 160ms delay)
- **Collapse**: `expEl` fades out (80ms), `def` fades in (100ms, after 80ms delay)
- Duration: **260ms**, easing: spring (`cubic-bezier(0.34,1.56,0.64,1)` or equivalent)
- No full-card transform (`scale`, `translate`) — transforms on the card element break layout

## 5. Visual Identity

These values must not drift:

```
Score text:      #e8e8e8   (near-white)
Tier text:       #7aad2a   (green — matches --accent)
Peek keys:       #666      (dim label)
Peek values:     #7aad2a   (green)
Separators:      #444
Font:            DM Mono, 9px, letter-spacing 0.08em, uppercase
```

- The card face is always dark (`#141414` background, full-bleed image on top)
- No light-mode variant for this card — it is intentionally dark regardless of system theme

## 6. Platform Constraints

- `touch-action: manipulation` — required on `.sc-train-card` to prevent iOS from stealing the touch sequence
- `-webkit-touch-callout: none` — suppresses iOS native callout on long press
- `-webkit-user-select: none` — suppresses text selection magnifier
- No double-tap zoom — handled by `touch-action: manipulation`
- Minimum tap target: the full card face (no sub-regions)

## 7. State Management Rule

There is one authoritative render function for visual state. It is the only place that sets:
- `opacity` on `def` and `expEl`
- `clip-path` on `def`, `expEl`, `cta`, and `lbl`
- `display` on `def` and `cta`

No other function may set these properties directly. Animation callbacks may call `render()` on completion — they may not set properties themselves.

---

## What Is Explicitly Out of Scope

- Card-level zoom/scale on interaction (never specced, breaks layout)
- Hover states on mobile (suppressed with `(hover:hover)` media query guard)
- Any state beyond the three above (no "loading", no "error", no "expanded-full")
- Haptic feedback (not implemented — do not add without explicit AC)
