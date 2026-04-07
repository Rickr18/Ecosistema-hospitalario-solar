"""
dashboard.py — Actividad 4: Dashboard energético para la gerencia hospitalaria
Hospital Nazareth 1 · Barranquilla, Colombia · Base real 2018

Ejecutar:
    python dashboard.py
Abrir en el navegador: http://127.0.0.1:8050

Dependencias (instalar si no están):
    pip install dash plotly pandas openpyxl
"""

from __future__ import annotations

import dash
from dash import dcc, html, Input, Output, callback
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

# Importa toda la lógica de generación y consumo desde modelos.py
from modelos import (
    cargar_consumo_mensual,
    calcular_kpis_anuales,
    calcular_kpis_mes,
    calcular_areas_mes,
    calcular_escenarios,
    dimensionamiento,
    generar_alertas,
    MESES_ORDENADOS,
    COLORES_AREAS,
    PESOS_AREAS,
    TARIFA_COP_KWH,
    AREA_PANELES_M2,
    EFICIENCIA_SISTEMA,
)

# ---------------------------------------------------------------------------
# Carga de datos (una sola vez al arrancar)
# ---------------------------------------------------------------------------
try:
    CONSUMO_MENSUAL = cargar_consumo_mensual()
    print("✔ Datos del Excel cargados correctamente.")
except FileNotFoundError as e:
    print(f"⚠ {e}")
    print("  Usando datos de referencia estimados.")
    CONSUMO_MENSUAL = {
        "Enero": 40521, "Febrero": 36748, "Marzo": 39210,
        "Abril": 38654, "Mayo": 41320,   "Junio": 39870,
        "Julio": 38540, "Agosto": 40110, "Septiembre": 39650,
        "Octubre": 41780, "Noviembre": 38920,
    }

KPI_DF = calcular_kpis_anuales(CONSUMO_MENSUAL)

# ---------------------------------------------------------------------------
# Paleta de colores (estilo médico/limpio)
# ---------------------------------------------------------------------------
VERDE    = "#1D9E75"
ROJO     = "#E24B4A"
AMARILLO = "#BA7517"
AZUL     = "#185FA5"
GRIS     = "#5F5E5A"
BG       = "#F8F9FA"
CARD_BG  = "#FFFFFF"

OPCIONES_MES = [{"label": m, "value": m} for m in MESES_ORDENADOS]

# ---------------------------------------------------------------------------
# Helpers de diseño
# ---------------------------------------------------------------------------

def tarjeta_kpi(titulo: str, valor: str, unidad: str, color: str = GRIS) -> html.Div:
    return html.Div([
        html.P(titulo, style={
            "fontSize": "11px", "textTransform": "uppercase",
            "letterSpacing": "0.08em", "color": GRIS, "margin": "0 0 4px 0",
        }),
        html.P(valor, style={
            "fontSize": "26px", "fontWeight": "600",
            "color": color, "margin": "0", "lineHeight": "1",
        }),
        html.P(unidad, style={
            "fontSize": "11px", "color": GRIS, "margin": "4px 0 0 0",
        }),
    ], style={
        "background": CARD_BG,
        "border": "1px solid #E5E7EB",
        "borderRadius": "10px",
        "padding": "16px 20px",
        "flex": "1",
        "minWidth": "160px",
    })


def badge_alerta(nivel: str, mensaje: str) -> html.Div:
    colores = {"ok": VERDE, "warn": AMARILLO, "critical": ROJO}
    bgs     = {"ok": "#E1F5EE", "warn": "#FAEEDA", "critical": "#FCEBEB"}
    color = colores.get(nivel, GRIS)
    bg    = bgs.get(nivel, "#F1EFE8")
    return html.Div(mensaje, style={
        "background": bg,
        "color": color,
        "borderLeft": f"4px solid {color}",
        "borderRadius": "4px",
        "padding": "8px 12px",
        "fontSize": "12px",
        "marginBottom": "8px",
        "lineHeight": "1.5",
    })


# ---------------------------------------------------------------------------
# Layout de la aplicación
# ---------------------------------------------------------------------------

app = dash.Dash(
    __name__,
    title="Dashboard Energético · Hospital Nazareth 1",
    suppress_callback_exceptions=True,
)

app.layout = html.Div([

    # ── Encabezado ─────────────────────────────────────────────────────────
    html.Div([
        html.Div([
            html.H1("Dashboard Energético", style={
                "fontSize": "20px", "fontWeight": "700",
                "color": "#111827", "margin": "0",
            }),
            html.P("Hospital Nazareth 1 · Barranquilla · Datos reales 2018", style={
                "fontSize": "13px", "color": GRIS, "margin": "2px 0 0 0",
            }),
        ]),
        html.Div([
            html.Label("Mes seleccionado:", style={"fontSize": "12px", "color": GRIS, "marginBottom": "4px"}),
            dcc.Dropdown(
                id="selector-mes",
                options=OPCIONES_MES,
                value="Enero",
                clearable=False,
                style={"width": "180px", "fontSize": "13px"},
            ),
        ], style={"display": "flex", "flexDirection": "column", "alignItems": "flex-end"}),
    ], style={
        "display": "flex", "justifyContent": "space-between", "alignItems": "center",
        "background": CARD_BG, "padding": "16px 24px",
        "borderBottom": "1px solid #E5E7EB", "marginBottom": "20px",
    }),

    # ── Cuerpo principal ────────────────────────────────────────────────────
    html.Div([

        # Fila 1: KPI Cards
        html.Div(id="kpi-cards", style={
            "display": "flex", "gap": "12px",
            "flexWrap": "wrap", "marginBottom": "20px",
        }),

        # Fila 2: Gráfico principal + Gauge
        html.Div([
            html.Div([
                html.P("Generación solar vs. consumo real (kWh/mes)", style={
                    "fontSize": "12px", "fontWeight": "600", "color": GRIS,
                    "textTransform": "uppercase", "letterSpacing": "0.06em",
                    "marginBottom": "8px",
                }),
                dcc.Graph(id="grafico-gen-consumo", config={"displayModeBar": False},
                          style={"height": "280px"}),
            ], style={
                "flex": "2", "background": CARD_BG,
                "border": "1px solid #E5E7EB", "borderRadius": "10px",
                "padding": "16px 20px",
            }),

            html.Div([
                html.P("Autosuficiencia solar", style={
                    "fontSize": "12px", "fontWeight": "600", "color": GRIS,
                    "textTransform": "uppercase", "letterSpacing": "0.06em",
                    "marginBottom": "8px",
                }),
                dcc.Graph(id="grafico-gauge", config={"displayModeBar": False},
                          style={"height": "280px"}),
            ], style={
                "flex": "1", "background": CARD_BG,
                "border": "1px solid #E5E7EB", "borderRadius": "10px",
                "padding": "16px 20px",
            }),
        ], style={"display": "flex", "gap": "16px", "marginBottom": "20px"}),

        # Fila 3: Áreas + Alertas + Escenarios
        html.Div([

            # Barras de áreas
            html.Div([
                html.P("Consumo por área crítica", style={
                    "fontSize": "12px", "fontWeight": "600", "color": GRIS,
                    "textTransform": "uppercase", "letterSpacing": "0.06em",
                    "marginBottom": "8px",
                }),
                dcc.Graph(id="grafico-areas", config={"displayModeBar": False},
                          style={"height": "260px"}),
            ], style={
                "flex": "1", "background": CARD_BG,
                "border": "1px solid #E5E7EB", "borderRadius": "10px",
                "padding": "16px 20px",
            }),

            # Alertas gerenciales
            html.Div([
                html.P("Alertas gerenciales", style={
                    "fontSize": "12px", "fontWeight": "600", "color": GRIS,
                    "textTransform": "uppercase", "letterSpacing": "0.06em",
                    "marginBottom": "12px",
                }),
                html.Div(id="alertas-box"),
            ], style={
                "flex": "1", "background": CARD_BG,
                "border": "1px solid #E5E7EB", "borderRadius": "10px",
                "padding": "16px 20px",
            }),

        ], style={"display": "flex", "gap": "16px", "marginBottom": "20px"}),

        # Fila 4: Comparación de escenarios (anual)
        html.Div([
            html.P("Comparación anual: generación solar vs. consumo real (todos los meses)", style={
                "fontSize": "12px", "fontWeight": "600", "color": GRIS,
                "textTransform": "uppercase", "letterSpacing": "0.06em",
                "marginBottom": "8px",
            }),
            dcc.Graph(id="grafico-anual", config={"displayModeBar": False},
                      style={"height": "260px"}),
        ], style={
            "background": CARD_BG,
            "border": "1px solid #E5E7EB", "borderRadius": "10px",
            "padding": "16px 20px", "marginBottom": "20px",
        }),

        # Fila 5: Escenarios de instalación
        html.Div([
            html.P("Escenarios de instalación solar (impacto en cobertura diaria)", style={
                "fontSize": "12px", "fontWeight": "600", "color": GRIS,
                "textTransform": "uppercase", "letterSpacing": "0.06em",
                "marginBottom": "8px",
            }),
            dcc.Graph(id="grafico-escenarios", config={"displayModeBar": False},
                      style={"height": "220px"}),
        ], style={
            "background": CARD_BG,
            "border": "1px solid #E5E7EB", "borderRadius": "10px",
            "padding": "16px 20px", "marginBottom": "20px",
        }),

        # Pie de página
        html.P(
            f"Actividad 4 · Gerencia de Proyectos Sostenibles · "
            f"Área instalada: {AREA_PANELES_M2:.0f} m² · "
            f"Eficiencia: {EFICIENCIA_SISTEMA * 100:.0f}% · "
            f"Tarifa referencia: ${TARIFA_COP_KWH:,.0f} COP/kWh",
            style={"fontSize": "11px", "color": GRIS, "textAlign": "center",
                   "padding": "8px 0 16px 0"},
        ),

    ], style={"maxWidth": "1300px", "margin": "0 auto", "padding": "0 24px"}),

], style={"background": BG, "minHeight": "100vh", "fontFamily": "system-ui, sans-serif"})


# ---------------------------------------------------------------------------
# Callbacks
# ---------------------------------------------------------------------------

@callback(
    Output("kpi-cards", "children"),
    Input("selector-mes", "value"),
)
def actualizar_kpis(mes: str) -> list:
    k = calcular_kpis_mes(mes, CONSUMO_MENSUAL)
    cop = f"${k['ahorro_cop']:,.0f}"
    color_autosuf = VERDE if k["autosuficiencia"] >= 15 else AMARILLO if k["autosuficiencia"] >= 10 else ROJO
    return [
        tarjeta_kpi("Generación solar",    f"{k['generacion_kwh']:,.0f}",    "kWh este mes",    VERDE),
        tarjeta_kpi("Consumo real",         f"{k['consumo_kwh']:,.0f}",       "kWh este mes",    AZUL),
        tarjeta_kpi("Autosuficiencia",      f"{k['autosuficiencia']:.1f}%",   "del consumo cubierto", color_autosuf),
        tarjeta_kpi("Ahorro estimado",      cop,                               "COP este mes",    VERDE),
        tarjeta_kpi("Déficit / Excedente",  f"{k['deficit_kwh']:,.0f}" if k["deficit_kwh"] > 0 else f"+{k['excedente_kwh']:,.0f}",
                    "kWh (déficit = red activa)", ROJO if k["deficit_kwh"] > 0 else VERDE),
    ]


@callback(
    Output("grafico-gen-consumo", "figure"),
    Input("selector-mes", "value"),
)
def actualizar_grafico_principal(mes_activo: str) -> go.Figure:
    meses = MESES_ORDENADOS
    gen   = [KPI_DF.loc[m, "generacion_kwh"] for m in meses]
    cons  = [KPI_DF.loc[m, "consumo_kwh"]    for m in meses]

    color_gen  = [VERDE  if m == mes_activo else "#9FE1CB" for m in meses]
    color_cons = [ROJO   if m == mes_activo else "#F7C1C1"  for m in meses]

    fig = go.Figure()
    fig.add_bar(name="Generación solar", x=meses, y=gen,  marker_color=color_gen,
                hovertemplate="%{x}: %{y:,.0f} kWh<extra>Generación</extra>")
    fig.add_bar(name="Consumo real",     x=meses, y=cons, marker_color=color_cons,
                hovertemplate="%{x}: %{y:,.0f} kWh<extra>Consumo</extra>")

    fig.update_layout(
        barmode="group",
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=40, r=10, t=10, b=40),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="left", x=0,
                    font=dict(size=11)),
        xaxis=dict(showgrid=False, tickfont=dict(size=10)),
        yaxis=dict(gridcolor="#F0F0F0", tickformat=",", tickfont=dict(size=10)),
        font=dict(family="system-ui, sans-serif"),
    )
    return fig


@callback(
    Output("grafico-gauge", "figure"),
    Input("selector-mes", "value"),
)
def actualizar_gauge(mes: str) -> go.Figure:
    k = calcular_kpis_mes(mes, CONSUMO_MENSUAL)
    val = k["autosuficiencia"]
    color = VERDE if val >= 15 else AMARILLO if val >= 10 else ROJO

    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=val,
        delta={"reference": 15, "suffix": "%", "valueformat": ".1f"},
        number={"suffix": "%", "font": {"size": 36, "color": color}},
        gauge={
            "axis": {"range": [0, 100], "tickwidth": 1,
                     "tickcolor": GRIS, "tickfont": {"size": 10}},
            "bar":  {"color": color, "thickness": 0.25},
            "bgcolor": "white",
            "borderwidth": 0,
            "steps": [
                {"range": [0, 10],   "color": "#FCEBEB"},
                {"range": [10, 15],  "color": "#FAEEDA"},
                {"range": [15, 100], "color": "#E1F5EE"},
            ],
            "threshold": {
                "line": {"color": VERDE, "width": 3},
                "thickness": 0.8, "value": 15,
            },
        },
        title={"text": f"Meta ≥15% · {mes}", "font": {"size": 12, "color": GRIS}},
    ))
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=20, r=20, t=60, b=20),
        font=dict(family="system-ui, sans-serif"),
    )
    return fig


@callback(
    Output("grafico-areas", "figure"),
    Input("selector-mes", "value"),
)
def actualizar_areas(mes: str) -> go.Figure:
    consumo_mes = CONSUMO_MENSUAL.get(mes, 0.0)
    areas_kwh = calcular_areas_mes(consumo_mes)
    areas = list(PESOS_AREAS.keys())
    valores = [areas_kwh[a] for a in areas]
    colores = [COLORES_AREAS[a] for a in areas]

    fig = go.Figure(go.Bar(
        x=valores, y=areas, orientation="h",
        marker_color=colores,
        text=[f"{v:,.0f} kWh" for v in valores],
        textposition="auto",
        hovertemplate="%{y}: %{x:,.0f} kWh<extra></extra>",
    ))
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=10, r=20, t=10, b=30),
        xaxis=dict(showgrid=True, gridcolor="#F0F0F0", tickformat=",", tickfont=dict(size=10)),
        yaxis=dict(showgrid=False, tickfont=dict(size=11)),
        font=dict(family="system-ui, sans-serif"),
        showlegend=False,
    )
    return fig


@callback(
    Output("alertas-box", "children"),
    Input("selector-mes", "value"),
)
def actualizar_alertas(mes: str) -> list:
    k = calcular_kpis_mes(mes, CONSUMO_MENSUAL)
    alertas = generar_alertas(k)
    return [badge_alerta(a["nivel"], a["mensaje"]) for a in alertas]


@callback(
    Output("grafico-anual", "figure"),
    Input("selector-mes", "value"),
)
def actualizar_anual(mes_activo: str) -> go.Figure:
    meses = MESES_ORDENADOS
    gen   = [KPI_DF.loc[m, "generacion_kwh"]  for m in meses]
    cons  = [KPI_DF.loc[m, "consumo_kwh"]     for m in meses]
    autosuf = [KPI_DF.loc[m, "autosuficiencia"] for m in meses]

    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=meses, y=cons, name="Consumo real",
        line=dict(color=ROJO, width=2.5),
        fill="tozeroy", fillcolor="rgba(226,75,74,0.08)",
        hovertemplate="%{x}: %{y:,.0f} kWh<extra>Consumo</extra>",
    ))
    fig.add_trace(go.Scatter(
        x=meses, y=gen, name="Generación solar",
        line=dict(color=VERDE, width=2.5),
        fill="tozeroy", fillcolor="rgba(29,158,117,0.12)",
        hovertemplate="%{x}: %{y:,.0f} kWh<extra>Generación</extra>",
    ))
    fig.add_trace(go.Scatter(
        x=meses, y=autosuf, name="Autosuficiencia %",
        line=dict(color=AZUL, width=1.8, dash="dot"),
        yaxis="y2",
        hovertemplate="%{x}: %{y:.1f}%<extra>Autosuficiencia</extra>",
    ))

    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=50, r=50, t=10, b=40),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, font=dict(size=11)),
        xaxis=dict(showgrid=False, tickfont=dict(size=10)),
        yaxis=dict(title="kWh/mes", gridcolor="#F0F0F0", tickformat=",", tickfont=dict(size=10)),
        yaxis2=dict(title="Autosuficiencia %", overlaying="y", side="right",
                    tickfont=dict(size=10), showgrid=False, range=[0, 30]),
        hovermode="x unified",
        font=dict(family="system-ui, sans-serif"),
    )
    return fig


@callback(
    Output("grafico-escenarios", "figure"),
    Input("selector-mes", "value"),
)
def actualizar_escenarios(mes: str) -> go.Figure:
    k = calcular_kpis_mes(mes, CONSUMO_MENSUAL)
    esc = calcular_escenarios(k["consumo_diario"])

    nombres = list(esc.keys())
    gen_dia = [esc[n]["generacion_diaria_kwh"] for n in nombres]
    cob_pct = [esc[n]["cobertura_pct"] for n in nombres]
    colores = [AZUL, VERDE, "#7F77DD"]

    fig = go.Figure()
    fig.add_bar(
        x=nombres, y=gen_dia, name="Generación diaria (kWh)",
        marker_color=colores,
        text=[f"{v:,.0f} kWh" for v in gen_dia],
        textposition="outside",
        yaxis="y",
        hovertemplate="%{x}: %{y:,.0f} kWh/día<extra></extra>",
    )
    fig.add_trace(go.Scatter(
        x=nombres, y=cob_pct, name="Cobertura %",
        mode="markers+text",
        marker=dict(size=12, color=AMARILLO, line=dict(color="#fff", width=2)),
        text=[f"{c:.1f}%" for c in cob_pct],
        textposition="top center",
        yaxis="y2",
    ))
    fig.add_hline(
        y=k["consumo_diario"], line_dash="dash",
        line_color=ROJO, annotation_text=f"Consumo/día: {k['consumo_diario']:,.0f} kWh",
        annotation_font_size=10,
    )
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=50, r=50, t=30, b=40),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, font=dict(size=11)),
        xaxis=dict(showgrid=False, tickfont=dict(size=11)),
        yaxis=dict(title="kWh/día", gridcolor="#F0F0F0", tickformat=",", tickfont=dict(size=10)),
        yaxis2=dict(title="Cobertura %", overlaying="y", side="right",
                    tickfont=dict(size=10), showgrid=False),
        font=dict(family="system-ui, sans-serif"),
    )
    return fig


# ---------------------------------------------------------------------------
# Punto de entrada
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=" * 60)
    print("  Dashboard Energético · Hospital Nazareth 1")
    print("  Actividad 4 — Gerencia de Proyectos Sostenibles")
    print("=" * 60)
    print(f"  Abriendo en: http://127.0.0.1:8050")
    print("  Presiona Ctrl+C para detener.\n")
    app.run(debug=True, port=8050)
