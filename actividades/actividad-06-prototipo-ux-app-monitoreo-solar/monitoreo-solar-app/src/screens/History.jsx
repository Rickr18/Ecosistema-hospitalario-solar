import { useState } from 'react';
import { dailyHistory, hourlyToday } from '../data/mockData.js';

/* ── SVG bar chart (multi-series) ── */
function BarChart({ data, keys, colors, yMax, height = 140 }) {
  const W = 560, H = height;
  const pad = { left: 40, right: 10, top: 10, bottom: 28 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const groupW = chartW / data.length;
  const barW   = Math.min(18, (groupW / keys.length) - 4);

  const yScale = (v) => chartH - (v / yMax) * chartH;

  // Y gridlines
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(yMax * f));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {/* Grid */}
      {yTicks.map(t => {
        const y = pad.top + yScale(t);
        return (
          <g key={t}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9">{t}</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const groupX = pad.left + i * groupW;
        return (
          <g key={i}>
            {keys.map((k, ki) => {
              const val = d[k] ?? 0;
              const h = Math.max(2, (val / yMax) * chartH);
              const x = groupX + ki * (barW + 3) + (groupW - keys.length * (barW + 3)) / 2;
              const y = pad.top + yScale(val);
              return (
                <rect key={k} x={x} y={y} width={barW} height={h} rx="3" fill={colors[ki]}
                  opacity="0.8" className="bar-animated"
                  style={{ animationDelay: `${i * 40 + ki * 20}ms` }}>
                  <title>{k}: {val} kWh</title>
                </rect>
              );
            })}
            <text x={groupX + groupW / 2} y={H - 6} textAnchor="middle"
              fill="rgba(255,255,255,0.35)" fontSize="9">{d.date}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── SVG line chart for hourly power ── */
function LineChart({ data, yMax, height = 120 }) {
  const W = 560, H = height;
  const pad = { left: 36, right: 10, top: 10, bottom: 28 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const xScale = (i) => pad.left + (i / (data.length - 1)) * chartW;
  const yScale = (v) => pad.top + chartH - (v / yMax) * chartH;

  const pts = data.map((d, i) => `${xScale(i)},${yScale(d.kw)}`).join(' ');
  const area = `M${xScale(0)},${pad.top + chartH} L${data.map((d, i) => `${xScale(i)},${yScale(d.kw)}`).join(' L')} L${xScale(data.length - 1)},${pad.top + chartH} Z`;

  // Current hour marker (index 4 = 10h)
  const nowIdx = 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {/* Grid */}
      {[0, 0.5, 1].map(f => {
        const y = pad.top + chartH - f * chartH;
        return (
          <g key={f}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9">{Math.round(yMax * f)}</text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={area} fill="url(#lineGrad)" opacity="0.3" />
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Line */}
      <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* Now marker */}
      <line x1={xScale(nowIdx)} y1={pad.top} x2={xScale(nowIdx)} y2={pad.top + chartH}
        stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
      <text x={xScale(nowIdx)} y={pad.top - 2} textAnchor="middle" fill="#60a5fa" fontSize="8">AHORA</text>

      {/* X labels */}
      {data.map((d, i) => (
        i % 2 === 0 && (
          <text key={i} x={xScale(i)} y={H - 6} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">{d.hour}</text>
        )
      ))}

      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={xScale(i)} cy={yScale(d.kw)} r="3" fill="#34d399"
          opacity={i <= nowIdx ? 1 : 0.3} />
      ))}
    </svg>
  );
}

/* ── Legend item ── */
function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-white/50">
      <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color }} />
      {label}
    </span>
  );
}

/* ── Summary stat ── */
function StatBox({ label, value, unit, color = 'text-white' }) {
  return (
    <div className="bg-white/4 border border-white/8 rounded-xl p-4 animate-fade-in-up" style={{ opacity: 0 }}>
      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value} <span className="text-sm font-normal text-white/40">{unit}</span></p>
    </div>
  );
}

export default function History() {
  const [activeTab, setActiveTab] = useState('week');

  const totalGenerated = dailyHistory.reduce((s, d) => s + d.generatedKWh, 0);
  const totalConsumed  = dailyHistory.reduce((s, d) => s + d.consumedKWh,  0);
  const totalGridKWh   = dailyHistory.reduce((s, d) => s + d.gridKWh,      0);
  const totalCO2       = dailyHistory.reduce((s, d) => s + d.co2Kg,        0);
  const selfSuf        = (((totalGenerated - totalGridKWh) / totalConsumed) * 100).toFixed(1);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'week',  label: 'Últimos 7 días' },
          { id: 'today', label: 'Hoy (por hora)'  },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer
              ${activeTab === t.id
                ? 'bg-energy-green-500/20 border border-energy-green-500/40 text-energy-green-400'
                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/70'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'week' && (
        <>
          {/* Weekly summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatBox label="Total generado"    value={totalGenerated.toLocaleString()} unit="kWh" color="text-solar-yellow-400" />
            <StatBox label="Total consumido"   value={totalConsumed.toLocaleString()}  unit="kWh" color="text-medical-blue-300"  />
            <StatBox label="Energía de red"    value={totalGridKWh.toLocaleString()}   unit="kWh" color="text-white/60"          />
            <StatBox label="CO₂ evitado"       value={totalCO2.toLocaleString()}       unit="kg"  color="text-energy-green-400"  />
            <StatBox label="Autosuficiencia"   value={selfSuf}                         unit="%"   color="text-energy-green-400"  />
          </div>

          {/* Generación vs consumo */}
          <div className="animate-fade-in-up bg-white/4 border border-white/8 rounded-xl p-5" style={{ animationDelay: '100ms', opacity: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white/80">Generación vs Consumo (kWh/día)</h2>
              <div className="flex gap-3">
                <Legend color="#f59e0b" label="Generado" />
                <Legend color="#3b82f6" label="Consumido" />
                <Legend color="#6b7280" label="Red" />
              </div>
            </div>
            <BarChart
              data={dailyHistory}
              keys={['generatedKWh', 'consumedKWh', 'gridKWh']}
              colors={['#f59e0b', '#3b82f6', '#6b7280']}
              yMax={1000}
              height={150}
            />
          </div>

          {/* CO2 avoided */}
          <div className="animate-fade-in-up bg-white/4 border border-white/8 rounded-xl p-5" style={{ animationDelay: '180ms', opacity: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white/80">CO₂ evitado (kg/día)</h2>
              <Legend color="#34d399" label="CO₂ evitado" />
            </div>
            <BarChart
              data={dailyHistory}
              keys={['co2Kg']}
              colors={['#34d399']}
              yMax={150}
              height={110}
            />
          </div>

          {/* Daily table */}
          <div className="animate-fade-in-up bg-white/4 border border-white/8 rounded-xl overflow-hidden" style={{ animationDelay: '260ms', opacity: 0 }}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/8 bg-white/3">
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Fecha</th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium">Generado</th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium">Consumido</th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium">Red</th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium">CO₂ kg</th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium">Autosuf.</th>
                </tr>
              </thead>
              <tbody>
                {dailyHistory.map((d, i) => {
                  const sf = (((d.generatedKWh - d.gridKWh) / d.consumedKWh) * 100).toFixed(0);
                  const isToday = i === dailyHistory.length - 1;
                  return (
                    <tr key={d.date} className={`border-b border-white/5 last:border-0 ${isToday ? 'bg-energy-green-500/5' : 'hover:bg-white/3'} transition-colors`}>
                      <td className="px-4 py-2.5 text-white/70 font-medium">
                        {d.date} {isToday && <span className="ml-1 text-[10px] text-energy-green-400 bg-energy-green-500/15 px-1 rounded">hoy</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right text-solar-yellow-400 font-semibold">{d.generatedKWh}</td>
                      <td className="px-4 py-2.5 text-right text-white/60">{d.consumedKWh}</td>
                      <td className="px-4 py-2.5 text-right text-white/45">{d.gridKWh}</td>
                      <td className="px-4 py-2.5 text-right text-energy-green-400">{d.co2Kg}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`font-semibold ${parseInt(sf) >= 80 ? 'text-energy-green-400' : parseInt(sf) >= 60 ? 'text-solar-yellow-400' : 'text-alert-red-400'}`}>
                          {sf}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'today' && (
        <>
          <div className="animate-fade-in-up bg-white/4 border border-white/8 rounded-xl p-5" style={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white/80">Potencia solar — Hoy, 12 Abr 2026</h2>
                <p className="text-xs text-white/40 mt-0.5">Irradiación en Barranquilla · Pico: 241 kW a las 12h</p>
              </div>
              <Legend color="#34d399" label="kW generados" />
            </div>
            <LineChart data={hourlyToday} yMax={260} height={150} />
          </div>

          {/* Hourly stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatBox label="Promedio (6–10h)"  value="110.6" unit="kW"  color="text-solar-yellow-400" />
            <StatBox label="Pico del día"       value="241.3" unit="kW"  color="text-energy-green-400" />
            <StatBox label="Generado hasta ahora" value="892.6" unit="kWh" color="text-energy-green-400" />
          </div>
        </>
      )}
    </div>
  );
}
