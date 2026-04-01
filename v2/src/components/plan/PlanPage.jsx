import { useState } from 'react'
import useStore from '../../store/useStore'
import { TEMPLATES } from '../../lib/templates'
import { getWeeklyMuscleGoals, MUSCLE_DISPLAY } from '../../lib/muscles'
import Stepper from '../atoms/Stepper'
import styles from './PlanPage.module.css'

const DAY_LABELS = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' }

const DEFAULT_PHASES = [
  { id: 'accumulation', label: 'Accumulation', weeks: 3 },
  { id: 'intensification', label: 'Intensification', weeks: 3 },
  { id: 'peak', label: 'Peak', weeks: 2 },
  { id: 'deload', label: 'Deload', weeks: 1 },
]

export default function PlanPage() {
  const mesoStart    = useStore(s => s.mesoStart)
  const phases       = useStore(s => s.phases)
  const phaseIdx     = useStore(s => s.phaseIdx)
  const setGoals     = useStore(s => s.setGoals)
  const globalSetGoal = useStore(s => s.globalSetGoal)
  const updateSetGoal = useStore(s => s.updateSetGoal)
  const setAllGoals   = useStore(s => s.setAllGoals)
  const setMesoStart  = useStore(s => s.setMesoStart)
  const setPhases     = useStore(s => s.setPhases)

  const [openDay, setOpenDay] = useState(1)

  const activePlan = phases?.length > 0 ? phases : DEFAULT_PHASES

  const weeklyGoals = getWeeklyMuscleGoals(setGoals, TEMPLATES)

  // Muscles that have any weekly set contribution
  const musclesWithGoals = Object.entries(weeklyGoals)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])

  const saveMesoStart = (val) => setMesoStart(val)
  const savePhases = (newPhases) => setPhases(newPhases)

  return (
    <div className={styles.page} role="main">
      <header className={styles.header}>
        <h1 className={styles.title}>Plan</h1>
      </header>

      {/* ── Meso start date ── */}
      <section className={styles.section} aria-labelledby="plan-meso-start">
        <h2 className={styles.sectionTitle} id="plan-meso-start">Mesocycle start</h2>
        <input
          type="date"
          className={styles.dateInput}
          value={mesoStart || ''}
          onChange={e => saveMesoStart(e.target.value)}
          aria-label="Mesocycle start date"
        />
      </section>

      {/* ── Phase structure ── */}
      <section className={styles.section} aria-labelledby="plan-phases">
        <h2 className={styles.sectionTitle} id="plan-phases">Phases</h2>
        <div className={styles.phaseList}>
          {activePlan.map((ph, i) => (
            <PhaseRow
              key={ph.id || i}
              phase={ph}
              active={i === phaseIdx}
              onWeeksChange={(delta) => {
                const updated = activePlan.map((p, j) =>
                  j === i ? { ...p, weeks: Math.max(1, (p.weeks || 1) + delta) } : p
                )
                savePhases(updated)
              }}
            />
          ))}
        </div>
      </section>

      {/* ── Weekly muscle totals ── */}
      {musclesWithGoals.length > 0 && (
        <section className={styles.section} aria-labelledby="plan-muscle-totals">
          <h2 className={styles.sectionTitle} id="plan-muscle-totals">Weekly set goals</h2>
          <div className={styles.muscleTotals}>
            {musclesWithGoals.map(([muscle, sets]) => (
              <div key={muscle} className={styles.muscleRow}>
                <span className={styles.muscleName}>{MUSCLE_DISPLAY[muscle] || muscle}</span>
                <span className={styles.muscleSets}>{sets} sets</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Adjust all sets ── */}
      <section className={styles.section} aria-labelledby="plan-global">
        <h2 className={styles.sectionTitle} id="plan-global">Adjust all sets</h2>
        <p className={styles.hint}>Sets all exercises across all days to the same value.</p>
        <div className={styles.globalRow}>
          <Stepper
            value={globalSetGoal}
            onChange={(val) => {
              setAllGoals(val)
              // Apply to all exercises in all days
              for (let day = 1; day <= 4; day++) {
                const template = TEMPLATES[day] || []
                for (const ss of template) {
                  for (const ex of ss.exercises) {
                    updateSetGoal(day, ex.name, val)
                  }
                }
              }
            }}
            min={1}
            max={10}
            labelId="plan-global"
          />
        </div>
      </section>

      {/* ── Day cards ── */}
      <section className={styles.section} aria-labelledby="plan-days">
        <h2 className={styles.sectionTitle} id="plan-days">Training goals</h2>
        {[1, 2, 3, 4].map(day => (
          <DayCard
            key={day}
            day={day}
            goals={setGoals[day] || {}}
            isOpen={openDay === day}
            onToggle={() => setOpenDay(openDay === day ? null : day)}
            onSetGoal={(exName, val) => updateSetGoal(day, exName, val)}
          />
        ))}
      </section>
    </div>
  )
}

// ── Phase row ─────────────────────────────────────────────────────────────────
function PhaseRow({ phase, active, onWeeksChange }) {
  return (
    <div className={`${styles.phaseRow} ${active ? styles.phaseActive : ''}`}>
      <div className={styles.phaseLeft}>
        {active && <span className={styles.phaseDot} aria-label="Current phase" />}
        <span className={styles.phaseName}>{phase.label || phase.id}</span>
      </div>
      <div className={styles.phaseWeeks} role="group" aria-label={`${phase.label || phase.id} weeks`}>
        <button className={styles.phaseBtn} onClick={() => onWeeksChange(-1)} aria-label="Remove week">−</button>
        <span className={styles.phaseWk} aria-live="polite">{phase.weeks || 1} wk</span>
        <button className={styles.phaseBtn} onClick={() => onWeeksChange(1)} aria-label="Add week">+</button>
      </div>
    </div>
  )
}

// ── Day card ──────────────────────────────────────────────────────────────────
function DayCard({ day, goals, isOpen, onToggle, onSetGoal }) {
  const template = TEMPLATES[day] || []
  const exercises = template.flatMap(ss => ss.exercises)
  const totalSets = exercises.reduce((t, ex) => t + (goals[ex.name] ?? ex.sets), 0)

  return (
    <div className={styles.dayCard}>
      <button
        className={styles.dayHeader}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`day-body-${day}`}
      >
        <span className={styles.dayLabel}>Day {DAY_LABELS[day]}</span>
        <span className={styles.dayMeta}>{exercises.length} exercises · {totalSets} sets</span>
        <span className={styles.dayChevron} aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div id={`day-body-${day}`} className={styles.dayBody}>
          {template.map(ss => (
            <div key={ss.label} className={styles.supersetBlock}>
              <div className={styles.supersetLabel}>{ss.label}</div>
              {ss.exercises.map(ex => {
                const val = goals[ex.name] ?? ex.sets
                return (
                  <div key={ex.name} className={styles.exRow}>
                    <div className={styles.exInfo}>
                      <span className={styles.exName}>{ex.name}</span>
                      <span className={styles.exMuscle}>{ex.muscle}{ex.muscle2 ? ` + ${ex.muscle2}` : ''}</span>
                    </div>
                    <div className={styles.exStepper} role="group" aria-label={`${ex.name} sets goal`}>
                      <button className={styles.exBtn} onClick={() => onSetGoal(ex.name, Math.max(0, val - 1))} aria-label="Decrease sets">−</button>
                      <span className={styles.exVal} aria-live="polite">{val}</span>
                      <button className={styles.exBtn} onClick={() => onSetGoal(ex.name, val + 1)} aria-label="Increase sets">+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
