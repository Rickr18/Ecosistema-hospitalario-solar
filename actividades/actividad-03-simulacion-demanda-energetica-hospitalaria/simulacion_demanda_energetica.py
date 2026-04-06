"""
Actividad 3: Simulacion de la demanda energetica hospitalaria
Hospital Nazareth 1 - Barranquilla, Colombia

Este script construye una simulacion horaria de la demanda energetica por
areas hospitalarias criticas y la calibra con el consumo mensual real 2018
(Enero a Noviembre) del archivo Excel institucional.

Entregables que cubre:
- Simulacion por areas: UCI, Quirofanos, Farmacia, Data Center, HVAC, Iluminacion
- Graficos de perfiles diario, semanal y mensual
- Analisis de picos de demanda global y por area
"""

from __future__ import annotations

import calendar
import os
import sys
from dataclasses import dataclass


def validar_ejecucion_en_venv() -> None:
    """Detiene la ejecucion si no se usa la .venv del proyecto.

    En Windows, ejecutar con Python global 3.14 puede mezclar paquetes de
    AppData y provocar errores recursivos de matplotlib durante el render.
    """
    venv_python = os.path.normpath(
        os.path.join(os.path.dirname(__file__), "..", "..", ".venv", "Scripts", "python.exe")
    )

    if os.name == "nt" and os.path.exists(venv_python):
        exe_actual = os.path.normcase(os.path.normpath(sys.executable))
        exe_venv = os.path.normcase(venv_python)
        if exe_actual != exe_venv:
            print("ERROR: este script debe ejecutarse con la .venv del proyecto.")
            print("Ejecuta:")
            print("  ..\\..\\.venv\\Scripts\\python.exe simulacion_demanda_energetica.py")
            raise SystemExit(1)


validar_ejecucion_en_venv()

import matplotlib.pyplot as plt
import numpy as np
import openpyxl
import pandas as pd

# ---------------------------------------------------------------------------
# Configuracion general
# ---------------------------------------------------------------------------
SEDE_OBJETIVO = "HOSPITAL NAZARETH 1"
ANIO_ANALISIS = 2018
MESES_ANALISIS = list(range(1, 12))  # Enero -> Noviembre
DIAS_SEMANA_ORDEN = [
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
    "Domingo",
]

# Pesos de consumo mensual por area (deben sumar 1.0)
PESOS_AREAS = {
    "UCI": 0.19,
    "Quirofanos": 0.23,
    "Farmacia": 0.08,
    "Data Center": 0.11,
    "HVAC": 0.27,
    "Iluminacion": 0.12,
}

# Nombres de hojas de Excel 2018 (consistentes con la Actividad 2)
HOJAS_MESES = {
    "Enero": "ENERO 2018",
    "Febrero": "FEBRERO 2018 ",
    "Marzo": "MARZO 2018",
    "Abril": "ABRIL 2018",
    "Mayo": "MAYO 2018",
    "Junio": "JUNIO 2018",
    "Julio": "JULIO 2018",
    "Agosto": "AGOSTO 2018",
    "Septiembre": "SEPTIEMBRE 2018",
    "Octubre": "OCTUBRE 2018",
    "Noviembre": "NOVIEMBRE 2018 ",
}

MESES_NUM_A_NOMBRE = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
}

COLORES_AREAS = {
    "UCI": "#ef4444",
    "Quirofanos": "#f97316",
    "Farmacia": "#f59e0b",
    "Data Center": "#6366f1",
    "HVAC": "#10b981",
    "Iluminacion": "#3b82f6",
    "Total": "#111827",
}


@dataclass(frozen=True)
class PerfilArea:
    nombre: str

    def factor_horario(self, hora: int, es_fin_semana: bool) -> float:
        """Retorna el factor relativo de demanda para una hora dada."""
        if self.nombre == "UCI":
            # Carga casi plana 24/7 con leve variacion diurna.
            return 0.95 + 0.12 * np.sin((hora - 5) * np.pi / 12) ** 2

        if self.nombre == "Quirofanos":
            # Pico en jornada diurna; baja durante la noche y fines de semana.
            base = 0.2
            if 7 <= hora <= 18:
                base += 1.25
            elif 19 <= hora <= 21:
                base += 0.35
            if es_fin_semana:
                base *= 0.55
            return base

        if self.nombre == "Farmacia":
            # Cadena de frio + actividad de despacho en horas laborales.
            base = 0.55
            if 6 <= hora <= 20:
                base += 0.4
            if es_fin_semana:
                base *= 0.9
            return base

        if self.nombre == "Data Center":
            # Carga base alta con ligeros aumentos por actividad administrativa.
            base = 0.82
            if 8 <= hora <= 19:
                base += 0.28
            return base

        if self.nombre == "HVAC":
            # Mayor carga cuando sube temperatura y ocupacion.
            base = 0.35
            if 8 <= hora <= 17:
                base += 1.15
            elif 18 <= hora <= 22:
                base += 0.55
            if es_fin_semana:
                base *= 0.85
            return base

        if self.nombre == "Iluminacion":
            # Mayor consumo nocturno, con minimo en horas de alta luz natural.
            base = 0.25
            if hora <= 6 or hora >= 18:
                base += 1.05
            elif 7 <= hora <= 17:
                base += 0.35
            return base

        return 1.0


def resolver_ruta_excel() -> str:
    """Prioriza Excel local de la actividad y usa fallback al dataset global."""
    base = os.path.dirname(__file__)
    local = os.path.join(base, "CONSUMO DE ENERGIA 2018.xlsx")
    global_path = os.path.join(base, "..", "..", "data", "CONSUMO DE ENERGIA 2018.xlsx")

    if os.path.exists(local):
        return local
    if os.path.exists(global_path):
        return global_path

    raise FileNotFoundError(
        "No se encontro 'CONSUMO DE ENERGIA 2018.xlsx' ni en la carpeta de la actividad "
        "ni en ../../data/."
    )


def cargar_consumo_nazareth(ruta_excel: str) -> dict[str, float]:
    """Lee consumo mensual total de Hospital Nazareth 1 desde el Excel 2018."""
    wb = openpyxl.load_workbook(ruta_excel, data_only=True)
    consumo_mensual: dict[str, float] = {}

    for mes, nombre_hoja in HOJAS_MESES.items():
        ws = wb[nombre_hoja]

        consumo_col: int | None = None
        header_row: int | None = None
        for row_idx, row in enumerate(ws.iter_rows(min_row=1, values_only=True), start=1):
            if any(isinstance(c, str) and c.strip().upper() in ("SEDES", "SEDE") for c in row):
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

        total = 0.0
        for row in ws.iter_rows(min_row=header_row + 2, values_only=True):
            if not row or len(row) <= consumo_col:
                continue
            sede = row[0]
            consumo = row[consumo_col]
            if (
                isinstance(sede, str)
                and sede.strip().upper() == SEDE_OBJETIVO
                and isinstance(consumo, (int, float))
                and consumo > 0
            ):
                total += float(consumo)

        consumo_mensual[mes] = total

    return consumo_mensual


def construir_base_mensual(
    anio: int,
    mes: int,
    consumo_mensual_kwh: float,
    rng: np.random.Generator,
) -> pd.DataFrame:
    """Construye serie horaria de un mes y la calibra al consumo real mensual."""
    dias_en_mes = calendar.monthrange(anio, mes)[1]
    fechas = pd.date_range(
        start=f"{anio}-{mes:02d}-01 00:00:00",
        end=f"{anio}-{mes:02d}-{dias_en_mes:02d} 23:00:00",
        freq="h",
    )

    df = pd.DataFrame(index=fechas)

    for area, peso in PESOS_AREAS.items():
        perfil = PerfilArea(area)
        objetivo_area_mes = consumo_mensual_kwh * peso

        valores_raw = []
        for ts in fechas:
            hora = ts.hour
            es_fin_semana = ts.weekday() >= 5

            factor_hora = perfil.factor_horario(hora, es_fin_semana)

            # Variacion operativa dia a dia (mantenimiento, ocupacion, clima).
            ruido = rng.normal(loc=1.0, scale=0.06)
            ruido = max(0.78, min(1.22, ruido))

            # Leve estacionalidad intramensual.
            factor_dia = 1.0 + 0.05 * np.sin((ts.day / dias_en_mes) * 2 * np.pi)

            valores_raw.append(factor_hora * ruido * factor_dia)

        serie_raw = np.array(valores_raw, dtype=float)
        total_raw = float(serie_raw.sum())
        escala = (objetivo_area_mes / total_raw) if total_raw > 0 else 0.0
        df[area] = serie_raw * escala

    df["Total"] = df[list(PESOS_AREAS.keys())].sum(axis=1)

    return df


def simular_demanda_horaria(consumo_mensual: dict[str, float], semilla: int = 42) -> pd.DataFrame:
    """Genera la simulacion horaria Ene-Nov calibrada con consumo real mensual."""
    rng = np.random.default_rng(semilla)
    marcos = []

    for mes in MESES_ANALISIS:
        nombre_mes = MESES_NUM_A_NOMBRE[mes]
        consumo_mes = consumo_mensual.get(nombre_mes, 0.0)
        marcos.append(construir_base_mensual(ANIO_ANALISIS, mes, consumo_mes, rng))

    df = pd.concat(marcos).sort_index()
    return df


def enriquecer_columnas_tiempo(df: pd.DataFrame) -> pd.DataFrame:
    """Agrega columnas de apoyo temporal para analitica y graficos."""
    out = df.copy()
    out["Mes"] = out.index.month.map(MESES_NUM_A_NOMBRE)
    out["Hora"] = out.index.hour
    out["DiaSemana"] = out.index.weekday
    out["DiaSemanaNombre"] = out["DiaSemana"].map(dict(enumerate(DIAS_SEMANA_ORDEN)))
    return out


def calcular_picos(df: pd.DataFrame) -> tuple[pd.Series, dict[str, pd.Series], pd.DataFrame]:
    """Calcula pico global, picos por area y top 10 horas de mayor demanda."""
    fila_pico_global = df["Total"].idxmax()
    pico_global = pd.Series(
        {
            "fecha_hora": fila_pico_global,
            "demanda_kwh": df.loc[fila_pico_global, "Total"],
        }
    )

    picos_area: dict[str, pd.Series] = {}
    for area in PESOS_AREAS:
        idx = df[area].idxmax()
        picos_area[area] = pd.Series({"fecha_hora": idx, "demanda_kwh": df.loc[idx, area]})

    top10 = df[["Total"]].sort_values("Total", ascending=False).head(10).copy()
    top10["FechaHora"] = top10.index
    top10 = top10[["FechaHora", "Total"]]

    return pico_global, picos_area, top10


def imprimir_resumen(df: pd.DataFrame, consumo_mensual: dict[str, float]) -> None:
    """Imprime reporte resumido de calibracion y demanda simulada."""
    print("=" * 86)
    print("  ACTIVIDAD 3 - SIMULACION DEMANDA ENERGETICA HOSPITALARIA")
    print("  Hospital Nazareth 1 | Barranquilla | Base real 2018 (Ene-Nov)")
    print("=" * 86)

    print("\nConsumo mensual real calibrado (kWh):")
    for mes in MESES_ANALISIS:
        nombre = MESES_NUM_A_NOMBRE[mes]
        print(f"  - {nombre:<11}: {consumo_mensual.get(nombre, 0.0):>12,.0f}")

    energia_total = df["Total"].sum()
    promedio_horario = df["Total"].mean()
    promedio_diario = df["Total"].resample("D").sum().mean()

    print("\nIndicadores globales simulados:")
    print(f"  - Energia total simulada Ene-Nov: {energia_total:,.0f} kWh")
    print(f"  - Demanda horaria promedio:       {promedio_horario:,.2f} kWh/h")
    print(f"  - Demanda diaria promedio:        {promedio_diario:,.0f} kWh/dia")

    print("\nParticipacion de areas en la demanda total:")
    for area in PESOS_AREAS:
        participacion = (df[area].sum() / energia_total) * 100 if energia_total else 0.0
        print(f"  - {area:<12}: {participacion:>6.2f} %")


def imprimir_reporte_picos(
    pico_global: pd.Series,
    picos_area: dict[str, pd.Series],
    top10: pd.DataFrame,
) -> None:
    """Imprime el reporte de picos de demanda."""
    print("\n" + "=" * 86)
    print("  ANALISIS DE PICOS DE DEMANDA")
    print("=" * 86)

    fecha_global = pd.Timestamp(pico_global["fecha_hora"]).strftime("%Y-%m-%d %H:%M")
    print(
        f"Pico global: {fecha_global} -> {float(pico_global['demanda_kwh']):,.2f} kWh/h"
    )

    print("\nPico por area:")
    for area, fila in picos_area.items():
        fecha = pd.Timestamp(fila["fecha_hora"]).strftime("%Y-%m-%d %H:%M")
        print(f"  - {area:<12}: {fecha} -> {float(fila['demanda_kwh']):,.2f} kWh/h")

    print("\nTop 10 horas de mayor demanda total:")
    for i, row in enumerate(top10.itertuples(index=False), start=1):
        fecha = pd.Timestamp(row.FechaHora).strftime("%Y-%m-%d %H:%M")
        print(f"  {i:>2}. {fecha} -> {float(row.Total):,.2f} kWh/h")


def graficar_perfil_diario(df: pd.DataFrame, output_dir: str) -> str:
    """Grafica perfil horario diario promedio por area y total."""
    promedio_horario = df.groupby("Hora")[[*PESOS_AREAS.keys(), "Total"]].mean()

    plt.figure(figsize=(12, 6))
    for area in PESOS_AREAS:
        plt.plot(
            promedio_horario.index,
            promedio_horario[area],
            label=area,
            linewidth=1.7,
            color=COLORES_AREAS[area],
            alpha=0.9,
        )

    plt.plot(
        promedio_horario.index,
        promedio_horario["Total"],
        label="Total hospital",
        linewidth=2.6,
        color=COLORES_AREAS["Total"],
    )

    plt.title("Perfil Diario Promedio de Demanda Energetica (kWh/h)", fontsize=12, fontweight="bold")
    plt.xlabel("Hora del dia")
    plt.ylabel("Demanda (kWh/h)")
    plt.xticks(range(0, 24, 1))
    plt.grid(alpha=0.25)
    plt.legend(ncol=3)
    plt.tight_layout()

    out = os.path.join(output_dir, "perfil_diario_demanda.png")
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close()
    return out


def graficar_perfil_semanal(df: pd.DataFrame, output_dir: str) -> str:
    """Grafica perfil semanal promedio por dia (barras apiladas por area)."""
    diario = (
        df.groupby([df.index.date, "DiaSemanaNombre"])[list(PESOS_AREAS.keys())]
        .sum()
        .reset_index()
    )

    # La primera columna corresponde a la fecha diaria agregada; se renombra
    # para evitar dependencias con nombres internos de pandas.
    diario = diario.rename(columns={diario.columns[0]: "Fecha"})

    promedio_semanal = (
        diario.groupby("DiaSemanaNombre")[list(PESOS_AREAS.keys())]
        .mean()
        .reindex(DIAS_SEMANA_ORDEN)
    )

    plt.figure(figsize=(11, 6))
    bottom = np.zeros(len(promedio_semanal))

    for area in PESOS_AREAS:
        vals = promedio_semanal[area].to_numpy()
        plt.bar(
            promedio_semanal.index,
            vals,
            bottom=bottom,
            label=area,
            color=COLORES_AREAS[area],
            alpha=0.9,
        )
        bottom += vals

    plt.title("Perfil Semanal Promedio de Demanda (kWh/dia)", fontsize=12, fontweight="bold")
    plt.xlabel("Dia de la semana")
    plt.ylabel("Demanda energetica (kWh/dia)")
    plt.grid(axis="y", alpha=0.25)
    plt.legend(ncol=3)
    plt.tight_layout()

    out = os.path.join(output_dir, "perfil_semanal_demanda.png")
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close()
    return out


def graficar_perfil_mensual(df: pd.DataFrame, output_dir: str) -> str:
    """Grafica perfil mensual total por areas (barras apiladas)."""
    mensual = df.groupby("Mes")[list(PESOS_AREAS.keys())].sum()
    orden_meses = [MESES_NUM_A_NOMBRE[m] for m in MESES_ANALISIS]
    mensual = mensual.reindex(orden_meses)

    plt.figure(figsize=(12, 6.5))
    bottom = np.zeros(len(mensual))

    for area in PESOS_AREAS:
        vals = mensual[area].to_numpy()
        plt.bar(
            mensual.index,
            vals,
            bottom=bottom,
            label=area,
            color=COLORES_AREAS[area],
            alpha=0.9,
        )
        bottom += vals

    plt.title("Perfil Mensual de Demanda Energetica (Ene-Nov 2018)", fontsize=12, fontweight="bold")
    plt.xlabel("Mes")
    plt.ylabel("Demanda energetica (kWh/mes)")
    plt.xticks(rotation=25)
    plt.grid(axis="y", alpha=0.25)
    plt.legend(ncol=3)
    plt.tight_layout()

    out = os.path.join(output_dir, "perfil_mensual_demanda.png")
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close()
    return out


def graficar_heatmap_demanda(df: pd.DataFrame, output_dir: str) -> str:
    """Grafica heatmap hora-dia para identificar patrones y picos."""
    pivot = (
        df[["Total"]]
        .assign(Fecha=df.index.date, Hora=df.index.hour)
        .pivot_table(index="Fecha", columns="Hora", values="Total", aggfunc="sum")
    )

    plt.figure(figsize=(12, 7))
    plt.imshow(pivot.to_numpy(), aspect="auto", cmap="YlOrRd")
    plt.colorbar(label="Demanda (kWh/h)")
    plt.title("Mapa de Calor de Demanda Horaria Total", fontsize=12, fontweight="bold")
    plt.xlabel("Hora del dia")
    plt.ylabel("Dia")
    plt.xticks(ticks=np.arange(0, 24, 2), labels=[str(h) for h in range(0, 24, 2)])
    plt.tight_layout()

    out = os.path.join(output_dir, "heatmap_demanda_horaria.png")
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close()
    return out


def main() -> None:
    ruta_excel = resolver_ruta_excel()
    consumo_mensual = cargar_consumo_nazareth(ruta_excel)

    if not consumo_mensual:
        raise RuntimeError("No fue posible cargar consumo mensual del hospital.")

    df = simular_demanda_horaria(consumo_mensual, semilla=42)
    df = enriquecer_columnas_tiempo(df)

    imprimir_resumen(df, consumo_mensual)

    pico_global, picos_area, top10 = calcular_picos(df)
    imprimir_reporte_picos(pico_global, picos_area, top10)

    out_dir = os.path.dirname(__file__)
    archivos = [
        graficar_perfil_diario(df, out_dir),
        graficar_perfil_semanal(df, out_dir),
        graficar_perfil_mensual(df, out_dir),
        graficar_heatmap_demanda(df, out_dir),
    ]

    print("\nGraficos generados:")
    for path in archivos:
        print(f"  - {path}")


if __name__ == "__main__":
    main()
