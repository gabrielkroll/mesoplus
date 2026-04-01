import { useMemo } from 'react'
import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import { today, getMonday, addDays, fmtShort, mesoPosition } from '../../lib/dates'
import { readinessScore, readinessLabel } from '../../lib/readiness'
import ReadinessSheet from '../sheets/ReadinessSheet'
import RestSheet from '../sheets/RestSheet'
import ResistanceSheet from '../sheets/ResistanceSheet'
import BJJSheet from '../sheets/BJJSheet'
import ResistanceBJJSheet from '../sheets/ResistanceBJJSheet'
import NotesSheet from '../sheets/NotesSheet'
import PerformanceSheet from '../sheets/PerformanceSheet'
import styles from './LogPage.module.css'

const TRAINING_TYPES = [
  { id: 'rest',           label: 'Rest' },
  { id: 'resistance',     label: 'Resistance\ntraining' },
  { id: 'bjj',            label: 'BJJ' },
  { id: 'resistance+bjj', label: 'Resistance\ntraining + BJJ' },
]

function dtypeToSheet(dtype) {
  if (!dtype) return 'resistance'
  if (dtype === 'Rest') return 'rest'
  if (dtype === 'BJJ')  return 'bjj'
  if (dtype === 'Resistance training + BJJ') return 'resistance+bjj'
  return 'resistance'
}

function dtypeToLayoutId(dtype) {
  if (!dtype) return 'card-resistance'
  if (dtype === 'Rest') return 'card-rest'
  if (dtype === 'BJJ')  return 'card-bjj'
  if (dtype === 'Resistance training + BJJ') return 'card-resistance+bjj'
  return 'card-resistance'
}

const DEFAULT_PHASES = [
  { id: 'accumulation',    label: 'Accumulation',    weeks: 3 },
  { id: 'intensification', label: 'Intensification', weeks: 3 },
  { id: 'peak',            label: 'Peak',            weeks: 2 },
  { id: 'deload',          label: 'Deload',          weeks: 1 },
]

export default function LogPage() {
  const sessions    = useStore(s => s.sessions)
  const mesoStart   = useStore(s => s.mesoStart)
  const phases      = useStore(s => s.phases)
  const activeSheet = useStore(s => s.activeSheet)
  const openSheet   = useStore(s => s.openSheet)
  const closeSheet  = useStore(s => s.closeSheet)

  const todayStr     = today()
  const todaySession = (sessions || []).find(s => s.date === todayStr)
  const hasTraining  = !!todaySession?.dtype
  const hasCheckin   = !!(todaySession?.sleep || todaySession?.energy || todaySession?.soreness)
  const inProgress   = hasTraining && !todaySession?.completed

  // ── Readiness display ──
  const readinessVal = hasCheckin
    ? readinessScore(todaySession.sleep, todaySession.energy, todaySession.soreness)
    : null
  const readinessTag = readinessVal != null
    ? `${readinessVal} · ${readinessLabel(readinessVal)}`
    : null

  // ── Week / phase header ──
  const weekMon = getMonday(todayStr)
  const weekSun = addDays(weekMon, 6)

  const activePlan = phases?.length > 0 ? phases : DEFAULT_PHASES
  const mesoPos    = useMemo(
    () => mesoPosition(todayStr, mesoStart, activePlan),
    [todayStr, mesoStart, activePlan]
  )

  const weekMain = mesoPos
    ? `W${mesoPos.weekInMeso} · ${activePlan[mesoPos.phaseIdx]?.label || ''}`
    : `${fmtShort(weekMon)} – ${fmtShort(weekSun)}`

  const weekSub = mesoPos
    ? `Week ${mesoPos.weekInPhase} of ${activePlan[mesoPos.phaseIdx]?.weeks || '?'} in phase`
    : mesoStart ? '' : 'Set your meso start date in Plan'

  // ── Continue: open the right sheet ──
  const handleContinue = () => {
    if (inProgress) openSheet(dtypeToSheet(todaySession?.dtype))
    else openSheet('readiness')
  }

  return (
    <>
      <div className={styles.page}>

        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.wordmark}>
            Meso<sup className={styles.sup}>+</sup>
          </div>
          <div className={styles.weekNav}>
            <div className={styles.weekLabel}>
              <span className={styles.weekMain}>{weekMain}</span>
              {weekSub && <span className={styles.weekSub}>{weekSub}</span>}
            </div>
          </div>
        </header>

        {/* ── Sections ── */}
        <div className={styles.sections}>

          {/* CHECK-IN */}
          <section className={styles.section} aria-labelledby="checkin-heading">
            <h2 className={styles.sectionTitle} id="checkin-heading">Check-in</h2>
            <motion.div layoutId="card-readiness">
              <button
                className={styles.card}
                onClick={() => openSheet('readiness')}
                aria-label={readinessTag ? `Readiness: ${readinessTag}. Tap to edit.` : 'Log readiness check-in'}
              >
                <span className={styles.cardLabel}>Readiness</span>
                {readinessTag && <span className={styles.cardValue}>{readinessTag}</span>}
              </button>
            </motion.div>
          </section>

          {/* TRAINING */}
          <section className={styles.section} aria-labelledby="training-heading">
            <h2 className={styles.sectionTitle} id="training-heading">Training</h2>
            {hasTraining ? (
              <motion.div layoutId={dtypeToLayoutId(todaySession.dtype)}>
                <button
                  className={`${styles.card} ${styles.cardFull}`}
                  onClick={() => openSheet(dtypeToSheet(todaySession.dtype))}
                  aria-label={`${todaySession.dtype}${inProgress ? ' — in progress' : ' — completed'}. Tap to open.`}
                >
                  <span className={styles.cardLabel}>{todaySession.dtype}</span>
                  <div className={styles.cardRow}>
                    {todaySession.gymDay && (
                      <span className={styles.cardValue}>Day {['A','B','C','D'][todaySession.gymDay - 1]}</span>
                    )}
                    {todaySession.completed && (
                      <span className={styles.cardBadge} aria-label="Completed">✓</span>
                    )}
                  </div>
                </button>
              </motion.div>
            ) : (
              <div className={styles.typeGrid} role="group" aria-label="Select training type">
                {TRAINING_TYPES.map(({ id, label }) => (
                  <motion.div key={id} layoutId={`card-${id}`}>
                    <button
                      className={`${styles.typeBtn} ${styles.cardFull}`}
                      onClick={() => openSheet(id)}
                      aria-label={label.replace('\n', ' ')}
                    >
                      {label}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* REFLECT */}
          <section className={styles.section} aria-labelledby="reflect-heading">
            <h2 className={styles.sectionTitle} id="reflect-heading">Reflect</h2>
            <div className={styles.reflectRow}>
              <motion.div layoutId="card-performance" className={styles.cardHalf}>
                <button
                  className={`${styles.card} ${styles.cardFull} ${!hasTraining ? styles.cardInactive : ''}`}
                  onClick={() => hasTraining && openSheet('performance')}
                  disabled={!hasTraining}
                  aria-label={hasTraining ? 'Log performance' : 'Complete training first to log performance'}
                  aria-disabled={!hasTraining}
                >
                  <span className={styles.cardLabel}>Performance</span>
                  {todaySession?.perf && <span className={styles.cardValue}>{todaySession.perf}</span>}
                </button>
              </motion.div>
              <motion.div layoutId="card-notes" className={styles.cardHalf}>
                <button
                  className={`${styles.card} ${styles.cardFull}`}
                  onClick={() => openSheet('notes')}
                  aria-label="Add notes"
                >
                  <span className={styles.cardLabel}>Notes</span>
                  {todaySession?.notes && (
                    <span className={styles.cardValue}>
                      {todaySession.notes.slice(0, 40)}{todaySession.notes.length > 40 ? '…' : ''}
                    </span>
                  )}
                </button>
              </motion.div>
            </div>
          </section>
        </div>

        {/* ── Quick start / Continue ── */}
        <div className={styles.cta}>
          <button
            className={`${styles.ctaBtn} ${inProgress ? styles.ctaContinue : ''}`}
            onClick={handleContinue}
            aria-label={inProgress ? 'Continue your session' : 'Quick start — begin check-in'}
          >
            {inProgress ? 'Continue' : 'Quick start'}
          </button>
        </div>
      </div>

      {/* ── Sheets ── */}
      <ReadinessSheet      isOpen={activeSheet === 'readiness'}       onClose={closeSheet} />
      <RestSheet           isOpen={activeSheet === 'rest'}            onClose={closeSheet} />
      <ResistanceSheet     isOpen={activeSheet === 'resistance'}      onClose={closeSheet} />
      <BJJSheet            isOpen={activeSheet === 'bjj'}             onClose={closeSheet} />
      <ResistanceBJJSheet  isOpen={activeSheet === 'resistance+bjj'}  onClose={closeSheet} />
      <NotesSheet          isOpen={activeSheet === 'notes'}           onClose={closeSheet} />
      <PerformanceSheet    isOpen={activeSheet === 'performance'}     onClose={closeSheet} />
    </>
  )
}
