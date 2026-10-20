# -*- coding: utf-8 -*-
"""
Fuente ÚNICA de verdad de la encuesta.
De este archivo se generan:
  - las preguntas del index.html  (QUESTIONS)
  - el esquema de columnas del Code.gs (SCHEMA)
  - la tabla de columnas del README
Así los nombres de las preguntas del HTML y las columnas de Google Sheets
no pueden desalinearse.

Las preguntas son las del Google Doc "Preguntas mejoradas de Kampus"
(43 preguntas + 8 seguimientos). No se agregó ni se cambió ninguna pregunta.
"""

SECTIONS = [
    # id, título, icono
    ("s1", "Sobre ti", "user"),
    ("s2", "Tu red en la universidad", "users"),
    ("s3", "Ayuda entre ciclos", "cap"),
    ("s4", "Trabajos académicos y encuestas", "clipboard"),
    ("s5", "Tu correo UTP", "mail"),
    ("s6", "Eventos y comunidades", "calendar"),
    ("s7", "Qué usas hoy", "phone"),
    ("s8", "Una idea en construcción", "bulb"),
]

# Sedes tomadas de la página oficial de la UTP (utp.edu.pe). Se pueden editar.
SEDES = [
    "Lima Centro", "Lima Norte", "Lima Sur", "Lima Este - SJL", "Lima Este - Ate",
    "Iquitos", "Tacna", "Pucallpa", "Arequipa", "Chiclayo", "Chimbote",
    "Piura", "Huancayo", "Ica", "Trujillo",
]

IDEA_TEXT = (
    "Estamos pensando en una app solo para alumnos de tu universidad. "
    "Entras con tu correo institucional y tu nombre real. Puedes preguntarle algo a un alumno "
    "de ciclo mayor, unirte a grupos de talleres o comunidades de interés, enterarte de eventos "
    "y responder o mandar encuestas de trabajos académicos."
)

SI_NO = ["Sí", "No"]
FREQ = ["Esta semana", "Este mes", "Este ciclo", "El ciclo pasado o antes"]

NUMBER_HINT = "Escribe solo un número."
MANY_HINT = "Puedes marcar varias."

QUESTIONS = []


def q(key, section, type_, label, **kw):
    d = dict(key=key, section=section, type=type_, label=label)
    d.update(kw)
    QUESTIONS.append(d)


# --------------------------------------------------------------- Sobre ti
q("p01_carrera", "s1", "text", "¿Qué carrera estudias?",
  placeholder="Escribe el nombre de tu carrera", maxLen=160)
q("p02_ciclo", "s1", "number", "¿En qué ciclo estás?", hint=NUMBER_HINT, min=1, max=12)
q("p03_edad", "s1", "number", "¿Qué edad tienes?", hint=NUMBER_HINT, min=15, max=70)
q("p04_modalidad", "s1", "radio", "¿En qué modalidad estudias?", options=["Presencial", "Virtual"])
q("p05_sede", "s1", "select", "¿En qué sede estás?", options=SEDES, placeholder="Elige tu sede")

# ------------------------------------------------- Tu red en la universidad
q("p06_conocidos_otra_carrera", "s2", "number",
  "Sin contar a los de tu salón actual, ¿a cuántos alumnos de la UTP has conocido en persona de una carrera distinta a la tuya?",
  hint=NUMBER_HINT, min=0, max=500)
q("p07_ultima_vez_conociste", "s2", "radio",
  "Sin contar a tu salón, ¿cuándo fue la última vez que conociste a alguien nuevo de la UTP?",
  options=FREQ + ["Nunca", "No recuerdo"])
q("p08_como_lo_conociste", "s2", "long", "¿Cómo lo conociste?",
  maxLen=600, when="is('p07_ultima_vez_conociste','Esta semana','Este mes','Este ciclo','El ciclo pasado o antes')")
q("p09_whatsapp_ciclos_anteriores", "s2", "radio",
  "¿Qué pasa hoy con tus grupos de WhatsApp de ciclos anteriores?",
  options=["Sigo activo y lo uso", "Sigue activo pero lo silencié", "Ya casi nadie escribe",
           "Salí del grupo", "Nunca estuve en uno"],
  when="cicloAtLeast(2)")
q("p10_duda_sin_saber_a_quien", "s2", "long",
  "La última vez que tuviste una duda sobre tu carrera, un curso o un trámite y no sabías a quién preguntar, ¿qué hiciste?",
  hint="También puedes responder «No me ha pasado».", chips=["No me ha pasado"], maxLen=800)
q("p10b_cual_era_la_duda", "s2", "long", "¿Cuál era la duda?",
  followup=True, parent="p10_duda_sin_saber_a_quien", maxLen=600,
  when="txt('p10_duda_sin_saber_a_quien') !== '' && !chipUsed('p10_duda_sin_saber_a_quien')")
q("p11_ultima_ayuda_ciclo_mayor", "s2", "radio",
  "¿Cuándo fue la última vez que le pediste ayuda a un alumno de un ciclo mayor al tuyo?",
  options=FREQ + ["Nunca"])
q("p11b_lo_conocia_y_que_pregunto", "s2", "long", "¿Lo conocías de antes? ¿Qué le preguntaste?",
  followup=True, parent="p11_ultima_ayuda_ciclo_mayor", maxLen=600,
  when="is('p11_ultima_ayuda_ciclo_mayor','Esta semana','Este mes','Este ciclo','El ciclo pasado o antes')")
q("p12_quiso_hablar_y_no_hablo", "s2", "long",
  "La última vez que quisiste hablar con alguien de la UTP que no conocías y no lo hiciste, ¿qué pasó?",
  hint="También puedes responder «No me ha pasado».", chips=["No me ha pasado"], maxLen=800)
q("p13_huecos_con_quien", "s2", "checkbox",
  "Normalmente en tus huecos de clases ¿Con quiénes la pasas o la pasas solo?",
  hint=MANY_HINT, other="Otro",
  options=["Amigos de mi salón", "Gente de otro salón de mi carrera", "Gente de otras carreras",
           "Solo(a)", "Depende del día"])
q("p14_quiere_conocer_en_huecos", "s2", "radio",
  "¿Te gustaría conocer gente que también esté libre en sus huecos libres?", options=SI_NO)
q("p15_actividad_con_esa_persona", "s2", "checkbox",
  "¿Qué actividad te gustaría realizar con dicha persona?",
  hint=MANY_HINT, other="Otra",
  options=["Estudiar o hacer tareas", "Comer o tomar algo", "Hacer deporte",
           "Hacer proyectos o emprender", "Solo conversar"],
  when="is('p14_quiere_conocer_en_huecos','Sí')")

# ---------------------------------------------------- Ayuda entre ciclos
q("p16_ayuda_pedida_por_menores", "s3", "number",
  "Este ciclo, ¿cuántas veces te pidió ayuda un alumno de un ciclo menor al tuyo?",
  hint=NUMBER_HINT, min=0, max=200, when="cicloAtLeast(5)")
q("p16b_amigo_o_desconocido", "s3", "radio",
  "La última vez, ¿era tu amigo o alguien que no conocías?",
  followup=True, parent="p16_ayuda_pedida_por_menores",
  options=["Un amigo", "Alguien que conocía de vista o por un grupo", "Alguien que no conocía"],
  when="cicloAtLeast(5) && num('p16_ayuda_pedida_por_menores') > 0")

# --------------------------------------- Trabajos académicos y encuestas
q("p17_trabajos_con_encuestas", "s4", "number",
  "¿En cuántos trabajos académicos has necesitado encuestar o entrevistar gente?",
  hint=NUMBER_HINT, min=0, max=50)
q("p18_perfil_especifico", "s4", "radio",
  "Cuando necesitaste encuestados, ¿buscabas un perfil específico que no tenías cerca?",
  options=["Sí", "No", "No recuerdo"], when="num('p17_trabajos_con_encuestas') > 0")
q("p18b_que_perfil_y_que_hizo", "s4", "long", "¿Qué perfil necesitabas y qué hiciste?",
  followup=True, parent="p18_perfil_especifico", maxLen=600,
  when="num('p17_trabajos_con_encuestas') > 0 && is('p18_perfil_especifico','Sí')")
q("p19_como_consiguio_encuestados", "s4", "checkbox", "¿Cómo los conseguiste?",
  hint=MANY_HINT, other="Otro",
  options=["Compañeros de mi salón", "Amigos y familia", "Grupos de WhatsApp o redes",
           "Pidiendo en pasillos y campus", "Ofreciendo algo a cambio"],
  when="num('p17_trabajos_con_encuestas') > 0")
q("p20_como_le_fue_con_respuestas", "s4", "radio",
  "¿Cómo te fue consiguiendo el número de respuestas que necesitabas?",
  options=["Sin problema", "Me costó mucho", "Entregué con menos de las que pedían",
           "Tuve que inventar datos"],
  when="num('p17_trabajos_con_encuestas') > 0")
q("p21_que_hizo_si_no_llegaba", "s4", "radio", "¿Qué hiciste cuando no llegabas al número?",
  hint="No hay respuesta correcta o mala, solo buscamos tu sinceridad.", other="Otro",
  options=["Seguí buscando hasta completar", "Pedí más tiempo", "Entregué con las que tenía",
           "Completé algunas yo o con amigos", "Inventé datos"],
  when="num('p17_trabajos_con_encuestas') > 0 && is('p20_como_le_fue_con_respuestas','Me costó mucho','Entregué con menos de las que pedían','Tuve que inventar datos')")
q("p22_encuestas_respondidas", "s4", "number",
  "¿Cuántas encuestas de otros alumnos has respondido este ciclo?",
  hint=NUMBER_HINT, min=0, max=200)
q("p23_que_lo_motivaria", "s4", "long", "¿Qué te motivaría a responder más encuestas?", maxLen=800)

# ----------------------------------------------------------- Tu correo UTP
q("p24_ultima_vez_outlook", "s5", "radio",
  "¿Cuándo abriste tu correo Outlook UTP por última vez?",
  options=["Hoy", "Esta semana", "Este mes", "Hace más de un mes", "Nunca lo he abierto"])
q("p25_correos_sin_leer", "s5", "number",
  "¿Cuántos correos sin leer tienes ahora mismo en tu correo UTP?",
  hint=NUMBER_HINT, min=0, max=100000)
q("p26_programas_que_recuerda", "s5", "long",
  "Nombra los programas de empleabilidad, concursos, becas o intercambio de la UTP que recuerdes. No vale buscarlos.",
  chips=["No recuerdo ninguno"], maxLen=800)

# ------------------------------------------------- Eventos y comunidades
q("p27_pertenece_a_grupo", "s6", "radio",
  "¿Perteneces a algún grupo, club o comunidad de la universidad?", options=SI_NO)
q("p27b_por_que_no", "s6", "long", "¿Por qué no?",
  followup=True, parent="p27_pertenece_a_grupo", maxLen=600,
  when="is('p27_pertenece_a_grupo','No')")
q("p28_eventos_este_anio", "s6", "number",
  "¿A cuántos eventos organizados por la UTP (charlas, talleres, ferias, concursos) has ido este año?",
  hint=NUMBER_HINT, min=0, max=100)
q("p29_que_eventos", "s6", "long", "¿Qué eventos eran? Di todos los que recuerdes",
  maxLen=800, when="num('p28_eventos_este_anio') > 0")
q("p30_como_se_entero_evento", "s6", "radio",
  "¿Cómo te enteraste del último evento al que fuiste?", other="Otro",
  options=["Correo UTP", "Instagram", "LinkedIn", "Otra red social", "Grupo de WhatsApp",
           "Un profesor", "Un amigo o compañero", "Afiche o pantalla en la sede", "No recuerdo"],
  when="num('p28_eventos_este_anio') > 0")
q("p31_actividades_a_difundir", "s6", "checkbox",
  "¿Qué tipo de actividades extracurriculares te gustaría que se difundan más dentro de la universidad?",
  hint="Puedes marcar hasta 3.", other="Otra", maxChoices=3,
  options=["Académicas", "Deportivas", "Culturales", "Integración social",
           "Empleabilidad y prácticas", "Conferencias", "Concursos"])
q("p31b_tipo_conferencias_concursos", "s6", "long", "¿Qué tipo de conferencias o concursos?",
  followup=True, parent="p31_actividades_a_difundir", maxLen=600,
  when="has('p31_actividades_a_difundir','Conferencias') || has('p31_actividades_a_difundir','Concursos')")
q("p32_asistiria_otras_carreras", "s6", "radio",
  "¿Asistirías a talleres o eventos organizados por alumnos de otras carreras si pudieras acceder fácilmente a su programación?",
  options=SI_NO)

# ------------------------------------------------------------ Qué usas hoy
q("p33_arreglar_una_cosa", "s7", "long",
  "Si pudieras arreglar una sola cosa de cómo te conectas con otros alumnos de la UTP, ¿cuál sería?",
  maxLen=800)
q("p34_linkedin", "s7", "radio", "¿Tienes cuenta en LinkedIn?", other="Otro",
  options=["Sí, y entro seguido", "Sí, pero casi nunca entro", "No tengo", "No sé qué es"])
q("p34b_por_que_no_linkedin", "s7", "long", "Si no lo usas, ¿por qué no lo usas?",
  followup=True, parent="p34_linkedin", maxLen=600,
  when="is('p34_linkedin','Sí, pero casi nunca entro','No tengo')")

# ------------------------------------------------ Una idea en construcción
INFO = dict(key="info_idea", section="s8", type="info",
            label="Antes de seguir, lee este texto", text=IDEA_TEXT)
QUESTIONS.append(INFO)

q("p35_app_parecida", "s8", "radio", "¿Hay algo parecido que ya uses actualmente?", options=SI_NO)
q("p35b_cual_app", "s8", "text", "¿Cuál?",
  followup=True, parent="p35_app_parecida", maxLen=160,
  when="is('p35_app_parecida','Sí')")
q("p36_que_haria_no_instalar", "s8", "long", "¿Qué tendría que pasar para que NO la instales?",
  maxLen=800)
q("p37_acuerdo_nombre_carrera_ciclo", "s8", "long",
  "¿Estarías de acuerdo con que los alumnos vean tu nombre, carrera y ciclo?",
  hint="Si tu respuesta es «no», cuéntanos por qué y qué te haría decir que sí.", maxLen=800)
q("p38_funcion_unica", "s8", "radio",
  "Si solo pudieras tener UNA de estas funciones en una app de la UTP, ¿cuál elegirías?",
  options=["Preguntarle a un alumno de ciclo mayor",
           "Conocer gente de otras carreras con mis intereses",
           "Enterarme de clubes y eventos",
           "Conseguir encuestados para mis trabajos",
           "Mostrar mis habilidades para prácticas",
           "Armar equipos multidisciplinarios con gente de otras carreras para proyectos, hackatones o tesis",
           "Ver proyectos reales y herramientas que usan alumnos de ciclos avanzados para saber qué aprender"])
q("p39_contenido_pantalla_inicial", "s8", "radio",
  "En la pantalla inicial de la app, ¿qué tipo de contenido te interesaría ver primero?",
  options=["Noticias del campus", "Anuncios de proyectos o de estudio", "Avisos de eventos",
           "Publicaciones de otros alumnos"])
q("p40_relevancia_filtros", "s8", "radio",
  "¿Qué tan relevante es para ti que la plataforma cuente con filtros para buscar compañeros según sus aficiones, pasatiempos o intereses específicos?",
  scale=True,
  options=["1 - Nada relevante", "2 - Poco relevante", "3 - Algo relevante", "4 - Relevante",
           "5 - Muy relevante"])
q("p41_crear_eventos", "s8", "radio",
  "¿Te gustaría contar con la opción de crear y promocionar tus propios eventos o iniciativas estudiantiles dentro de la app?",
  options=SI_NO)
q("p42_momentos_de_uso", "s8", "checkbox",
  "¿En qué momentos del día o de la semana académica considerarías usar con mayor frecuencia la aplicación?",
  hint=MANY_HINT, other="Otro",
  options=["Entre clases", "Camino a la universidad", "En casa por la noche", "Fines de semana",
           "Semana de exámenes o entregas"])
q("p43_motivo_dejar_de_usar", "s8", "radio",
  "¿Qué factor principal te llevaría a dejar de usar una app de este tipo?", other="Otro",
  options=["Me preocupa mi privacidad", "Hay poca gente y no me sirve", "Me llegan muchos avisos",
           "Ya uso WhatsApp o Instagram para eso", "Me quita tiempo"])


# ------------------------------------------------------------ Derivados
def number_of(key):
    """'p10b_xxx' -> ('P10b', 10)"""
    code = key.split("_")[0]  # p10b
    return "P" + code[1:]


def column_header(item):
    code = number_of(item["key"])
    label = item["label"]
    if item.get("followup"):
        label = "Seguimiento: " + label
    return f"{code} - {label}"


def columns():
    """Preguntas que tienen columna en la hoja (todas menos el texto informativo)."""
    return [x for x in QUESTIONS if x["type"] != "info"]


def sheet_type(item):
    t = item["type"]
    if t in ("text", "long"):
        return "text"
    if t == "number":
        return "number"
    if t in ("radio", "select"):
        return "choice"
    if t == "checkbox":
        return "multi"
    raise ValueError(t)


# Campos que SIEMPRE se preguntan y que el servidor exige.
REQUIRED_ALWAYS = ["p01_carrera", "p02_ciclo", "p03_edad", "p04_modalidad", "p05_sede"]
