'use strict';
const path = require('path');
const assert = require('assert');
const { createGas } = require('./gas-mock');

const CODE = path.join(__dirname, '..', 'dist', 'Code.gs');
let passed = 0;
function t(name, fn) { try { fn(); passed++; console.log('  ok  ' + name); } catch (e) { console.log('  FALLA ' + name + '\n       ' + e.message); process.exitCode = 1; } }

function samplePayload(g, over = {}) {
  const ans = {};
  g.schema.forEach(f => {
    if (f.type === 'text') ans[f.key] = 'Respuesta de ejemplo';
    else if (f.type === 'number') ans[f.key] = f.min;
    else if (f.type === 'choice') ans[f.key] = f.options[0];
    else ans[f.key] = [f.options[0]];
  });
  return { version: '1.0', id: require('crypto').randomUUID(), duracion_seg: 300, hp: '', respuestas: { ...ans, ...(over.respuestas || {}) }, ...Object.fromEntries(Object.entries(over).filter(([k]) => k !== 'respuestas')) };
}
const post = (g, p) => JSON.parse(g.doPost(typeof p === 'string' ? p : JSON.stringify(p)).getContent());

console.log('Servidor (Code.gs real en simulación de Google):');

{
  const g = createGas(CODE);
  const sheet = () => g.store.sheets['Respuestas'];

  t('setup() crea la pestaña con 56 encabezados y fija la zona horaria', () => {
    g.call('setup()');
    assert.strictEqual(g.store.tz, 'America/Lima');
    const hdr = sheet().rows[0];
    assert.strictEqual(hdr.length, 56);
    assert.strictEqual(hdr[0], 'ID de respuesta');
    assert.strictEqual(hdr[5], 'P01 - ¿Qué carrera estudias?');
    assert.ok(hdr.includes('P10b - Seguimiento: ¿Cuál era la duda?'));
  });

  t('pruebaDeEscritura() guarda una fila con Estado = prueba', () => {
    g.call('pruebaDeEscritura()');
    assert.strictEqual(sheet().getLastRow(), 2);
    assert.strictEqual(sheet().rows[1][2], 'prueba');
  });

  let okId;
  t('envío válido: ok, fila nueva, fecha real, estado completa', () => {
    const p = samplePayload(g); okId = p.id;
    const r = post(g, p);
    assert.strictEqual(r.ok, true); assert.strictEqual(r.id, p.id); assert.strictEqual(r.duplicado, false); assert.strictEqual(r.fila, 3);
    const row = sheet().rows[2];
    assert.strictEqual(row[0], p.id); assert.strictEqual(Object.prototype.toString.call(row[1]), '[object Date]'); assert.strictEqual(row[2], 'completa'); assert.strictEqual(row[3], 300);
    assert.strictEqual(row.length, 56);
  });

  t('mismo ID otra vez: no duplica la fila (idempotente)', () => {
    const before = sheet().getLastRow();
    const r = post(g, { ...samplePayload(g), id: okId });
    assert.strictEqual(r.ok, true); assert.strictEqual(r.duplicado, true);
    assert.strictEqual(sheet().getLastRow(), before);
  });

  t('envío muy rápido (< 45 s) se guarda como "revisar"', () => {
    const r = post(g, samplePayload(g, { duracion_seg: 10 }));
    assert.strictEqual(r.ok, true);
    assert.strictEqual(sheet().rows[r.fila - 1][2], 'revisar');
  });

  t('número como texto de dígitos se acepta; se guarda como número', () => {
    const r = post(g, samplePayload(g, { respuestas: { p02_ciclo: '7' } }));
    assert.strictEqual(r.ok, true);
    assert.strictEqual(sheet().rows[r.fila - 1][5 + 1], 7);
  });

  t('opción "Otro: texto" válida se guarda; casillas se unen con " | "', () => {
    const r = post(g, samplePayload(g, { respuestas: { p13_huecos_con_quien: ['Amigos de mi salón', 'Otro: Biblioteca'], p43_motivo_dejar_de_usar: 'Otro: No me da confianza' } }));
    assert.strictEqual(r.ok, true);
    const hdr = sheet().rows[0], row = sheet().rows[r.fila - 1];
    assert.strictEqual(row[hdr.findIndex(h => h.startsWith('P13 '))], 'Amigos de mi salón | Otro: Biblioteca');
    assert.strictEqual(row[hdr.findIndex(h => h.startsWith('P43 '))], 'Otro: No me da confianza');
  });

  t('fórmulas se neutralizan (=, +, -, @) y no se evalúan', () => {
    const r = post(g, samplePayload(g, { respuestas: { p01_carrera: '=HYPERLINK("http://x.com","clic")', p23_que_lo_motivaria: '+1+1', p33_arreglar_una_cosa: '@SUM(1)' } }));
    assert.strictEqual(r.ok, true);
    const hdr = sheet().rows[0], row = sheet().rows[r.fila - 1];
    assert.strictEqual(row[hdr.findIndex(h => h.startsWith('P01 '))], "'=HYPERLINK(\"http://x.com\",\"clic\")");
    assert.strictEqual(row[hdr.findIndex(h => h.startsWith('P23 '))], "'+1+1");
    assert.ok(!g.store.formulaLeak, 'se escribió un "=..." en una celda que no es de texto');
  });

  t('HTML en el texto se guarda como texto (el servidor no lo interpreta)', () => {
    const r = post(g, samplePayload(g, { respuestas: { p01_carrera: '<img src=x onerror=alert(1)>' } }));
    assert.strictEqual(r.ok, true);
    assert.strictEqual(sheet().rows[r.fila - 1][5], '<img src=x onerror=alert(1)>');
  });

  const rejects = [
    ['ciclo fuera de rango', { p02_ciclo: 99 }],
    ['edad con decimales', { p03_edad: 20.5 }],
    ['edad negativa', { p03_edad: -3 }],
    ['opción que no existe', { p04_modalidad: 'Híbrida' }],
    ['sede inventada', { p05_sede: 'Marte' }],
    ['casillas con opción inventada', { p13_huecos_con_quien: ['Nadie'] }],
    ['más de 3 actividades a difundir', { p31_actividades_a_difundir: ['Académicas', 'Deportivas', 'Culturales', 'Concursos'] }],
    ['texto demasiado largo', { p01_carrera: 'x'.repeat(161) }],
    ['tipo equivocado (objeto)', { p01_carrera: { a: 1 } }],
    ['"Otro:" sin texto', { p43_motivo_dejar_de_usar: 'Otro: ' }],
    ['"Otra:" donde la pregunta usa "Otro"', { p43_motivo_dejar_de_usar: 'Otra: algo' }],
    ['falta carrera (obligatoria)', { p01_carrera: '' }],
    ['falta sede (obligatoria)', { p05_sede: '' }],
  ];
  rejects.forEach(([name, over]) => t('rechaza: ' + name, () => {
    const before = sheet().getLastRow();
    const r = post(g, samplePayload(g, { respuestas: over }));
    assert.strictEqual(r.ok, false); assert.strictEqual(r.error, 'validacion');
    assert.strictEqual(sheet().getLastRow(), before, 'no debe escribir nada');
  }));

  t('rechaza: ID mal formado', () => { assert.strictEqual(post(g, { ...samplePayload(g), id: 'abc' }).error, 'id_invalido'); assert.strictEqual(post(g, { ...samplePayload(g), id: '=1+1;DROP' }).error, 'id_invalido'); });
  t('rechaza: trampa de bots llena', () => { assert.strictEqual(post(g, { ...samplePayload(g), hp: 'http://spam.com' }).error, 'rechazado'); });
  t('rechaza: JSON inválido y cuerpo vacío', () => { assert.strictEqual(post(g, '{no es json').error, 'json_invalido'); assert.strictEqual(JSON.parse(g.ctx.doPost({}).getContent()).error, 'sin_datos'); assert.strictEqual(post(g, '[1,2]').error, 'json_invalido'); });
  t('rechaza: cuerpo gigante', () => { assert.strictEqual(post(g, JSON.stringify({ x: 'a'.repeat(70000) })).error, 'muy_grande'); });
  t('rechaza: casi sin respuestas', () => {
    const ans = { p01_carrera: 'X', p02_ciclo: 3, p03_edad: 20, p04_modalidad: 'Virtual', p05_sede: 'Ica' };
    assert.strictEqual(post(g, { id: require('crypto').randomUUID(), respuestas: ans }).error, 'incompleto');
  });
  t('claves desconocidas se ignoran (no crean columnas)', () => {
    const r = post(g, samplePayload(g, { respuestas: { columna_extra: 'x' } }));
    assert.strictEqual(r.ok, true); assert.strictEqual(sheet().rows[r.fila - 1].length, 56);
  });

  t('doGet sin parámetros: servicio funcionando con 56 columnas', () => {
    const r = JSON.parse(g.doGet({}).getContent());
    assert.strictEqual(r.ok, true); assert.strictEqual(r.columnas, 56);
  });
  t('doGet?action=check: existe / no existe', () => {
    assert.strictEqual(JSON.parse(g.doGet({ action: 'check', id: okId }).getContent()).existe, true);
    assert.strictEqual(JSON.parse(g.doGet({ action: 'check', id: require('crypto').randomUUID() }).getContent()).existe, false);
    assert.strictEqual(JSON.parse(g.doGet({ action: 'check', id: 'x' }).getContent()).error, 'id_invalido');
  });
  t('JSONP: solo con nombre de función válido', () => {
    const ok = g.doGet({ action: 'check', id: okId, callback: 'miCb_1' });
    assert.strictEqual(ok.getMimeType(), 'JAVASCRIPT'); assert.ok(/^miCb_1\(\{.*\}\);$/.test(ok.getContent()));
    const bad = g.doGet({ action: 'check', id: okId, callback: 'alert(1);//' });
    assert.strictEqual(bad.getMimeType(), 'JSON');
  });

  t('eliminarFilasDePrueba() borra solo las de prueba', () => {
    const before = sheet().getLastRow();
    g.call('eliminarFilasDePrueba()');
    assert.strictEqual(sheet().getLastRow(), before - 1);
    assert.ok(!sheet().rows.some(r => r && r[2] === 'prueba'));
  });

  t('si cambian los encabezados de la hoja, NO escribe (protege los datos)', () => {
    const before = sheet().getLastRow();
    sheet().rows[0][7] = 'columna renombrada a mano';
    const r = post(g, samplePayload(g));
    assert.strictEqual(r.ok, false); assert.strictEqual(r.error, 'interno');
    assert.strictEqual(sheet().getLastRow(), before);
  });
}

{
  const g = createGas(CODE, { lockBusy: true });
  t('si el candado está ocupado responde "ocupado" y no escribe', () => {
    g.call('setup()');
    const r = post(g, samplePayload(g));
    assert.strictEqual(r.ok, false); assert.strictEqual(r.error, 'ocupado');
    assert.strictEqual(g.store.sheets['Respuestas'].getLastRow(), 1);
  });
}

{
  const g = createGas(CODE);
  t('primer envío sin haber ejecutado setup(): crea la hoja y los encabezados solo', () => {
    const r = post(g, samplePayload(g));
    assert.strictEqual(r.ok, true);
    assert.strictEqual(g.store.sheets['Respuestas'].rows[0].length, 56);
    assert.strictEqual(g.store.sheets['Respuestas'].getLastRow(), 2);
  });
  t('el candado siempre se libera', () => { assert.strictEqual(g.store.locks, 0); });
  t('hojas con más de 1000 filas: se amplía la cuadrícula en vez de fallar', () => {
    const sh = g.store.sheets['Respuestas'];
    sh.maxRows = 3; // simula cuadrícula llena
    for (let i = 0; i < 3; i++) assert.strictEqual(post(g, samplePayload(g)).ok, true);
    assert.ok(sh.getLastRow() >= 5);
  });
}

console.log(`\n${passed} pruebas de servidor correctas` + (process.exitCode ? ' (con fallas arriba)' : ''));
