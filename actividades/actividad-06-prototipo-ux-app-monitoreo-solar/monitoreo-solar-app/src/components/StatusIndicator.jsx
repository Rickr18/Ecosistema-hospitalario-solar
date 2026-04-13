/* StatusIndicator — colored dot + label
   Props: status ('normal'|'warning'|'critical'|'charging'|'discharging'|'idle')
          label (string, optional)
          size  ('sm'|'md'|'lg')
*/
export default function StatusIndicator({ status = 'normal', label, size = 'md' }) {
  const cfg = {
    normal:      { dot: 'bg-energy-green-400 dot-pulse-green', text: 'text-energy-green-400', label: label ?? 'Normal' },
    charging:    { dot: 'bg-energy-green-400 dot-pulse-green', text: 'text-energy-green-400', label: label ?? 'Cargando' },
    idle:        { dot: 'bg-medical-blue-400',                 text: 'text-medical-blue-400', label: label ?? 'Inactivo' },
    warning:     { dot: 'bg-solar-yellow-400',                 text: 'text-solar-yellow-400', label: label ?? 'Advertencia' },
    discharging: { dot: 'bg-solar-yellow-400',                 text: 'text-solar-yellow-400', label: label ?? 'Descargando' },
    critical:    { dot: 'bg-alert-red-400 dot-pulse-red',      text: 'text-alert-red-400',    label: label ?? 'Crítico' },
  };

  const c = cfg[status] ?? cfg.normal;
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`rounded-full inline-block ${dotSize} ${c.dot}`} />
      {label !== false && (
        <span className={`font-medium ${textSize} ${c.text}`}>{c.label}</span>
      )}
    </span>
  );
}
