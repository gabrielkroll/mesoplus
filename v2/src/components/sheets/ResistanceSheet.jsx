import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'
import SheetBase from './SheetBase'
import { getExercises, deriveGymDay, TEMPLATES } from '../../lib/templates'
import { fmtShort } from '../../lib/dates'
import { getLastSet } from '../../lib/suggestions'
import ProgressBar from '../atoms/ProgressBar'
import Stepper from '../atoms/Stepper'
import NumInput from '../atoms/NumInput'
import ChipGroup from '../molecules/ChipGroup'
import Button from '../atoms/Button'
import styles from './ResistanceSheet.module.css'

const RIR_OPTIONS = ['4+', '3', '2', '1', '0']
const DAY_LABELS  = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' }

// ── Exercise overview list ────────────────────────────────────────────────────
function ExerciseList({ gymDay, onStart }) {
  return (
    <div className={styles.overviewWrap}>
      <div className={styles.dayTag}>Full Body · Day {DAY_LABELS[gymDay]}</div>
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
      <Button fullWidth onClick={onStart}>Start first exercise</Button>
    </div>
  )
}

// ── Single exercise entry ─────────────────────────────────────────────────────
function ExerciseEntry({ exercise, index, total, data, onChange, onNext, onComplete, lastSet }) {
  const isLast = index === total - 1
  const set    = (field) => (val) => onChange({ ...data, [field]: val })
  const sets   = parseInt(data.sets) || exercise.sets

  return (
    <motion.div
      className={styles.entryWrap}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', stiffness: 400, damping: 38 }}
    >
      <ProgressBar value={index + 1} max={total} />

      <div className={styles.exName}>{exercise.name}</div>
      <div className={styles.exMuscle}>
        {exercise.muscle}{exercise.muscle2 ? ` + ${exercise.muscle2}` : ''}
        <span className={styles.exReps}> · {exercise.rf}–{exercise.rc} reps</span>
      </div>

      {lastSet && (
        <div className={styles.lastSet}>
          <span className={styles.lastSetLabel}>Last</span>
          <span className={styles.lastSetVal}>
            {lastSet.kg ? `${lastSet.kg}kg` : ''}
            {lastSet.kg && lastSet.reps ? ' × ' : ''}
            {lastSet.reps || ''}
            {lastSet.rir ? ` · RIR ${lastSet.rir}` : ''}
          </span>
          <span className={styles.lastSetDate}>{fmtShort(lastSet.date)}</span>
          <button
            className={styles.fillBtn}
            onClick={() => onChange({ ...data, kg: lastSet.kg || data.kg, reps: lastSet.reps || data.reps, rir: lastSet.rir || data.rir })}
            aria-label={`Fill from last session`}
          >Use</button>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel} id={`sets-lbl-${index}`}>Sets</div>
        <Stepper value={sets} onChange={(v) => set('sets')(v)} min={0} max={20} labelId={`sets-lbl-${index}`} />
      </div>

      <div className={styles.row2}>
        <NumInput id={`kg-${index}`}   label="Weight (kg)" value={data.kg}   onChange={set('kg')}   inputMode="decimal" />
        <NumInput id={`reps-${index}`} label="Reps"        value={data.reps} onChange={set('reps')} inputMode="numeric" />
      </div>

      <ChipGroup
        id={`rir-lbl-${index}`}
        label="RIR (reps in reserve)"
        options={RIR_OPTIONS}
        value={data.rir || ''}
        onChange={(v) => set('rir')(v)}
        flex
      />

      <Button fullWidth onClick={isLast ? onComplete : onNext}>
        {isLast ? 'Complete Day' : 'Next exercise →'}
      </Button>
    </motion.div>
  )
}

// ── Main sheet ────────────────────────────────────────────────────────────────
export default function ResistanceSheet({ isOpen, onClose, date }) {
  const sessions       = useStore(s => s.sessions)
  const addSession     = useStore(s => s.addSession)
  const removeTraining = useStore(s => s.removeTraining)

  const session    = sessions.find(s => s.date === date) || {}
  const gymDay     = session.gymDay || deriveGymDay(sessions, date) || 1
  const exercises  = getExercises(gymDay)
  const pastSessions = (sessions || []).filter(s => s.date < date)

  const [step, setStep]     = useState(-1)
  const [exData, setExData] = useState({})

  useEffect(() => {
    if (isOpen) {
      setStep(-1)
      // Pre-populate exData from any already-saved exercise data
      const saved = {}
      if (session.supersets) {
        let i = 0
        session.supersets.forEach(ss => {
          ss.exercises.forEach(ex => {
            saved[i] = { sets: ex.sets, kg: ex.kg, reps: ex.reps, rir: ex.rir }
            i++
          })
        })
      }
      setExData(saved)
      if (!session.dtype) {
        addSession({ ...session, date, dtype: 'Resistance training', gymDay })
      }
    }
  }, [isOpen])

  const updateEx = (index, data) => setExData(prev => ({ ...prev, [index]: data }))

  const saveAndAdvance = (index) => {
    const updated = buildSession(session, exercises, exData, gymDay)
    addSession({ ...updated, date, dtype: 'Resistance training', gymDay })
    setStep(index + 1)
  }

  const complete = () => {
    const updated = buildSession(session, exercises, exData, gymDay)
    addSession({ ...updated, date, dtype: 'Resistance training', gymDay, completed: true })
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
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ExerciseList gymDay={gymDay} onStart={() => setStep(0)} />
            <Button fullWidth variant="ghost" onClick={() => { removeTraining(date); onClose() }}>
              Change training type
            </Button>
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
            lastSet={getLastSet(pastSessions, exercises[step]?.name)}
          />
        )}
      </AnimatePresence>
    </SheetBase>
  )
}

function buildSession(session, exercises, exData, gymDay) {
  const supersetMap = {}
  exercises.forEach((ex, i) => {
    if (!supersetMap[ex.supersetLabel]) supersetMap[ex.supersetLabel] = []
    const d = exData[i] || {}
    supersetMap[ex.supersetLabel].push({
      name: ex.name, muscle: ex.muscle, muscle2: ex.muscle2 || '',
      sets: d.sets || ex.sets, kg: d.kg || '', reps: d.reps || '', rir: d.rir || '',
    })
  })
  return {
    ...session,
    supersets: Object.entries(supersetMap).map(([label, exs]) => ({ label, exercises: exs })),
    gymDay,
  }
}
