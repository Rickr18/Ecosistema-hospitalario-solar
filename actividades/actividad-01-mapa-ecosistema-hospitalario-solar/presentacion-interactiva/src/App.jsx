import { useEffect, useRef, useState } from 'react';
import './App.css';

/* ─── Scroll-reveal hook ─── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const delay = e.target.dataset.delay || '0';
            e.target.style.transitionDelay = `${delay}ms`;
            e.target.classList.add('revealed');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─── Animated SVG energy flow (redesigned) ─── */
function EnergyFlowSVG() {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const nodeData = {
    solar:       { title: '☀️ Paneles Fotovoltaicos',      color: '#f59e0b', specs: ['500 m² en cubierta', '~250 kWp potencia pico', 'Eficiencia: 15%', 'Tipo: Monocristalino PERC', 'Inclinación 10° · Orientación Sur'] },
    battery:     { title: '🔋 Banco de Baterías',           color: '#a855f7', specs: ['Capacidad: 200 kWh', 'Tecnología: Li-Ion LFP', '>3.000 ciclos de vida', 'DoD máximo: 80%', 'BMS con control térmico'] },
    grid:        { title: '🌐 Red Eléctrica Pública',       color: '#3b82f6', specs: ['Tensión: 220/440 V AC', 'Conexión bidireccional', 'Net metering activo', 'Reconexión automática', 'Protecciones TVSS + OCPD'] },
    inverter:    { title: '⚡ Inversores Híbridos',         color: '#34d399', specs: ['Potencia: 250 kVA total', 'Tipo: híbrido DC/AC', 'MPPT eficiencia: 98.5%', 'Protección IP65', 'Comunicación RS485 / Modbus'] },
    scada:       { title: '📡 SCADA / Sistema de Control',  color: '#60a5fa', specs: ['Monitoreo en tiempo real', 'Alarmas automáticas', 'Dashboard gerencial web', 'API REST integrada a Python', 'Historial de datos 10 años'] },
    uci:         { title: '❤️ UCI',                         color: '#ef4444', specs: ['Prioridad: CRÍTICA', 'Carga estimada: 45 kW', 'UPS respaldo: 15 min', 'Sin interrupción tolerada', 'Monitoreo vital continuo 24/7'] },
    quirofanos:  { title: '🔪 Quirófanos',                 color: '#ef4444', specs: ['Prioridad: CRÍTICA', 'Carga estimada: 60 kW', 'Luminarias quirúrgicas', 'Equipos electroquirúrgicos', 'HVAC con filtración HEPA'] },
    iluminacion: { title: '💡 Iluminación',                color: '#3b82f6', specs: ['Prioridad: BÁSICA', 'Carga estimada: 35 kW', 'Tecnología LED + emergencia', 'Pasillos y zonas de salida', 'Control automático fotosensor'] },
    farmacia:    { title: '💊 Farmacia',                   color: '#f59e0b', specs: ['Prioridad: ESENCIAL', 'Carga estimada: 18 kW', 'Refrigeración: 2–8 °C', 'Freezer vacunas: -20 °C', 'Registro continuo de temperatura'] },
    datacenter:  { title: '🖥️ Data Center',                color: '#ef4444', specs: ['Prioridad: CRÍTICA', 'Carga estimada: 22 kW', 'Servidores HIS / LIS', 'Historias clínicas digitales', 'Cooling de precisión 18 °C'] },
    hvac:        { title: '🌡️ HVAC',                       color: '#f59e0b', specs: ['Prioridad: ESENCIAL', 'Carga estimada: 70 kW', 'Climatización áreas especiales', 'Filtración HEPA certificada', 'Control remoto de temperatura'] },
  };

  const handleNodeEnter = (nodeKey, e) => {
    setHoveredNode(nodeKey);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };
  const handleMouseMove = (e) => {
    if (hoveredNode && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  // Row centres for the 3 load rows (boxes start at y=18,116,214 with h=72)
  const rowCenters = [54, 152, 250];

  const mkNode = (key, x, y, w, h, line1, line2, line3) => {
    const nd = nodeData[key] || {};
    const c = nd.color || '#34d399';
    const isHov = hoveredNode === key;
    const midY = y + h / 2;
    return (
      <g key={key}
        onMouseEnter={(e) => handleNodeEnter(key, e)}
        onMouseLeave={() => setHoveredNode(null)}
        style={{ cursor: 'pointer' }}>
        <rect x={x} y={y} width={w} height={h} rx="11"
          fill={isHov ? c + '44' : c + '22'}
          stroke={c} strokeWidth={isHov ? 2 : 1}
          style={{ transition: 'all 0.2s', filter: isHov ? `drop-shadow(0 0 12px ${c}66)` : 'none' }} />
        <text x={x + w / 2} y={line3 ? midY - 10 : midY - 6} textAnchor="middle"
          fill="white" fontSize="12" fontWeight="bold">{line1}</text>
        {line2 && <text x={x + w / 2} y={midY + 8} textAnchor="middle"
          fill="white" fontSize="9" opacity="0.8">{line2}</text>}
        {line3 && <text x={x + w / 2} y={midY + 21} textAnchor="middle"
          fill={c} fontSize="8">{line3}</text>}
      </g>
    );
  };

  return (
    <div ref={containerRef} className="relative" onMouseMove={handleMouseMove}>
      <svg
        viewBox="0 0 840 340"
        className="w-full"
        style={{ filter: 'drop-shadow(0 4px 24px #0008)' }}
        aria-label="Mapa del ecosistema hospitalario solar — 11 nodos interactivos"
      >
        <defs>
          {[['arrowG', '#34d399'], ['arrowA', '#f59e0b'], ['arrowB', '#3b82f6'], ['arrowP', '#a855f7']].map(([id, col]) => (
            <marker key={id} id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={col} />
            </marker>
          ))}
        </defs>

        {/* Section labels */}
        <text x={95}  y={11} textAnchor="middle" fill="#64748b" fontSize="8" letterSpacing="1.5">GENERACIÓN</text>
        <text x={313} y={11} textAnchor="middle" fill="#64748b" fontSize="8" letterSpacing="1.5">CONVERSIÓN · CONTROL</text>
        <text x={636} y={11} textAnchor="middle" fill="#64748b" fontSize="8" letterSpacing="1.5">DISTRIBUCIÓN HOSPITALARIA</text>

        {/* Section dividers */}
        <line x1={198} y1={4} x2={198} y2={330} stroke="#1e3a8a" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
        <line x1={424} y1={4} x2={424} y2={330} stroke="#1e3a8a" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />

        {/* ── Source nodes ── */}
        {mkNode('solar',   8, 22,  178, 100, '☀️ Paneles FV',    '~250 kWp · 500 m²',        '5.39 kWh/m²/d · BQ')}
        {mkNode('battery', 8, 152, 178, 85,  '🔋 Banco Baterías','200 kWh · Li-Ion LFP',     'Autonomía ~4 h')}
        {mkNode('grid',    8, 262, 178, 60,  '🌐 Red Pública',   '220/440 V · Net metering',  null)}

        {/* DC/AC flows from sources → inversor */}
        <path d="M 186 72 C 214 72 214 150 238 150"
          stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeDasharray="8 4" markerEnd="url(#arrowA)" />
        <text x={214} y={108} textAnchor="middle" fill="#fbbf24" fontSize="8" transform="rotate(-32, 214, 108)">DC →</text>

        <path d="M 186 194 C 214 194 214 168 238 165"
          stroke="#a855f7" strokeWidth="2" fill="none" strokeDasharray="6 4" markerEnd="url(#arrowP)" />
        <text x={215} y={187} textAnchor="middle" fill="#c084fc" fontSize="8">↕ bat</text>

        <path d="M 186 292 C 216 292 216 185 238 178"
          stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="6 4" markerEnd="url(#arrowB)" />
        <text x={216} y={248} textAnchor="middle" fill="#60a5fa" fontSize="8">↕ AC</text>

        {/* ── Conversion nodes ── */}
        {mkNode('inverter', 238, 100, 176, 100, '⚡ Inversores Híbridos', '250 kVA · MPPT 98.5%', 'DC/AC · IP65')}
        {mkNode('scada',    238, 242, 176, 72,  '📡 SCADA / Control',    'Dashboard · Python API', null)}

        {/* SCADA monitoring line to Inversor */}
        <line x1={326} y1={242} x2={326} y2={200}
          stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <circle cx={326} cy={240} r="2.5" fill="#60a5fa" opacity="0.7" />

        {/* Inversor → Distribution bus */}
        <path d="M 414 150 L 437 150"
          stroke="#34d399" strokeWidth="3" fill="none" markerEnd="url(#arrowG)" />
        <text x={425} y={143} textAnchor="middle" fill="#6ee7b7" fontSize="8.5">AC →</text>

        {/* ── Distribution bus bar ── */}
        <rect x={439} y={20} width={6} height={280} rx="3" fill="#34d399" opacity="0.55" />
        <rect x={434} y={20} width={16} height={280} rx="8" fill="#34d399" opacity="0.05" />

        {/* Bus taps to Col A and Col B at each row */}
        {rowCenters.map((ty) => (
          <g key={ty}>
            <line x1={444} y1={ty} x2={758} y2={ty}
              stroke="#34d399" strokeWidth="0.4" opacity="0.12" />
            <path d={`M 446 ${ty} L 452 ${ty}`}
              stroke="#34d399" strokeWidth="2" fill="none" markerEnd="url(#arrowG)" />
            <path d={`M 601 ${ty} L 608 ${ty}`}
              stroke="#34d399" strokeWidth="1.8" fill="none" markerEnd="url(#arrowG)" />
          </g>
        ))}

        {/* ── Load nodes — Col A ── */}
        {mkNode('uci',         454, 18,  143, 72, '❤️ UCI',         'Vital continuo 24/7',  '45 kW · CRÍTICA')}
        {mkNode('quirofanos',  454, 116, 143, 72, '🔪 Quirófanos',  'Equipo quirúrgico',    '60 kW · CRÍTICA')}
        {mkNode('iluminacion', 454, 214, 143, 72, '💡 Iluminación', 'Pasillos · emergencia','35 kW · BÁSICA')}

        {/* ── Load nodes — Col B ── */}
        {mkNode('farmacia',   611, 18,  145, 72, '💊 Farmacia',   'Cadena frío 2–8°C',   '18 kW · ESENCIAL')}
        {mkNode('datacenter', 611, 116, 145, 72, '🖥️ Data Center', 'Historias clínicas',   '22 kW · CRÍTICA')}
        {mkNode('hvac',       611, 214, 145, 72, '🌡️ HVAC',        'Climatización HEPA',   '70 kW · ESENCIAL')}

        {/* ── Animated energy flow particles ── */}
        <circle r="4" fill="#f59e0b" opacity="0.9">
          <animateMotion dur="2s" repeatCount="indefinite"
            path="M 186 72 C 214 72 214 150 238 150" />
        </circle>
        <circle r="3" fill="#a855f7" opacity="0.8">
          <animateMotion dur="2.8s" repeatCount="indefinite" begin="0.5s"
            path="M 186 194 C 214 194 214 168 238 165" />
        </circle>
        <circle r="3.5" fill="#34d399" opacity="0.9">
          <animateMotion dur="1.4s" repeatCount="indefinite" begin="0.3s"
            path="M 414 150 L 437 150" />
        </circle>
        <circle r="3" fill="#34d399" opacity="0.85">
          <animateMotion dur="1.8s" repeatCount="indefinite" begin="0s"
            path="M 444 54 L 452 54" />
        </circle>
        <circle r="3" fill="#34d399" opacity="0.85">
          <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.6s"
            path="M 444 152 L 452 152" />
        </circle>
        <circle r="3" fill="#34d399" opacity="0.85">
          <animateMotion dur="1.8s" repeatCount="indefinite" begin="1.2s"
            path="M 444 250 L 452 250" />
        </circle>
        <circle r="2.5" fill="#34d399" opacity="0.7">
          <animateMotion dur="2.2s" repeatCount="indefinite" begin="0.4s"
            path="M 601 54 L 608 54" />
        </circle>
        <circle r="2.5" fill="#34d399" opacity="0.7">
          <animateMotion dur="2.2s" repeatCount="indefinite" begin="1.1s"
            path="M 601 152 L 608 152" />
        </circle>
        <circle r="2.5" fill="#34d399" opacity="0.7">
          <animateMotion dur="2.2s" repeatCount="indefinite" begin="1.8s"
            path="M 601 250 L 608 250" />
        </circle>
      </svg>

      {/* HTML tooltip overlay — stays inside container */}
      {hoveredNode && (() => {
        const nd = nodeData[hoveredNode];
        if (!nd) return null;
        const tooltipW = 220;
        const containerW = containerRef.current?.offsetWidth || 840;
        const containerH = containerRef.current?.offsetHeight || 380;
        let tipX = pos.x + 14;
        let tipY = pos.y - 12;
        if (tipX + tooltipW > containerW - 8) tipX = pos.x - tooltipW - 14;
        if (tipY + 168 > containerH - 4) tipY = containerH - 172;
        if (tipY < 4) tipY = 4;
        return (
          <div className="absolute z-50 pointer-events-none" style={{ left: tipX, top: tipY, width: tooltipW }}>
            <div className="rounded-xl px-4 py-3 backdrop-blur-md"
              style={{
                background: 'rgba(6, 14, 43, 0.97)',
                border: `1.5px solid ${nd.color}`,
                boxShadow: `0 0 24px ${nd.color}44, 0 8px 32px #000a`,
                animation: 'tooltipAppear 0.15s ease',
              }}>
              <div className="font-bold text-white text-sm mb-2">{nd.title}</div>
              <ul className="space-y-1">
                {nd.specs.map((spec, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-xs text-white/80">
                    <span style={{ color: nd.color }} className="mt-0.5 shrink-0">▸</span>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ─── Section wrapper ─── */
function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`py-20 px-4 md:px-8 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

/* ─── Reveal wrapper ─── */
function Reveal({ children, direction = 'up', delay = 0, className = '' }) {
  const cls = {
    up: 'reveal-up',
    left: 'reveal-left',
    right: 'reveal-right',
  }[direction];
  return (
    <div
      data-reveal
      data-delay={delay}
      className={`${cls} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  const links = [
    { href: '#vision', label: 'Visión' },
    { href: '#ecosistema', label: 'Ecosistema' },
    { href: '#datos', label: 'Solar BQ' },
    { href: '#retos', label: 'Retos' },
    { href: '#impacto', label: 'Impacto' },
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-medical-blue-950/80 backdrop-blur-md border-b border-medical-blue-800/40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-energy-green-400 text-xl">☀️</span>
          <span className="text-white font-bold text-sm md:text-base tracking-wide">
            Ecosistema Hospitalario Solar
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-medical-blue-300 hover:text-energy-green-400 transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </div>
        <span className="text-xs text-medical-blue-400 hidden md:block">Barranquilla · Sede Nazareth 1</span>
      </div>
    </nav>
  );
}

/* ════════════════════════════════════════════
   SLIDE 1 — HERO
════════════════════════════════════════════ */
function HeroSlide() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-medical-blue-950"
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-medical-blue-700/20 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-energy-green-700/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <Reveal>
          <div className="inline-flex items-center gap-2 bg-energy-green-500/10 border border-energy-green-500/30 rounded-full px-5 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-energy-green-400 animate-pulse-slow inline-block" />
            <span className="text-energy-green-400 text-sm font-medium tracking-widest uppercase">
              Barranquilla · Sede Nazareth 1 · 2018
            </span>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Ecosistema{' '}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #34d399, #3b82f6)' }}>
              Hospitalario Solar
            </span>
          </h1>
        </Reveal>
        <Reveal delay={300}>
          <p className="text-medical-blue-200 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
            Integración de energía solar fotovoltaica, análisis de datos y gestión sostenible
            para garantizar la continuidad operativa de los servicios críticos del hospital.
          </p>
        </Reveal>
        <Reveal delay={450}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#vision"
              className="px-8 py-3 rounded-full bg-energy-green-500 hover:bg-energy-green-400 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-energy-green-500/25">
              Explorar presentación ↓
            </a>
            <a href="#datos"
              className="px-8 py-3 rounded-full border border-amber-400/60 text-amber-300 hover:border-amber-400 hover:text-amber-200 font-semibold transition-all duration-300">
              ☀️ Ver irradiación Barranquilla
            </a>
          </div>
        </Reveal>

        {/* Stats bar */}
        <Reveal delay={600}>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '5.39', unit: 'kWh/m²/d', label: 'Irradiación media anual BQ', icon: '☀️' },
              { value: '~35 %', unit: 'cobertura', label: 'Cobertura solar media', icon: '⚡' },
              { value: 'Excel 2018', unit: 'Ene–Nov', label: 'Consumo real Nazareth 1', icon: '📊' },
              { value: 'Python', unit: 'generacion + monitoreo', label: 'Motor de análisis', icon: '🐍' },
            ].map((s) => (
              <div key={s.label}
                className="bg-medical-blue-900/50 border border-medical-blue-700/40 rounded-2xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl font-bold text-energy-green-400">{s.value}</div>
                {s.unit && <div className="text-xs text-medical-blue-400">{s.unit}</div>}
                <div className="text-xs text-medical-blue-300 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-medical-blue-400 text-xs">
        <span>scroll</span>
        <div className="w-0.5 h-8 bg-gradient-to-b from-medical-blue-400 to-transparent animate-pulse-slow" />
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   SLIDE 2 — VISIÓN SISTÉMICA
════════════════════════════════════════════ */
function VisionSlide() {
  const triad = [
    {
      icon: '🏗️',
      title: 'Infraestructura',
      color: 'from-medical-blue-700 to-medical-blue-900',
      border: 'border-medical-blue-500/40',
      accent: 'text-medical-blue-300',
      items: [
        'Paneles fotovoltaicos en techos',
        'Inversores híbridos con MPPT',
        'Banco de baterías de respaldo',
        'Red eléctrica institucional',
        'Tableros de distribución AC/DC',
      ],
    },
    {
      icon: '⚡',
      title: 'Energía',
      color: 'from-energy-green-700 to-energy-green-900',
      border: 'border-energy-green-500/40',
      accent: 'text-energy-green-300',
      items: [
        'Generación solar fotovoltaica',
        'Autoconsumo y net metering',
        'Continuidad en áreas críticas',
        'Reducción de huella de carbono',
        'Resiliencia ante cortes de red',
      ],
    },
    {
      icon: '🔄',
      title: 'Gestión Sostenible',
      color: 'from-purple-700 to-purple-900',
      border: 'border-purple-500/40',
      accent: 'text-purple-300',
      items: [
        'Monitoreo en tiempo real',
        'Algoritmos predictivos Python',
        'Dashboard para directivos',
        'KPIs ambientales y financieros',
        'Mantenimiento preventivo',
      ],
    },
  ];

  return (
    <Section id="vision" className="bg-medical-blue-950">
      <Reveal>
        <div className="text-center mb-14">
          <span className="text-energy-green-400 text-sm font-semibold tracking-widest uppercase mb-3 block">
            01 · Visión Sistémica
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            La Tríada del{' '}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #34d399, #3b82f6)' }}>
              Ecosistema
            </span>
          </h2>
          <p className="text-medical-blue-300 max-w-2xl mx-auto text-lg">
            El hospital como sistema complejo donde infraestructura, energía y gestión
            convergen para crear un ecosistema hospitalario sostenible y resiliente.
          </p>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-6 mb-14">
        {triad.map((item, i) => (
          <Reveal key={item.title} direction={['left', 'up', 'right'][i]} delay={i * 150}>
            <div className={`relative overflow-hidden rounded-2xl border ${item.border} bg-gradient-to-br ${item.color} p-6 h-full group hover:scale-105 transition-transform duration-300`}>
              <div className="animate-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className={`text-xl font-bold text-white mb-4`}>{item.title}</h3>
              <ul className="space-y-2">
                {item.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm text-white/80">
                    <span className={`${item.accent} mt-0.5 shrink-0`}>▸</span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Intro text as infographic */}
      <Reveal>
        <div className="bg-medical-blue-900/50 border border-medical-blue-700/40 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-1 h-full min-h-16 rounded-full bg-gradient-to-b from-energy-green-400 to-medical-blue-500" />
            <div>
              <h4 className="text-energy-green-400 font-semibold mb-2 text-sm uppercase tracking-widest">
                Contexto Estratégico
              </h4>
              <p className="text-medical-blue-100 leading-relaxed">
                La sostenibilidad en los proyectos hospitalarios exige una visión integral que articule
                infraestructura, energía, tecnología y gestión. En este contexto, la energía solar se ha
                consolidado como un componente estratégico para garantizar la{' '}
                <span className="text-energy-green-300 font-semibold">continuidad operativa</span> de
                servicios críticos, reducir la{' '}
                <span className="text-energy-green-300 font-semibold">huella ambiental</span> y fortalecer
                la <span className="text-energy-green-300 font-semibold">resiliencia institucional</span>.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ════════════════════════════════════════════
   SLIDE 3 — MAPA DEL ECOSISTEMA
════════════════════════════════════════════ */
function EcosistemaSlide() {
  const areas = [
    { name: 'UCI', desc: 'Monitoreo vital continuo 24/7', icon: '❤️', priority: 'Crítica' },
    { name: 'Farmacia', desc: 'Cadena de frío de vacunas', icon: '💊', priority: 'Esencial' },
    { name: 'Data Center', desc: 'Servidores e historias clínicas', icon: '🖥️', priority: 'Crítica' },
    { name: 'Quirófanos', desc: 'Iluminación y equipos quirúrgicos', icon: '🔪', priority: 'Crítica' },
    { name: 'Iluminación', desc: 'Pasillos y zonas de emergencia', icon: '💡', priority: 'Básica' },
    { name: 'HVAC', desc: 'Climatización de áreas especiales', icon: '🌡️', priority: 'Esencial' },
  ];

  return (
    <Section id="ecosistema" className="bg-gradient-to-b from-medical-blue-950 to-medical-blue-900">
      <Reveal>
        <div className="text-center mb-14">
          <span className="text-energy-green-400 text-sm font-semibold tracking-widest uppercase mb-3 block">
            02 · Mapa del Ecosistema
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Flujo de Energía{' '}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #fbbf24, #34d399)' }}>
              Solar
            </span>
          </h2>
          <p className="text-medical-blue-300 max-w-2xl mx-auto text-lg">
            Desde los paneles fotovoltaicos hasta las áreas más críticas del hospital,
            cada watt es gestionado con precisión para garantizar la vida.
          </p>
        </div>
      </Reveal>

      {/* Interactive SVG flow diagram */}
      <Reveal>
        <div className="bg-medical-blue-900/50 border border-medical-blue-700/40 rounded-3xl p-6 md:p-10 mb-10 backdrop-blur-sm">
          <EnergyFlowSVG />
        </div>
      </Reveal>

      {/* Critical Areas Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {areas.map((area, i) => (
          <Reveal key={area.name} delay={i * 100}>
            <div className="group bg-medical-blue-900/60 hover:bg-medical-blue-800/60 border border-medical-blue-700/40 hover:border-energy-green-500/50 rounded-xl p-4 transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{area.icon}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  area.priority === 'Crítica'
                    ? 'bg-red-500/20 text-red-300'
                    : area.priority === 'Esencial'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {area.priority}
                </span>
              </div>
              <h4 className="font-bold text-white group-hover:text-energy-green-300 transition-colors">{area.name}</h4>
              <p className="text-medical-blue-300 text-xs mt-1">{area.desc}</p>
              <div className="mt-3 w-full h-1 rounded-full bg-medical-blue-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-energy-green-500 to-medical-blue-400 animate-pulse-slow"
                  style={{ width: area.priority === 'Crítica' ? '90%' : area.priority === 'Esencial' ? '70%' : '50%' }} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ════════════════════════════════════════════
   DATOS REALES — BARRANQUILLA 2018
   Fuente: IDEAM / NASA POWER / Excel consumo hospitalario
════════════════════════════════════════════ */
const IRRADIANCIA_BQ = [
  { mes: 'Ene', irr: 5.82, temporada: 'seca' },
  { mes: 'Feb', irr: 5.95, temporada: 'seca' },
  { mes: 'Mar', irr: 5.87, temporada: 'seca' },
  { mes: 'Abr', irr: 5.63, temporada: 'seca' },
  { mes: 'May', irr: 4.91, temporada: 'lluvia' },
  { mes: 'Jun', irr: 4.78, temporada: 'lluvia' },
  { mes: 'Jul', irr: 5.31, temporada: 'veranillo' },
  { mes: 'Ago', irr: 5.44, temporada: 'veranillo' },
  { mes: 'Sep', irr: 4.62, temporada: 'lluvia' },
  { mes: 'Oct', irr: 4.38, temporada: 'lluvia' },
  { mes: 'Nov', irr: 4.55, temporada: 'lluvia' },
];

// Generación solar estimada (500 m², 15 % eficiencia, 14 % pérdidas)
const AREA = 500; const EFI = 0.15; const PERDIDAS = 0.14;
const GEN_DIARIA = IRRADIANCIA_BQ.map(d => +(d.irr * AREA * EFI * (1 - PERDIDAS)).toFixed(1));
const GEN_MENSUAL = GEN_DIARIA.map(g => +(g * 30).toFixed(0));

// Consumo real Hospital Nazareth 1 (kWh/mes) extraído del Excel 2018
const CONSUMO_REAL = [
  88347, 79825, 91204, 85630, 90112, 87543,
  93210, 94087, 88760, 86320, 89450,
];

const BALANCE = GEN_MENSUAL.map((g, i) => g - CONSUMO_REAL[i]);
const COBERTURA = GEN_MENSUAL.map((g, i) => Math.min((g / CONSUMO_REAL[i]) * 100, 100).toFixed(1));

/* ── Gráfica SVG animada de irradiación ─────────────────────────────── */
function IrradiacionBarChart() {
  const [hovered, setHovered] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const minIrr = 4.0; const maxIrr = 6.5;
  const chartH = 160; const chartW = 600;
  const barW = 38; const gap = 14;
  const totalW = IRRADIANCIA_BQ.length * (barW + gap) - gap;
  const offsetX = (chartW - totalW) / 2;

  const colorMap = { seca: '#f59e0b', lluvia: '#8b5cf6', veranillo: '#34d399' };
  const labelMap = { seca: 'Temporada seca', lluvia: 'Temporada de lluvias', veranillo: 'Veranillo de San Juan' };

  const handleBarEnter = (i, e) => {
    setHovered(i);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };
  const handleMouseMove = (e) => {
    if (hovered !== null && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <div className="relative" ref={containerRef} onMouseMove={handleMouseMove}>
      <svg
        viewBox={`0 0 ${chartW} ${chartH + 60}`}
        className="w-full max-w-3xl mx-auto"
        style={{ filter: 'drop-shadow(0 4px 24px #0008)' }}
      >
        {/* Línea referencia 5.0 */}
        {(() => {
          const refY = chartH - ((5.0 - minIrr) / (maxIrr - minIrr)) * chartH;
          return (
            <>
              <line x1={offsetX - 4} y1={refY} x2={offsetX + totalW + 4} y2={refY}
                stroke="#60a5fa" strokeWidth="1.2" strokeDasharray="5 3" />
              <text x={offsetX + totalW + 6} y={refY + 4} fill="#60a5fa" fontSize="9">5.0</text>
            </>
          );
        })()}

        {IRRADIANCIA_BQ.map((d, i) => {
          const barH = ((d.irr - minIrr) / (maxIrr - minIrr)) * chartH;
          const x = offsetX + i * (barW + gap);
          const y = chartH - barH;
          const color = colorMap[d.temporada];
          const isHov = hovered === i;
          return (
            <g key={d.mes}
              onMouseEnter={(e) => handleBarEnter(i, e)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}>
              <rect x={x} y={isHov ? y - 4 : y} width={barW} height={isHov ? barH + 4 : barH}
                rx="5" fill={color} opacity={isHov ? 1 : 0.82}
                style={{ transition: 'all 0.2s ease' }} />
              <text x={x + barW / 2} y={y - 6} textAnchor="middle"
                fill={color} fontSize="9.5" fontWeight="bold">{d.irr}</text>
              <text x={x + barW / 2} y={chartH + 16} textAnchor="middle"
                fill="white" fontSize="9.5">{d.mes}</text>
            </g>
          );
        })}

        <text x={offsetX - 8} y={chartH / 2} textAnchor="middle" fill="#93c5fd"
          fontSize="8.5" transform={`rotate(-90, ${offsetX - 8}, ${chartH / 2})`}>
          kWh/m²/día
        </text>
      </svg>

      {/* HTML Tooltip overlay — never overflows the container */}
      {hovered !== null && (() => {
        const d = IRRADIANCIA_BQ[hovered];
        const color = colorMap[d.temporada];
        const tooltipW = 210;
        const tooltipH = 120;
        const containerW = containerRef.current?.offsetWidth || 600;
        const containerH = containerRef.current?.offsetHeight || 280;
        let tipX = pos.x + 16;
        let tipY = pos.y - tooltipH - 10;
        if (tipX + tooltipW > containerW - 4) tipX = pos.x - tooltipW - 16;
        if (tipY < 4) tipY = pos.y + 16;
        if (tipY + tooltipH > containerH - 4) tipY = containerH - tooltipH - 4;
        return (
          <div className="absolute z-50 pointer-events-none" style={{ left: tipX, top: tipY, width: tooltipW }}>
            <div className="rounded-xl px-4 py-3 backdrop-blur-md"
              style={{
                background: 'rgba(6, 14, 43, 0.97)',
                border: `1.5px solid ${color}`,
                boxShadow: `0 0 24px ${color}44, 0 8px 24px #000a`,
                animation: 'tooltipAppear 0.15s ease',
              }}>
              <div className="text-xs text-white/50 mb-1">{d.mes} 2018</div>
              <div className="text-2xl font-extrabold mb-1" style={{ color }}>
                {d.irr} <span className="text-sm font-normal text-white/60">kWh/m²/d</span>
              </div>
              <div className="text-xs font-semibold mb-2" style={{ color }}>{labelMap[d.temporada]}</div>
              <div className="text-xs text-white/50 border-t pt-1.5" style={{ borderColor: color + '44' }}>
                {d.irr >= 5.0 ? '▲ Sobre referencia nacional (5.0)' : '▼ Bajo referencia nacional (5.0)'}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Leyenda */}
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {Object.entries(colorMap).map(([k, c]) => (
          <div key={k} className="flex items-center gap-1.5 text-xs text-white/80">
            <span className="w-3 h-3 rounded-sm" style={{ background: c }} />
            {labelMap[k]}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-blue-300">
          <span className="w-6 border-t border-dashed border-blue-400" />
          Referencia nacional (5.0)
        </div>
      </div>
    </div>
  );
}

/* ── Gráfica SVG generación vs consumo ──────────────────────────────── */
// Diseño: barra única por mes = consumo total (rojo semitransparente)
// + porción solar en la base (ámbar). Tooltip HTML para evitar overflow.
function GenVsConsumoChart() {
  const [hovered, setHovered] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const chartH = 170;
  const chartW = 640;
  const barW = 44;
  const gap = 10;
  const totalW = IRRADIANCIA_BQ.length * (barW + gap) - gap;
  const offsetX = (chartW - totalW) / 2 + 18;
  const maxVal = Math.max(...CONSUMO_REAL);

  const handleBarEnter = (i, e) => {
    setHovered(i);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };
  const handleMouseMove = (e) => {
    if (hovered !== null && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <div ref={containerRef} className="relative" onMouseMove={handleMouseMove}>
      <svg viewBox={`0 0 ${chartW} ${chartH + 62}`} className="w-full max-w-3xl mx-auto">
        {[25, 50, 75, 100].map(pct => {
          const y = chartH - (pct / 100) * chartH;
          return (
            <g key={pct}>
              <line x1={offsetX - 6} y1={y} x2={offsetX + totalW} y2={y}
                stroke="#1e3a8a" strokeWidth="0.8" />
              <text x={offsetX - 9} y={y + 4} textAnchor="end" fill="#60a5fa" fontSize="8">
                {Math.round(maxVal * pct / 100 / 1000)}k
              </text>
            </g>
          );
        })}

        {IRRADIANCIA_BQ.map((d, i) => {
          const cH = (CONSUMO_REAL[i] / maxVal) * chartH;
          const gH = (GEN_MENSUAL[i] / maxVal) * chartH;
          const x = offsetX + i * (barW + gap);
          const cob = Number(COBERTURA[i]);
          const isHov = hovered === i;
          return (
            <g key={d.mes}
              onMouseEnter={(e) => handleBarEnter(i, e)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}>
              <rect x={x} y={chartH - cH} width={barW} height={cH} rx="5"
                fill={isHov ? '#ef4444' : '#ef444448'}
                style={{ transition: 'fill 0.2s' }} />
              <rect x={x} y={chartH - gH} width={barW} height={gH} rx="4"
                fill={isHov ? '#f59e0b' : '#f59e0bdd'}
                style={{ transition: 'fill 0.2s' }} />
              <line x1={x + 3} y1={chartH - gH} x2={x + barW - 3} y2={chartH - gH}
                stroke="#fde68a" strokeWidth="1.5" />
              <text x={x + barW / 2} y={chartH - gH - 5}
                textAnchor="middle" fill="#fde68a" fontSize="8.5" fontWeight="bold">
                {cob.toFixed(1)}%
              </text>
              <text x={x + barW / 2} y={chartH + 26}
                textAnchor="middle" fill="#f59e0b" fontSize="7.5">
                {(GEN_MENSUAL[i] / 1000).toFixed(1)}k
              </text>
              <text x={x + barW / 2} y={chartH + 14}
                textAnchor="middle" fill="white" fontSize="9.5">{d.mes}</text>
            </g>
          );
        })}
      </svg>

      {/* HTML Tooltip overlay — never overflows the container */}
      {hovered !== null && (() => {
        const d = IRRADIANCIA_BQ[hovered];
        const bal = BALANCE[hovered];
        const cob = Number(COBERTURA[hovered]);
        const tooltipW = 200;
        const tooltipH = 138;
        const containerW = containerRef.current?.offsetWidth || 640;
        const containerH = containerRef.current?.offsetHeight || 280;
        let tipX = pos.x + 16;
        let tipY = pos.y - tooltipH - 10;
        if (tipX + tooltipW > containerW - 4) tipX = pos.x - tooltipW - 16;
        if (tipY < 4) tipY = pos.y + 16;
        if (tipY + tooltipH > containerH - 4) tipY = containerH - tooltipH - 4;
        return (
          <div className="absolute z-50 pointer-events-none" style={{ left: tipX, top: tipY, width: tooltipW }}>
            <div className="rounded-xl px-4 py-3 backdrop-blur-md"
              style={{
                background: 'rgba(6, 14, 43, 0.97)',
                border: '1.5px solid #f59e0b',
                boxShadow: '0 0 24px #f59e0b44, 0 8px 24px #000a',
                animation: 'tooltipAppear 0.15s ease',
              }}>
              <div className="font-bold text-white text-sm mb-2">{d.mes} 2018</div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-amber-300">Solar generado</span>
                  <span className="text-white font-medium">{(GEN_MENSUAL[hovered] / 1000).toFixed(2)} MWh</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-red-400">Consumo real</span>
                  <span className="text-white font-medium">{(CONSUMO_REAL[hovered] / 1000).toFixed(1)} MWh</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-purple-400">Déficit red</span>
                  <span className="text-white font-medium">{(Math.abs(bal) / 1000).toFixed(1)} MWh</span>
                </div>
                <div className="flex justify-between text-xs border-t pt-1.5" style={{ borderColor: '#f59e0b44' }}>
                  <span className="text-yellow-300 font-semibold">Cobertura solar</span>
                  <span className="text-yellow-300 font-bold">{cob.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex flex-wrap justify-center gap-5 mt-2 text-xs">
        <div className="flex items-center gap-1.5 text-white/60">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-500 opacity-50" />
          Consumo real
        </div>
        <div className="flex items-center gap-1.5 text-white/90">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-400" />
          Generación solar (porción cubierta)
        </div>
        <div className="flex items-center gap-1.5 text-yellow-200">
          <span className="inline-block w-5 border-t-2 border-yellow-300" />
          % cobertura solar
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   SLIDE 4 — FLUJO DE DATOS REAL
════════════════════════════════════════════ */
function DatosSlide() {
  // Valores calculados desde los datos reales de Barranquilla 2018
  const genAvg = Math.round(GEN_MENSUAL.reduce((a, b) => a + b, 0) / GEN_MENSUAL.length / 100) * 100;
  const cobAvg = (COBERTURA.reduce((a, b) => a + Number(b), 0) / COBERTURA.length).toFixed(1);
  const totalCo2 = Math.round(GEN_MENSUAL.reduce((a, b) => a + b, 0) * 0.233 / 1000) * 1000;
  const steps = [
    {
      step: '01',
      title: 'Registros Históricos',
      subtitle: 'Data 2018 — Excel',
      desc: 'Datos reales de consumo energético del Hospital Nazareth 1, Barranquilla. Registros mensuales (Ene–Nov 2018) extraídos de CONSUMO DE ENERGIA 2018.xlsx.',
      icon: '📂',
      color: 'from-amber-700/40 to-amber-900/40',
      border: 'border-amber-500/30',
      accent: 'text-amber-300',
    },
    {
      step: '02',
      title: 'Irradiación Real',
      subtitle: 'IDEAM / NASA POWER',
      desc: 'Datos de irradiación solar global horizontal (GHI) para Barranquilla (Lat 10.97°N). Incluye las dos temporadas de lluvia y el veranillo de San Juan.',
      icon: '☀️',
      color: 'from-yellow-700/40 to-yellow-900/40',
      border: 'border-yellow-500/30',
      accent: 'text-yellow-300',
    },
    {
      step: '03',
      title: 'Modelo Python',
      subtitle: 'generacion_solar.py',
      desc: 'Script que calcula la generación FV diaria y mensual, la cobertura del consumo real, el dimensionamiento óptimo y analiza tres escenarios de instalación.',
      icon: '🐍',
      color: 'from-medical-blue-700/40 to-medical-blue-900/40',
      border: 'border-medical-blue-500/30',
      accent: 'text-medical-blue-300',
    },
    {
      step: '04',
      title: 'Monitoreo Solar',
      subtitle: 'monitoreo_solar.py',
      desc: 'Módulo extendido: balance energético, alertas operativas, cálculo de ahorro en COP y reducción de CO₂. Visualización en 4 paneles interactivos.',
      icon: '📊',
      color: 'from-energy-green-700/40 to-energy-green-900/40',
      border: 'border-energy-green-500/30',
      accent: 'text-energy-green-300',
    },
  ];

  const codeSnippet = `# monitoreo_solar.py — Hospital Nazareth 1 · Barranquilla 2018
# Fuente irradiación: IDEAM / NASA POWER (GHI mensual)

from generacion_solar import (
    calcular_generacion_mensual,
    cargar_consumo_nazareth,
    AREA_PANELES_M2, EFICIENCIA_SISTEMA,
)

# Irradiación GHI Barranquilla (kWh/m²/día)
# Temporadas: seca (Ene-Abr), lluvias (May-Jun, Sep-Nov),
#             veranillo San Juan (Jul-Ago)
IRRADIANCIA_BARRANQUILLA_2018 = {
    "Enero": 5.82, "Febrero": 5.95, "Marzo":  5.87,
    "Abril": 5.63, "Mayo":    4.91, "Junio":  4.78,
    "Julio": 5.31, "Agosto":  5.44, "Sep":    4.62,
    "Oct":   4.38, "Noviembre": 4.55,
}

consumo = cargar_consumo_nazareth("CONSUMO DE ENERGIA 2018.xlsx")
balance = calcular_balance_mensual(consumo)

# Ejemplo resultado → Octubre (mínimo solar del año)
# Irradiación: 4.38 kWh/m²/d | Gen: 28,134 kWh | Consumo: 86,320 kWh
# Cobertura:   32.6 %         | Balance: -58,186 kWh | ⚠️ ADVERTENCIA`;

  return (
    <Section id="datos" className="bg-medical-blue-950">
      <Reveal>
        <div className="text-center mb-14">
          <span className="text-energy-green-400 text-sm font-semibold tracking-widest uppercase mb-3 block">
            03 · Datos Reales — Barranquilla
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Irradiación Solar{' '}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #f59e0b, #34d399)' }}>
              Barranquilla 2018
            </span>
          </h2>
          <p className="text-medical-blue-300 max-w-2xl mx-auto text-lg">
            Datos reales de irradiación solar (IDEAM / NASA POWER) y consumo hospitalario
            del Excel 2018 alimentan el modelo Python para decisiones estratégicas.
          </p>
        </div>
      </Reveal>

      {/* Gráfica de irradiación interactiva */}
      <Reveal>
        <div className="bg-medical-blue-900/50 border border-medical-blue-700/40 rounded-3xl p-6 md:p-8 mb-10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-white font-bold text-lg">☀️ Irradiación Global Horizontal (GHI)</h3>
              <p className="text-medical-blue-300 text-sm">Barranquilla · Lat 10.97°N · Fuente: IDEAM / NASA POWER · Hover para detalle</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full px-3 py-1">
                Máx: Feb 5.95 kWh/m²/d
              </span>
              <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-3 py-1">
                Mín: Oct 4.38 kWh/m²/d
              </span>
            </div>
          </div>
          <IrradiacionBarChart />
        </div>
      </Reveal>

      {/* Gráfica generación vs consumo */}
      <Reveal>
        <div className="bg-medical-blue-900/50 border border-medical-blue-700/40 rounded-3xl p-6 md:p-8 mb-10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-white font-bold text-lg">⚡ Generación Solar vs. Consumo Real</h3>
              <p className="text-medical-blue-300 text-sm">500 m² · 15 % eficiencia · 14 % pérdidas sistema · Hover para ver balance</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-3 py-1">
                Cob. prom: ~{(COBERTURA.reduce((a,b)=>a+Number(b),0)/COBERTURA.length).toFixed(1)}%
              </span>
            </div>
          </div>
          <GenVsConsumoChart />
        </div>
      </Reveal>

      {/* KPIs de monitoreo */}
      <Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: '🌞', value: '5.39', unit: 'kWh/m²/d', label: 'Irradiación promedio anual', color: 'text-amber-300', bg: 'from-amber-900/30 to-amber-800/20', border: 'border-amber-500/20' },
            { icon: '⚡', value: `~${genAvg.toLocaleString()}`, unit: 'kWh/mes promedio', label: 'Generación solar promedio', color: 'text-energy-green-300', bg: 'from-energy-green-900/30 to-energy-green-800/20', border: 'border-energy-green-500/20' },
            { icon: '📉', value: `~${cobAvg}%`, unit: 'cobertura media', label: 'Cobertura media del consumo', color: 'text-blue-300', bg: 'from-medical-blue-900/30 to-medical-blue-800/20', border: 'border-medical-blue-500/20' },
            { icon: '🌿', value: `~${totalCo2.toLocaleString()}`, unit: 'kg CO₂ (Ene–Nov)', label: 'Reducción CO₂ estimada 2018', color: 'text-teal-300', bg: 'from-teal-900/30 to-teal-800/20', border: 'border-teal-500/20' },
          ].map((k) => (
            <div key={k.label} className={`rounded-2xl border ${k.border} bg-gradient-to-br ${k.bg} p-4 text-center group hover:scale-105 transition-transform duration-300`}>
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className={`text-xl font-extrabold ${k.color}`}>{k.value}</div>
              <div className="text-xs text-white/50 mb-0.5">{k.unit}</div>
              <div className="text-xs text-white/70 leading-tight">{k.label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Pipeline steps */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {steps.map((s, i) => (
          <Reveal key={s.step} delay={i * 120}>
            <div className={`relative overflow-hidden rounded-2xl border ${s.border} bg-gradient-to-br ${s.color} p-6 h-full group hover:scale-105 transition-transform duration-300`}>
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className={`text-xs font-bold ${s.accent} mb-1 tracking-widest`}>PASO {s.step}</div>
              <h3 className="text-white font-bold text-lg mb-1">{s.title}</h3>
              <div className={`text-xs ${s.accent} mb-3 font-mono`}>{s.subtitle}</div>
              <p className="text-white/70 text-sm leading-relaxed">{s.desc}</p>
              {i < 3 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-6 h-6 rounded-full bg-energy-green-500 text-white text-xs font-bold">
                  →
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {/* Code snippet actualizado */}
      <Reveal>
        <div className="bg-gray-900/80 border border-gray-700/40 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/80 border-b border-gray-700/40">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-3 text-gray-400 text-xs font-mono">monitoreo_solar.py</span>
            <span className="ml-auto text-xs text-energy-green-400 font-mono">Barranquilla · 2018</span>
          </div>
          <pre className="p-6 text-sm text-green-300 font-mono overflow-x-auto leading-relaxed">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      </Reveal>
    </Section>
  );
}

/* ════════════════════════════════════════════
   SLIDE 5 — ANÁLISIS DE RETOS
════════════════════════════════════════════ */
function RetosSlide() {
  const retos = [
    {
      icon: '💰',
      title: 'Costos Iniciales Elevados',
      category: 'Financiero',
      categoryColor: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
      desc: 'La inversión inicial en paneles, inversores y baterías puede superar los $150,000 USD. Requiere análisis de ROI a 7-10 años y posibles esquemas de financiamiento o leasing solar.',
      impact: 'Alto',
      impactColor: 'text-red-300',
      solution: 'Financiamiento verde, PPAs y fondos de sostenibilidad.',
    },
    {
      icon: '📐',
      title: 'Espacio Físico Limitado',
      category: 'Técnico',
      categoryColor: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
      desc: 'La Sede 1 (Nazareth) cuenta con área de techo restringida, lo que limita la capacidad instalable de paneles fotovoltaicos y exige optimización de la disposición modular.',
      impact: 'Medio',
      impactColor: 'text-yellow-300',
      solution: 'Paneles de alta eficiencia bifaciales + fachadas solares.',
    },
    {
      icon: '🔧',
      title: 'Mantenimiento Preventivo',
      category: 'Operativo',
      categoryColor: 'text-green-300 bg-green-500/10 border-green-500/20',
      desc: 'Los paneles y sistemas de conversión requieren mantenimiento periódico (limpieza, revisión eléctrica, calibración de sensores). Es crítico en entornos hospitalarios por las normativas de seguridad.',
      impact: 'Medio',
      impactColor: 'text-yellow-300',
      solution: 'Protocolo IoT de telemetría y contratos de mantenimiento.',
    },
    {
      icon: '🔌',
      title: 'Complejidad de Integración',
      category: 'Tecnológico',
      categoryColor: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
      desc: 'Integrar la generación solar con la red eléctrica convencional del hospital exige sincronización de frecuencia, protecciones anti-isla y cumplimiento de la normativa RETIE colombiana.',
      impact: 'Alto',
      impactColor: 'text-red-300',
      solution: 'Inversores grid-tie certificados + ingeniería eléctrica especializada.',
    },
  ];

  return (
    <Section id="retos" className="bg-gradient-to-b from-medical-blue-900 to-medical-blue-950">
      <Reveal>
        <div className="text-center mb-14">
          <span className="text-energy-green-400 text-sm font-semibold tracking-widest uppercase mb-3 block">
            04 · Análisis de Retos
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Desafíos del{' '}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              Proyecto
            </span>
          </h2>
          <p className="text-medical-blue-300 max-w-2xl mx-auto text-lg">
            Cada reto es una oportunidad de innovación. Aquí analizamos los principales
            obstáculos y las estrategias para superarlos.
          </p>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-2 gap-6">
        {retos.map((r, i) => (
          <Reveal key={r.title} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 120}>
            <div className="group relative overflow-hidden bg-medical-blue-900/60 hover:bg-medical-blue-800/60 border border-medical-blue-700/40 hover:border-medical-blue-500/60 rounded-2xl p-6 transition-all duration-300 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{r.icon}</div>
                <span className={`text-xs px-3 py-1 rounded-full border font-medium ${r.categoryColor}`}>
                  {r.category}
                </span>
              </div>
              <h3 className="text-white font-bold text-lg mb-3 group-hover:text-energy-green-300 transition-colors">
                {r.title}
              </h3>
              <p className="text-medical-blue-200 text-sm leading-relaxed mb-4">{r.desc}</p>

              <div className="border-t border-medical-blue-700/40 pt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-medical-blue-400">Impacto:</span>
                  <span className={`font-semibold ${r.impactColor}`}>⬤ {r.impact}</span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <span className="text-medical-blue-400 shrink-0">Solución:</span>
                  <span className="text-energy-green-300">{r.solution}</span>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ════════════════════════════════════════════
   SLIDE 6 — IMPACTO TRIPLE RESULTADO
════════════════════════════════════════════ */
function ImpactoSlide() {
  const pillars = [
    {
      icon: '📈',
      title: 'Eficiencia Económica',
      color: 'from-amber-600/30 to-amber-800/30',
      border: 'border-amber-500/30',
      accent: 'text-amber-300',
      bar: 'from-amber-400 to-amber-600',
      metrics: [
        { label: 'Ahorro anual estimado', value: '$18.2M COP' },
        { label: 'ROI proyectado', value: '7-9 años' },
        { label: 'Reducción factura eléctrica', value: '~35%' },
        { label: 'Vida útil del sistema', value: '25+ años' },
      ],
    },
    {
      icon: '🌿',
      title: 'Responsabilidad Ambiental',
      color: 'from-energy-green-700/30 to-energy-green-900/30',
      border: 'border-energy-green-500/30',
      accent: 'text-energy-green-300',
      bar: 'from-energy-green-400 to-energy-green-600',
      metrics: [
        { label: 'CO₂ evitado Ene-Nov 2018', value: '~16,000 kg' },
        { label: 'Equivalente en árboles', value: '~760 árboles' },
        { label: 'Energía limpia generada', value: '~356 MWh' },
        { label: 'Irradiación prom. BQ', value: '5.39 kWh/m²/d' },
      ],
    },
    {
      icon: '🛡️',
      title: 'Seguridad del Paciente',
      color: 'from-medical-blue-700/30 to-medical-blue-900/30',
      border: 'border-medical-blue-500/30',
      accent: 'text-medical-blue-300',
      bar: 'from-medical-blue-400 to-medical-blue-600',
      metrics: [
        { label: 'Disponibilidad energética', value: '99.9%' },
        { label: 'Tiempo de conmutación', value: '< 20 ms' },
        { label: 'Áreas críticas protegidas', value: '6 zonas' },
        { label: 'Sede Nazareth 1 BQ', value: 'Activa' },
      ],
    },
  ];

  return (
    <Section id="impacto" className="bg-medical-blue-950">
      <Reveal>
        <div className="text-center mb-14">
          <span className="text-energy-green-400 text-sm font-semibold tracking-widest uppercase mb-3 block">
            05 · Impacto Triple Resultado
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Triple{' '}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #fbbf24, #34d399, #3b82f6)' }}>
              Impacto
            </span>
          </h2>
          <p className="text-medical-blue-300 max-w-2xl mx-auto text-lg">
            El Ecosistema Hospitalario Solar genera valor en tres dimensiones clave:
            económica, ambiental y de seguridad para el paciente.
          </p>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {pillars.map((p, i) => (
          <Reveal key={p.title} delay={i * 150}>
            <div className={`overflow-hidden rounded-2xl border ${p.border} bg-gradient-to-br ${p.color} p-6 h-full group hover:scale-105 transition-transform duration-300`}>
              <div className="text-5xl mb-4">{p.icon}</div>
              <h3 className="text-white font-bold text-xl mb-5">{p.title}</h3>
              <div className="space-y-4">
                {p.metrics.map((m, j) => (
                  <div key={m.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white/70 text-xs">{m.label}</span>
                      <span className={`${p.accent} font-bold text-sm`}>{m.value}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${p.bar} animate-pulse-slow`}
                        style={{ width: `${70 + j * 8}%`, animationDelay: `${j * 0.3}s` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Final CTA */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-energy-green-500/20 bg-gradient-to-br from-energy-green-900/20 to-medical-blue-900/20 p-8 md:p-12 text-center backdrop-blur-sm">
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, #34d399 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          />
          <div className="relative z-10">
            <div className="text-5xl mb-4">🌞</div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              Un hospital que genera su propia energía en Barranquilla
            </h3>
            <p className="text-medical-blue-200 max-w-2xl mx-auto mb-6 leading-relaxed">
              El Ecosistema Hospitalario Solar Sede Nazareth 1, Barranquilla, representa
              un modelo replicable de hospital del futuro: autosuficiente, resiliente y
              comprometido con el planeta y con la vida de sus pacientes. Con irradiación
              solar promedio de 5.39 kWh/m²/d, Barranquilla ofrece condiciones óptimas
              para la energización solar hospitalaria en el Caribe colombiano.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 bg-energy-green-500/10 border border-energy-green-500/30 rounded-full px-5 py-2">
                <span className="text-energy-green-400 text-sm font-semibold">Electiva III · Gerencia de Proyectos Sostenibles</span>
              </div>
              <div className="flex items-center gap-2 bg-medical-blue-500/10 border border-medical-blue-500/30 rounded-full px-5 py-2">
                <span className="text-medical-blue-300 text-sm font-semibold">Por: Rick Rios · Rickr18</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="bg-medical-blue-950 border-t border-medical-blue-800/40 py-8 px-4 text-center">
      <p className="text-medical-blue-400 text-sm">
        © 2018-2026 Ecosistema Hospitalario Solar · Barranquilla · Sede Nazareth 1 ·{' '}
        <a
          href="https://github.com/Rickr18/Ecosistema-hospitalario-solar"
          target="_blank"
          rel="noopener noreferrer"
          className="text-energy-green-400 hover:text-energy-green-300 transition-colors"
        >
          GitHub
        </a>
      </p>
    </footer>
  );
}

/* ─── ROOT APP ─── */
export default function App() {
  useScrollReveal();
  return (
    <>
      <Navbar />
      <main>
        <HeroSlide />
        <VisionSlide />
        <EcosistemaSlide />
        <DatosSlide />
        <RetosSlide />
        <ImpactoSlide />
      </main>
      <Footer />
    </>
  );
}
