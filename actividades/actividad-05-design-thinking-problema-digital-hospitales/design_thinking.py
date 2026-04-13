"""
design_thinking.py — Actividad 5: Design Thinking · Hospital Nazareth 1
Barranquilla, Colombia · Datos reales 2018

Estrategia: genera HTML+CSS → captura PNG de alta resolución con Playwright/Chromium.
Resultado: imágenes de calidad de presentación profesional (~1920px de ancho, 2x DPR).

Artefactos generados:
  1. mapa_empatia.png
  2. journey_map.png
  3. reto_innovacion.png
  4. resumen_design_thinking.png

Ejecutar:
    python design_thinking.py
Requiere:
    pip install playwright
    python -m playwright install chromium
"""

from __future__ import annotations
import os, sys, textwrap

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright

DIR = os.path.dirname(os.path.abspath(__file__))

# ─────────────────────────────────────────────────────────────────────────────
# Datos · Hospital Nazareth 1 · 2018
# ─────────────────────────────────────────────────────────────────────────────
CONSUMO_MENSUAL = {
    "Enero": 40521, "Febrero": 36748, "Marzo": 39210,
    "Abril": 38654, "Mayo": 41320, "Junio": 39870,
    "Julio": 38540, "Agosto": 40110, "Septiembre": 39650,
    "Octubre": 41780, "Noviembre": 38920,
}
CONSUMO_ANUAL   = sum(CONSUMO_MENSUAL.values())
COSTO_ANUAL     = CONSUMO_ANUAL * 650 / 1e6     # M COP
SOLAR_PCT       = 28.4

# ─────────────────────────────────────────────────────────────────────────────
# CSS base compartido por todas las láminas
# ─────────────────────────────────────────────────────────────────────────────
BASE_CSS = """
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif;
  background: #f1f5f9;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
}

/* ── Tokens de color ── */
:root {
  --azul:    #1a3a5c;
  --azul2:   #2563eb;
  --cyan:    #0ea5e9;
  --verde:   #22c55e;
  --verde-d: #166534;
  --naranja: #f97316;
  --rojo:    #ef4444;
  --rojo-d:  #991b1b;
  --amarillo:#f59e0b;
  --gris-bg: #f1f5f9;
  --gris-c:  #ffffff;
  --gris-tx: #475569;
  --gris-sm: #64748b;
  --negro:   #0f172a;
}

/* ── Tipografía ── */
h1 { font-size: 26px; font-weight: 700; color: var(--azul); }
h2 { font-size: 18px; font-weight: 600; color: var(--azul); }
h3 { font-size: 14px; font-weight: 600; }
p, li { font-size: 13px; line-height: 1.55; color: var(--gris-tx); }
small { font-size: 11px; color: var(--gris-sm); }

/* ── Componentes genéricos ── */
.page {
  width: 1920px;
  padding: 0 0 32px 0;
}
.page-header {
  background: var(--azul);
  padding: 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.page-header h1 { color: #fff; font-size: 24px; }
.page-header p  { color: #94a3b8; font-size: 13px; }

.card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,.07);
}
.card-header {
  padding: 14px 20px;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
}
.card-body { padding: 16px 20px; }

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

ul.bullets { list-style: none; padding: 0; }
ul.bullets li { padding: 3px 0 3px 16px; position: relative; font-size: 13px; }
ul.bullets li::before {
  content: '•';
  position: absolute;
  left: 0;
  font-weight: 700;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  margin-bottom: 8px;
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# Utilidad: render HTML → PNG
# ─────────────────────────────────────────────────────────────────────────────
def render_html_to_png(html: str, out_path: str, width: int = 1920) -> None:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page    = browser.new_page(viewport={"width": width, "height": 900},
                                   device_scale_factor=2)
        page.set_content(html, wait_until="networkidle")
        # Ajuste automático de altura al contenido real
        height = page.evaluate("() => document.documentElement.scrollHeight")
        page.set_viewport_size({"width": width, "height": height})
        page.screenshot(path=out_path, full_page=True)
        browser.close()
    print(f"[OK] {os.path.basename(out_path)} -> {out_path}")


# ═════════════════════════════════════════════════════════════════════════════
# 1. MAPA DE EMPATÍA
# ═════════════════════════════════════════════════════════════════════════════
PERFILES = [
    {
        "nombre": "Jefe de Mantenimiento",
        "color":  "#1a3a5c",
        "light":  "#e8f0fe",
        "piensa": [
            "¿Cuánto consume cada área en este turno?",
            "¿Cuándo puede fallar el suministro eléctrico?",
            "¿El sistema solar realmente justifica la inversión?",
        ],
        "siente": [
            "Frustración ante cortes eléctricos imprevistos",
            "Presión constante por reducir la factura energética",
            "Incertidumbre al operar sin datos en tiempo real",
        ],
        "hace": [
            "Revisa facturas mensuales impresas en papel",
            "Llama a operadores para consultar el consumo",
            "Registra incidencias en planillas Excel sin automatizar",
        ],
        "dice": [
            "«No sé cuánto genera el sistema solar hoy»",
            "«Los datos llegan con semanas de retraso»",
            "«Necesito alertas automáticas urgentemente»",
        ],
        "dolor":   "Ausencia de visibilidad en tiempo real del balance generación–consumo",
        "ganancia":"Panel único con KPIs energéticos en vivo y alertas automáticas por umbral",
    },
    {
        "nombre": "Gerente Administrativo",
        "color":  "#0ea5e9",
        "light":  "#e0f2fe",
        "piensa": [
            "¿Cuál es el ROI real del sistema solar instalado?",
            "¿Podemos renegociar la tarifa eléctrica contratada?",
            "¿Cómo presento los ahorros ante la junta directiva?",
        ],
        "siente": [
            "Ansiedad ante un presupuesto energético sin control",
            "Desconfianza en los reportes elaborados manualmente",
            "Orgullo cuando el hospital logra metas de sostenibilidad",
        ],
        "hace": [
            "Consolida reportes de múltiples sistemas distintos",
            "Solicita informes periódicos al área de mantenimiento",
            "Compara tarifas energéticas con otras instituciones",
        ],
        "dice": [
            "«Necesito el ahorro expresado en pesos, no en kWh»",
            "«¿Cuánto ahorramos respecto al año anterior?»",
            "«El informe debe ser comprensible para no técnicos»",
        ],
        "dolor":   "Reportes energéticos dispersos y sin proyección financiera del solar",
        "ganancia":"Dashboard financiero con ahorro acumulado y proyección de ROI multiperiodo",
    },
    {
        "nombre": "Jefe UCI / Quirófanos",
        "color":  "#ef4444",
        "light":  "#fef2f2",
        "piensa": [
            "¿Habrá suministro garantizado durante la cirugía?",
            "¿El sistema de respaldo cubre una falla prolongada?",
            "¿Es posible reducir consumo sin comprometer pacientes?",
        ],
        "siente": [
            "Miedo real ante un corte eléctrico en área crítica",
            "Confianza solo cuando la redundancia está validada",
            "Estrés elevado por variables completamente fuera de su control",
        ],
        "hace": [
            "Verifica UPS y plantas de emergencia antes de cada cirugía",
            "Reporta cualquier anomalía eléctrica a mantenimiento",
            "Coordina turnos del personal según disponibilidad energética",
        ],
        "dice": [
            "«La energía en UCI no puede fallar bajo ningún escenario»",
            "«¿El sistema solar cubre UCI en una emergencia nocturna?»",
            "«Avísenme con anticipación ante cualquier corte planeado»",
        ],
        "dolor":   "Desconoce si el sistema solar garantiza continuidad en áreas clínicas críticas",
        "ganancia":"Semáforo de disponibilidad energética por área crítica con protocolo integrado",
    },
    {
        "nombre": "Técnico de Planta Solar",
        "color":  "#f59e0b",
        "light":  "#fffbeb",
        "piensa": [
            "¿Qué panel fotovoltaico está rindiendo menos hoy?",
            "¿Cuándo es el momento óptimo para el mantenimiento?",
            "¿El inversor está operando dentro de parámetros normales?",
        ],
        "siente": [
            "Motivación cuando puede ver la generación en tiempo real",
            "Frustración total al no tener herramientas de diagnóstico",
            "Satisfacción profesional al optimizar el rendimiento del sistema",
        ],
        "hace": [
            "Inspecciona físicamente los paneles de forma visual",
            "Registra lecturas del inversor a mano en una libreta",
            "Realiza limpiezas sin planificación basada en datos reales",
        ],
        "dice": [
            "«No tengo ninguna app para monitorear la generación»",
            "«Todo lo registro manualmente; puede haber errores»",
            "«Necesito históricos de rendimiento para predecir fallos»",
        ],
        "dolor":   "Opera sin datos digitales; el diagnóstico de fallas solares es siempre tardío",
        "ganancia":"App móvil con telemetría solar en tiempo real y alertas de mantenimiento predictivo",
    },
]

def html_mapa_empatia() -> str:
    col_cards = ""
    for p in PERFILES:
        c  = p["color"]
        bg = p["light"]

        def quad(titulo, icono, items, border_color=c):
            lis = "".join(f"<li>{it}</li>" for it in items)
            return f"""
            <div class="quad">
              <div class="quad-title" style="color:{border_color}">
                <span class="quad-icon">{icono}</span>{titulo}
              </div>
              <ul class="bullets">{lis}</ul>
            </div>"""

        col_cards += f"""
        <div class="profile-col">
          <div class="profile-header" style="background:{c}">
            <div class="profile-name">{p["nombre"]}</div>
          </div>
          <div class="quads-grid">
            {quad("Piensa & Cree", "💭", p["piensa"])}
            {quad("Siente",        "❤️", p["siente"])}
            {quad("Hace",          "🤝", p["hace"])}
            {quad("Dice & Escucha","💬", p["dice"])}
          </div>
          <div class="pain-gain">
            <div class="pain-box">
              <div class="pg-label" style="color:#991b1b">⚡ Punto de dolor</div>
              <p>{p["dolor"]}</p>
            </div>
            <div class="gain-box">
              <div class="pg-label" style="color:#166534">✅ Ganancia esperada</div>
              <p>{p["ganancia"]}</p>
            </div>
          </div>
        </div>"""

    return f"""<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8">
<style>
{BASE_CSS}

.page {{ width:1920px; }}

.page-header {{ background: var(--azul); padding:28px 48px; }}
.page-header h1 {{ color:#fff; font-size:26px; }}
.page-header p  {{ color:#94a3b8; font-size:13px; margin-top:4px; }}

.profiles-grid {{
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 24px 32px;
}}

.profile-col {{
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0,0,0,.09);
  display: flex;
  flex-direction: column;
}}

.profile-header {{
  padding: 18px 20px;
  color: #fff;
}}
.profile-name {{
  font-size: 17px;
  font-weight: 700;
  letter-spacing: .01em;
}}

.quads-grid {{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #e2e8f0;
  flex: 1;
}}

.quad {{
  background: #fff;
  padding: 16px 18px;
}}
.quad-title {{
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}}
.quad-icon {{ font-size: 15px; }}

.quad ul.bullets li {{ font-size: 12.5px; color: #374151; }}
.quad ul.bullets li::before {{ color: #9ca3af; }}

.pain-gain {{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #e2e8f0;
}}

.pain-box {{
  background: #fef2f2;
  padding: 14px 18px;
}}
.gain-box {{
  background: #f0fdf4;
  padding: 14px 18px;
}}
.pg-label {{
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-bottom: 6px;
}}
.pain-box p, .gain-box p {{
  font-size: 12.5px;
  line-height: 1.5;
  color: #374151;
}}
</style>
</head>
<body>
<div class="page">
  <div class="page-header">
    <h1>Mapa de Empatía — Hospital Nazareth 1</h1>
    <p>Actividad 5 · Design Thinking · 4 perfiles de usuario clave en la gestión energética hospitalaria</p>
  </div>
  <div class="profiles-grid">{col_cards}</div>
</div>
</body></html>"""


# ═════════════════════════════════════════════════════════════════════════════
# 2. JOURNEY MAP
# ═════════════════════════════════════════════════════════════════════════════
ETAPAS = [
    {
        "etapa":       "Inicio de turno\n6:00 AM",
        "accion":      "Revisar el estado global del sistema eléctrico y solar",
        "herramienta": "Correo y Excel del turno anterior",
        "emocion":     2,
        "dolor":       "No hay datos disponibles en tiempo real al comenzar el turno",
        "oportunidad": "Dashboard automático de apertura de turno con KPIs del día",
    },
    {
        "etapa":       "Monitoreo\nmatutino",
        "accion":      "Verificar el consumo eléctrico por área del hospital",
        "herramienta": "Medidores físicos y llamadas telefónicas internas",
        "emocion":     2,
        "dolor":       "Datos obtenidos manualmente con alto riesgo de error humano",
        "oportunidad": "Lectura automática continua mediante sensores IoT conectados",
    },
    {
        "etapa":       "Alerta de\nconsumo alto",
        "accion":      "Investigar el área que está generando el pico de consumo",
        "herramienta": "Llamadas internas y recorrido físico por el hospital",
        "emocion":     1,
        "dolor":       "Detección tardía del pico; no existen alertas push automáticas",
        "oportunidad": "Notificaciones automáticas por umbral configurable por área",
    },
    {
        "etapa":       "Generación\nsolar 9–15h",
        "accion":      "Verificar el aporte solar al suministro eléctrico del hospital",
        "herramienta": "Inversor físico sin ninguna interfaz digital disponible",
        "emocion":     3,
        "dolor":       "Imposible correlacionar generación solar con consumo en tiempo real",
        "oportunidad": "Balance solar vs. consumo en tiempo real en el dashboard central",
    },
    {
        "etapa":       "Reporte\nmensual",
        "accion":      "Elaborar el informe energético para la gerencia administrativa",
        "herramienta": "Excel + capturas manuales de medidores físicos",
        "emocion":     1,
        "dolor":       "El proceso toma más de 8 horas y es propenso a errores de cálculo",
        "oportunidad": "Generación automática de reporte PDF/XLSX con un solo clic",
    },
    {
        "etapa":       "Planificación\nmantenimiento",
        "accion":      "Programar limpieza y revisión preventiva de los paneles solares",
        "herramienta": "Calendario en papel e intuición basada en experiencia",
        "emocion":     2,
        "dolor":       "Sin datos históricos de rendimiento para fundamentar la decisión",
        "oportunidad": "Mantenimiento predictivo basado en curvas de generación con ML",
    },
    {
        "etapa":       "Cierre de turno\n6:00 PM",
        "accion":      "Transferir el estado del sistema al turno de noche",
        "herramienta": "Planilla manual y entrega verbal de novedades",
        "emocion":     2,
        "dolor":       "Información incompleta o perdida en la transferencia de turno",
        "oportunidad": "Log digital automático de turno con resumen de eventos del día",
    },
]

EMO = {
    1: {"label": "Frustrado",    "color": "#ef4444", "bg": "#fef2f2", "num": "1"},
    2: {"label": "Neutral",      "color": "#f59e0b", "bg": "#fffbeb", "num": "2"},
    3: {"label": "Satisfecho",   "color": "#22c55e", "bg": "#f0fdf4", "num": "3"},
}

FILAS_DEF = [
    ("etapa",       "ETAPA",               "#1a3a5c"),
    ("accion",      "ACCIÓN",              "#0ea5e9"),
    ("herramienta", "HERRAMIENTA ACTUAL",  "#7c3aed"),
    (None,          "EMOCIÓN",             "#0f172a"),
    ("oportunidad", "OPORTUNIDAD DIGITAL", "#22c55e"),
    ("dolor",       "PUNTO DE DOLOR",      "#ef4444"),
]

def html_journey_map() -> str:
    n = len(ETAPAS)
    col_w = f"calc((1920px - 200px - {(n-1)*12}px) / {n})"

    rows_html = ""
    for data_key, row_label, row_color in FILAS_DEF:
        cells = ""
        for i, etapa in enumerate(ETAPAS):
            if data_key is None:  # Fila emociones
                e   = EMO[etapa["emocion"]]
                ec  = e["color"]
                ebg = e["bg"]
                prev_e = ETAPAS[i-1]["emocion"] if i > 0 else etapa["emocion"]
                diff   = etapa["emocion"] - prev_e
                trend  = ("▲" if diff > 0 else ("▼" if diff < 0 else "—"))
                tc     = "#22c55e" if diff > 0 else ("#ef4444" if diff < 0 else "#94a3b8")
                cells += f"""
                <div class="jcell emo-cell" style="background:{ebg}">
                  <div class="emo-circle" style="background:{ec};color:#fff">{e["num"]}</div>
                  <div class="emo-label"  style="color:{ec}">{e["label"]}</div>
                  <div class="emo-trend"  style="color:{tc}">{trend}</div>
                </div>"""
            elif data_key == "oportunidad":
                cells += f"""
                <div class="jcell opp-cell">
                  <p>{etapa[data_key]}</p>
                </div>"""
            elif data_key == "dolor":
                cells += f"""
                <div class="jcell pain-cell">
                  <p>{etapa[data_key]}</p>
                </div>"""
            else:
                txt = etapa[data_key].replace("\n","<br>")
                bold = "font-weight:600;" if data_key == "etapa" else ""
                cells += f"""
                <div class="jcell" style="{bold}">
                  <p style="{bold}">{txt}</p>
                </div>"""

        rows_html += f"""
        <div class="jrow">
          <div class="jrow-label" style="background:{row_color}">{row_label}</div>
          <div class="jrow-cells">{cells}</div>
        </div>"""

    return f"""<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8">
<style>
{BASE_CSS}

.page {{ width:1920px; }}

.page-header {{ background: var(--azul); padding:28px 48px; }}
.page-header h1 {{ color:#fff; font-size:26px; }}
.page-header p  {{ color:#94a3b8; font-size:13px; margin-top:4px; }}

.journey-wrap {{ padding: 24px 28px; display: flex; flex-direction: column; gap: 10px; }}

.jrow {{
  display: flex;
  align-items: stretch;
  gap: 10px;
  min-height: 90px;
}}

.jrow-label {{
  width: 168px;
  min-width: 168px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  line-height: 1.4;
  padding: 12px 10px;
}}

.jrow-cells {{
  display: grid;
  grid-template-columns: repeat({n}, 1fr);
  gap: 10px;
  flex: 1;
}}

.jcell {{
  background: #fff;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  font-size: 12.5px;
  color: #374151;
  line-height: 1.5;
}}
.jcell p {{ font-size:12.5px; color:#374151; line-height:1.5; margin:0; }}

.emo-cell {{
  align-items: center;
  gap: 8px;
}}
.emo-circle {{
  width: 42px; height: 42px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700;
}}
.emo-label {{ font-size: 12px; font-weight: 700; }}
.emo-trend {{ font-size: 18px; margin-top: 2px; font-weight: 700; }}

.opp-cell {{
  background: #f0fdf4;
  border-left: 4px solid #22c55e;
}}
.opp-cell p {{ color: #166534; font-weight: 500; }}

.pain-cell {{
  background: #fef2f2;
  border-left: 4px solid #ef4444;
}}
.pain-cell p {{ color: #991b1b; }}
</style>
</head>
<body>
<div class="page">
  <div class="page-header">
    <h1>Journey Map — Jefe de Mantenimiento · Hospital Nazareth 1</h1>
    <p>Actividad 5 · Design Thinking · 7 momentos críticos del día operativo de gestión energética</p>
  </div>
  <div class="journey-wrap">{rows_html}</div>
</div>
</body></html>"""


# ═════════════════════════════════════════════════════════════════════════════
# 3. RETO DE INNOVACIÓN
# ═════════════════════════════════════════════════════════════════════════════
DOLORES = [
    ("Sin monitoreo en tiempo real",                  9.5, "#ef4444"),
    ("Reportes manuales propensos a error",            8.8, "#f97316"),
    ("Sin alertas automáticas de consumo",             8.2, "#f97316"),
    ("Diagnóstico tardío de fallas solares",           7.5, "#f59e0b"),
    ("Sin correlación generación–consumo",             7.0, "#f59e0b"),
    ("Decisiones gerenciales sin datos confiables",    6.3, "#0ea5e9"),
]

RETOS = [
    {
        "num": "01",
        "titulo": "Plataforma de monitoreo en tiempo real",
        "desc": "Dashboard web y móvil con lectura IoT de medidores, balance solar vs. consumo por área y alertas push configurables por umbral.",
        "items": ["Lectura IoT de medidores en tiempo real", "Balance solar vs. consumo por área", "Alertas push por umbral configurable"],
        "tag":   "IoT · Dashboard",
        "color": "#0ea5e9",
        "bg":    "#e0f2fe",
    },
    {
        "num": "02",
        "titulo": "Motor de reportes automáticos",
        "desc": "Generación automática de informes mensuales en PDF y Excel con KPIs financieros, ambientales y proyección de ROI del sistema solar.",
        "items": ["Informe mensual PDF/XLSX automático", "KPIs financieros y ahorro en COP", "Proyección de ROI para gerencia"],
        "tag":   "Reportes · BI",
        "color": "#22c55e",
        "bg":    "#f0fdf4",
    },
    {
        "num": "03",
        "titulo": "Semáforo de criticidad energética",
        "desc": "Indicador visual de disponibilidad por área crítica (UCI, Quirófanos, HVAC) con umbrales configurables y protocolo de contingencia integrado.",
        "items": ["Semáforo visual: UCI, Quirófanos, HVAC", "Umbral de alerta configurable por área", "Protocolo de contingencia integrado"],
        "tag":   "Seguridad · Alertas",
        "color": "#f97316",
        "bg":    "#fff7ed",
    },
    {
        "num": "04",
        "titulo": "Mantenimiento predictivo solar",
        "desc": "Análisis de curvas de generación para detectar paneles fotovoltaicos degradados y programar automáticamente limpiezas en el momento óptimo.",
        "items": ["Análisis de curvas de generación solar", "Detección de paneles degradados", "Programación óptima de limpieza con ML"],
        "tag":   "ML · Predicción",
        "color": "#f59e0b",
        "bg":    "#fffbeb",
    },
]

def html_reto_innovacion() -> str:
    kpis_html = ""
    for lbl, val, col in [
        ("Consumo anual",   f"{CONSUMO_ANUAL:,.0f} kWh", "#1a3a5c"),
        ("Costo anual",     f"${COSTO_ANUAL:,.1f} M COP","#2563eb"),
        ("Cobertura solar", f"{SOLAR_PCT}%",              "#0ea5e9"),
        ("Área pico",       "HVAC 27%",                   "#f97316"),
        ("Áreas críticas",  "UCI + Qx 42%",               "#ef4444"),
        ("Meses pico",      "May · Oct · Ago",            "#f59e0b"),
    ]:
        kpis_html += f"""
        <div class="kpi-card" style="background:{col}">
          <div class="kpi-val">{val}</div>
          <div class="kpi-lbl">{lbl}</div>
        </div>"""

    dolores_html = ""
    for txt, impacto, col in DOLORES:
        pct = int(impacto / 10 * 100)
        dolores_html += f"""
        <div class="dolor-row">
          <div class="dolor-bar-wrap">
            <div class="dolor-bar" style="width:{pct}%;background:{col}22;border:1.5px solid {col};">
              <span class="dolor-txt">{txt}</span>
            </div>
          </div>
          <div class="dolor-score" style="color:{col}">{impacto}</div>
        </div>"""

    retos_html = ""
    for r in RETOS:
        items_html = "".join(f"<li>{it}</li>" for it in r["items"])
        retos_html += f"""
        <div class="reto-card" style="border-top: 5px solid {r['color']}">
          <div class="reto-num" style="color:{r['color']}">{r["num"]}</div>
          <div class="reto-titulo" style="color:{r['color']}">{r["titulo"]}</div>
          <p class="reto-desc">{r["desc"]}</p>
          <ul class="bullets reto-items">{items_html}</ul>
          <div class="reto-tag" style="background:{r['bg']};color:{r['color']};border:1px solid {r['color']}55">{r["tag"]}</div>
        </div>"""

    return f"""<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8">
<style>
{BASE_CSS}

.page {{ width:1920px; }}

.page-header {{ background: var(--azul); padding:28px 48px; }}
.page-header h1 {{ color:#fff; font-size:26px; }}
.page-header p  {{ color:#94a3b8; font-size:13px; margin-top:4px; }}

.content {{ padding: 24px 32px; display: flex; flex-direction: column; gap: 24px; }}

/* KPIs */
.kpis-row {{
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}}
.kpi-card {{
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
}}
.kpi-val {{ font-size: 22px; font-weight: 800; color: #fff; }}
.kpi-lbl {{ font-size: 12px; color: rgba(255,255,255,.75); margin-top: 6px; }}

/* Panel 2 columnas */
.mid-row {{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}}
.panel {{
  background: #fff;
  border-radius: 14px;
  padding: 24px 28px;
  box-shadow: 0 2px 8px rgba(0,0,0,.07);
}}
.panel h2 {{ font-size:16px; margin-bottom: 18px; color: var(--azul); }}

/* Dolores */
.dolor-row {{
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}}
.dolor-bar-wrap {{ flex: 1; }}
.dolor-bar {{
  min-width: 40px;
  padding: 8px 14px;
  border-radius: 6px;
  display: flex;
  align-items: center;
}}
.dolor-txt {{ font-size: 13px; color: #1e293b; white-space: nowrap; }}
.dolor-score {{ font-size: 16px; font-weight: 800; width: 32px; text-align: right; }}

/* HMW */
.hmw-box {{
  border: 2px solid var(--azul);
  border-radius: 12px;
  background: #f8fafc;
  padding: 24px 28px;
  text-align: center;
}}
.hmw-label {{
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--azul2);
  margin-bottom: 14px;
}}
.hmw-text {{
  font-size: 16px;
  font-weight: 600;
  color: var(--azul);
  line-height: 1.7;
}}
.hmw-data {{
  margin-top: 16px;
  padding: 10px 20px;
  background: var(--azul);
  border-radius: 8px;
  display: inline-block;
  color: #94a3b8;
  font-size: 12px;
}}
.hmw-data strong {{ color: var(--cyan); }}

/* Retos */
.retos-row {{
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}}
.reto-card {{
  background: #fff;
  border-radius: 12px;
  padding: 22px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,.07);
  display: flex;
  flex-direction: column;
  gap: 10px;
}}
.reto-num {{ font-size: 28px; font-weight: 800; opacity: .35; line-height: 1; }}
.reto-titulo {{ font-size: 15px; font-weight: 700; line-height: 1.3; }}
.reto-desc {{ font-size: 12.5px; color: var(--gris-tx); line-height: 1.55; }}
.reto-items {{ margin-top: 4px; }}
.reto-items li {{ font-size: 12.5px; color: #374151; }}
.reto-tag {{
  margin-top: auto;
  align-self: flex-start;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}}
</style>
</head>
<body>
<div class="page">
  <div class="page-header">
    <h1>Reto de Innovación — Hospital Nazareth 1 · Actividad 5</h1>
    <p>Declaración del problema ¿Cómo podríamos? · Puntos de dolor priorizados · 4 retos de innovación digital</p>
  </div>
  <div class="content">

    <div class="kpis-row">{kpis_html}</div>

    <div class="mid-row">
      <div class="panel">
        <h2>⚡ Puntos de dolor — Impacto (escala 1–10)</h2>
        {dolores_html}
      </div>
      <div class="panel" style="display:flex;flex-direction:column;justify-content:center;gap:0">
        <div class="hmw-box">
          <div class="hmw-label">¿ Cómo Podríamos ? — Declaración del problema</div>
          <div class="hmw-text">
            …brindar al personal del Hospital Nazareth 1<br>
            <strong>visibilidad en tiempo real del balance entre<br>
            generación solar y consumo eléctrico por área,</strong><br>
            para que puedan tomar decisiones proactivas<br>
            que <strong>reduzcan costos</strong> y garanticen la<br>
            <strong>continuidad energética en servicios críticos?</strong>
          </div>
          <div class="hmw-data">
            Datos reales 2018 &nbsp;·&nbsp;
            <strong>{CONSUMO_ANUAL:,.0f} kWh</strong> &nbsp;·&nbsp;
            <strong>${COSTO_ANUAL:,.1f} M COP</strong> &nbsp;·&nbsp;
            <strong>{SOLAR_PCT}% solar</strong>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h2 style="margin-bottom:16px">🚀 4 Retos de Innovación Digital</h2>
      <div class="retos-row">{retos_html}</div>
    </div>

  </div>
</div>
</body></html>"""


# ═════════════════════════════════════════════════════════════════════════════
# 4. RESUMEN EJECUTIVO
# ═════════════════════════════════════════════════════════════════════════════
ETAPAS_DT = [
    {
        "num": "01", "nombre": "EMPATIZAR", "color": "#0ea5e9", "bg": "#e0f2fe",
        "kpi": "4 perfiles",
        "items": [
            "Jefe de Mantenimiento",
            "Gerente Administrativo",
            "Jefe UCI / Quirófanos",
            "Técnico de Planta Solar",
            "Mapa de empatía completo",
        ],
    },
    {
        "num": "02", "nombre": "DEFINIR", "color": "#2563eb", "bg": "#eff6ff",
        "kpi": "6 dolores",
        "items": [
            "Problema central identificado",
            "6 puntos de dolor priorizados",
            "Impacto máximo: 9.5 / 10",
            "Declaración HMW formulada",
            "Validada con datos reales 2018",
        ],
    },
    {
        "num": "03", "nombre": "IDEAR", "color": "#f59e0b", "bg": "#fffbeb",
        "kpi": "4 ideas",
        "items": [
            "Journey Map: 7 momentos del día",
            "Monitoreo IoT en tiempo real",
            "Reportes automáticos PDF/XLSX",
            "Semáforo de criticidad UCI/Qx",
            "Mantenimiento predictivo ML",
        ],
    },
    {
        "num": "04", "nombre": "PROTOTIPAR", "color": "#f97316", "bg": "#fff7ed",
        "kpi": "4 prototipos",
        "items": [
            "Dashboard gerencial web",
            "App móvil técnico solar",
            "Semáforo de áreas críticas",
            "Motor de reportes automático",
            "Wireframes de todas las vistas",
        ],
    },
    {
        "num": "05", "nombre": "EVALUAR", "color": "#22c55e", "bg": "#f0fdf4",
        "kpi": "5 métricas",
        "items": [
            "Reportes: 8 h → menos de 30 min",
            "Detección de picos: menos de 5 min",
            "Reducción de costo energético: −15%",
            "ROI calculado con datos en tiempo real",
            "UCI/Qx: 99.9% disponibilidad garantizada",
        ],
    },
]

def html_resumen_ejecutivo() -> str:
    cards_html = ""
    for i, e in enumerate(ETAPAS_DT):
        arrow = f'<div class="arrow" style="color:{e["color"]}">→</div>' if i < 4 else ""
        items_html = "".join(f"<li>{it}</li>" for it in e["items"])
        cards_html += f"""
        <div class="stage-wrap">
          <div class="stage-card" style="border-top:5px solid {e['color']}">
            <div class="stage-header" style="background:{e['bg']}">
              <span class="stage-num" style="color:{e['color']}">{e["num"]}</span>
              <span class="stage-name" style="color:{e['color']}">{e["nombre"]}</span>
              <span class="stage-kpi" style="background:{e['color']}22;color:{e['color']};border:1px solid {e['color']}55">{e["kpi"]}</span>
            </div>
            <div class="stage-body">
              <ul class="bullets">{items_html}</ul>
            </div>
          </div>
          {arrow}
        </div>"""

    metricas = [
        ("⏱", "Elaboración de reportes", "de 8 h", "a menos de 30 min"),
        ("🔔", "Detección de picos",      "recorrido físico", "menos de 5 min"),
        ("💰", "Reducción costo energético","línea base 2018", "−15% primer año"),
        ("☀️", "ROI sistema solar",        "cálculo manual", "tiempo real con datos IoT"),
        ("🏥", "Disponibilidad UCI/Qx",    "sin garantía digital","99.9% monitoreada"),
    ]
    metricas_html = ""
    for icono, titulo, desde, hasta in metricas:
        metricas_html += f"""
        <div class="metrica-card">
          <div class="met-icon">{icono}</div>
          <div class="met-titulo">{titulo}</div>
          <div class="met-desde">Antes: {desde}</div>
          <div class="met-hasta">Meta: {hasta}</div>
        </div>"""

    return f"""<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8">
<style>
{BASE_CSS}

.page {{ width:1920px; }}

.page-header {{ background: var(--azul); padding:32px 48px; }}
.page-header h1 {{ color:#fff; font-size:26px; }}
.page-header p  {{ color:#94a3b8; font-size:13px; margin-top:4px; }}

.content {{ padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; }}

/* Etapas */
.stages-row {{
  display: flex;
  align-items: stretch;
  gap: 0;
}}
.stage-wrap {{
  display: flex;
  align-items: center;
  flex: 1;
  gap: 0;
}}
.stage-card {{
  flex: 1;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
}}
.stage-header {{
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}}
.stage-num  {{ font-size: 11px; font-weight: 800; letter-spacing:.08em; opacity:.6; }}
.stage-name {{ font-size: 18px; font-weight: 800; letter-spacing:.04em; }}
.stage-kpi  {{
  align-self: flex-start;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}}
.stage-body {{ padding: 16px 20px; }}
.stage-body ul.bullets li {{ font-size: 13px; color: #374151; }}
.arrow {{
  font-size: 30px;
  font-weight: 900;
  padding: 0 10px;
  opacity: .5;
  flex-shrink: 0;
}}

/* HMW banner */
.hmw-banner {{
  background: var(--azul);
  border-radius: 14px;
  padding: 28px 48px;
  text-align: center;
}}
.hmw-banner .label {{
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--cyan);
  margin-bottom: 12px;
}}
.hmw-banner .text {{
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  line-height: 1.7;
}}
.hmw-banner .data {{
  margin-top: 14px;
  font-size: 13px;
  color: #94a3b8;
}}
.hmw-banner .data strong {{ color: var(--cyan); }}

/* Métricas */
.metricas-row {{
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}}
.metrica-card {{
  background: #fff;
  border-radius: 12px;
  padding: 20px 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,.07);
  display: flex;
  flex-direction: column;
  gap: 6px;
}}
.met-icon   {{ font-size: 28px; }}
.met-titulo {{ font-size: 14px; font-weight: 700; color: var(--azul); }}
.met-desde  {{ font-size: 12px; color: #ef4444; }}
.met-hasta  {{ font-size: 12px; color: #166534; font-weight: 600; }}
</style>
</head>
<body>
<div class="page">
  <div class="page-header">
    <h1>Actividad 5 — Design Thinking · Hospital Nazareth 1 · Barranquilla, Colombia</h1>
    <p>Identificación de un problema digital en la gestión energética hospitalaria · Datos reales 2018</p>
  </div>
  <div class="content">

    <div>
      <h2 style="margin-bottom:16px">Las 5 etapas del Design Thinking</h2>
      <div class="stages-row">{cards_html}</div>
    </div>

    <div class="hmw-banner">
      <div class="label">¿ Cómo Podríamos ? — Reto de innovación consolidado</div>
      <div class="text">
        …brindar al personal del <strong>Hospital Nazareth 1</strong> visibilidad en <strong>tiempo real</strong> del balance entre<br>
        <strong>generación solar y consumo eléctrico por área</strong>, para que puedan tomar decisiones proactivas<br>
        que <strong>reduzcan costos</strong> y garanticen la <strong>continuidad energética en servicios críticos</strong>?
      </div>
      <div class="data">
        Datos reales 2018 &nbsp;·&nbsp;
        <strong>{CONSUMO_ANUAL:,.0f} kWh</strong> consumo anual &nbsp;·&nbsp;
        <strong>${COSTO_ANUAL:,.1f} M COP</strong> costo anual &nbsp;·&nbsp;
        <strong>{SOLAR_PCT}%</strong> cobertura solar estimada
      </div>
    </div>

    <div>
      <h2 style="margin-bottom:16px">📊 Métricas de éxito propuestas</h2>
      <div class="metricas-row">{metricas_html}</div>
    </div>

  </div>
</div>
</body></html>"""


# ═════════════════════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════════════════════
def main() -> None:
    print("=" * 60)
    print("  Actividad 5 — Design Thinking — Hospital Nazareth 1")
    print("=" * 60)
    print(f"  Consumo anual  : {CONSUMO_ANUAL:,.0f} kWh")
    print(f"  Costo anual    : ${COSTO_ANUAL:,.1f} M COP")
    print(f"  Cobertura solar: {SOLAR_PCT}%")
    print("  Motor          : HTML + CSS → Playwright/Chromium → PNG")
    print("-" * 60)

    tareas = [
        ("mapa_empatia.png",          html_mapa_empatia),
        ("journey_map.png",           html_journey_map),
        ("reto_innovacion.png",       html_reto_innovacion),
        ("resumen_design_thinking.png", html_resumen_ejecutivo),
    ]

    for filename, gen_fn in tareas:
        out = os.path.join(DIR, filename)
        render_html_to_png(gen_fn(), out)

    print("-" * 60)
    print("  Artefactos generados:")
    for filename, _ in tareas:
        print(f"  - {filename}")
    print("=" * 60)


if __name__ == "__main__":
    main()
