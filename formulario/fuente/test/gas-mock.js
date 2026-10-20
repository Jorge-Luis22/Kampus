// Simulación mínima de Google Apps Script + Google Sheets para probar el Code.gs REAL en Node.
// Solo implementa los métodos que Code.gs usa; si Code.gs usara otro, esta simulación fallaría.
'use strict';
const vm = require('vm');
const fs = require('fs');

function createGas(codePath, opts = {}) {
  const store = { sheets: {}, tz: null, locks: 0, lockBusy: !!opts.lockBusy, calls: [] };
  const used = new Set();

  class Sheet {
    constructor(name) { this.name = name; this.rows = []; this.maxRows = 1000; this.formats = {}; this.frozen = 0; }
    getLastRow() { used.add('Sheet.getLastRow'); let last = 0; this.rows.forEach((r, i) => { if (r && r.some(v => v !== '' && v != null)) last = i + 1; }); return last; }
    getMaxRows() { used.add('Sheet.getMaxRows'); return this.maxRows; }
    insertRowsAfter(n, k) { used.add('Sheet.insertRowsAfter'); this.maxRows += k; }
    setFrozenRows(n) { used.add('Sheet.setFrozenRows'); this.frozen = n; }
    setRowHeight() { used.add('Sheet.setRowHeight'); }
    setColumnWidth() { used.add('Sheet.setColumnWidth'); }
    deleteRow(r) { used.add('Sheet.deleteRow'); this.rows.splice(r - 1, 1); }
    getRange(r, c, nr = 1, nc = 1) {
      used.add('Sheet.getRange');
      if (r + nr - 1 > this.maxRows) throw new Error('The coordinates of the range are outside the dimensions of the sheet.');
      return new Range(this, r, c, nr, nc);
    }
  }
  class Range {
    constructor(sh, r, c, nr, nc) { this.sh = sh; this.r = r; this.c = c; this.nr = nr; this.nc = nc; }
    _chain(name) { used.add('Range.' + name); return this; }
    setNumberFormat(f) { used.add('Range.setNumberFormat'); for (let i = 0; i < this.nr; i++) for (let j = 0; j < this.nc; j++) this.sh.formats[(this.r + i) + ',' + (this.c + j)] = f; return this; }
    setNumberFormats(fs_) { used.add('Range.setNumberFormats'); fs_.forEach((row, i) => row.forEach((f, j) => { this.sh.formats[(this.r + i) + ',' + (this.c + j)] = f; })); return this; }
    setValues(vals) {
      used.add('Range.setValues');
      if (vals.length !== this.nr || vals[0].length !== this.nc) throw new Error('The number of rows/columns in the data does not match the range.');
      vals.forEach((row, i) => {
        const rr = this.r - 1 + i;
        this.sh.rows[rr] = this.sh.rows[rr] || [];
        row.forEach((v, j) => {
          const fmt = this.sh.formats[(this.r + i) + ',' + (this.c + j)];
          // Con formato de texto ('@') Sheets no convierte nada; con otro formato un "=..." sería fórmula.
          if (typeof v === 'string' && /^=/.test(v) && fmt !== '@') store.formulaLeak = true;
          this.sh.rows[rr][this.c - 1 + j] = v;
        });
      });
      return this;
    }
    getValues() {
      used.add('Range.getValues');
      const out = [];
      for (let i = 0; i < this.nr; i++) { const row = []; for (let j = 0; j < this.nc; j++) { const v = (this.sh.rows[this.r - 1 + i] || [])[this.c - 1 + j]; row.push(v === undefined ? '' : v); } out.push(row); }
      return out;
    }
    getValue() { used.add('Range.getValue'); return this.getValues()[0][0]; }
    getRow() { used.add('Range.getRow'); return this.r; }
    setFontWeight() { return this._chain('setFontWeight'); }
    setFontColor() { return this._chain('setFontColor'); }
    setBackground() { return this._chain('setBackground'); }
    setWrap() { return this._chain('setWrap'); }
    setVerticalAlignment() { return this._chain('setVerticalAlignment'); }
    createTextFinder(text) {
      used.add('Range.createTextFinder');
      const self = this; const cfg = { entire: false, matchCase: false };
      const api = {
        matchEntireCell(b) { cfg.entire = b; return api; },
        matchCase(b) { cfg.matchCase = b; return api; },
        findNext() {
          for (let i = 0; i < self.nr; i++) {
            for (let j = 0; j < self.nc; j++) {
              const v = String(((self.sh.rows[self.r - 1 + i] || [])[self.c - 1 + j]) ?? '');
              const a = cfg.matchCase ? v : v.toLowerCase(), b = cfg.matchCase ? text : text.toLowerCase();
              if (cfg.entire ? a === b : a.includes(b)) return new Range(self.sh, self.r + i, self.c + j, 1, 1);
            }
          }
          return null;
        },
      };
      return api;
    }
  }
  const ss = {
    setSpreadsheetTimeZone(tz) { used.add('Spreadsheet.setSpreadsheetTimeZone'); store.tz = tz; },
    getSheetByName(n) { used.add('Spreadsheet.getSheetByName'); return store.sheets[n] || null; },
    insertSheet(n) { used.add('Spreadsheet.insertSheet'); store.sheets[n] = new Sheet(n); return store.sheets[n]; },
    getUrl() { return 'https://docs.google.com/spreadsheets/d/FAKE/edit'; },
  };
  const ctx = vm.createContext({
    console, Logger: { log: (...a) => store.calls.push(a.join(' ')) },
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, openById: () => ss, flush: () => { used.add('SpreadsheetApp.flush'); } },
    LockService: { getScriptLock: () => ({
      tryLock: () => { used.add('Lock.tryLock'); if (store.lockBusy) return false; store.locks++; return true; },
      releaseLock: () => { used.add('Lock.releaseLock'); store.locks--; },
    }) },
    ContentService: {
      MimeType: { JSON: 'JSON', JAVASCRIPT: 'JAVASCRIPT' },
      createTextOutput: s => ({ _s: s, _m: null, setMimeType(m) { this._m = m; return this; }, getContent() { return this._s; }, getMimeType() { return this._m; } }),
    },
    Utilities: { getUuid: () => require('crypto').randomUUID() },
  });
  vm.runInContext(fs.readFileSync(codePath, 'utf8'), ctx, { filename: 'Code.gs' });
  return {
    store, ctx, used,
    doPost: body => ctx.doPost({ postData: { contents: body } }),
    doGet: params => ctx.doGet({ parameter: params }),
    schema: vm.runInContext('SCHEMA', ctx),
    meta: vm.runInContext('META_COLUMNS', ctx),
    call: (code) => vm.runInContext(code, ctx),
  };
}
module.exports = { createGas };
