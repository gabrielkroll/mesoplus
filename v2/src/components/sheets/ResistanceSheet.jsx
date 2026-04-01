import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import useStore from '../../store/useStore'
import SheetBase from './SheetBase'
import { getExercises, deriveGymDay, TEMPLATES } from '../../lib/templates'
import styles from './ResistanceSheet.module.css'

const today = () => new Date().toISOString().split('T')[0]
const RIR_OPTIONS = ['4+', '3', '2', '1', '0']
const DAY_LABELS  = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' }

// ── Exercise overview list ────────────────────────────────────────────────────
function ExerciseList({ gymDay, onStart }) {
  const supersets = TEMPLATES[gymDay] || []

  return (
    <div className={styles.overviewWrap}>
      <div className={styles.dayTag}>
        Full Body · Day {DAY_LABELS[gymDay]}
      </div>
      <div className={styles.supersets}>
        {supersets.map(ss => (
          <div key={ss.label} className={styles.superset}>
            <div className={styles.supersetLabel}>{ss.label}</div>
            {ss.exercises.map(ex => (
              <div key={ex.name} className={styles.overviewRow}>
                <span className={styles.overviewName}>{ex.name}</span>
                <span className={styles.overviewMeta}>
                  {ex.sets} sets · {ex.rf}–{ex.rc} reps
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button className={styles.startBtn} onClick={onStart}>
        Start first exercise
      </button>
    </div>
  )
}

// ── Single exercise entry ─────────────────────────────────────────────────────
function ExerciseEntry({ exercise, index, total, data, onChange, onNext, onComplete }) {
  const isLast = index === total - 1

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
      {/* Progress */}
      <div className={styles.progress} aria-label={`Exercise ${index + 1} of ${total}`}>
        <div
          className={styles.progressBar}
          style={{ width: `${((index + 1) / total) * 100}%` }}
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>
      <div className={styles.progressLabel}>{index + 1} / {total}</div>

      {/* Exercise name */}
      <div className={styles.exName}>{exercise.name}</div>
      <div className={styles.exMuscle}>
        {exercise.muscle}{exercise.muscle2 ? ` + ${exercise.muscle2}` : ''}
        <span className={styles.exReps}> · {exercise.rf}–{exercise.rc} reps</span>
      </div>

      {/* Sets stepper */}
      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel} id={`sets-label-${index}`}>Sets</div>
        <div className={styles.stepper} role="group" aria-labelledby={`sets-label-${index}`}>
          <button
            className={styles.stepBtn}
            onClick={() => set('sets')(Math.max(0, (parseInt(data.sets) || 0) - 1))}
            aria-label="Decrease sets"
          >−</button>
          <span className={styles.stepVal} aria-live="polite">
            {data.sets || exercise.sets}
          </span>
          <button
            className={styles.stepBtn}
            onClick={() => set('sets')((parseInt(data.sets) || exercise.sets) + 1)}
            aria-label="Increase sets"
          >+</button>
        </div>
      </div>

      {/* KG + Reps */}
      <div className={styles.row2}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor={`kg-${index}`}>Weight (kg)</label>
          <input
            id={`kg-${index}`}
            className={styles.numInput}
            type="number"
            inputMode="decimal"
            placeholder="—"
            value={data.kg || ''}
            onChange={e => set('kg')(e.target.value)}
            min={0}
            aria-label="Weight in kilograms"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor={`reps-${index}`}>Reps</label>
          <input
            id={`reps-${index}`}
            className={styles.numInput}
            type="number"
            inputMode="numeric"
            placeholder="—"
            value={data.reps || ''}
            onChange={e => set('reps')(e.target.value)}
            min={0}
            aria-label="Repetitions"
          />
        </div>
      </div>

      {/* RIR */}
      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel} id={`rir-label-${index}`}>
          RIR <span className={styles.fieldNote}>(reps in reserve)</span>
        </div>
        <div className={styles.chips} role="group" aria-labelledby={`rir-label-${index}`}>
          {RIR_OPTIONS.map(r => (
            <button
              key={r}
              className={`${styles.chip} ${data.rir === r ? styles.chipOn : ''}`}
              onClick={() => set('rir')(data.rir === r ? '' : r)}
              aria-pressed={data.rir === r}
              aria-label={`${r} reps in reserve`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Next / Complete */}
      <button
        className={styles.nextBtn}
        onClick={isLast ? onComplete : onNext}
        aria-label={isLast ? 'Complete training day' : `Next exercise: ${exercise.name}`}
      >
        {isLast ? 'Complete Day' : (
          <>Next <ChevronRight size={14} aria-hidden="true" /></>
        )}
      </button>
    </motion.div>
  )
}

// ── Main sheet ────────────────────────────────────────────────────────────────
export default function ResistanceSheet({ isOpen, onClose }) {
  const sessions   = useStore(s => s.sessions)
  const addSession = useStore(s => s.addSession)

  const date    = today()
  const session = sessions.find(s => s.date === date) || {}
  const gymDay  = session.gymDay || deriveGymDay(sessions, date) || 1
  const exercises = getExercises(gymDay)

  // -1 = overview, 0+ = exercise index
  const [step, setStep]       = useState(-1)
  const [exData, setExData]   = useState({}) // { index: { sets, kg, reps, rir } }

  // Reset step when sheet opens
  useEffect(() => {
    if (isOpen) {
      setStep(-1)
      // Initialise dtype + gymDay on session
      if (!session.dtype) {
        addSession({ ...session, date, dtype: 'Resistance training', gymDay })
      }
    }
  }, [isOpen])

  const updateEx = (index, data) => {
    setExData(prev => ({ ...prev, [index]: data }))
  }

  const saveAndAdvance = (index) => {
    const ex   = exercises[index]
    const data = exData[index] || {}
    // Build supersets structure matching V1 format
    const updatedSess = buildSession(session, exercises, exData, gymDay)
    addSession({ ...updatedSess, date, dtype: 'Resistance training', gymDay })
    setStep(index + 1)
  }

  const complete = () => {
    const updatedSess = buildSession(session, exercises, exData, gymDay)
    addSession({ ...updatedSess, date, dtype: 'Resistance training', gymDay, completed: true })
    onClose()
  }

  return (
    <SheetBase
      isOpen={isOpen}
      onClose={onClose}
      layoutId="card-resistance"
      title="Resistance training"
      titleId="resistance-title"
    >
      <AnimatePresence mode="wait">
        {step === -1 ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ExerciseList
              gymDay={gymDay}
              onStart={() => setStep(0)}
            />
          </motion.div>
        ) : (
          <ExerciseEntry
            key={step}
            exercise={exercises[step]}
            index={step}
            total={exercises.length}
            data={exData[step] || { sets: exercises[step]?.sets }}
            onChange={(data) => updateEx(step, data)}
            onNext={() => saveAndAdvance(step)}
            onComplete={complete}
          />
        )}
      </AnimatePresence>
    </SheetBase>
  )
}

// Build V1-compatible supersets structure from flat exercise data
function buildSession(session, exercises, exData, gymDay) {
  const supersetMap = {}
  exercises.forEach((ex, i) => {
    if (!supersetMap[ex.supersetLabel]) supersetMap[ex.supersetLabel] = []
    const d = exData[i] || {}
    supersetMap[ex.supersetLabel].push({
      name:    ex.name,
      muscle:  ex.muscle,
      muscle2: ex.muscle2 || '',
      sets:    d.sets || ex.sets,
      kg:      d.kg   || '',
      reps:    d.reps || '',
      rir:     d.rir  || '',
    })
  })
  const supersets = Object.entries(supersetMap).map(([label, exs]) => ({
    label,
    exercises: exs,
  }))
  return { ...session, supersets, gymDay }
}
