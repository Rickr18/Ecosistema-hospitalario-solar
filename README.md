# Ecosistema Hospitalario Solar

## Objetivo del proyecto

El **Ecosistema Hospitalario Solar** es un proyecto académico de la asignatura Electiva III (Gerencia de Proyectos Sostenibles) orientado a integrar energía solar fotovoltaica, análisis de datos y productos digitales en el entorno hospitalario.

El proyecto busca que el estudiante comprenda el hospital como un **sistema complejo de proyectos interrelacionados**, donde la energía solar no es solo una solución tecnológica, sino un componente estratégico que debe gestionarse con rigor, visión y responsabilidad. A través de 6 actividades progresivas, se desarrollan competencias en:

- **Pensamiento sistémico**: análisis del hospital como ecosistema energético.
- **Programación aplicada**: modelos de generación y consumo energético en Python.
- **Diseño centrado en el usuario**: prototipos UX/UI para la gestión energética.
- **Gerencia de proyectos sostenibles**: evaluación de impacto, modelo de negocio y presentación ante comités directivos.

## 🌟 Presentación Interactiva (React + Tailwind)

La carpeta [`presentacion-interactiva/`](presentacion-interactiva/) contiene una **presentación web interactiva de alto nivel** sobre el Ecosistema Hospitalario Solar: Sede Nazareth 1.

### Stack tecnológico
- **React 19 + Vite 7** — Framework UI moderno y build tool ultrarrápido
- **Tailwind CSS v4** — Utility-first CSS con tokens de tema personalizados
- Paleta: azul médico · verde energía · blanco limpio
- Animaciones de scroll-reveal fluidas

### Comandos para ejecutar la presentación

```bash
cd presentacion-interactiva

# Instalar dependencias
npm install

# Modo desarrollo (http://localhost:5173)
npm run dev

# Build de producción
npm run build

# Previsualizar el build
npm run preview
```

### Secciones de la presentación
1. **Hero** — Landing con métricas clave
2. **Visión Sistémica** — Infografía de la tríada: Infraestructura, Energía y Gestión Sostenible
3. **Mapa del Ecosistema** — Flujo de energía: Paneles → Inversores → UCI / Farmacia / Data Center
4. **Flujo de Datos Real** — Pipeline Data 2018 → Python → Dashboard gerencial
5. **Análisis de Retos** — Tarjetas: Costos, Espacio, Mantenimiento, Integración eléctrica
6. **Impacto Triple Resultado** — Eficiencia económica · Responsabilidad ambiental · Seguridad del paciente

---

## Estructura del proyecto

```
Ecosistema-hospitalario-solar/
├── README.md                                        ← Este archivo
├── Actividades de gerencia de proyecto.pdf          ← Documento fuente de las actividades
├── presentacion-interactiva/                        ← 🆕 Presentación React + Tailwind
│   ├── src/
│   │   ├── App.jsx                                  ← Todas las slides
│   │   ├── App.css                                  ← Animaciones scroll-reveal
│   │   └── index.css                                ← Tailwind v4 + tema
│   ├── index.html
│   └── package.json
├── data/
│   └── CONSUMO DE ENERGIA 2018.xlsx                 ← Datos reales de consumo energético
└── actividades/
    ├── actividad-01-mapa-ecosistema-hospitalario-solar/
    ├── actividad-02-modelo-basico-generacion-solar-python/
    ├── actividad-03-simulacion-demanda-energetica-hospitalaria/
    ├── actividad-04-dashboard-energetico-gerencia-hospitalaria/
    ├── actividad-05-design-thinking-problema-digital-hospitales/
    └── actividad-06-prototipo-ux-app-monitoreo-solar/
```

## Actividades

| # | Actividad | Descripción |
|---|-----------|-------------|
| 1 | [Mapa del ecosistema hospitalario solar](actividades/actividad-01-mapa-ecosistema-hospitalario-solar/) | Análisis sistémico del hospital y mapeo de flujos de energía y datos. |
| 2 | [Modelo básico de generación solar en Python](actividades/actividad-02-modelo-basico-generacion-solar-python/) | Script Python para estimar la generación fotovoltaica diaria del hospital. |
| 3 | [Simulación de la demanda energética hospitalaria](actividades/actividad-03-simulacion-demanda-energetica-hospitalaria/) | Modelo de simulación del consumo energético por áreas críticas. |
| 4 | [Dashboard energético para la gerencia hospitalaria](actividades/actividad-04-dashboard-energetico-gerencia-hospitalaria/) | Visualización integrada de generación y consumo para la toma de decisiones. |
| 5 | [Design Thinking: problema digital en hospitales](actividades/actividad-05-design-thinking-problema-digital-hospitales/) | Identificación del reto de innovación mediante metodología Design Thinking. |
| 6 | [Prototipo UX de app de monitoreo solar hospitalario](actividades/actividad-06-prototipo-ux-app-monitoreo-solar/) | Diseño de la interfaz de usuario para la app de monitoreo solar. |

## Datos disponibles

- **`data/CONSUMO DE ENERGIA 2018.xlsx`**: datos reales de consumo energético hospitalario del año 2018, utilizados como base para los modelos de simulación y análisis.

## Autor
* **Rick Rios** - [Rickr18](https://github.com/Rickr18)
