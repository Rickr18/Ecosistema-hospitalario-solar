"""
monitoreo_solar.py — Monitor Solar en Tiempo Real
Hospital Nazareth 1 · Barranquilla, Colombia (2018)

Extiende el modelo básico de generación solar (generacion_solar.py)
incorporando:
  - Datos reales de irradiación solar de Barranquilla (Enero–Noviembre 2018)
    Fuente: IDEAM / NASA POWER / Atlas de Radiación Solar de Colombia
  - Consumo real del Hospital Nazareth 1 extraído del Excel 2018
  - Balance energético mensual detallado
  - Detección de meses con déficit o superávit solar
  - Estimación de ahorro económico y reducción de CO₂
  - Reporte de alertas operativas
  - Visualización completa (4 paneles)

Relación con generacion_solar.py:
  Importa directamente las funciones reutilizables del modelo base
  (calcular_energia_diaria, calcular_cobertura, calcular_generacion_mensual,
  cargar_consumo_nazareth) para no duplicar lógica.
"""

from __future__ import annotations

import math
import os
import sys

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import numpy as np
from playwright.sync_api import sync_playwright

# ---------------------------------------------------------------------------
# Importar funciones del modelo base (generacion_solar.py)
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(__file__))
from generacion_solar import (
    calcular_energia_diaria,
    calcular_cobertura,
    calcular_generacion_mensual,
    cargar_consumo_nazareth,
    AREA_PANELES_M2,
    EFICIENCIA_SISTEMA,
    DIAS_POR_MES,
    FRACCION_AREAS_CRITICAS,
    _RUTA_EXCEL,
)

# ---------------------------------------------------------------------------
# Parámetros extendidos para Barranquilla
# ---------------------------------------------------------------------------

# Irradiación solar global horizontal (GHI) promedio mensual para Barranquilla
# Fuente: IDEAM – Atlas de Irradiación Solar de Colombia (2014) / NASA POWER
# Valores en kWh/m²/día (media histórica multianual procesada para 2018)
#
# Barranquilla · Latitud: 10.97°N · Longitud: 74.80°W
# Característica: clima tropical seco con dos estaciones lluviosas.
# Mayor irradiación en meses secos (Dic–Abr), menor en temporadas de lluvia (May–Jun, Sep–Nov).
IRRADIANCIA_BARRANQUILLA_2018: dict[str, float] = {
    "Enero":      5.82,   # Temporada seca — máxima irradiación
    "Febrero":    5.95,   # Temporada seca — pico anual
    "Marzo":      5.87,   # Inicio temporada seca mayor
    "Abril":      5.63,   # Reducción leve, cielos parcialmente nublados
    "Mayo":       4.91,   # Inicio primera temporada de lluvias
    "Junio":      4.78,   # Primera temporada de lluvias
    "Julio":      5.31,   # Veranillo de San Juan — recuperación parcial
    "Agosto":     5.44,   # Veranillo de San Juan — buena irradiación
    "Septiembre": 4.62,   # Segunda temporada de lluvias — mínimo anual
    "Octubre":    4.38,   # Segunda temporada de lluvias — mínimo absoluto
    "Noviembre":  4.55,   # Final de lluvias — recuperación gradual
}

# Tarifa promedio energía eléctrica hospitalaria en Barranquilla 2018
# Fuente: CREG / informes tarifarios Electricaribe (hoy Air-E)
TARIFA_KWH_COP = 520.0          # COP/kWh (tarifa no residencial media)
FACTOR_CO2_KG_KWH = 0.233       # kg CO₂-eq/kWh red eléctrica Colombia (UPME 2018)

# Sistema fotovoltaico Sede 1
POTENCIA_PANEL_W = 400.0
AREA_POR_PANEL_M2 = 2.0
PERDIDAS_SISTEMA_PCT = 0.14     # 14 % pérdidas (cableado, temperatura, sombreado)

# Colores de la identidad visual del proyecto
COLOR_SOLAR = "#f59e0b"         # Ámbar — generación solar
COLOR_CONSUMO = "#ef4444"       # Rojo — consumo real
COLOR_BALANCE = "#10b981"       # Verde — balance positivo / superávit
COLOR_DEFICIT = "#8b5cf6"       # Violeta — déficit energético
COLOR_CO2 = "#14b8a6"           # Teal — reducción CO₂

MESES_ORDEN = list(IRRADIANCIA_BARRANQUILLA_2018.keys())   # Ene–Nov


# ===========================================================================
# 1. CÁLCULOS PRINCIPALES
# ===========================================================================

def calcular_balance_mensual(
    consumo_mensual: dict[str, float],
    area: float = AREA_PANELES_M2,
    eficiencia: float = EFICIENCIA_SISTEMA,
) -> dict[str, dict]:
    """Genera el balance energético completo mes a mes.

    Calcula generación solar, consumo real, balance, cobertura,
    ahorro económico y reducción de CO₂ para cada mes.

    Args:
        consumo_mensual: Consumo total mensual por mes (kWh/mes).
        area: Área de paneles (m²).
        eficiencia: Eficiencia del sistema FV (0–1).

    Returns:
        Diccionario indexado por mes con todos los indicadores calculados.
    """
    resultados: dict[str, dict] = {}

    for mes in MESES_ORDEN:
        irr = IRRADIANCIA_BARRANQUILLA_2018[mes]
        dias = DIAS_POR_MES

        # Generación solar diaria y mensual con factor de pérdidas
        gen_diaria_kwh = calcular_energia_diaria(irr, area, eficiencia) * (1 - PERDIDAS_SISTEMA_PCT)
        gen_mensual_kwh = gen_diaria_kwh * dias

        consumo_mes_kwh = consumo_mensual.get(mes, 0.0)
        consumo_diario_kwh = consumo_mes_kwh / dias

        balance_kwh = gen_mensual_kwh - consumo_mes_kwh
        cobertura_pct = min((gen_mensual_kwh / consumo_mes_kwh) * 100, 100.0) if consumo_mes_kwh else 0.0

        # Energía solar efectivamente utilizada (no puede superar el consumo real)
        solar_usada_kwh = min(gen_mensual_kwh, consumo_mes_kwh)
        ahorro_cop = solar_usada_kwh * TARIFA_KWH_COP
        co2_evitado_kg = solar_usada_kwh * FACTOR_CO2_KG_KWH

        # Número de paneles en el sistema actual
        n_paneles = math.floor(area / AREA_POR_PANEL_M2)

        resultados[mes] = {
            "irradiancia_kwh_m2_dia": irr,
            "gen_diaria_kwh": round(gen_diaria_kwh, 2),
            "gen_mensual_kwh": round(gen_mensual_kwh, 1),
            "consumo_mensual_kwh": round(consumo_mes_kwh, 1),
            "consumo_diario_kwh": round(consumo_diario_kwh, 2),
            "balance_kwh": round(balance_kwh, 1),
            "cobertura_pct": round(cobertura_pct, 2),
            "ahorro_cop": round(ahorro_cop, 0),
            "co2_evitado_kg": round(co2_evitado_kg, 2),
            "superavit": balance_kwh >= 0,
            "n_paneles": n_paneles,
        }

    return resultados


def detectar_alertas(balance: dict[str, dict]) -> list[dict]:
    """Detecta alertas operativas basadas en los indicadores mensuales.

    Genera alertas de tres niveles:
    - CRÍTICO: cobertura < 30 %
    - ADVERTENCIA: cobertura 30–60 %
    - OK: cobertura >= 60 %

    Args:
        balance: Resultado de calcular_balance_mensual().

    Returns:
        Lista de diccionarios con las alertas generadas.
    """
    alertas = []
    for mes, datos in balance.items():
        cob = datos["cobertura_pct"]
        if cob < 30:
            nivel = "CRÍTICO"
            msg = f"Cobertura solar muy baja ({cob:.1f} %). Revisar estado del sistema."
        elif cob < 60:
            nivel = "ADVERTENCIA"
            msg = f"Cobertura solar moderada ({cob:.1f} %). Posible mantenimiento requerido."
        else:
            nivel = "OK"
            msg = f"Sistema operando dentro de parámetros normales ({cob:.1f} %)."
        alertas.append({"mes": mes, "nivel": nivel, "cobertura_pct": cob, "mensaje": msg})
    return alertas


# ===========================================================================
# 2. REPORTES EN CONSOLA
# ===========================================================================

def imprimir_reporte(balance: dict[str, dict]) -> None:
    """Imprime el reporte detallado del balance energético mensual."""
    sep = "=" * 80
    print(sep)
    print("  MONITOREO SOLAR – HOSPITAL NAZARETH 1 · BARRANQUILLA 2018")
    print("  Irradiación real mensual (IDEAM / NASA POWER) + Consumo Excel 2018")
    print(sep)
    print(f"  {'Mes':<12} {'Irrad.':<10} {'Gen.Mes':<12} {'Consumo':<12} {'Cobert.':<10} {'Balance':<12} {'Ahorro COP':<14} {'CO₂ evit.'}")
    print(f"  {'':12} {'kWh/m²/d':<10} {'kWh':<12} {'kWh':<12} {'%':<10} {'kWh':<12} {'COP':<14} {'kg'}")
    print("-" * 80)

    totales = {k: 0.0 for k in ["gen_mensual_kwh", "consumo_mensual_kwh",
                                  "ahorro_cop", "co2_evitado_kg"]}
    for mes, d in balance.items():
        estado = "✅" if d["superavit"] else "⚠️ "
        print(
            f"  {mes:<12} {d['irradiancia_kwh_m2_dia']:<10.2f} "
            f"{d['gen_mensual_kwh']:<12,.0f} {d['consumo_mensual_kwh']:<12,.0f} "
            f"{d['cobertura_pct']:<10.1f} {estado}{d['balance_kwh']:>+10,.0f}  "
            f"{d['ahorro_cop']:<14,.0f} {d['co2_evitado_kg']:<,.1f}"
        )
        for k in totales:
            totales[k] += d[k]

    print("-" * 80)
    cob_prom = sum(d["cobertura_pct"] for d in balance.values()) / len(balance)
    print(
        f"  {'TOTAL / PROM':<12} {'':10} "
        f"{totales['gen_mensual_kwh']:<12,.0f} {totales['consumo_mensual_kwh']:<12,.0f} "
        f"{cob_prom:<10.1f} {'':12} "
        f"{totales['ahorro_cop']:<14,.0f} {totales['co2_evitado_kg']:<,.1f}"
    )
    print(sep)
    print(f"\n  Ahorro total estimado 2018 (Ene–Nov): ${totales['ahorro_cop']:,.0f} COP")
    print(f"  CO₂ evitado total 2018 (Ene–Nov):     {totales['co2_evitado_kg']:,.1f} kg")
    print(f"  Equivalente a plantar ~{totales['co2_evitado_kg'] / 21:.0f} árboles/año")
    print(sep)


def imprimir_alertas(alertas: list[dict]) -> None:
    """Imprime el reporte de alertas operativas."""
    print("\n" + "=" * 60)
    print("  ALERTAS OPERATIVAS DEL SISTEMA SOLAR")
    print("=" * 60)
    iconos = {"CRÍTICO": "🔴", "ADVERTENCIA": "🟡", "OK": "🟢"}
    for a in alertas:
        print(f"  {iconos[a['nivel']]} [{a['nivel']:<12}] {a['mes']:<12}: {a['mensaje']}")
    print("=" * 60)


# ===========================================================================
# 3. VISUALIZACIÓN — HTML+CSS → PNG (4 paneles)
# ===========================================================================

_BASE_CSS = """
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  background: #0f1729;
  color: #e2e8f0;
  -webkit-font-smoothing: antialiased;
}
"""

def _render_html(html: str, out_path: str, width: int = 1600) -> None:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page    = browser.new_page(
            viewport={"width": width, "height": 900},
            device_scale_factor=2,
        )
        page.set_content(html, wait_until="networkidle")
        height = page.evaluate("() => document.documentElement.scrollHeight")
        page.set_viewport_size({"width": width, "height": height})
        page.screenshot(path=out_path, full_page=True)
        browser.close()
    print(f"\nGráfico de monitoreo guardado: {out_path}")


def _bar_html(val: float, max_val: float, color: str, label: str,
              tag: str = "", tag_color: str = "#94a3b8") -> str:
    h = max(val / max_val * 100, 1)
    return f"""
    <div class="bar-col">
      <div class="bar-val">{tag}</div>
      <div class="bar-wrap">
        <div class="bar" style="height:{h:.1f}%;background:{color}"></div>
      </div>
      <div class="bar-label">{label}</div>
    </div>"""


def graficar_monitoreo(balance: dict[str, dict]) -> None:
    """Genera monitoreo_solar_nazareth.png con 4 paneles de análisis energético."""
    meses = MESES_ORDEN
    abrev = [m[:3] for m in meses]

    irr       = [balance[m]["irradiancia_kwh_m2_dia"] for m in meses]
    gen       = [balance[m]["gen_mensual_kwh"]        for m in meses]
    consumo   = [balance[m]["consumo_mensual_kwh"]    for m in meses]
    bal       = [balance[m]["balance_kwh"]            for m in meses]
    cob       = [balance[m]["cobertura_pct"]          for m in meses]
    ahorro_m  = [balance[m]["ahorro_cop"] / 1e6       for m in meses]
    ahorro_ac = list(np.cumsum(ahorro_m))
    co2       = [balance[m]["co2_evitado_kg"]         for m in meses]

    total_ahorro = sum(ahorro_m)
    total_co2    = sum(co2)
    total_gen    = sum(gen)
    total_cons   = sum(consumo)
    cob_prom     = sum(cob) / len(cob)

    # ── Panel 1: Irradiación ─────────────────────────────────────────────
    irr_min, irr_max = 0.0, 7.0   # base en 0 para barras proporcionales correctas
    EVENTOS = {
        "Julio":      ("Veranillo San Juan",       "#6ee7b7"),
        "Octubre":    ("Mín. lluvias",             "#f87171"),
        "Febrero":    ("Pico seca",                "#fde68a"),
    }
    p1_bars = ""
    for mes, val, ab in zip(meses, irr, abrev):
        color  = "#f59e0b" if val >= 5.0 else "#3b82f6"
        h_pct  = val / irr_max * 100
        evento = EVENTOS.get(mes, ("", ""))
        tag_ev = f'<span style="font-size:9px;color:{evento[1]}">{evento[0]}</span>' if evento[0] else ""
        p1_bars += f"""
        <div class="bar-col">
          <div class="bar-val">{val:.2f}</div>
          <div class="bar-wrap">
            <div class="bar" style="height:{h_pct:.1f}%;background:{color}"></div>
          </div>
          <div class="bar-label">{ab}{('<br>' + tag_ev) if tag_ev else ''}</div>
        </div>"""

    ref5_top = (1 - 5.0 / irr_max) * 100

    # ── Panel 2: Generación vs Consumo ───────────────────────────────────
    max_gc = max(max(gen), max(consumo)) * 1.15
    p2_bars = ""
    for mes, g, c, ab, cv in zip(meses, gen, consumo, abrev, cob):
        hg = g / max_gc * 100
        hc = c / max_gc * 100
        cob_col = "#22c55e" if cv >= 80 else "#f59e0b" if cv >= 50 else "#ef4444"
        p2_bars += f"""
        <div class="bar-col2">
          <div class="bar-val" style="color:{cob_col};font-size:10px">{cv:.0f}%</div>
          <div class="bar-pair">
            <div class="bar-pair-inner">
              <div class="bar b-solar" style="height:{hg:.1f}%"></div>
              <div class="bar b-consumo" style="height:{hc:.1f}%"></div>
            </div>
          </div>
          <div class="bar-label">{ab}</div>
        </div>"""

    # ── Panel 3: Balance ─────────────────────────────────────────────────
    max_abs_bal = max(abs(b) for b in bal) * 1.2
    p3_bars = ""
    for mes, b, ab in zip(meses, bal, abrev):
        is_pos  = b >= 0
        color   = "#10b981" if is_pos else "#8b5cf6"
        h_pct   = abs(b) / max_abs_bal * 50  # 50% del espacio
        sign    = "+" if is_pos else ""
        p3_bars += f"""
        <div class="bal-col">
          <div class="bal-val" style="color:{color}">{sign}{b:,.0f}</div>
          <div class="bal-wrap">
            <div class="bal-bar-pos" style="{'height:' + str(h_pct) + '%;background:' + color if is_pos else 'height:0'}"></div>
            <div class="zero-line"></div>
            <div class="bal-bar-neg" style="{'height:' + str(h_pct) + '%;background:' + color if not is_pos else 'height:0'}"></div>
          </div>
          <div class="bar-label">{ab}</div>
        </div>"""

    # ── Panel 4: Ahorro + CO2 ────────────────────────────────────────────
    max_ah  = max(ahorro_m) * 1.3
    max_ac  = ahorro_ac[-1] * 1.2
    max_co2 = max(co2) * 1.3
    p4_items = ""
    for mes, am, ac, c2, ab in zip(meses, ahorro_m, ahorro_ac, co2, abrev):
        h_bar = am / max_ah * 100
        h_ac  = ac / max_ac * 100   # para la línea acumulada (como punto)
        h_c2  = c2 / max_co2 * 100
        p4_items += f"""
        <div class="p4-col">
          <div class="p4-bar-wrap">
            <div class="p4-bar-ah"  style="height:{h_bar:.1f}%"></div>
          </div>
          <div class="p4-bar-wrap p4-co2-wrap">
            <div class="p4-bar-co2" style="height:{h_c2:.1f}%"></div>
          </div>
          <div class="bar-label">{ab}</div>
          <div class="p4-ac" style="bottom:{h_ac:.1f}%">·</div>
        </div>"""

    html = f"""<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<style>
{_BASE_CSS}
.page {{ width:1600px; padding:0 0 32px; }}

.page-header {{
  background: #1a3a5c;
  padding: 22px 48px;
  border-bottom: 3px solid #0ea5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}}
.page-header h1 {{ font-size:19px; font-weight:700; color:#fff; }}
.page-header p  {{ font-size:12px; color:#94a3b8; margin-top:4px; }}
.header-kpis {{ display:flex; gap:28px; }}
.hkpi {{ text-align:center; }}
.hkpi-val {{ font-size:18px; font-weight:800; color:#0ea5e9; }}
.hkpi-lbl {{ font-size:10px; color:#64748b; margin-top:2px; white-space:nowrap; }}

/* Grid 2×2 */
.panels-grid {{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px 28px;
}}
.panel {{
  background: #1a2540;
  border-radius: 14px;
  padding: 20px 22px;
}}
.panel-title {{
  font-size: 13px;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 6px;
}}
.panel-sub {{
  font-size: 11px;
  color: #64748b;
  margin-bottom: 16px;
}}

/* Barras genéricas */
.bars-row {{ display:flex; align-items:flex-end; gap:6px; height:180px; position:relative; }}
.bar-col  {{ flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; height:100%; }}
.bar-val  {{ font-size:10px; color:#94a3b8; font-weight:600; min-height:14px; text-align:center; }}
.bar-wrap {{ flex:1; width:100%; display:flex; align-items:flex-end; }}
.bar      {{ width:100%; border-radius:3px 3px 0 0; min-height:3px; }}
.bar-label {{ font-size:10px; color:#475569; text-align:center; padding-top:5px; line-height:1.4; }}

/* Línea de referencia */
.ref-wrap  {{ position:relative; }}
.ref-line  {{ position:absolute; left:0;right:0; border-top:1.5px dashed #60a5fa; pointer-events:none; z-index:2; }}
.ref-tag   {{ position:absolute; right:0; font-size:9.5px; color:#60a5fa; font-weight:600;
              background:#1a2540; padding:0 4px; transform:translateY(-50%); }}

/* Leyenda */
.legend {{ display:flex; gap:16px; margin-top:12px; flex-wrap:wrap; }}
.legend-item {{ display:flex; align-items:center; gap:6px; font-size:11px; color:#64748b; }}
.ldot {{ width:10px;height:10px;border-radius:2px;flex-shrink:0; }}

/* ── Panel 2: barras dobles ── */
.bar-col2 {{ flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; height:100%; }}
.bar-pair {{ flex:1; width:100%; display:flex; align-items:flex-end; }}
.bar-pair-inner {{ width:100%; display:flex; align-items:flex-end; gap:2px; height:100%; }}
.b-solar   {{ flex:1; border-radius:3px 3px 0 0; background:#f59e0b; min-height:3px; }}
.b-consumo {{ flex:1; border-radius:3px 3px 0 0; background:#ef4444; min-height:3px; }}

/* ── Panel 3: balance ── */
.bal-area {{ height:200px; position:relative; }}
.bal-row  {{ display:flex; align-items:stretch; gap:6px; height:100%; }}
.bal-col  {{ flex:1; display:flex; flex-direction:column; align-items:center; gap:2px; height:100%; }}
.bal-val  {{ font-size:9.5px; font-weight:700; min-height:14px; text-align:center; }}
.bal-wrap {{ flex:1; width:100%; display:flex; flex-direction:column; }}
.bal-bar-pos {{ width:100%; background:#10b981; border-radius:3px 3px 0 0; transition:height .2s; }}
.zero-line   {{ width:100%; height:2px; background:#334155; flex-shrink:0; }}
.bal-bar-neg {{ width:100%; background:#8b5cf6; border-radius:0 0 3px 3px; transition:height .2s; }}

/* ── Panel 4: ahorro + CO₂ ── */
.p4-row  {{ display:flex; align-items:flex-end; gap:6px; height:180px; position:relative; }}
.p4-col  {{ flex:1; display:flex; flex-direction:column; align-items:center; height:100%; position:relative; }}
.p4-bar-wrap  {{ width:100%; flex:1; display:flex; align-items:flex-end; }}
.p4-bar-ah    {{ width:60%; border-radius:3px 3px 0 0; background:#f59e0b; margin:0 auto; min-height:3px; }}
.p4-co2-wrap  {{ width:100%; height:60px; display:flex; align-items:flex-end; }}
.p4-bar-co2   {{ width:60%; border-radius:3px 3px 0 0; background:#14b8a6; margin:0 auto; min-height:3px; }}
.p4-ac {{ position:absolute; font-size:14px; color:#34d399; font-weight:900; left:50%; transform:translateX(-50%); }}

/* Tabla de alertas */
.alerts-wrap {{ padding:0 28px 20px; }}
.alerts-title {{ font-size:13px; font-weight:700; color:#e2e8f0; margin-bottom:12px; }}
.alerts-grid {{
  display:grid;
  grid-template-columns: repeat(11,1fr);
  gap:8px;
}}
.alert-card {{
  border-radius:8px;
  padding:10px 8px;
  text-align:center;
}}
.ac-mes   {{ font-size:11px; font-weight:700; color:#e2e8f0; }}
.ac-cob   {{ font-size:16px; font-weight:800; margin:4px 0 2px; }}
.ac-nivel {{ font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; }}
</style>
</head><body>
<div class="page">
  <div class="page-header">
    <div>
      <h1>Hospital Nazareth 1 · Monitoreo Solar — Barranquilla 2018</h1>
      <p>Área instalada: {AREA_PANELES_M2:.0f} m²  ·  Eficiencia: {EFICIENCIA_SISTEMA*100:.0f}%  ·  Pérdidas: {PERDIDAS_SISTEMA_PCT*100:.0f}%  ·  Irradiación: IDEAM / NASA POWER</p>
    </div>
    <div class="header-kpis">
      <div class="hkpi">
        <div class="hkpi-val">{total_gen:,.0f}</div>
        <div class="hkpi-lbl">kWh generados (Ene–Nov)</div>
      </div>
      <div class="hkpi">
        <div class="hkpi-val">{cob_prom:.1f}%</div>
        <div class="hkpi-lbl">Cobertura solar promedio</div>
      </div>
      <div class="hkpi">
        <div class="hkpi-val">${total_ahorro:.1f}M</div>
        <div class="hkpi-lbl">Ahorro estimado COP</div>
      </div>
      <div class="hkpi">
        <div class="hkpi-val">{total_co2:,.0f}</div>
        <div class="hkpi-lbl">kg CO₂ evitados</div>
      </div>
    </div>
  </div>

  <div class="panels-grid">

    <!-- Panel 1: Irradiación -->
    <div class="panel">
      <div class="panel-title">Irradiación Solar GHI — Barranquilla 2018</div>
      <div class="panel-sub">kWh/m²/día · Fuente: IDEAM / NASA POWER</div>
      <div class="ref-wrap">
        <div class="bars-row">{p1_bars}</div>
        <div class="ref-line" style="bottom:0;top:auto;
          bottom:{(5.0 - irr_min)/(irr_max - irr_min)*100:.1f}%">
          <span class="ref-tag">Ref. nacional 5.0</span>
        </div>
      </div>
      <div class="legend">
        <div class="legend-item"><div class="ldot" style="background:#f59e0b"></div>≥ 5.0 kWh/m²/día (temporada seca)</div>
        <div class="legend-item"><div class="ldot" style="background:#3b82f6"></div>< 5.0 kWh/m²/día (temporada lluvias)</div>
      </div>
    </div>

    <!-- Panel 2: Generación vs Consumo -->
    <div class="panel">
      <div class="panel-title">Generación Solar vs. Consumo Real</div>
      <div class="panel-sub">kWh/mes — etiqueta = cobertura solar del mes</div>
      <div class="bars-row" style="height:180px">{p2_bars}</div>
      <div class="legend">
        <div class="legend-item"><div class="ldot" style="background:#f59e0b"></div>Generación solar</div>
        <div class="legend-item"><div class="ldot" style="background:#ef4444"></div>Consumo real</div>
        <div class="legend-item"><div class="ldot" style="background:#22c55e"></div>Cobertura ≥ 80%</div>
        <div class="legend-item"><div class="ldot" style="background:#f59e0b"></div>50–79%</div>
        <div class="legend-item"><div class="ldot" style="background:#ef4444"></div>< 50%</div>
      </div>
    </div>

    <!-- Panel 3: Balance -->
    <div class="panel">
      <div class="panel-title">Balance Energético Mensual — Superávit / Déficit</div>
      <div class="panel-sub">kWh/mes respecto al consumo real</div>
      <div class="bal-area">
        <div class="bal-row">{p3_bars}</div>
      </div>
      <div class="legend">
        <div class="legend-item"><div class="ldot" style="background:#10b981"></div>Superávit solar</div>
        <div class="legend-item"><div class="ldot" style="background:#8b5cf6"></div>Déficit energético</div>
      </div>
    </div>

    <!-- Panel 4: Ahorro + CO₂ -->
    <div class="panel">
      <div class="panel-title">Ahorro Económico y Reducción de CO₂</div>
      <div class="panel-sub">Barras amarillas = ahorro mensual (M COP) · Barras teal = CO₂ evitado (kg) · Puntos verdes = acumulado</div>
      <div class="p4-row">{p4_items}</div>
      <div class="legend">
        <div class="legend-item"><div class="ldot" style="background:#f59e0b"></div>Ahorro mensual (M COP)</div>
        <div class="legend-item"><div class="ldot" style="background:#14b8a6"></div>CO₂ evitado (kg)</div>
        <div class="legend-item" style="color:#34d399">· Ahorro acumulado</div>
      </div>
    </div>

  </div>

  <!-- Tabla de alertas -->
  <div class="alerts-wrap">
    <div class="alerts-title">Estado operativo por mes — Semáforo de cobertura</div>
    <div class="alerts-grid">"""

    for mes, ab, cv in zip(meses, abrev, cob):
        if cv >= 60:
            bg, tc, nivel = "#0f2a1e", "#22c55e", "OK"
        elif cv >= 30:
            bg, tc, nivel = "#2a1f0a", "#f59e0b", "AVISO"
        else:
            bg, tc, nivel = "#2a0f0f", "#ef4444", "CRÍTICO"
        html += f"""
      <div class="alert-card" style="background:{bg}">
        <div class="ac-mes">{ab}</div>
        <div class="ac-cob" style="color:{tc}">{cv:.0f}%</div>
        <div class="ac-nivel" style="color:{tc}">{nivel}</div>
      </div>"""

    html += """
    </div>
  </div>
</div>
</body></html>"""

    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "monitoreo_solar_nazareth.png")
    _render_html(html, out)


# ===========================================================================
# 4. PUNTO DE ENTRADA
# ===========================================================================

def main() -> None:
    """Ejecuta el pipeline completo de monitoreo solar."""

    # 1. Cargar consumo real del Excel 2018
    consumo_mensual = cargar_consumo_nazareth(_RUTA_EXCEL)
    if not consumo_mensual:
        print("❌ No se encontraron datos de consumo. Verifique la ruta del Excel.")
        return

    # 2. Calcular balance completo
    balance = calcular_balance_mensual(consumo_mensual)

    # 3. Imprimir reporte tabular
    imprimir_reporte(balance)

    # 4. Detectar e imprimir alertas
    alertas = detectar_alertas(balance)
    imprimir_alertas(alertas)

    # 5. Visualización
    graficar_monitoreo(balance)


if __name__ == "__main__":
    main()
