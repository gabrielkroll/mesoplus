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

  const todayStr = today()
  const [weekOffset,    setWeekOffset]    = useState(0)
  const [selectedDate,  setSelectedDate]  = useState(todayStr)

  const viewMon = addDays(getMonday(todayStr), weekOffset * 7)
  const viewSun = addDays(viewMon, 6)

  const goToWeek = (offset) => {
    const clamped = Math.min(0, offset)
    setWeekOffset(clamped)
    setSelectedDate(clamped === 0 ? todayStr : addDays(getMonday(todayStr), clamped * 7))
  }

  const isViewingToday = selectedDate === todayStr

  // Selected day's session
  const dateSession = (sessions || []).find(s => s.date === selectedDate)
  const hasTraining = !!dateSession?.dtype
  const hasCheckin  = !!(dateSession?.sleep || dateSession?.energy || dateSession?.soreness)
  const inProgress  = hasTraining && !dateSession?.completed

  const readinessVal = hasCheckin
    ? readinessScore(dateSession.sleep, dateSession.energy, dateSession.soreness)
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
    : !mesoStart ? 'Set meso start in Plan' : ''

  const viewWeekSessions = useMemo(() => {
    return (sessions || []).filter(s => s.date >= viewMon && s.date <= viewSun)
  }, [sessions, viewMon, viewSun])

  const handleContinue = () => {
    if (inProgress) openSheet(dtypeToSheet(dateSession?.dtype))
    else openSheet('readiness')
  }

  return (
    <>
      <div className={styles.page}>

        <a href="#main-content" className={styles.skipLink}>Skip to main content</a>

        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.wordmark} aria-label="Meso+">
            Meso<sup className={styles.sup} aria-hidden="true">+</sup>
          </div>
          <nav className={styles.weekNav} aria-label="Week navigation">
            <button
              className={styles.weekArr}
              onClick={() => goToWeek(weekOffset - 1)}
              aria-label="Previous week"
            >‹</button>
            <div className={styles.weekLabel} aria-live="polite" aria-atomic="true">
              <span className={styles.weekMain}>{weekMain}</span>
              {weekSub && <span className={styles.weekSub}>{weekSub}</span>}
            </div>
            <button
              className={styles.weekArr}
              onClick={() => goToWeek(weekOffset + 1)}
              aria-label="Next week"
              aria-disabled={weekOffset >= 0}
              disabled={weekOffset >= 0}
            >›</button>
          </nav>
        </header>

        {/* ── Week strip ── */}
        <WeekStrip
          days={weekDays(viewMon)}
          sessions={sessions || []}
          todayStr={todayStr}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* ── Main content ── */}
        <main id="main-content" className={styles.sections} role="main">

          {/* Date banner for past days */}
          {!isViewingToday && (
            <div className={styles.dateBanner}>
              <span className={styles.dateLabel}>
                {fmtWeekday(selectedDate)}, {fmtShort(selectedDate)}
              </span>
              <button
                className={styles.todayBtn}
                onClick={() => { setSelectedDate(todayStr); setWeekOffset(0) }}
              >
                ← Today
              </button>
            </div>
          )}

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
                {readinessTag
                  ? <span className={styles.cardValue}>{readinessTag}</span>
                  : <span className={styles.cardHint}>Tap to log</span>
                }
              </button>
            </motion.div>
          </section>

          {/* TRAINING */}
          <section className={styles.section} aria-labelledby="training-heading">
            <h2 className={styles.sectionTitle} id="training-heading">Training</h2>
            {hasTraining ? (
              <motion.div layoutId={dtypeToLayoutId(dateSession.dtype)}>
                <button
                  className={`${styles.card} ${styles.cardFull} ${dateSession.completed ? styles.cardDone : ''}`}
                  onClick={() => openSheet(dtypeToSheet(dateSession.dtype))}
                  aria-label={`${dateSession.dtype}${inProgress ? ', in progress' : ', completed'}. Tap to open.`}
                >
                  <span className={styles.cardLabel}>{dateSession.dtype}</span>
                  <div className={styles.cardRow}>
                    {dateSession.gymDay && (
                      <span className={styles.cardValue}>Day {['A','B','C','D'][dateSession.gymDay - 1]}</span>
                    )}
                    {dateSession.bjjDuration && (
                      <span className={styles.cardValue}>{dateSession.bjjDuration} min</span>
                    )}
                    {dateSession.completed && (
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
                  aria-label={hasTraining ? 'Log performance' : 'Complete training first'}
                  aria-disabled={!hasTraining}
                >
                  <span className={styles.cardLabel}>Performance</span>
                  {dateSession?.perf
                    ? <span className={styles.cardValue}>{dateSession.perf}</span>
                    : <span className={styles.cardHint}>{hasTraining ? 'Tap to log' : '—'}</span>
                  }
                </button>
              </motion.div>
              <motion.div layoutId="card-notes" className={styles.cardHalf}>
                <button
                  className={`${styles.card} ${styles.cardFull}`}
                  onClick={() => openSheet('notes')}
                  aria-label="Add session notes"
                >
                  <span className={styles.cardLabel}>Notes</span>
                  {dateSession?.notes
                    ? <span className={styles.cardValue}>
                        {dateSession.notes.slice(0, 40)}{dateSession.notes.length > 40 ? '…' : ''}
                      </span>
                    : <span className={styles.cardHint}>Tap to add</span>
                  }
                </button>
              </motion.div>
            </div>
          </section>

          {/* CTA — hide when session is completed */}
          {!dateSession?.completed && (
            <div className={styles.cta}>
              <button
                className={`${styles.ctaBtn} ${inProgress ? styles.ctaContinue : ''}`}
                onClick={handleContinue}
                aria-label={inProgress ? 'Continue your session' : 'Quick start — begin with check-in'}
              >
                {inProgress ? 'Continue' : 'Quick start'}
              </button>
            </div>
          )}

        </main>
      </div>

      {/* ── Sheets ── */}
      <ReadinessSheet      isOpen={activeSheet === 'readiness'}      onClose={closeSheet} date={selectedDate} />
      <RestSheet           isOpen={activeSheet === 'rest'}           onClose={closeSheet} date={selectedDate} />
      <ResistanceSheet     isOpen={activeSheet === 'resistance'}     onClose={closeSheet} date={selectedDate} />
      <BJJSheet            isOpen={activeSheet === 'bjj'}            onClose={closeSheet} date={selectedDate} />
      <ResistanceBJJSheet  isOpen={activeSheet === 'resistance+bjj'} onClose={closeSheet} date={selectedDate} />
      <NotesSheet          isOpen={activeSheet === 'notes'}          onClose={closeSheet} date={selectedDate} />
      <PerformanceSheet    isOpen={activeSheet === 'performance'}    onClose={closeSheet} date={selectedDate} />
    </>
  )
}

// ── Week strip ────────────────────────────────────────────────────────────────
function WeekStrip({ days, sessions, todayStr, selectedDate, onSelectDate }) {
  const sessMap = Object.fromEntries(sessions.map(s => [s.date, s]))
  return (
    <div className={styles.weekStrip} role="list" aria-label="Week at a glance">
      {days.map(d => {
        const s          = sessMap[d]
        const dot        = s?.dtype ? (s.completed ? 'done' : 'progress') : null
        const isToday    = d === todayStr
        const isSelected = d === selectedDate
        return (
          <button
            key={d}
            className={`${styles.stripDay} ${isToday ? styles.stripToday : ''} ${isSelected ? styles.stripSelected : ''}`}
            onClick={() => onSelectDate(d)}
            role="listitem"
            aria-label={`${fmtWeekday(d)}${isToday ? ', today' : ''}${s?.dtype ? `, ${s.dtype}${s.completed ? ', done' : ', in progress'}` : ''}`}
            aria-pressed={isSelected}
          >
            <span className={styles.stripWd}>{fmtWeekday(d).slice(0,3).toUpperCase()}</span>
            <span className={styles.stripDt}>{new Date(d + 'T12:00').getDate()}</span>
            {dot && (
              <span
                className={`${styles.stripDot} ${dot === 'done' ? styles.stripDotDone : styles.stripDotProgress}`}
                aria-hidden="true"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
