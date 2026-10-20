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
5. Cuando termine, vuelve a la hoja: habrá una pestaña **Respuestas** con una fila de encabezados con <!--NCOLS--> columnas y la hoja quedará en la zona horaria de Lima.

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

<!--LOGICA-->

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

La hoja tiene **<!--NCOLS--> columnas**: 5 automáticas y una por pregunta. Los encabezados se generan desde la misma fuente que las preguntas del formulario, así que **los nombres coinciden** (la clave interna es el `name` que usa el HTML). Las columnas de preguntas de varias respuestas guardan lo marcado separado por ` | `. Las preguntas que no se mostraron a esa persona quedan vacías.

<!--COLUMNAS-->

## Apéndice B. Cómo está organizado el código

- `index.html`: configuración (`CONFIG`) → lista de preguntas (`QUESTIONS`) → utilidades → validación → pantallas → envío. Un solo archivo, sin librerías externas ni fuentes descargadas.
- `Code.gs`: configuración → esquema (`SCHEMA`) → `doPost` / `doGet` → validación → escritura segura en la hoja → funciones manuales (`setup`, `pruebaDeEscritura`, `eliminarFilasDePrueba`).
- Si quieres **cambiar una pregunta**, no la edites solo en un archivo: tendrías que cambiarla en `QUESTIONS` (HTML), en `SCHEMA` (Code.gs) y en los encabezados de la hoja. Para eso existe el código fuente (carpeta `fuente/` del repositorio): ahí hay un solo archivo de preguntas (`src/schema.py`), y un comando (`python3 build.py`) vuelve a generar los tres archivos; las pruebas comprueban que HTML y hoja siguen coincidiendo.
