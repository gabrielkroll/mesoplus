import styles from './TextArea.module.css'

/**
 * TextArea — labelled textarea atom.
 *
 * @param {string}   id
 * @param {string}   label
 * @param {string}   value
 * @param {function} onChange  - called with raw string
 * @param {string}   [placeholder]
 * @param {number}   [rows=3]
 */
export default function TextArea({ id, label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div className={styles.group}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <textarea
        id={id}
        className={styles.textarea}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        rows={rows}
      />
    </div>
  )
}
