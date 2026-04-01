import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'
import SheetBase from './SheetBase'
import { getExercises, deriveGymDay, TEMPLATES } from '../../lib/templates'
import BJJSheet from './BJJSheet'
import styles from './ResistanceSheet.module.css'
import bjjStyles from './BJJSheet.module.css'

const today = () => new Date().toISOString().split('T')[0]
const RIR_OPTIONS = ['4+', '3', '2', '1', '0']
const DAY_LABELS  = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' }
const GC_OPTIONS  = ['Clinch', 'Guard', 'Half Guard', 'Side Control', 'Mount', 'Back', 'Turtle', 'Standing']
const PERF_OPTIONS = ['Below par', 'On track', 'Exceeded']

// Phases: 'gym-overview' → 'gym-ex-N' → 'bjj-overview' → 'bjj-journal'
export default function ResistanceBJJSheet({ isOpen, onClose }) {
  const sessions   = useStore(s => s.sessions)
  const addSession = useStore(s => s.addSession)

  const date      = today()
  const session   = sessions.find(s => s.date === date) || {}
  const gymDay    = session.gymDay || deriveGymDay(sessions, date) || 1
  const exercises = getExercises(gymDay)

  const [phase, setPhase]   = useState('gym-overview')
  const [exStep, setExStep] = useState(0)
  const [exData, setExData] = useState({})
  const [bjjData, setBjjData] = useState({})

  useEffect(() => {
    if (isOpen) {
      setPhase('gym-overview')
      setExStep(0)
      setExData({})
      setBjjData({
        duration: session.bjjDuration || '',
        gc: session.bjjGc || '',
        good: session.bjjGood || '',
        next: session.bjjNext || '',
        perf: session.perf || '',
      })
      if (!session.dtype) {
        addSession({ ...session, date, dtype: 'Resistance training + BJJ', gymDay })
      }
    }
  }, [isOpen])

  const saveGymAndAdvance = (index) => {
    const updatedSess = buildSession(session, exercises, exData, gymDay)
    addSession({ ...updatedSess, date, dtype: 'Resistance training + BJJ', gymDay })
    if (index + 1 < exercises.length) {
      setExStep(index + 1)
    } else {
      setPhase('bjj-overview')
    }
  }

  const completeBJJ = () => {
    const updatedSess = buildSession(session, exercises, exData, gymDay)
    addSession({
      ...updatedSess,
      date,
      dtype: 'Resistance training + BJJ',
      gymDay,
      bjjDuration: bjjData.duration,
      bjjGc:       bjjData.gc,
      bjjGood:     bjjData.good,
      bjjNext:     bjjData.next,
      perf:        bjjData.perf,
      completed:   true,
    })
    onClose()
  }

  const updateEx = (index, data) => setExData(prev => ({ ...prev, [index]: data }))

  const title = phase.startsWith('bjj') ? 'BJJ' : 'Resistance training + BJJ'

  return (
    <SheetBase
      isOpen={isOpen}
      onClose={onClose}
      layoutId="card-resistance+bjj"
      title={title}
      titleId="rbj-title"
    >
      <AnimatePresence mode="wait">

        {/* ── Gym overview ── */}
        {phase === 'gym-overview' && (
          <motion.div key="gym-overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className={styles.dayTag}>Full Body · Day {DAY_LABELS[gymDay]} + BJJ</div>
            <div className={styles.supersets}>
              {(TEMPLATES[gymDay] || []).map(ss => (
                <div key={ss.label} className={styles.superset}>
                  <div className={styles.supersetLabel}>{ss.label}</div>
                  {ss.exercises.map(ex => (
                    <div key={ex.name} className={styles.overviewRow}>
                      <span className={styles.overviewName}>{ex.name}</span>
                      <span className={styles.overviewMeta}>{ex.sets} sets · {ex.rf}–{ex.rc} reps</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button className={styles.startBtn} onClick={() => setPhase('gym-ex')}>
              Start first exercise
            </button>
          </motion.div>
        )}

        {/* ── Gym exercises ── */}
        {phase === 'gym-ex' && (
          <ExerciseEntry
            key={`ex-${exStep}`}
            exercise={exercises[exStep]}
            index={exStep}
            total={exercises.length}
            data={exData[exStep] || { sets: exercises[exStep]?.sets }}
            onChange={(data) => updateEx(exStep, data)}
            onNext={() => saveGymAndAdvance(exStep)}
            isLast={exStep === exercises.length - 1}
            nextLabel="Next exercise →"
            finalLabel="Continue to BJJ →"
          />
        )}

        {/* ── BJJ overview ── */}
        {phase === 'bjj-overview' && (
          <motion.div key="bjj-overview" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ type: 'spring', stiffness: 400, damping: 38 }}>
            <p className={bjjStyles.overviewText}>Gym done. Now log your mat session.</p>
            <button className={bjjStyles.startBtn} style={{ marginTop: 24 }} onClick={() => setPhase('bjj-journal')}>
              Start mat journal
            </button>
          </motion.div>
        )}

        {/* ── BJJ journal ── */}
        {phase === 'bjj-journal' && (
          <BJJJournal
            key="bjj-journal"
            data={bjjData}
            onChange={setBjjData}
            onComplete={completeBJJ}
          />
        )}

      </AnimatePresence>
    </SheetBase>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function ExerciseEntry({ exercise, index, total, data, onChange, onNext, isLast, nextLabel, finalLabel }) {
  const set = (field) => (val) => onChange({ ...data, [field]: val })
  return (
    <motion.div
      key={index}
      className={styles.entryWrap}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', stiffness: 400, damping: 38 }}
    >
      <div className={styles.progress} aria-label={`Exercise ${index + 1} of ${total}`}>
        <div className={styles.progressBar} style={{ width: `${((index + 1) / total) * 100}%` }}
          role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total} />
      </div>
      <div className={styles.progressLabel}>{index + 1} / {total}</div>
      <div className={styles.exName}>{exercise.name}</div>
      <div className={styles.exMuscle}>{exercise.muscle}{exercise.muscle2 ? ` + ${exercise.muscle2}` : ''}<span className={styles.exReps}> · {exercise.rf}–{exercise.rc} reps</span></div>
      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel} id={`rbjj-sets-${index}`}>Sets</div>
        <div className={styles.stepper} role="group" aria-labelledby={`rbjj-sets-${index}`}>
          <button className={styles.stepBtn} onClick={() => set('sets')(Math.max(0, (parseInt(data.sets) || 0) - 1))} aria-label="Decrease sets">−</button>
          <span className={styles.stepVal} aria-live="polite">{data.sets || exercise.sets}</span>
          <button className={styles.stepBtn} onClick={() => set('sets')((parseInt(data.sets) || exercise.sets) + 1)} aria-label="Increase sets">+</button>
        </div>
      </div>
      <div className={styles.row2}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor={`rbjj-kg-${index}`}>Weight (kg)</label>
          <input id={`rbjj-kg-${index}`} className={styles.numInput} type="number" inputMode="decimal" placeholder="—" value={data.kg || ''} onChange={e => set('kg')(e.target.value)} min={0} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor={`rbjj-reps-${index}`}>Reps</label>
          <input id={`rbjj-reps-${index}`} className={styles.numInput} type="number" inputMode="numeric" placeholder="—" value={data.reps || ''} onChange={e => set('reps')(e.target.value)} min={0} />
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel} id={`rbjj-rir-${index}`}>RIR</div>
        <div className={styles.chips} role="group" aria-labelledby={`rbjj-rir-${index}`}>
          {RIR_OPTIONS.map(r => (
            <button key={r} className={`${styles.chip} ${data.rir === r ? styles.chipOn : ''}`} onClick={() => set('rir')(data.rir === r ? '' : r)} aria-pressed={data.rir === r}>{r}</button>
          ))}
        </div>
      </div>
      <button className={styles.nextBtn} onClick={onNext}>{isLast ? finalLabel : nextLabel}</button>
    </motion.div>
  )
}

function BJJJournal({ data, onChange, onComplete }) {
  const set = (field) => (val) => onChange({ ...data, [field]: val })
  return (
    <motion.div className={bjjStyles.journalWrap} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ type: 'spring', stiffness: 400, damping: 38 }}>
      <div className={bjjStyles.fieldGroup}>
        <label className={bjjStyles.fieldLabel} htmlFor="rbjj-duration">Duration (min)</label>
        <input id="rbjj-duration" className={bjjStyles.numInput} type="number" inputMode="numeric" placeholder="—" value={data.duration || ''} onChange={e => set('duration')(e.target.value)} min={0} />
      </div>
      <div className={bjjStyles.fieldGroup}>
        <div className={bjjStyles.fieldLabel} id="rbjj-gc">Position focus</div>
        <div className={bjjStyles.chips} role="group" aria-labelledby="rbjj-gc">
          {GC_OPTIONS.map(g => <button key={g} className={`${bjjStyles.chip} ${data.gc === g ? bjjStyles.chipOn : ''}`} onClick={() => set('gc')(data.gc === g ? '' : g)} aria-pressed={data.gc === g}>{g}</button>)}
        </div>
      </div>
      <div className={bjjStyles.fieldGroup}>
        <label className={bjjStyles.fieldLabel} htmlFor="rbjj-good">What worked</label>
        <textarea id="rbjj-good" className={bjjStyles.textarea} placeholder="Techniques, setups, timing…" value={data.good || ''} onChange={e => set('good')(e.target.value)} rows={3} />
      </div>
      <div className={bjjStyles.fieldGroup}>
        <label className={bjjStyles.fieldLabel} htmlFor="rbjj-next">Drill next</label>
        <textarea id="rbjj-next" className={bjjStyles.textarea} placeholder="Gaps, counters, escapes…" value={data.next || ''} onChange={e => set('next')(e.target.value)} rows={3} />
      </div>
      <div className={bjjStyles.fieldGroup}>
        <div className={bjjStyles.fieldLabel} id="rbjj-perf">Performance</div>
        <div className={bjjStyles.chips} role="group" aria-labelledby="rbjj-perf">
          {PERF_OPTIONS.map(p => <button key={p} className={`${bjjStyles.chip} ${data.perf === p ? bjjStyles.chipOn : ''}`} onClick={() => set('perf')(data.perf === p ? '' : p)} aria-pressed={data.perf === p}>{p}</button>)}
        </div>
      </div>
      <button className={bjjStyles.completeBtn} onClick={onComplete}>Complete Day</button>
    </motion.div>
  )
}

function buildSession(session, exercises, exData, gymDay) {
  const supersetMap = {}
  exercises.forEach((ex, i) => {
    if (!supersetMap[ex.supersetLabel]) supersetMap[ex.supersetLabel] = []
    const d = exData[i] || {}
    supersetMap[ex.supersetLabel].push({ name: ex.name, muscle: ex.muscle, muscle2: ex.muscle2 || '', sets: d.sets || ex.sets, kg: d.kg || '', reps: d.reps || '', rir: d.rir || '' })
  })
  return { ...session, supersets: Object.entries(supersetMap).map(([label, exs]) => ({ label, exercises: exs })), gymDay }
}
