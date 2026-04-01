import styles from './Chip.module.css'

/**
 * Chip — toggleable pill button used for option selection.
 *
 * @param {string}   value      - The value this chip represents
 * @param {boolean}  selected   - Whether the chip is active
 * @param {function} onToggle   - Called with value when clicked
 * @param {string}   [size]     - 'sm' | 'md' (default 'md')
 * @param {boolean}  [flex]     - Stretch equally in a row (default false)
 */
export default function Chip({ value, selected, onToggle, size = 'md', flex = false, children }) {
  return (
    <button
      type="button"
      className={[
        styles.chip,
        styles[`size-${size}`],
        selected ? styles.on : '',
        flex ? styles.flex : '',
      ].join(' ')}
      onClick={() => onToggle(value)}
      aria-pressed={selected}
    >
      {children ?? value}
    </button>
  )
}
