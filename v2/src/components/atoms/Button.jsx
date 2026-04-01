import styles from './Button.module.css'

/**
 * Button atom — variants: 'primary' | 'ghost' | 'danger'
 *
 * @param {string}   [variant='primary']
 * @param {boolean}  [fullWidth=false]
 * @param {boolean}  [disabled=false]
 * @param {function} onClick
 */
export default function Button({ children, variant = 'primary', fullWidth = false, disabled = false, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      className={[
        styles.btn,
        styles[variant],
        fullWidth ? styles.full : '',
      ].join(' ')}
      disabled={disabled}
      onClick={onClick}
      aria-disabled={disabled}
    >
      {children}
    </button>
  )
}
