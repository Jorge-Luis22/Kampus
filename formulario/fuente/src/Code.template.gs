/**
 * Encuesta de estudiantes de la UTP (proyecto Kampus)
 * API en Google Apps Script: recibe las respuestas del index.html y las guarda en Google Sheets.
 *
 * Qué hace:
 *   - doPost(e): recibe una respuesta (JSON), la valida, la guarda como una fila nueva y
 *                devuelve una confirmación SOLO después de leer la fila de vuelta.
 *   - doGet(e):  sin parámetros devuelve un mensaje de "estoy funcionando".
 *                Con ?action=check&id=... dice si esa respuesta ya existe en la hoja
 *                (el formulario lo usa para confirmar si no pudo leer la respuesta del POST).
 *   - setup():   se ejecuta UNA vez a mano: crea la hoja "Respuestas" con sus encabezados.
 *
 * Seguridad:
 *   - No hay claves ni contraseñas en este código ni en el HTML.
 *   - Solo se aceptan las columnas del esquema (SCHEMA); lo demás se ignora.
 *   - Texto, números y opciones se validan; nada se interpreta como fórmula.
 *   - Un LockService serializa las escrituras y el ID de respuesta evita duplicados.
 *
 * IMPORTANTE: SCHEMA se genera desde la misma fuente que las preguntas del index.html.
 * No lo edites a mano: si cambias una pregunta, regenera ambos archivos.
 */

/* ============================== 1. CONFIGURACIÓN ============================== */
const CONFIG = {
  SHEET_NAME: 'Respuestas',   // nombre de la pestaña donde se guardan las respuestas
  SPREADSHEET_ID: '',         // vacío = la hoja a la que está vinculado este script (recomendado)
  TIMEZONE: 'America/Lima',
  FORM_VERSION: '1.0',
  MAX_BODY_CHARS: 60000,      // tamaño máximo del mensaje recibido
  LOCK_WAIT_MS: 25000,        // espera máxima para escribir cuando hay varias personas a la vez
  MIN_ANSWERED: 20,           // mínimo de respuestas con contenido para aceptar un envío
  MIN_SECONDS_PLAUSIBLE: 45,  // menos que esto se marca como "revisar" (no se descarta)
};

/* Columnas fijas que van antes de las preguntas */
const META_COLUMNS = [
  { key: 'id_respuesta', header: 'ID de respuesta' },
  { key: 'fecha_hora', header: 'Fecha y hora (Lima)' },
  { key: 'estado', header: 'Estado' },
  { key: 'duracion_seg', header: 'Duración (segundos)' },
  { key: 'version', header: 'Versión del formulario' },
];

/* ======================== 2. ESQUEMA DE PREGUNTAS (generado) ======================== */
/*__SCHEMA__*/

const ID_RE = /^[A-Za-z0-9-]{8,64}$/;
const SEPARATOR = ' | ';   // separa las opciones marcadas en las preguntas de varias respuestas

/* ============================== 3. PUNTOS DE ENTRADA ============================== */

/** Recibe una respuesta del formulario (POST con JSON en el cuerpo). */
function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw) return respond_({ ok: false, error: 'sin_datos', mensaje: 'No llegaron datos.' });
    if (raw.length > CONFIG.MAX_BODY_CHARS) {
      return respond_({ ok: false, error: 'muy_grande', mensaje: 'El envío es demasiado grande.' });
    }
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (_) {
      return respond_({ ok: false, error: 'json_invalido', mensaje: 'El formato del envío no es válido.' });
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return respond_({ ok: false, error: 'json_invalido', mensaje: 'El formato del envío no es válido.' });
    }
    // Trampa para bots: el campo oculto debe llegar vacío.
    if (payload.hp !== undefined && String(payload.hp) !== '') {
      return respond_({ ok: false, error: 'rechazado', mensaje: 'Envío rechazado.' });
    }
    return respond_(saveResponse_(payload, {}));
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return respond_({ ok: false, error: 'interno', mensaje: 'No se pudo guardar por un problema del servidor. Inténtalo de nuevo.' });
  }
}

/** Sin parámetros: "estoy funcionando". Con ?action=check&id=...: ¿existe esa respuesta? */
function doGet(e) {
  const p = (e && e.parameter) || {};
  let out;
  try {
    if (p.action === 'check') {
      const id = String(p.id || '');
      if (!ID_RE.test(id)) {
        out = { ok: false, error: 'id_invalido', mensaje: 'ID no válido.' };
      } else {
        const sheet = getSheet_(false);
        out = { ok: true, id: id, existe: findRowById_(sheet, id) > 0 };
      }
    } else {
      out = {
        ok: true,
        servicio: 'Encuesta UTP (Kampus)',
        version: CONFIG.FORM_VERSION,
        columnas: allColumns_().length,
        mensaje: 'El Web App está funcionando.',
      };
    }
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    out = { ok: false, error: 'interno', mensaje: 'Error interno.' };
  }
  return respond_(out, p.callback);
}

/* ============================== 4. GUARDADO ============================== */

/**
 * Valida y guarda una respuesta. Devuelve un objeto {ok, ...}; no lanza errores esperados.
 * opts.estado fuerza el valor de la columna "Estado" (lo usa la prueba manual).
 */
function saveResponse_(payload, opts) {
  const checked = validatePayload_(payload);
  if (!checked.ok) return checked;

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(CONFIG.LOCK_WAIT_MS)) {
    return { ok: false, error: 'ocupado', mensaje: 'Hay muchas personas enviando a la vez. Inténtalo de nuevo en unos segundos.' };
  }
  try {
    const sheet = getSheet_(true);
    ensureHeaders_(sheet);

    // Evita duplicados: si el ID ya existe, es el mismo envío repetido.
    const existing = findRowById_(sheet, checked.id);
    if (existing > 0) return { ok: true, id: checked.id, duplicado: true, fila: existing };

    const estado = (opts && opts.estado) || (checked.duracion < CONFIG.MIN_SECONDS_PLAUSIBLE ? 'revisar' : 'completa');
    const row = [checked.id, new Date(), estado, checked.duracion, checked.version].concat(checked.values);
    const fila = appendRowConfirmed_(sheet, row);
    return { ok: true, id: checked.id, duplicado: false, fila: fila };
  } finally {
    lock.releaseLock();
  }
}

/** Escribe la fila y la lee de vuelta. Si no coincide, lanza error (nunca confirma a ciegas). */
function appendRowConfirmed_(sheet, row) {
  const r = sheet.getLastRow() + 1;
  if (r > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 200);
  const range = sheet.getRange(r, 1, 1, row.length);
  range.setNumberFormats([columnFormats_()]);   // texto plano: ningún valor se convierte en fecha ni fórmula
  range.setValues([row]);
  SpreadsheetApp.flush();
  const written = sheet.getRange(r, 1).getValue();
  if (String(written) !== String(row[0])) {
    throw new Error('No se pudo confirmar la escritura en la fila ' + r);
  }
  return r;
}

/* ============================== 5. VALIDACIÓN ============================== */

function validatePayload_(p) {
  const fail = (error, mensaje, campos) => ({ ok: false, error: error, mensaje: mensaje, campos: campos || [] });

  const id = typeof p.id === 'string' ? p.id : '';
  if (!ID_RE.test(id)) return fail('id_invalido', 'El identificador del envío no es válido.');
  const answers = p.respuestas;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return fail('sin_respuestas', 'No llegaron respuestas.');
  }

  const values = [];
  const errors = [];
  let answered = 0;
  for (const field of SCHEMA) {
    const res = normalizeValue_(field, answers[field.key]);
    if (res.error) errors.push(field.header + ': ' + res.error);
    if (field.required && res.value === '') errors.push(field.header + ': falta responder');
    if (res.value !== '') answered++;
    values.push(res.value);
  }
  if (errors.length) {
    return fail('validacion', 'Hay respuestas con un formato no válido o faltan datos obligatorios.', errors.slice(0, 8));
  }
  if (answered < CONFIG.MIN_ANSWERED) {
    return fail('incompleto', 'El envío tiene muy pocas respuestas.');
  }

  let dur = Number(p.duracion_seg);
  if (!isFinite(dur) || dur < 0) dur = 0;
  dur = Math.min(Math.round(dur), 86400);
  const version = String(p.version || CONFIG.FORM_VERSION).replace(/[^\w.\-]/g, '').slice(0, 20);
  return { ok: true, id: id, values: values, duracion: dur, version: version };
}

/** Convierte un valor recibido en lo que se escribe en la celda (o un error). */
function normalizeValue_(field, raw) {
  const empty = { value: '' };
  if (raw === undefined || raw === null || raw === '') return empty;
  if (Array.isArray(raw) && raw.length === 0) return empty;

  switch (field.type) {
    case 'text': {
      if (typeof raw !== 'string') return { error: 'tipo no válido' };
      const t = cleanText_(raw);
      if (t === '') return empty;
      if (t.length > field.maxLen) return { error: 'texto demasiado largo' };
      return { value: neutralizeFormula_(t) };
    }
    case 'number': {
      const n = typeof raw === 'number' ? raw : (typeof raw === 'string' && /^\d{1,9}$/.test(raw) ? Number(raw) : NaN);
      if (!isFinite(n) || Math.floor(n) !== n) return { error: 'debe ser un número entero' };
      if (n < field.min || n > field.max) return { error: 'fuera de rango (' + field.min + ' a ' + field.max + ')' };
      return { value: n };
    }
    case 'choice': {
      if (typeof raw !== 'string') return { error: 'tipo no válido' };
      const c = checkChoice_(field, raw);
      return c.error ? { error: c.error } : { value: c.value };
    }
    case 'multi': {
      if (!Array.isArray(raw)) return { error: 'debe ser una lista' };
      if (field.maxChoices && raw.length > field.maxChoices) return { error: 'demasiadas opciones' };
      const seen = {};
      const out = [];
      for (const item of raw) {
        if (typeof item !== 'string') return { error: 'tipo no válido' };
        const c = checkChoice_(field, item);
        if (c.error) return { error: c.error };
        if (!seen[c.value]) { seen[c.value] = true; out.push(c.value); }
      }
      return { value: out.join(SEPARATOR) };
    }
  }
  return { error: 'tipo desconocido' };
}

/** Una opción es válida si está en la lista o si es "Otro: texto" (según la pregunta). */
function checkChoice_(field, value) {
  const v = cleanText_(value);
  if (field.options.indexOf(v) !== -1) return { value: v };
  if (field.other) {
    const prefix = field.other + ': ';
    if (v.indexOf(prefix) === 0 && v.length > prefix.length && v.length <= prefix.length + 80) {
      return { value: neutralizeFormula_(v.replace(/\|/g, '/')) };
    }
  }
  return { error: 'opción no válida' };
}

function cleanText_(s) {
  return String(s)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .trim();
}

/** Evita que Sheets o Excel interpreten el texto como fórmula (=, +, -, @). */
function neutralizeFormula_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

/* ============================== 6. HOJA DE CÁLCULO ============================== */

function getSpreadsheet_() {
  const ss = CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('No se encontró la hoja de cálculo. Crea este script desde Extensiones > Apps Script dentro de tu hoja.');
  return ss;
}

function getSheet_(create) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet && create) sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  return sheet;
}

function allColumns_() {
  return META_COLUMNS.concat(SCHEMA.map(f => ({ key: f.key, header: f.header })));
}
function headers_() {
  return allColumns_().map(c => c.header);
}
function columnFormats_() {
  const meta = ['@', 'yyyy-mm-dd hh:mm:ss', '@', '0', '@'];
  return meta.concat(SCHEMA.map(f => (f.type === 'number' ? '0' : '@')));
}

/** Si la hoja está vacía escribe los encabezados; si no, comprueba que coinciden con el esquema. */
function ensureHeaders_(sheet) {
  const expected = headers_();
  if (sheet.getLastRow() === 0) {
    writeHeaders_(sheet);
    return;
  }
  const found = sheet.getRange(1, 1, 1, expected.length).getValues()[0];
  for (let i = 0; i < expected.length; i++) {
    if (String(found[i]) !== expected[i]) {
      throw new Error('Los encabezados de la hoja no coinciden con el formulario (columna ' + (i + 1) + '). No se guardó nada para no desordenar los datos.');
    }
  }
}

function writeHeaders_(sheet) {
  const headers = headers_();
  const range = sheet.getRange(1, 1, 1, headers.length);
  range.setNumberFormat('@');
  range.setValues([headers]);
  range.setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#000000').setWrap(true).setVerticalAlignment('top');
  sheet.getRange(1, 1, 1, META_COLUMNS.length).setBackground('#E4002B');
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 96);
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 150);
  for (let c = 3; c <= headers.length; c++) sheet.setColumnWidth(c, c <= META_COLUMNS.length ? 110 : 220);
}

function findRowById_(sheet, id) {
  if (!sheet) return 0;
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const hit = sheet.getRange(2, 1, last - 1, 1).createTextFinder(id).matchEntireCell(true).matchCase(true).findNext();
  return hit ? hit.getRow() : 0;
}

/* ============================== 7. RESPUESTAS HTTP ============================== */

/** Devuelve JSON, o JSONP si llega un nombre de función válido en ?callback=. */
function respond_(obj, callback) {
  const body = JSON.stringify(obj);
  if (callback && /^[A-Za-z_][A-Za-z0-9_]{0,60}$/.test(String(callback))) {
    return ContentService.createTextOutput(callback + '(' + body + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

/* ============================== 8. FUNCIONES PARA EJECUTAR A MANO ============================== */

/** PASO ÚNICO DE INSTALACIÓN: crea la pestaña "Respuestas" con sus encabezados. */
function setup() {
  const ss = getSpreadsheet_();
  ss.setSpreadsheetTimeZone(CONFIG.TIMEZONE);
  const sheet = getSheet_(true);
  writeHeaders_(sheet);
  Logger.log('Listo. Pestaña "%s" con %s columnas en: %s', CONFIG.SHEET_NAME, headers_().length, ss.getUrl());
}

/** Escribe una fila de prueba (Estado = "prueba") sin pasar por el formulario. */
function pruebaDeEscritura() {
  const answers = {};
  SCHEMA.forEach(f => {
    if (f.type === 'text') answers[f.key] = 'Texto de prueba';
    else if (f.type === 'number') answers[f.key] = f.min;
    else if (f.type === 'choice') answers[f.key] = f.options[0];
    else answers[f.key] = [f.options[0]];
  });
  const result = saveResponse_({ id: Utilities.getUuid(), version: CONFIG.FORM_VERSION, duracion_seg: 120, hp: '', respuestas: answers }, { estado: 'prueba' });
  Logger.log(JSON.stringify(result));
  if (!result.ok) throw new Error('La prueba falló: ' + JSON.stringify(result));
}

/** Borra las filas cuyo Estado sea "prueba" (útil después de probar). */
function eliminarFilasDePrueba() {
  const sheet = getSheet_(false);
  if (!sheet || sheet.getLastRow() < 2) return;
  const estados = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getValues();
  let borradas = 0;
  for (let i = estados.length - 1; i >= 0; i--) {
    if (String(estados[i][0]) === 'prueba') { sheet.deleteRow(i + 2); borradas++; }
  }
  Logger.log('Filas de prueba borradas: %s', borradas);
}
