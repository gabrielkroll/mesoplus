/**
 * Google Sheets sync via Apps Script Web App.
 *
 * Setup (one-time):
 * 1. Open Google Sheets → Extensions → Apps Script
 * 2. Paste the doPost() function below, Deploy as Web App
 *    (Execute as: Me, Who has access: Anyone)
 * 3. Copy the deployment URL into Meso+ Settings → Script URL
 *
 * --- Apps Script code to paste: ---
 *
 * function doPost(e) {
 *   const data = JSON.parse(e.postData.contents);
 *   const sheet = SpreadsheetApp.getActiveSpreadsheet()
 *     .getSheetByName(data.tab || 'Sessions') ||
 *     SpreadsheetApp.getActiveSpreadsheet().insertSheet(data.tab || 'Sessions');
 *   if (sheet.getLastRow() === 0) {
 *     sheet.appendRow(data.headers);
 *   }
 *   data.rows.forEach(row => sheet.appendRow(row));
 *   return ContentService.createTextOutput(JSON.stringify({ ok: true, added: data.rows.length }))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 *
 * ---
 */

const HEADERS = [
  'Date', 'Type', 'Gym Day', 'Sleep', 'Energy', 'Soreness',
  'Perf', 'Notes', 'BJJ Duration', 'BJJ Position', 'BJJ Good', 'BJJ Next',
  'Total Sets', 'Readiness Score',
]

function sessionToRow(s) {
  const totalSets = (s.supersets || []).reduce(
    (t, ss) => t + ss.exercises.reduce((tt, ex) => tt + (Number(ex.sets) || 0), 0), 0
  )
  const readiness = (() => {
    const scores = { '≤5.5h':20,'6h':38,'6.5h':55,'7h':70,'7.5h':83,'8h':93,'≥8.5h':100 }
    const escores = { 'Drained':20,'Low':42,'Moderate':62,'Good':82,'Charged':100 }
    const oscores = { 'Wrecked':20,'Heavy':42,'Moderate':62,'Mild':82,'Fresh':100 }
    const sl = scores[s.sleep] || 0
    const en = escores[s.energy] || 0
    const so = oscores[s.soreness] || 0
    const w  = (sl ? 0.4 : 0) + (en ? 0.35 : 0) + (so ? 0.25 : 0)
    return w ? Math.round((sl * 0.4 + en * 0.35 + so * 0.25) / w) : ''
  })()

  return [
    s.date,
    s.dtype || '',
    s.gymDay || '',
    s.sleep || '',
    s.energy || '',
    s.soreness || '',
    s.perf || '',
    (s.notes || '').replace(/\n/g, ' '),
    s.bjjDuration || '',
    s.bjjGc || '',
    (s.bjjGood || '').replace(/\n/g, ' '),
    (s.bjjNext || '').replace(/\n/g, ' '),
    totalSets || '',
    readiness,
  ]
}

/**
 * Push sessions to Google Sheets via Apps Script.
 * Only syncs sessions not already tracked in syncedDates set.
 *
 * @param {string}   scriptUrl
 * @param {string}   tab         Sheet tab name (default 'Sessions')
 * @param {object[]} sessions    All sessions
 * @param {Set}      syncedDates Set of already-synced date strings
 * @returns {{ ok: boolean, added: number, error?: string }}
 */
export async function syncToSheets(scriptUrl, tab = 'Sessions', sessions = [], syncedDates = new Set()) {
  const pending = sessions.filter(s => s.date && !syncedDates.has(s.date))
  if (!pending.length) return { ok: true, added: 0 }

  const rows = pending.map(sessionToRow)

  const res = await fetch(scriptUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'text/plain' }, // Apps Script needs text/plain for CORS
    body: JSON.stringify({ tab, headers: HEADERS, rows }),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  return { ok: true, added: json.added ?? rows.length, dates: pending.map(s => s.date) }
}
