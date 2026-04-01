import useStore from '../../store/useStore'
import styles from './LogPage.module.css'

const today = () => new Date().toISOString().split('T')[0]

const TRAINING_TYPES = [
  { id: 'rest',           label: 'Rest' },
  { id: 'resistance',     label: 'Resistance\ntraining' },
  { id: 'bjj',            label: 'BJJ' },
  { id: 'resistance+bjj', label: 'Resistance\ntraining + BJJ' },
]

export default function LogPage() {
  const sessions   = useStore(s => s.sessions)
  const openSheet  = useStore(s => s.openSheet)
  const todaySession = sessions.find(s => s.date === today())
  const hasTraining  = !!todaySession?.dtype
  const hasCheckin   = !!(todaySession?.sleep || todaySession?.energy || todaySession?.soreness)

  // Readiness summary label
  const readinessLabel = hasCheckin
    ? [todaySession.sleep, todaySession.energy, todaySession.soreness].filter(Boolean).join(' · ')
    : null

  // Training summary label
  const trainingLabel = hasTraining ? todaySession.dtype : null

  // Session is "in progress" if training type selected but not yet completed
  const inProgress = hasTraining && !todaySession?.completed

  return (
    <div className={styles.page}>
      {/* ── Week nav ──────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.wordmark}>
          Meso<sup className={styles.sup}>+</sup>
        </div>
        <div className={styles.weekNav}>
          <button className={styles.weekArr} aria-label="Previous week">‹</button>
          <div className={styles.weekLabel}>
            <span className={styles.weekMain}>W1 · Calibration</span>
            <span className={styles.weekSub}>23 Mar – 29 Mar · Three numbers ···</span>
          </div>
          <button className={styles.weekArr} aria-label="Next week">›</button>
          <span className={styles.edit} aria-label="Edit mesocycle">···</span>
        </div>
      </header>

      {/* ── Sections ──────────────────────────────────────── */}
      <div className={styles.sections}>

        {/* CHECK-IN */}
        <section className={styles.section} aria-labelledby="checkin-heading">
          <h2 className={styles.sectionTitle} id="checkin-heading">Check-in</h2>
          <button
            className={styles.card}
            onClick={() => openSheet('readiness')}
            aria-label={readinessLabel ? `Readiness: ${readinessLabel}. Tap to edit.` : 'Log readiness check-in'}
          >
            <span className={styles.cardLabel}>Readiness</span>
            {readinessLabel && (
              <span className={styles.cardValue}>{readinessLabel}</span>
            )}
          </button>
        </section>

        {/* TRAINING */}
        <section className={styles.section} aria-labelledby="training-heading">
          <h2 className={styles.sectionTitle} id="training-heading">Training</h2>
          {trainingLabel ? (
            <button
              className={styles.card}
              onClick={() => openSheet(todaySession.dtype === 'Rest' ? 'rest' : todaySession.dtype === 'BJJ' ? 'bjj' : todaySession.dtype === 'BJJ + Gym' ? 'resistance+bjj' : 'resistance')}
              aria-label={`${trainingLabel}. Tap to continue.`}
            >
              <span className={styles.cardLabel}>{trainingLabel}</span>
              {todaySession?.gymDay && (
                <span className={styles.cardValue}>Day {['A','B','C','D'][todaySession.gymDay - 1]}</span>
              )}
            </button>
          ) : (
            <div className={styles.typeGrid} role="group" aria-label="Select training type">
              {TRAINING_TYPES.map(({ id, label }) => (
                <button
                  key={id}
                  className={styles.typeBtn}
                  onClick={() => openSheet(id)}
                  aria-label={label.replace('\n', ' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* REFLECT */}
        <section className={styles.section} aria-labelledby="reflect-heading">
          <h2 className={styles.sectionTitle} id="reflect-heading">Reflect</h2>
          <div className={styles.reflectRow}>
            <button
              className={`${styles.card} ${styles.cardHalf} ${!hasTraining ? styles.cardInactive : ''}`}
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
            <button
              className={`${styles.card} ${styles.cardHalf}`}
              onClick={() => openSheet('notes')}
              aria-label="Add notes"
            >
              <span className={styles.cardLabel}>Notes</span>
              {todaySession?.notes && (
                <span className={styles.cardValue} aria-label={`Note: ${todaySession.notes}`}>
                  {todaySession.notes.slice(0, 40)}{todaySession.notes.length > 40 ? '…' : ''}
                </span>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* ── Quick start / Continue ─────────────────────────── */}
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
  )
}
