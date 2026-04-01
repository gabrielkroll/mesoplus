/**
 * Look back through sessions to find the most recent logged set for a given
 * exercise name. Returns { kg, reps, rir, date } or null.
 */
export function getLastSet(sessions, exName) {
  if (!sessions?.length || !exName) return null

  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date))

  for (const sess of sorted) {
    if (!sess.supersets) continue
    for (const ss of sess.supersets) {
      for (const ex of ss.exercises) {
        if (ex.name === exName && (ex.kg || ex.reps)) {
          return {
            kg:   ex.kg   || null,
            reps: ex.reps || null,
            rir:  ex.rir  || null,
            sets: ex.sets || null,
            date: sess.date,
          }
        }
      }
    }
  }

  return null
}
