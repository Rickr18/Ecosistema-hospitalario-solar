"""
Actividad 2: Modelo básico de generación solar en Python
Hospital Nazareth – Barranquilla, Colombia

Calcula la generación solar fotovoltaica diaria estimada usando:
  - Irradiancia solar promedio diaria (kWh/m²/día)
  - Área disponible para paneles solares (m²)
  - Eficiencia del sistema fotovoltaico (fracción decimal)

Fórmula base:
  Energía generada (kWh/día) = Irradiancia × Área × Eficiencia
"""

import matplotlib.pyplot as plt

# ---------------------------------------------------------------------------
# Parámetros del Hospital Nazareth (Barranquilla, Colombia)
# ---------------------------------------------------------------------------
AREA_PANELES_M2 = 500.0          # Área disponible para instalación de paneles (m²)
EFICIENCIA_SISTEMA = 0.15        # Eficiencia del sistema FV (15 %)
CONSUMO_DIARIO_KWH = 2800.0      # Consumo diario estimado del hospital (kWh/día)

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
        f"Hospital Nazareth – Modelo de Generación Solar\n"
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
        "Hospital Nazareth – Comparación de Escenarios de Instalación Solar",
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
    print("=" * 55)
    print("  MODELO BÁSICO DE GENERACIÓN SOLAR – HOSPITAL NAZARETH")
    print("=" * 55)
    print(f"  Área de paneles:        {AREA_PANELES_M2:>8.0f} m²")
    print(f"  Eficiencia del sistema: {EFICIENCIA_SISTEMA * 100:>8.0f} %")
    print(f"  Consumo diario:         {CONSUMO_DIARIO_KWH:>8,.0f} kWh/día")
    print("-" * 55)
    print(f"  {'Mes':<{_COL_MES}} {'Irrad. (kWh/m²/día)':>{_COL_IRRAD}} {'Generación (kWh/día)':>{_COL_GEN}} {'Cobertura':>{_COL_COB}}")
    print("-" * 55)

    generacion = calcular_generacion_mensual(
        IRRADIANCIA_MENSUAL, AREA_PANELES_M2, EFICIENCIA_SISTEMA
    )

    for mes, energia in generacion.items():
        irr = IRRADIANCIA_MENSUAL[mes]
        cobertura = calcular_cobertura(energia, CONSUMO_DIARIO_KWH)
        print(f"  {mes:<{_COL_MES}} {irr:>{_COL_IRRAD}.1f} {energia:>{_COL_GEN}.1f} {cobertura:>{_COL_COB - 1}.1f} %")

    energia_promedio = sum(generacion.values()) / len(generacion)
    cobertura_promedio = calcular_cobertura(energia_promedio, CONSUMO_DIARIO_KWH)

    print("-" * 55)
    print(f"  {'Promedio':<{_COL_MES}} {'':>{_COL_IRRAD}} {energia_promedio:>{_COL_GEN}.1f} {cobertura_promedio:>{_COL_COB - 1}.1f} %")
    print("=" * 55)

    analizar_escenarios(CONSUMO_DIARIO_KWH)
    graficar_generacion_mensual(
        generacion, CONSUMO_DIARIO_KWH, AREA_PANELES_M2, EFICIENCIA_SISTEMA
    )


if __name__ == "__main__":
    main()
