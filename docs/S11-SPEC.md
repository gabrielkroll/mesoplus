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
  Readiness                          ← full width

[ TRAINING  ]
  Resistance Training  |  Rest       ← 2×2 grid, equal cards
  BJJ                  |  Extra Training

[ REFLECT   ]
  Performance  |  Notes              ← 2 columns
```

Cards in Training section are equal size. No horizontal scroll — all four always visible. Resistance Training is position 1 (top-left). The 2×2 layout gives full situational awareness at a glance.

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
| BJJ | All key fields filled + user taps Finish *(stub in S11 — no sheet yet)* |
| Rest | One tap — immediate, no sheet |
| Extra Training | Any text entered |
| Performance | Chip selected *(stub in S11)* |
| Notes | Any text entered *(stub in S11)* |

---

## Done state display per card

| Card | Done shows |
|---|---|
| Readiness | Score + tier — e.g. "7.2 · High" |
| Resistance Training | "4 exercises · 28 sets" |
| BJJ | Technique + "Logged ✓" *(S12)* |
| Rest | "Rest ✓" |
| Extra Training | First line of what was entered |
| Performance | Perf value — e.g. "↑ Felt great" *(S13)* |
| Notes | First line of note *(S13)* |

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

---

## Action bar — role in the card world

The action bar is the **persistent session guide** — visible from anywhere in the app, in thumb reach. It reflects the current session state and guides the user through the day's sequence. It does NOT own completion. Completion lives inside each sheet via the Finish button.

The "Wrap up Day X" item in the action bar ··· menu: **evaluate during implementation** — may become redundant if Finish button handles completion. Do not remove blindly; verify the state machine first.

---

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

All seven cards with real sheets. No stubs. Existing inline UI lifted into the full-screen sheet pattern — no new logic, no new data model, just a new frame.

- [ ] Card dashboard layout on Train tab — three sections, seven cards
- [ ] Card visual states: not started / in progress / done / disabled
- [ ] Readiness card → existing readiness sheet (S7)
- [ ] Resistance Training card → existing training sheet (S6)
- [ ] Rest card → one-tap, immediate done, mutual exclusivity enforced
- [ ] BJJ card → existing BJJ activity block lifted into full-screen sheet
- [ ] Extra Training card → existing m-extra input lifted into full-screen sheet
- [ ] Performance card → existing chips-perf row lifted into full-screen sheet
- [ ] Notes card → existing m-notes input lifted into full-screen sheet
- [ ] Action bar updated to reflect card-based session identity
- [ ] Done state display per card (see done criteria table above)

## Out of scope for S11

- Visual polish and refinement of individual sheets → iterate after S11 ships
- S12 and S13 as originally defined are absorbed — no separate sheet-building slices needed
