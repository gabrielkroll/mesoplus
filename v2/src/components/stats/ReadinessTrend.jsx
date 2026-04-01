import { useMemo } from 'react'
import { today, addDays, fmtShort } from '../../lib/dates'
import { readinessScore } from '../../lib/readiness'
import styles from './ReadinessTrend.module.css'

/**
 * ReadinessTrend — sparkline / full trend chart for readiness scores.
 *
 * @param {object[]} sessions
 * @param {boolean}  [mini]  - sparkline mode for card preview
 */
export default function ReadinessTrend({ sessions, mini = false }) {
  const days = mini ? 7 : 14
  const dates = useMemo(
    () => Array.from({ length: days }, (_, i) => addDays(today(), -(days - 1) + i)),
    [days]
  )

  const sessMap = useMemo(
    () => Object.fromEntries((sessions || []).map(s => [s.date, s])),
    [sessions]
  )

  const points = dates.map(d => {
    const s = sessMap[d]
    return s ? readinessScore(s.sleep, s.energy, s.soreness) : null
  })

  const hasData = points.some(p => p != null)

  if (!hasData) {
    return mini ? null : <p className={styles.empty}>No readiness data yet.</p>
  }

  // SVG sparkline
  const W = mini ? 80 : 280
  const H = mini ? 24 : 60
  const pad = mini ? 2 : 8
  const filled = points.map((p, i) => ({ x: i, y: p })).filter(pt => pt.y != null)

  const xs = (i) => pad + (i / (days - 1)) * (W - pad * 2)
  const ys = (v) => H - pad - ((v - 0) / 100) * (H - pad * 2)

  const linePath = filled.length > 1
    ? filled.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${xs(pt.x)} ${ys(pt.y)}`).join(' ')
    : null

  if (mini) {
    return (
      <svg className={styles.spark} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" width={W} height={H}>
        {linePath && <path d={linePath} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
        {filled.map(pt => (
          <circle key={pt.x} cx={xs(pt.x)} cy={ys(pt.y)} r="2" fill="var(--color-accent)" />
        ))}
      </svg>
    )
  }

  return (
    <div className={styles.wrap}>
      <svg className={styles.chart} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Readiness trend over the past 14 days" width="100%" height={H}>
        {/* Grid lines at 30, 55, 80 */}
        {[30, 55, 80].map(v => (
          <line key={v} x1={pad} x2={W - pad} y1={ys(v)} y2={ys(v)} stroke="var(--color-line)" strokeWidth="1" />
        ))}
        {linePath && (
          <path d={linePath} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {filled.map(pt => (
          <circle key={pt.x} cx={xs(pt.x)} cy={ys(pt.y)} r="3" fill="var(--color-accent)" />
        ))}
      </svg>

      {/* X-axis labels — first and last */}
      <div className={styles.xAxis} aria-hidden="true">
        <span>{fmtShort(dates[0])}</span>
        <span>{fmtShort(dates[dates.length - 1])}</span>
      </div>

      {/* Y-axis labels */}
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendHigh}>High ≥80</span>
        <span className={styles.legendMod}>Mod 55–79</span>
        <span className={styles.legendLow}>Low &lt;55</span>
      </div>
    </div>
  )
}
