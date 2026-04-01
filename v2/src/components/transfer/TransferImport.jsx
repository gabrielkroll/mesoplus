import { useState, useEffect } from 'react'
import useStore from '../../store/useStore'
import Button from '../atoms/Button'
import styles from './TransferImport.module.css'

const USED_KEY = 'mp7_used_tokens'
const CLAUDE_KEY = 'mp7_claude_key'

function hashPw(pw) {
  const s = pw + 'mp7salt'
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i)
    h = h >>> 0
  }
  return h.toString(36)
}

function getUsedTokens() {
  try { return JSON.parse(localStorage.getItem(USED_KEY) || '[]') } catch { return [] }
}

export default function TransferImport() {
  const setScriptUrl  = useStore(s => s.setScriptUrl)
  const setSheetId    = useStore(s => s.setSheetId)
  const setSheetTab   = useStore(s => s.setSheetTab)
  const setMesoStart  = useStore(s => s.setMesoStart)

  const [token,    setToken]    = useState(null)
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [done,     setDone]     = useState(false)

  useEffect(() => {
    // Use raw regex instead of URLSearchParams — URLSearchParams decodes '+' as
    // space, which corrupts base64 tokens that contain '+' characters.
    const match = window.location.search.match(/[?&]setup=([^&]*)/)
    if (match) {
      const raw = decodeURIComponent(match[1])
      setToken(raw)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  if (!token || done) return null

  const handleImport = (e) => {
    e.preventDefault()
    setError('')
    if (!password) { setError('Enter your password'); return }

    let decoded, parsed
    try {
      decoded = atob(token)
    } catch (ex) {
      setError(`atob failed (len=${token.length}): ${token.slice(0,40)}`)
      return
    }
    try {
      parsed = JSON.parse(decoded)
    } catch (ex) {
      setError(`JSON.parse failed: ${decoded.slice(0,80)}`)
      return
    }

    try {
      const { p: payloadStr, sig } = parsed
      const payload = JSON.parse(payloadStr)

      if (Date.now() > payload.exp) {
        setError('Link expired — ask for a new one')
        return
      }

      const used = getUsedTokens()
      const tokenHash = hashPw(token.slice(0, 80))
      if (used.includes(tokenHash)) {
        setError('Link already used — generate a new one')
        return
      }

      const expectedSig = hashPw(payloadStr + hashPw(password))
      if (sig !== expectedSig) {
        setError('Wrong password')
        return
      }

      // Write config to store
      if (payload.su) setScriptUrl(payload.su)
      if (payload.s)  setSheetId(payload.s)
      if (payload.t)  setSheetTab(payload.t)
      if (payload.ms) setMesoStart(payload.ms)

      // Claude key goes to its own localStorage key
      if (payload.ck) localStorage.setItem(CLAUDE_KEY, payload.ck)

      // Mark token as used
      const updated = [...used, tokenHash].slice(-20)
      localStorage.setItem(USED_KEY, JSON.stringify(updated))

      setDone(true)
      setToken(null)
    } catch (ex) {
      setError(`p="${String(parsed?.p).slice(0, 100)}"`)
    }
  }

  const dismiss = () => {
    setToken(null)
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="transfer-title">
      <div className={styles.box}>
        <div className={styles.wordmark}>Meso<sup>+</sup></div>
        <p className={styles.subtitle} id="transfer-title">Device setup detected</p>

        <form onSubmit={handleImport} className={styles.form} autoComplete="on">
          <input type="text" name="username" value="mesoplus" autoComplete="username" style={{ display: 'none' }} readOnly />
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Enter your password to import"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <Button variant="primary" type="submit">Import &amp; set up this device</Button>
        </form>

        <button className={styles.dismiss} onClick={dismiss}>
          Set up manually instead
        </button>
      </div>
    </div>
  )
}
