# Ecosistema Hospitalario Solar

Proyecto académico de la asignatura **Electiva III — Gerencia de Proyectos Sostenibles**.  
Hospital Nazareth 1 · Barranquilla, Colombia · Base real de consumo 2018.

---

## Objetivo del proyecto

Integrar energía solar fotovoltaica, análisis de datos y productos digitales en el entorno hospitalario, comprendiendo el hospital como un **sistema complejo de proyectos interrelacionados**. A través de 6 actividades progresivas se desarrollan competencias en:

- **Pensamiento sistémico** — el hospital como ecosistema energético.
- **Programación aplicada** — modelos de generación y consumo en Python.
- **Diseño centrado en el usuario** — prototipos UX/UI para gestión energética.
- **Gerencia de proyectos sostenibles** — evaluación de impacto y modelo de negocio.

---

## Estructura del proyecto

```
Ecosistema-hospitalario-solar/
├── README.md                          ← Este archivo
├── requirements.txt                   ← Dependencias Python del proyecto
├── data/
│   └── CONSUMO DE ENERGIA 2018.xlsx   ← Datos reales de consumo (no se sube al repo)
└── actividades/
    ├── actividad-01-mapa-ecosistema-hospitalario-solar/
    │   ├── README.md
    │   └── presentacion-interactiva/  ← React + Tailwind (npm)
    ├── actividad-02-modelo-basico-generacion-solar-python/
    │   ├── README.md
    │   ├── generacion_solar.py        ← Modelo de generación FV
    │   └── monitoreo_solar.py         ← Visualización matplotlib
    ├── actividad-03-simulacion-demanda-energetica-hospitalaria/
    │   ├── README.md
    │   ├── simulacion_demanda_energetica.py  ← Genera reporte_demanda.html
    │   └── reporte_demanda.html              ← Reporte HTML/CSS interactivo
    ├── actividad-04-dashboard-energetico-gerencia-hospitalaria/
    │   ├── README.md
    │   ├── dashboard.py               ← App Dash (servidor local)
    │   └── modelos.py                 ← Lógica de KPIs y generación
    ├── actividad-05-design-thinking-problema-digital-hospitales/
    │   ├── README.md
    │   └── design_thinking.py         ← Genera artefactos PNG
    └── actividad-06-prototipo-ux-app-monitoreo-solar/
        ├── README.md
        └── monitoreo-solar-app/        ← React + Tailwind v4 (npm)
            ├── src/
            │   ├── App.jsx             ← Shell con navegación por estado
            │   ├── index.css           ← Tokens de diseño + animaciones
            │   ├── data/mockData.js    ← Datos simulados del sistema
            │   ├── components/         ← Sidebar, Header, MetricCard, AlertBadge, StatusIndicator
            │   └── screens/            ← Dashboard, SolarPanels, Batteries, Alerts, History
            ├── package.json
            └── vite.config.js
```

---

## Entorno virtual Python (.venv)

El proyecto usa un entorno virtual para aislar las dependencias y evitar conflictos con otras instalaciones de Python en el sistema. **El `.venv` no se sube a GitHub** (está en `.gitignore`); cada colaborador debe crearlo localmente.

### Por qué usar `.venv`

- Evita mezclar paquetes entre proyectos diferentes.
- Garantiza que todos usen las mismas versiones (definidas en `requirements.txt`).
- Los scripts tienen una comprobación interna que advierte si se ejecutan fuera del `.venv`.

### Crear y activar el entorno

```bash
# Desde la raíz del proyecto
python -m venv .venv
```

**Activar en Windows (PowerShell o CMD):**
```powershell
.venv\Scripts\activate
```

**Activar en Mac / Linux:**
```bash
source .venv/bin/activate
```

### Instalar dependencias

Con el entorno activo, instalar todo de una vez:
```bash
pip install -r requirements.txt
```

### Verificar que el entorno está activo

```bash
python --version        # debe mostrar la versión del .venv
pip list                # debe mostrar numpy, pandas, dash, plotly, etc.
```

### Desactivar el entorno

```bash
deactivate
```

---

## Actividades

| # | Actividad | Qué hace | Cómo ejecutar |
|---|-----------|----------|---------------|
| 1 | [Mapa del ecosistema](actividades/actividad-01-mapa-ecosistema-hospitalario-solar/) | Presentación React interactiva del ecosistema | `cd actividad-01.../presentacion-interactiva && npm install && npm run dev` |
| 2 | [Modelo de generación solar](actividades/actividad-02-modelo-basico-generacion-solar-python/) | Estima generación FV diaria y mensual con datos reales | `.venv\Scripts\python.exe actividades/actividad-02.../generacion_solar.py` |
| 3 | [Simulación de demanda](actividades/actividad-03-simulacion-demanda-energetica-hospitalaria/) | Simula consumo horario por área y genera `reporte_demanda.html` | `.venv\Scripts\python.exe actividades/actividad-03.../simulacion_demanda_energetica.py` |
| 4 | [Dashboard gerencial](actividades/actividad-04-dashboard-energetico-gerencia-hospitalaria/) | Dashboard Dash interactivo en `http://127.0.0.1:8050` | `.venv\Scripts\python.exe actividades/actividad-04.../dashboard.py` |
| 5 | [Design Thinking](actividades/actividad-05-design-thinking-problema-digital-hospitales/) | Genera artefactos PNG del proceso DT | `.venv\Scripts\python.exe actividades/actividad-05.../design_thinking.py` |
| 6 | [Prototipo UX](actividades/actividad-06-prototipo-ux-app-monitoreo-solar/) | App React de monitoreo solar en tiempo real (Dashboard, Paneles, Baterías, Alertas, Historial) | `cd actividades/actividad-06.../monitoreo-solar-app && npm install && npm run dev` |

> **Nota:** los comandos de Python usan la ruta del `.venv` explícita. Si el entorno ya está activado con `activate`, puedes usar simplemente `python archivo.py` desde la carpeta de la actividad.

---


## Autor

**Rick Rios** — [Rickr18](https://github.com/Rickr18)
