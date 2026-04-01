import { useState } from 'react'
import useStore from '../../store/useStore'
import Button from '../atoms/Button'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const sessions = useStore(s => s.sessions)
  const [copied, setCopied] = useState(false)
  const [exportMsg, setExportMsg] = useState('')

  const exportCSV = () => {
    if (!sessions?.length) {
      setExportMsg('No sessions to export.')
      return
    }

    const headers = [
      'Date', 'Type', 'Gym Day', 'Sleep', 'Energy', 'Soreness',
      'Performance', 'Notes', 'BJJ Duration', 'BJJ Position', 'BJJ Good', 'BJJ Next',
      'Total Sets',
    ]

    const rows = sessions.map(s => {
      const totalSets = (s.supersets || []).reduce(
        (t, ss) => t + ss.exercises.reduce((tt, ex) => tt + (Number(ex.sets) || 0), 0), 0
      )
      return [
        s.date,
        s.dtype || '',
        s.gymDay || '',
        s.sleep || '',
        s.energy || '',
        s.soreness || '',
        s.perf || '',
        (s.notes || '').replace(/,/g, ';'),
        s.bjjDuration || '',
        s.bjjGc || '',
        (s.bjjGood || '').replace(/,/g, ';'),
        (s.bjjNext || '').replace(/,/g, ';'),
        totalSets || '',
      ].join(',')
    })

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mesoplus-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExportMsg(`Exported ${sessions.length} sessions.`)
    setTimeout(() => setExportMsg(''), 3000)
  }

  const copyDataJSON = () => {
    const data = localStorage.getItem('mp7')
    if (!data) return
    navigator.clipboard.writeText(data).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const sessionCount = sessions?.length || 0
  const completedCount = (sessions || []).filter(s => s.completed).length
  const gymCount = (sessions || []).filter(s => s.dtype && s.dtype.includes('Resistance')).length
  const bjjCount = (sessions || []).filter(s => s.dtype && s.dtype.includes('BJJ')).length

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
      </header>

      {/* ── Stats summary ── */}
      <section className={styles.section} aria-labelledby="profile-stats">
        <h2 className={styles.sectionTitle} id="profile-stats">Your data</h2>
        <div className={styles.statGrid}>
          <Stat label="Sessions" value={sessionCount} />
          <Stat label="Completed" value={completedCount} />
          <Stat label="Gym" value={gymCount} />
          <Stat label="BJJ" value={bjjCount} />
        </div>
      </section>

      {/* ── Export ── */}
      <section className={styles.section} aria-labelledby="profile-export">
        <h2 className={styles.sectionTitle} id="profile-export">Export</h2>
        <div className={styles.actionList}>
          <div className={styles.actionRow}>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>Download CSV</span>
              <span className={styles.actionSub}>All sessions as a spreadsheet</span>
            </div>
            <Button onClick={exportCSV} variant="ghost">Export</Button>
          </div>
          {exportMsg && <p className={styles.msg} role="status" aria-live="polite">{exportMsg}</p>}

          <div className={styles.actionRow}>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>Copy JSON</span>
              <span className={styles.actionSub}>Raw mp7 data to clipboard</span>
            </div>
            <Button onClick={copyDataJSON} variant="ghost">{copied ? 'Copied!' : 'Copy'}</Button>
          </div>
        </div>
      </section>

      {/* ── App info ── */}
      <section className={styles.section} aria-labelledby="profile-app">
        <h2 className={styles.sectionTitle} id="profile-app">App</h2>
        <div className={styles.infoList}>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Version</span>
            <span className={styles.infoVal}>V2 · Beta</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Storage</span>
            <span className={styles.infoVal}>localStorage · mp7</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Compatibility</span>
            <span className={styles.infoVal}>V1 data compatible</span>
          </div>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statVal}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}
