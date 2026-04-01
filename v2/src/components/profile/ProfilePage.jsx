import { useState } from 'react'
import useStore from '../../store/useStore'
import Button from '../atoms/Button'
import { syncToSheets } from '../../lib/sync'
import styles from './ProfilePage.module.css'

const SYNC_KEY      = 'mp7_synced_dates'
const SCRIPT_KEY    = 'mp7_script_url'
const SHEET_TAB_KEY = 'mp7_sheet_tab'

function getSyncedDates() {
  try { return new Set(JSON.parse(localStorage.getItem(SYNC_KEY) || '[]')) } catch { return new Set() }
}

function saveSyncedDates(set) {
  localStorage.setItem(SYNC_KEY, JSON.stringify([...set]))
}

export default function ProfilePage() {
  const sessions = useStore(s => s.sessions)

  const [copied,     setCopied]     = useState(false)
  const [exportMsg,  setExportMsg]  = useState('')
  const [scriptUrl,  setScriptUrl]  = useState(() => localStorage.getItem(SCRIPT_KEY) || '')
  const [sheetTab,   setSheetTab]   = useState(() => localStorage.getItem(SHEET_TAB_KEY) || 'Sessions')
  const [syncStatus, setSyncStatus] = useState('')   // '', 'syncing', 'ok', 'error'
  const [syncMsg,    setSyncMsg]    = useState('')
  const [showScript, setShowScript] = useState(false)

  const syncedDates   = getSyncedDates()
  const pendingCount  = (sessions || []).filter(s => s.date && !syncedDates.has(s.date)).length

  // ── CSV export ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!sessions?.length) { setExportMsg('No sessions to export.'); return }

    const headers = [
      'Date','Type','Gym Day','Sleep','Energy','Soreness',
      'Performance','Notes','BJJ Duration','BJJ Position','BJJ Good','BJJ Next','Total Sets',
    ]
    const rows = (sessions || []).map(s => {
      const totalSets = (s.supersets || []).reduce(
        (t, ss) => t + ss.exercises.reduce((tt, ex) => tt + (Number(ex.sets) || 0), 0), 0
      )
      return [
        s.date, s.dtype||'', s.gymDay||'', s.sleep||'', s.energy||'', s.soreness||'',
        s.perf||'', (s.notes||'').replace(/,/g,';'), s.bjjDuration||'', s.bjjGc||'',
        (s.bjjGood||'').replace(/,/g,';'), (s.bjjNext||'').replace(/,/g,';'), totalSets||'',
      ].join(',')
    })

    const csv  = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `mesoplus-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExportMsg(`Exported ${sessions.length} sessions.`)
    setTimeout(() => setExportMsg(''), 3000)
  }

  const copyJSON = () => {
    const data = localStorage.getItem('mp7')
    if (!data) return
    navigator.clipboard.writeText(data).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Google Sheets sync ────────────────────────────────────────────────────
  const saveScriptUrl = (val) => {
    setScriptUrl(val)
    localStorage.setItem(SCRIPT_KEY, val)
  }
  const saveSheetTab = (val) => {
    setSheetTab(val)
    localStorage.setItem(SHEET_TAB_KEY, val)
  }

  const runSync = async () => {
    if (!scriptUrl.trim()) { setSyncMsg('Paste your Apps Script URL first.'); setSyncStatus('error'); return }
    setSyncStatus('syncing')
    setSyncMsg('Syncing…')
    try {
      const result = await syncToSheets(scriptUrl.trim(), sheetTab || 'Sessions', sessions || [], getSyncedDates())
      if (result.ok) {
        if (result.dates?.length) {
          const updated = getSyncedDates()
          result.dates.forEach(d => updated.add(d))
          saveSyncedDates(updated)
        }
        setSyncStatus('ok')
        setSyncMsg(result.added > 0 ? `✓ Synced ${result.added} session${result.added !== 1 ? 's' : ''}.` : '✓ Already up to date.')
      }
    } catch (e) {
      setSyncStatus('error')
      setSyncMsg(`Error: ${e.message}`)
    }
    setTimeout(() => { setSyncStatus(''); setSyncMsg('') }, 5000)
  }

  const clearSyncHistory = () => {
    localStorage.removeItem(SYNC_KEY)
    setSyncMsg('Sync history cleared — all sessions will re-sync next time.')
    setSyncStatus('ok')
    setTimeout(() => { setSyncStatus(''); setSyncMsg('') }, 3000)
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const sessionCount   = sessions?.length || 0
  const completedCount = (sessions || []).filter(s => s.completed).length
  const gymCount       = (sessions || []).filter(s => s.dtype?.includes('Resistance')).length
  const bjjCount       = (sessions || []).filter(s => s.dtype?.includes('BJJ')).length

  return (
    <div className={styles.page} role="main">
      <header className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
      </header>

      {/* ── Stats ── */}
      <section className={styles.section} aria-labelledby="profile-stats">
        <h2 className={styles.sectionTitle} id="profile-stats">Your data</h2>
        <div className={styles.statGrid}>
          <Stat label="Sessions"  value={sessionCount} />
          <Stat label="Completed" value={completedCount} />
          <Stat label="Gym"       value={gymCount} />
          <Stat label="BJJ"       value={bjjCount} />
        </div>
      </section>

      {/* ── Google Sheets sync ── */}
      <section className={styles.section} aria-labelledby="profile-sync">
        <h2 className={styles.sectionTitle} id="profile-sync">Google Sheets sync</h2>

        <div className={styles.syncCard}>
          <div className={styles.syncStatus}>
            <span className={styles.syncDot} data-status={syncStatus || (scriptUrl ? 'idle' : 'none')} aria-hidden="true" />
            <span className={styles.syncLabel}>
              {scriptUrl ? `${pendingCount} session${pendingCount !== 1 ? 's' : ''} pending` : 'Not configured'}
            </span>
            <Button
              variant="ghost"
              onClick={runSync}
              disabled={syncStatus === 'syncing' || !scriptUrl}
            >
              {syncStatus === 'syncing' ? 'Syncing…' : 'Sync now'}
            </Button>
          </div>

          {syncMsg && (
            <p
              className={`${styles.syncMsg} ${syncStatus === 'error' ? styles.syncError : styles.syncOk}`}
              role="status"
              aria-live="polite"
            >
              {syncMsg}
            </p>
          )}

          {/* Setup accordion */}
          <button
            className={styles.setupToggle}
            onClick={() => setShowScript(v => !v)}
            aria-expanded={showScript}
            aria-controls="sync-setup"
          >
            {showScript ? '▲' : '▼'} {scriptUrl ? 'Edit setup' : 'Set up sync'}
          </button>

          {showScript && (
            <div id="sync-setup" className={styles.setupBody}>
              <p className={styles.setupHint}>
                In Google Sheets → Extensions → Apps Script, deploy a new Web App and paste the URL below.
                {' '}<a className={styles.setupLink} href="https://github.com/gabrielkroll/mesoplus#sync-setup" target="_blank" rel="noopener noreferrer">Setup guide ↗</a>
              </p>

              <label className={styles.fieldLabel} htmlFor="script-url">Apps Script URL</label>
              <input
                id="script-url"
                className={styles.textInput}
                type="url"
                placeholder="https://script.google.com/macros/s/…/exec"
                value={scriptUrl}
                onChange={e => saveScriptUrl(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />

              <label className={styles.fieldLabel} htmlFor="sheet-tab">Sheet tab name</label>
              <input
                id="sheet-tab"
                className={styles.textInput}
                type="text"
                placeholder="Sessions"
                value={sheetTab}
                onChange={e => saveSheetTab(e.target.value)}
              />

              <Button variant="danger" onClick={clearSyncHistory}>
                Reset sync history
              </Button>
            </div>
          )}
        </div>

        {/* Apps Script snippet */}
        {showScript && (
          <details className={styles.codeDetails}>
            <summary className={styles.codeSummary}>Apps Script code to paste</summary>
            <pre className={styles.codeBlock}>{APPS_SCRIPT_CODE}</pre>
          </details>
        )}
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
            <Button variant="ghost" onClick={exportCSV}>Export</Button>
          </div>
          {exportMsg && <p className={styles.msg} role="status" aria-live="polite">{exportMsg}</p>}

          <div className={styles.actionRow}>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>Copy JSON</span>
              <span className={styles.actionSub}>Raw mp7 data to clipboard</span>
            </div>
            <Button variant="ghost" onClick={copyJSON}>{copied ? 'Copied!' : 'Copy'}</Button>
          </div>
        </div>
      </section>

      {/* ── App info ── */}
      <section className={styles.section} aria-labelledby="profile-app">
        <h2 className={styles.sectionTitle} id="profile-app">App</h2>
        <div className={styles.infoList}>
          {[
            ['Version',       'V2 · Beta'],
            ['Storage',       'localStorage · mp7'],
            ['Compatibility', 'V1 data compatible'],
          ].map(([k, v]) => (
            <div key={k} className={styles.infoRow}>
              <span className={styles.infoKey}>{k}</span>
              <span className={styles.infoVal}>{v}</span>
            </div>
          ))}
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

const APPS_SCRIPT_CODE = `function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(data.tab) || ss.insertSheet(data.tab);
  if (sheet.getLastRow() === 0) sheet.appendRow(data.headers);
  data.rows.forEach(row => sheet.appendRow(row));
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, added: data.rows.length }))
    .setMimeType(ContentService.MimeType.JSON);
}`
