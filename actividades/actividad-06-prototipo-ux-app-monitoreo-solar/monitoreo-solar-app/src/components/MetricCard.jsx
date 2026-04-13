/* MetricCard — KPI card with icon, value, unit, trend
   Props:
     icon      (string emoji or JSX)
     label     (string)
     value     (string | number)
     unit      (string)
     trend     (string, e.g. '+12%')
     trendUp   (bool — true = positive/green, false = negative/red)
     accent    ('green'|'yellow'|'blue'|'red')
     delay     (number ms, for staggered animation)
*/
export default function MetricCard({ icon, label, value, unit, trend, trendUp = true, accent = 'green', delay = 0 }) {
  const accentMap = {
    green:  { border: 'border-energy-green-500/30',  iconBg: 'bg-energy-green-500/15',  iconText: 'text-energy-green-400',  val: 'text-energy-green-400'  },
    yellow: { border: 'border-solar-yellow-500/30',  iconBg: 'bg-solar-yellow-500/15',  iconText: 'text-solar-yellow-400',  val: 'text-solar-yellow-400'  },
    blue:   { border: 'border-medical-blue-400/30',  iconBg: 'bg-medical-blue-500/15',  iconText: 'text-medical-blue-300',  val: 'text-medical-blue-300'  },
    red:    { border: 'border-alert-red-500/30',     iconBg: 'bg-alert-red-500/15',     iconText: 'text-alert-red-400',     val: 'text-alert-red-400'     },
  };

  const a = accentMap[accent] ?? accentMap.green;

  return (
    <div
      className={`card-glow animate-fade-in-up rounded-xl border ${a.border} bg-white/5 backdrop-blur-sm p-4 flex flex-col gap-3 transition-all duration-300`}
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      {/* Icon + label row */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium text-white/60 uppercase tracking-wider`}>{label}</span>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${a.iconBg} ${a.iconText}`}>
          {icon}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-end gap-1.5">
        <span className={`text-3xl font-bold ${a.val} animate-count-up`}>{value}</span>
        {unit && <span className="text-sm text-white/50 mb-1">{unit}</span>}
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1">
          <span className={`text-xs font-semibold ${trendUp ? 'text-energy-green-400' : 'text-alert-red-400'}`}>
            {trendUp ? '▲' : '▼'} {trend}
          </span>
          <span className="text-xs text-white/40">vs. ayer</span>
        </div>
      )}
    </div>
  );
}
