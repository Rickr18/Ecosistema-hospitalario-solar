# Actividad 4 — Dashboard energético para la gerencia hospitalaria
## Hospital Nazareth 1 · Barranquilla, Colombia

---

## Estructura de archivos

```
actividad-04-dashboard-energetico-gerencia-hospitalaria/
├── dashboard.py      ← App Dash (punto de entrada principal)
├── modelos.py        ← Lógica integrada de Actividades 2 y 3
└── README.md         ← Este archivo
```

El archivo `data/CONSUMO DE ENERGIA 2018.xlsx` debe estar en la
raíz del proyecto (el script lo busca automáticamente en `../../data/`).

---

## Instalación

```bash
# Desde la raíz del proyecto, activar el entorno virtual
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Linux / macOS

# Instalar todas las dependencias del proyecto
pip install -r requirements.txt
```

> Ver el [README raíz](../../README.md) para instrucciones de creación del `.venv`.

---

## Ejecución

```bash
cd actividades/actividad-04-dashboard-energetico-gerencia-hospitalaria
python dashboard.py
```

Abrir en el navegador: **http://127.0.0.1:8050**

---

## Componentes del dashboard

| Panel | Descripción | Fuente |
|---|---|---|
| Header | Gradiente azul `#1e3a5f → #2563eb` con selector de mes | — |
| KPI Cards | Generación, consumo, autosuficiencia, ahorro COP, déficit — borde superior por color | Act. 2 + Excel |
| Gauge circular | % autosuficiencia del mes — semáforo gerencial sin delta confuso | Act. 2 + Excel |
| Barras agrupadas | Generación vs consumo por mes, mes activo resaltado | Act. 2 + Excel |
| Barras horizontales | Consumo por área (UCI, Quirófanos, Farmacia, Data Center, HVAC, Iluminación) | Act. 3 |
| Alertas gerenciales | Déficit/excedente, umbral autosuficiencia, alerta UCI | Act. 2 + Act. 3 |
| Evolución anual | Líneas de área + eje secundario de autosuficiencia % (Ene–Nov 2018) | Act. 2 + Excel |
| Escenarios | Comparación de instalación 200 / 500 / 1 000 m² con cobertura estimada | Act. 2 |

### Paleta de colores (alineada con Actividad 3)

| Token | Hex | Uso |
|---|---|---|
| Verde | `#10b981` | Generación solar, indicadores positivos |
| Rojo | `#ef4444` | Consumo, alertas críticas |
| Azul | `#2563eb` | Acento, header, escenario mediano |
| Amarillo | `#f59e0b` | Advertencias, puntos de cobertura |
| Púrpura | `#6366f1` | Escenario grande, Data Center |

---

## KPIs gerenciales

| KPI | Fórmula | Umbral de alerta |
|---|---|---|
| Generación solar | `Irradiancia × Área × Eficiencia × 30 días` | — |
| Autosuficiencia | `(Generación / Consumo) × 100` | < 10% crítico · 10–15% advertencia |
| Ahorro estimado | `Generación × $650 COP/kWh` | — |
| Déficit energético | `max(0, Consumo − Generación)` | > 0 kWh activa alerta |

---

## Integración con actividades anteriores

```
Actividad 2                     Actividad 3
calcular_generacion_mensual()   PESOS_AREAS (UCI 19%, HVAC 27%...)
cargar_consumo_mensual()        simula demanda por área
IRRADIANCIA_MENSUAL             COLORES_AREAS
         ↓                              ↓
              modelos.py (integrador)
                      ↓
              dashboard.py (visualización)
```

`modelos.py` no duplica código: **importa y reutiliza** la lógica
de las actividades anteriores, añadiendo únicamente los KPIs gerenciales
y la función de alertas que son exclusivos de la Actividad 4.

---

## Autor
Rick Rios · [Rickr18](https://github.com/Rickr18)
Electiva III — Gerencia de Proyectos Sostenibles
