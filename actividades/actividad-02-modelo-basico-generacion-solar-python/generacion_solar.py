"""
Actividad 2: Modelo básico de generación solar en Python
Hospital Nazareth – Barranquilla, Colombia

Calcula la generación solar fotovoltaica diaria estimada usando:
  - Irradiancia solar promedio diaria (kWh/m²/día)
  - Área disponible para paneles solares (m²)
  - Eficiencia del sistema fotovoltaico (fracción decimal)

Fórmula base:
  Energía generada (kWh/día) = Irradiancia × Área × Eficiencia

Incluye lectura del consumo real de Hospital Nazareth 1 (sede 1)
a partir del archivo Excel de consumo de energía 2018.
"""

import math
import os

import matplotlib.pyplot as plt
import openpyxl

# ---------------------------------------------------------------------------
# Parámetros del Hospital Nazareth (Barranquilla, Colombia)
# ---------------------------------------------------------------------------
SEDE_OBJETIVO = "HOSPITAL NAZARETH 1"   # Única sede analizada (instrucción docente)
AREA_PANELES_M2 = 500.0          # Área disponible para instalación de paneles (m²)
EFICIENCIA_SISTEMA = 0.15        # Eficiencia del sistema FV (15 %)
CONSUMO_DIARIO_KWH = 2800.0      # Consumo diario estimado del hospital (kWh/día)
FRACCION_AREAS_CRITICAS = 0.40   # Fracción del consumo total en áreas críticas (40 %)
DIAS_POR_MES = 30                # Días promedio por mes para conversiones mensuales
POTENCIA_PANEL_W = 400.0         # Potencia pico por panel (W)
HORAS_SOL_PICO = 5.2             # HSP promedio anual Barranquilla
W_POR_KW = 1000.0                # Factor de conversión vatios a kilovatios
AREA_POR_PANEL_M2 = 2.0          # Área aproximada por panel estándar de 400 W (m²)

# Ruta al archivo Excel con el consumo real de energía 2018
_RUTA_EXCEL = os.path.join(
    os.path.dirname(__file__), "..", "..", "data", "CONSUMO DE ENERGIA 2018.xlsx"
)

# Nombres de las hojas del Excel (Enero a Noviembre)
_HOJAS_MESES = {
    "Enero":      "ENERO 2018",
    "Febrero":    "FEBRERO 2018 ",
    "Marzo":      "MARZO 2018",
    "Abril":      "ABRIL 2018",
    "Mayo":       "MAYO 2018",
    "Junio":      "JUNIO 2018",
    "Julio":      "JULIO 2018",
    "Agosto":     "AGOSTO 2018",
    "Septiembre": "SEPTIEMBRE 2018",
    "Octubre":    "OCTUBRE 2018",
    "Noviembre":  "NOVIEMBRE 2018 ",
}

# Irradiancia solar promedio mensual para Barranquilla (kWh/m²/día)
# Fuente: Atlas de Radiación Solar de Colombia / NASA POWER
# Anchos de columna para tablas de resultados
_COL_MES = 12
_COL_IRRAD = 20
_COL_GEN = 22
_COL_COB = 10
_COL_ESC = 22
_COL_GEN_ESC = 12

IRRADIANCIA_MENSUAL = {
    "Enero":      5.2,
    "Febrero":    5.5,
    "Marzo":      5.6,
    "Abril":      5.3,
    "Mayo":       4.9,
    "Junio":      5.0,
    "Julio":      5.4,
    "Agosto":     5.6,
    "Septiembre": 5.1,
    "Octubre":    4.8,
    "Noviembre":  4.7,
    "Diciembre":  4.9,
}


# ---------------------------------------------------------------------------
# Lectura de datos reales del Excel
# ---------------------------------------------------------------------------

def cargar_consumo_nazareth(ruta_excel: str) -> dict[str, float]:
    """Lee el Excel de consumo 2018 y retorna el consumo mensual total
    de Hospital Nazareth 1 (sede 1), de Enero a Noviembre.

    La función detecta dinámicamente la fila de encabezado y la columna
    'CONSUMO (kWh)' en cada hoja, ya que la estructura varía entre meses.

    Args:
        ruta_excel: Ruta al archivo CONSUMO DE ENERGIA 2018.xlsx.

    Returns:
        Diccionario {mes: consumo_total_kWh} para los 11 meses disponibles.
    """
    wb = openpyxl.load_workbook(ruta_excel, data_only=True)
    consumo_mensual: dict[str, float] = {}

    for mes, nombre_hoja in _HOJAS_MESES.items():
        ws = wb[nombre_hoja]

        # Buscar fila de encabezado y columna de consumo dinámicamente
        consumo_col: int | None = None
        header_row: int | None = None
        for row_idx, row in enumerate(ws.iter_rows(min_row=1, values_only=True), start=1):
            if any(
                isinstance(c, str) and c.strip().upper() in ("SEDES", "SEDE")
                for c in row
            ):
                for col_idx, cell in enumerate(row):
                    if isinstance(cell, str) and "CONSUMO" in cell.upper():
                        consumo_col = col_idx
                        header_row = row_idx
                        break
                if header_row is not None:
                    break

        if header_row is None or consumo_col is None:
            consumo_mensual[mes] = 0.0
            continue

        # Sumar consumo de Hospital Nazareth 1 (sede 1 únicamente)
        # (header_row + 2 omite la fila de unidades '(kWh)' que sigue al encabezado)
        total = 0.0
        for row in ws.iter_rows(min_row=header_row + 2, values_only=True):
            if not row or len(row) <= consumo_col:
                continue
            sede = row[0]
            if not isinstance(sede, str) or sede.strip().upper() != SEDE_OBJETIVO:
                continue
            consumo = row[consumo_col]
            if isinstance(consumo, (int, float)) and consumo > 0:
                total += consumo

        consumo_mensual[mes] = total

    return consumo_mensual


# ---------------------------------------------------------------------------
# Funciones del modelo
# ---------------------------------------------------------------------------

def calcular_energia_diaria(irradiancia: float, area: float, eficiencia: float) -> float:
    """Calcula la energía solar generada en un día (kWh/día).

    Args:
        irradiancia: Irradiancia solar promedio diaria (kWh/m²/día).
        area: Área de paneles solares disponible (m²).
        eficiencia: Eficiencia del sistema fotovoltaico (0‒1).

    Returns:
        Energía generada en kWh/día.
    """
    return irradiancia * area * eficiencia


def calcular_cobertura(energia_generada: float, consumo: float) -> float:
    """Calcula el porcentaje del consumo hospitalario cubierto por la generación solar.

    Args:
        energia_generada: Energía fotovoltaica generada (kWh/día).
        consumo: Consumo energético diario del hospital (kWh/día).

    Returns:
        Porcentaje de cobertura (0‒100).
    """
    return min((energia_generada / consumo) * 100, 100.0)


def calcular_generacion_mensual(
    irradiancia_mensual: dict[str, float],
    area: float,
    eficiencia: float,
) -> dict[str, float]:
    """Calcula la generación diaria estimada para cada mes.

    Args:
        irradiancia_mensual: Diccionario {mes: irradiancia (kWh/m²/día)}.
        area: Área de paneles solares (m²).
        eficiencia: Eficiencia del sistema fotovoltaico (0‒1).

    Returns:
        Diccionario {mes: energía generada (kWh/día)}.
    """
    return {
        mes: calcular_energia_diaria(irr, area, eficiencia)
        for mes, irr in irradiancia_mensual.items()
    }


# ---------------------------------------------------------------------------
# Visualización
# ---------------------------------------------------------------------------

def graficar_generacion_mensual(
    generacion: dict[str, float],
    consumo: float,
    area: float,
    eficiencia: float,
) -> None:
    """Genera dos gráficos:
    1. Generación solar diaria estimada por mes vs. consumo hospitalario.
    2. Porcentaje de cobertura solar mensual.

    Args:
        generacion: Diccionario {mes: energía generada (kWh/día)}.
        consumo: Consumo energético diario del hospital (kWh/día).
        area: Área de paneles instalada (m²).
        eficiencia: Eficiencia del sistema fotovoltaico (0‒1).
    """
    meses = list(generacion.keys())
    valores = list(generacion.values())
    coberturas = [calcular_cobertura(v, consumo) for v in valores]

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 9))
    fig.suptitle(
        f"Hospital Nazareth 1 – Modelo de Generación Solar\n"
        f"Área: {area} m²  |  Eficiencia: {eficiencia * 100:.0f} %",
        fontsize=13,
        fontweight="bold",
    )

    # --- Gráfico 1: generación vs. consumo ---
    colores = ["#2ecc71" if v >= consumo else "#3498db" for v in valores]
    bars = ax1.bar(meses, valores, color=colores, edgecolor="white", linewidth=0.5)
    ax1.axhline(y=consumo, color="#e74c3c", linestyle="--", linewidth=1.5,
                label=f"Consumo diario ({consumo:,.0f} kWh/día)")
    ax1.set_ylabel("Energía (kWh/día)", fontsize=11)
    ax1.set_title("Generación Solar Diaria Estimada por Mes", fontsize=11)
    ax1.legend(fontsize=9)
    ax1.tick_params(axis="x", rotation=30)
    ax1.set_ylim(0, max(valores) * 1.25)
    for bar, val in zip(bars, valores):
        ax1.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 5,
            f"{val:,.0f}",
            ha="center", va="bottom", fontsize=8,
        )

    # --- Gráfico 2: porcentaje de cobertura ---
    colores2 = ["#27ae60" if c >= 100 else "#f39c12" if c >= 50 else "#e74c3c"
                for c in coberturas]
    bars2 = ax2.bar(meses, coberturas, color=colores2, edgecolor="white", linewidth=0.5)
    ax2.axhline(y=100, color="#2c3e50", linestyle="--", linewidth=1.5,
                label="Cobertura total (100 %)")
    ax2.set_ylabel("Cobertura solar (%)", fontsize=11)
    ax2.set_title("Porcentaje de Cobertura del Consumo Hospitalario", fontsize=11)
    ax2.set_ylim(0, 115)
    ax2.legend(fontsize=9)
    ax2.tick_params(axis="x", rotation=30)
    for bar, cob in zip(bars2, coberturas):
        ax2.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 1,
            f"{cob:.1f} %",
            ha="center", va="bottom", fontsize=8,
        )

    plt.tight_layout()
    output_path = "generacion_solar_nazareth.png"
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    print(f"\nGráfico guardado como: {output_path}")
    plt.show()


def analizar_escenarios(consumo: float) -> None:
    """Compara tres escenarios de instalación (área pequeña, mediana y grande).

    Args:
        consumo: Consumo energético diario del hospital (kWh/día).
    """
    irradiancia_promedio = sum(IRRADIANCIA_MENSUAL.values()) / len(IRRADIANCIA_MENSUAL)
    escenarios = {
        "Pequeño (200 m²)":  calcular_energia_diaria(irradiancia_promedio, 200,  EFICIENCIA_SISTEMA),
        "Mediano (500 m²)":  calcular_energia_diaria(irradiancia_promedio, 500,  EFICIENCIA_SISTEMA),
        "Grande (1 000 m²)": calcular_energia_diaria(irradiancia_promedio, 1000, EFICIENCIA_SISTEMA),
    }

    print("\n" + "=" * 55)
    print("  COMPARACIÓN DE ESCENARIOS – IRRADIANCIA PROMEDIO ANUAL")
    print("=" * 55)
    print(f"  Irradiancia promedio anual: {irradiancia_promedio:.2f} kWh/m²/día")
    print(f"  Eficiencia del sistema:     {EFICIENCIA_SISTEMA * 100:.0f} %")
    print(f"  Consumo diario hospital:    {consumo:,.0f} kWh/día")
    print("-" * 55)
    print(f"  {'Escenario':<{_COL_ESC}} {'Generación':>{_COL_GEN_ESC}}  {'Cobertura':>{_COL_COB}}")
    print("-" * 55)
    for nombre, energia in escenarios.items():
        cobertura = calcular_cobertura(energia, consumo)
        print(f"  {nombre:<{_COL_ESC}} {energia:>{_COL_GEN_ESC}.1f} kWh  {cobertura:>{_COL_COB - 2}.1f} %")
    print("=" * 55)

    # Gráfico de barras de escenarios
    fig, ax = plt.subplots(figsize=(8, 5))
    nombres = list(escenarios.keys())
    energias = list(escenarios.values())
    colores = ["#3498db", "#2ecc71", "#9b59b6"]
    bars = ax.bar(nombres, energias, color=colores, edgecolor="white", linewidth=0.5)
    ax.axhline(y=consumo, color="#e74c3c", linestyle="--", linewidth=1.5,
               label=f"Consumo diario ({consumo:,.0f} kWh/día)")
    ax.set_ylabel("Energía generada (kWh/día)", fontsize=11)
    ax.set_title(
        "Hospital Nazareth 1 – Comparación de Escenarios de Instalación Solar",
        fontsize=11, fontweight="bold",
    )
    ax.legend(fontsize=9)
    ax.set_ylim(0, max(energias) * 1.3)
    for bar, val in zip(bars, energias):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 5,
            f"{val:,.0f} kWh/día",
            ha="center", va="bottom", fontsize=9,
        )
    plt.tight_layout()
    escenarios_path = "escenarios_instalacion_nazareth.png"
    plt.savefig(escenarios_path, dpi=150, bbox_inches="tight")
    print(f"Gráfico de escenarios guardado como: {escenarios_path}")
    plt.show()


# ---------------------------------------------------------------------------
# Punto de entrada principal
# ---------------------------------------------------------------------------

def main() -> None:
    # -----------------------------------------------------------------------
    # Cargar consumo real de Hospital Nazareth 1 (sede 1)
    # -----------------------------------------------------------------------
    consumo_nazareth = cargar_consumo_nazareth(_RUTA_EXCEL)

    if not consumo_nazareth:
        print("No se encontraron datos de consumo para el Hospital Nazareth.")
        return

    # Consumo diario real (promedio de los 11 meses disponibles, Enero-Noviembre)
    consumo_promedio_mensual = sum(consumo_nazareth.values()) / len(consumo_nazareth)
    consumo_diario_real = consumo_promedio_mensual / DIAS_POR_MES

    print("=" * 65)
    print("  CONSUMO REAL – HOSPITAL NAZARETH 1 (2018)")
    print("=" * 65)
    print(f"  {'Mes':<12} {'Consumo total (kWh)':>22} {'Áreas críticas (kWh)':>22}")
    print("-" * 65)
    for mes, consumo in consumo_nazareth.items():
        criticas = consumo * FRACCION_AREAS_CRITICAS
        print(f"  {mes:<12} {consumo:>22,.0f} {criticas:>22,.0f}")
    print("-" * 65)
    criticas_promedio = consumo_promedio_mensual * FRACCION_AREAS_CRITICAS
    print(f"  {'Promedio':<12} {consumo_promedio_mensual:>22,.0f} {criticas_promedio:>22,.0f}")
    print("=" * 65)

    # -----------------------------------------------------------------------
    # Modelo de generación solar usando consumo real
    # -----------------------------------------------------------------------
    print()
    print("=" * 55)
    print("  MODELO BÁSICO DE GENERACIÓN SOLAR – HOSPITAL NAZARETH")
    print("=" * 55)
    print(f"  Área de paneles:        {AREA_PANELES_M2:>8.0f} m²")
    print(f"  Eficiencia del sistema: {EFICIENCIA_SISTEMA * 100:>8.0f} %")
    print(f"  Consumo diario real:    {consumo_diario_real:>8,.0f} kWh/día")
    print(f"  (calculado de {len(consumo_nazareth)} meses, sede 1 únicamente)")
    print("-" * 55)
    print(f"  {'Mes':<{_COL_MES}} {'Irrad. (kWh/m²/día)':>{_COL_IRRAD}} {'Generación (kWh/día)':>{_COL_GEN}} {'Cobertura':>{_COL_COB}}")
    print("-" * 55)

    generacion = calcular_generacion_mensual(
        {m: IRRADIANCIA_MENSUAL[m] for m in consumo_nazareth},
        AREA_PANELES_M2,
        EFICIENCIA_SISTEMA,
    )

    for mes, energia in generacion.items():
        irr = IRRADIANCIA_MENSUAL[mes]
        consumo_diario_mes = consumo_nazareth[mes] / DIAS_POR_MES
        cobertura = calcular_cobertura(energia, consumo_diario_mes)
        print(f"  {mes:<{_COL_MES}} {irr:>{_COL_IRRAD}.1f} {energia:>{_COL_GEN}.1f} {cobertura:>{_COL_COB - 1}.1f} %")

    energia_promedio = sum(generacion.values()) / len(generacion)
    cobertura_promedio = calcular_cobertura(energia_promedio, consumo_diario_real)

    print("-" * 55)
    print(f"  {'Promedio':<{_COL_MES}} {'':>{_COL_IRRAD}} {energia_promedio:>{_COL_GEN}.1f} {cobertura_promedio:>{_COL_COB - 1}.1f} %")
    print("=" * 55)

    # -----------------------------------------------------------------------
    # Dimensionamiento del sistema para Sede 1
    # -----------------------------------------------------------------------
    energia_panel_kwh_dia = (POTENCIA_PANEL_W / W_POR_KW) * HORAS_SOL_PICO * EFICIENCIA_SISTEMA
    paneles_necesarios = math.ceil(consumo_diario_real / energia_panel_kwh_dia)
    area_necesaria_m2 = paneles_necesarios * AREA_POR_PANEL_M2

    print()
    print("=" * 55)
    print("  DIMENSIONAMIENTO DEL SISTEMA – HOSPITAL NAZARETH 1")
    print("=" * 55)
    print(f"  Consumo diario Sede 1:        {consumo_diario_real:>8,.0f} kWh/día")
    print(f"  Energía por panel/día:        {energia_panel_kwh_dia:>8.2f} kWh/panel/día")
    print(f"  Paneles necesarios (100 %):   {paneles_necesarios:>8} paneles")
    print(f"  Área mínima estimada:         {area_necesaria_m2:>8,.0f} m²")
    print("  (referencia para Actividad 03)")
    print("=" * 55)

    # -----------------------------------------------------------------------
    # Generación solar mensual propuesta (para comparar con consumo mensual)
    # -----------------------------------------------------------------------
    generacion_promedio_mensual = energia_promedio * DIAS_POR_MES

    print()
    print(
        f"El Hospital Nazareth 1 consume en promedio {consumo_promedio_mensual:,.0f} kWh "
        f"y el sistema solar propuesto generaría {generacion_promedio_mensual:,.0f} kWh"
    )
    print()

    analizar_escenarios(consumo_diario_real)
    graficar_generacion_mensual(
        generacion, consumo_diario_real, AREA_PANELES_M2, EFICIENCIA_SISTEMA
    )


if __name__ == "__main__":
    main()
