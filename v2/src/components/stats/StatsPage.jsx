import { useState, useMemo } from 'react'
import useStore from '../../store/useStore'
import { today, getMonday, addDays, weekDays, fmtShort, fmtWeekday } from '../../lib/dates'
import { readinessScore, readinessLabel } from '../../lib/readiness'
import { getMuscleSetTotals, MUSCLES, MUSCLE_TARGETS, MUSCLE_DISPLAY } from '../../lib/muscles'
import MuscleChart from './MuscleChart'
import ReadinessTrend from './ReadinessTrend'
import styles from './StatsPage.module.css'

const FILTERS = ['Week', 'Month', 'Meso', 'All']

export default function StatsPage() {
  const sessions  = useStore(s => s.sessions)
  const mesoStart = useStore(s => s.mesoStart)
  const phases    = useStore(s => s.phases)

  const [detail, setDetail] = useState(null)   // null | 'muscle' | 'readiness' | 'sessions'
  const [filter, setFilter] = useState('Week')
  const [muscleSort, setMuscleSort] = useState('head-to-toe') // 'head-to-toe' | 'high-low'

  const todayStr = today()
  const weekMon  = getMonday(todayStr)

  // Sessions in selected window
  const filtered = useMemo(() => {
    if (!sessions?.length) return []
    if (filter === 'Week') {
      const sun = addDays(weekMon, 6)
      return sessions.filter(s => s.date >= weekMon && s.date <= sun)
    }
    if (filter === 'Month') {
      const cutoff = addDays(todayStr, -30)
      return sessions.filter(s => s.date >= cutoff)
    }
    if (filter === 'Meso') {
      if (!mesoStart) return sessions
      return sessions.filter(s => s.date >= mesoStart)
    }
    return sessions
  }, [sessions, filter, weekMon, todayStr, mesoStart])

  // This week's sessions
  const weekSessions = useMemo(() => {
    const sun = addDays(weekMon, 6)
    return (sessions || []).filter(s => s.date >= weekMon && s.date <= sun)
  }, [sessions, weekMon])

  // Last session
  const lastSession = useMemo(() => {
    const sorted = [...(sessions || [])].sort((a, b) => b.date.localeCompare(a.date))
    return sorted.find(s => s.date <= todayStr) || null
  }, [sessions, todayStr])

  // Readiness for today or most recent
  const todaySession = (sessions || []).find(s => s.date === todayStr)
  const readinessVal = todaySession
    ? readinessScore(todaySession.sleep, todaySession.energy, todaySession.soreness)
    : null

  // Muscle totals for filtered range
  const muscleTotals = useMemo(() => getMuscleSetTotals(filtered), [filtered])

  // Week-over-week comparison
  const prevMon = addDays(weekMon, -7)
  const prevSun = addDays(weekMon, -1)
  const prevWeekSessions = useMemo(() => (sessions || []).filter(s => s.date >= prevMon && s.date <= prevSun), [sessions, prevMon, prevSun])
  const thisWeekSets = useMemo(() => getMuscleSetTotals(weekSessions), [weekSessions])
  const prevWeekSets = useMemo(() => getMuscleSetTotals(prevWeekSessions), [prevWeekSessions])
  const totalThisWeek = MUSCLES.reduce((t, m) => t + (thisWeekSets[m] || 0), 0)
  const totalPrevWeek = MUSCLES.reduce((t, m) => t + (prevWeekSets[m] || 0), 0)
  const weekDelta = totalPrevWeek > 0 ? Math.round(((totalThisWeek - totalPrevWeek) / totalPrevWeek) * 100) : null

  if (detail === 'muscle') {
    return (
      <MuscleDetail
        muscleTotals={muscleTotals}
        filter={filter}
        setFilter={setFilter}
        muscleSort={muscleSort}
        setMuscleSort={setMuscleSort}
        onBack={() => setDetail(null)}
      />
    )
  }

  if (detail === 'readiness') {
    return (
      <ReadinessDetail
        sessions={sessions || []}
        onBack={() => setDetail(null)}
      />
    )
  }

  if (detail === 'sessions') {
    return (
      <SessionsDetail
        sessions={sessions || []}
        onBack={() => setDetail(null)}
      />
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Stats</h1>
      </header>

      <div className={styles.grid}>

        {/* ── This week ── */}
        <button className={styles.card} onClick={() => setDetail('sessions')} aria-label={`This week: ${weekSessions.length} sessions. Tap for details.`}>
          <span className={styles.cardLabel}>This week</span>
          <span className={styles.cardBig}>{weekSessions.length}</span>
          <span className={styles.cardSub}>session{weekSessions.length !== 1 ? 's' : ''}</span>
        </button>

        {/* ── Last session ── */}
        <button className={styles.card} onClick={() => setDetail('sessions')} aria-label={lastSession ? `Last session: ${lastSession.dtype} on ${fmtShort(lastSession.date)}. Tap for details.` : 'No sessions logged yet.'}>
          <span className={styles.cardLabel}>Last session</span>
          {lastSession ? (
            <>
              <span className={styles.cardBig}>{fmtShort(lastSession.date)}</span>
              <span className={styles.cardSub}>{lastSession.dtype}</span>
            </>
          ) : (
            <span className={styles.cardSub}>None yet</span>
          )}
        </button>

        {/* ── Readiness ── */}
        <button className={styles.card} onClick={() => setDetail('readiness')} aria-label={readinessVal != null ? `Readiness today: ${readinessLabel(readinessVal)}, ${readinessVal}. Tap for trend.` : 'No readiness logged today. Tap for trend.'}>
          <span className={styles.cardLabel}>Readiness</span>
          {readinessVal != null ? (
            <>
              <span className={styles.cardBig}>{readinessVal}</span>
              <span className={styles.cardSub}>{readinessLabel(readinessVal)}</span>
            </>
          ) : (
            <span className={styles.cardSub}>Not logged</span>
          )}
          <ReadinessTrend sessions={sessions || []} mini />
        </button>

        {/* ── vs Last week ── */}
        <button className={styles.card} onClick={() => setDetail('muscle')} aria-label={weekDelta != null ? `Volume vs last week: ${weekDelta > 0 ? '+' : ''}${weekDelta}%. Tap for muscle breakdown.` : 'Volume comparison. Tap for muscle breakdown.'}>
          <span className={styles.cardLabel}>vs Last week</span>
          {weekDelta != null ? (
            <>
              <span className={`${styles.cardBig} ${weekDelta > 0 ? styles.pos : weekDelta < 0 ? styles.neg : ''}`}>
                {weekDelta > 0 ? '+' : ''}{weekDelta}%
              </span>
              <span className={styles.cardSub}>total sets</span>
            </>
          ) : (
            <span className={styles.cardSub}>{totalThisWeek} sets</span>
          )}
        </button>

        {/* ── Muscle overview (full width) ── */}
        <button className={`${styles.card} ${styles.cardWide}`} onClick={() => setDetail('muscle')} aria-label="Weekly muscle set overview. Tap for detail.">
          <span className={styles.cardLabel}>Muscle overview</span>
          <MuscleChart totals={muscleTotals} mini />
        </button>

      </div>
    </div>
  )
}

// ── Detail views ──────────────────────────────────────────────────────────────

function MuscleDetail({ muscleTotals, filter, setFilter, muscleSort, setMuscleSort, onBack }) {
  const orderedMuscles = muscleSort === 'high-low'
    ? [...MUSCLES].sort((a, b) => (muscleTotals[b] || 0) - (muscleTotals[a] || 0))
    : MUSCLES

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Back to Stats overview">‹ Stats</button>
        <h1 className={styles.title}>Muscle load</h1>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.filterRow} role="group" aria-label="Time filter">
          {FILTERS.map(f => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterOn : ''}`} onClick={() => setFilter(f)} aria-pressed={filter === f}>{f}</button>
          ))}
        </div>
        <div className={styles.sortRow} role="group" aria-label="Sort order">
          <button className={`${styles.sortBtn} ${muscleSort === 'head-to-toe' ? styles.sortOn : ''}`} onClick={() => setMuscleSort('head-to-toe')} aria-pressed={muscleSort === 'head-to-toe'}>Head to toe</button>
          <button className={`${styles.sortBtn} ${muscleSort === 'high-low' ? styles.sortOn : ''}`} onClick={() => setMuscleSort('high-low')} aria-pressed={muscleSort === 'high-low'}>Highest first</button>
        </div>
      </div>

      <MuscleChart totals={muscleTotals} muscles={orderedMuscles} />
    </div>
  )
}

function ReadinessDetail({ sessions, onBack }) {
  // Last 14 days
  const days = Array.from({ length: 14 }, (_, i) => addDays(today(), -13 + i))
  const sessMap = Object.fromEntries(sessions.map(s => [s.date, s]))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Back to Stats overview">‹ Stats</button>
        <h1 className={styles.title}>Readiness</h1>
      </header>

      <ReadinessTrend sessions={sessions} />

      <div className={styles.readinessList}>
        {[...days].reverse().map(d => {
          const s = sessMap[d]
          const score = s ? readinessScore(s.sleep, s.energy, s.soreness) : null
          return (
            <div key={d} className={styles.readinessRow}>
              <span className={styles.readinessDate}>{fmtShort(d)}</span>
              <span className={styles.readinessMeta}>{s?.sleep || '—'} · {s?.energy || '—'} · {s?.soreness || '—'}</span>
              <span className={`${styles.readinessScore} ${score != null ? styles[`r-${readinessLabel(score).toLowerCase().replace(' ', '-')}`] : ''}`}>
                {score != null ? score : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SessionsDetail({ sessions, onBack }) {
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Back to Stats overview">‹ Stats</button>
        <h1 className={styles.title}>Sessions</h1>
      </header>

      <div className={styles.sessionList}>
        {sorted.length === 0 && <p className={styles.empty}>No sessions logged yet.</p>}
        {sorted.map(s => {
          const score = readinessScore(s.sleep, s.energy, s.soreness)
          const totalSets = (s.supersets || []).reduce((t, ss) => t + ss.exercises.reduce((tt, ex) => tt + (Number(ex.sets) || 0), 0), 0)
          return (
            <div key={s.date} className={styles.sessionRow}>
              <div className={styles.sessionLeft}>
                <span className={styles.sessionDate}>{fmtShort(s.date)}</span>
                <span className={styles.sessionWeekday}>{fmtWeekday(s.date)}</span>
              </div>
              <div className={styles.sessionMid}>
                <span className={styles.sessionType}>{s.dtype || '—'}</span>
                {totalSets > 0 && <span className={styles.sessionMeta}>{totalSets} sets</span>}
                {s.bjjDuration && <span className={styles.sessionMeta}>{s.bjjDuration} min BJJ</span>}
              </div>
              <div className={styles.sessionRight}>
                {s.perf && <span className={`${styles.sessionPerf} ${s.perf === 'Exceeded' ? styles.perfGood : s.perf === 'Below par' ? styles.perfBad : ''}`}>{s.perf}</span>}
                {score != null && <span className={styles.sessionReadiness}>{score}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
