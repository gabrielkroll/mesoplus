import { MUSCLES, MUSCLE_TARGETS, MUSCLE_DISPLAY } from '../../lib/muscles'
import styles from './MuscleChart.module.css'

/**
 * MuscleChart — horizontal bar chart of sets per muscle.
 *
 * @param {object}  totals   - { [muscle]: number }
 * @param {string[]} [muscles] - ordered list (defaults to MUSCLES)
 * @param {boolean} [mini]   - compact preview mode (no labels, fewer bars)
 */
export default function MuscleChart({ totals, muscles, mini = false }) {
  const list = muscles || MUSCLES
  const maxSets = Math.max(...list.map(m => totals[m] || 0), 1)

  if (mini) {
    // Condensed preview: just bars, no labels
    const preview = list.filter(m => (totals[m] || 0) > 0).slice(0, 8)
    if (preview.length === 0) return <p className={styles.empty}>No data</p>
    return (
      <div className={styles.miniWrap} aria-hidden="true">
        {preview.map(m => {
          const sets = totals[m] || 0
          const { mrv } = MUSCLE_TARGETS[m] || { mrv: 20 }
          const pct = Math.min((sets / mrv) * 100, 100)
          return (
            <div key={m} className={styles.miniBar}>
              <div className={styles.miniName}>{MUSCLE_DISPLAY[m] || m}</div>
              <div className={styles.miniTrack}>
                <div className={styles.miniFill} style={{ width: `${pct}%` }} />
              </div>
              <div className={styles.miniVal}>{sets}</div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={styles.chartWrap}>
      {list.map(m => {
        const sets = totals[m] || 0
        const { mrv, mev } = MUSCLE_TARGETS[m] || { mrv: 20, mev: 0 }
        const mrvPct = Math.min((sets / mrv) * 100, 100)
        const mevPct = (mev / mrv) * 100
        const overMrv = sets > mrv

        return (
          <div key={m} className={styles.row} aria-label={`${MUSCLE_DISPLAY[m] || m}: ${sets} sets`}>
            <div className={styles.name}>{MUSCLE_DISPLAY[m] || m}</div>
            <div className={styles.barWrap}>
              <div className={styles.track}>
                {/* MEV marker */}
                {mev > 0 && <div className={styles.mevLine} style={{ left: `${mevPct}%` }} aria-hidden="true" />}
                <div
                  className={`${styles.fill} ${overMrv ? styles.over : ''}`}
                  style={{ width: `${mrvPct}%` }}
                />
              </div>
            </div>
            <div className={`${styles.val} ${overMrv ? styles.valOver : ''}`}>{sets}</div>
          </div>
        )
      })}
    </div>
  )
}
