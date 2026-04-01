import { useState } from 'react'
import useStore from '../../store/useStore'
import Button from '../atoms/Button'
import { syncToSheets, testConnection, importFromSheets } from '../../lib/sync'
import styles from './ProfilePage.module.css'

const SYNC_KEY = 'mp7_synced_dates'

function getSyncedDates() {
  try { return new Set(JSON.parse(localStorage.getItem(SYNC_KEY) || '[]')) } catch { return new Set() }
}
function saveSyncedDates(set) {
  localStorage.setItem(SYNC_KEY, JSON.stringify([...set]))
}

export default function ProfilePage() {
  const sessions     = useStore(s => s.sessions)
  const addSession   = useStore(s => s.addSession)
  const scriptUrl    = useStore(s => s.scriptUrl)
  const sheetId      = useStore(s => s.sheetId)
  const sheetTab     = useStore(s => s.sheetTab)
  const setScriptUrl = useStore(s => s.setScriptUrl)
  const setSheetId   = useStore(s => s.setSheetId)
  const setSheetTab  = useStore(s => s.setSheetTab)

  const [copied,       setCopied]       = useState(false)
  const [exportMsg,    setExportMsg]    = useState('')
  const [syncStatus,   setSyncStatus]   = useState('')   // '' | 'syncing' | 'ok' | 'error'
  const [syncMsg,      setSyncMsg]      = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  const syncedDates  = getSyncedDates()
  const pendingCount = (sessions || []).filter(s => s.date && !syncedDates.has(s.date)).length

  const setStatus = (status, msg, ttl = 5000) => {
    setSyncStatus(status)
    setSyncMsg(msg)
    if (ttl) setTimeout(() => { setSyncStatus(''); setSyncMsg('') }, ttl)
  }

  // ── Save + test connection ─────────────────────────────────────────────────
  const saveAndTest = async () => {
    if (!scriptUrl.trim()) { setStatus('error', 'Paste your Apps Script URL first.'); return }
    // Persist API key locally
    if (apiKey.trim()) localStorage.setItem(API_KEY_KEY, apiKey.trim())
    else localStorage.removeItem(API_KEY_KEY)

    setSyncStatus('syncing')
    setSyncMsg('Testing connection…')
    try {
      await testConnection(scriptUrl.trim())
      setStatus('ok', '✓ Connection successful.')
    } catch (e) {
      setStatus('error', `Connection failed: ${e.message}`)
    }
  }

  // ── Re-sync to Sheets ──────────────────────────────────────────────────────
  const runSync = async () => {
    if (!scriptUrl.trim()) { setStatus('error', 'Save your Apps Script URL first.'); return }
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
        setStatus('ok', result.added > 0
          ? `✓ Synced ${result.added} session${result.added !== 1 ? 's' : ''}.`
          : '✓ Already up to date.')
      }
    } catch (e) {
      setStatus('error', `Sync failed: ${e.message}`)
    }
  }

  // ── Import from Sheets ─────────────────────────────────────────────────────
  const runImport = async () => {
    if (!scriptUrl.trim()) { setStatus('error', 'Save your Apps Script URL first.'); return }
    setSyncStatus('syncing')
    setSyncMsg('Importing…')
    try {
      const result = await importFromSheets(scriptUrl.trim(), sheetTab || 'Sessions')
      if (result.ok) {
        result.sessions.forEach(s => addSession(s))
        // Mark imported sessions as synced so they don't re-send immediately
        const updated = getSyncedDates()
        result.sessions.forEach(s => updated.add(s.date))
        saveSyncedDates(updated)
        setStatus('ok', `✓ Imported ${result.sessions.length} session${result.sessions.length !== 1 ? 's' : ''}.`)
      }
    } catch (e) {
      setStatus('error', `Import failed: ${e.message}`)
    }
  }

  const clearSyncHistory = () => {
    localStorage.removeItem(SYNC_KEY)
    setConfirmReset(false)
    setStatus('ok', 'Sync history cleared — all sessions will re-sync next time.', 4000)
  }

  // ── CSV export ─────────────────────────────────────────────────────────────
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

  // ── Stats ──────────────────────────────────────────────────────────────────
  const sessionCount   = sessions?.length || 0
  const completedCount = (sessions || []).filter(s => s.completed).length
  const gymCount       = (sessions || []).filter(s => s.dtype?.includes('Resistance')).length
  const bjjCount       = (sessions || []).filter(s => s.dtype?.includes('BJJ')).length

  const configured = !!scriptUrl

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
        <h2 className={styles.sectionTitle} id="profile-sync">Google Sheets</h2>
        <p className={styles.sectionSub}>One-time · free Google account · ~15 min</p>

        <div className={styles.setupCard}>

          {/* Step 1 — Open your sheet */}
          <SetupRow
            step="1"
            label="Open your sheet"
            desc={<>From the URL: /spreadsheets/d/<strong className={styles.urlHighlight}>THIS_PART</strong>/edit</>}
          >
            <FieldInput
              id="sheet-id"
              label="SHEET ID"
              type="text"
              placeholder="1xsLuWy-JpVi7YDgot…"
              value={sheetId}
              onChange={e => setSheetId(e.target.value)}
            />
          </SetupRow>

          {/* Step 2 — Tab name */}
          <SetupRow
            step="2"
            label="Tab name"
            desc="Exact tab name in your sheet."
          >
            <FieldInput
              id="sheet-tab"
              label="TAB NAME"
              type="text"
              placeholder="Sessions"
              value={sheetTab}
              onChange={e => setSheetTab(e.target.value)}
            />
          </SetupRow>

          {/* Step 3 — Apps Script URL */}
          <SetupRow
            step="3"
            label="Apps Script URL"
            desc="Extensions → Apps Script → Deploy as web app → copy URL. Handles both sync and import."
          >
            <FieldInput
              id="script-url"
              label="WEB APP URL"
              type="url"
              placeholder="https://script.google.com/macros/s/…/exec"
              value={scriptUrl}
              onChange={e => setScriptUrl(e.target.value)}
            />
          </SetupRow>

          {/* Status message */}
          {syncMsg && (
            <p
              className={`${styles.syncMsg} ${syncStatus === 'error' ? styles.syncError : styles.syncOk}`}
              role="status"
              aria-live="polite"
            >
              {syncMsg}
            </p>
          )}

          {/* Reset confirm */}
          {confirmReset && (
            <div className={styles.confirmBox}>
              <p className={styles.confirmText}>
                This will re-send <strong>all {(sessions || []).length} sessions</strong> on next sync.
                Your Apps Script uses delete-then-reinsert, so no duplicates will be created.
                Are you sure?
              </p>
              <div className={styles.confirmRow}>
                <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
                <Button variant="danger" onClick={clearSyncHistory}>Yes, reset</Button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className={styles.syncActions}>
            <Button
              variant="primary"
              onClick={saveAndTest}
              disabled={syncStatus === 'syncing'}
            >
              Save + test connection
            </Button>
            <Button
              variant="ghost"
              onClick={runSync}
              disabled={syncStatus === 'syncing' || !configured}
            >
              ↺ Re-sync to Sheets
            </Button>
            <Button
              variant="ghost"
              onClick={runImport}
              disabled={syncStatus === 'syncing' || !configured}
            >
              ↓ Import from Sheets
            </Button>
          </div>

          {/* Pending badge + reset */}
          <div className={styles.syncMeta}>
            <span className={styles.pendingBadge} data-status={syncStatus || (configured ? 'idle' : 'none')}>
              <span className={styles.syncDot} aria-hidden="true" />
              {configured
                ? `${pendingCount} session${pendingCount !== 1 ? 's' : ''} pending sync`
                : 'Not configured'}
            </span>
            {configured && !confirmReset && (
              <button className={styles.resetLink} onClick={() => setConfirmReset(true)}>
                Reset sync history
              </button>
            )}
          </div>
        </div>

        {/* Apps Script snippet */}
        <details className={styles.codeDetails}>
          <summary className={styles.codeSummary}>Add to existing Apps Script</summary>
          <p className={styles.codeNote}>
            Already using V1? Paste this block at the top of your existing <code>doPost()</code>, before the <code>clearAll</code> check. Then redeploy.
          </p>
          <pre className={styles.codeBlock}>{APPS_SCRIPT_CODE}</pre>
        </details>
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

// ── Sub-components ─────────────────────────────────────────────────────────

function Stat({ label, value }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statVal}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

function SetupRow({ step, label, desc, children }) {
  return (
    <div className={styles.setupRow}>
      <div className={styles.setupLeft}>
        <span className={styles.setupStep}>{step} — <strong>{label}</strong></span>
        <span className={styles.setupDesc}>{desc}</span>
      </div>
      <div className={styles.setupRight}>
        {children}
      </div>
    </div>
  )
}

function FieldInput({ id, label, type, placeholder, value, onChange }) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor={id}>{label}</label>
      <input
        id={id}
        className={styles.textInput}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  )
}

const APPS_SCRIPT_CODE = `// ─────────────────────────────────────────────────────────
// 1. Add doGet() as a new function (handles import):
// ─────────────────────────────────────────────────────────

function doGet(e) {
  const tab   = (e.parameter && e.parameter.tab) || 'Sessions';
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tab);
  if (!sheet) return respond({ ok: false, error: 'Sheet not found: ' + tab });
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return respond({ ok: true, headers: [], rows: [] });
  const numCols = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, numCols).getValues()[0];
  const rows    = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();
  return respond({ ok: true, headers, rows });
}

// ─────────────────────────────────────────────────────────
// 2. Add this block at the top of your existing doPost(),
//    before the clearAll check. Then redeploy.
// ─────────────────────────────────────────────────────────

if (data.tab) {
  const ss2   = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss2.getSheetByName(data.tab) || ss2.insertSheet(data.tab);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(data.headers);
    sheet.setFrozenRows(1);
    const hdr = sheet.getRange(1, 1, 1, data.headers.length);
    hdr.setFontWeight('bold');
    hdr.setBackground('#f3f3f3');
  }
  const rows = (data.rows || []).filter(r => r && r[0]);
  if (!rows.length) return respond({ ok: true, added: 0 });
  const dates = [...new Set(rows.map(r => String(r[0])))];
  dates.forEach(date => deleteRowsForDate(sheet, date));
  const startRow = sheet.getLastRow() + 1;
  const numCols  = data.headers.length;
  sheet.getRange(startRow, 1, rows.length, numCols).setValues(
    rows.map(r => Array.from({ length: numCols }, (_, i) => r[i] ?? ''))
  );
  return respond({ ok: true, added: rows.length });
}

// ── Your existing V1 doPost() code continues below ────────`
