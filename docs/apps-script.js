const SHEET_NAME = 'Workout_Log';
const ANALYSIS_SHEET_NAME = 'Analysis_Log';

const HEADERS = ['Date','Week','Phase','Type','Gym Day','Superset','Exercise','Muscle','Resistance','Side','kg','Reps','RIR','Sets','Vol','Sleep','Energy','Soreness','Performance','Flagged','Extra Training','Notes','BJJ Technique','Description','Positions','Partner','Drilling','Sparring Good','Sparring Bad','Submissions','Next Focus'];
const ANALYSIS_HEADERS = ['Date','Time','Scope','Focus','Result'];

const NUM_COLS = [5, 6, 11, 12, 13, 14, 15]; // 1-based: Gym Day, Superset, kg, Reps, RIR, Sets, Vol

// ── Sheet helpers ────────────────────────────────────────────────────────────

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
}

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    const hdr = sheet.getRange(1, 1, 1, headers.length);
    hdr.setFontWeight('bold');
    hdr.setBackground('#f3f3f3');
  }
  return sheet;
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  const hdr = sheet.getRange(1, 1, 1, HEADERS.length);
  hdr.setFontWeight('bold');
  hdr.setBackground('#f3f3f3');
  NUM_COLS.forEach(col => sheet.getRange(2, col, 999, 1).setNumberFormat('0'));
}

function formatDataRows(sheet, startRow, count) {
  NUM_COLS.forEach(col => sheet.getRange(startRow, col, count, 1).setNumberFormat('0'));
}

function deleteRowsForDate(sheet, date) {
  for (let i = sheet.getLastRow(); i >= 2; i--) {
    if (sheet.getRange(i, 1).getDisplayValue() === date) sheet.deleteRow(i);
  }
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Request handler ──────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // ── Clear all workout rows ───────────────────────────────────────────────
    if (data.action === 'clearAll') {
      const sheet = getSheet();
      if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
      ensureHeaders(sheet);
      return respond({ ok: true });
    }

    // ── Save analysis result ─────────────────────────────────────────────────
    if (data.action === 'logAnalysis') {
      const sheet = getOrCreateSheet(ANALYSIS_SHEET_NAME, ANALYSIS_HEADERS);
      const now = new Date();
      const time = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm');
      sheet.appendRow([
        data.date || '',
        time,
        data.scope || '',
        data.focus || '',
        data.text || ''
      ]);
      return respond({ ok: true });
    }

    // ── Append workout session rows (default action) ─────────────────────────
    const sheet = getSheet();
    ensureHeaders(sheet);

    const date = data.date;
    const rows = (data.rows || []).filter(r => r && r[0]);
    if (!rows.length) return respond({ ok: true });

    deleteRowsForDate(sheet, date);

    const processed = rows.map(row =>
      row.map((val, i) => {
        if (NUM_COLS.includes(i + 1) && val !== '' && val != null) {
          const n = Number(val);
          return isNaN(n) ? '' : n;
        }
        return val == null ? '' : String(val);
      })
    );

    const numCols = Math.max(HEADERS.length, ...processed.map(r => r.length));
    const padded = processed.map(r => {
      while (r.length < numCols) r.push('');
      return r;
    });
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, padded.length, numCols).setValues(padded);
    formatDataRows(sheet, startRow, padded.length);

    return respond({ ok: true });

  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}
