// Verifica que las preguntas del index.html y las columnas de Code.gs/README coinciden (nombres, orden, tipos, opciones, límites).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path'), assert = require('assert');
const { createGas } = require('./gas-mock');
const DIST = path.join(__dirname, '..', 'dist');
const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const readme = fs.readFileSync(path.join(DIST, 'README.md'), 'utf8');

function extract(name) {
  const i = html.indexOf('const ' + name + ' = ');
  assert.ok(i >= 0, 'no se encontró ' + name);
  let depth = 0, j = html.indexOf('[', i), start = j;
  for (; j < html.length; j++) { if (html[j] === '[') depth++; else if (html[j] === ']') { depth--; if (depth === 0) break; } }
  return html.slice(start, j + 1);
}
const stubs = new Proxy({}, { get: () => () => true, has: () => true });
const Q = vm.runInNewContext(extract('QUESTIONS'), vm.createContext(Object.assign({}, { is: () => true, has: () => true, num: () => 0, txt: () => '', chipUsed: () => false, cicloAtLeast: () => true })));
const g = createGas(path.join(DIST, 'Code.gs'));
const S = g.schema;
let n = 0; const ok = (m) => { n++; };

const qs = Q.filter(q => q.type !== 'info');
assert.strictEqual(qs.length, S.length, `HTML tiene ${qs.length} preguntas y Code.gs ${S.length} columnas`); ok();
const keysHtml = qs.map(q => q.key), keysGs = S.map(f => f.key);
assert.strictEqual(new Set(keysHtml).size, keysHtml.length, 'claves repetidas en el HTML'); ok();
assert.strictEqual(JSON.stringify(keysHtml), JSON.stringify(keysGs), 'el orden o los nombres no coinciden'); ok();

const typeMap = { text: 'text', long: 'text', number: 'number', radio: 'choice', select: 'choice', checkbox: 'multi' };
qs.forEach((q, i) => {
  const f = S[i], tag = q.key;
  assert.strictEqual(typeMap[q.type], f.type, `${tag}: tipo ${q.type} vs ${f.type}`);
  if (f.type === 'choice' || f.type === 'multi') {
    assert.strictEqual(JSON.stringify(q.options), JSON.stringify(f.options), `${tag}: opciones distintas`);
    const hasOther = !!q.other;
    assert.strictEqual(hasOther, !!f.other, `${tag}: "otro" distinto`);
    if (hasOther) assert.strictEqual(q.other, f.other, tag + ': palabra de otro');
  }
  if (f.type === 'number') { assert.strictEqual(q.min, f.min, `${tag}: min`); assert.strictEqual(q.max, f.max, `${tag}: max`); }
  if (f.type === 'multi') assert.strictEqual(q.maxChoices || 0, f.maxChoices, `${tag}: maxChoices`);
  if (f.type === 'text') assert.strictEqual(q.maxLen || 160, f.maxLen, `${tag}: largo máximo`);
  const num = (tag.match(/^p(\d+)([a-z]?)/) || []);
  assert.ok(num[1], `${tag}: clave sin número`);
  const expectHeaderStart = 'P' + num[1] + (num[2] || '') + ' - ';
  assert.ok(f.header.startsWith(expectHeaderStart), `${tag}: encabezado "${f.header}" no empieza con "${expectHeaderStart}"`);
  assert.ok(readme.includes(f.header), `${tag}: el README no lista el encabezado`);
  assert.ok(readme.includes('`' + f.key + '`'), `${tag}: el README no lista la clave`);
});
ok();
// obligatorias: lo que exige el servidor debe ser siempre visible y obligatorio en el HTML
S.filter(f => f.required).forEach(f => { const q = qs.find(x => x.key === f.key); assert.ok(q && !q.when, `${f.key}: obligatoria en el servidor pero condicional en el HTML`); });
ok();
// "Otro": ambos lados arman el texto con el mismo prefijo `${other}: ` (la palabra sale del esquema)
assert.ok(html.includes('`${q.other}: ${clean(state.others[q.key])'), 'el HTML no arma "<Otro>: texto" con q.other'); ok();
const gsCode = fs.readFileSync(path.join(DIST, 'Code.gs'), 'utf8');
assert.ok(gsCode.includes("const prefix = field.other + ': ';"), 'Code.gs no valida el prefijo con field.other'); ok();
S.filter(f => f.other).forEach(f => assert.ok(['Otro', 'Otra'].includes(f.other), f.key + ': palabra de "otro" inesperada')); ok();
// encabezados de la hoja = META + SCHEMA
g.call('setup()');
const hdr = g.store.sheets['Respuestas'].rows[0];
assert.strictEqual(hdr.length, 5 + S.length); ok();
S.forEach((f, i) => assert.strictEqual(hdr[5 + i], f.header));
ok();
// ids/nombres de campos en el DOM generado salen de la clave
assert.ok(html.includes("'in-' + q.key"), 'los campos de texto deberían usar la clave como id'); ok();
console.log(`Coherencia HTML ↔ Code.gs ↔ hoja ↔ README: ${qs.length} preguntas, ${hdr.length} columnas, todo coincide (${n} grupos de comprobaciones).`);
