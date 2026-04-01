import styles from './Stepper.module.css'

/**
 * Stepper — integer ± control with a centred display value.
 *
 * @param {number}   value
 * @param {function} onChange  - Called with new number
 * @param {number}   [min=0]
 * @param {number}   [max=99]
 * @param {string}   [labelId] - aria-labelledby for the group
 */
export default function Stepper({ value, onChange, min = 0, max = 99, labelId }) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(Math.min(max, value + 1))

  return (
    <div className={styles.stepper} role="group" aria-labelledby={labelId}>
      <button type="button" className={styles.btn} onClick={dec} aria-label="Decrease">−</button>
      <span className={styles.val} aria-live="polite">{value}</span>
      <button type="button" className={styles.btn} onClick={inc} aria-label="Increase">+</button>
    </div>
  )
}
