# Insumo para generar UNA sola slide — El prototipo: cómo funciona Kampus

**Instrucción para la IA que lea este documento (GPT, NotebookLM, Gamma, etc.):**

Genera **una (1) sola diapositiva**, formato 16:9, legible a 3 metros. No generes una presentación de varias páginas. Este documento trae más material del que cabe: **tu trabajo es elegir, no resumir todo.** Prioriza en este orden: (1) titular, (2) el diagrama del intercambio central, (3) los tres flujos, (4) las tres reglas. Deja fuera lo demás. **No inventes datos ni cambies los números** (30, 15, 0/30/80/200, 1 y 3 estrellas): son reglas del producto, no ejemplos.

- **Título de la slide:** `Cómo funciona Kampus`
- **Layout sugerido:** titular arriba → en el centro, el intercambio de dos lados como diagrama → debajo, tres columnas con los tres flujos → al pie, una franja con las tres reglas.
- Todo lo marcado como "guion del expositor" queda FUERA de la slide.

---

## Qué es Kampus (una línea de contexto, texto pequeño bajo el título)

Red social cerrada por universidad, con identidad verificada por correo institucional. Piloto en una sede de la UTP con unos 19.300 estudiantes.

---

## Titular (lo más grande de la slide)

> **Kampus no conecta estudiantes: cruza dos necesidades que hoy no se encuentran dentro de la universidad.**

---

## El intercambio central — dibujarlo como diagrama, es el corazón de la slide

```
  EL CACHIMBO                                 EL DE CICLOS FINALES
  (ciclo 1–3)                                 (ciclo 7–10)

  Tiene: tiempo                               Tiene: experiencia
  Necesita: respuestas,                       Necesita: encuestados para
  y enterarse de que                          su tesis (obligatoria por
  existen eventos,                            Ley 30220) y evidencia de
  talleres y comunidades                      sus habilidades blandas
              │                                           │
              └───────────► KAMPUS ◄──────────────────────┘
                     el trueque que los une
```

**La frase que explica el modelo:** el cachimbo da respuestas a encuestas y sube su nivel de *apoyo a la investigación*, lo que le abre acceso a más gente; el de ciclos superiores responde consultas y sube su nivel de *predisposición a ayudar*, que es evidencia real para postular a programas como Impulsa o Generación Top.

---

## Los tres flujos — tres columnas

### Flujo 1 · Consultas agrupadas
El cachimbo pregunta lo que no se atreve a preguntar en clase. Un agente **agrupa las consultas similares en una sola tarjeta** ("12 alumnos de tu carrera preguntan lo mismo") y el de ciclos superiores elige cuál responder, por mensaje o por llamada. Una respuesta sirve para todos.

### Flujo 2 · Grupos, talleres y comunidades
Espeja los talleres reales de la UTP **con su horario visible**, porque el horario es lo que activa el grupo dos veces por semana sin inventar nada. Cualquiera puede proponer un grupo nuevo; es donde se cruzan las carreras.

### Flujo 3 · Perfil de habilidades verificadas
Las habilidades **no se declaran, se calculan**. Cada certificado se clasifica por horas y cada asesoría suma. El perfil muestra datos, liderazgo, trabajo en equipo, programación — con marca de origen en cada dato.

---

## Las tres reglas que hacen que funcione — franja al pie

| Regla | Qué hace |
|---|---|
| **Umbral de 30** | Si un filtro de encuesta deja menos de 30 personas, el envío se bloquea. Nadie puede identificar quién respondió. |
| **Umbral de 15** | Un grupo propuesto existe desde el minuto uno, pero no aparece en Explorar hasta tener 15 miembros. Nadie entra a un grupo vacío. |
| **Alcance 0 / 30 / 80 / 200** | Cuánta gente puedes encuestar depende de tu nivel. Es una recompensa que se gana, no un saldo que se gasta: frena el spam sin castigar a nadie. |

---

## Material de reserva (usar solo si sobra espacio, o para una segunda versión de la slide)

**El sistema de puntaje.** No hay monedas ni tres divisas: todo son estrellas, como un videojuego. Una asesoría por mensaje da 1 estrella por alumno atendido; por llamada, 3. Solo cuenta si atendió a 2 o más. Las estrellas alimentan habilidades blandas concretas, no un marcador abstracto.

**El agente moderador.** Si un mensaje habla de un profesor y además lo juzga, se bloquea con el mensaje: *"Se habla del curso, no de la persona."* Es la regla que evita que la app se convierta en un ranking de docentes.

**Privacidad.** Cuatro consentimientos explícitos, con el de visibilidad ante la universidad **desactivado por defecto**. Los resultados de encuestas solo se ven agregados. Diseñado contra la Ley 29733 peruana, donde hasta los ingresos económicos son dato sensible.

**Qué gana la universidad.** Un segundo radar de talento: los programas de prestigio filtran por promedio igual o mayor a 17 y tercio superior. Kampus ve lo que ese filtro no puede ver — quién enseña bien, quién lidera, quién sostiene un grupo.

**Orden de construcción.** Grupos y talleres → encuestas → consultas → habilidades. Se empieza por lo único que funciona con pocos usuarios.

---

## Guion del expositor — NO va en la slide

- El flujo 2 se construye primero porque es el único que da valor desde el primer día: un taller con horario sirve aunque haya 30 personas en la app. Los flujos 1 y 3 necesitan masa crítica.
- El supuesto más riesgoso de todo el proyecto es que el alumno de ciclos superiores acepte responder. Si no responde, el flujo 1 no existe y el flujo 3 se queda sin contenido. Por eso hay una tarea de validación dedicada (KMAP-62) antes de construirlo.
- Existe un prototipo navegable funcionando, con 420 estudiantes ficticios generados con las proporciones reales de las facultades de la UTP.
- La promesa de prácticas profesionales solo es real después de un acuerdo con la UTP. Hasta entonces, no prometerla en ninguna pantalla ni en la presentación.
