# Meso+ — Product Decisions & Roadmap

> Source of truth for all product decisions. Update this when decisions change.

---

## What Meso+ is

A personal progressive overload training log for one athlete (Gabriel) who trains gym + BJJ. The app tracks daily sessions, suggests progressive overload, and syncs everything to Google Sheets as the database. Designed mobile-first as a PWA installed on iPhone.

**Not a fitness app for the general public** — not until V4.

---

## Guiding principles

- **Personal use protects quality** — no onboarding, no edge cases, no support burden through V2
- **Google Sheets is the database** — inspectable, portable, no backend costs
- **Single file, zero build** — any session can pick it up and ship in minutes
- **App suggests, athlete decides** — no auto-applying progression without user confirmation
- **Mobile-first always** — designed for iPhone, enhanced for desktop

---

## Terminology (agreed, non-negotiable)

| Term in app | What it means |
|---|---|
| **Microcycle** | Week within a mesocycle (shown as W1, W2…) |
| **Mesocycle** | A training block (Calibration → Overload → Push → Overreach → Peak → Deload) |
| **Macrocycle** | Full training year |
| **Phase** | Legacy term — being phased out in favour of microcycle language |
| **Gym Day** | Which template day within the week (A/B/C/D) |

---

## Login / data model (agreed per version)

| Version | Auth | Data persistence |
|---|---|---|
| V1 | Password gate | localStorage + Google Sheets |
| V2 | Password gate | localStorage + Sheets + CSV download. Open app = ephemeral, login = persists |
| V3/V4 | Real user accounts | Cloud database, multi-device |

**Personal use stays protected through V2. Public access only when the product is ready.**

---

## Roadmap

### V1 — Personal workout tracking + data foundation ✅ DONE

- [x] Daily logging loop — exercises, sets, reps, kg, RIR
- [x] Session types — Gym, BJJ + Gym, BJJ, Rest
- [x] Hardcoded Full Body ABCD template (4 days, auto-rotated)
- [x] Google Sheets sync (Apps Script + API key paths)
- [x] BJJ session logging (GC technique, positions, sparring, partner)
- [x] Readiness tracking — sleep, energy, soreness, performance
- [x] Mesocycle phase bar + progression phases
- [x] Progressive overload suggestions (last session + RIR delta)
- [x] Progress tab — volume/tonnage bars, session history, readiness chart
- [x] Analysis tab — Claude AI coach (scope + focus, last 8 sessions)
- [x] Password gate + in-app password change
- [x] Device transfer — QR code + signed token (2-min expiry)
- [x] Mobile-first redesign — bottom nav, exercise entry bottom sheet
- [x] WCAG AA — 44px tap targets, 16px inputs, chip sizing
- [x] Profile hub — Program + Setup drill-down on mobile

**V1 known debt:**
- Terminology still says "Phase" in some places — should be microcycle language
- Progress tab rated B — functional but not the V2 rebuild yet
- Analysis tab was spec'd as "skip for now" but built anyway — treat as bonus

---

### V2 — Adaptability + goal direction

**Template system**
- [ ] Template builder MVP — exercise name + muscle group only (no sets/reps yet)
- [ ] Smart day suggestion — "Last session was Day 2, Day 3 suggested"
- [ ] Primary / Secondary / Tertiary muscle tags in Setup

**Progress tab rebuild** (current is placeholder)
- [ ] Sets + volume per muscle group as primary metric
- [ ] Weight + rep progression per exercise (chart per exercise)
- [ ] Lifetime stats cards — total sets, total volume per muscle
- [ ] Personal bests — most weight, most reps per exercise
- [ ] Milestone tally with variable reward (coin flip celebration moment)

**Data model update**
- [ ] Open app = ephemeral data (no login required to browse)
- [ ] Login = data persists to localStorage + Sheets
- [ ] CSV download of all sessions

**Accessibility**
- [ ] Full WCAG AA audit pass

---

### V2.5 / V3 — Intelligence layer

- [ ] Full template builder — sets, rep ranges, RIR targets, progression rules per exercise
- [ ] Next-session recommendations — weight/reps based on last session + RIR drift
- [ ] RIR warning signals per muscle group (e.g. "Chest RIR dropping fast")
- [ ] Readiness trends — sleep, energy, soreness over time (visual)
- [ ] Microcycle + mesocycle count within macrocycle
- [ ] Training consistency — streaks, gaps, breaks
- [ ] AI-driven smart analysis (V2 data makes this actually useful)

---

### V4 — Product + go to market

- [ ] Real user accounts + proper auth
- [ ] Multi-device sync
- [ ] Onboarding flow for new users
- [ ] Template onboarding experience
- [ ] Go to market strategy

---

### Long game / V4+

- [ ] Macrocycle history over 10 years
- [ ] Training break classification
- [ ] Injury tracking + mitigation
- [ ] AAA accessibility exploration
- [ ] Coach view — share progress with a coach

---

## Progression model

- **Default:** weight % jump OR +1 rep per exercise, weekly or biweekly
- **Override:** pain flag or RIR dropping too fast = pause that muscle's progression
- **Principle:** app suggests, athlete decides — never auto-apply

---

## Session types

| Type | What it logs |
|---|---|
| **Gym** | Exercises, sets, reps, kg, RIR per superset |
| **BJJ + Gym** | Both gym exercises AND BJJ session fields |
| **BJJ** | GC technique, description, positions, partner, drilling, sparring, submissions, next focus |
| **Rest** | Readiness metrics only + inspirational quote |

All types log: sleep, energy, soreness, performance, extra training, notes.

---

## Key user flows

### Daily gym log
1. Open app → today is auto-selected
2. Tap session type (Gym)
3. Template loads for the day (A/B/C/D auto-rotated)
4. On mobile: tap exercise row → bottom sheet opens → enter kg/sets/reps/RIR → Next → Next → Complete day
5. On desktop: fill in-table inputs directly
6. Auto-saves to localStorage every input change
7. Auto-syncs to Sheets 10s after last change (if scriptUrl configured)

### BJJ log
1. Select BJJ or BJJ + Gym
2. Fill: GC technique (dropdown), description, positions (chips), partner, drilling, sparring good/bad, submissions, next focus
3. Complete day → syncs to Sheets columns W–AE

### Progress review
1. Tap Progress tab
2. Filter: Week / Month / Meso / Custom
3. See volume/tonnage per muscle, recent sessions, readiness chart

### Analysis
1. Tap Analysis tab
2. Select scope (last session / this week / full meso) + focus
3. Optionally paste CSV data from Sheets
4. Run analysis → Claude API responds in-app

---

## Out of scope (permanently)

- Social features
- Video / form check
- Nutrition tracking
- Apple Health / Garmin integration (until V4+)
- Notifications / reminders
