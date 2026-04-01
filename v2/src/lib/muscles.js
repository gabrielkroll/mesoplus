// ── Muscle constants — mirrors V1 ─────────────────────────────────────────────

export const MUSCLES = [
  'Traps', 'Delts', 'Stability', 'Chest', 'Biceps', 'Triceps',
  'Forearms', 'Grip', 'Abs', 'Back', 'Glutes', 'Quads', 'Hamstrings', 'Calves',
]

/** Min (MEV) and Max (MRV) weekly sets per muscle */
export const MUSCLE_TARGETS = {
  Traps:      { mev: 0,  mrv: 16 },
  Delts:      { mev: 6,  mrv: 22 },
  Stability:  { mev: 0,  mrv: 20 },
  Chest:      { mev: 6,  mrv: 22 },
  Biceps:     { mev: 6,  mrv: 20 },
  Triceps:    { mev: 6,  mrv: 18 },
  Forearms:   { mev: 4,  mrv: 16 },
  Grip:       { mev: 0,  mrv: 12 },
  Abs:        { mev: 0,  mrv: 16 },
  Back:       { mev: 8,  mrv: 22 },
  Glutes:     { mev: 0,  mrv: 16 },
  Quads:      { mev: 6,  mrv: 18 },
  Hamstrings: { mev: 4,  mrv: 16 },
  Calves:     { mev: 6,  mrv: 20 },
}

export const MUSCLE_DISPLAY = {
  Traps: 'Traps', Delts: 'Delts', Stability: 'Stability', Chest: 'Chest',
  Biceps: 'Biceps', Triceps: 'Triceps', Forearms: 'Forearms', Grip: 'Grip',
  Abs: 'Abs', Back: 'Back', Glutes: 'Glutes', Quads: 'Quads',
  Hamstrings: 'Hams', Calves: 'Calves',
}

/**
 * Sum sets per muscle for a given array of sessions.
 * Counts primary muscle fully, secondary muscle at 0.5.
 */
export function getMuscleSetTotals(sessions) {
  const totals = Object.fromEntries(MUSCLES.map(m => [m, 0]))
  for (const sess of sessions) {
    if (!sess.supersets) continue
    for (const ss of sess.supersets) {
      for (const ex of ss.exercises) {
        const sets = Number(ex.sets) || 0
        if (ex.muscle && totals[ex.muscle] !== undefined)   totals[ex.muscle]   += sets
        if (ex.muscle2 && totals[ex.muscle2] !== undefined) totals[ex.muscle2]  += sets * 0.5
      }
    }
  }
  return totals
}

/**
 * Sum set goals per muscle across all 4 days, using setGoals store data
 * and TEMPLATES to know which muscles each exercise hits.
 */
export function getWeeklyMuscleGoals(setGoals, templates) {
  const totals = Object.fromEntries(MUSCLES.map(m => [m, 0]))
  for (let day = 1; day <= 4; day++) {
    const goals = setGoals[day] || {}
    const dayTemplate = templates[day] || []
    for (const ss of dayTemplate) {
      for (const ex of ss.exercises) {
        const sets = goals[ex.name] ?? ex.sets
        if (ex.muscle && totals[ex.muscle] !== undefined)   totals[ex.muscle]   += sets
        if (ex.muscle2 && totals[ex.muscle2] !== undefined) totals[ex.muscle2]  += sets * 0.5
      }
    }
  }
  return totals
}
