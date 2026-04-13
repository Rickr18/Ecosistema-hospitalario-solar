import MetricCard from '../components/MetricCard.jsx';
import StatusIndicator from '../components/StatusIndicator.jsx';
import { systemStatus, alerts, loadsByArea, batteryBank } from '../data/mockData.js';

/* ── Mini bar chart using SVG ── */
function MiniBarChart({ data, maxVal, color = '#34d399' }) {
  const W = 280, H = 56, barW = 14, gap = 6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14">
      {data.map((d, i) => {
        const h = Math.max(4, (d.kw / maxVal) * H);
        const x = i * (barW + gap);
        const y = H - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx="3" fill={color} opacity="0.7"
              className="bar-animated" style={{ animationDelay: `${i * 50}ms` }} />
          </g>
        );
      })}
    </svg>
  );
}

/* ── Energy flow diagram ── */
function EnergyFlowDiagram({ status }) {
  const solarKW = status.solarGenerationKW;
  const loadKW  = status.totalLoadKW;
  const batKW   = batteryBank.powerFlowKW;
  const gridKW  = status.gridConsumptionKW;

  const nodeStyle = (color) => ({
    fill: color + '22', stroke: color, strokeWidth: 1.5,
  });

  return (
    <svg viewBox="0 0 360 160" className="w-full h-36">
      {/* Solar node */}
      <rect x="10" y="55" width="80" height="50" rx="10" style={nodeStyle('#f59e0b')} />
      <text x="50" y="75" textAnchor="middle" fill="#f59e0b" fontSize="18">☀️</text>
      <text x="50" y="91" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600">{solarKW} kW</text>
      <text x="50" y="103" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">Solar</text>

      {/* Battery node */}
      <rect x="10" y="118" width="80" height="38" rx="10" style={nodeStyle('#a855f7')} />
      <text x="50" y="133" textAnchor="middle" fill="#c084fc" fontSize="12">🔋</text>
      <text x="50" y="147" textAnchor="middle" fill="#c084fc" fontSize="9">{batteryBank.chargePercent}% cargada</text>

      {/* Inverter node */}
      <rect x="140" y="60" width="80" height="40" rx="10" style={nodeStyle('#34d399')} />
      <text x="180" y="76" textAnchor="middle" fill="#34d399" fontSize="11">⚡</text>
      <text x="180" y="88" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="600">Inversores</text>
      <text x="180" y="98" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8">250 kVA</text>

      {/* Load node */}
      <rect x="270" y="55" width="80" height="50" rx="10" style={nodeStyle('#3b82f6')} />
      <text x="310" y="75" textAnchor="middle" fill="#60a5fa" fontSize="18">🏥</text>
      <text x="310" y="91" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="600">{loadKW} kW</text>
      <text x="310" y="103" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">Hospital</text>

      {/* Grid node */}
      <rect x="270" y="115" width="80" height="38" rx="10" style={nodeStyle('#3b82f6')} />
      <text x="310" y="131" textAnchor="middle" fill="#60a5fa" fontSize="12">🌐</text>
      <text x="310" y="145" textAnchor="middle" fill="#60a5fa" fontSize="9">{gridKW} kW</text>

      {/* Flow lines */}
      <line x1="90" y1="80"  x2="140" y2="80"  stroke="#f59e0b" strokeWidth="2" className="flow-line" />
      <line x1="90" y1="137" x2="140" y2="90"  stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
      <line x1="220" y1="80" x2="270" y2="80"  stroke="#34d399" strokeWidth="2" className="flow-line" />
      <line x1="270" y1="130" x2="220" y2="90" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
    </svg>
  );
}

/* ── Load area row ── */
function LoadRow({ area, loadKW, priority, source }) {
  const priorityColor = {
    critical:  'text-alert-red-400',
    essential: 'text-solar-yellow-400',
    basic:     'text-medical-blue-300',
  };

  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <div className="flex-1">
        <span className="text-xs text-white/80 font-medium">{area}</span>
      </div>
      <span className={`text-[10px] font-semibold uppercase ${priorityColor[priority]}`}>{priority}</span>
      <span className="text-xs text-white/50 w-14 text-right">{loadKW} kW</span>
      <span className="text-[10px] text-energy-green-400/70 bg-energy-green-500/10 rounded px-1.5">{source}</span>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const criticalAlerts = alerts.filter(a => !a.acknowledged && a.severity === 'critical');

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* ── Critical alert banner ── */}
      {criticalAlerts.length > 0 && (
        <div className="animate-fade-in bg-alert-red-500/10 border border-alert-red-500/40 rounded-xl p-4 flex items-start gap-3">
          <span className="text-alert-red-400 text-xl mt-0.5 animate-pulse-slow">⚠</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-alert-red-400 mb-0.5">
              {criticalAlerts.length} alerta{criticalAlerts.length > 1 ? 's' : ''} crítica{criticalAlerts.length > 1 ? 's' : ''} activa{criticalAlerts.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-white/60">{criticalAlerts[0].title}</p>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="text-xs text-alert-red-400 border border-alert-red-500/40 rounded-lg px-3 py-1.5 hover:bg-alert-red-500/15 transition-colors cursor-pointer"
          >
            Ver alertas
          </button>
        </div>
      )}

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon="☀️" label="Generación solar"   value={systemStatus.solarGenerationKW} unit="kW"  trend="+8.4%"  trendUp accent="yellow" delay={0}   />
        <MetricCard icon="⚡" label="Consumo total"       value={systemStatus.totalLoadKW}       unit="kW"  trend="+1.2%"  trendUp={false} accent="blue" delay={80}  />
        <MetricCard icon="🔋" label="Batería"             value={systemStatus.batteryChargePercent} unit="%" trend="+5%"   trendUp accent="green" delay={160} />
        <MetricCard icon="🌿" label="CO₂ evitado (hoy)"  value={systemStatus.co2SavedKgToday}   unit="kg" trend="+12.1%" trendUp accent="green" delay={240} />
      </div>

      {/* ── Second row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon="📦" label="Energía generada hoy" value={systemStatus.energyGeneratedTodayKWh} unit="kWh" trend="+6%" trendUp accent="yellow" delay={60}  />
        <MetricCard icon="🏆" label="Pico de hoy"          value={systemStatus.peakGenerationKW}        unit="kW"  accent="yellow" delay={140} />
        <MetricCard icon="🌐" label="Consumo red"           value={systemStatus.gridConsumptionKW}       unit="kW"  trend="-18%" trendUp accent="blue" delay={220} />
        <MetricCard icon="💡" label="Autosuficiencia"       value={systemStatus.selfSufficiencyPercent}  unit="%"   trend="+3.1%" trendUp accent="green" delay={300} />
      </div>

      {/* ── Main panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Energy flow */}
        <div className="lg:col-span-2 animate-fade-in-up bg-white/4 border border-white/8 rounded-xl p-5" style={{ animationDelay: '100ms', opacity: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/80">Flujo energético en tiempo real</h2>
            <StatusIndicator status="normal" label="Sistema estable" size="sm" />
          </div>
          <EnergyFlowDiagram status={systemStatus} />
        </div>

        {/* Loads by area */}
        <div className="animate-fade-in-up bg-white/4 border border-white/8 rounded-xl p-5" style={{ animationDelay: '180ms', opacity: 0 }}>
          <h2 className="text-sm font-semibold text-white/80 mb-3">Cargas por área</h2>
          {loadsByArea.map(l => (
            <LoadRow key={l.area} {...l} />
          ))}
        </div>
      </div>

    </div>
  );
}
