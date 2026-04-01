import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import { today, getMonday, addDays, fmtShort, fmtWeekday, mesoPosition, weekDays } from '../../lib/dates'
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

const DEFAULT_PHASES = [
  { id: 'accumulation',    label: 'Accumulation',    weeks: 3 },
  { id: 'intensification', label: 'Intensification', weeks: 3 },
  { id: 'peak',            label: 'Peak',            weeks: 2 },
  { id: 'deload',          label: 'Deload',          weeks: 1 },
]

function dtypeToSheet(dtype) {
  if (dtype === 'Rest') return 'rest'
  if (dtype === 'BJJ')  return 'bjj'
  if (dtype === 'Resistance training + BJJ') return 'resistance+bjj'
  return 'resistance'
}

function dtypeToLayoutId(dtype) {
  if (dtype === 'Rest') return 'card-rest'
  if (dtype === 'BJJ')  return 'card-bjj'
  if (dtype === 'Resistance training + BJJ') return 'card-resistance+bjj'
  return 'card-resistance'
}

export default function LogPage() {
  const sessions    = useStore(s => s.sessions)
  const mesoStart   = useStore(s => s.mesoStart)
  const phases      = useStore(s => s.phases)
  const activeSheet = useStore(s => s.activeSheet)
  const openSheet   = useStore(s => s.openSheet)
  const closeSheet  = useStore(s => s.closeSheet)

  const todayStr  = today()
  const [weekOffset, setWeekOffset] = useState(0)   // 0 = current week

  // Week the user is viewing
  const viewMon = addDays(getMonday(todayStr), weekOffset * 7)
  const viewSun = addDays(viewMon, 6)
  const isThisWeek = weekOffset === 0

  // Today's session (always)
  const todaySession = (sessions || []).find(s => s.date === todayStr)
  const hasTraining  = !!todaySession?.dtype
  const hasCheckin   = !!(todaySession?.sleep || todaySession?.energy || todaySession?.soreness)
  const inProgress   = hasTraining && !todaySession?.completed

  // Readiness display
  const readinessVal = hasCheckin
    ? readinessScore(todaySession.sleep, todaySession.energy, todaySession.soreness)
    : null
  const readinessTag = readinessVal != null
    ? `${readinessVal} · ${readinessLabel(readinessVal)}`
    : null

  // Phase/week label
  const activePlan = phases?.length > 0 ? phases : DEFAULT_PHASES
  const mesoPos    = useMemo(
    () => mesoPosition(viewMon, mesoStart, activePlan),
    [viewMon, mesoStart, activePlan]
  )
  const weekMain = mesoPos
    ? `W${mesoPos.weekInMeso} · ${activePlan[mesoPos.phaseIdx]?.label || ''}`
    : `${fmtShort(viewMon)} – ${fmtShort(viewSun)}`
  const weekSub = mesoPos
    ? `Week ${mesoPos.weekInPhase} of ${activePlan[mesoPos.phaseIdx]?.weeks || '?'} in phase`
    : !mesoStart ? 'Set your meso start date in Plan' : ''

  // Sessions in viewed week (for the mini-calendar strip)
  const viewWeekSessions = useMemo(() => {
    return (sessions || []).filter(s => s.date >= viewMon && s.date <= viewSun)
  }, [sessions, viewMon, viewSun])

  const handleContinue = () => {
    if (inProgress) openSheet(dtypeToSheet(todaySession?.dtype))
    else openSheet('readiness')
  }

  return (
    <>
      <div className={styles.page}>

        {/* ── Skip link ── */}
        <a href="#main-content" className={styles.skipLink}>Skip to main content</a>

        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.wordmark} aria-label="Meso+">
            Meso<sup className={styles.sup} aria-hidden="true">+</sup>
          </div>
          <nav className={styles.weekNav} aria-label="Week navigation">
            <button
              className={styles.weekArr}
              onClick={() => setWeekOffset(w => w - 1)}
              aria-label="Previous week"
            >‹</button>
            <div className={styles.weekLabel} aria-live="polite" aria-atomic="true">
              <span className={styles.weekMain}>{weekMain}</span>
              {weekSub && <span className={styles.weekSub}>{weekSub}</span>}
            </div>
            <button
              className={styles.weekArr}
              onClick={() => setWeekOffset(w => Math.min(0, w + 1))}
              aria-label="Next week"
              aria-disabled={isThisWeek}
              disabled={isThisWeek}
            >›</button>
          </nav>
        </header>

        {/* ── Week strip (always visible) ── */}
        <WeekStrip days={weekDays(viewMon)} sessions={sessions || []} todayStr={todayStr} />

        {/* ── Past week view ── */}
        {!isThisWeek ? (
          <main id="main-content" className={styles.sections} role="main">
            <PastWeekView sessions={viewWeekSessions} onReturn={() => setWeekOffset(0)} />
          </main>
        ) : (
          <main id="main-content" className={styles.sections} role="main">

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
                    aria-label={`${todaySession.dtype}${inProgress ? ', in progress' : ', completed'}. Tap to open.`}
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
                <div className={styles.typeGrid} role="group" aria-label="Select training type for today">
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
                    aria-label="Add session notes"
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

            {/* CTA */}
            <div className={styles.cta}>
              <button
                className={`${styles.ctaBtn} ${inProgress ? styles.ctaContinue : ''}`}
                onClick={handleContinue}
                aria-label={inProgress ? 'Continue your session' : 'Quick start — begin with check-in'}
              >
                {inProgress ? 'Continue' : 'Quick start'}
              </button>
            </div>

          </main>
        )}
      </div>

      {/* ── Sheets ── */}
      <ReadinessSheet      isOpen={activeSheet === 'readiness'}      onClose={closeSheet} />
      <RestSheet           isOpen={activeSheet === 'rest'}           onClose={closeSheet} />
      <ResistanceSheet     isOpen={activeSheet === 'resistance'}     onClose={closeSheet} />
      <BJJSheet            isOpen={activeSheet === 'bjj'}            onClose={closeSheet} />
      <ResistanceBJJSheet  isOpen={activeSheet === 'resistance+bjj'} onClose={closeSheet} />
      <NotesSheet          isOpen={activeSheet === 'notes'}          onClose={closeSheet} />
      <PerformanceSheet    isOpen={activeSheet === 'performance'}    onClose={closeSheet} />
    </>
  )
}

// ── Week strip ────────────────────────────────────────────────────────────────
function WeekStrip({ days, sessions, todayStr }) {
  const sessMap = Object.fromEntries(sessions.map(s => [s.date, s]))
  return (
    <div className={styles.weekStrip} role="list" aria-label="Week at a glance">
      {days.map(d => {
        const s   = sessMap[d]
        const dot = s?.dtype ? (s.completed ? 'done' : 'progress') : null
        const isToday = d === todayStr
        return (
          <div
            key={d}
            className={`${styles.stripDay} ${isToday ? styles.stripToday : ''}`}
            role="listitem"
            aria-label={`${fmtWeekday(d)}${isToday ? ', today' : ''}${s?.dtype ? `, ${s.dtype}${s.completed ? ', completed' : ', in progress'}` : ''}`}
          >
            <span className={styles.stripWd}>{fmtWeekday(d).slice(0,3).toUpperCase()}</span>
            <span className={styles.stripDt}>{new Date(d + 'T12:00').getDate()}</span>
            {dot && (
              <span
                className={`${styles.stripDot} ${dot === 'done' ? styles.stripDotDone : styles.stripDotProgress}`}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Past week view ────────────────────────────────────────────────────────────
function PastWeekView({ sessions, onReturn }) {
  if (sessions.length === 0) {
    return (
      <div className={styles.pastEmpty}>
        <p className={styles.pastEmptyText}>No sessions logged this week.</p>
        <button className={styles.returnBtn} onClick={onReturn}>← Back to today</button>
      </div>
    )
  }

  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className={styles.pastWrap}>
      <div className={styles.pastList}>
        {sorted.map(s => {
          const totalSets = (s.supersets || []).reduce(
            (t, ss) => t + ss.exercises.reduce((tt, ex) => tt + (Number(ex.sets) || 0), 0), 0
          )
          const score = readinessScore(s.sleep, s.energy, s.soreness)
          return (
            <div key={s.date} className={styles.pastRow}>
              <div className={styles.pastLeft}>
                <span className={styles.pastDate}>{fmtShort(s.date)}</span>
                <span className={styles.pastWd}>{fmtWeekday(s.date)}</span>
              </div>
              <div className={styles.pastMid}>
                <span className={styles.pastType}>{s.dtype || '—'}</span>
                {totalSets > 0 && <span className={styles.pastMeta}>{totalSets} sets</span>}
                {s.bjjDuration && <span className={styles.pastMeta}>{s.bjjDuration} min BJJ</span>}
              </div>
              <div className={styles.pastRight}>
                {s.perf && <span className={`${styles.pastPerf} ${s.perf === 'Exceeded' ? styles.perfGood : s.perf === 'Below par' ? styles.perfBad : ''}`}>{s.perf}</span>}
                {score != null && <span className={styles.pastScore}>{score}</span>}
              </div>
            </div>
          )
        })}
      </div>
      <button className={styles.returnBtn} onClick={onReturn} aria-label="Return to this week">← Back to today</button>
    </div>
  )
}
