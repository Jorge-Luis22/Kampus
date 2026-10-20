# Kampus

**Kampus** es una idea de red social cerrada por universidad: solo entran alumnos reales de la misma universidad, verificados con su correo institucional. Sirve para conocer gente de otras carreras, preguntarle a alumnos de ciclos mayores, enterarse de eventos y conseguir encuestados para trabajos académicos. El piloto sería en una sede de la Universidad Tecnológica del Perú (UTP).

Es un proyecto de estudiantes para el curso **Gestión de la Innovación**.

> **Aviso.** Este es un proyecto académico de estudiantes. **No es un sitio oficial** de la Universidad Tecnológica del Perú. El nombre y el logo de la UTP pertenecen a la universidad; este repositorio **no incluye el logo**.

## Qué hay en este repositorio

Todavía **no hay una app de Kampus construida aquí**. Lo que hay es la investigación y la documentación del producto:

```
kampus/
├── README.md                       Este archivo
├── formulario/                     Encuesta de investigación para alumnos (web + Google Sheets)
│   ├── index.html                  El formulario (diseño, preguntas y envío)
│   ├── Code.gs                     Programa de Google Apps Script que guarda las respuestas
│   ├── README.md                   Guía paso a paso para conectarlo a tu propio Google Sheet
│   └── fuente/                     Código fuente, generador y pruebas
├── docs/                           Documentación del producto
│   ├── 01-contexto-del-proyecto.md           Qué es Kampus, el problema, reglas, alcance del MVP, pantallas y modelo de datos
│   ├── 02-spec-antigravity-y-stitch.md       Especificación del MVP: personas, espacios, puntaje, flujos, riesgos y métricas
│   ├── 03-prompts-google-stitch.md           Prompts listos para generar las pantallas en Google Stitch
│   ├── 04-prototipo-logica-y-flujos.md       Resumen de cómo funciona Kampus (insumo para una lámina)
│   └── preguntas-mejoradas.xlsx              Banco de preguntas con las mejoras y las apuestas que miden (versión previa al formulario final)
└── archivo/
    └── crear-formulario-google-forms-v1.gs   Primera versión de la encuesta (Google Forms, 24 preguntas). Ya no se usa
```

## La encuesta

Es un formulario de una pregunta por pantalla: **43 preguntas y 8 de seguimiento** (51 columnas de datos). Guarda cada respuesta como una fila en una hoja de Google Sheets, con confirmación real antes de mostrar el agradecimiento y sin duplicar filas si el alumno reintenta.

- **Para usarla:** sigue la guía de [`formulario/README.md`](formulario/README.md). Necesitas tu propia cuenta de Google; el formulario no trae ninguna URL ni clave.
- **Para modificarla:** las preguntas están en un solo archivo, [`formulario/fuente/src/schema.py`](formulario/fuente/src/schema.py). Ver [`formulario/fuente/LEEME.txt`](formulario/fuente/LEEME.txt).

**Estado de las pruebas.** El formulario y `Code.gs` se probaron con una simulación local de Google (pruebas del servidor y del navegador en `formulario/fuente/test/`). Antes de repartirla, cada persona que la despliegue debe hacer la prueba real del paso 7 de la guía.

## Privacidad

- Este repositorio **no contiene respuestas** de alumnos, ni la URL de ningún Web App, ni claves.
- Los textos de ejemplo de los documentos (nombres, correos) son inventados.
- La encuesta es anónima: no pide nombre ni correo.

## Licencia

Todavía no se eligió una licencia. Mientras no haya una, **todos los derechos quedan reservados** a sus autores. Si quieren que otras personas puedan reutilizar el código, elijan una en <https://choosealicense.com/>.
