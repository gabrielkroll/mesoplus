import Chip from '../atoms/Chip'
import styles from './ChipGroup.module.css'

/**
 * ChipGroup molecule — labelled group of toggleable chips (single-select).
 *
 * @param {string}   id        - used for aria-labelledby
 * @param {string}   label
 * @param {string[]} options   - array of string values
 * @param {string}   value     - currently selected value
 * @param {function} onChange  - called with new value (or '' to deselect)
 * @param {string}   [size]    - Chip size: 'sm' | 'md'
 * @param {boolean}  [flex]    - Equal-width chips
 */
export default function ChipGroup({ id, label, options, value, onChange, size = 'md', flex = false }) {
  return (
    <div className={styles.group}>
      <div className={styles.label} id={id}>{label}</div>
      <div className={styles.chips} role="group" aria-labelledby={id}>
        {options.map(opt => (
          <Chip
            key={opt}
            value={opt}
            selected={value === opt}
            onToggle={v => onChange(value === v ? '' : v)}
            size={size}
            flex={flex}
          />
        ))}
      </div>
    </div>
  )
}
