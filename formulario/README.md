# Encuesta Kampus – formulario web conectado a Google Sheets

Formulario para los alumnos de la UTP (proyecto Kampus, curso Gestión de la Innovación). Cada persona responde una pregunta por pantalla y, al final, sus respuestas se guardan como **una fila nueva** en una hoja de Google Sheets.

Contenido de esta carpeta:

| Archivo | Para qué sirve |
|---|---|
| `index.html` | El formulario (diseño, preguntas y envío). Se publica en internet o se abre en el navegador. |
| `Code.gs` | El programa de Google Apps Script que recibe las respuestas y las escribe en la hoja. |
| `README.md` | Esta guía. |
| `logo-utp.png` | **No viene incluido.** Es el logo que tú pones al lado de `index.html` (ver [el logo](#8-el-logo)). |

> **Estado real de este proyecto (léelo antes de empezar).**
> El formulario y el `Code.gs` se probaron con una **simulación local** de Google Sheets y Apps Script (37 pruebas del servidor y 32 pruebas en un navegador real). **Todavía no se han probado contra tu Google Sheet de verdad**, porque eso solo se puede hacer con tu cuenta. Hasta que completes los pasos 1 a 7 y veas una fila real en tu hoja, **no des por hecho que funciona**. El paso 7 es esa prueba.

---

## Resumen de cómo funciona

1. La persona responde las preguntas. Todo queda en la memoria de la página (no se guarda nada en el navegador).
2. Al pulsar **Enviar respuestas**, la página valida todo y manda un solo mensaje a tu Web App de Apps Script.
3. Apps Script revisa los datos, escribe una fila en la hoja y **vuelve a leer esa fila** para comprobar que quedó escrita.
4. Solo entonces responde «ok» y la página muestra la pantalla de agradecimiento. Si algo falla, la persona ve un error claro y puede **reintentar sin perder sus respuestas** y sin crear filas repetidas.

---

## Paso a paso

### 1. Crear la hoja de Google Sheets

1. Entra a [sheets.new](https://sheets.new) con tu cuenta de Google.
2. Ponle nombre a la hoja, por ejemplo **Kampus – Respuestas**.
3. No escribas nada en ella: el paso 3 crea los encabezados solo.

### 2. Abrir Apps Script y pegar `Code.gs`

1. En la hoja, menú **Extensiones → Apps Script**. Se abre el editor en otra pestaña.
2. Borra todo el código que aparece (`function myFunction() {…}`).
3. Abre `Code.gs` con un editor de texto, copia **todo** y pégalo en el editor de Apps Script.
4. Pulsa **Guardar proyecto** (icono de disquete o `Ctrl + S`). Si te pide un nombre, pon *Encuesta Kampus*.

Como abriste Apps Script desde la hoja, el programa queda **vinculado a esa hoja** y no necesitas copiar ningún ID. (`SPREADSHEET_ID` en `Code.gs` se deja vacío; solo se usa si algún día quieres que el programa escriba en una hoja distinta a la que lo contiene.)

### 3. Preparar la hoja y dar los permisos

1. En la barra superior del editor, en la lista de funciones, elige **`setup`**.
2. Pulsa **Ejecutar**.
3. Google pedirá permisos la primera vez:
   - **Revisar permisos** → elige tu cuenta.
   - Si aparece «Google no ha verificado esta app»: **Configuración avanzada → Ir a Encuesta Kampus (no seguro)**. Es normal: es tu propio programa y nadie lo ha sometido a revisión de Google.
   - Pulsa **Permitir**.
4. Qué permisos son: Google lo describe como *«Ver, editar, crear y borrar todas tus hojas de cálculo de Google Sheets»*. Es el permiso estándar de Google para que un programa escriba en hojas; el código solo toca la hoja a la que está vinculado (puedes comprobarlo leyendo `Code.gs`). No pide acceso a tu correo. **No hay ninguna clave ni contraseña** dentro de `Code.gs` ni de `index.html`.
5. Cuando termine, vuelve a la hoja: habrá una pestaña **Respuestas** con una fila de encabezados con 56 columnas y la hoja quedará en la zona horaria de Lima.

### 4. Probar que Apps Script puede escribir en la hoja

1. En el editor, elige la función **`pruebaDeEscritura`** y pulsa **Ejecutar**.
2. Ve a la pestaña **Respuestas**: debe haber una fila nueva con **Estado = prueba**.
3. Para borrar esa fila de prueba, ejecuta **`eliminarFilasDePrueba`**. Borra solo las filas con Estado = prueba, nunca las respuestas reales.

Si este paso falla, **no sigas**: el problema está en los permisos o en el pegado del código (ver [Problemas frecuentes](#problemas-frecuentes)).

### 5. Publicar como aplicación web

1. En Apps Script: **Implementar → Nueva implementación**.
2. Pulsa el engranaje junto a «Seleccionar tipo» y elige **Aplicación web**.
3. Completa:
   - **Descripción:** `Encuesta Kampus v1`
   - **Ejecutar como:** **Yo** (tu cuenta). Así las filas se escriben con tu permiso y los alumnos no necesitan acceso a la hoja.
   - **Quién tiene acceso:** **Cualquier persona**. Debe ser esta opción: si pones «Cualquier persona con cuenta de Google» o «Solo yo», los alumnos recibirán una pantalla de inicio de sesión y el envío fallará.
4. Pulsa **Implementar** (autoriza de nuevo si lo pide).
5. Copia la **URL de la aplicación web**. Termina en **`/exec`** y tiene esta forma:
   `https://script.google.com/macros/s/AKfy…/exec`
6. Comprueba que está viva: pégala en una pestaña del navegador. Debe mostrar algo como `{"ok":true,"servicio":…}`. Si ves una página de Google pidiendo iniciar sesión, el acceso no quedó en «Cualquier persona».

### 6. Pegar la URL en `index.html`

1. Abre `index.html` con un editor de texto (el Bloc de notas sirve).
2. Busca (`Ctrl + F`) **`ENDPOINT_URL`**. Verás esto:

   ```js
   const CONFIG = {
     ENDPOINT_URL: 'PEGA_AQUI_LA_URL_DEL_WEB_APP',
   ```

3. Reemplaza `PEGA_AQUI_LA_URL_DEL_WEB_APP` por tu URL `/exec`, **dentro de las comillas**:

   ```js
     ENDPOINT_URL: 'https://script.google.com/macros/s/AKfy…/exec',
   ```

4. Guarda el archivo.

Mientras la URL no sea válida, la pantalla de inicio muestra un aviso rojo («Falta conectar el formulario con Google Sheets») y el botón de enviar **no da éxito falso**: muestra que falta la conexión.

### 7. Probar de punta a punta (esto es lo que confirma que funciona)

Haz estas pruebas **tú**, en este orden, antes de compartir el enlace:

| # | Prueba | Resultado esperado |
|---|---|---|
| 1 | Abre `index.html` en el navegador. | Ves la portada y **no** aparece el aviso rojo de «Falta conectar…». |
| 2 | Pulsa «Comenzar encuesta» y responde todo. Para una prueba rápida, en las preguntas de texto basta con 2 letras. | Avanza una pregunta por pantalla, con la barra de progreso. |
| 3 | Intenta avanzar sin responder. | Mensaje de error claro; no avanza. |
| 4 | Usa «Anterior». | Tus respuestas siguen ahí. |
| 5 | En la última pantalla pulsa **Enviar respuestas**. | Aparece «Enviando…» y luego la pantalla de agradecimiento con un código de 8 caracteres. |
| 6 | Abre la hoja, pestaña **Respuestas**. | Hay **una** fila nueva. La columna A (ID) empieza con el mismo código que viste en pantalla. Columna C = `completa`. |
| 7 | Mira que cada respuesta esté en la columna de su pregunta (ver la [tabla de columnas](#apéndice-a-columnas-de-la-hoja)). | Coinciden. |
| 8 | Repite la encuesta **en menos de 45 segundos**. | La fila queda con Estado = `revisar` (es lo esperado en una prueba muy rápida; ver [cómo se protege](#cómo-se-protegen-los-datos)). |
| 9 | **Prueba de fallo:** desconecta el wifi, responde y pulsa Enviar. | Mensaje de que no se pudo confirmar; **no** aparece el agradecimiento. Vuelve a conectar y pulsa **Reintentar envío**: se guarda **una sola** fila. |
| 10 | Pulsa Enviar varias veces seguidas muy rápido. | El botón se bloquea; hay **una sola** fila. |
| 11 | Borra las filas de prueba de la hoja (no los encabezados). | — |

Si el 5 muestra un error, mira el **código** que aparece debajo del mensaje y busca en [Problemas frecuentes](#problemas-frecuentes).

### 8. El logo

El encabezado tiene un hueco para el logo de la UTP. Guarda el archivo del logo como **`logo-utp.png`** en la **misma carpeta** que `index.html`. Si el archivo no existe, se ve un recuadro punteado con «Logo UTP». No incluí el logo porque es una marca registrada de la universidad: usa el archivo que ellos te den o autoricen.

### 9. Publicar el formulario para que lo abran los alumnos

`index.html` es un solo archivo. Puedes:

- **Netlify Drop** ([app.netlify.com/drop](https://app.netlify.com/drop)): arrastras la carpeta (con `index.html` y `logo-utp.png`) y te da un enlace.
- **GitHub Pages**: subes la carpeta a un repositorio y activas Pages.
- **Otro hosting** o el servidor de tu equipo: cualquiera que sirva archivos estáticos.

Recomiendo alojarlo en vez de mandar el archivo suelto: abierto como archivo local algunos navegadores tratan distinto las conexiones a Google. El formulario tiene un plan de respaldo para ese caso (ver [límites](#límites-que-debes-conocer)), pero no lo probé con tu URL real.

Después de publicar, **vuelve a hacer la prueba 5 y 6 desde el enlace público**, desde un celular.

---

## Cómo se protegen los datos

- **Sin claves en el HTML.** El HTML solo conoce la URL pública de tu Web App. La puerta de entrada a la hoja es `Code.gs`, que se ejecuta con tu permiso en los servidores de Google.
- **Sin inyección de HTML.** La página construye todo con `textContent`; lo que escribe una persona nunca se interpreta como código. (Probado con `<img onerror=…>`.)
- **Sin fórmulas.** Si una respuesta empieza con `=`, `+`, `-` o `@` (la forma de colar fórmulas en una hoja), `Code.gs` le antepone un apóstrofo y las celdas de texto se guardan con formato de texto.
- **Solo las columnas del esquema.** Cualquier campo que no esté en la lista se ignora. Se revisa el tipo, el rango de los números, que las opciones existan y que el texto no exceda su largo máximo.
- **Encabezados protegidos.** Si alguien cambia a mano un encabezado de la fila 1, `Code.gs` **se niega a escribir** en vez de mezclar datos en columnas equivocadas. (Ver Problemas frecuentes.)
- **Sin duplicados accidentales.** Cada respuesta lleva un ID único generado en el navegador. Si el mismo ID llega dos veces (doble clic, reintento), el servidor lo reconoce y no agrega otra fila. Las escrituras se hacen una por una con un candado (`LockService`) para que dos personas a la vez no se pisen.
- **Confirmación real.** El servidor vuelve a leer la fila antes de decir «ok».
- **Filtros contra basura.** Campo oculto trampa para bots (`ref_codigo_alt`), tamaño máximo del mensaje (60 000 caracteres) y mínimo de 20 preguntas respondidas. Los envíos hechos en menos de 45 segundos **no se descartan**: se marcan como `revisar` para que decidas tú.
- **Anonimato.** El formulario no pide nombre ni correo, y `Code.gs` no guarda IP ni cuenta de Google. Pero lo que la gente **escriba** en las preguntas abiertas se guarda tal cual: si alguien pone un nombre propio ahí, queda en la hoja.

## Límites que debes conocer

- **Esto no es seguridad fuerte.** La URL del Web App va dentro del HTML, así que cualquiera que la encuentre podría mandar envíos falsos. Las defensas de arriba frenan errores y bots simples, no a una persona decidida. No hay CAPTCHA. Revisa de vez en cuando las filas con Estado = `revisar`.
- **Una persona puede responder dos veces.** El anti-duplicado es por envío (reintentos y doble clic), no por persona: como el formulario es anónimo, si alguien lo contesta de nuevo ya con otra sesión, serán dos filas.
- **Si se cierra la pestaña a mitad del envío**, no hay forma de saber en el momento si se guardó. Mira la hoja antes de pedir que lo repitan.
- **Si se recarga la página a mitad de la encuesta, se pierden las respuestas.** Fue una decisión: no se usa `localStorage` ni nada parecido como sustituto de la hoja.
- **Cómo confirma el envío (CORS).** La página manda los datos como texto plano (`text/plain`) para evitar la comprobación previa que Apps Script no responde. Normalmente Google deja leer la respuesta. Si el navegador no la deja leer (red, bloqueo, tiempo agotado), la página **no reenvía**: le pregunta a la hoja «¿existe ya este ID?» con un mensaje de consulta (JSONP, que no tiene esa restricción) hasta 3 veces. Si ahí confirma que existe, muestra el agradecimiento; si no puede confirmar, **dice que no pudo confirmar y deja reintentar**, sin afirmar que se guardó.
- **Cuotas de Google.** Apps Script limita la cantidad de ejecuciones simultáneas y por día. Para decenas o cientos de respuestas no hay problema; si lo vas a lanzar a miles de alumnos a la vez, avisa y lo revisamos.
- **Cambios en Code.gs no se aplican solos.** Después de editarlo hay que ir a **Implementar → Administrar implementaciones → ✏️ editar → Versión: Nueva versión → Implementar**. Si no, la URL sigue ejecutando la versión anterior. La URL no cambia.
- **Probado solo en simulación.** Ver el aviso al inicio.

## Decisiones de diseño que conviene que revises

- **Preguntas de seguimiento.** Cuando una pregunta tiene un seguimiento («Seguimiento si marcó…»), aparece como pantalla propia, con la etiqueta *Seguimiento* y recordándole su respuesta anterior. Solo se muestran cuando corresponde; las demás quedan **vacías en la hoja**.
- **Saltos que agregué por sentido común** (no estaban escritos como regla en el documento de preguntas; si no los quieres, avísame y se quitan):

| Pregunta | Se muestra solo si |
|---|---|
| P08 - ¿Cómo lo conociste? | en P07 respondió algo distinto de «Nunca» y «No recuerdo» |
| P09 - ¿Qué pasa hoy con tus grupos de WhatsApp de ciclos anteriores? | el ciclo (P02) es 2 o más |
| P10b - ¿Cuál era la duda? | en P10 escribió algo distinto de «No me ha pasado» |
| P11b - ¿Lo conocías de antes? ¿Qué le preguntaste? | en P11 no respondió «Nunca» |
| P15 - ¿Qué actividad te gustaría realizar con dicha persona? | en P14 respondió «Sí» |
| P16 - Este ciclo, ¿cuántas veces te pidió ayuda un alumno de un ciclo menor al tuyo? | el ciclo (P02) es 5 o más (sección «Ayuda entre ciclos») |
| P16b - La última vez, ¿era tu amigo o alguien que no conocías? | ciclo 5 o más y en P16 puso más de 0 |
| P18 - Cuando necesitaste encuestados, ¿buscabas un perfil específico que no tenías cerca? | en P17 puso más de 0 |
| P18b - ¿Qué perfil necesitabas y qué hiciste? | en P18 respondió «Sí» |
| P19 - ¿Cómo los conseguiste? | en P17 puso más de 0 |
| P20 - ¿Cómo te fue consiguiendo el número de respuestas que necesitabas? | en P17 puso más de 0 |
| P21 - ¿Qué hiciste cuando no llegabas al número? | en P17 puso más de 0 y en P20 no marcó «Sin problema» |
| P27b - ¿Por qué no? | en P27 respondió «No» |
| P29 - ¿Qué eventos eran? Di todos los que recuerdes | en P28 puso más de 0 |
| P30 - ¿Cómo te enteraste del último evento al que fuiste? | en P28 puso más de 0 |
| P31b - ¿Qué tipo de conferencias o concursos? | en P31 marcó «Conferencias» o «Concursos» |
| P34b - Si no lo usas, ¿por qué no lo usas? | en P34 marcó «Sí, pero casi nunca entro» o «No tengo» |
| P35b - ¿Cuál? | en P35 respondió «Sí» |

- **Todas las preguntas visibles son obligatorias.** Si prefieres que las preguntas de texto libre sean opcionales, en `index.html` cambia `OPEN_QUESTIONS_REQUIRED: true` por `false`.
- **La nota para la persona que entrevista (pregunta 12) no se muestra** en el formulario: es una indicación para ti, no para el alumno.
- **Los botones «No me ha pasado» y «No recuerdo ninguno»** rellenan el cuadro de texto con esa frase, para que la respuesta quede registrada y no vacía.
- **Opciones de elegir una sola respuesta** pasan solas a la pantalla siguiente al tocar/hacer clic (no con el teclado, ni en «Otro», ni en la última pregunta).
- **Aviso al pie:** «Proyecto académico de estudiantes. No es un sitio oficial de la Universidad Tecnológica del Perú». Está puesto a propósito: el diseño usa los colores de la UTP y es mejor dejar claro que no es una página oficial. Quítalo solo si la universidad autoriza el formulario.
- **Sedes:** la lista de 15 sedes salió del sitio de la UTP (utp.edu.pe). Revísala contra la sede donde harás el piloto.
- **Animaciones:** respetan la opción «reducir movimiento» del sistema y hay un botón en el encabezado para reducirlas a mano.

## Problemas frecuentes

| Qué ves | Causa probable | Qué hacer |
|---|---|---|
| Aviso rojo «Falta conectar el formulario…» | `ENDPOINT_URL` sigue con el texto de ejemplo, o no termina en `/exec`. | Paso 6. Copia la URL completa de la implementación. |
| Error `E_SIN_CONFIRMAR` («No pudimos confirmar que tus respuestas se guardaron») **siempre**, aunque haya internet | El Web App no está bien publicado: lo más común es que **Quién tiene acceso** no sea «Cualquier persona» (Google devuelve una página de inicio de sesión) o que la URL sea de otra implementación. Prueba: abre la URL `/exec` en una ventana de incógnito; debe mostrar `{"ok":true,…}`. | Implementar → Administrar implementaciones → ✏️ editar → Quién tiene acceso: **Cualquier persona** → Versión: Nueva versión → Implementar. |
| Error `E_SIN_CONFIRMAR` solo a veces | Conexión caída o bloqueo de red del dispositivo. | Reintentar. Antes de pedir que repitan, mira la hoja: puede que sí se haya guardado. |
| Error `E_NO_GUARDADO` («Tus respuestas no se guardaron») | Se confirmó que esa respuesta **no** llegó a la hoja. | Pulsar **Reintentar envío** (no duplica filas). |
| Error `E_INTERNO` y en Apps Script → **Ejecuciones** aparece «Los encabezados de la hoja no coinciden…» | Alguien cambió a mano la fila 1 de la pestaña **Respuestas**, o cambiaste las preguntas. | Renombra la pestaña actual (por ejemplo «Respuestas antiguas»), ejecuta `setup` otra vez para crear una nueva con los encabezados correctos, y no toques la fila 1. |
| Error `E_OCUPADO` | Mucha gente escribiendo a la vez (el candado esperó 25 s). | Es temporal: **Reintentar envío**. |
| Error `E_VALIDACION` o `E_INCOMPLETO` | El servidor rechazó algún dato (fuera de rango, opción que no existe, muy pocas respuestas). | Reintenta; si se repite, mira Apps Script → **Ejecuciones** y el mensaje que muestra el formulario, y avísame. |
| Cambié `Code.gs` y no pasa nada | No publicaste una versión nueva. | Ver el último punto de «Límites». |
| Al ejecutar `setup` dice «No se encontró la hoja de cálculo…» | Creaste el proyecto desde script.google.com en vez de abrirlo desde la hoja. | Ábrelo desde la hoja (Extensiones → Apps Script), o pon el ID de la hoja en `SPREADSHEET_ID` de `Code.gs`. |

---

## Apéndice A. Columnas de la hoja

La hoja tiene **56 columnas**: 5 automáticas y una por pregunta. Los encabezados se generan desde la misma fuente que las preguntas del formulario, así que **los nombres coinciden** (la clave interna es el `name` que usa el HTML). Las columnas de preguntas de varias respuestas guardan lo marcado separado por ` | `. Las preguntas que no se mostraron a esa persona quedan vacías.

| Columna | Encabezado en la hoja | Clave interna | Tipo |
|---|---|---|---|
| A | ID de respuesta | (automática) | sistema |
| B | Fecha y hora (Lima) | (automática) | sistema |
| C | Estado | (automática) | sistema |
| D | Duración (segundos) | (automática) | sistema |
| E | Versión del formulario | (automática) | sistema |
| F | P01 - ¿Qué carrera estudias? | `p01_carrera` | texto |
| G | P02 - ¿En qué ciclo estás? | `p02_ciclo` | número |
| H | P03 - ¿Qué edad tienes? | `p03_edad` | número |
| I | P04 - ¿En qué modalidad estudias? | `p04_modalidad` | una opción |
| J | P05 - ¿En qué sede estás? | `p05_sede` | una opción |
| K | P06 - Sin contar a los de tu salón actual, ¿a cuántos alumnos de la UTP has conocido en persona de una carrera distinta a la tuya? | `p06_conocidos_otra_carrera` | número |
| L | P07 - Sin contar a tu salón, ¿cuándo fue la última vez que conociste a alguien nuevo de la UTP? | `p07_ultima_vez_conociste` | una opción |
| M | P08 - ¿Cómo lo conociste? | `p08_como_lo_conociste` | texto |
| N | P09 - ¿Qué pasa hoy con tus grupos de WhatsApp de ciclos anteriores? | `p09_whatsapp_ciclos_anteriores` | una opción |
| O | P10 - La última vez que tuviste una duda sobre tu carrera, un curso o un trámite y no sabías a quién preguntar, ¿qué hiciste? | `p10_duda_sin_saber_a_quien` | texto |
| P | P10b - Seguimiento: ¿Cuál era la duda? | `p10b_cual_era_la_duda` | texto |
| Q | P11 - ¿Cuándo fue la última vez que le pediste ayuda a un alumno de un ciclo mayor al tuyo? | `p11_ultima_ayuda_ciclo_mayor` | una opción |
| R | P11b - Seguimiento: ¿Lo conocías de antes? ¿Qué le preguntaste? | `p11b_lo_conocia_y_que_pregunto` | texto |
| S | P12 - La última vez que quisiste hablar con alguien de la UTP que no conocías y no lo hiciste, ¿qué pasó? | `p12_quiso_hablar_y_no_hablo` | texto |
| T | P13 - Normalmente en tus huecos de clases ¿Con quiénes la pasas o la pasas solo? | `p13_huecos_con_quien` | varias opciones |
| U | P14 - ¿Te gustaría conocer gente que también esté libre en sus huecos libres? | `p14_quiere_conocer_en_huecos` | una opción |
| V | P15 - ¿Qué actividad te gustaría realizar con dicha persona? | `p15_actividad_con_esa_persona` | varias opciones |
| W | P16 - Este ciclo, ¿cuántas veces te pidió ayuda un alumno de un ciclo menor al tuyo? | `p16_ayuda_pedida_por_menores` | número |
| X | P16b - Seguimiento: La última vez, ¿era tu amigo o alguien que no conocías? | `p16b_amigo_o_desconocido` | una opción |
| Y | P17 - ¿En cuántos trabajos académicos has necesitado encuestar o entrevistar gente? | `p17_trabajos_con_encuestas` | número |
| Z | P18 - Cuando necesitaste encuestados, ¿buscabas un perfil específico que no tenías cerca? | `p18_perfil_especifico` | una opción |
| AA | P18b - Seguimiento: ¿Qué perfil necesitabas y qué hiciste? | `p18b_que_perfil_y_que_hizo` | texto |
| AB | P19 - ¿Cómo los conseguiste? | `p19_como_consiguio_encuestados` | varias opciones |
| AC | P20 - ¿Cómo te fue consiguiendo el número de respuestas que necesitabas? | `p20_como_le_fue_con_respuestas` | una opción |
| AD | P21 - ¿Qué hiciste cuando no llegabas al número? | `p21_que_hizo_si_no_llegaba` | una opción |
| AE | P22 - ¿Cuántas encuestas de otros alumnos has respondido este ciclo? | `p22_encuestas_respondidas` | número |
| AF | P23 - ¿Qué te motivaría a responder más encuestas? | `p23_que_lo_motivaria` | texto |
| AG | P24 - ¿Cuándo abriste tu correo Outlook UTP por última vez? | `p24_ultima_vez_outlook` | una opción |
| AH | P25 - ¿Cuántos correos sin leer tienes ahora mismo en tu correo UTP? | `p25_correos_sin_leer` | número |
| AI | P26 - Nombra los programas de empleabilidad, concursos, becas o intercambio de la UTP que recuerdes. No vale buscarlos. | `p26_programas_que_recuerda` | texto |
| AJ | P27 - ¿Perteneces a algún grupo, club o comunidad de la universidad? | `p27_pertenece_a_grupo` | una opción |
| AK | P27b - Seguimiento: ¿Por qué no? | `p27b_por_que_no` | texto |
| AL | P28 - ¿A cuántos eventos organizados por la UTP (charlas, talleres, ferias, concursos) has ido este año? | `p28_eventos_este_anio` | número |
| AM | P29 - ¿Qué eventos eran? Di todos los que recuerdes | `p29_que_eventos` | texto |
| AN | P30 - ¿Cómo te enteraste del último evento al que fuiste? | `p30_como_se_entero_evento` | una opción |
| AO | P31 - ¿Qué tipo de actividades extracurriculares te gustaría que se difundan más dentro de la universidad? | `p31_actividades_a_difundir` | varias opciones |
| AP | P31b - Seguimiento: ¿Qué tipo de conferencias o concursos? | `p31b_tipo_conferencias_concursos` | texto |
| AQ | P32 - ¿Asistirías a talleres o eventos organizados por alumnos de otras carreras si pudieras acceder fácilmente a su programación? | `p32_asistiria_otras_carreras` | una opción |
| AR | P33 - Si pudieras arreglar una sola cosa de cómo te conectas con otros alumnos de la UTP, ¿cuál sería? | `p33_arreglar_una_cosa` | texto |
| AS | P34 - ¿Tienes cuenta en LinkedIn? | `p34_linkedin` | una opción |
| AT | P34b - Seguimiento: Si no lo usas, ¿por qué no lo usas? | `p34b_por_que_no_linkedin` | texto |
| AU | P35 - ¿Hay algo parecido que ya uses actualmente? | `p35_app_parecida` | una opción |
| AV | P35b - Seguimiento: ¿Cuál? | `p35b_cual_app` | texto |
| AW | P36 - ¿Qué tendría que pasar para que NO la instales? | `p36_que_haria_no_instalar` | texto |
| AX | P37 - ¿Estarías de acuerdo con que los alumnos vean tu nombre, carrera y ciclo? | `p37_acuerdo_nombre_carrera_ciclo` | texto |
| AY | P38 - Si solo pudieras tener UNA de estas funciones en una app de la UTP, ¿cuál elegirías? | `p38_funcion_unica` | una opción |
| AZ | P39 - En la pantalla inicial de la app, ¿qué tipo de contenido te interesaría ver primero? | `p39_contenido_pantalla_inicial` | una opción |
| BA | P40 - ¿Qué tan relevante es para ti que la plataforma cuente con filtros para buscar compañeros según sus aficiones, pasatiempos o intereses específicos? | `p40_relevancia_filtros` | una opción |
| BB | P41 - ¿Te gustaría contar con la opción de crear y promocionar tus propios eventos o iniciativas estudiantiles dentro de la app? | `p41_crear_eventos` | una opción |
| BC | P42 - ¿En qué momentos del día o de la semana académica considerarías usar con mayor frecuencia la aplicación? | `p42_momentos_de_uso` | varias opciones |
| BD | P43 - ¿Qué factor principal te llevaría a dejar de usar una app de este tipo? | `p43_motivo_dejar_de_usar` | una opción |

## Apéndice B. Cómo está organizado el código

- `index.html`: configuración (`CONFIG`) → lista de preguntas (`QUESTIONS`) → utilidades → validación → pantallas → envío. Un solo archivo, sin librerías externas ni fuentes descargadas.
- `Code.gs`: configuración → esquema (`SCHEMA`) → `doPost` / `doGet` → validación → escritura segura en la hoja → funciones manuales (`setup`, `pruebaDeEscritura`, `eliminarFilasDePrueba`).
- Si quieres **cambiar una pregunta**, no la edites solo en un archivo: tendrías que cambiarla en `QUESTIONS` (HTML), en `SCHEMA` (Code.gs) y en los encabezados de la hoja. Para eso existe el código fuente (carpeta `fuente/` del repositorio): ahí hay un solo archivo de preguntas (`src/schema.py`), y un comando (`python3 build.py`) vuelve a generar los tres archivos; las pruebas comprueban que HTML y hoja siguen coincidiendo.
