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
const SCHEMA = [
  {
    "key": "p01_carrera",
    "header": "P01 - ¿Qué carrera estudias?",
    "type": "text",
    "maxLen": 160,
    "required": true
  },
  {
    "key": "p02_ciclo",
    "header": "P02 - ¿En qué ciclo estás?",
    "type": "number",
    "min": 1,
    "max": 12,
    "required": true
  },
  {
    "key": "p03_edad",
    "header": "P03 - ¿Qué edad tienes?",
    "type": "number",
    "min": 15,
    "max": 70,
    "required": true
  },
  {
    "key": "p04_modalidad",
    "header": "P04 - ¿En qué modalidad estudias?",
    "type": "choice",
    "options": [
      "Presencial",
      "Virtual"
    ],
    "other": "",
    "required": true
  },
  {
    "key": "p05_sede",
    "header": "P05 - ¿En qué sede estás?",
    "type": "choice",
    "options": [
      "Lima Centro",
      "Lima Norte",
      "Lima Sur",
      "Lima Este - SJL",
      "Lima Este - Ate",
      "Iquitos",
      "Tacna",
      "Pucallpa",
      "Arequipa",
      "Chiclayo",
      "Chimbote",
      "Piura",
      "Huancayo",
      "Ica",
      "Trujillo"
    ],
    "other": "",
    "required": true
  },
  {
    "key": "p06_conocidos_otra_carrera",
    "header": "P06 - Sin contar a los de tu salón actual, ¿a cuántos alumnos de la UTP has conocido en persona de una carrera distinta a la tuya?",
    "type": "number",
    "min": 0,
    "max": 500,
    "required": false
  },
  {
    "key": "p07_ultima_vez_conociste",
    "header": "P07 - Sin contar a tu salón, ¿cuándo fue la última vez que conociste a alguien nuevo de la UTP?",
    "type": "choice",
    "options": [
      "Esta semana",
      "Este mes",
      "Este ciclo",
      "El ciclo pasado o antes",
      "Nunca",
      "No recuerdo"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p08_como_lo_conociste",
    "header": "P08 - ¿Cómo lo conociste?",
    "type": "text",
    "maxLen": 600,
    "required": false
  },
  {
    "key": "p09_whatsapp_ciclos_anteriores",
    "header": "P09 - ¿Qué pasa hoy con tus grupos de WhatsApp de ciclos anteriores?",
    "type": "choice",
    "options": [
      "Sigo activo y lo uso",
      "Sigue activo pero lo silencié",
      "Ya casi nadie escribe",
      "Salí del grupo",
      "Nunca estuve en uno"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p10_duda_sin_saber_a_quien",
    "header": "P10 - La última vez que tuviste una duda sobre tu carrera, un curso o un trámite y no sabías a quién preguntar, ¿qué hiciste?",
    "type": "text",
    "maxLen": 800,
    "required": false
  },
  {
    "key": "p10b_cual_era_la_duda",
    "header": "P10b - Seguimiento: ¿Cuál era la duda?",
    "type": "text",
    "maxLen": 600,
    "required": false
  },
  {
    "key": "p11_ultima_ayuda_ciclo_mayor",
    "header": "P11 - ¿Cuándo fue la última vez que le pediste ayuda a un alumno de un ciclo mayor al tuyo?",
    "type": "choice",
    "options": [
      "Esta semana",
      "Este mes",
      "Este ciclo",
      "El ciclo pasado o antes",
      "Nunca"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p11b_lo_conocia_y_que_pregunto",
    "header": "P11b - Seguimiento: ¿Lo conocías de antes? ¿Qué le preguntaste?",
    "type": "text",
    "maxLen": 600,
    "required": false
  },
  {
    "key": "p12_quiso_hablar_y_no_hablo",
    "header": "P12 - La última vez que quisiste hablar con alguien de la UTP que no conocías y no lo hiciste, ¿qué pasó?",
    "type": "text",
    "maxLen": 800,
    "required": false
  },
  {
    "key": "p13_huecos_con_quien",
    "header": "P13 - Normalmente en tus huecos de clases ¿Con quiénes la pasas o la pasas solo?",
    "type": "multi",
    "options": [
      "Amigos de mi salón",
      "Gente de otro salón de mi carrera",
      "Gente de otras carreras",
      "Solo(a)",
      "Depende del día"
    ],
    "other": "Otro",
    "maxChoices": 0,
    "required": false
  },
  {
    "key": "p14_quiere_conocer_en_huecos",
    "header": "P14 - ¿Te gustaría conocer gente que también esté libre en sus huecos libres?",
    "type": "choice",
    "options": [
      "Sí",
      "No"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p15_actividad_con_esa_persona",
    "header": "P15 - ¿Qué actividad te gustaría realizar con dicha persona?",
    "type": "multi",
    "options": [
      "Estudiar o hacer tareas",
      "Comer o tomar algo",
      "Hacer deporte",
      "Hacer proyectos o emprender",
      "Solo conversar"
    ],
    "other": "Otra",
    "maxChoices": 0,
    "required": false
  },
  {
    "key": "p16_ayuda_pedida_por_menores",
    "header": "P16 - Este ciclo, ¿cuántas veces te pidió ayuda un alumno de un ciclo menor al tuyo?",
    "type": "number",
    "min": 0,
    "max": 200,
    "required": false
  },
  {
    "key": "p16b_amigo_o_desconocido",
    "header": "P16b - Seguimiento: La última vez, ¿era tu amigo o alguien que no conocías?",
    "type": "choice",
    "options": [
      "Un amigo",
      "Alguien que conocía de vista o por un grupo",
      "Alguien que no conocía"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p17_trabajos_con_encuestas",
    "header": "P17 - ¿En cuántos trabajos académicos has necesitado encuestar o entrevistar gente?",
    "type": "number",
    "min": 0,
    "max": 50,
    "required": false
  },
  {
    "key": "p18_perfil_especifico",
    "header": "P18 - Cuando necesitaste encuestados, ¿buscabas un perfil específico que no tenías cerca?",
    "type": "choice",
    "options": [
      "Sí",
      "No",
      "No recuerdo"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p18b_que_perfil_y_que_hizo",
    "header": "P18b - Seguimiento: ¿Qué perfil necesitabas y qué hiciste?",
    "type": "text",
    "maxLen": 600,
    "required": false
  },
  {
    "key": "p19_como_consiguio_encuestados",
    "header": "P19 - ¿Cómo los conseguiste?",
    "type": "multi",
    "options": [
      "Compañeros de mi salón",
      "Amigos y familia",
      "Grupos de WhatsApp o redes",
      "Pidiendo en pasillos y campus",
      "Ofreciendo algo a cambio"
    ],
    "other": "Otro",
    "maxChoices": 0,
    "required": false
  },
  {
    "key": "p20_como_le_fue_con_respuestas",
    "header": "P20 - ¿Cómo te fue consiguiendo el número de respuestas que necesitabas?",
    "type": "choice",
    "options": [
      "Sin problema",
      "Me costó mucho",
      "Entregué con menos de las que pedían",
      "Tuve que inventar datos"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p21_que_hizo_si_no_llegaba",
    "header": "P21 - ¿Qué hiciste cuando no llegabas al número?",
    "type": "choice",
    "options": [
      "Seguí buscando hasta completar",
      "Pedí más tiempo",
      "Entregué con las que tenía",
      "Completé algunas yo o con amigos",
      "Inventé datos"
    ],
    "other": "Otro",
    "required": false
  },
  {
    "key": "p22_encuestas_respondidas",
    "header": "P22 - ¿Cuántas encuestas de otros alumnos has respondido este ciclo?",
    "type": "number",
    "min": 0,
    "max": 200,
    "required": false
  },
  {
    "key": "p23_que_lo_motivaria",
    "header": "P23 - ¿Qué te motivaría a responder más encuestas?",
    "type": "text",
    "maxLen": 800,
    "required": false
  },
  {
    "key": "p24_ultima_vez_outlook",
    "header": "P24 - ¿Cuándo abriste tu correo Outlook UTP por última vez?",
    "type": "choice",
    "options": [
      "Hoy",
      "Esta semana",
      "Este mes",
      "Hace más de un mes",
      "Nunca lo he abierto"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p25_correos_sin_leer",
    "header": "P25 - ¿Cuántos correos sin leer tienes ahora mismo en tu correo UTP?",
    "type": "number",
    "min": 0,
    "max": 100000,
    "required": false
  },
  {
    "key": "p26_programas_que_recuerda",
    "header": "P26 - Nombra los programas de empleabilidad, concursos, becas o intercambio de la UTP que recuerdes. No vale buscarlos.",
    "type": "text",
    "maxLen": 800,
    "required": false
  },
  {
    "key": "p27_pertenece_a_grupo",
    "header": "P27 - ¿Perteneces a algún grupo, club o comunidad de la universidad?",
    "type": "choice",
    "options": [
      "Sí",
      "No"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p27b_por_que_no",
    "header": "P27b - Seguimiento: ¿Por qué no?",
    "type": "text",
    "maxLen": 600,
    "required": false
  },
  {
    "key": "p28_eventos_este_anio",
    "header": "P28 - ¿A cuántos eventos organizados por la UTP (charlas, talleres, ferias, concursos) has ido este año?",
    "type": "number",
    "min": 0,
    "max": 100,
    "required": false
  },
  {
    "key": "p29_que_eventos",
    "header": "P29 - ¿Qué eventos eran? Di todos los que recuerdes",
    "type": "text",
    "maxLen": 800,
    "required": false
  },
  {
    "key": "p30_como_se_entero_evento",
    "header": "P30 - ¿Cómo te enteraste del último evento al que fuiste?",
    "type": "choice",
    "options": [
      "Correo UTP",
      "Instagram",
      "LinkedIn",
      "Otra red social",
      "Grupo de WhatsApp",
      "Un profesor",
      "Un amigo o compañero",
      "Afiche o pantalla en la sede",
      "No recuerdo"
    ],
    "other": "Otro",
    "required": false
  },
  {
    "key": "p31_actividades_a_difundir",
    "header": "P31 - ¿Qué tipo de actividades extracurriculares te gustaría que se difundan más dentro de la universidad?",
    "type": "multi",
    "options": [
      "Académicas",
      "Deportivas",
      "Culturales",
      "Integración social",
      "Empleabilidad y prácticas",
      "Conferencias",
      "Concursos"
    ],
    "other": "Otra",
    "maxChoices": 3,
    "required": false
  },
  {
    "key": "p31b_tipo_conferencias_concursos",
    "header": "P31b - Seguimiento: ¿Qué tipo de conferencias o concursos?",
    "type": "text",
    "maxLen": 600,
    "required": false
  },
  {
    "key": "p32_asistiria_otras_carreras",
    "header": "P32 - ¿Asistirías a talleres o eventos organizados por alumnos de otras carreras si pudieras acceder fácilmente a su programación?",
    "type": "choice",
    "options": [
      "Sí",
      "No"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p33_arreglar_una_cosa",
    "header": "P33 - Si pudieras arreglar una sola cosa de cómo te conectas con otros alumnos de la UTP, ¿cuál sería?",
    "type": "text",
    "maxLen": 800,
    "required": false
  },
  {
    "key": "p34_linkedin",
    "header": "P34 - ¿Tienes cuenta en LinkedIn?",
    "type": "choice",
    "options": [
      "Sí, y entro seguido",
      "Sí, pero casi nunca entro",
      "No tengo",
      "No sé qué es"
    ],
    "other": "Otro",
    "required": false
  },
  {
    "key": "p34b_por_que_no_linkedin",
    "header": "P34b - Seguimiento: Si no lo usas, ¿por qué no lo usas?",
    "type": "text",
    "maxLen": 600,
    "required": false
  },
  {
    "key": "p35_app_parecida",
    "header": "P35 - ¿Hay algo parecido que ya uses actualmente?",
    "type": "choice",
    "options": [
      "Sí",
      "No"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p35b_cual_app",
    "header": "P35b - Seguimiento: ¿Cuál?",
    "type": "text",
    "maxLen": 160,
    "required": false
  },
  {
    "key": "p36_que_haria_no_instalar",
    "header": "P36 - ¿Qué tendría que pasar para que NO la instales?",
    "type": "text",
    "maxLen": 800,
    "required": false
  },
  {
    "key": "p37_acuerdo_nombre_carrera_ciclo",
    "header": "P37 - ¿Estarías de acuerdo con que los alumnos vean tu nombre, carrera y ciclo?",
    "type": "text",
    "maxLen": 800,
    "required": false
  },
  {
    "key": "p38_funcion_unica",
    "header": "P38 - Si solo pudieras tener UNA de estas funciones en una app de la UTP, ¿cuál elegirías?",
    "type": "choice",
    "options": [
      "Preguntarle a un alumno de ciclo mayor",
      "Conocer gente de otras carreras con mis intereses",
      "Enterarme de clubes y eventos",
      "Conseguir encuestados para mis trabajos",
      "Mostrar mis habilidades para prácticas",
      "Armar equipos multidisciplinarios con gente de otras carreras para proyectos, hackatones o tesis",
      "Ver proyectos reales y herramientas que usan alumnos de ciclos avanzados para saber qué aprender"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p39_contenido_pantalla_inicial",
    "header": "P39 - En la pantalla inicial de la app, ¿qué tipo de contenido te interesaría ver primero?",
    "type": "choice",
    "options": [
      "Noticias del campus",
      "Anuncios de proyectos o de estudio",
      "Avisos de eventos",
      "Publicaciones de otros alumnos"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p40_relevancia_filtros",
    "header": "P40 - ¿Qué tan relevante es para ti que la plataforma cuente con filtros para buscar compañeros según sus aficiones, pasatiempos o intereses específicos?",
    "type": "choice",
    "options": [
      "1 - Nada relevante",
      "2 - Poco relevante",
      "3 - Algo relevante",
      "4 - Relevante",
      "5 - Muy relevante"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p41_crear_eventos",
    "header": "P41 - ¿Te gustaría contar con la opción de crear y promocionar tus propios eventos o iniciativas estudiantiles dentro de la app?",
    "type": "choice",
    "options": [
      "Sí",
      "No"
    ],
    "other": "",
    "required": false
  },
  {
    "key": "p42_momentos_de_uso",
    "header": "P42 - ¿En qué momentos del día o de la semana académica considerarías usar con mayor frecuencia la aplicación?",
    "type": "multi",
    "options": [
      "Entre clases",
      "Camino a la universidad",
      "En casa por la noche",
      "Fines de semana",
      "Semana de exámenes o entregas"
    ],
    "other": "Otro",
    "maxChoices": 0,
    "required": false
  },
  {
    "key": "p43_motivo_dejar_de_usar",
    "header": "P43 - ¿Qué factor principal te llevaría a dejar de usar una app de este tipo?",
    "type": "choice",
    "options": [
      "Me preocupa mi privacidad",
      "Hay poca gente y no me sirve",
      "Me llegan muchos avisos",
      "Ya uso WhatsApp o Instagram para eso",
      "Me quita tiempo"
    ],
    "other": "Otro",
    "required": false
  }
];

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
