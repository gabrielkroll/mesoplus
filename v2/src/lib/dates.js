// ── Date utilities ────────────────────────────────────────────────────────────

/** YYYY-MM-DD for today */
export const today = () => new Date().toISOString().split('T')[0]

/** Monday of the week containing dateStr */
export function getMonday(dateStr) {
  const d   = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

/** Sunday of the week containing dateStr */
export function getSunday(dateStr) {
  const mon = getMonday(dateStr)
  const d   = new Date(mon + 'T12:00:00')
  d.setDate(d.getDate() + 6)
  return d.toISOString().split('T')[0]
}

/** Add days to a YYYY-MM-DD string */
export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

/** ISO week number (1-53) */
export function isoWeek(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const jan4 = new Date(d.getFullYear(), 0, 4)
  const startOfWeek1 = new Date(jan4)
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
  const diff = d - startOfWeek1
  return Math.floor(diff / (7 * 86400000)) + 1
}

/** Number of full weeks between two YYYY-MM-DD strings (a before b) */
export function weeksBetween(a, b) {
  const da = new Date(a + 'T12:00:00')
  const db = new Date(b + 'T12:00:00')
  return Math.floor((db - da) / (7 * 86400000))
}

/**
 * Given mesoStart and phases array, return { phaseIdx, weekInPhase, weekInMeso }
 * for a given date. Returns null if before mesoStart.
 */
export function mesoPosition(dateStr, mesoStart, phases) {
  if (!mesoStart || !phases?.length) return null
  const weeks = weeksBetween(mesoStart, getMonday(dateStr))
  if (weeks < 0) return null

  let cursor = 0
  for (let i = 0; i < phases.length; i++) {
    const w = phases[i].weeks || 1
    if (weeks < cursor + w) {
      return { phaseIdx: i, weekInPhase: weeks - cursor + 1, weekInMeso: weeks + 1 }
    }
    cursor += w
  }
  // Past end of defined phases — stay in last
  const last = phases.length - 1
  return { phaseIdx: last, weekInPhase: weeks - cursor + (phases[last].weeks || 1) + 1, weekInMeso: weeks + 1 }
}

/** Format YYYY-MM-DD as "Mon D" e.g. "Apr 1" */
export function fmtShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Format YYYY-MM-DD as weekday abbreviation e.g. "Mon" */
export function fmtWeekday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

/** All 7 days of the week containing dateStr (Mon–Sun) */
export function weekDays(dateStr) {
  const mon = getMonday(dateStr)
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i))
}
