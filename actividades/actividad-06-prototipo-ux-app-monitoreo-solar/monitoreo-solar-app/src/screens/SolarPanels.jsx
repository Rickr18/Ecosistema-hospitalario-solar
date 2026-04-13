import StatusIndicator from '../components/StatusIndicator.jsx';
import { solarPanels, inverters, systemStatus } from '../data/mockData.js';

/* ── Efficiency ring ── */
function EfficiencyRing({ pct, color = '#34d399', size = 64 }) {
  const r = 26, cx = 32, cy = 32;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 32 32)" style={{ transition: 'stroke-dasharray 0.8s ease-out' }} />
      <text x={cx} y={cy + 5} textAnchor="middle" fill={color} fontSize="11" fontWeight="700">
        {pct}%
      </text>
    </svg>
  );
}

/* ── String card ── */
function StringCard({ id, name, location, panels, powerKW, efficiency, tempC, status }, delay) {
  const statusColors = {
    normal:   { ring: '#34d399', tempBg: 'bg-energy-green-500/10', tempText: 'text-energy-green-400' },
    warning:  { ring: '#f59e0b', tempBg: 'bg-solar-yellow-500/10', tempText: 'text-solar-yellow-400' },
    critical: { ring: '#ef4444', tempBg: 'bg-alert-red-500/10',    tempText: 'text-alert-red-400'    },
  };
  const c = statusColors[status] ?? statusColors.normal;

  return (
    <div
      className={`animate-fade-in-up bg-white/4 border border-white/8 rounded-xl p-5 flex flex-col gap-4 transition-all duration-300
        ${status === 'critical' ? 'border-alert-red-500/40 card-glow-red' : status === 'warning' ? 'border-solar-yellow-500/30 card-glow-yellow' : 'card-glow'}`}
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-white">{name}</p>
          <p className="text-xs text-white/45">{location} · {panels} paneles</p>
        </div>
        <StatusIndicator status={status} size="sm" />
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-4">
        <EfficiencyRing pct={Math.round(efficiency)} color={c.ring} />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/50">Potencia</span>
            <span className="text-sm font-bold text-white">{powerKW} kW</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/50">Eficiencia</span>
            <span className={`text-sm font-semibold ${c.tempText}`}>{efficiency}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/50">Temperatura</span>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${c.tempBg} ${c.tempText}`}>
              {tempC} °C
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-[10px] text-white/40 mb-1">
          <span>Rendimiento relativo</span>
          <span>{efficiency}%</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full progress-fill"
            style={{ width: `${efficiency}%`, background: c.ring }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Inverter row ── */
function InverterRow({ id, name, ratedKVA, outputKW, efficiency, tempC, status }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/6 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-energy-green-500/15 flex items-center justify-center text-sm">⚡</div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-white">{name}</p>
        <p className="text-[10px] text-white/40">{ratedKVA} kVA nominal</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-energy-green-400">{outputKW} kW</p>
        <p className="text-[10px] text-white/40">{efficiency}% ef.</p>
      </div>
      <div className="text-right w-14">
        <p className={`text-xs font-medium ${tempC > 45 ? 'text-solar-yellow-400' : 'text-white/60'}`}>{tempC} °C</p>
      </div>
      <StatusIndicator status={status} label={false} size="sm" />
    </div>
  );
}

export default function SolarPanels() {
  const totalPower = solarPanels.reduce((s, p) => s + p.powerKW, 0).toFixed(1);
  const avgEfficiency = (solarPanels.reduce((s, p) => s + p.efficiency, 0) / solarPanels.length).toFixed(1);
  const critCount = solarPanels.filter(p => p.status === 'critical').length;
  const warnCount = solarPanels.filter(p => p.status === 'warning').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* Summary bar */}
      <div className="animate-fade-in grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/4 border border-white/8 rounded-xl p-4">
          <p className="text-xs text-white/45 uppercase tracking-wider mb-1">Potencia total</p>
          <p className="text-2xl font-bold text-solar-yellow-400">{totalPower} <span className="text-sm font-normal text-white/50">kW</span></p>
        </div>
        <div className="bg-white/4 border border-white/8 rounded-xl p-4">
          <p className="text-xs text-white/45 uppercase tracking-wider mb-1">Eficiencia media</p>
          <p className="text-2xl font-bold text-energy-green-400">{avgEfficiency} <span className="text-sm font-normal text-white/50">%</span></p>
        </div>
        <div className={`border rounded-xl p-4 ${critCount > 0 ? 'bg-alert-red-500/10 border-alert-red-500/30' : 'bg-white/4 border-white/8'}`}>
          <p className="text-xs text-white/45 uppercase tracking-wider mb-1">Críticos</p>
          <p className={`text-2xl font-bold ${critCount > 0 ? 'text-alert-red-400' : 'text-white/30'}`}>{critCount}</p>
        </div>
        <div className={`border rounded-xl p-4 ${warnCount > 0 ? 'bg-solar-yellow-500/10 border-solar-yellow-500/30' : 'bg-white/4 border-white/8'}`}>
          <p className="text-xs text-white/45 uppercase tracking-wider mb-1">Advertencias</p>
          <p className={`text-2xl font-bold ${warnCount > 0 ? 'text-solar-yellow-400' : 'text-white/30'}`}>{warnCount}</p>
        </div>
      </div>

      {/* String cards */}
      <div>
        <h2 className="text-xs text-white/45 uppercase tracking-wider mb-3">Strings fotovoltaicos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {solarPanels.map((p, i) => (
            <StringCard key={p.id} {...p} delay={i * 70} />
          ))}
        </div>
      </div>

      {/* Inverters */}
      <div className="animate-fade-in-up bg-white/4 border border-white/8 rounded-xl p-5" style={{ animationDelay: '200ms', opacity: 0 }}>
        <h2 className="text-sm font-semibold text-white/80 mb-3">Inversores híbridos</h2>
        {inverters.map(inv => <InverterRow key={inv.id} {...inv} />)}
      </div>
    </div>
  );
}
