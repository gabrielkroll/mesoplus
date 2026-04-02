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
import TextArea from '../atoms/TextArea'
import Button from '../atoms/Button'
import styles from './ResistanceBJJSheet.module.css'

const RIR_OPTIONS  = ['4+', '3', '2', '1', '0']
const DAY_LABELS   = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' }
const GC_OPTIONS   = ['Clinch', 'Guard', 'Half Guard', 'Side Control', 'Mount', 'Back', 'Turtle', 'Standing']
const PERF_OPTIONS = ['Below par', 'On track', 'Exceeded']

export default function ResistanceBJJSheet({ isOpen, onClose, date }) {
  const sessions       = useStore(s => s.sessions)
  const addSession     = useStore(s => s.addSession)
  const removeTraining = useStore(s => s.removeTraining)

  const session      = sessions.find(s => s.date === date) || {}
  const gymDay       = session.gymDay || deriveGymDay(sessions, date) || 1
  const exercises    = getExercises(gymDay)
  const pastSessions = (sessions || []).filter(s => s.date < date)

  const [phase, setPhase]     = useState('gym-overview')
  const [exStep, setExStep]   = useState(0)
  const [exData, setExData]   = useState({})
  const [bjjData, setBjjData] = useState({})

  useEffect(() => {
    if (isOpen) {
      setPhase('gym-overview')
      setExStep(0)
      // Pre-populate gym data from saved session
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
      setBjjData({
        duration: session.bjjDuration || '',
        gc:       session.bjjGc       || '',
        good:     session.bjjGood     || '',
        next:     session.bjjNext     || '',
        perf:     session.perf        || '',
      })
      if (!session.dtype) {
        addSession({ ...session, date, dtype: 'Resistance training + BJJ', gymDay })
      }
    }
  }, [isOpen])

  const saveGymAndAdvance = (index) => {
    const updated = buildSession(session, exercises, exData, gymDay)
    addSession({ ...updated, date, dtype: 'Resistance training + BJJ', gymDay })
    if (index + 1 < exercises.length) setExStep(index + 1)
    else setPhase('bjj-overview')
  }

  const completeBJJ = () => {
    const updated = buildSession(session, exercises, exData, gymDay)
    addSession({
      ...updated, date,
      dtype:       'Resistance training + BJJ',
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
  const title    = phase.startsWith('bjj') ? 'BJJ' : 'Resistance + BJJ'

  return (
    <SheetBase isOpen={isOpen} onClose={onClose} layoutId="card-resistance+bjj" title={title} titleId="rbj-title">
      <AnimatePresence mode="wait">

        {phase === 'gym-overview' && (
          <motion.div key="gym-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
            <Button fullWidth onClick={() => setPhase('gym-ex')}>Start first exercise</Button>
            <Button fullWidth variant="ghost" onClick={() => { removeTraining(date); onClose() }}>
              Change training type
            </Button>
          </motion.div>
        )}

        {phase === 'gym-ex' && (
          <GymExercise
            key={`ex-${exStep}`}
            exercise={exercises[exStep]}
            index={exStep}
            total={exercises.length}
            data={exData[exStep] || { sets: exercises[exStep]?.sets }}
            onChange={(data) => updateEx(exStep, data)}
            onNext={() => saveGymAndAdvance(exStep)}
            isLast={exStep === exercises.length - 1}
            lastSet={getLastSet(pastSessions, exercises[exStep]?.name)}
          />
        )}

        {phase === 'bjj-overview' && (
          <motion.div key="bjj-ov" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ type: 'spring', stiffness: 400, damping: 38 }}>
            <p className={styles.bjjOverviewText}>Gym done. Now log your mat session.</p>
            <Button fullWidth onClick={() => setPhase('bjj-journal')}>Start mat journal</Button>
          </motion.div>
        )}

        {phase === 'bjj-journal' && (
          <BJJJournal key="bjj-journal" data={bjjData} onChange={setBjjData} onComplete={completeBJJ} />
        )}

      </AnimatePresence>
    </SheetBase>
  )
}

function GymExercise({ exercise, index, total, data, onChange, onNext, isLast, lastSet }) {
  const set  = (field) => (val) => onChange({ ...data, [field]: val })
  const sets = parseInt(data.sets) || exercise.sets

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
            {lastSet.kg ? `${lastSet.kg}kg` : ''}{lastSet.kg && lastSet.reps ? ' × ' : ''}{lastSet.reps || ''}
            {lastSet.rir ? ` · RIR ${lastSet.rir}` : ''}
          </span>
          <span className={styles.lastSetDate}>{fmtShort(lastSet.date)}</span>
          <button
            className={styles.fillBtn}
            onClick={() => onChange({ ...data, kg: lastSet.kg || data.kg, reps: lastSet.reps || data.reps, rir: lastSet.rir || data.rir })}
            aria-label="Fill from last session"
          >Use</button>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel} id={`rbj-sets-${index}`}>Sets</div>
        <Stepper value={sets} onChange={(v) => set('sets')(v)} min={0} max={20} labelId={`rbj-sets-${index}`} />
      </div>

      <div className={styles.row2}>
        <NumInput id={`rbj-kg-${index}`}   label="Weight (kg)" value={data.kg}   onChange={set('kg')}   inputMode="decimal" />
        <NumInput id={`rbj-reps-${index}`} label="Reps"        value={data.reps} onChange={set('reps')} inputMode="numeric" />
      </div>

      <ChipGroup id={`rbj-rir-${index}`} label="RIR" options={RIR_OPTIONS} value={data.rir || ''} onChange={(v) => set('rir')(v)} flex />

      <Button fullWidth onClick={onNext}>
        {isLast ? 'Continue to BJJ →' : 'Next exercise →'}
      </Button>
    </motion.div>
  )
}

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
      <NumInput id="rbjj-duration" label="Duration (min)" value={data.duration} onChange={set('duration')} inputMode="numeric" />
      <ChipGroup id="rbjj-gc"   label="Position focus" options={GC_OPTIONS}   value={data.gc || ''}   onChange={set('gc')} />
      <TextArea  id="rbjj-good" label="What worked"    value={data.good}       onChange={set('good')} placeholder="Techniques, setups, timing…" />
      <TextArea  id="rbjj-next" label="Drill next"     value={data.next}       onChange={set('next')} placeholder="Gaps, counters, escapes…" />
      <ChipGroup id="rbjj-perf" label="Performance"   options={PERF_OPTIONS}  value={data.perf || ''} onChange={set('perf')} />
      <Button fullWidth onClick={onComplete}>Complete Day</Button>
    </motion.div>
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
