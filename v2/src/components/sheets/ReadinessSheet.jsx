import useStore from '../../store/useStore'
import SheetBase from './SheetBase'
import ChipGroup from '../molecules/ChipGroup'
import Button from '../atoms/Button'
import { today } from '../../lib/dates'
import {
  SLEEP_OPTIONS, ENERGY_OPTIONS, SORENESS_OPTIONS,
  readinessScore, readinessLabel,
} from '../../lib/readiness'
import styles from './ReadinessSheet.module.css'

export default function ReadinessSheet({ isOpen, onClose }) {
  const sessions   = useStore(s => s.sessions)
  const addSession = useStore(s => s.addSession)

  const date    = today()
  const session = sessions.find(s => s.date === date) || {}

  const sleep    = session.sleep    || ''
  const energy   = session.energy   || ''
  const soreness = session.soreness || ''
  const score    = readinessScore(sleep, energy, soreness)
  const label    = readinessLabel(score)

  const update = (field) => (val) => addSession({ ...session, date, [field]: val })

  return (
    <SheetBase
      isOpen={isOpen}
      onClose={onClose}
      layoutId="card-readiness"
      title="Readiness"
      titleId="readiness-title"
      footer={<Button fullWidth onClick={onClose}>Close</Button>}
    >
      {/* Score */}
      <div className={styles.scoreWrap} aria-live="polite" aria-atomic="true">
        <div
          className={`${styles.scoreNumber} ${score != null ? styles[`score-${label.toLowerCase().replace(' ', '-')}`] : ''}`}
          aria-label={`Readiness score: ${score ?? 'not yet calculated'}`}
        >
          {score ?? '—'}
        </div>
        <div className={styles.scoreLabel}>{label || '—'}</div>
      </div>

      {/* Inputs */}
      <div className={styles.inputs}>
        <ChipGroup id="rs-sleep"    label="Sleep"    options={SLEEP_OPTIONS}    value={sleep}    onChange={update('sleep')}    size="sm" />
        <ChipGroup id="rs-energy"   label="Energy"   options={ENERGY_OPTIONS}   value={energy}   onChange={update('energy')}   />
        <ChipGroup id="rs-soreness" label="Soreness" options={SORENESS_OPTIONS} value={soreness} onChange={update('soreness')} />
      </div>
    </SheetBase>
  )
}
