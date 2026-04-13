/* AlertBadge — pill-shaped severity badge
   Props: severity ('critical'|'warning'|'info')
*/
export default function AlertBadge({ severity = 'info' }) {
  const cfg = {
    critical: { bg: 'bg-alert-red-500/20',    border: 'border-alert-red-500/50',    text: 'text-alert-red-400',    label: 'Crítico'      },
    warning:  { bg: 'bg-solar-yellow-500/20',  border: 'border-solar-yellow-500/50', text: 'text-solar-yellow-400', label: 'Advertencia'  },
    info:     { bg: 'bg-medical-blue-500/20',  border: 'border-medical-blue-500/50', text: 'text-medical-blue-300', label: 'Información'  },
  };

  const c = cfg[severity] ?? cfg.info;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.border} ${c.text}`}>
      {severity === 'critical' && <span className="mr-1">⚠</span>}
      {c.label}
    </span>
  );
}
