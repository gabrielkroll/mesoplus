import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'
import SheetBase from './SheetBase'
import styles from './BJJSheet.module.css'

const today = () => new Date().toISOString().split('T')[0]

const GC_OPTIONS = ['Clinch', 'Guard', 'Half Guard', 'Side Control', 'Mount', 'Back', 'Turtle', 'Standing']
const PERF_OPTIONS = ['Below par', 'On track', 'Exceeded']

// ── Step 0: Overview / start ──────────────────────────────────────────────────
function BJJOverview({ onStart }) {
  return (
    <div className={styles.overviewWrap}>
      <p className={styles.overviewText}>
        Log your mat session — techniques, positions, what worked, what to drill next.
      </p>
      <button className={styles.startBtn} onClick={onStart}>
        Start mat journal
      </button>
    </div>
  )
}

// ── Step 1: Journal inputs ────────────────────────────────────────────────────
function BJJJournal({ data, onChange, onComplete }) {
  const set = (field) => (val) => onChange({ ...data, [field]: val })

  return (
    <motion.div
      className={styles.journalWrap}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', stiffness: 400, damping: 38 }}
    >
      {/* Duration */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="bjj-duration">Duration (min)</label>
        <input
          id="bjj-duration"
          className={styles.numInput}
          type="number"
          inputMode="numeric"
          placeholder="—"
          value={data.duration || ''}
          onChange={e => set('duration')(e.target.value)}
          min={0}
          aria-label="Session duration in minutes"
        />
      </div>

      {/* Game / position focus */}
      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel} id="gc-label">Position focus</div>
        <div className={styles.chips} role="group" aria-labelledby="gc-label">
          {GC_OPTIONS.map(g => (
            <button
              key={g}
              className={`${styles.chip} ${data.gc === g ? styles.chipOn : ''}`}
              onClick={() => set('gc')(data.gc === g ? '' : g)}
              aria-pressed={data.gc === g}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* What worked */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="bjj-good">What worked</label>
        <textarea
          id="bjj-good"
          className={styles.textarea}
          placeholder="Techniques, setups, timing…"
          value={data.good || ''}
          onChange={e => set('good')(e.target.value)}
          rows={3}
          aria-label="What worked in this session"
        />
      </div>

      {/* What to drill */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="bjj-next">Drill next</label>
        <textarea
          id="bjj-next"
          className={styles.textarea}
          placeholder="Gaps, counters, escapes to work on…"
          value={data.next || ''}
          onChange={e => set('next')(e.target.value)}
          rows={3}
          aria-label="What to drill next"
        />
      </div>

      {/* Performance */}
      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel} id="bjj-perf-label">Performance</div>
        <div className={styles.chips} role="group" aria-labelledby="bjj-perf-label">
          {PERF_OPTIONS.map(p => (
            <button
              key={p}
              className={`${styles.chip} ${data.perf === p ? styles.chipOn : ''}`}
              onClick={() => set('perf')(data.perf === p ? '' : p)}
              aria-pressed={data.perf === p}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <button className={styles.completeBtn} onClick={onComplete}>
        Complete Day
      </button>
    </motion.div>
  )
}

// ── Main sheet ────────────────────────────────────────────────────────────────
export default function BJJSheet({ isOpen, onClose, layoutId = 'card-bjj', showResistance = false }) {
  const sessions   = useStore(s => s.sessions)
  const addSession = useStore(s => s.addSession)

  const date    = today()
  const session = sessions.find(s => s.date === date) || {}

  const [step, setStep] = useState(-1)
  const [data, setData] = useState({})

  useEffect(() => {
    if (isOpen) {
      setStep(-1)
      setData({
        duration: session.bjjDuration || '',
        gc:       session.bjjGc       || '',
        good:     session.bjjGood     || '',
        next:     session.bjjNext     || '',
        perf:     session.perf        || '',
      })
      if (!session.dtype) {
        addSession({ ...session, date, dtype: 'BJJ' })
      }
    }
  }, [isOpen])

  const complete = () => {
    addSession({
      ...session,
      date,
      dtype: showResistance ? session.dtype : 'BJJ',
      bjjDuration: data.duration,
      bjjGc:       data.gc,
      bjjGood:     data.good,
      bjjNext:     data.next,
      perf:        data.perf,
      completed:   true,
    })
    onClose()
  }

  return (
    <SheetBase
      isOpen={isOpen}
      onClose={onClose}
      layoutId={layoutId}
      title="BJJ"
      titleId="bjj-title"
    >
      <AnimatePresence mode="wait">
        {step === -1 ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BJJOverview onStart={() => setStep(0)} />
          </motion.div>
        ) : (
          <BJJJournal
            key="journal"
            data={data}
            onChange={setData}
            onComplete={complete}
          />
        )}
      </AnimatePresence>
    </SheetBase>
  )
}
