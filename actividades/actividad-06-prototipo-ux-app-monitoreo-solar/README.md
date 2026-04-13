# Actividad 6: Prototipo UX — App de Monitoreo Solar Hospitalario

## Introducción

El diseño de experiencia de usuario (UX) es un componente esencial en el desarrollo de productos digitales efectivos. Esta actividad construye el prototipo UX de alta fidelidad de la aplicación **SolarMonitor**, una app de monitoreo solar en tiempo real diseñada para el personal técnico y gerencial de un hospital, aplicando principios de diseño centrado en el usuario derivados del análisis previo de Design Thinking.

---

## Estructura del proyecto

```
monitoreo-solar-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # Punto de entrada
    ├── App.jsx               # Shell de navegación (router por estado)
    ├── index.css             # Tokens de diseño, animaciones, utilidades
    ├── data/
    │   └── mockData.js       # Datos simulados (sistema, paneles, baterías, alertas, historial)
    ├── components/           # Componentes reutilizables
    │   ├── Sidebar.jsx       # Navegación lateral con badge de alertas
    │   ├── Header.jsx        # Cabecera con estado EN VIVO y alertas críticas
    │   ├── MetricCard.jsx    # Tarjeta KPI con ícono, valor, tendencia
    │   ├── AlertBadge.jsx    # Pill de severidad (crítico / advertencia / info)
    │   └── StatusIndicator.jsx  # Punto de estado con animación pulsante
    └── screens/              # Pantallas principales
        ├── Dashboard.jsx     # Vista general + flujo energético + cargas
        ├── SolarPanels.jsx   # Estado de strings e inversores
        ├── Batteries.jsx     # Banco LFP — arco de carga + módulos
        ├── Alerts.jsx        # Sistema de alertas con filtros y reconocimiento
        └── History.jsx       # Gráficas semanales y curva de potencia diaria
```

---

## Cómo ejecutar

```bash
cd monitoreo-solar-app
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## Pantallas implementadas

| Pantalla | Descripción |
|---|---|
| **Dashboard** | KPIs principales, banner de alertas críticas, flujo energético SVG en tiempo real, tabla de cargas por área hospitalaria |
| **Paneles Solares** | Tarjetas por string fotovoltaico con anillo de eficiencia, temperatura, barra de rendimiento; tabla de inversores |
| **Baterías** | Arco de carga tipo gauge, 8 métricas de banco, tarjetas de módulos individuales con barra de carga |
| **Alertas** | Lista filtrable (todas / activas / críticas / advertencias), acción de "reconocer", orden por severidad |
| **Historial** | Gráfico de barras semanal (generación vs consumo vs red), gráfico de CO₂, tabla diaria, curva de potencia por hora |

---

## Decisiones UX tomadas

### 1. Jerarquía visual por severidad (principio de urgencia)
Las alertas críticas se muestran con un banner rojo al tope del Dashboard y un badge animado con pulso rojo, aplicando el principio de **señalización de emergencias**: la información crítica debe ser perceptible sin buscarla. Se usaron tres niveles de color consistentes en toda la app:
- **Rojo (#ef4444)** — crítico, acción inmediata
- **Ámbar (#f59e0b)** — advertencia, monitoreo
- **Verde (#34d399)** — normal / positivo

### 2. Sidebar compacto con badge numérico
La navegación lateral usa un badge rojo con conteo de alertas no reconocidas en el ítem "Alertas", facilitando el acceso a información urgente sin importar en qué pantalla esté el usuario (*Nielsen: visibilidad del estado del sistema*).

### 3. Indicador EN VIVO en el header
Un punto pulsante verde acompañado del texto "EN VIVO" en el header refuerza que los datos son en tiempo real. Esto reduce la ansiedad del personal técnico sobre la validez de los datos mostrados.

### 4. Gráficas SVG nativas, sin dependencias
Todas las visualizaciones (barras, líneas, arcos, flujo energético) son SVG puro, alineado con la filosofía del proyecto (sin librerías de terceros innecesarias). Las animaciones de crecimiento de barras y el gradiente en la curva de potencia mejoran la comprensión del dato.

### 5. Anillo de eficiencia en paneles solares
Cada string fotovoltaico muestra un anillo circular de eficiencia con el color cambiante (verde/ámbar/rojo) para detectar de un vistazo cuál string necesita atención. El rojo en alta temperatura complementa el dato numérico.

### 6. Flujo energético en Dashboard
El diagrama SVG Solar → Inversor → Hospital / Batería / Red traduce un dato abstracto (kW) en una relación causal visual, facilitando la comprensión a usuarios no técnicos (gerentes, directivos).

### 7. Reconocimiento de alertas
El sistema de "reconocer alerta" sigue el modelo de gestión de incidentes hospitalarios: el personal confirma que tomó nota de un evento sin eliminarlo, preservando el historial de auditoría.

### 8. Paleta y tipografía consistente con Actividad 01
Se reutilizó exactamente la misma paleta de tokens CSS (`--color-medical-blue-*`, `--color-energy-green-*`) y las animaciones (`fadeInUp`, `pulse-slow`, `dashflow`, `barGrow`, `shimmer`) de la presentación interactiva de la Actividad 01, asegurando identidad visual coherente en el ecosistema.

---

## Flujo de usuario principal

```
Apertura → Dashboard
  ├── [Ve banner rojo] → clic "Ver alertas" → Alertas
  │     └── Reconoce alerta crítica → regresa a Dashboard (banner desaparece)
  ├── Sidebar → Paneles Solares
  │     └── Identifica string C-2 en rojo → escala con equipo de mantenimiento
  ├── Sidebar → Baterías
  │     └── Verifica autonomía (3.8h) y temperatura módulo 4
  └── Sidebar → Historial
        └── Selecciona "Hoy" → ve curva de potencia hora a hora
```

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.x | UI reactiva |
| Vite | 7.x | Bundler y dev server |
| Tailwind CSS v4 | 4.x | Estilos utilitarios con tokens |
| SVG nativo | — | Gráficas y diagramas |

---

## Conclusión

A través de esta actividad se demuestra que un prototipo funcional de alta fidelidad puede construirse con tecnologías estándar (React + Tailwind + SVG) sin librerías de visualización pesadas, manteniendo un tiempo de carga mínimo. Las decisiones de diseño se anclan en principios UX clínicos: claridad inmediata, señalización de emergencias, y navegación sin fricción para personal bajo presión.
