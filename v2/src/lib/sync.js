/**
 * Google Sheets sync via Apps Script Web App.
 *
 * Uses the same script deployment as V1. The existing V1 doPost() needs one
 * small addition: a `data.tab` branch for session-level rows. Add the block
 * marked "── V2 addition ──" into your existing Apps Script and redeploy.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Add doGet() as a new function (enables import from the app):
 * ─────────────────────────────────────────────────────────────────────────
 *
 * function doGet(e) {
 *   const tab   = (e.parameter && e.parameter.tab) || 'Sessions';
 *   const ss    = SpreadsheetApp.getActiveSpreadsheet();
 *   const sheet = ss.getSheetByName(tab);
 *   if (!sheet) return respond({ ok: false, error: 'Sheet not found: ' + tab });
 *   const lastRow = sheet.getLastRow();
 *   if (lastRow < 2) return respond({ ok: true, headers: [], rows: [] });
 *   const numCols = sheet.getLastColumn();
 *   const headers = sheet.getRange(1, 1, 1, numCols).getValues()[0];
 *   const rows    = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();
 *   return respond({ ok: true, headers, rows });
 * }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * 2. Add this block INSIDE your existing doPost(), before the V1 clearAll check:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * // ── V2 addition: tab-routed session sync ──────────────────────────────
 * if (data.tab) {
 *   const ss2   = SpreadsheetApp.getActiveSpreadsheet();
 *   const sheet = ss2.getSheetByName(data.tab) || ss2.insertSheet(data.tab);
 *   if (sheet.getLastRow() === 0) {
 *     sheet.appendRow(data.headers);
 *     sheet.setFrozenRows(1);
 *     const hdr = sheet.getRange(1, 1, 1, data.headers.length);
 *     hdr.setFontWeight('bold');
 *     hdr.setBackground('#f3f3f3');
 *   }
 *   const rows = (data.rows || []).filter(r => r && r[0]);
 *   if (!rows.length) return respond({ ok: true, added: 0 });
 *   // Delete-then-reinsert per date: idempotent, same as V1 pattern.
 *   // Re-syncing a session updates the row rather than duplicating it.
 *   const dates = [...new Set(rows.map(r => String(r[0])))];
 *   dates.forEach(date => deleteRowsForDate(sheet, date));
 *   const startRow = sheet.getLastRow() + 1;
 *   const numCols  = data.headers.length;
 *   sheet.getRange(startRow, 1, rows.length, numCols).setValues(
 *     rows.map(r => Array.from({ length: numCols }, (_, i) => r[i] ?? ''))
 *   );
 *   return respond({ ok: true, added: rows.length });
 * }
 * // ── end V2 addition ────────────────────────────────────────────────────
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Full updated doPost() for reference (V1 logic unchanged beneath the block):
 * ─────────────────────────────────────────────────────────────────────────
 *
 * function doPost(e) {
 *   try {
 *     const data = JSON.parse(e.postData.contents);
 *
 *     // ── V2: tab-routed session sync ──────────────────────────────────
 *     if (data.tab) {
 *       const ss2   = SpreadsheetApp.getActiveSpreadsheet();
 *       const sheet = ss2.getSheetByName(data.tab) || ss2.insertSheet(data.tab);
 *       if (sheet.getLastRow() === 0) {
 *         sheet.appendRow(data.headers);
 *         sheet.setFrozenRows(1);
 *         const hdr = sheet.getRange(1, 1, 1, data.headers.length);
 *         hdr.setFontWeight('bold');
 *         hdr.setBackground('#f3f3f3');
 *       }
 *       const rows = (data.rows || []).filter(r => r && r[0]);
 *       if (!rows.length) return respond({ ok: true, added: 0 });
 *       const dates = [...new Set(rows.map(r => String(r[0])))];
 *       dates.forEach(date => deleteRowsForDate(sheet, date));
 *       const startRow = sheet.getLastRow() + 1;
 *       const numCols  = data.headers.length;
 *       sheet.getRange(startRow, 1, rows.length, numCols).setValues(
 *         rows.map(r => Array.from({ length: numCols }, (_, i) => r[i] ?? ''))
 *       );
 *       return respond({ ok: true, added: rows.length });
 *     }
 *
 *     // ── V1: existing exercise-level sync (unchanged) ─────────────────
 *     const sheet = getSheet();
 *     if (data.action === 'clearAll') {
 *       if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
 *       ensureHeaders(sheet);
 *       return respond({ ok: true });
 *     }
 *     ensureHeaders(sheet);
 *     const date = data.date;
 *     const rows = (data.rows || []).filter(r => r && r[0]);
 *     if (!rows.length) return respond({ ok: true });
 *     deleteRowsForDate(sheet, date);
 *     const processed = rows.map(row =>
 *       row.map((val, i) => {
 *         if (NUM_COLS.includes(i + 1) && val !== '' && val != null) {
 *           const n = Number(val);
 *           return isNaN(n) ? '' : n;
 *         }
 *         return val == null ? '' : String(val);
 *       })
 *     );
 *     const numCols = Math.max(HEADERS.length, ...processed.map(r => r.length));
 *     const padded  = processed.map(r => { while (r.length < numCols) r.push(''); return r; });
 *     const startRow = sheet.getLastRow() + 1;
 *     sheet.getRange(startRow, 1, padded.length, numCols).setValues(padded);
 *     formatDataRows(sheet, startRow, padded.length);
 *     return respond({ ok: true });
 *   } catch (err) {
 *     return respond({ ok: false, error: err.message });
 *   }
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
    const scores  = { '≤5.5h':20,'6h':38,'6.5h':55,'7h':70,'7.5h':83,'8h':93,'≥8.5h':100 }
    const escores = { 'Drained':20,'Low':42,'Moderate':62,'Good':82,'Charged':100 }
    const oscores = { 'Wrecked':20,'Heavy':42,'Moderate':62,'Mild':82,'Fresh':100 }
    const sl = scores[s.sleep]    || 0
    const en = escores[s.energy]  || 0
    const so = oscores[s.soreness]|| 0
    const w  = (sl ? 0.4 : 0) + (en ? 0.35 : 0) + (so ? 0.25 : 0)
    return w ? Math.round((sl * 0.4 + en * 0.35 + so * 0.25) / w) : ''
  })()

  return [
    s.date,
    s.dtype       || '',
    s.gymDay      || '',
    s.sleep       || '',
    s.energy      || '',
    s.soreness    || '',
    s.perf        || '',
    (s.notes      || '').replace(/\n/g, ' '),
    s.bjjDuration || '',
    s.bjjGc       || '',
    (s.bjjGood    || '').replace(/\n/g, ' '),
    (s.bjjNext    || '').replace(/\n/g, ' '),
    totalSets     || '',
    readiness,
  ]
}

/**
 * Push sessions to Google Sheets via Apps Script.
 *
 * Uses delete-then-reinsert per date (same as V1): re-syncing a session
 * updates the row rather than creating a duplicate. The syncedDates set
 * is kept as a performance optimisation (skip network calls for sessions
 * already known to be current), but safety no longer depends on it.
 *
 * @param {string}   scriptUrl
 * @param {string}   tab         Sheet tab name (default 'Sessions')
 * @param {object[]} sessions    All sessions
 * @param {Set}      syncedDates Set of already-synced date strings
 * @returns {{ ok: boolean, added: number, dates?: string[], error?: string }}
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

/**
 * Test the Apps Script connection by sending an empty sync request.
 * @param {string} scriptUrl
 * @returns {{ ok: boolean, error?: string }}
 */
export async function testConnection(scriptUrl) {
  const res = await fetch(scriptUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ tab: '__test__', headers: HEADERS, rows: [] }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Script returned error')
  return { ok: true }
}

/**
 * Import sessions from the Apps Script (doGet) — no API key needed.
 * Works from localhost and any host without CORS or referrer restrictions.
 *
 * The Apps Script must have the doGet() function added (shown in the
 * "Add to existing Apps Script" accordion in the Profile page).
 *
 * @param {string} scriptUrl   Apps Script Web App URL
 * @param {string} tab         Sheet tab name (default 'Sessions')
 * @returns {{ ok: boolean, sessions: object[] }}
 */
export async function importFromSheets(scriptUrl, tab = 'Sessions') {
  const url = `${scriptUrl}?action=import&tab=${encodeURIComponent(tab)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  let json
  try {
    json = await res.json()
  } catch {
    throw new Error('Invalid response from Apps Script. Make sure doGet() is deployed.')
  }

  if (!json.ok) {
    const msg = json.error || 'Script returned error'
    if (msg.includes('contents') || msg.includes('postData')) {
      throw new Error('doGet() not found. Add it from the snippet in Profile → Google Sheets, then redeploy as a new version.')
    }
    throw new Error(msg)
  }

  const rows    = json.rows    || []
  const headers = json.headers || HEADERS

  const IDX = Object.fromEntries(headers.map((h, i) => [h, i]))

  const get = (row, col) => row[IDX[col]] ?? ''

  const sessions = rows
    .filter(r => get(r, 'Date'))
    .map(r => ({
      date:        get(r, 'Date'),
      dtype:       get(r, 'Type')         || undefined,
      gymDay:      get(r, 'Gym Day')      || undefined,
      sleep:       get(r, 'Sleep')        || undefined,
      energy:      get(r, 'Energy')       || undefined,
      soreness:    get(r, 'Soreness')     || undefined,
      perf:        get(r, 'Perf')         || undefined,
      notes:       get(r, 'Notes')        || undefined,
      bjjDuration: get(r, 'BJJ Duration') || undefined,
      bjjGc:       get(r, 'BJJ Position') || undefined,
      bjjGood:     get(r, 'BJJ Good')     || undefined,
      bjjNext:     get(r, 'BJJ Next')     || undefined,
    }))
    .map(s => Object.fromEntries(Object.entries(s).filter(([, v]) => v !== undefined)))

  return { ok: true, sessions }
}
