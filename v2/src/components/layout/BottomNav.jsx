import { CalendarDays, BarChart2, BrainCircuit, ClipboardList, User } from 'lucide-react'
import useStore from '../../store/useStore'
import styles from './BottomNav.module.css'

const TABS = [
  { id: 'log',      label: 'Log',      Icon: CalendarDays   },
  { id: 'stats',    label: 'Stats',    Icon: BarChart2      },
  { id: 'analysis', label: 'Analysis', Icon: BrainCircuit   },
  { id: 'plan',     label: 'Plan',     Icon: ClipboardList  },
  { id: 'profile',  label: 'Profile',  Icon: User           },
]

export default function BottomNav() {
  const activeTab = useStore(s => s.activeTab)
  const setTab    = useStore(s => s.setTab)

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`${styles.item} ${activeTab === id ? styles.active : ''}`}
          onClick={() => setTab(id)}
          aria-current={activeTab === id ? 'page' : undefined}
          aria-label={label}
        >
          <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </nav>
  )
}
