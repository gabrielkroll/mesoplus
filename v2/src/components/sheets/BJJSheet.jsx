import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'
import SheetBase from './SheetBase'
import ChipGroup from '../molecules/ChipGroup'
import NumInput from '../atoms/NumInput'
import TextArea from '../atoms/TextArea'
import Button from '../atoms/Button'
import { today } from '../../lib/dates'
import styles from './BJJSheet.module.css'

const GC_OPTIONS   = ['Clinch', 'Guard', 'Half Guard', 'Side Control', 'Mount', 'Back', 'Turtle', 'Standing']
const PERF_OPTIONS = ['Below par', 'On track', 'Exceeded']

// ── Overview ──────────────────────────────────────────────────────────────────
function BJJOverview({ onStart }) {
  return (
    <div className={styles.overviewWrap}>
      <p className={styles.overviewText}>
        Log your mat session — techniques, positions, what worked, what to drill next.
      </p>
      <Button fullWidth onClick={onStart}>Start mat journal</Button>
    </div>
  )
}

// ── Journal ───────────────────────────────────────────────────────────────────
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
      <NumInput
        id="bjj-duration"
        label="Duration (min)"
        value={data.duration}
        onChange={set('duration')}
        inputMode="numeric"
      />
      <ChipGroup
        id="bjj-gc"
        label="Position focus"
        options={GC_OPTIONS}
        value={data.gc || ''}
        onChange={set('gc')}
      />
      <TextArea
        id="bjj-good"
        label="What worked"
        value={data.good}
        onChange={set('good')}
        placeholder="Techniques, setups, timing…"
      />
      <TextArea
        id="bjj-next"
        label="Drill next"
        value={data.next}
        onChange={set('next')}
        placeholder="Gaps, counters, escapes to work on…"
      />
      <ChipGroup
        id="bjj-perf"
        label="Performance"
        options={PERF_OPTIONS}
        value={data.perf || ''}
        onChange={set('perf')}
      />
      <Button fullWidth onClick={onComplete}>Complete Day</Button>
    </motion.div>
  )
}

// ── Main sheet ────────────────────────────────────────────────────────────────
export default function BJJSheet({ isOpen, onClose, layoutId = 'card-bjj' }) {
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
      if (!session.dtype) addSession({ ...session, date, dtype: 'BJJ' })
    }
  }, [isOpen])

  const complete = () => {
    addSession({
      ...session, date,
      dtype:       session.dtype || 'BJJ',
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
    <SheetBase isOpen={isOpen} onClose={onClose} layoutId={layoutId} title="BJJ" titleId="bjj-title">
      <AnimatePresence mode="wait">
        {step === -1 ? (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BJJOverview onStart={() => setStep(0)} />
          </motion.div>
        ) : (
          <BJJJournal key="journal" data={data} onChange={setData} onComplete={complete} />
        )}
      </AnimatePresence>
    </SheetBase>
  )
}
