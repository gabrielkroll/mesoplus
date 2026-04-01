import styles from './ProgressBar.module.css'

/**
 * ProgressBar — linear progress indicator.
 *
 * @param {number} value  - current step (1-based)
 * @param {number} max    - total steps
 * @param {string} [label] - override text; defaults to "value / max"
 */
export default function ProgressBar({ value, max, label }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={1}
          aria-valuemax={max}
          aria-label={label ?? `Step ${value} of ${max}`}
        />
      </div>
      <div className={styles.text} aria-hidden="true">{label ?? `${value} / ${max}`}</div>
    </div>
  )
}
