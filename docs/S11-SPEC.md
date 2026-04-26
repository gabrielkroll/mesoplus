# S11 — Train Tab: Card Shell

> Design spec — read before touching any code.
> All decisions here are agreed and final unless explicitly re-discussed in a new session.

---

## Concept

The Train tab becomes a **session brief** — a set of cards, each representing one task for the day. Tap a card, complete the task in its full-screen sheet, close it, and the card reflects what you achieved. Sequential, not simultaneous.

The week/day navigator at the top stays exactly as-is. **No changes to the navigator.**

---

## Layout — three sections

```
[ CHECK-IN  ]
  Readiness

[ TRAINING  ]                    ← section title replaces old "SESSION"
  Resistance  |  Custom
  BJJ         |  Rest

[ REFLECT   ]
  Performance  |  Notes
```

All cards equal size — including Readiness. No exceptions. No horizontal scroll — all always visible. Section renamed "Session" → "Training". Card labels short — section title carries the context. Extra Training removed — Apple Watch covers it, `m-extra` preserved in data model.

---

## Card states — three per card, no animation

Cards change face on state change only. No flip animation.

| State | Visual |
|---|---|
| Not started | Card at full opacity, label + prompt text, neutral |
| In progress | Accent dot (lime, small) top-right corner + partial info on card face |
| Done | Achievement stats on card face in accent color — no dot needed, stats are the signal |
| Disabled | Full card at ~40% opacity, not tappable (pointer-events none) — stays visible in grid |

No new color tokens. No border changes. No background tints. Dot and opacity only.

---

## Done criteria per card

| Card | Done when |
|---|---|
| Readiness | Sleep + energy + soreness chips all selected |
| Resistance Training | All exercises have kg + sets + reps filled **and** user taps Finish |
| BJJ | All key fields filled + user taps Finish |
| Rest | One tap — immediate, no sheet |
| Custom Training | Any exercises logged + user taps Finish |
| Performance | Chip selected |
| Notes | Any text entered |

---

## Done state display per card

| Card | Done shows |
|---|---|
| Readiness | Score + tier — e.g. "7.2 · High" |
| Resistance Training | "4 exercises · 28 sets" |
| BJJ | Technique + one key stat (refine after build) |
| Rest | "Rest ✓" |
| Custom Training | "X exercises · Y sets" |
| Performance | Perf value — e.g. "↑ Felt great" |
| Notes | First line of note |

---

## Completion mechanism

- **Finish button** (already exists at bottom of training sheet) = completion trigger → card goes to done state
- **× close** = exit without completing → card stays in-progress, re-openable
- **Re-openable**: every card can be re-opened to edit or complete, regardless of state
- Closing or backgrounding the app without tapping Finish = in-progress (no data lost)

---

## Rest mutual exclusivity

- Rest done → Resistance Training and BJJ cards disabled
- Any training card in-progress or done → Rest card disabled
- Resistance Training done → BJJ still available (BJJ+Gym days)

---

## Non-MECE by design

All cards visible all day. Done cards stay visible — they tell the day's story. The Training section is intentionally non-MECE except for the Rest rule above.

## No card is required

Every card is optional. The action bar guides the user through the sequence after training but does not enforce completion. A day is never blocked by an unfilled card.

---

## Action bar — role in the card world

The action bar is the **persistent session guide** — visible from anywhere in the app, in thumb reach. It reflects the current session state and guides the user through the day's sequence. It does NOT own completion. Completion lives inside each sheet via the Finish button.

**Action bar logic is frozen — no changes.** The nine-state machine built in S6/S7 stays exactly as-is. S11 does not touch action bar behavior, states, or logic. The only addition: `renderCards()` is called alongside `renderActionBar()` so both stay in sync.

## Shared state architecture — cards and action bar

Cards and action bar are two views of the same computed state. Neither interprets `S` independently.

```
S  (global state object — single source of truth)
 └── computeCardStates()   ← one function, reads S once, returns state of all 7 cards
      ├── renderCards()    ← renders the card grid on the Train tab
      └── renderActionBar() ← renders the floating pill
```

`markDirty()` already triggers `renderActionBar()`. S11 adds `renderCards()` to the same call.

`computeCardStates()` returns one object with the state of every card:
- `state`: `'not-started'` | `'in-progress'` | `'done'` | `'disabled'`
- Card-specific data for the done display (score, sets count, first line of text, etc.)

No state duplication. No two places computing the same thing differently.

---

---

## Session brief — removed

The `#session-brief` block (readiness score + coaching text shown above the Rest/Train toggle) is removed in S11. It was a bridge between two inline sections that no longer exist in the card world. The coaching text already lives in the training sheet's TODAY'S TARGET block — the right place, at the right moment.

---

## What S11 explicitly does NOT change

- Week/day navigator — no touch
- Training sheet internals (exercises, supersets, adopt bar, Tab key navigation)
- Readiness sheet internals (chips, score, tier)
- The Plan tab
- The Summary tab
- The Insights tab
- Profile / Setup
- Any other working feature not listed in S11 scope

If something not listed here feels like it needs changing while implementing S11 — **stop, discuss, scope it as a separate slice or explicit addition before touching it.**

---

## S11 scope (this slice only)

All six cards with real sheets. Existing inline UI lifted into the full-screen sheet pattern — no new logic, no new data model, just a new frame.

- [ ] Card dashboard layout — three sections, six cards, 2×2 Training grid
- [ ] Card visual states: not started / in progress / done / disabled
- [ ] Readiness card → existing readiness sheet (S7)
- [ ] Resistance Training card → existing training sheet (S6)
- [ ] Custom Training card → existing custom activity block lifted into full-screen sheet
- [ ] BJJ card → existing BJJ activity block lifted into full-screen sheet
- [ ] Rest card → one-tap, immediate done, mutual exclusivity enforced
- [ ] Performance card → existing chips-perf row lifted into full-screen sheet
- [ ] Notes card → existing m-notes input lifted into full-screen sheet
- [ ] `m-extra` field removed from UI (data preserved in data model)
- [ ] Session brief (`#session-brief`) removed
- [ ] `computeCardStates()` — single state source consumed by both renderCards() and renderActionBar()
- [ ] Done state display per card (see done criteria table above)

## Out of scope for S11

- Visual polish and refinement of individual sheets → iterate after S11 ships
- S12 and S13 as originally defined are absorbed — no separate sheet-building slices needed
