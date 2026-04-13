import { alerts } from '../data/mockData.js';

const nav = [
  { id: 'dashboard', icon: '⚡', label: 'Dashboard' },
  { id: 'panels',    icon: '☀️', label: 'Paneles Solares' },
  { id: 'batteries', icon: '🔋', label: 'Baterías' },
  { id: 'alerts',    icon: '🔔', label: 'Alertas' },
  { id: 'history',   icon: '📊', label: 'Historial' },
];

export default function Sidebar({ current, onNavigate }) {
  const criticalCount = alerts.filter(a => !a.acknowledged && a.severity === 'critical').length;
  const warningCount  = alerts.filter(a => !a.acknowledged && a.severity === 'warning').length;
  const totalUnread   = criticalCount + warningCount;

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-white/8 bg-medical-blue-950/90 backdrop-blur-md">
      {/* Logo / app name */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-solar-yellow-400 to-energy-green-500 flex items-center justify-center text-sm font-bold text-medical-blue-950">
          S
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">SolarMonitor</p>
          <p className="text-[10px] text-white/40 mt-0.5">Hospital Central</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-1">
        {nav.map(item => {
          const isActive = current === item.id;
          const showBadge = item.id === 'alerts' && totalUnread > 0;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-left
                ${isActive
                  ? 'bg-energy-green-500/15 border-l-2 border-energy-green-400 text-energy-green-400 pl-[10px]'
                  : 'text-white/55 hover:text-white hover:bg-white/6 border-l-2 border-transparent'
                }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="min-w-[18px] h-[18px] rounded-full bg-alert-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {totalUnread}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom — system info */}
      <div className="px-4 py-4 border-t border-white/8">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Sistema</p>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-energy-green-400 dot-pulse-green" />
            <span className="text-xs text-white/60">SCADA activo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-energy-green-400" />
            <span className="text-xs text-white/60">Inversores OK</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
