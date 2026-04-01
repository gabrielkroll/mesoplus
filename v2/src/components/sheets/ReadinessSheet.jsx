import useStore from '../../store/useStore'
import SheetBase from './SheetBase'
import styles from './ReadinessSheet.module.css'

const today = () => new Date().toISOString().split('T')[0]

const SLEEP_C    = ['≤5.5h','6h','6.5h','7h','7.5h','8h','≥8.5h']
const ENERGY_C   = ['Very low','Low','Moderate','High','Very high']
const SORENESS_C = ['Severe','High','Moderate','Low','None']

const SLEEP_SCORE    = {'≤5.5h':10,'6h':25,'6.5h':40,'7h':60,'7.5h':75,'8h':90,'≥8.5h':100}
const ENERGY_SCORE   = {'Very low':10,'Low':30,'Moderate':55,'High':80,'Very high':100}
const SORENESS_SCORE = {'Severe':10,'High':30,'Moderate':55,'Low':80,'None':100}

function readinessScore(sleep, energy, soreness) {
  const sl = SLEEP_SCORE[sleep] || 0
  const en = ENERGY_SCORE[energy] || 0
  const so = SORENESS_SCORE[soreness] || 0
  const cnt = [sl, en, so].filter(Boolean).length
  if (!cnt) return null
  if (cnt === 3) return Math.round(sl * 0.4 + en * 0.35 + so * 0.25)
  return Math.round((sl + en + so) / cnt)
}

function scoreLabel(score) {
  if (score === null) return '—'
  if (score >= 80) return 'High'
  if (score >= 55) return 'Moderate'
  if (score >= 30) return 'Low'
  return 'Very low'
}

function ChipGroup({ label, options, value, onChange }) {
  return (
    <div className={styles.chipGroup}>
      <div className={styles.chipLabel}>{label}</div>
      <div className={styles.chips} role="group" aria-label={label}>
        {options.map(opt => (
          <button
            key={opt}
            className={`${styles.chip} ${value === opt ? styles.chipOn : ''}`}
            onClick={() => onChange(opt === value ? '' : opt)}
            aria-pressed={value === opt}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ReadinessSheet({ isOpen, onClose }) {
  const sessions   = useStore(s => s.sessions)
  const addSession = useStore(s => s.addSession)
  const date       = today()
  const session    = sessions.find(s => s.date === date) || {}

  const sleep    = session.sleep    || ''
  const energy   = session.energy   || ''
  const soreness = session.soreness || ''
  const score    = readinessScore(sleep, energy, soreness)

  const update = (field) => (val) => {
    addSession({ ...session, date, [field]: val })
  }

  return (
    <SheetBase
      isOpen={isOpen}
      onClose={onClose}
      layoutId="card-readiness"
      title="Readiness"
      titleId="readiness-title"
      footer={
        <button className={styles.closeFooterBtn} onClick={onClose}>
          Close
        </button>
      }
    >
      {/* Score */}
      <div className={styles.scoreWrap} aria-live="polite" aria-atomic="true">
        <div className={styles.scoreNumber} aria-label={`Readiness score: ${score ?? 'not yet calculated'}`}>
          {score ?? '—'}
        </div>
        <div className={styles.scoreLabel}>{scoreLabel(score)}</div>
      </div>

      {/* Inputs */}
      <div className={styles.inputs}>
        <ChipGroup
          label="Sleep"
          options={SLEEP_C}
          value={sleep}
          onChange={update('sleep')}
        />
        <ChipGroup
          label="Energy"
          options={ENERGY_C}
          value={energy}
          onChange={update('energy')}
        />
        <ChipGroup
          label="Soreness"
          options={SORENESS_C}
          value={soreness}
          onChange={update('soreness')}
        />
      </div>
    </SheetBase>
  )
}
