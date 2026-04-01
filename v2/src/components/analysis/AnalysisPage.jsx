import { useState, useRef } from 'react'
import useStore from '../../store/useStore'
import { today, addDays, getMonday } from '../../lib/dates'
import { getMuscleSetTotals, MUSCLE_DISPLAY } from '../../lib/muscles'
import { readinessScore } from '../../lib/readiness'
import styles from './AnalysisPage.module.css'

const PROMPTS = [
  { id: 'week', label: 'This week', desc: 'Review my training load and readiness for the week.' },
  { id: 'muscle', label: 'Muscle balance', desc: 'Analyse my weekly muscle set distribution and flag any imbalances.' },
  { id: 'recovery', label: 'Recovery trend', desc: 'Review my readiness trend and suggest recovery adjustments.' },
  { id: 'progress', label: 'Progress check', desc: 'Summarise my progress over the past month and suggest focus areas.' },
]

function buildContext(sessions, mesoStart) {
  const todayStr = today()
  const weekMon  = getMonday(todayStr)
  const weekSun  = addDays(weekMon, 6)
  const weekSessions = sessions.filter(s => s.date >= weekMon && s.date <= weekSun)
  const recentSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14)

  const muscleTotals = getMuscleSetTotals(weekSessions)
  const nonZeroMuscles = Object.entries(muscleTotals)
    .filter(([, v]) => v > 0)
    .map(([m, v]) => `${MUSCLE_DISPLAY[m] || m}: ${v} sets`)
    .join(', ')

  const readinessHistory = recentSessions
    .filter(s => s.sleep || s.energy || s.soreness)
    .map(s => {
      const score = readinessScore(s.sleep, s.energy, s.soreness)
      return `${s.date}: ${score ?? '?'} (sleep ${s.sleep || '?'}, energy ${s.energy || '?'}, soreness ${s.soreness || '?'})`
    })
    .join('\n')

  const sessionHistory = recentSessions
    .map(s => {
      const sets = (s.supersets || []).reduce((t, ss) => t + ss.exercises.reduce((tt, ex) => tt + (Number(ex.sets) || 0), 0), 0)
      return `${s.date} ${s.dtype || 'Unknown'}${sets ? ` ${sets}sets` : ''}${s.perf ? ` perf:${s.perf}` : ''}`
    })
    .join('\n')

  return `MESO+ TRAINING DATA
Date: ${todayStr}
Meso start: ${mesoStart || 'Not set'}

THIS WEEK MUSCLE SETS:
${nonZeroMuscles || 'No gym sessions this week'}

RECENT SESSIONS (last 14):
${sessionHistory || 'None'}

READINESS (last 14 days):
${readinessHistory || 'No readiness data'}`
}

export default function AnalysisPage() {
  const sessions  = useStore(s => s.sessions)
  const mesoStart = useStore(s => s.mesoStart)

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mp7_claude_key') || '')
  const [showKey, setShowKey] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const abortRef = useRef(null)

  const saveKey = (val) => {
    setApiKey(val)
    localStorage.setItem('mp7_claude_key', val)
  }

  const run = async (promptId) => {
    const key = apiKey.trim()
    if (!key) { setError('Enter your Claude API key first.'); return }

    const found = PROMPTS.find(p => p.id === promptId)
    const userMessage = found ? found.desc : customPrompt.trim()
    if (!userMessage) return

    const context = buildContext(sessions || [], mesoStart)

    setLoading(true)
    setError('')
    setResponse('')
    setSelectedPrompt(promptId)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        signal: ctrl.signal,
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 800,
          system: 'You are a knowledgeable strength and conditioning coach specialising in hypertrophy and BJJ. Be concise and practical. Use bullet points. Max 5 bullets.',
          messages: [
            { role: 'user', content: `${context}\n\nQUESTION: ${userMessage}` }
          ],
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `API error ${res.status}`)
      }

      const data = await res.json()
      setResponse(data.content?.[0]?.text || 'No response.')
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message || 'Request failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Analysis</h1>
      </header>

      {/* ── API key ── */}
      <section className={styles.section} aria-labelledby="analysis-key">
        <h2 className={styles.sectionTitle} id="analysis-key">Claude API key</h2>
        <div className={styles.keyRow}>
          <input
            type={showKey ? 'text' : 'password'}
            className={styles.keyInput}
            value={apiKey}
            onChange={e => saveKey(e.target.value)}
            placeholder="sk-ant-…"
            aria-label="Claude API key"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            className={styles.keyToggle}
            onClick={() => setShowKey(v => !v)}
            aria-label={showKey ? 'Hide API key' : 'Show API key'}
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className={styles.keyHint}>
          Your key is stored only in this browser. It goes directly to Anthropic — never to any server.
        </p>
      </section>

      {/* ── Quick prompts ── */}
      <section className={styles.section} aria-labelledby="analysis-prompts">
        <h2 className={styles.sectionTitle} id="analysis-prompts">Ask about your training</h2>
        <div className={styles.promptList}>
          {PROMPTS.map(p => (
            <button
              key={p.id}
              className={`${styles.promptBtn} ${selectedPrompt === p.id ? styles.promptActive : ''}`}
              onClick={() => run(p.id)}
              disabled={loading}
              aria-pressed={selectedPrompt === p.id}
            >
              <span className={styles.promptLabel}>{p.label}</span>
              <span className={styles.promptDesc}>{p.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Custom question ── */}
      <section className={styles.section} aria-labelledby="analysis-custom">
        <h2 className={styles.sectionTitle} id="analysis-custom">Custom question</h2>
        <div className={styles.customRow}>
          <textarea
            className={styles.customInput}
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            placeholder="Ask anything about your training data…"
            rows={2}
            aria-label="Custom question for analysis"
          />
          <button
            className={styles.askBtn}
            onClick={() => run('custom')}
            disabled={loading || !customPrompt.trim()}
            aria-label="Ask custom question"
          >
            Ask
          </button>
        </div>
      </section>

      {/* ── Response ── */}
      {(loading || response || error) && (
        <section className={styles.section} aria-labelledby="analysis-response" aria-live="polite">
          <h2 className={styles.sectionTitle} id="analysis-response">Response</h2>
          {loading && (
            <div className={styles.loading} aria-label="Loading analysis…">
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          )}
          {error && <p className={styles.error} role="alert">{error}</p>}
          {response && (
            <div className={styles.response}>
              {response.split('\n').map((line, i) => (
                <p key={i} className={line.startsWith('•') || line.startsWith('-') ? styles.bullet : styles.line}>
                  {line}
                </p>
              ))}
            </div>
          )}
          {loading && (
            <button className={styles.cancelBtn} onClick={() => abortRef.current?.abort()}>Cancel</button>
          )}
        </section>
      )}
    </div>
  )
}
