import { alerts } from '../data/mockData.js';

export default function Header({ currentScreen }) {
  const screenTitles = {
    dashboard:   { title: 'Dashboard',          subtitle: 'Vista general del sistema energético' },
    panels:      { title: 'Paneles Solares',     subtitle: 'Estado y rendimiento de strings fotovoltaicos' },
    batteries:   { title: 'Estado de Baterías', subtitle: 'Banco LFP — 300 kWh' },
    alerts:      { title: 'Alertas',             subtitle: 'Notificaciones activas del sistema' },
    history:     { title: 'Historial',           subtitle: 'Generación y consumo — últimos 7 días' },
  };

  const { title, subtitle } = screenTitles[currentScreen] ?? screenTitles.dashboard;

  const activeAlerts = alerts.filter(a => !a.acknowledged && a.severity === 'critical').length;
  const now = new Date('2026-04-12T10:47:00');
  const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/8 bg-medical-blue-950/80 backdrop-blur-md shrink-0">
      {/* Left — breadcrumb */}
      <div>
        <h1 className="text-base font-semibold text-white leading-none">{title}</h1>
        <p className="text-xs text-white/45 mt-0.5">{subtitle}</p>
      </div>

      {/* Right — status strip */}
      <div className="flex items-center gap-4">
        {/* Live badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-energy-green-500/10 border border-energy-green-500/25 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-energy-green-400 dot-pulse-green" />
          <span className="text-xs text-energy-green-400 font-medium">EN VIVO</span>
        </div>

        {/* Critical alerts pill */}
        {activeAlerts > 0 && (
          <div className="flex items-center gap-1.5 bg-alert-red-500/15 border border-alert-red-500/40 rounded-full px-3 py-1">
            <span className="text-xs font-bold text-alert-red-400">{activeAlerts} CRÍTICA{activeAlerts > 1 ? 'S' : ''}</span>
          </div>
        )}

        {/* Date/time */}
        <div className="hidden md:block text-right">
          <p className="text-xs font-medium text-white/70">{timeStr}</p>
          <p className="text-[10px] text-white/35 capitalize">{dateStr}</p>
        </div>
      </div>
    </header>
  );
}
