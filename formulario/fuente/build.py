# -*- coding: utf-8 -*-
"""
Genera dist/index.html, dist/Code.gs y dist/README.md desde una sola fuente (src/schema.py).
Uso:  python3 build.py
"""
import json
import math
import pathlib
import sys

ROOT = pathlib.Path(__file__).parent
sys.path.insert(0, str(ROOT / "src"))
import schema as S  # noqa: E402


# --------------------------------------------------------------- JS de preguntas
def js_sections():
    rows = [json.dumps(dict(id=i, title=t, icon=ic), ensure_ascii=False) for i, t, ic in S.SECTIONS]
    return "const SECTIONS = [\n  " + ",\n  ".join(rows) + "\n];"


def js_questions():
    items = []
    for d in S.QUESTIONS:
        dd = {k: v for k, v in d.items() if k != "when"}
        s = json.dumps(dd, ensure_ascii=False)
        if "when" in d:
            s = s[:-1] + ', "when": () => ' + d["when"] + "}"
        items.append("  " + s)
    return "const QUESTIONS = [\n" + ",\n".join(items) + "\n];"


# --------------------------------------------------------------- esquema de Apps Script
def gs_schema():
    out = []
    for d in S.columns():
        t = S.sheet_type(d)
        e = {"key": d["key"], "header": S.column_header(d), "type": t}
        if t == "text":
            e["maxLen"] = d.get("maxLen", 160)
        if t == "number":
            e["min"] = d["min"]
            e["max"] = d["max"]
        if t in ("choice", "multi"):
            e["options"] = d["options"]
            e["other"] = d.get("other") or ""
        if t == "multi":
            e["maxChoices"] = d.get("maxChoices") or 0
        e["required"] = d["key"] in S.REQUIRED_ALWAYS
        out.append(e)
    return "const SCHEMA = " + json.dumps(out, ensure_ascii=False, indent=2) + ";"


# --------------------------------------------------------------- ilustraciones SVG
def network_svg():
    nodes = {  # id: (x, y, r, rojo?)
        1: (50, 230, 6, False), 2: (120, 130, 10, True), 3: (215, 200, 7, False),
        4: (300, 90, 6, False), 5: (370, 190, 11, True), 6: (200, 50, 5, False),
        7: (310, 265, 5, False), 8: (60, 60, 5, False),
    }
    edges = [(8, 2, 0), (1, 2, 1), (2, 3, 1), (3, 5, 1), (2, 6, 0), (6, 4, 0),
             (3, 4, 0), (4, 5, 0), (3, 7, 0), (5, 7, 0), (1, 3, 0)]
    parts = ['<svg class="net" viewBox="0 0 420 300" role="img" aria-label="Ilustración: alumnos de distintas carreras conectados entre sí">']
    for i, (a, b, hl) in enumerate(edges):
        (x1, y1, *_), (x2, y2, *_) = nodes[a], nodes[b]
        cls = "edge hl" if hl else "edge"
        parts.append(f'<path class="{cls}" d="M{x1} {y1}L{x2} {y2}" pathLength="1" style="--i:{i}"/>')
    for i, (nid, (x, y, r, red)) in enumerate(nodes.items()):
        cls = "node hl" if red else "node"
        parts.append(f'<circle class="{cls}" cx="{x}" cy="{y}" r="{r}" style="--i:{len(edges) + i - 3}"/>')
    parts.append("</svg>")
    return "".join(parts)


def done_svg():
    parts = ['<svg class="done-svg" viewBox="0 0 200 200" aria-hidden="true">']
    for i in range(6):
        a = math.radians(60 * i)
        x1, y1 = 100 + 50 * math.cos(a), 100 + 50 * math.sin(a)
        x2, y2 = 100 + 74 * math.cos(a), 100 + 74 * math.sin(a)
        parts.append(f'<path class="spoke" d="M{x1:.1f} {y1:.1f}L{x2:.1f} {y2:.1f}" pathLength="1" style="--i:{i}"/>')
    for i in range(6):
        a = math.radians(60 * i)
        x, y = 100 + 82 * math.cos(a), 100 + 82 * math.sin(a)
        parts.append(f'<circle class="sat" cx="{x:.1f}" cy="{y:.1f}" r="7" style="--i:{i}"/>')
    parts.append('<circle class="core" cx="100" cy="100" r="46"/>')
    parts.append('<path class="tick" d="M80 101L94 115L121 85" pathLength="1"/>')
    parts.append("</svg>")
    return "".join(parts)


# --------------------------------------------------------------- tablas del README
def col_letter(n):
    s = ""
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def readme_columns():
    meta = ["ID de respuesta", "Fecha y hora (Lima)", "Estado", "Duración (segundos)", "Versión del formulario"]
    rows = ["| Columna | Encabezado en la hoja | Clave interna | Tipo |", "|---|---|---|---|"]
    n = 1
    for h in meta:
        rows.append(f"| {col_letter(n)} | {h} | (automática) | sistema |")
        n += 1
    tipos = {"text": "texto", "number": "número", "choice": "una opción", "multi": "varias opciones"}
    for d in S.columns():
        rows.append(f"| {col_letter(n)} | {S.column_header(d)} | `{d['key']}` | {tipos[S.sheet_type(d)]} |")
        n += 1
    return "\n".join(rows), n - 1


def readme_logic():
    rows = ["| Pregunta | Se muestra solo si |", "|---|---|"]
    human = {
        "p08_como_lo_conociste": "en P07 respondió algo distinto de «Nunca» y «No recuerdo»",
        "p09_whatsapp_ciclos_anteriores": "el ciclo (P02) es 2 o más",
        "p10b_cual_era_la_duda": "en P10 escribió algo distinto de «No me ha pasado»",
        "p11b_lo_conocia_y_que_pregunto": "en P11 no respondió «Nunca»",
        "p15_actividad_con_esa_persona": "en P14 respondió «Sí»",
        "p16_ayuda_pedida_por_menores": "el ciclo (P02) es 5 o más (sección «Ayuda entre ciclos»)",
        "p16b_amigo_o_desconocido": "ciclo 5 o más y en P16 puso más de 0",
        "p18_perfil_especifico": "en P17 puso más de 0",
        "p18b_que_perfil_y_que_hizo": "en P18 respondió «Sí»",
        "p19_como_consiguio_encuestados": "en P17 puso más de 0",
        "p20_como_le_fue_con_respuestas": "en P17 puso más de 0",
        "p21_que_hizo_si_no_llegaba": "en P17 puso más de 0 y en P20 no marcó «Sin problema»",
        "p27b_por_que_no": "en P27 respondió «No»",
        "p29_que_eventos": "en P28 puso más de 0",
        "p30_como_se_entero_evento": "en P28 puso más de 0",
        "p31b_tipo_conferencias_concursos": "en P31 marcó «Conferencias» o «Concursos»",
        "p34b_por_que_no_linkedin": "en P34 marcó «Sí, pero casi nunca entro» o «No tengo»",
        "p35b_cual_app": "en P35 respondió «Sí»",
    }
    for d in S.QUESTIONS:
        if d["key"] in human:
            rows.append(f"| {S.number_of(d['key'])} - {d['label']} | {human[d['key']]} |")
    missing = [d["key"] for d in S.QUESTIONS if d.get("when") and d["key"] not in human]
    assert not missing, missing
    return "\n".join(rows)


# --------------------------------------------------------------- armado
def main():
    tpl = (ROOT / "src" / "index.template.html").read_text(encoding="utf-8")
    html = (tpl.replace("/*__SECTIONS__*/", js_sections())
               .replace("/*__QUESTIONS__*/", js_questions())
               .replace("<!--__NET__-->", network_svg())
               .replace("<!--__DONE_SVG__-->", done_svg()))
    for ph in ("/*__SECTIONS__*/", "/*__QUESTIONS__*/", "<!--__NET__-->", "<!--__DONE_SVG__-->"):
        assert ph not in html, "placeholder sin reemplazar: " + ph
    (ROOT / "dist").mkdir(exist_ok=True)
    (ROOT / "dist" / "index.html").write_text(html, encoding="utf-8")

    gs = (ROOT / "src" / "Code.template.gs").read_text(encoding="utf-8").replace("/*__SCHEMA__*/", gs_schema())
    (ROOT / "dist" / "Code.gs").write_text(gs, encoding="utf-8")

    rd = (ROOT / "src" / "README.template.md").read_text(encoding="utf-8")
    table, ncols = readme_columns()
    rd = (rd.replace("<!--COLUMNAS-->", table).replace("<!--NCOLS-->", str(ncols))
            .replace("<!--LOGICA-->", readme_logic()))
    (ROOT / "dist" / "README.md").write_text(rd, encoding="utf-8")
    print("ok:", len(S.QUESTIONS), "pasos;", len(S.columns()), "columnas de pregunta;", ncols, "columnas en total")


if __name__ == "__main__":
    main()
