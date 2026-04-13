# Actividad 3: Simulación de la demanda energética hospitalaria

## Objetivo

Construir una simulación horaria del consumo energético del Hospital Nazareth 1, desagregada por áreas críticas, calibrada con los datos reales de consumo mensual 2018 (enero–noviembre), y presentada en un **reporte HTML interactivo** generado automáticamente.

---

## Archivos

| Archivo | Descripción |
|---|---|
| `simulacion_demanda_energetica.py` | Script principal: simula demanda horaria y genera `reporte_demanda.html` |
| `reporte_demanda.html` | Reporte visual completo — abrir directamente en el navegador |

> El reporte HTML es el entregable principal. No requiere servidor ni dependencias externas para visualizarse.

---

## Áreas simuladas y pesos de consumo

| Área | Peso | Perfil de demanda |
|---|---|---|
| HVAC | 27% | Pico en horas de mayor temperatura y ocupación (8–17h) |
| Quirófanos | 23% | Alta demanda diurna (7–18h), reducida en fines de semana |
| UCI | 19% | Carga casi constante 24/7 con leve variación diurna |
| Iluminación | 12% | Mayor consumo nocturno (18–6h) |
| Data Center | 11% | Carga base alta con incremento en horario administrativo |
| Farmacia | 8% | Cadena de frío + despacho en horas laborales |

---

## Metodología de simulación

1. Para cada área se calcula un **factor horario** según el tipo de uso (perfiles reales de hospitales).
2. Se añade ruido aleatorio (±6%) para simular variación operativa diaria.
3. La serie horaria se **calibra** al consumo real mensual del Excel (escalado proporcional).
4. Se concatenan los 11 meses (enero–noviembre 2018) en una serie continua de ~8.000 horas.

---

## Contenido del reporte HTML

El archivo `reporte_demanda.html` contiene todo en una sola página autocontenida:

| Sección | Descripción |
|---|---|
| KPI cards | Energía total, demanda horaria/diaria promedio, pico máximo |
| Participación por área | Barras horizontales con porcentaje de cada área |
| Perfil diario | Gráfico de líneas — demanda promedio por hora del día |
| Perfil semanal | Barras apiladas por día de la semana |
| Perfil mensual | Barras apiladas por mes (enero–noviembre) |
| Mapa de calor | Grid mes × hora — intensidad de demanda con escala de color |
| Picos por área | Cards con el pico máximo de cada área y su fecha |
| Top 10 horas | Tabla con las 10 horas de mayor demanda del año |

Los gráficos usan **Chart.js** (CDN). El heatmap es CSS puro. Los datos van embebidos como JSON en el HTML — sin servidor, sin dependencias locales para abrirlo.

---

## Ejecución

Desde la raíz del proyecto con el `.venv` activo:

```bash
.venv\Scripts\python.exe actividades/actividad-03-simulacion-demanda-energetica-hospitalaria/simulacion_demanda_energetica.py
```

El script imprime el resumen de calibración y picos en consola, luego genera `reporte_demanda.html` en la misma carpeta.

Abrir el reporte en Windows:
```bash
start actividades/actividad-03-simulacion-demanda-energetica-hospitalaria/reporte_demanda.html
```

---

## Indicadores clave (resultado típico)

| Indicador | Valor |
|---|---|
| Energía total simulada Ene–Nov | ~130,080 kWh |
| Demanda horaria promedio | ~16.2 kWh/h |
| Demanda diaria promedio | ~389 kWh/día |
| Pico máximo global | ~32.9 kWh/h (septiembre) |

---

## Dependencias

```bash
pip install -r requirements.txt
```

Paquetes usados: `numpy`, `pandas`, `openpyxl`. No requiere `matplotlib`.

---

## Conclusión

La simulación muestra que **HVAC y Quirófanos concentran el 50% del consumo** y que los picos ocurren consistentemente en septiembre. El reporte HTML permite analizar estos patrones de forma interactiva sin instalar nada adicional.
