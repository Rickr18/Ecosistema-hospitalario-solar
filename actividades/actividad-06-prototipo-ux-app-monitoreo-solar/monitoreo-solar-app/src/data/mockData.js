/* ─────────────────────────────────────────────────────────────
   Mock data — SolarMonitor Hospital
   Simulates real-time data from a 250 kWp solar array + 300 kWh
   battery bank serving a 250-bed hospital in Barranquilla, CO.
───────────────────────────────────────────────────────────── */

// ── System overview ──────────────────────────────────────────
export const systemStatus = {
  overall: 'normal',          // 'normal' | 'warning' | 'critical'
  lastUpdate: '2026-04-12T10:47:00',
  solarGenerationKW: 187.4,
  gridConsumptionKW: 42.1,
  batteryChargePercent: 74,
  totalLoadKW: 229.5,
  selfSufficiencyPercent: 81.6,
  co2SavedKgToday: 134.2,
  energyGeneratedTodayKWh: 892.6,
  peakGenerationKW: 241.3,
};

// ── Solar panels ─────────────────────────────────────────────
export const solarPanels = [
  { id: 'STR-A1', name: 'String A-1', location: 'Cubierta Norte',   panels: 24, powerKW: 38.4, efficiency: 97.2, tempC: 42, status: 'normal'   },
  { id: 'STR-A2', name: 'String A-2', location: 'Cubierta Norte',   panels: 24, powerKW: 37.9, efficiency: 96.1, tempC: 43, status: 'normal'   },
  { id: 'STR-B1', name: 'String B-1', location: 'Cubierta Sur',     panels: 24, powerKW: 39.1, efficiency: 98.5, tempC: 41, status: 'normal'   },
  { id: 'STR-B2', name: 'String B-2', location: 'Cubierta Sur',     panels: 24, powerKW: 36.2, efficiency: 91.8, tempC: 48, status: 'warning'  },
  { id: 'STR-C1', name: 'String C-1', location: 'Cubierta Este',    panels: 20, powerKW: 21.4, efficiency: 88.6, tempC: 51, status: 'warning'  },
  { id: 'STR-C2', name: 'String C-2', location: 'Cubierta Este',    panels: 20, powerKW: 14.4, efficiency: 59.8, tempC: 67, status: 'critical' },
];

export const inverters = [
  { id: 'INV-1', name: 'Inversor 1', ratedKVA: 125, outputKW: 98.4,  efficiency: 98.3, tempC: 38, status: 'normal'  },
  { id: 'INV-2', name: 'Inversor 2', ratedKVA: 125, outputKW: 89.0,  efficiency: 97.8, tempC: 40, status: 'normal'  },
];

// ── Battery bank ─────────────────────────────────────────────
export const batteryBank = {
  totalCapacityKWh: 300,
  usableCapacityKWh: 240,   // 80% DoD
  currentChargeKWh: 222,
  chargePercent: 74,
  powerFlowKW: +18.4,       // positive = charging, negative = discharging
  stateOfHealth: 96.2,
  cycleCount: 412,
  estimatedAutonomyH: 3.8,
  tempC: 29,
  status: 'charging',       // 'charging' | 'discharging' | 'idle' | 'warning'
};

export const batteryModules = [
  { id: 'BAT-1', name: 'Módulo 1', chargePercent: 76, tempC: 28, voltage: 51.2, status: 'normal'  },
  { id: 'BAT-2', name: 'Módulo 2', chargePercent: 75, tempC: 29, voltage: 51.1, status: 'normal'  },
  { id: 'BAT-3', name: 'Módulo 3', chargePercent: 73, tempC: 30, voltage: 50.9, status: 'normal'  },
  { id: 'BAT-4', name: 'Módulo 4', chargePercent: 72, tempC: 31, voltage: 50.7, status: 'warning' },
];

// ── Alerts ───────────────────────────────────────────────────
export const alerts = [
  {
    id: 'ALT-001',
    severity: 'critical',
    title: 'Temperatura crítica — String C-2',
    message: 'La temperatura del string C-2 supera 65 °C. Riesgo de daño en módulos fotovoltaicos. Inspección inmediata requerida.',
    area: 'Paneles Solares',
    timestamp: '2026-04-12T10:42:00',
    acknowledged: false,
  },
  {
    id: 'ALT-002',
    severity: 'warning',
    title: 'Eficiencia reducida — String B-2',
    message: 'La eficiencia del string B-2 ha caído a 91.8%. Posible acumulación de polvo o sombra parcial.',
    area: 'Paneles Solares',
    timestamp: '2026-04-12T09:15:00',
    acknowledged: false,
  },
  {
    id: 'ALT-003',
    severity: 'warning',
    title: 'Temperatura elevada — Módulo BAT-4',
    message: 'Temperatura del módulo de batería 4 en 31 °C, por encima del umbral recomendado de 30 °C.',
    area: 'Baterías',
    timestamp: '2026-04-12T10:05:00',
    acknowledged: false,
  },
  {
    id: 'ALT-004',
    severity: 'info',
    title: 'Mantenimiento programado',
    message: 'Mantenimiento preventivo de inversores programado para el 15/04/2026. Se estima 2 horas de ventana de trabajo.',
    area: 'Inversores',
    timestamp: '2026-04-11T08:00:00',
    acknowledged: true,
  },
  {
    id: 'ALT-005',
    severity: 'critical',
    title: 'Pérdida de comunicación — String C-1',
    message: 'Sin datos de telemetría del string C-1 durante los últimos 8 minutos. Verificar conexión del datalogger.',
    area: 'Comunicaciones',
    timestamp: '2026-04-12T10:39:00',
    acknowledged: false,
  },
  {
    id: 'ALT-006',
    severity: 'info',
    title: 'Generación diaria récord',
    message: 'La generación acumulada de hoy (892.6 kWh) supera el promedio mensual en un 12%. Excelentes condiciones de irradiación.',
    area: 'Sistema',
    timestamp: '2026-04-12T10:00:00',
    acknowledged: true,
  },
];

// ── History / time-series (last 7 days) ──────────────────────
export const dailyHistory = [
  { date: '06 Abr', generatedKWh: 748, consumedKWh: 812, gridKWh: 210, co2Kg: 107 },
  { date: '07 Abr', generatedKWh: 801, consumedKWh: 834, gridKWh: 178, co2Kg: 115 },
  { date: '08 Abr', generatedKWh: 612, consumedKWh: 809, gridKWh: 312, co2Kg: 88  },
  { date: '09 Abr', generatedKWh: 870, consumedKWh: 841, gridKWh: 91,  co2Kg: 125 },
  { date: '10 Abr', generatedKWh: 921, consumedKWh: 856, gridKWh: 58,  co2Kg: 132 },
  { date: '11 Abr', generatedKWh: 843, consumedKWh: 828, gridKWh: 104, co2Kg: 121 },
  { date: '12 Abr', generatedKWh: 892, consumedKWh: 847, gridKWh: 42,  co2Kg: 134 },
];

export const hourlyToday = [
  { hour: '06h', kw: 12  }, { hour: '07h', kw: 38  }, { hour: '08h', kw: 82  },
  { hour: '09h', kw: 134 }, { hour: '10h', kw: 187 }, { hour: '11h', kw: 224 },
  { hour: '12h', kw: 241 }, { hour: '13h', kw: 238 }, { hour: '14h', kw: 219 },
  { hour: '15h', kw: 192 }, { hour: '16h', kw: 156 }, { hour: '17h', kw: 98  },
  { hour: '18h', kw: 31  }, { hour: '19h', kw: 4   },
];

// ── Loads by area ─────────────────────────────────────────────
export const loadsByArea = [
  { area: 'UCI',          loadKW: 45, priority: 'critical', source: 'solar' },
  { area: 'Quirófanos',   loadKW: 60, priority: 'critical', source: 'solar' },
  { area: 'HVAC',         loadKW: 70, priority: 'essential', source: 'solar+grid' },
  { area: 'Data Center',  loadKW: 22, priority: 'critical', source: 'solar' },
  { area: 'Farmacia',     loadKW: 18, priority: 'essential', source: 'solar' },
  { area: 'Iluminación',  loadKW: 14.5, priority: 'basic', source: 'solar' },
];
