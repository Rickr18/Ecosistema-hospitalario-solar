# Actividad 2: Modelo básico de generación solar en Python

## Objetivo

Desarrollar un script en Python que estime la generación diaria y mensual de energía solar del Hospital Nazareth 1, calibrado con los datos reales de consumo 2018, e identificar los meses de mayor y menor producción fotovoltaica.

---

## Archivos

| Archivo | Descripción |
|---|---|
| `generacion_solar.py` | Modelo principal: carga Excel, calcula generación FV mensual y compara con consumo real |
| `monitoreo_solar.py` | Visualización complementaria con matplotlib (gráficos de barras y líneas) |

---

## Parámetros del modelo

| Parámetro | Valor | Fuente |
|---|---|---|
| Área de paneles | 500 m² | Supuesto de diseño |
| Eficiencia del sistema | 15% | Estándar paneles policristalinos |
| Irradiancia mensual | 4.38–5.95 kWh/m²/día | IDEAM / NASA POWER — Barranquilla |
| Días por mes | 30 | Constante de cálculo |
| Tarifa referencia | $650 COP/kWh | Referencia gerencial |

**Fórmula base:**

```
Generación (kWh/mes) = Irradiancia × Área × Eficiencia × Días
```

---

## Ejecución

Desde la raíz del proyecto con el `.venv` activo:

```bash
.venv\Scripts\python.exe actividades/actividad-02-modelo-basico-generacion-solar-python/generacion_solar.py
```

O desde dentro de la carpeta:

```bash
cd actividades/actividad-02-modelo-basico-generacion-solar-python
..\..\\.venv\Scripts\python.exe generacion_solar.py
```

El script imprime en consola la tabla de generación vs. consumo mensual y el ahorro estimado en COP.

---

## Salida esperada

```
Mes          Irrad.   Generación   Consumo      Cobertura   Ahorro COP
Enero        5.82     4,365 kWh    10,640 kWh   41.0%       $2,837,250
...
```

---

## Dependencias

Instaladas desde el `.venv` del proyecto:

```bash
pip install -r requirements.txt
```

Paquetes usados: `numpy`, `pandas`, `openpyxl`, `matplotlib`.

---

## Conclusión

El modelo muestra que con 500 m² y 15% de eficiencia, la generación solar cubre entre el **32% y el 43%** del consumo mensual según el mes, con los mejores valores en enero–marzo (mayor irradiancia en Barranquilla) y los valores mínimos en septiembre–octubre.
