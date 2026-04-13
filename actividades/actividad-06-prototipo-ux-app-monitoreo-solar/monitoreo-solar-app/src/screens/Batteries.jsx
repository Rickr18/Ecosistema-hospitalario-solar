import StatusIndicator from '../components/StatusIndicator.jsx';
import { batteryBank, batteryModules } from '../data/mockData.js';

/* ── Large charge arc ── */
function ChargeArc({ pct }) {
  const r = 70, cx = 90, cy = 90;
  const startAngle = 210, endAngle = 330; // span = 300°
  const toRad = d => (d * Math.PI) / 180;
  const arcPath = (angle) => {
    const x = cx + r * Math.cos(toRad(angle));
    const y = cy + r * Math.sin(toRad(angle));
    return { x, y };
  };

  const totalDeg = 300;
  const fillDeg = (pct / 100) * totalDeg;

  const start = arcPath(startAngle);
  const end = arcPath(endAngle);
  const fillEnd = arcPath(startAngle + fillDeg);

  // Determine color
  const color = pct >= 60 ? '#34d399' : pct >= 30 ? '#f59e0b' : '#ef4444';

  const bgArc = `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`;
  const fgArc = pct === 0 ? '' : `M ${start.x} ${start.y} A ${r} ${r} 0 ${fillDeg > 180 ? 1 : 0} 1 ${fillEnd.x} ${fillEnd.y}`;

  return (
    <svg viewBox="0 0 180 120" className="w-48 h-32 mx-auto">
      <path d={bgArc} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
      {fgArc && (
        <path d={fgArc} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }} />
      )}
      <text x={cx} y={cy - 8}  textAnchor="middle" fill={color} fontSize="28" fontWeight="800">{pct}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11">
        {batteryBank.status === 'charging' ? '↑ Cargando' : batteryBank.status === 'discharging' ? '↓ Descargando' : 'Inactivo'}
      </text>
    </svg>
  );
}

/* ── Module card ── */
function ModuleCard({ id, name, chargePercent, tempC, voltage, status }, delay) {
  const barColor = chargePercent >= 60 ? '#34d399' : chargePercent >= 30 ? '#f59e0b' : '#ef4444';
  const isWarn = status === 'warning';

  return (
    <div
      className={`animate-fade-in-up bg-white/4 rounded-xl border p-4 flex flex-col gap-3 transition-all duration-300
        ${isWarn ? 'border-solar-yellow-500/30 card-glow-yellow' : 'border-white/8 card-glow'}`}
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-xs text-white/40">{id}</p>
        </div>
        <StatusIndicator status={status} size="sm" />
      </div>

      {/* Charge bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-white/50">Carga</span>
          <span className="font-bold" style={{ color: barColor }}>{chargePercent}%</span>
        </div>
        <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full progress-fill"
            style={{ width: `${chargePercent}%`, background: barColor, boxShadow: `0 0 8px ${barColor}66` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-[10px] text-white/40">Temperatura</p>
          <p className={`text-sm font-bold ${tempC > 30 ? 'text-solar-yellow-400' : 'text-white/80'}`}>{tempC} °C</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-[10px] text-white/40">Voltaje</p>
          <p className="text-sm font-bold text-medical-blue-300">{voltage} V</p>
        </div>
      </div>
    </div>
  );
}

export default function Batteries() {
  const b = batteryBank;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* Main overview */}
      <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Charge gauge */}
        <div className="bg-white/4 border border-white/8 rounded-xl p-6 flex flex-col items-center justify-center gap-2">
          <p className="text-xs text-white/45 uppercase tracking-wider">Estado de carga</p>
          <ChargeArc pct={b.chargePercent} />
          <StatusIndicator status={b.status} size="md" />
        </div>

        {/* Key stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Energía almacenada',  value: b.currentChargeKWh,    unit: 'kWh',  color: 'text-energy-green-400'  },
            { label: 'Capacidad útil',       value: b.usableCapacityKWh,   unit: 'kWh',  color: 'text-medical-blue-300'  },
            { label: 'Flujo de potencia',    value: (b.powerFlowKW > 0 ? '+' : '') + b.powerFlowKW, unit: 'kW', color: b.powerFlowKW > 0 ? 'text-energy-green-400' : 'text-solar-yellow-400' },
            { label: 'Autonomía estimada',   value: b.estimatedAutonomyH,  unit: 'h',    color: 'text-solar-yellow-400'  },
            { label: 'Estado de salud (SoH)',value: b.stateOfHealth,       unit: '%',    color: 'text-energy-green-400'  },
            { label: 'Ciclos de carga',      value: b.cycleCount,          unit: 'ciclos', color: 'text-white/70'        },
            { label: 'Temperatura banco',    value: b.tempC,               unit: '°C',   color: b.tempC > 35 ? 'text-solar-yellow-400' : 'text-white/70' },
            { label: 'DoD máximo',           value: 80,                    unit: '%',    color: 'text-white/50'          },
          ].map(({ label, value, unit, color }, i) => (
            <div key={label} className="animate-fade-in-up bg-white/4 border border-white/8 rounded-xl p-4"
              style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}>
              <p className="text-xs text-white/45 uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>
                {value} <span className="text-sm font-normal text-white/40">{unit}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Module cards */}
      <div>
        <h2 className="text-xs text-white/45 uppercase tracking-wider mb-3">Módulos individuales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {batteryModules.map((m, i) => (
            <ModuleCard key={m.id} {...m} delay={i * 70} />
          ))}
        </div>
      </div>

      {/* Technology note */}
      <div className="animate-fade-in-up bg-medical-blue-900/40 border border-medical-blue-700/30 rounded-xl p-4 flex gap-3"
        style={{ animationDelay: '300ms', opacity: 0 }}>
        <span className="text-medical-blue-300 text-xl">ℹ</span>
        <div>
          <p className="text-xs font-semibold text-medical-blue-300 mb-0.5">Tecnología LFP — Litio Hierro Fosfato</p>
          <p className="text-xs text-white/45">
            Las baterías LFP ofrecen más de 3.000 ciclos de vida útil con BMS térmico integrado.
            La temperatura óptima de operación es 20–30 °C. El DoD máximo se limita al 80% para preservar la vida útil.
          </p>
        </div>
      </div>
    </div>
  );
}
