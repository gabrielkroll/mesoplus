import styles from './NumInput.module.css'

/**
 * NumInput — styled number field, no browser spinners.
 *
 * @param {string}   id
 * @param {string}   label
 * @param {string|number} value
 * @param {function} onChange  - called with raw string value
 * @param {string}   [placeholder='—']
 * @param {string}   [inputMode='decimal']
 * @param {number}   [min=0]
 */
export default function NumInput({ id, label, value, onChange, placeholder = '—', inputMode = 'decimal', min = 0 }) {
  return (
    <div className={styles.group}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <input
        id={id}
        className={styles.input}
        type="number"
        inputMode={inputMode}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        min={min}
      />
    </div>
  )
}
