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

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

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
# 3. VISUALIZACIÓN (4 paneles)
# ===========================================================================

def graficar_monitoreo(balance: dict[str, dict]) -> None:
    """Genera visualización completa del monitoreo solar con 4 paneles.

    Panel 1: Irradiación mensual Barranquilla (contexto climático).
    Panel 2: Generación solar vs. consumo real.
    Panel 3: Balance energético mensual (barras + / –).
    Panel 4: Ahorro económico acumulado y CO₂ evitado.

    Args:
        balance: Resultado de calcular_balance_mensual().
    """
    meses = MESES_ORDEN
    meses_abrev = [m[:3] for m in meses]

    irr = [balance[m]["irradiancia_kwh_m2_dia"] for m in meses]
    gen = [balance[m]["gen_mensual_kwh"] for m in meses]
    consumo = [balance[m]["consumo_mensual_kwh"] for m in meses]
    bal = [balance[m]["balance_kwh"] for m in meses]
    ahorro_acum = list(np.cumsum([balance[m]["ahorro_cop"] / 1_000_000 for m in meses]))
    co2 = [balance[m]["co2_evitado_kg"] for m in meses]

    fig, axes = plt.subplots(2, 2, figsize=(16, 10))
    fig.suptitle(
        "Hospital Nazareth 1 · Monitoreo Solar — Barranquilla 2018\n"
        f"Área instalada: {AREA_PANELES_M2:.0f} m²  |  "
        f"Eficiencia: {EFICIENCIA_SISTEMA * 100:.0f} %  |  "
        f"Pérdidas sistema: {PERDIDAS_SISTEMA_PCT * 100:.0f} %",
        fontsize=13, fontweight="bold", y=1.01,
    )
    fig.patch.set_facecolor("#0f1729")
    for ax in axes.flat:
        ax.set_facecolor("#1a2540")
        ax.tick_params(colors="white", labelsize=8)
        ax.xaxis.label.set_color("white")
        ax.yaxis.label.set_color("white")
        ax.title.set_color("white")
        for spine in ax.spines.values():
            spine.set_edgecolor("#334155")

    # ── Panel 1: Irradiación mensual ──────────────────────────────────────
    ax1 = axes[0, 0]
    bars1 = ax1.bar(meses_abrev, irr, color=COLOR_SOLAR, edgecolor="#0f1729", linewidth=0.5, zorder=3)
    ax1.axhline(y=5.0, color="#60a5fa", linestyle="--", linewidth=1.2,
                label="Referencia nacional (5.0 kWh/m²/d)", zorder=4)
    ax1.set_title("Irradiacion Solar GHI — Barranquilla 2018", fontsize=10, fontweight="bold")
    ax1.set_ylabel("kWh/m²/día", fontsize=9)
    ax1.set_ylim(3.8, 6.5)
    ax1.legend(fontsize=7.5, facecolor="#1a2540", labelcolor="white")
    ax1.grid(axis="y", color="#334155", linewidth=0.5, zorder=0)
    for bar, val in zip(bars1, irr):
        ax1.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.05,
                 f"{val:.2f}", ha="center", va="bottom", fontsize=7.5, color="white")
    # Anotación climática
    ax1.annotate("Veranillo\nSan Juan", xy=(6, irr[6]), xytext=(7.2, 5.7),
                 fontsize=6.5, color="#6ee7b7",
                 arrowprops=dict(arrowstyle="->", color="#6ee7b7", lw=0.8))
    ax1.annotate("Temp. lluvias", xy=(9, irr[9]), xytext=(8.0, 4.0),
                 fontsize=6.5, color="#f87171",
                 arrowprops=dict(arrowstyle="->", color="#f87171", lw=0.8))

    # ── Panel 2: Generación vs. consumo ──────────────────────────────────
    ax2 = axes[0, 1]
    x = np.arange(len(meses))
    w = 0.4
    ax2.bar(x - w / 2, gen, width=w, color=COLOR_SOLAR, label="Generación solar (kWh)", edgecolor="#0f1729", linewidth=0.5, zorder=3)
    ax2.bar(x + w / 2, consumo, width=w, color=COLOR_CONSUMO, label="Consumo real (kWh)", edgecolor="#0f1729", linewidth=0.5, zorder=3)
    ax2.set_title("Generacion Solar vs. Consumo Real", fontsize=10, fontweight="bold")
    ax2.set_ylabel("kWh/mes", fontsize=9)
    ax2.set_xticks(x)
    ax2.set_xticklabels(meses_abrev, fontsize=8)
    ax2.legend(fontsize=7.5, facecolor="#1a2540", labelcolor="white")
    ax2.grid(axis="y", color="#334155", linewidth=0.5, zorder=0)
    cob_labels = [balance[m]["cobertura_pct"] for m in meses]
    for i, (g, cob) in enumerate(zip(gen, cob_labels)):
        ax2.text(i - w / 2, g + 100, f"{cob:.0f}%",
                 ha="center", va="bottom", fontsize=6.5, color="#6ee7b7")

    # ── Panel 3: Balance energético mensual ──────────────────────────────
    ax3 = axes[1, 0]
    colores_bal = [COLOR_BALANCE if b >= 0 else COLOR_DEFICIT for b in bal]
    bars3 = ax3.bar(meses_abrev, bal, color=colores_bal, edgecolor="#0f1729", linewidth=0.5, zorder=3)
    ax3.axhline(y=0, color="white", linewidth=1.2, zorder=4)
    ax3.set_title("Balance Energetico Mensual (Superavit / Deficit)", fontsize=10, fontweight="bold")
    ax3.set_ylabel("kWh/mes", fontsize=9)
    ax3.grid(axis="y", color="#334155", linewidth=0.5, zorder=0)
    patch_s = mpatches.Patch(color=COLOR_BALANCE, label="Superávit solar")
    patch_d = mpatches.Patch(color=COLOR_DEFICIT, label="Déficit energético")
    ax3.legend(handles=[patch_s, patch_d], fontsize=7.5, facecolor="#1a2540", labelcolor="white")
    for bar, val in zip(bars3, bal):
        offset = 50 if val >= 0 else -200
        ax3.text(bar.get_x() + bar.get_width() / 2,
                 bar.get_height() + offset if val >= 0 else bar.get_height() + offset,
                 f"{val:+,.0f}", ha="center", va="bottom" if val >= 0 else "top",
                 fontsize=6.5, color="white")

    # ── Panel 4: Ahorro acumulado y CO₂ evitado ──────────────────────────
    ax4 = axes[1, 1]
    color_ahorro = "#f59e0b"
    ax4.bar(meses_abrev, [balance[m]["ahorro_cop"] / 1_000_000 for m in meses],
            color=color_ahorro, alpha=0.7, label="Ahorro mensual (MCOP)", edgecolor="#0f1729", linewidth=0.5, zorder=3)
    ax4_twin = ax4.twinx()
    ax4_twin.plot(meses_abrev, ahorro_acum, color="#34d399", marker="o",
                  linewidth=2, markersize=5, label="Ahorro acumulado (MCOP)", zorder=5)
    ax4_twin.tick_params(colors="white", labelsize=8)
    ax4_twin.yaxis.label.set_color("white")
    co2_line = ax4.plot(meses_abrev, co2, color=COLOR_CO2, marker="s",
                        linewidth=1.5, markersize=4, label="CO₂ evitado (kg)", linestyle="--", zorder=5)
    ax4.set_title("Ahorro Economico y Reduccion de CO2", fontsize=10, fontweight="bold")
    ax4.set_ylabel("Millones COP", fontsize=9)
    ax4_twin.set_ylabel("Ahorro acumulado (MCOP)", fontsize=9)
    ax4.grid(axis="y", color="#334155", linewidth=0.5, zorder=0)
    lines1, labels1 = ax4.get_legend_handles_labels()
    lines2, labels2 = ax4_twin.get_legend_handles_labels()
    ax4.legend(lines1 + lines2, labels1 + labels2, fontsize=7, facecolor="#1a2540", labelcolor="white")
    ax4_twin.spines["right"].set_edgecolor("#334155")

    plt.tight_layout()
    output_path = os.path.join(os.path.dirname(__file__), "monitoreo_solar_nazareth.png")
    plt.savefig(output_path, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
    print(f"\nGráfico de monitoreo guardado: {output_path}")
    plt.show()


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
