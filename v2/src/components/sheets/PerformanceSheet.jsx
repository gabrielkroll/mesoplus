import useStore from '../../store/useStore'
import SheetBase from './SheetBase'
import Button from '../atoms/Button'
import styles from './PerformanceSheet.module.css'

const OPTIONS = [
  { id: 'Below par', label: 'Below par',  sub: "Harder than expected, didn't hit targets" },
  { id: 'On track',  label: 'On track',   sub: 'Solid session, met targets'               },
  { id: 'Exceeded',  label: 'Exceeded',   sub: 'Felt strong, beat targets'                },
]

export default function PerformanceSheet({ isOpen, onClose, date }) {
  const sessions   = useStore(s => s.sessions)
  const addSession = useStore(s => s.addSession)

  const session = sessions.find(s => s.date === date) || {}
  const current = session.perf || ''

  const select = (id) => {
    addSession({ ...session, date, perf: id === current ? '' : id })
    if (id !== current) onClose()
  }

  return (
    <SheetBase
      isOpen={isOpen}
      onClose={onClose}
      layoutId="card-performance"
      title="Performance"
      titleId="performance-title"
      footer={<Button fullWidth variant="ghost" onClick={onClose}>Close</Button>}
    >
      <div
        className={styles.options}
        role="group"
        aria-label="Performance rating"
      >
        {OPTIONS.map(({ id, label, sub }) => (
          <button
            key={id}
            className={`${styles.option} ${current === id ? styles.optionOn : ''}`}
            onClick={() => select(id)}
            aria-pressed={current === id}
          >
            <span className={styles.optionLabel}>{label}</span>
            <span className={styles.optionSub}>{sub}</span>
          </button>
        ))}
      </div>
    </SheetBase>
  )
}
