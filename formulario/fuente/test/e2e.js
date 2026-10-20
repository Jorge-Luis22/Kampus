'use strict';
/* Prueba de extremo a extremo: navegador real (Chromium) + el Code.gs REAL en una simulación de Google.
   NO prueba contra tu cuenta de Google: eso se hace con el README (sección "Probar"). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const { createGas } = require('./gas-mock');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SHOTS = path.join(ROOT, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const FAKE_URL = 'https://script.google.com/macros/s/TESTDEPLOY123/exec';

const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const testHtml = html.replace("'PEGA_AQUI_LA_URL_DEL_WEB_APP'", `'${FAKE_URL}'`);
fs.writeFileSync(path.join(__dirname, 'index.configured.html'), testHtml);
const CONFIGURED = 'file://' + path.join(__dirname, 'index.configured.html');
const UNCONFIGURED = 'file://' + path.join(DIST, 'index.html');

// Preguntas tal como las ve el navegador (para saber qué tipo es cada una)
const Q = vm.runInNewContext('(' + html.match(/const QUESTIONS = (\[[\s\S]*?\n\]);/)[1] + ')', {
  is() {}, has() {}, num() {}, txt() {}, chipUsed() {}, cicloAtLeast() {},
});
const BY = Object.fromEntries(Q.map(q => [q.key, q]));

let passed = 0, failed = 0;
async function t(name, fn) {
  try { await fn(); passed++; console.log('  ok  ' + name); }
  catch (e) { failed++; console.log('  FALLA ' + name + '\n       ' + String(e.message).split('\n').slice(0, 6).join('\n       ')); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------------- personas ---------------- */
const A = { // ciclo 6: recorre las 52 pantallas
  p01_carrera: 'Ingeniería de Sistemas', p02_ciclo: '6', p03_edad: '21', p04_modalidad: 'Presencial', p05_sede: 'Lima Norte',
  p06_conocidos_otra_carrera: '3', p07_ultima_vez_conociste: 'Este mes', p08_como_lo_conociste: 'En un taller de robótica',
  p09_whatsapp_ciclos_anteriores: 'Sigo activo y lo uso',
  p10_duda_sin_saber_a_quien: 'Le escribí a un amigo de ciclo mayor', p10b_cual_era_la_duda: 'Sobre convalidaciones',
  p11_ultima_ayuda_ciclo_mayor: 'Este ciclo', p11b_lo_conocia_y_que_pregunto: 'No lo conocía, le pregunté por un curso',
  p12_quiso_hablar_y_no_hablo: { chip: 'No me ha pasado' },
  p13_huecos_con_quien: ['Amigos de mi salón', 'Otro: Biblioteca'],
  p14_quiere_conocer_en_huecos: 'Sí', p15_actividad_con_esa_persona: ['Estudiar o hacer tareas', 'Otra: Jugar fútbol'],
  p16_ayuda_pedida_por_menores: '4', p16b_amigo_o_desconocido: 'Un amigo',
  p17_trabajos_con_encuestas: '3', p18_perfil_especifico: 'Sí', p18b_que_perfil_y_que_hizo: 'Gente de Derecho; pedí a un amigo',
  p19_como_consiguio_encuestados: ['Compañeros de mi salón', 'Grupos de WhatsApp o redes'],
  p20_como_le_fue_con_respuestas: 'Me costó mucho', p21_que_hizo_si_no_llegaba: 'Inventé datos',
  p22_encuestas_respondidas: '2', p23_que_lo_motivaria: 'Que me devuelvan el favor',
  p24_ultima_vez_outlook: 'Hoy', p25_correos_sin_leer: '1200', p26_programas_que_recuerda: { chip: 'No recuerdo ninguno' },
  p27_pertenece_a_grupo: 'No', p27b_por_que_no: 'No sabía cómo entrar',
  p28_eventos_este_anio: '2', p29_que_eventos: 'Feria de empleo y una charla de IA', p30_como_se_entero_evento: 'Instagram',
  p31_actividades_a_difundir: ['Conferencias', 'Concursos', 'Otra: Hackatones'], p31b_tipo_conferencias_concursos: 'De tecnología y emprendimiento',
  p32_asistiria_otras_carreras: 'Sí', p33_arreglar_una_cosa: 'Poder encontrar gente de otras carreras fácil',
  p34_linkedin: 'No tengo', p34b_por_que_no_linkedin: 'Siento que es para gente que ya trabaja',
  p35_app_parecida: 'Sí', p35b_cual_app: 'Grupos de WhatsApp',
  p36_que_haria_no_instalar: 'Que pida muchos permisos', p37_acuerdo_nombre_carrera_ciclo: 'Sí, siempre que sea solo para alumnos',
  p38_funcion_unica: 'Armar equipos multidisciplinarios con gente de otras carreras para proyectos, hackatones o tesis',
  p39_contenido_pantalla_inicial: 'Avisos de eventos', p40_relevancia_filtros: '4 - Relevante', p41_crear_eventos: 'Sí',
  p42_momentos_de_uso: ['Entre clases', 'En casa por la noche'], p43_motivo_dejar_de_usar: 'Otro: Que se llene de publicidad',
};
const B = { // ciclo 1: toma todos los atajos (34 pantallas)
  p01_carrera: 'Psicología', p02_ciclo: '1', p03_edad: '17', p04_modalidad: 'Virtual', p05_sede: 'Arequipa',
  p06_conocidos_otra_carrera: '0', p07_ultima_vez_conociste: 'Nunca',
  p10_duda_sin_saber_a_quien: { chip: 'No me ha pasado' }, p11_ultima_ayuda_ciclo_mayor: 'Nunca',
  p12_quiso_hablar_y_no_hablo: 'Me dio vergüenza escribirle', p13_huecos_con_quien: ['Solo(a)'],
  p14_quiere_conocer_en_huecos: 'No', p17_trabajos_con_encuestas: '0',
  p22_encuestas_respondidas: '0', p23_que_lo_motivaria: 'Un incentivo',
  p24_ultima_vez_outlook: 'Nunca lo he abierto', p25_correos_sin_leer: '0', p26_programas_que_recuerda: 'Ninguno, no conozco',
  p27_pertenece_a_grupo: 'Sí', p28_eventos_este_anio: '0', p31_actividades_a_difundir: ['Académicas'],
  p32_asistiria_otras_carreras: 'No', p33_arreglar_una_cosa: 'Todo',
  p34_linkedin: 'Sí, y entro seguido', p35_app_parecida: 'No', p36_que_haria_no_instalar: 'Que no tenga gente',
  p37_acuerdo_nombre_carrera_ciclo: 'No, prefiero anonimato', p38_funcion_unica: 'Enterarme de clubes y eventos',
  p39_contenido_pantalla_inicial: 'Noticias del campus', p40_relevancia_filtros: '2 - Poco relevante', p41_crear_eventos: 'No',
  p42_momentos_de_uso: ['Fines de semana'], p43_motivo_dejar_de_usar: 'Me quita tiempo',
};
const B_HIDDEN = ['p08_como_lo_conociste', 'p09_whatsapp_ciclos_anteriores', 'p10b_cual_era_la_duda', 'p11b_lo_conocia_y_que_pregunto',
  'p15_actividad_con_esa_persona', 'p16_ayuda_pedida_por_menores', 'p16b_amigo_o_desconocido', 'p18_perfil_especifico', 'p18b_que_perfil_y_que_hizo',
  'p19_como_consiguio_encuestados', 'p20_como_le_fue_con_respuestas', 'p21_que_hizo_si_no_llegaba', 'p27b_por_que_no', 'p29_que_eventos',
  'p30_como_se_entero_evento', 'p31b_tipo_conferencias_concursos', 'p34b_por_que_no_linkedin', 'p35b_cual_app'];

/* Lo que debe quedar en la hoja para una persona */
function expectedCell(q, v) {
  if (v === undefined) return '';
  if (v && v.chip) return v.chip;
  if (q.type === 'number') return Number(v);
  if (q.type === 'checkbox') return v.join(' | ');
  return v;
}

/* ---------------- Apps Script simulado + rutas ---------------- */
function makeBackend(opts = {}) {
  const gas = createGas(path.join(DIST, 'Code.gs'));
  const b = { gas, posts: 0, checks: 0, bodies: [], mode: opts.mode || (() => 'ok'), checkMode: opts.checkMode || (() => 'ok') };
  b.rows = () => { const sh = gas.store.sheets['Respuestas']; return sh ? sh.rows.slice(1).filter(Boolean) : []; };
  b.install = async context => {
    await context.route('https://script.google.com/**', async route => {
      const req = route.request(); const url = new URL(req.url());
      if (req.method() === 'POST') {
        b.posts++; const body = req.postData() || ''; b.bodies.push(body);
        const mode = b.mode(b.posts);
        const cors = { 'access-control-allow-origin': '*' };
        if (mode === 'abort') return route.abort('failed');
        if (mode === 'writeThenAbort') { gas.doPost(body); return route.abort('failed'); }
        if (mode === 'html') return route.fulfill({ status: 200, contentType: 'text/html', headers: cors, body: '<html><body>Inicia sesión</body></html>' });
        if (mode === 'busy') { gas.store.lockBusy = true; const out = gas.doPost(body); gas.store.lockBusy = false; return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: out.getContent() }); }
        if (mode === 'slow') await sleep(1500);
        const out = gas.doPost(body);
        return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: out.getContent() });
      }
      const p = Object.fromEntries(url.searchParams.entries());
      if (p.action === 'check') {
        b.checks++;
        if (b.checkMode(b.checks) === 'abort') return route.abort('failed');
        return route.fulfill({ status: 200, contentType: 'application/javascript', body: gas.doGet(p).getContent() });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: gas.doGet(p).getContent() });
    });
  };
  return b;
}

/* ---------------- manejo de la interfaz ---------------- */
const view = page => page.locator('.view:not(.leaving)');
async function curKey(page) {
  const el = view(page).locator('.q-title');
  if (!(await el.count())) return null;
  return (await el.first().getAttribute('id')).slice(3);
}
async function waitChange(page, prev) {
  await page.waitForFunction(p => {
    const el = document.querySelector('.view:not(.leaving) .q-title');
    return document.querySelector('.view:not(.leaving) #dTitle') || (el && el.id !== 'qt-' + p);
  }, prev, { timeout: 8000 });
}
async function answer(page, q, v, last) {
  const vw = view(page);
  if (['text', 'long', 'number'].includes(q.type)) {
    if (v && v.chip) await vw.locator('.chip', { hasText: v.chip }).click(); else await vw.locator('#in-' + q.key).fill(v);
    return 'submit';
  }
  if (q.type === 'select') { await vw.locator('#in-' + q.key).selectOption(v); return 'submit'; }
  const pick = async item => {
    let idx = q.options.indexOf(item), other = null;
    if (idx < 0 && q.other && item.startsWith(q.other + ': ')) { idx = q.options.length; other = item.slice(q.other.length + 2); }
    assert.ok(idx >= 0, `opción desconocida en ${q.key}: ${item}`);
    await vw.locator('label.opt').nth(idx).click();
    if (other !== null) await vw.locator('.other-in').fill(other);
    return other !== null;
  };
  if (q.type === 'radio') { const hasOther = await pick(v); return hasOther || last ? 'submit' : 'auto'; }
  if (q.type === 'checkbox') { for (const item of v) await pick(item); return 'submit'; }
  throw new Error('tipo ' + q.type);
}
/* Recorre la encuesta; devuelve las claves visitadas. stopAtEnd: se detiene justo antes de pulsar "Enviar". */
async function walk(page, persona, { stopAtEnd = false, shots = {} } = {}) {
  await page.locator('#startBtn').click();
  const visited = [];
  for (let guard = 0; guard < 80; guard++) {
    await page.waitForFunction(() => document.querySelector('.view:not(.leaving) .q-title'));
    const key = await curKey(page);
    visited.push(key);
    const q = BY[key];
    const btn = (await page.locator('#nextBtn').innerText()).trim();
    const last = btn === 'Enviar respuestas';
    if (shots[key]) { await sleep(350); await page.screenshot({ path: path.join(SHOTS, shots[key] + '.png') }); }
    let how = 'submit';
    if (q.type !== 'info') {
      assert.ok(key in persona, `la persona de prueba no tiene respuesta para ${key} (¿apareció una pregunta que no debía?)`);
      how = await answer(page, q, persona[key], last);
    }
    if (last && stopAtEnd) return visited;
    if (how === 'auto') await waitChange(page, key);
    else { await page.locator('#nextBtn').click(); if (last) return visited; await waitChange(page, key); }
  }
  throw new Error('la encuesta no terminó');
}
async function newPage(browser, { mobile = false, dark = false, reduced = false, url = CONFIGURED, backend } = {}) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 860 },
    isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1,
    colorScheme: dark ? 'dark' : 'light', reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  if (backend) await backend.install(ctx);
  const page = await ctx.newPage();
  page.on('dialog', d => d.dismiss().catch(() => {}));
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_FAILED/.test(m.text())) errors.push(m.text()); });
  await page.goto(url);
  page.errors = errors; page.ctx = ctx;
  return page;
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  console.log('Navegador + Code.gs simulado:');

  /* ===== 1. Persona A completa, escritorio ===== */
  const backA = makeBackend();
  let pageA = await newPage(browser, { backend: backA });
  await t('pantalla inicial: encabezado UTP, hueco de logo, botón y sin aviso de configuración', async () => {
    await pageA.screenshot({ path: path.join(SHOTS, '01-welcome-desktop.png') });
    assert.ok(await pageA.getByText('Universidad Tecnológica del Perú').first().isVisible());
    assert.ok(await pageA.locator('.logo-slot.empty').count() === 1, 'sin logo-utp.png debe mostrarse el hueco');
    assert.ok(await pageA.locator('#startBtn').isVisible());
    assert.ok(await pageA.locator('#configWarn').isHidden());
  });
  let visitedA;
  await t('persona A recorre las 52 pantallas en el orden del esquema y envía', async () => {
    const shots = { p01_carrera: '02-text', p02_ciclo: '03-number', p04_modalidad: '04-radio', p05_sede: '05-select', p10_duda_sin_saber_a_quien: '06-long-chips',
      p10b_cual_era_la_duda: '07-followup', p13_huecos_con_quien: '08-checkbox', info_idea: '09-info', p40_relevancia_filtros: '10-scale', p31_actividades_a_difundir: '11-max3' };
    visitedA = await walk(pageA, A, { shots });
    await pageA.waitForSelector('#dTitle', { timeout: 10000 });
    { const exp = Q.map(q => q.key); const diff = { primeraDiferencia: exp.map((k, i) => [i, k, visitedA[i]]).filter(x => x[1] !== x[2]).slice(0, 4) }; assert.strictEqual(JSON.stringify(visitedA), JSON.stringify(exp), JSON.stringify(diff)); }
    await sleep(900); await pageA.screenshot({ path: path.join(SHOTS, '12-done-desktop.png') });
  });
  await t('pantalla de éxito solo tras confirmación real: 1 POST, 1 fila, código visible', async () => {
    assert.strictEqual(backA.posts, 1); assert.strictEqual(backA.rows().length, 1);
    const id = JSON.parse(backA.bodies[0]).id;
    assert.strictEqual((await pageA.locator('#doneCode').innerText()), id.slice(0, 8).toUpperCase());
  });
  await t('la fila coincide con lo que respondió A (todas las columnas)', async () => {
    const sh = backA.gas.store.sheets['Respuestas']; const hdr = sh.rows[0]; const row = backA.rows()[0];
    const schema = backA.gas.schema;
    schema.forEach((f, i) => {
      const col = 5 + i; const q = BY[f.key];
      assert.strictEqual(hdr[col], f.header);
      assert.deepStrictEqual(row[col], expectedCell(q, A[f.key]), `columna ${f.key}`);
    });
    assert.strictEqual(row[2], 'completa'.length ? row[2] : '');
  });
  await t('sin errores de JavaScript en consola', async () => { assert.deepStrictEqual(pageA.errors, []); });
  await t('"Registrar otra respuesta" vuelve al inicio con estado limpio', async () => {
    await pageA.locator('#againBtn').click();
    await pageA.waitForSelector('#startBtn');
    await pageA.locator('#startBtn').click();
    await pageA.waitForSelector('#in-p01_carrera');
    assert.strictEqual(await pageA.locator('#in-p01_carrera').inputValue(), '');
  });
  await pageA.ctx.close();

  /* ===== 2. Persona B: saltos, móvil, avance automático ===== */
  const backB = makeBackend();
  const pageB = await newPage(browser, { mobile: true, backend: backB });
  await pageB.screenshot({ path: path.join(SHOTS, '20-welcome-mobile.png'), fullPage: true });
  await t('persona B (ciclo 1) se salta 18 pantallas y recorre 34', async () => {
    const visited = await walk(pageB, B, { shots: { p04_modalidad: '21-radio-mobile', p13_huecos_con_quien: '22-check-mobile', p02_ciclo: '23-number-mobile' } });
    await pageB.waitForSelector('#dTitle', { timeout: 10000 });
    assert.strictEqual(visited.length, 34);
    { const exp = Q.map(q => q.key).filter(k => !B_HIDDEN.includes(k)); const diff = { faltan: exp.filter(k => !visited.includes(k)), sobran: visited.filter(k => !exp.includes(k)) }; assert.strictEqual(JSON.stringify(visited), JSON.stringify(exp), JSON.stringify(diff)); }
    visited.forEach(k => assert.ok(!B_HIDDEN.includes(k)));
  });
  await t('las preguntas saltadas quedan vacías en la hoja y las demás coinciden', async () => {
    const row = backB.rows()[0]; const schema = backB.gas.schema;
    schema.forEach((f, i) => {
      if (B_HIDDEN.includes(f.key)) assert.strictEqual(row[5 + i], '', `${f.key} debía quedar vacía`);
      else assert.deepStrictEqual(row[5 + i], expectedCell(BY[f.key], B[f.key]), f.key);
    });
  });
  await t('ciclo 1: la sección "Ayuda entre ciclos" no aparece', async () => { assert.ok(!backB.gas.schema.find(f => f.key === 'p16_ayuda_pedida_por_menores' && backB.rows()[0][5 + backB.gas.schema.indexOf(f)] !== '')); });
  await pageB.ctx.close();

  /* ===== 3. Validaciones en pantalla ===== */
  const backV = makeBackend();
  const pv = await newPage(browser, { backend: backV });
  await pv.locator('#startBtn').click();
  await pv.waitForSelector('#in-p01_carrera');
  await t('texto vacío: muestra error, no avanza, marca el campo', async () => {
    await pv.locator('#nextBtn').click();
    await pv.waitForSelector('.error.show');
    assert.match(await pv.locator('.error.show').innerText(), /Escribe tu respuesta/);
    assert.strictEqual(await curKey(pv), 'p01_carrera');
    assert.strictEqual(await pv.locator('#in-p01_carrera').getAttribute('aria-invalid'), 'true');
    await pv.screenshot({ path: path.join(SHOTS, '30-error.png') });
  });
  await t('al escribir, el error desaparece; con 1 letra pide más; con 2 avanza', async () => {
    await pv.locator('#in-p01_carrera').fill('A');
    assert.ok(await pv.locator('.error.show').count() === 0);
    await pv.locator('#nextBtn').click();
    assert.match(await pv.locator('.error.show').innerText(), /al menos 2/);
    await pv.locator('#in-p01_carrera').fill('Derecho');
    await pv.keyboard.press('Enter');             // Enter también avanza
    await waitChange(pv, 'p01_carrera');
    assert.strictEqual(await curKey(pv), 'p02_ciclo');
  });
  await t('número: rechaza letras al teclear, fuera de rango y vacío', async () => {
    await pv.locator('#in-p02_ciclo').pressSequentially('1a2b');
    assert.strictEqual(await pv.locator('#in-p02_ciclo').inputValue(), '12');
    await pv.locator('#in-p02_ciclo').fill('13');
    await pv.locator('#nextBtn').click();
    assert.match(await pv.locator('.error.show').innerText(), /entre 1 y 12/);
    await pv.locator('#in-p02_ciclo').fill('');
    await pv.locator('#nextBtn').click();
    assert.match(await pv.locator('.error.show').innerText(), /Escribe un número/);
    await pv.locator('#in-p02_ciclo').fill('7');
    await pv.locator('#nextBtn').click(); await waitChange(pv, 'p02_ciclo');
  });
  await t('"Anterior" conserva lo escrito y "Siguiente" lo recuerda', async () => {
    await pv.locator('#in-p03_edad').fill('22');
    await pv.locator('#nextBtn').click(); await waitChange(pv, 'p03_edad');   // ahora en modalidad
    await pv.locator('#prevBtn').click(); await waitChange(pv, 'p04_modalidad');
    assert.strictEqual(await pv.locator('#in-p03_edad').inputValue(), '22');
    await pv.locator('#prevBtn').click(); await waitChange(pv, 'p03_edad');
    assert.strictEqual(await pv.locator('#in-p02_ciclo').inputValue(), '7');
    await pv.locator('#nextBtn').click(); await waitChange(pv, 'p02_ciclo');
    await pv.locator('#nextBtn').click(); await waitChange(pv, 'p03_edad');
  });
  await t('radio: sin elegir da error; elegir con el mouse avanza solo', async () => {
    assert.strictEqual(await curKey(pv), 'p04_modalidad');
    await pv.locator('#nextBtn').click();
    assert.match(await pv.locator('.error.show').innerText(), /Elige una opción/);
    await pv.locator('label.opt').nth(0).click();
    await waitChange(pv, 'p04_modalidad');
    assert.strictEqual(await curKey(pv), 'p05_sede');
  });
  await t('lista desplegable (sede): exige elegir', async () => {
    await pv.locator('#nextBtn').click();
    assert.match(await pv.locator('.error.show').innerText(), /Elige una opción de la lista/);
    await pv.locator('#in-p05_sede').selectOption('Trujillo');
    await pv.locator('#nextBtn').click(); await waitChange(pv, 'p05_sede');
  });
  await t('teclado: elegir con flechas NO avanza solo', async () => {
    assert.strictEqual(await curKey(pv), 'p06_conocidos_otra_carrera');
    await pv.locator('#in-p06_conocidos_otra_carrera').fill('1');
    await pv.locator('#nextBtn').click(); await waitChange(pv, 'p06_conocidos_otra_carrera');   // p07 (radio)
    assert.strictEqual(await curKey(pv), 'p07_ultima_vez_conociste');
    await pv.locator('label.opt input').first().focus();
    await pv.keyboard.press('Space');
    await sleep(700);
    assert.strictEqual(await curKey(pv), 'p07_ultima_vez_conociste', 'no debía avanzar con teclado');
    await pv.keyboard.press('ArrowDown');
    await sleep(500);
    assert.strictEqual(await curKey(pv), 'p07_ultima_vez_conociste');
    await pv.locator('#nextBtn').click(); await waitChange(pv, 'p07_ultima_vez_conociste');
  });
  await t('"Otro" exige texto y no avanza solo; casillas: máximo 3 deshabilita el resto', async () => {
    // llegar a p13 (casillas con "Otro")
    for (let g = 0; g < 10 && (await curKey(pv)) !== 'p13_huecos_con_quien'; g++) {
      const key = await curKey(pv); const q = BY[key];
      const v = key in A ? A[key] : null;
      const how = await answer(pv, q, key === 'p07_ultima_vez_conociste' ? 'Nunca' : v, false);
      if (how === 'auto') await waitChange(pv, key); else { await pv.locator('#nextBtn').click(); await waitChange(pv, key); }
    }
    assert.strictEqual(await curKey(pv), 'p13_huecos_con_quien');
    await pv.locator('label.opt').nth(5).click();                 // "Otro" sin texto
    await pv.locator('#nextBtn').click();
    assert.match(await pv.locator('.error.show').innerText(), /Escribe cuál es tu respuesta en «Otro»/);
    assert.ok(await pv.locator('.other-in').isVisible());
    await pv.locator('.other-in').fill('Biblioteca');
    await pv.locator('#nextBtn').click(); await waitChange(pv, 'p13_huecos_con_quien');
  });
  await pv.ctx.close();

  /* máximo 3 en p31 (prueba directa en esa pantalla) */
  {
    const bk = makeBackend(); const p = await newPage(browser, { backend: bk });
    await t('p31: al marcar 3 actividades, las demás se deshabilitan; al quitar una se liberan', async () => {
      await p.locator('#startBtn').click();
      const partial = { ...A, p02_ciclo: '1', p07_ultima_vez_conociste: 'Nunca', p10_duda_sin_saber_a_quien: { chip: 'No me ha pasado' }, p11_ultima_ayuda_ciclo_mayor: 'Nunca', p14_quiere_conocer_en_huecos: 'No', p17_trabajos_con_encuestas: '0', p27_pertenece_a_grupo: 'Sí', p28_eventos_este_anio: '0' };
      for (let g = 0; g < 60 && (await curKey(p)) !== 'p31_actividades_a_difundir'; g++) {
        const key = await curKey(p); const q = BY[key];
        if (q.type === 'info') { await p.locator('#nextBtn').click(); await waitChange(p, key); continue; }
        const how = await answer(p, q, partial[key], false);
        if (how === 'auto') await waitChange(p, key); else { await p.locator('#nextBtn').click(); await waitChange(p, key); }
      }
      assert.strictEqual(await curKey(p), 'p31_actividades_a_difundir');
      const labels = p.locator('.view:not(.leaving) label.opt');
      await labels.nth(0).click(); await labels.nth(1).click(); await labels.nth(2).click();
      assert.strictEqual(await p.locator('.view:not(.leaving) input:disabled').count(), 5);
      await p.screenshot({ path: path.join(SHOTS, '11-max3.png') });
      await labels.nth(1).click();
      assert.strictEqual(await p.locator('.view:not(.leaving) input:disabled').count(), 0);
    });
    await p.ctx.close();
  }

  /* ===== 4. Envío: duplicados, errores, reintentos ===== */
  async function toEnd(backend, opts = {}) {
    const page = await newPage(browser, { backend, ...opts });
    await walk(page, B, { stopAtEnd: true });
    return page;
  }
  {
    const bk = makeBackend({ mode: () => 'slow' });
    const p = await toEnd(bk);
    await t('doble/triple clic en "Enviar": un solo POST y una sola fila; muestra "Enviando…"', async () => {
      const btn = p.locator('#nextBtn');
      await btn.click();
      await btn.click({ force: true, timeout: 500 }).catch(() => {});
      await p.keyboard.press('Enter').catch(() => {});
      await sleep(300);
      assert.match(await btn.innerText(), /Enviando/);
      assert.ok(await btn.isDisabled());
      await p.screenshot({ path: path.join(SHOTS, '31-sending.png') });
      await p.waitForSelector('#dTitle', { timeout: 10000 });
      assert.strictEqual(bk.posts, 1); assert.strictEqual(bk.rows().length, 1);
    });
    await p.ctx.close();
  }
  {
    const bk = makeBackend({ mode: n => (n === 1 ? 'abort' : 'ok') });
    const p = await toEnd(bk);
    await t('falla de red (nada se guardó): error claro, respuestas conservadas, reintento sin duplicar', async () => {
      await p.locator('#nextBtn').click();
      await p.waitForSelector('.error.show', { timeout: 20000 });
      assert.match(await p.locator('.error.show').innerText(), /no se guardaron/i);
      assert.strictEqual(await p.locator('#dTitle').count(), 0, 'no debe mostrar éxito');
      assert.strictEqual(bk.rows().length, 0);
      assert.match(await p.locator('#nextBtn').innerText(), /Reintentar envío/);
      assert.ok(await p.locator('#nextBtn').isEnabled());
      await p.screenshot({ path: path.join(SHOTS, '32-error-send.png') });
      await p.locator('#nextBtn').click();
      await p.waitForSelector('#dTitle', { timeout: 10000 });
      assert.strictEqual(bk.rows().length, 1);
      const ids = bk.bodies.map(b => JSON.parse(b).id); assert.strictEqual(new Set(ids).size, 1, 'el reintento usa el mismo ID');
    });
    await p.ctx.close();
  }
  {
    const bk = makeBackend({ mode: () => 'writeThenAbort' });
    const p = await toEnd(bk);
    await t('se guardó pero la respuesta no se pudo leer (CORS): lo confirma consultando la hoja, sin reenviar', async () => {
      await p.locator('#nextBtn').click();
      await p.waitForSelector('#dTitle', { timeout: 20000 });
      assert.strictEqual(bk.posts, 1); assert.ok(bk.checks >= 1); assert.strictEqual(bk.rows().length, 1);
    });
    await p.ctx.close();
  }
  {
    const bk = makeBackend({ mode: () => 'abort', checkMode: () => 'abort' });
    const p = await toEnd(bk);
    await t('sin conexión total: dice que no pudo confirmar (no afirma que se guardó)', async () => {
      await p.locator('#nextBtn').click();
      await p.waitForSelector('.error.show', { timeout: 40000 });
      assert.match(await p.locator('.error.show').innerText(), /No pudimos confirmar/);
      assert.strictEqual(await p.locator('#dTitle').count(), 0);
    });
    await p.ctx.close();
  }
  {
    const bk = makeBackend({ mode: n => (n === 1 ? 'busy' : 'ok') });
    const p = await toEnd(bk);
    await t('servidor ocupado: muestra su mensaje, no da éxito; reintento funciona', async () => {
      await p.locator('#nextBtn').click();
      await p.waitForSelector('.error.show', { timeout: 10000 });
      assert.match(await p.locator('.error.show').innerText(), /muchas personas|Inténtalo/);
      await p.locator('#nextBtn').click();
      await p.waitForSelector('#dTitle', { timeout: 10000 });
      assert.strictEqual(bk.rows().length, 1);
    });
    await p.ctx.close();
  }
  {
    const bk = makeBackend({ mode: () => 'html' });
    const p = await toEnd(bk);
    await t('Web App mal desplegado (devuelve una página de login): no da éxito', async () => {
      await p.locator('#nextBtn').click();
      await p.waitForSelector('.error.show', { timeout: 40000 });
      assert.strictEqual(await p.locator('#dTitle').count(), 0);
    });
    await p.ctx.close();
  }
  {
    const p = await newPage(browser, { url: UNCONFIGURED });
    await t('sin URL configurada: aviso en pantalla inicial y al enviar no hace ninguna llamada ni da éxito', async () => {
      assert.ok(await p.locator('#configWarn').isVisible());
      await p.screenshot({ path: path.join(SHOTS, '33-unconfigured.png') });
      let calls = 0; p.on('request', r => { if (/script\.google\.com/.test(r.url())) calls++; });
      await walk(p, B, { stopAtEnd: true });
      await p.locator('#nextBtn').click();
      await p.waitForSelector('.error.show');
      assert.match(await p.locator('.error.show').innerText(), /todavía no está conectado/);
      assert.strictEqual(calls, 0); assert.strictEqual(await p.locator('#dTitle').count(), 0);
    });
    await p.ctx.close();
  }
  {
    const bk = makeBackend();
    const p = await newPage(browser, { backend: bk });
    await t('trampa de bots: si el campo oculto llega lleno el servidor lo rechaza', async () => {
      await walk(p, B, { stopAtEnd: true });
      await p.evaluate(() => { document.getElementById('hp').value = 'http://spam'; });
      await p.locator('#nextBtn').click();
      await p.waitForSelector('.error.show', { timeout: 10000 });
      assert.strictEqual(bk.rows().length, 0);
    });
    await p.ctx.close();
  }
  {
    // el texto del usuario no se interpreta como HTML en pantalla
    const bk = makeBackend(); const p = await newPage(browser, { backend: bk });
    await t('XSS: HTML escrito por el usuario se muestra como texto (contexto de seguimiento) y no ejecuta', async () => {
      await p.evaluate(() => { window.__xss = 0; });
      const evil = { ...A, p35_app_parecida: 'Sí', p01_carrera: '<img src=x onerror="window.__xss=1">', p10_duda_sin_saber_a_quien: '<b onmouseover=window.__xss=1>x</b>' };
      await walk(p, evil, { stopAtEnd: true });
      await sleep(300);
      assert.strictEqual(await p.evaluate(() => window.__xss), 0);
      assert.strictEqual(await p.locator('.view img[src="x"]').count(), 0);
      await p.locator('#nextBtn').click(); await p.waitForSelector('#dTitle', { timeout: 10000 });
      assert.strictEqual(bk.rows()[0][5], '<img src=x onerror="window.__xss=1">');
    });
    await p.ctx.close();
  }

  /* ===== 5. Accesibilidad y movimiento ===== */
  {
    const p = await newPage(browser, { reduced: true });
    await t('prefers-reduced-motion: el sitio arranca con animaciones reducidas y el botón lo refleja', async () => {
      assert.strictEqual(await p.evaluate(() => document.documentElement.dataset.motion), 'reduced');
      assert.strictEqual(await p.locator('#motionBtn').getAttribute('aria-pressed'), 'true');
      await p.locator('#startBtn').click(); await p.waitForSelector('#in-p01_carrera');
      assert.strictEqual(await p.locator('.view.leaving').count(), 0, 'sin animación de salida');
      assert.strictEqual(await p.locator('.view').count(), 1);
    });
    await t('el botón del encabezado alterna las animaciones', async () => {
      await p.locator('#motionBtn').click();
      assert.strictEqual(await p.evaluate(() => document.documentElement.dataset.motion), 'full');
      assert.strictEqual(await p.locator('#motionBtn').getAttribute('aria-pressed'), 'false');
    });
    await p.ctx.close();
  }
  {
    const p = await newPage(browser);
    await t('barra de progreso: nodos por sección, valor numérico y aria', async () => {
      await p.locator('#startBtn').click(); await p.waitForSelector('#in-p01_carrera');
      assert.strictEqual(await p.locator('#route li').count(), 8, 'al inicio se asume ciclo ≥5 (8 secciones)');
      assert.strictEqual(await p.locator('#pbar').getAttribute('role'), 'progressbar');
      await p.locator('#in-p01_carrera').fill('Derecho'); await p.locator('#nextBtn').click(); await waitChange(p, 'p01_carrera');
      await p.locator('#in-p02_ciclo').fill('2'); await p.locator('#nextBtn').click(); await waitChange(p, 'p02_ciclo');
      assert.strictEqual(await p.locator('#route li').count(), 7, 'con ciclo 2 desaparece "Ayuda entre ciclos"');
      assert.ok(Number(await p.locator('#pbar').getAttribute('aria-valuenow')) > 0);
      await p.screenshot({ path: path.join(SHOTS, '34-progress.png') });
    });
    await t('foco: al cambiar de pregunta el foco queda en la pregunta o su campo, y hay anuncio para lectores de pantalla', async () => {
      const tag = await p.evaluate(() => document.activeElement && (document.activeElement.className || document.activeElement.tagName));
      assert.ok(/q-title|input|textarea/.test(tag), tag);
      assert.match(await p.locator('#live').innerText(), /Pregunta \d+ de \d+/);
    });
    await p.ctx.close();
  }
  {
    const p = await newPage(browser, { dark: true, mobile: true });
    await p.screenshot({ path: path.join(SHOTS, '40-welcome-dark-mobile.png') });
    await p.locator('#startBtn').click(); await p.waitForSelector('#in-p01_carrera'); await sleep(400);
    await p.locator('#in-p01_carrera').fill('Derecho'); await p.locator('#nextBtn').click(); await waitChange(p, 'p01_carrera');
    await p.locator('#in-p02_ciclo').fill('6'); await p.locator('#nextBtn').click(); await waitChange(p, 'p02_ciclo');
    await p.locator('#in-p03_edad').fill('20'); await p.locator('#nextBtn').click(); await waitChange(p, 'p03_edad'); await sleep(400);
    await p.screenshot({ path: path.join(SHOTS, '41-radio-dark-mobile.png') });
    await p.locator('label.opt').nth(0).click(); await waitChange(p, 'p04_modalidad'); await sleep(400);
    await p.screenshot({ path: path.join(SHOTS, '42-select-dark-mobile.png') });
    await p.ctx.close();
  }
  {
    const p = await newPage(browser, { mobile: true });
    await t('móvil: sin desplazamiento horizontal en ninguna pantalla muestreada', async () => {
      const wide = async () => p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      assert.ok(!(await wide()));
      await p.locator('#startBtn').click(); await p.waitForSelector('#in-p01_carrera'); assert.ok(!(await wide()));
    });
    await p.ctx.close();
  }

  await browser.close();
  console.log(`\n${passed} correctas, ${failed} con falla`);
  if (failed) process.exitCode = 1;
})().catch(e => { console.error('ERROR GENERAL', e); process.exit(2); });
