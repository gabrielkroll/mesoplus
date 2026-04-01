import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import ReadinessSheet from '../sheets/ReadinessSheet'
import RestSheet from '../sheets/RestSheet'
import ResistanceSheet from '../sheets/ResistanceSheet'
import NotesSheet from '../sheets/NotesSheet'
import PerformanceSheet from '../sheets/PerformanceSheet'
import styles from './LogPage.module.css'

const today = () => new Date().toISOString().split('T')[0]

const TRAINING_TYPES = [
  { id: 'rest',           label: 'Rest' },
  { id: 'resistance',     label: 'Resistance\ntraining' },
  { id: 'bjj',            label: 'BJJ' },
  { id: 'resistance+bjj', label: 'Resistance\ntraining + BJJ' },
]

export default function LogPage() {
  const sessions    = useStore(s => s.sessions)
  const activeSheet = useStore(s => s.activeSheet)
  const openSheet   = useStore(s => s.openSheet)
  const closeSheet  = useStore(s => s.closeSheet)

  const todaySession  = sessions.find(s => s.date === today())
  const hasTraining   = !!todaySession?.dtype
  const hasCheckin    = !!(todaySession?.sleep || todaySession?.energy || todaySession?.soreness)
  const inProgress    = hasTraining && !todaySession?.completed

  const readinessLabel = hasCheckin
    ? [todaySession.sleep, todaySession.energy, todaySession.soreness].filter(Boolean).join(' · ')
    : null

  return (
    <>
      <div className={styles.page}>

        {/* ── Header ──────────────────────────────────────── */}
        <header className={styles.header}>
          <div className={styles.wordmark}>
            Meso<sup className={styles.sup}>+</sup>
          </div>
          <div className={styles.weekNav}>
            <button className={styles.weekArr} aria-label="Previous week">‹</button>
            <div className={styles.weekLabel}>
              <span className={styles.weekMain}>W1 · Calibration</span>
              <span className={styles.weekSub}>Set your meso start date in Plan</span>
            </div>
            <button className={styles.weekArr} aria-label="Next week">›</button>
          </div>
        </header>

        {/* ── Sections ────────────────────────────────────── */}
        <div className={styles.sections}>

          {/* CHECK-IN */}
          <section className={styles.section} aria-labelledby="checkin-heading">
            <h2 className={styles.sectionTitle} id="checkin-heading">Check-in</h2>

            {/* This motion.div shares layoutId with ReadinessSheet */}
            <motion.div layoutId="card-readiness">
              <button
                className={styles.card}
                onClick={() => openSheet('readiness')}
                aria-label={readinessLabel
                  ? `Readiness: ${readinessLabel}. Tap to edit.`
                  : 'Log readiness check-in'}
              >
                <span className={styles.cardLabel}>Readiness</span>
                {readinessLabel && (
                  <span className={styles.cardValue}>{readinessLabel}</span>
                )}
              </button>
            </motion.div>
          </section>

          {/* TRAINING */}
          <section className={styles.section} aria-labelledby="training-heading">
            <h2 className={styles.sectionTitle} id="training-heading">Training</h2>
            {hasTraining ? (
              <motion.div layoutId={`card-${todaySession.dtype === 'Rest' ? 'rest' : 'resistance'}`}>
                <button
                  className={`${styles.card} ${styles.cardFull}`}
                  onClick={() => openSheet('resistance')}
                  aria-label={`${todaySession.dtype}. Tap to continue.`}
                >
                  <span className={styles.cardLabel}>{todaySession.dtype}</span>
                  {todaySession?.gymDay && (
                    <span className={styles.cardValue}>
                      Day {['A','B','C','D'][todaySession.gymDay - 1]}
                    </span>
                  )}
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
                  aria-label={hasTraining ? 'Log performance' : 'Complete training to log performance'}
                  aria-disabled={!hasTraining}
                >
                  <span className={styles.cardLabel}>Performance</span>
                  {todaySession?.perf && (
                    <span className={styles.cardValue}>{todaySession.perf}</span>
                  )}
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
                      {todaySession.notes.slice(0, 40)}
                      {todaySession.notes.length > 40 ? '…' : ''}
                    </span>
                  )}
                </button>
              </motion.div>
            </div>
          </section>
        </div>

        {/* ── Quick start / Continue ───────────────────────── */}
        <div className={styles.cta}>
          <button
            className={styles.ctaBtn}
            onClick={() => openSheet(inProgress ? '__continue__' : 'readiness')}
            aria-label={inProgress ? 'Continue your session' : 'Quick start — begin check-in'}
          >
            {inProgress ? 'Continue' : 'Quick start'}
          </button>
        </div>
      </div>

      {/* ── Sheets ──────────────────────────────────────────── */}
      <ReadinessSheet
        isOpen={activeSheet === 'readiness'}
        onClose={closeSheet}
      />
      <RestSheet
        isOpen={activeSheet === 'rest'}
        onClose={closeSheet}
      />
      <ResistanceSheet
        isOpen={activeSheet === 'resistance'}
        onClose={closeSheet}
      />
      <NotesSheet
        isOpen={activeSheet === 'notes'}
        onClose={closeSheet}
      />
      <PerformanceSheet
        isOpen={activeSheet === 'performance'}
        onClose={closeSheet}
      />
    </>
  )
}
