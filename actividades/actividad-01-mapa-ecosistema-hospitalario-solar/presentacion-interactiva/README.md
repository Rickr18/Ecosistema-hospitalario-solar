# Presentación Interactiva — Ecosistema Hospitalario Solar

Presentación web interactiva de alto nivel sobre el **Ecosistema Hospitalario Solar: Sede Nazareth 1**, construida con **React + Vite + Tailwind CSS v4**.

## 🎨 Estilo Visual
- Paleta: azul médico, verde energía y blanco limpio
- Diseño profesional, minimalista y tecnológico
- Animaciones de scroll-reveal fluidas
- Diagrama SVG animado de flujo de energía

## �� Secciones

| # | Sección | Descripción |
|---|---------|-------------|
| 0 | **Hero** | Landing con stats clave y CTAs |
| 1 | **Visión Sistémica** | Infografía de la tríada: Infraestructura, Energía y Gestión Sostenible |
| 2 | **Mapa del Ecosistema** | Flujo de energía Solar → Inversores → Áreas Críticas (UCI, Farmacia, Data Center) |
| 3 | **Flujo de Datos Real** | Pipeline: Data 2018 → Pandas → Modelo Python → Dashboard gerencial + snippet de código |
| 4 | **Análisis de Retos** | Tarjetas: Costos, Espacio, Mantenimiento, Integración eléctrica |
| 5 | **Impacto Triple Resultado** | Eficiencia económica, Responsabilidad ambiental, Seguridad del paciente |

## 🚀 Comandos de instalación y ejecución

```bash
# 1. Entrar al directorio
cd presentacion-interactiva

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo (http://localhost:5173)
npm run dev

# 4. Construir para producción
npm run build

# 5. Previsualizar el build
npm run preview
```

## 🛠️ Stack tecnológico

| Herramienta | Versión | Propósito |
|------------|---------|-----------|
| React | 19.x | Framework UI |
| Vite | 7.x | Build tool y dev server |
| Tailwind CSS | 4.x | Utility-first CSS |
| @tailwindcss/vite | 4.x | Plugin Tailwind para Vite |

## 📁 Estructura del proyecto

```
presentacion-interactiva/
├── index.html              ← HTML principal (con meta SEO y fuente Inter)
├── vite.config.js          ← Config Vite + plugin Tailwind
├── package.json
├── src/
│   ├── main.jsx            ← Punto de entrada React
│   ├── App.jsx             ← Componente raíz con todas las slides
│   ├── App.css             ← Estilos de scroll-reveal y animaciones SVG
│   └── index.css           ← Tailwind v4 + custom theme tokens + keyframes
└── public/
    └── vite.svg
```

## 🔑 Nota sobre Tailwind v4
Esta presentación usa Tailwind CSS v4 con el plugin oficial `@tailwindcss/vite`.
La configuración se hace mediante directivas CSS en `src/index.css` (no requiere `tailwind.config.js`).
