# KAMPUS — Prompts para Google Stitch

Guía de uso y los 15 prompts listos para copiar y pegar.
Proyecto: Kampus, red social cerrada por universidad. Piloto en una sede de la UTP.

---

## Antes de empezar: cómo funciona Stitch

Tres cosas que cambian cómo usas esto:

1. **Stitch genera una pantalla por prompt.** No le pidas la app completa en un solo mensaje: sale genérico. Un prompt, una pantalla.
2. **Usa el modo Standard** (Gemini 2.5 Flash), no Experimental. Standard te da **350 generaciones al mes** y es el **único modo con el botón "Copy to Figma"**, que exporta con Auto Layout. Experimental solo tiene 50 al mes y sirve para cuando subes un boceto como referencia.
3. **Cada generación tarda 60 a 90 segundos.** Con 15 pantallas son unos 20 minutos, más las iteraciones.

### Paso 0 — Configura el tema una sola vez en la interfaz

Antes de pegar prompts, abre el panel de tema de Stitch y pon esto. Así no tienes que repetir los colores en cada prompt:

| Ajuste | Valor |
|---|---|
| Color primario | `#2F2A6B` (indigo profundo) |
| Color de acento | `#00A896` (turquesa) |
| Tipografía | **Inter** (alternativa: Plus Jakarta Sans) |
| Radio de esquinas | Medio, 16 px |
| Modo | Claro |

Colores de apoyo, si te los pide: éxito `#2DC75C`, advertencia `#F2A541`, error `#E5484D`, fondo de pantalla `#F7F8FB`, tarjetas `#FFFFFF`, líneas `#E6E8EF`, texto principal `#111318`, texto secundario `#5B6070`.

### Orden recomendado

Si tienes poco tiempo, genera primero **las seis en negrita** (P1, P3, P5, P8, P9, P7). Son las que cuentan la historia completa en una demo: entras con correo institucional → declaras tu perfil → buscas gente de otra carrera → te llega una encuesta → mandas la tuya con filtro → conversas en tu grupo.

---

## Bloque de contexto

**Pega esto como primer mensaje de la conversación en Stitch.** No esperes una pantalla de aquí: es para que entienda el producto antes de dibujar.

```
Voy a diseñar las pantallas de una aplicación llamada Kampus.

Qué es: una red social cerrada por universidad. Solo entra quien tiene un correo
institucional válido de su universidad. Todos usan su nombre y apellido reales,
no hay anonimato ni seudónimos. Arranca como piloto en una sede de la Universidad
Tecnológica del Perú (UTP), con unos 19,300 alumnos.

Para quién: estudiantes universitarios peruanos de 18 a 26 años. Dos perfiles
principales. El primero es un alumno de ciclos superiores que necesita encontrar
gente de otras carreras para trabajos de investigación y encuestas académicas.
El segundo es un alumno de primer ciclo que quiere desarrollarse profesionalmente
y no sabe que existen comunidades, eventos y conferencias en su universidad.

La función central: encuestas con filtro. Un alumno arma un filtro por universidad,
sede, carrera, ciclo, edad e intereses; la app le dice en vivo a cuántos alumnos
alcanza; si el segmento tiene menos de 30 personas el envío se bloquea para
proteger el anonimato. Las encuestas llegan a una bandeja dentro de la app, nunca
como un link externo. Se paga con créditos: ganas 1 crédito respondiendo una
encuesta y gastas 1 crédito por cada persona que recibe la tuya.

Dos tipos de espacio. Los grupos de carrera son cerrados y automáticos: la app
te mete al tuyo según tu carrera y ciclo, por ejemplo "Enfermería 5.º ciclo", y
no se pueden abandonar. Los grupos de interés son abiertos y los crea cualquier
alumno: gym, música, tesis, idiomas, startups, videojuegos, voluntariado.

Dirección visual: juvenil pero institucional. El alumno tiene que sentir que es
un espacio serio de su universidad, no otra red social de entretenimiento.
Limpio, con mucho aire, tipografía grande y pocos colores. Nada de gradientes,
sombras pesadas, glassmorphism ni ilustraciones decorativas.

Todos los textos de la interfaz en español. Nombres de ejemplo peruanos y
carreras reales de la UTP. Navegación inferior de cinco ítems:
Inicio, Explorar, Grupos, Encuestas, Perfil.

No dibujes nada todavía. Confirma que entendiste y espera mi siguiente mensaje.
```

---

# Prompts por pantalla

## Entrada

### **P1 — Bienvenida y acceso**

```
Diseña la pantalla de bienvenida y acceso de una app móvil llamada Kampus.

De arriba a abajo: el logotipo Kampus en texto, grande, en indigo #2F2A6B.
Debajo, una frase corta: "La red de tu universidad. Con gente real de tu
universidad." Debajo, un campo de texto con la etiqueta "Correo institucional"
y el texto de ayuda "ejemplo@utp.edu.pe". Debajo, un botón primario grande que
dice "Continuar". Debajo del botón, una línea pequeña en gris: "Solo alumnos con
correo institucional. Verificamos que seas de tu universidad, nada más."

Al pie, dos enlaces de texto pequeños: "Términos" y "Privacidad".

Mucho espacio en blanco, todo centrado, sin imágenes ni ilustraciones. Fondo
blanco. Una sola acción visible. Textos en español.
```

---

### P2 — Verificación por código

```
Diseña la pantalla de verificación de código de una app móvil llamada Kampus.

Arriba a la izquierda, una flecha de retroceso. Debajo, un título: "Revisa tu
correo". Debajo, un texto en gris: "Te enviamos un código de 6 dígitos a
nombre.apellido@utp.edu.pe". Debajo, seis casillas cuadradas separadas para el
código, con las primeras tres llenas mostrando 4, 8, 2 y la cuarta con el cursor
activo en indigo. Debajo, un enlace de texto: "Volver a enviar el código"
acompañado de un contador "en 0:42". Al pie, un botón primario "Verificar",
desactivado hasta que el código esté completo.

Sin ilustraciones. Casillas grandes, cómodas para el pulgar. Textos en español.
```

---

### **P3 — Onboarding: tu perfil**

Esta es la pantalla que sostiene todo el producto, porque el perfil declarado es lo que hace posible el filtro de encuestas.

```
Diseña una pantalla de onboarding en una app móvil llamada Kampus, donde el
alumno declara su perfil.

Arriba, una barra de progreso de tres pasos con el primero activo. Título:
"Cuéntanos quién eres". Subtítulo en gris: "Esto es lo que permite que otros
alumnos te encuentren para proyectos y encuestas."

Un formulario con estos campos, cada uno con su etiqueta encima:
- Nombre y apellido (campo de texto, con el valor "Camila Rojas")
- Carrera (desplegable, con el valor "Ingeniería Industrial")
- Ciclo (desplegable, con el valor "7")
- Sede (desplegable, con el valor "Lima Norte")
- Fecha de nacimiento (selector de fecha)

Debajo, una sección titulada "Tus intereses" con chips seleccionables en forma
de pastilla: Tesis, Startups, Gym, Música, Idiomas, Voluntariado, Videojuegos,
Fotografía, Marketing, Programación. Tres de ellos seleccionados, en indigo
claro con texto indigo.

Al pie, un botón primario "Continuar".

Formulario limpio, campos amplios, una columna. Nada de iconos decorativos
dentro de los campos. Textos en español.
```

---

### P4 — Consentimientos

Esta pantalla es obligatoria por la Ley 29733 del Perú: los consentimientos van **separados por finalidad**, nunca una sola casilla.

```
Diseña una pantalla de permisos y privacidad en una app móvil llamada Kampus.

Arriba, una barra de progreso de tres pasos con el tercero activo. Título:
"Tú decides qué compartes". Subtítulo en gris: "Puedes cambiar cualquiera de
estas opciones después, desde tu perfil."

Debajo, tres tarjetas blancas apiladas, cada una con un interruptor a la derecha
y dos líneas de texto a la izquierda:

1. Título "Crear mi cuenta" — texto "Guardamos tu nombre, carrera, ciclo y sede
   para que otros alumnos te encuentren." Interruptor activado y bloqueado, con
   una etiqueta pequeña "Necesario".
2. Título "Recibir encuestas de otros alumnos" — texto "Te llegan encuestas de
   compañeros que buscan tu perfil. Máximo 3 por semana." Interruptor activado.
3. Título "Métricas para mi universidad" — texto "Tu universidad ve números
   agregados y anónimos. Nunca ve tus mensajes ni quién eres." Interruptor
   activado.

Al pie, un botón primario "Entrar a Kampus" y debajo un enlace de texto pequeño
"Leer la política de privacidad".

Cada permiso claramente separado del otro. Tono tranquilo, no legalista.
Textos en español.
```

---

## Núcleo

### **P5 — Explorar (la pantalla central del producto)**

```
Diseña la pantalla "Explorar" de una app móvil llamada Kampus. Es un buscador
de alumnos y de grupos dentro de una universidad.

Arriba, una barra de búsqueda con el texto de ayuda "Busca personas, carreras o
grupos". Debajo, una fila de chips de filtro deslizable horizontalmente:
Carrera, Ciclo, Sede, Interés, Habilidad. Dos de ellos con un punto indigo que
indica filtro activo.

Debajo, dos pestañas: "Personas" (activa) y "Grupos".

Debajo, una lista de cinco tarjetas de persona. Cada tarjeta lleva: avatar
circular de 48 px a la izquierda; el nombre en seminegrita; debajo, en gris
pequeño, el texto "Carrera · Ciclo N · Sede"; debajo, un chip pequeño con un
interés en común; y a la derecha un botón secundario pequeño "Conectar".

Usa estos datos:
- Lucía Ramos — Psicología · Ciclo 7 · Lima Norte — interés en común: Tesis
- Diego Flores — Diseño Digital Publicitario · Ciclo 5 · Lima Norte — Fotografía
- Camila Soto — Administración · Ciclo 1 · Lima Norte — Startups
- Andrés Quispe — Ingeniería de Sistemas · Ciclo 8 · Lima Norte — Programación
- Valeria Núñez — Enfermería · Ciclo 4 · Lima Norte — Gym

Dos de las cinco tarjetas llevan junto al nombre un pequeño sello de verificado
en turquesa. Las otras tres no llevan nada: no las marques como no verificadas.

Al pie, la barra de navegación de cinco ítems con "Explorar" activo.
Textos en español.
```

---

### P6 — Detalle de grupo

```
Diseña la pantalla de detalle de un grupo en una app móvil llamada Kampus.

Arriba, una flecha de retroceso sobre una portada de color plano indigo de
proporción 16:9, sin fotografía. Debajo, el nombre del grupo: "Startups UTP
Lima Norte". Debajo, en gris: "248 miembros de 9 carreras". Debajo, dos chips:
"Grupo de interés" y "Abierto".

Debajo, un párrafo de descripción de dos líneas: "Para alumnos que están armando
algo propio. Compartimos convocatorias, buscamos socios y nos juntamos los
jueves."

Debajo, un botón primario de ancho completo: "Unirme al grupo".

Debajo, una sección titulada "Miembros" con una fila horizontal de seis avatares
circulares y un contador "+242". Debajo, una sección titulada "Carreras que lo
integran" con chips: Ingeniería Industrial 62, Administración 48, Sistemas 41,
Marketing 33, Diseño 24, otras 40.

Limpio, sin fotografías de personas genéricas. Textos en español.
```

---

### **P7 — Chat del grupo**

```
Diseña la pantalla de chat de un grupo en una app móvil llamada Kampus.

Arriba, una cabecera compacta con flecha de retroceso, el nombre "Enfermería
5.º ciclo", debajo en gris pequeño "Grupo de carrera · 34 miembros", y a la
derecha un icono de información.

Debajo, una conversación con seis mensajes. Los de otras personas alineados a la
izquierda en burbujas blancas con borde gris claro, cada uno con el nombre real
del autor en seminegrita arriba y la hora pequeña abajo. Los propios alineados
a la derecha en burbujas indigo con texto blanco.

Mensajes, en orden:
- Valeria Núñez: "Chicos, ¿alguien tiene el formato del informe de prácticas?"
- Mateo Rojas: "Yo lo tengo, te lo paso en la tarde"
- Valeria Núñez: "Gracias, me salvas"
- Tú (derecha): "¿Alguien de Psicología para un trabajo? Necesito 2"
- Lucía Ramos: "Yo puedo, escríbeme"
- Tú (derecha): "Listo, te mando solicitud"

Al pie, un campo de escritura con el texto de ayuda "Escribe un mensaje", un
icono de adjuntar a la izquierda y un botón de enviar circular en indigo a la
derecha.

Sin reacciones, sin stickers, sin estados de "escribiendo". Textos en español.
```

---

## Encuestas: la función estrella

### **P8 — Bandeja de encuestas y créditos**

```
Diseña la pantalla "Encuestas" de una app móvil llamada Kampus.

Arriba, un título "Encuestas". A la derecha del título, una pastilla compacta
con un icono de moneda y el texto "14 créditos".

Debajo, una tarjeta ancha de fondo indigo claro con texto indigo que explica el
sistema en dos líneas: "Respondes una encuesta y ganas 1 crédito. Mandas la tuya
y gastas 1 crédito por cada persona que la recibe."

Debajo, dos pestañas: "Para responder" (activa) y "Las mías".

Debajo, una lista de tres tarjetas de encuesta. Cada una con: el título de la
encuesta en seminegrita; debajo en gris "de Nombre · Carrera · Ciclo N"; debajo
una fila con dos datos pequeños, el número de preguntas y el tiempo estimado; y
a la derecha un botón primario pequeño "Responder +1".

Usa estos datos:
- "Hábitos de estudio en ciclos superiores" — de Andrés Quispe · Sistemas ·
  Ciclo 8 — 8 preguntas · 3 min
- "Uso de transporte para llegar al campus" — de Camila Soto · Administración ·
  Ciclo 1 — 5 preguntas · 2 min
- "Percepción del servicio de comedor" — de Valeria Núñez · Enfermería ·
  Ciclo 4 — 6 preguntas · 2 min

Al pie, la barra de navegación de cinco ítems con "Encuestas" activo.
Textos en español.
```

---

### **P9 — Crear encuesta: el filtro con alcance en vivo**

Esta pantalla es el diferenciador del producto. El contador de alcance y el bloqueo bajo 30 personas son lo que ninguna otra app puede ofrecer.

```
Diseña la pantalla de creación de encuesta de una app móvil llamada Kampus,
en el paso donde el alumno elige a quién se la manda.

Arriba, una flecha de retroceso y el título "¿A quiénes se la mandas?".

Debajo, una tarjeta blanca titulada "Filtro" con seis filas, cada una con la
etiqueta a la izquierda y el valor elegido a la derecha en indigo, con una
flecha de desplegable:
- Universidad: UTP
- Sede: Lima Norte
- Carrera: Psicología
- Ciclo: 7 a 10
- Edad: 21 a 26
- Intereses: Tesis, Investigación

Debajo del filtro, el elemento más importante de la pantalla: una tarjeta ancha
de fondo turquesa claro, con el número "86" muy grande en turquesa oscuro y
debajo el texto "alumnos cumplen este filtro". Al lado, en texto pequeño:
"Mínimo 30 para poder enviar".

Debajo, una fila que muestra el costo: "Costo: 86 créditos" a la izquierda y
"Tienes 14" a la derecha en rojo.

Al pie, un botón primario de ancho completo "Revisar y enviar".

Que el número de alcance sea lo primero que salta a la vista. Textos en español.
```

---

### P10 — Filtro bloqueado por el umbral de 30

Genera esta como variante de la P9: es el estado que demuestra que la protección de anonimato es real y no un adorno.

```
Diseña la misma pantalla anterior de creación de encuesta en Kampus, pero en su
estado bloqueado.

Cambia estas tres cosas:
- En el filtro, Carrera dice "Nutrición" y Ciclo dice "9 a 10".
- La tarjeta de alcance ahora tiene fondo rojo muy claro, el número grande es
  "12" en rojo oscuro, el texto debajo dice "alumnos cumplen este filtro" y
  aparece una línea adicional en rojo: "Muy pocos. Con menos de 30 personas
  alguien podría quedar identificado. Amplía el ciclo o quita un filtro."
- El botón al pie dice "Revisar y enviar" y está desactivado, en gris.

Todo lo demás igual que la pantalla anterior. Textos en español.
```

---

### P11 — Responder una encuesta

```
Diseña la pantalla de responder una encuesta en una app móvil llamada Kampus.

Arriba, una flecha de cierre en forma de X a la izquierda y, a la derecha, un
contador "Pregunta 3 de 8". Debajo, una barra de progreso fina y delgada.

Debajo, en gris pequeño: "Hábitos de estudio en ciclos superiores · de Andrés
Quispe". Debajo, la pregunta en texto grande: "¿Dónde estudias cuando tienes un
examen importante?"

Debajo, cinco opciones de respuesta en tarjetas apiladas de ancho completo, cada
una con un círculo de selección a la izquierda: "En mi casa", "En la biblioteca
del campus", "En un café", "En casa de un compañero", "En los espacios libres
de la universidad". La segunda está seleccionada, con borde indigo y fondo
indigo muy claro.

Al pie, dos botones en una fila: "Anterior" secundario y "Siguiente" primario.

Una sola pregunta por pantalla, mucho aire, texto grande. Textos en español.
```

---

### P12 — Resultados agregados

```
Diseña la pantalla de resultados de una encuesta propia en una app móvil llamada
Kampus.

Arriba, flecha de retroceso y el título "Hábitos de estudio en ciclos
superiores". Debajo, una fila de tres datos separados por puntos: "86 enviadas",
"41 respuestas", "48% de respuesta".

Debajo, una advertencia discreta en una tarjeta gris claro: "Ves respuestas
agregadas. Nunca sabrás quién respondió qué."

Debajo, los resultados de dos preguntas. Cada pregunta con su enunciado en
seminegrita y debajo barras horizontales, una por opción, con la etiqueta a la
izquierda, la barra en indigo y el porcentaje a la derecha.

Pregunta 1: "¿Dónde estudias cuando tienes un examen importante?"
En mi casa 44%, En la biblioteca del campus 27%, En los espacios libres 15%,
En un café 9%, En casa de un compañero 5%.

Pregunta 2: "¿Cuántas horas estudias al día en semana de exámenes?"
Menos de 2 horas 12%, 2 a 4 horas 46%, 4 a 6 horas 29%, Más de 6 horas 13%.

Al pie, un botón secundario de ancho completo "Descargar resultados".

Gráficos de barras simples, un solo color, sin leyendas innecesarias.
Textos en español.
```

---

## Perfil y conexión

### P13 — Perfil de otro alumno

```
Diseña la pantalla de perfil de otro alumno en una app móvil llamada Kampus.

Arriba, flecha de retroceso. Debajo, centrado: un avatar circular grande, el
nombre "Lucía Ramos" en texto grande con un pequeño sello de verificado en
turquesa al lado, y debajo en gris "Psicología · Ciclo 7 · UTP Lima Norte".

Debajo, dos botones en una fila: "Enviar solicitud" primario de ancho mayor y
"Invitar a un grupo" secundario.

Debajo, una sección "Intereses" con chips: Tesis, Investigación, Voluntariado,
Lectura.

Debajo, una sección "Sabe hacer" con chips: Entrevistas a profundidad, Análisis
cualitativo, Redacción académica.

Debajo, una sección "Grupos en común" con dos filas, cada una con el nombre del
grupo y el número de miembros: "Tesis UTP 2026 · 112 miembros" y "Voluntariado
Lima Norte · 67 miembros".

Al pie, una línea de texto pequeña en gris: "El mensaje directo se abre cuando
Lucía acepta tu solicitud."

Sin fotografía de fondo, sin contadores de seguidores. Textos en español.
```

---

### P14 — Inicio

```
Diseña la pantalla de inicio de una app móvil llamada Kampus.

Arriba, un saludo: "Hola, Jorge" en texto grande, y debajo en gris "Ingeniería
Industrial · Ciclo 7 · Lima Norte".

Debajo, una tarjeta destacada de fondo indigo claro con un icono de sobre: el
título "Tienes 3 encuestas por responder" y debajo "Cada una te da 1 crédito",
con una flecha a la derecha.

Debajo, una sección titulada "Tus grupos" con tres filas compactas, cada una con
el nombre del grupo, debajo el último mensaje en gris truncado, y a la derecha
un punto indigo si tiene mensajes sin leer:
- "Ingeniería Industrial 7.º ciclo" — "Mateo: ¿alguien tiene el formato?" — con punto
- "Startups UTP Lima Norte" — "Lucía: nos juntamos el jueves 7pm"
- "Gym UTP" — "Diego: rutina de pierna mañana 6am" — con punto

Debajo, una sección titulada "Pasa en tu sede" con dos tarjetas horizontales
deslizables, cada una con una etiqueta "Oficial" en turquesa, un título y una
fecha: "Feria de prácticas 2026 · 12 de octubre" y "Charla: cómo postular a un
intercambio · 15 de octubre".

Al pie, la barra de navegación de cinco ítems con "Inicio" activo.
Textos en español.
```

---

## Panel web de la universidad

### P15 — Panel de métricas agregadas

```
Diseña un panel web de escritorio para la universidad, dentro de un producto
llamado Kampus. Formato pantalla ancha, no móvil.

Barra lateral izquierda angosta con el logotipo Kampus arriba y cinco ítems de
menú: Resumen, Participación, Grupos, Eventos, Configuración. "Resumen" activo.

Contenido principal: arriba, el título "UTP Lima Norte" y debajo en gris "Ciclo
2026-2 · datos del 1 al 31 de octubre". A la derecha, un selector de rango de
fechas.

Debajo, una fila de cuatro tarjetas de indicador, cada una con una etiqueta
pequeña arriba, un número grande y una variación porcentual pequeña debajo:
- Alumnos registrados: 2,847 (+12%)
- Activos esta semana: 1,106 (+4%)
- Grupos de interés creados: 93 (+8%)
- Retención a 4 semanas: 31% (+2%)

Debajo, dos paneles lado a lado. El izquierdo, titulado "Participación por
facultad", con barras horizontales: Ingeniería 1,284, Administración 736,
Derecho 402, Salud 251, Comunicación 174. El derecho, titulado "Registro por
semana", con un gráfico de líneas simple de ocho puntos en tendencia
ascendente.

Al pie del contenido, una franja gris claro con un texto: "Todos los datos son
agregados y anónimos. Ningún segmento con menos de 30 alumnos se muestra. La
universidad no accede a mensajes ni a perfiles individuales."

Un solo color de datos, indigo. Limpio, mucho aire, sin degradados.
Textos en español.
```

---

## Cómo iterar cuando algo sale mal

Stitch regenera la pantalla completa con cada prompt nuevo, así que no le pidas parches: repite el prompt con el cambio incorporado. Tres arreglos que vas a necesitar:

**Si sale en inglés.** Agrega al final: `Todos los textos de la interfaz en español, incluyendo botones y etiquetas.`

**Si mete ilustraciones, degradados o fotos de gente.** Agrega: `Sin ilustraciones, sin degradados, sin fotografías de personas. Solo tipografía, color plano y espacio en blanco.`

**Si se ve como una red social de entretenimiento.** Agrega: `Tono institucional y sobrio, como una herramienta académica. No como Instagram ni TikTok. Sin contadores de seguidores, sin likes, sin historias.`

Cuando una pantalla te guste, usa **"Copy to Figma"** de una vez. Solo está en modo Standard, y así te queda con Auto Layout para que el diseñador pueda seguir ahí.

---

## Lo que estos prompts dan por decidido

Si alguno de estos puntos cambia, hay que rehacer la pantalla correspondiente:

| Decisión | Está en |
|---|---|
| Grupos de carrera automáticos por carrera **y ciclo**, sin más filtros | P7, P14 |
| El perfil declarado es la fuente del filtro; los intereses son campo de perfil, no se deducen de los grupos | P3, P9 |
| Un crédito se gana **respondiendo** una encuesta, no por conectarse | P8, P9 |
| Umbral duro de 30 personas por segmento | P9, P10, P15 |
| El perfil verificado lleva sello; el declarado no lleva nada | P5, P13 |
| Consentimientos separados por finalidad | P4 |
| La universidad ve métricas agregadas y nunca mensajes | P4, P15 |

**Un pendiente que no resolví por ti:** el diseñador del equipo propuso que los créditos también se ganen por conectarse tres días a la semana. Eso no está en estos prompts, porque regalar créditos por presencia rompe el control de spam. Si deciden incluirlo, va como racha visible aparte, no como fuente de créditos, y habría que agregarlo a la P8.

---

## Las que faltan

Con las 15 de arriba tienes el flujo completo para la demo y para el MVP. Estas quedan para después, cuando ya tengas las primeras funcionando:

Crear grupo · Mis solicitudes · Conversación directa · Solicitud de publicación en un grupo ajeno · Tablón de eventos completo · Centro de seguridad y reportes · Mi perfil editable · Historial de créditos · Panel web para publicar un evento segmentado.
