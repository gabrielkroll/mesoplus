import { useState, createContext, useContext } from 'react'
import { hasPin, checkPin, savePin, isUnlocked, markSession, clearSession } from '../../lib/auth'
import Button from '../atoms/Button'
import styles from './LoginGate.module.css'

const LockContext = createContext(null)

/** Call this inside any child component to get a `lock()` function. */
export const useLock = () => useContext(LockContext)

export default function LoginGate({ children }) {
  const [unlocked, setUnlocked] = useState(isUnlocked)
  const [mode,     setMode]     = useState(() => hasPin() ? 'unlock' : 'setup')
  const [pw,       setPw]       = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')

  const lock = () => {
    clearSession()
    setUnlocked(false)
    setPw('')
    setConfirm('')
    setError('')
    setMode('unlock')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!pw) { setError('Enter your password'); return }

    if (mode === 'setup') {
      if (!confirm)        { setError('Confirm your password'); return }
      if (pw !== confirm)  { setError("Passwords don't match"); return }
      savePin(pw)
      markSession()
      setUnlocked(true)
    } else {
      if (!checkPin(pw)) { setError('Wrong password'); setPw(''); return }
      markSession()
      setUnlocked(true)
    }
  }

  const toggleMode = () => {
    setMode(m => m === 'setup' ? 'unlock' : 'setup')
    setError('')
    setPw('')
    setConfirm('')
  }

  if (unlocked) {
    return (
      <LockContext.Provider value={lock}>
        {children}
      </LockContext.Provider>
    )
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="login-title">
      <div className={styles.box}>
        <div className={styles.wordmark}>Meso<sup>+</sup></div>
        <p className={styles.subtitle} id="login-title">
          {mode === 'setup' ? 'Choose a password to protect your data' : 'Your personal training log'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form} autoComplete="on">
          {/* Hidden username field for password managers */}
          <input type="text" name="username" value="mesoplus" autoComplete="username" style={{ display: 'none' }} readOnly />

          <input
            className={styles.input}
            type="password"
            name={mode === 'setup' ? 'new-password' : 'password'}
            placeholder="Enter password"
            autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
            value={pw}
            onChange={e => setPw(e.target.value)}
            autoFocus
          />

          {mode === 'setup' && (
            <input
              className={styles.input}
              type="password"
              name="new-password-confirm"
              placeholder="Confirm password"
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          )}

          {error && <p className={styles.error} role="alert">{error}</p>}

          <Button variant="primary" type="submit">
            {mode === 'setup' ? 'Create password' : 'Log in'}
          </Button>
        </form>

        <button className={styles.toggle} onClick={toggleMode} type="button">
          {mode === 'setup' ? 'Already have a password? Log in' : 'New device? Create a password'}
        </button>
      </div>
    </div>
  )
}
