# Actividad 5: Identificación de un problema digital en hospitales mediante Design Thinking

## Introducción

El Design Thinking es una metodología de innovación centrada en el ser humano que permite identificar problemas reales, empatizar con los usuarios y generar soluciones creativas. Dentro de la gerencia de proyectos sostenibles, esta metodología se convierte en una herramienta poderosa para orientar el desarrollo de productos digitales hacia necesidades reales y prioritarias del entorno hospitalario.

Esta actividad aplica las cinco etapas del Design Thinking al contexto energético del **Hospital Nazareth 1 (Barranquilla, Colombia)**, utilizando los datos reales de consumo 2018 derivados de las Actividades 2, 3 y 4.

---

## Objetivo

Aplicar la metodología Design Thinking para identificar y definir un problema digital relevante en el contexto hospitalario relacionado con la gestión energética solar, formulando un reto de innovación claro que sirva de base para el desarrollo del producto digital.

---

## Contexto cuantitativo (datos reales 2018)

| Indicador | Valor |
|---|---|
| Consumo anual total | 435,323 kWh |
| Costo anual estimado | $283.0 M COP |
| Cobertura solar estimada | 28.4% |
| Área de mayor consumo | HVAC (27%) |
| Áreas clínicas críticas | UCI (19%) + Quirófanos (23%) = 42% |
| Meses de mayor consumo | Mayo, Octubre, Agosto |

---

## Desarrollo — 5 Etapas del Design Thinking

### Etapa 1: Empatizar

Se identificaron **4 perfiles de usuario** con roles distintos en la gestión energética hospitalaria:

| Perfil | Dolor principal | Ganancia esperada |
|---|---|---|
| Jefe de Mantenimiento | Sin visibilidad en tiempo real del balance generación-consumo | Panel único con KPIs energéticos y alertas automáticas |
| Gerente Administrativo | Reportes dispersos sin proyección financiera del solar | Dashboard financiero con ahorro acumulado y ROI |
| Jefe de UCI / Quirófanos | No sabe si el solar garantiza continuidad en áreas críticas | Semáforo de disponibilidad energética por área |
| Técnico de Planta Solar | Opera sin datos digitales; diagnóstico tardío de fallas | App móvil con telemetría solar y mantenimiento predictivo |

**Artefacto generado:** `mapa_empatia.png`

---

### Etapa 2: Definir

**Declaración del problema (¿Cómo podríamos...?):**

> ¿Cómo podríamos brindar al personal del Hospital Nazareth 1 visibilidad en tiempo real del balance entre generación solar y consumo eléctrico por área, para que puedan tomar decisiones proactivas que reduzcan costos y garanticen la continuidad energética en servicios críticos?

**Puntos de dolor priorizados (impacto 1–10):**

1. Sin monitoreo en tiempo real — impacto **9.5**
2. Reportes manuales propensos a error — impacto **8.8**
3. Sin alertas automáticas de consumo — impacto **8.2**
4. Diagnóstico tardío de fallas solares — impacto **7.5**
5. Sin correlación generación-consumo — impacto **7.0**
6. Decisiones gerenciales sin datos confiables — impacto **6.3**

---

### Etapa 3: Idear

**Journey Map del Jefe de Mantenimiento** — 7 momentos críticos del día:

| Etapa | Herramienta actual | Oportunidad digital |
|---|---|---|
| Inicio de turno (6 AM) | Correo / Excel | Dashboard de apertura de turno |
| Monitoreo matutino | Medidores físicos / teléfono | Lectura automática con IoT |
| Alerta de consumo alto | Llamadas internas / recorrido | Notificaciones automáticas por umbral |
| Generación solar (9–15h) | Inversor físico sin interfaz | Balance generación vs consumo en vivo |
| Reporte mensual | Excel + capturas manuales | Reporte automático PDF/XLSX exportable |
| Planificación mantenimiento | Calendario papel / intuición | Mantenimiento predictivo con ML |
| Cierre de turno (6 PM) | Planilla manual / verbal | Log digital automático de turno |

**Artefacto generado:** `journey_map.png`

---

### Etapa 4: Prototipar

**4 Retos de innovación identificados:**

1. **Plataforma de monitoreo en tiempo real** — Dashboard web/móvil con lectura IoT de medidores; balance solar vs consumo por área y alertas push.
2. **Motor de reportes automáticos** — Generación automática de informes PDF/Excel mensual; KPIs financieros y ambientales para gerencia.
3. **Semáforo de criticidad energética** — Indicador visual por área (UCI, Quirófanos, HVAC) con umbral configurable y protocolo de contingencia integrado.
4. **Mantenimiento predictivo solar** — Análisis de curvas de generación para detectar paneles degradados y agendar limpieza óptima.

**Artefacto generado:** `reto_innovacion.png`

---

### Etapa 5: Evaluar

**Métricas de éxito propuestas:**

- Reducción del tiempo de elaboración de reportes: de 8+ horas a < 30 minutos
- Detección de picos de consumo: < 5 minutos desde el evento
- Reducción de costo energético: 15% en el primer año
- ROI del sistema solar correctamente calculado con datos reales en tiempo real
- Continuidad energética en UCI y Quirófanos: 99.9% disponibilidad

---

## Artefactos generados

| Archivo | Descripción |
|---|---|
| `mapa_empatia.png` | Mapa de empatía con los 4 perfiles de usuario del sistema hospitalario solar |
| `journey_map.png` | Journey Map del Jefe de Mantenimiento — 7 etapas del día con dolores y oportunidades |
| `reto_innovacion.png` | Declaración del problema HMW, puntos de dolor y 4 retos de innovación digital |
| `resumen_design_thinking.png` | Lámina resumen con las 5 etapas del DT y el reto de innovación consolidado |

---

## Ejecución

```bash
# Desde la carpeta de la actividad
python design_thinking.py
```

**Requisitos:**
```bash
pip install matplotlib numpy
```

---

## Conclusión

A través de esta actividad, se aplicó Design Thinking al contexto real del Hospital Nazareth 1, identificando que el problema central es la **ausencia de visibilidad digital en tiempo real del balance entre generación solar y consumo eléctrico**. Este hallazgo, fundamentado en datos reales de 435,323 kWh anuales y $283 M COP de costo energético, define el reto de innovación que guiará el desarrollo del producto digital en las siguientes actividades.

Las competencias desarrolladas — empatía, pensamiento creativo y definición de problemas complejos — son esenciales en la gerencia de proyectos sostenibles orientados hacia necesidades humanas reales y prioritarias.
