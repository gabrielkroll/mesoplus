// ── Readiness scoring — mirrors V1 constants ─────────────────────────────────

export const SLEEP_OPTIONS = ['≤5.5h', '6h', '6.5h', '7h', '7.5h', '8h', '≥8.5h']
export const ENERGY_OPTIONS = ['Drained', 'Low', 'Moderate', 'Good', 'Charged']
export const SORENESS_OPTIONS = ['Wrecked', 'Heavy', 'Moderate', 'Mild', 'Fresh']

export const SLEEP_SCORE   = { '≤5.5h': 20, '6h': 38, '6.5h': 55, '7h': 70, '7.5h': 83, '8h': 93, '≥8.5h': 100 }
export const ENERGY_SCORE  = { 'Drained': 20, 'Low': 42, 'Moderate': 62, 'Good': 82, 'Charged': 100 }
export const SORENESS_SCORE = { 'Wrecked': 20, 'Heavy': 42, 'Moderate': 62, 'Mild': 82, 'Fresh': 100 }

/** Weighted composite readiness 0-100 */
export function readinessScore(sleep, energy, soreness) {
  const s = SLEEP_SCORE[sleep]   || 0
  const e = ENERGY_SCORE[energy] || 0
  const o = SORENESS_SCORE[soreness] || 0
  if (!s && !e && !o) return null
  const filled = (s ? 1 : 0) + (e ? 1 : 0) + (o ? 1 : 0)
  // Partial: weight only filled fields proportionally
  const sum = s * 0.4 + e * 0.35 + o * 0.25
  const maxWeight = (s ? 0.4 : 0) + (e ? 0.35 : 0) + (o ? 0.25 : 0)
  return Math.round(sum / maxWeight)
}

/** Human label for a 0-100 readiness score */
export function readinessLabel(score) {
  if (score == null) return ''
  if (score >= 80) return 'High'
  if (score >= 55) return 'Moderate'
  if (score >= 30) return 'Low'
  return 'Very low'
}
