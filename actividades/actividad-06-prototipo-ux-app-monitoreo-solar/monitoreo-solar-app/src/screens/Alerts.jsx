import { useState } from 'react';
import AlertBadge from '../components/AlertBadge.jsx';
import { alerts as initialAlerts } from '../data/mockData.js';

function formatTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

/* ── Alert card ── */
function AlertCard({ alert, onAcknowledge, delay = 0 }) {
  const { id, severity, title, message, area, timestamp, acknowledged } = alert;

  const severityStyle = {
    critical: {
      border: 'border-alert-red-500/40',
      bg: acknowledged ? 'bg-white/2' : 'bg-alert-red-500/8',
      icon: '🚨',
      iconBg: 'bg-alert-red-500/15',
    },
    warning: {
      border: 'border-solar-yellow-500/30',
      bg: acknowledged ? 'bg-white/2' : 'bg-solar-yellow-500/8',
      icon: '⚠️',
      iconBg: 'bg-solar-yellow-500/15',
    },
    info: {
      border: 'border-medical-blue-400/20',
      bg: 'bg-white/2',
      icon: 'ℹ️',
      iconBg: 'bg-medical-blue-500/15',
    },
  };

  const s = severityStyle[severity] ?? severityStyle.info;

  return (
    <div
      className={`animate-fade-in-up border rounded-xl p-4 flex gap-4 transition-all duration-300
        ${s.border} ${s.bg} ${acknowledged ? 'opacity-55' : ''}`}
      style={{ animationDelay: `${delay}ms`, opacity: acknowledged ? 0.55 : 0 }}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center text-xl shrink-0`}>
        {s.icon}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-white leading-snug">{title}</p>
          <AlertBadge severity={severity} />
        </div>
        <p className="text-xs text-white/55 leading-relaxed mb-2">{message}</p>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/35 bg-white/5 rounded px-1.5 py-0.5">{area}</span>
          <span className="text-[10px] text-white/30">{formatDate(timestamp)} · {formatTime(timestamp)}</span>
          {acknowledged && (
            <span className="text-[10px] text-energy-green-400/70 bg-energy-green-500/10 rounded px-1.5 py-0.5">✓ Reconocida</span>
          )}
        </div>
      </div>

      {/* Action */}
      {!acknowledged && (
        <button
          onClick={() => onAcknowledge(id)}
          className="shrink-0 self-start text-xs border border-white/15 text-white/50 rounded-lg px-3 py-1.5 hover:bg-white/8 hover:text-white/80 transition-colors cursor-pointer"
        >
          Reconocer
        </button>
      )}
    </div>
  );
}

export default function Alerts() {
  const [alertList, setAlertList] = useState(initialAlerts);
  const [filter, setFilter] = useState('all');

  const handleAcknowledge = (id) => {
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const filtered = alertList.filter(a => {
    if (filter === 'active')   return !a.acknowledged;
    if (filter === 'critical') return a.severity === 'critical';
    if (filter === 'warning')  return a.severity === 'warning';
    return true;
  });

  // Sort: unacknowledged first, then by severity weight, then by time desc
  const severityWeight = { critical: 0, warning: 1, info: 2 };
  const sorted = [...filtered].sort((a, b) => {
    if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
    if (severityWeight[a.severity] !== severityWeight[b.severity])
      return severityWeight[a.severity] - severityWeight[b.severity];
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  const counts = {
    critical: alertList.filter(a => !a.acknowledged && a.severity === 'critical').length,
    warning:  alertList.filter(a => !a.acknowledged && a.severity === 'warning').length,
    total:    alertList.filter(a => !a.acknowledged).length,
  };

  const filters = [
    { id: 'all',      label: 'Todas',     count: alertList.length },
    { id: 'active',   label: 'Activas',   count: counts.total,    badge: counts.total > 0 },
    { id: 'critical', label: 'Críticas',  count: counts.critical, badge: counts.critical > 0 },
    { id: 'warning',  label: 'Advertencias', count: counts.warning },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">

      {/* Summary pills */}
      <div className="animate-fade-in flex flex-wrap gap-3">
        {counts.critical > 0 && (
          <div className="flex items-center gap-2 bg-alert-red-500/15 border border-alert-red-500/40 rounded-xl px-4 py-2.5">
            <span className="text-alert-red-400 text-lg animate-pulse-slow">🚨</span>
            <div>
              <p className="text-xs text-alert-red-400 font-bold">{counts.critical} crítica{counts.critical > 1 ? 's' : ''}</p>
              <p className="text-[10px] text-white/40">Requiere atención inmediata</p>
            </div>
          </div>
        )}
        {counts.warning > 0 && (
          <div className="flex items-center gap-2 bg-solar-yellow-500/10 border border-solar-yellow-500/30 rounded-xl px-4 py-2.5">
            <span className="text-solar-yellow-400 text-lg">⚠️</span>
            <div>
              <p className="text-xs text-solar-yellow-400 font-bold">{counts.warning} advertencia{counts.warning > 1 ? 's' : ''}</p>
              <p className="text-[10px] text-white/40">Monitoreo recomendado</p>
            </div>
          </div>
        )}
        {counts.total === 0 && (
          <div className="flex items-center gap-2 bg-energy-green-500/10 border border-energy-green-500/25 rounded-xl px-4 py-2.5">
            <span className="text-energy-green-400 text-lg">✅</span>
            <p className="text-xs text-energy-green-400 font-semibold">Sin alertas activas</p>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer
              ${filter === f.id
                ? 'bg-medical-blue-500/30 border border-medical-blue-400/50 text-medical-blue-300'
                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/70 hover:bg-white/8'
              }`}
          >
            {f.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
              ${filter === f.id ? 'bg-medical-blue-400/30 text-medical-blue-200' : 'bg-white/8 text-white/40'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-sm">No hay alertas en esta categoría</p>
          </div>
        ) : (
          sorted.map((a, i) => (
            <AlertCard key={a.id} alert={a} onAcknowledge={handleAcknowledge} delay={i * 60} />
          ))
        )}
      </div>
    </div>
  );
}
