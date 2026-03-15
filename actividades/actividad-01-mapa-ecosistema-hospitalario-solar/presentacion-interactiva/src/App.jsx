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
            e.target.style.animationDelay = `${delay}ms`;
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
    battery:     { title: '🔋 Banco de Baterías LFP',       color: '#a855f7', specs: ['Capacidad: 300 kWh total', 'Tecnología: Li-Ion LFP (4 módulos)', '>3.000 ciclos de vida', 'DoD máximo: 80% · BMS térmico', 'Autonomía ~4 h · SCADA integrado'] },
    grid:        { title: '🌐 Red Pública AIRE',            color: '#3b82f6', specs: ['Tensión: 220/440 V AC · 60 Hz', 'Postes AIRE (Barranquilla)', 'Net metering activo', 'Reconexión automática', 'Protecciones TVSS + OCPD'] },
    inverter:    { title: '⚡ Inversores Híbridos',         color: '#34d399', specs: ['Potencia: 2 × 125 kVA = 250 kVA', 'Tipo: híbrido DC/AC', 'MPPT eficiencia: 98.5%', 'Protección IP65', 'Comunicación RS485 / Modbus'] },
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
        {mkNode('battery', 8, 152, 178, 85,  '🔋 Banco Baterías','300 kWh · LFP (4 módulos)','Autonomía ~4 h · SCADA')}
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
    slideRotate: 'reveal-slide-rotate',
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
    { href: '#hospital3d', label: 'Vista 3D' },
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
    { name: 'UCI',         desc: 'Monitoreo vital continuo 24/7',  icon: '❤️',  priority: 'Crítica',  kw: 45,  backup: '15 min UPS',   uptime: 99.9 },
    { name: 'Farmacia',    desc: 'Cadena de frío 2–8 °C',          icon: '💊',  priority: 'Esencial', kw: 18,  backup: '8 min UPS',    uptime: 98.5 },
    { name: 'Data Center', desc: 'Servidores HIS/LIS',              icon: '🖥️', priority: 'Crítica',  kw: 22,  backup: '30 min UPS',   uptime: 99.5 },
    { name: 'Quirófanos',  desc: 'Iluminación y equipo quirúrgico', icon: '🔪', priority: 'Crítica',  kw: 60,  backup: '10 min UPS',   uptime: 99.7 },
    { name: 'Pasillos',    desc: 'Pasillos y zonas de salida',      icon: '💡',  priority: 'Básica',   kw: 35,  backup: 'Solar directo', uptime: 95.0 },
    { name: 'HVAC',        desc: 'Climatización HEPA',              icon: '🌡️', priority: 'Esencial', kw: 70,  backup: '5 min UPS',    uptime: 97.2 },
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

      {/* Critical Areas Grid — slide-rotate-hor-b-fwd (Animista) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {areas.map((area, i) => (
          <Reveal key={area.name} delay={i * 130} direction="slideRotate">
            <div className="group relative bg-medical-blue-900/60 hover:bg-medical-blue-800/60 border border-medical-blue-700/40 hover:border-energy-green-500/50 rounded-xl p-4 transition-all duration-300 cursor-pointer overflow-hidden">
              {/* Hover radial glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 30%, rgba(52,211,153,0.10), transparent 72%)' }} />
              {/* Header row */}
              <div className="flex items-start justify-between mb-2 relative">
                <span className="text-2xl drop-shadow-lg">{area.icon}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  area.priority === 'Crítica'  ? 'bg-red-500/20 text-red-300' :
                  area.priority === 'Esencial' ? 'bg-yellow-500/20 text-yellow-300' :
                                                 'bg-blue-500/20 text-blue-300'
                }`}>{area.priority}</span>
              </div>
              <h4 className="font-bold text-white group-hover:text-energy-green-300 transition-colors relative">{area.name}</h4>
              <p className="text-medical-blue-300 text-xs mt-1 relative">{area.desc}</p>
              {/* Métricas operativas */}
              <div className="mt-3 flex items-center justify-between text-xs relative">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-energy-green-400 animate-pulse-slow" />
                  <span className="text-energy-green-400 font-bold">{area.kw} kW</span>
                </div>
                <span className="text-medical-blue-400">{area.backup}</span>
              </div>
              {/* Uptime */}
              <div className="mt-1 flex items-center justify-between text-xs relative">
                <span className="text-medical-blue-500">uptime</span>
                <span className={`font-semibold ${
                  area.uptime >= 99 ? 'text-energy-green-400' :
                  area.uptime >= 97 ? 'text-yellow-400' : 'text-orange-400'
                }`}>{area.uptime}%</span>
              </div>
              {/* Barra de prioridad */}
              <div className="mt-2 w-full h-1 rounded-full bg-medical-blue-800 overflow-hidden relative">
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
   SLIDE 3’ — ESCENA ISOMÉTRICA 3D DEL HOSPITAL
════════════════════════════════════════════ */

/* Escena isométrica SVG del hospital con paneles y zonas críticas */
function HospitalIsoScene({ externalFilter }) {
  const [hoveredZone, setHoveredZone] = useState(null);
  // externalFilter puede ser: 'CRÍTICA'|'ESENCIAL'|'BÁSICA'|'batteries'|zone.key|null
  const activeFilter = externalFilter ?? null;

  // Proyección isométrica
  const iso = (X, Y, Z) => ({
    x: (X - Y) * 2.2,
    y: (X + Y) * 1.1 - Z * 1.8,
  });

  // isoBox helper
  const isoBox = (bx, by, bz, w, d, h, colorTop, colorRight, colorLeft, opacity = 1) => {
    const A = iso(bx,     by,     bz + h), B = iso(bx + w, by,     bz + h);
    const C = iso(bx + w, by + d, bz + h), D = iso(bx,     by + d, bz + h);
    const E = iso(bx,     by,     bz),     F = iso(bx + w, by,     bz);
    const G = iso(bx + w, by + d, bz),     H2= iso(bx,     by + d, bz);
    const pt = (p) => `${p.x},${p.y}`;
    return (
      <g opacity={opacity}>
        <polygon points={`${pt(A)} ${pt(B)} ${pt(C)} ${pt(D)}`} fill={colorTop}   stroke="#0c1a3e" strokeWidth="0.6" />
        <polygon points={`${pt(B)} ${pt(C)} ${pt(G)} ${pt(F)}`} fill={colorRight} stroke="#0c1a3e" strokeWidth="0.6" />
        <polygon points={`${pt(A)} ${pt(D)} ${pt(H2)} ${pt(E)}`} fill={colorLeft} stroke="#0c1a3e" strokeWidth="0.6" />
      </g>
    );
  };

  const isoWindowRight = (bx, by, bz, w, d, h, wox, woy, ww, wh) => {
    const toRight = (lx, lz) => iso(bx + w, by + lx, bz + lz);
    const pts = [toRight(wox, woy), toRight(wox+ww, woy), toRight(wox+ww, woy+wh), toRight(wox, woy+wh)];
    return <polygon points={pts.map(p=>`${p.x},${p.y}`).join(' ')}
      fill="#bfdbfe" opacity="0.55" stroke="#1e3a8a" strokeWidth="0.5" />;
  };

  const solarPanel = (bx, by, bz, w, d) => {
    const A = iso(bx, by, bz), B = iso(bx+w, by, bz);
    const C = iso(bx+w, by+d, bz), D = iso(bx, by+d, bz);
    const pt = (p) => `${p.x},${p.y}`;
    const cx = (A.x+B.x+C.x+D.x)/4, cy = (A.y+B.y+C.y+D.y)/4;
    return (
      <g>
        <polygon points={`${pt(A)} ${pt(B)} ${pt(C)} ${pt(D)}`} fill="#1e3a8a" stroke="#34d399" strokeWidth="1.2" />
        <line x1={A.x+(B.x-A.x)*.33} y1={A.y+(B.y-A.y)*.33} x2={D.x+(C.x-D.x)*.33} y2={D.y+(C.y-D.y)*.33} stroke="#34d399" strokeWidth="0.5" opacity="0.7" />
        <line x1={A.x+(B.x-A.x)*.66} y1={A.y+(B.y-A.y)*.66} x2={D.x+(C.x-D.x)*.66} y2={D.y+(C.y-D.y)*.66} stroke="#34d399" strokeWidth="0.5" opacity="0.7" />
        <line x1={A.x+(D.x-A.x)*.5} y1={A.y+(D.y-A.y)*.5} x2={B.x+(C.x-B.x)*.5} y2={B.y+(C.y-B.y)*.5} stroke="#34d399" strokeWidth="0.5" opacity="0.7" />
        <ellipse cx={cx} cy={cy} rx="5" ry="3" fill="#7dd3fc" opacity="0.25" />
      </g>
    );
  };

  const energyLine = (from3d, to3d, color, dur, begin, key) => {
    const f = iso(...from3d), t = iso(...to3d);
    const pathD = `M ${f.x} ${f.y} L ${t.x} ${t.y}`;
    return (
      <g key={key}>
        <path d={pathD} stroke={color} strokeWidth="1.6" fill="none" strokeDasharray="9 5" opacity="0.65">
          <animate attributeName="stroke-dashoffset" values="0;-28" dur={dur} repeatCount="indefinite" begin={begin} />
        </path>
        <circle r="4.5" fill={color} opacity="0.9">
          <animateMotion dur={dur} repeatCount="indefinite" begin={begin} path={pathD} />
        </circle>
      </g>
    );
  };

  // ── LAYOUT 3D  ──────────────────────────────────────────────
  // Hospital: bx 0-36, by 4-22, bz 0-36
  // Left zones (UCI/Farm): bx -46..-34, by 4..18
  // Right zones (Quiro/DC): bx 52..64, by 4..18
  // Front zone (Pasillos): bx 8..22, by -34..-24
  // Back zone (HVAC): bx 8..22, by 52..62
  // Subestación: bx 52..76, by 30..50  (frente-derecha, SIN zonas ahí)
  // Postes AIRE: bx -20..-6, by -30..-20 (frente-izquierda)
  // ────────────────────────────────────────────────────────────

  const zones = [
    { key:'uci',         label:'UCI',         icon:'❤️',  color:'#ef4444', priority:'CRÍTICA',
      bx:-46, by:4,  bz:8,  w:12, d:10, h:9,
      from3d:[0,9,12.5], to3d:[-34,9,12.5],
      floor:'Piso 1', floorColor:'#34d399'  },
    { key:'farmacia',    label:'Farmacia',    icon:'💊',  color:'#f59e0b', priority:'ESENCIAL',
      bx:-46, by:18, bz:0,  w:12, d:10, h:6,
      from3d:[0,20,3], to3d:[-34,20,3],
      floor:'P. Baja', floorColor:'#94a3b8' },
    { key:'quirofanos',  label:'Quirófanos',  icon:'🔪',  color:'#f87171', priority:'CRÍTICA',
      bx:52,  by:4,  bz:8,  w:12, d:10, h:9,
      from3d:[36,9,12.5], to3d:[52,9,12.5],
      floor:'Piso 1', floorColor:'#34d399'  },
    { key:'datacenter',  label:'Data Center', icon:'🖥️', color:'#6366f1', priority:'CRÍTICA',
      bx:52,  by:18, bz:16, w:12, d:10, h:8,
      from3d:[36,20,20], to3d:[52,20,20],
      floor:'Piso 2', floorColor:'#818cf8'  },
    { key:'iluminacion', label:'Pasillos',    icon:'💡',  color:'#3b82f6', priority:'BÁSICA',
      bx:8,   by:-34, bz:0, w:14, d:10, h:5,
      from3d:[20,4,3], to3d:[20,-24,3],
      floor:'P. Baja', floorColor:'#94a3b8' },
    { key:'hvac',        label:'HVAC',        icon:'🌡️', color:'#10b981', priority:'ESENCIAL',
      bx:8,   by:52, bz:0,  w:14, d:10, h:6,
      from3d:[20,22,3], to3d:[20,52,3],
      floor:'P. Baja', floorColor:'#94a3b8' },
  ];

  const zoneDetails = {
    uci:         { kw:45,  uptime:'99.9%', backup:'15 min UPS', priority:'CRÍTICA',  desc:'Monitoreo vital continuo 24/7' },
    quirofanos:  { kw:60,  uptime:'99.7%', backup:'10 min UPS', priority:'CRÍTICA',  desc:'Iluminación y equipo quirúrgico' },
    farmacia:    { kw:18,  uptime:'98.5%', backup:'8 min UPS',  priority:'ESENCIAL', desc:'Cadena de frío 2–8 °C' },
    datacenter:  { kw:22,  uptime:'99.5%', backup:'30 min UPS', priority:'CRÍTICA',  desc:'Servidores HIS/LIS' },
    iluminacion: { kw:35,  uptime:'95.0%', backup:'Solar dir.', priority:'BÁSICA',   desc:'Pasillos y zonas de salida' },
    hvac:        { kw:70,  uptime:'97.2%', backup:'5 min UPS',  priority:'ESENCIAL', desc:'Climatización HEPA' },
  };

  // Equipos de subestación (para zoom de categoría 'batteries')
  const substCenter3d = [62, 40, 5]; // centro isométrico de la subestación

  // ── Filtro: qué zonas están activas ──
  const isZoneActive = (z) => {
    if (!activeFilter) return true;
    if (activeFilter === 'batteries') return false;
    if (activeFilter === 'CRÍTICA' || activeFilter === 'ESENCIAL' || activeFilter === 'BÁSICA')
      return z.priority === activeFilter;
    return z.key === activeFilter;
  };
  const anyActive = (zList) => zList.some(z => isZoneActive(z));

  // Zoom origin: cuando hay filtro, apunta al centro geométrico de las zonas activas
  const computeZoomOrigin = () => {
    const OX = 530, OY = 420;
    const VW = 1060, VH = 580;
    if (activeFilter === 'batteries') {
      const c = iso(...substCenter3d);
      return { px: Math.max(5,Math.min(92,((OX+c.x)/VW)*100)), py: Math.max(5,Math.min(92,((OY+c.y)/VH)*100)) };
    }
    if (hoveredZone) {
      const z = zones.find(z=>z.key===hoveredZone);
      if (z) {
        const c = iso(z.bx+z.w/2, z.by+z.d/2, z.bz+z.h/2);
        return { px: Math.max(5,Math.min(92,((OX+c.x)/VW)*100)), py: Math.max(5,Math.min(92,((OY+c.y)/VH)*100)) };
      }
    }
    if (activeFilter && activeFilter !== 'batteries') {
      const active = zones.filter(z => isZoneActive(z));
      if (active.length === 0) return { px:48, py:50 };
      let sx=0, sy=0;
      active.forEach(z => {
        const c = iso(z.bx+z.w/2, z.by+z.d/2, z.bz+z.h/2);
        sx += (OX+c.x)/VW*100; sy += (OY+c.y)/VH*100;
      });
      return { px: Math.max(5,Math.min(92,sx/active.length)), py: Math.max(5,Math.min(92,sy/active.length)) };
    }
    return { px:48, py:50 };
  };

  const zoomOrigin   = computeZoomOrigin();
  const isZoomed     = !!(activeFilter || hoveredZone);
  const zoomScale    = activeFilter === 'batteries' ? 2.2
                     : (activeFilter && ['CRÍTICA','ESENCIAL','BÁSICA'].includes(activeFilter)) ? 1.75
                     : hoveredZone ? 1.9 : 1.0;
  const OX = 530, OY = 420;

  return (
    <div className="relative w-full overflow-hidden">
      <div style={{
        transform: isZoomed ? `scale(${zoomScale})` : 'scale(1.0)',
        transformOrigin: `${zoomOrigin.px}% ${zoomOrigin.py}%`,
        transition: 'transform 0.5s cubic-bezier(0.165,0.84,0.44,1)',
        willChange: 'transform',
      }}>
        <svg viewBox="100 160 900 450"
          className="w-full"
          style={{ filter:'drop-shadow(0 8px 40px #000b)', display:'block' }}
        >
          <defs>
            <filter id="glowStrong">
              <feGaussianBlur stdDeviation="5" result="cb" />
              <feMerge><feMergeNode in="cb" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glowSoft">
              <feGaussianBlur stdDeviation="2.5" result="cb" />
              <feMerge><feMergeNode in="cb" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <g transform={`translate(${OX} ${OY})`}>

            {/* ── SUELO — tiles cubriendo toda la escena ── */}
            {[...Array(16)].map((_,xi) =>
              [...Array(14)].map((_,yi) => {
                const bx = (xi-6)*8, by = (yi-6)*8;
                const corners = [iso(bx,by,0),iso(bx+8,by,0),iso(bx+8,by+8,0),iso(bx,by+8,0)];
                return <polygon key={`t${xi}-${yi}`}
                  points={corners.map(p=>`${p.x},${p.y}`).join(' ')}
                  fill="#0c1a3e" stroke="#1e3a8a" strokeWidth="0.4" opacity="0.6" />;
              })
            )}

            {/* ── HOSPITAL — estructura por plantas ── */}
            {isoBox(0,4,0,36,18,1,'#0f2044','#0a1830','#0d1e38')}
            {isoBox(0,4,1,36,18,7,'#162a52','#0e2040','#12254a')}
            {isoBox(2,5,8,32,16,8,'#1a3060','#112245','#152850')}
            {isoBox(4,6,16,28,14,8,'#1e3570','#142848','#182e58')}
            {isoBox(13,9,24,12,8,12,'#1e3a8a','#162e6e','#1a3478')}
            {isoBox(13,9,36,12,8,2,'#162e6e','#0e2254','#12285e')}
            {isoBox(-9,6,0,10,14,6,'#122044','#0c1a38','#101e40')}
            {isoBox(37,6,0,10,14,6,'#122044','#0c1a38','#101e40')}
            {/* Líneas de plantas */}
            {[{bz:8,c:'#34d399',l:'Piso 1'},{bz:16,c:'#818cf8',l:'Piso 2'},{bz:24,c:'#60a5fa',l:'Torre'}].map(({bz,c,l})=>{
              const pA=iso(36,4,bz), pB=iso(36,22,bz), lp=iso(36,4,bz-4);
              return <g key={`fl${bz}`}><line x1={pA.x} y1={pA.y} x2={pB.x} y2={pB.y} stroke={c} strokeWidth="1.8" opacity="0.55" strokeDasharray="5 3"/><text x={lp.x+4} y={lp.y} fill={c} fontSize="6.5" fontWeight="bold" opacity="0.85">{l}</text></g>;
            })}
            {(() => { const p=iso(0,4,4); return <text x={p.x-6} y={p.y} textAnchor="end" fill="#94a3b8" fontSize="6.5" fontWeight="bold" opacity="0.85">P. Baja</text>; })()}
            {/* Ventanas */}
            {[2,6,10,14].map(woy=>[1,4].map(woz=><g key={`wg${woy}${woz}`}>{isoWindowRight(0,4,0,36,18,8,woy,woz,3,2.5)}</g>))}
            {[2,6,10].map(woy=>[1,4].map(woz=><g key={`w1${woy}${woz}`}>{isoWindowRight(2,5,8,32,16,8,woy,woz,3,2.5)}</g>))}
            {[2,6].map(woy=>[1].map(woz=><g key={`w2${woy}${woz}`}>{isoWindowRight(4,6,16,28,14,8,woy,woz,3,2.5)}</g>))}
            {/* Cruz + Helipuerto */}
            {(() => { const cH=isoWindowRight(13,9,30,1,8,10,2.5,3,2,3.5); const cV=isoWindowRight(13,9,30,1,8,10,3.5,2,1,5.5); return <g filter="url(#glowSoft)" opacity="0.9">{cH}{cV}</g>; })()}
            {(() => { const c=iso(19,13,38.5); return <g transform={`translate(${c.x} ${c.y})`} opacity="0.85"><ellipse rx={24} ry={11} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3"/><text textAnchor="middle" dy="4" fill="#fbbf24" fontSize="14" fontWeight="bold" fontFamily="Arial">H</text></g>; })()}
            {/* Paneles solares */}
            {[0,5,10,15,20].map(px=>solarPanel(px+5,7,24,4,12))}
            {[0,4].map(px=>solarPanel(px+14,10,36,3,6))}

            {/* ── PUENTES — nivel de planta ── */}
            {isoBox(-34,8,8,14,3,0.9,'#ef444428','#ef444418','#ef44441e')}
            {isoBox(-34,19,0,14,3,0.9,'#f59e0b28','#f59e0b18','#f59e0b1e')}
            {isoBox(36,8,8,16,3,0.9,'#f8717128','#f8717118','#f871711e')}
            {isoBox(36,19,16,16,3,0.9,'#6366f128','#6366f118','#6366f11e')}
            {isoBox(19,-24,0,2,28,0.9,'#3b82f628','#3b82f618','#3b82f61e')}
            {isoBox(19,22,0,2,30,0.9,'#10b98128','#10b98118','#10b9811e')}

            {/* ── SOL ANIMADO ── */}
            {(() => {
              const sc=iso(58,-16,50);
              return (
                <g transform={`translate(${sc.x} ${sc.y})`}>
                  <circle r="52" fill="#f59e0b" opacity="0.04"><animate attributeName="r" values="52;62;52" dur="3s" repeatCount="indefinite"/></circle>
                  <circle r="36" fill="#f59e0b" opacity="0.08"><animate attributeName="r" values="36;44;36" dur="2.5s" repeatCount="indefinite"/></circle>
                  <g>
                    <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite"/>
                    {Array.from({length:20},(_,k)=>{ const a=(k*18)*Math.PI/180,r1=24,r2=k%5===0?60:k%2===0?50:40,sw=k%5===0?2.5:k%2===0?1.5:0.8,op=k%5===0?0.85:0.45; return <line key={k} x1={r1*Math.cos(a)} y1={r1*Math.sin(a)} x2={r2*Math.cos(a)} y2={r2*Math.sin(a)} stroke="#fbbf24" strokeWidth={sw} opacity={op}/>; })}
                  </g>
                  <circle r="21" fill="#f97316" opacity="0.95" filter="url(#glowStrong)"/>
                  <circle r="14" fill="#fed7aa"/>
                  <circle r="8" fill="#fef3c7"/>
                  <text y="40" textAnchor="middle" fill="#fde68a" fontSize="7" fontWeight="bold" opacity="0.9">5.39 kWh/m²/d</text>
                </g>
              );
            })()}
            {[0,5,10,15,20].map((px,k)=>{ const pc=iso(px+7,13,24),sp=iso(58,-16,50); return <line key={`sr${k}`} x1={sp.x} y1={sp.y} x2={pc.x} y2={pc.y} stroke="#fbbf24" strokeWidth="0.8" opacity="0.15" strokeDasharray="8 5"><animate attributeName="opacity" values="0.08;0.22;0.08" dur={`${1.8+k*.22}s`} repeatCount="indefinite" begin={`${k*.3}s`}/></line>; })}

            {/* ══════════════════════════════════════════
                SUBESTACIÓN  — frente-derecha (bx 52-76, by 28-50)
                Separada de todas las zonas hospitalarias
                ══════════════════════════════════════════ */}
            {isoBox(52,28,0,26,22,0.8,'#0d1e3e','#0a1830','#0b1c38')}
            {/* Baterías 2×2 */}
            {isoBox(54,30,0.8,5,6,6,'#1d4e89','#153a6a','#16447a')}
            {isoBox(54,30,6.8,5,6,0.8,'#2563eb','#1d4ed8','#2056c8')}
            {isoBox(61,30,0.8,5,6,6,'#1d4e89','#153a6a','#16447a')}
            {isoBox(61,30,6.8,5,6,0.8,'#2563eb','#1d4ed8','#2056c8')}
            {isoBox(54,38,0.8,5,6,6,'#1d4e89','#153a6a','#16447a')}
            {isoBox(54,38,6.8,5,6,0.8,'#1d4ed8','#1a40c0','#1946b8')}
            {isoBox(61,38,0.8,5,6,6,'#1d4e89','#153a6a','#16447a')}
            {isoBox(61,38,6.8,5,6,0.8,'#1d4ed8','#1a40c0','#1946b8')}
            {/* LED baterías pulsantes */}
            {[30,30,38,38].map((by,k)=>{
              const bx=[54,61,54,61][k];
              const p=iso(bx+2.5,by+3,7.8);
              return <circle key={`batled${k}`} cx={p.x} cy={p.y} r="2.5" fill="#34d399" opacity="0.9">
                <animate attributeName="opacity" values="0.9;0.2;0.9" dur={`${1.2+k*.3}s`} repeatCount="indefinite"/>
              </circle>;
            })}
            {/* Etiquetas baterías */}
            {[{bx:54,by:30},{bx:61,by:30},{bx:54,by:38},{bx:61,by:38}].map(({bx,by},k)=>{
              const p=iso(bx+2.5,by+3,9); return <text key={`batl${k}`} x={p.x} y={p.y} textAnchor="middle" fill="#93c5fd" fontSize="5" fontWeight="bold">🔋{k<2?'100':' 50'}kWh</text>;
            })}
            {(() => { const p=iso(60,32,10.5); return <text x={p.x} y={p.y} textAnchor="middle" fill="#60a5fa" fontSize="6.5" fontWeight="bold">BANCO LFP 300kWh</text>; })()}
            {/* Inversores ×2 */}
            {isoBox(68,30,0.8,5,5,8,'#4c1d95','#3b1578','#440d85')}
            {isoBox(68,30,8.8,5,5,1,'#7c3aed','#5b21b6','#6d28d9')}
            {isoBox(68,38,0.8,5,5,8,'#4c1d95','#3b1578','#440d85')}
            {isoBox(68,38,8.8,5,5,1,'#7c3aed','#5b21b6','#6d28d9')}
            {/* LEDs inversores */}
            {[[68,30],[68,38]].map(([bx,by],k)=>{
              const p=iso(bx+2.5,by+2.5,5);
              return <g key={`invled${k}`}>
                <circle cx={p.x-4} cy={p.y} r="2.2" fill="#34d399" opacity="0.9"><animate attributeName="opacity" values="0.9;0.3;0.9" dur={`${1.2+k*.4}s`} repeatCount="indefinite"/></circle>
                <circle cx={p.x+2} cy={p.y} r="2.2" fill="#fbbf24" opacity="0.85"><animate attributeName="opacity" values="0.85;0.4;0.85" dur={`${1.8+k*.3}s`} repeatCount="indefinite" begin={`${k*.5}s`}/></circle>
              </g>;
            })}
            {(() => { const p=iso(70.5,37,11); return <text x={p.x} y={p.y} textAnchor="middle" fill="#c084fc" fontSize="6" fontWeight="bold">⚡INV-1 125kVA</text>; })()}
            {(() => { const p=iso(70.5,46,11); return <text x={p.x} y={p.y} textAnchor="middle" fill="#c084fc" fontSize="6" fontWeight="bold">⚡INV-2 125kVA</text>; })()}
            {/* SCADA */}
            {isoBox(54,44,0.8,4,6,7,'#164e63','#0e3a50','#12435c')}
            {isoBox(54,44,7.8,4,6,1,'#0ea5e9','#0284c7','#0891b2')}
            {(() => {
              const sc=iso(56,47,5);
              return <g>
                <rect x={sc.x-9} y={sc.y-5} width="18" height="11" rx="1.5" fill="#0c2a40" stroke="#0ea5e9" strokeWidth="0.8"/>
                <polyline points={`${sc.x-7},${sc.y+2} ${sc.x-4},${sc.y-2} ${sc.x-1},${sc.y+1} ${sc.x+2},${sc.y-3} ${sc.x+5},${sc.y}`} fill="none" stroke="#34d399" strokeWidth="1"/>
              </g>;
            })()}
            {(() => { const p=iso(56,47,9.5); return <text x={p.x} y={p.y} textAnchor="middle" fill="#38bdf8" fontSize="5.8" fontWeight="bold">📡 SCADA</text>; })()}
            {/* Bus AC subestación → hospital */}
            {(() => {
              const sub=iso(68,35,4), hosp=iso(36,14,4);
              const pathD=`M ${sub.x} ${sub.y} L ${hosp.x} ${hosp.y}`;
              return <g>
                <path d={pathD} stroke="#34d399" strokeWidth="2.5" fill="none" strokeDasharray="10 4" opacity="0.7"/>
                <circle r="4" fill="#34d399" opacity="0.9"><animateMotion dur="1.8s" repeatCount="indefinite" path={pathD}/></circle>
              </g>;
            })()}

            {/* ══════════════════════════════════════════
                POSTES AIRE (empresa eléctrica Barranquilla)
                Frente-izquierda: bx -20..-4, by -34..-20
                ══════════════════════════════════════════ */}
            {/* 3 postes alineados */}
            {[[-18,-28],[-10,-28],[-2,-28]].map(([pbx,pby],pi)=>{
              const base=iso(pbx+1,pby+1,0.8);
              const top =iso(pbx+1,pby+1,22);
              const armL=iso(pbx-2,pby+1,22);
              const armR=iso(pbx+4,pby+1,22);
              const armM=iso(pbx+1,pby+1,22);
              return (
                <g key={`pole${pi}`}>
                  {isoBox(pbx,pby,0,2,2,1,'#334155','#1e293b','#263044')}
                  <line x1={base.x} y1={base.y} x2={top.x} y2={top.y} stroke="#64748b" strokeWidth="2.8"/>
                  {/* Brazo cruzado */}
                  <line x1={armL.x} y1={armL.y} x2={armR.x} y2={armR.y} stroke="#64748b" strokeWidth="2"/>
                  {/* 3 aisladores por poste */}
                  {[-2,1,4].map((ox,ii)=>{
                    const ap=iso(pbx+ox,pby+1,22);
                    return <g key={`ins${pi}-${ii}`}>
                      <circle cx={ap.x} cy={ap.y+5} r="2.8" fill="none" stroke="#94a3b8" strokeWidth="1"/>
                      <circle cx={ap.x} cy={ap.y+11} r="2.8" fill="none" stroke="#94a3b8" strokeWidth="1"/>
                      <line x1={ap.x} y1={ap.y} x2={ap.x} y2={ap.y+14} stroke="#94a3b8" strokeWidth="0.8"/>
                    </g>;
                  })}
                  {/* Cable aéreo entre postes */}
                  {pi<2 && (() => {
                    const nx=iso([-10,-2][pi]+1,pby+1,22);
                    return <path d={`M ${armM.x} ${armM.y} Q ${(armM.x+nx.x)/2} ${Math.max(armM.y,nx.y)+8} ${nx.x} ${nx.y}`}
                      stroke="#64748b" strokeWidth="1.2" fill="none" opacity="0.7"/>;
                  })()}
                </g>
              );
            })}
            {/* Etiqueta AIRE */}
            {(() => { const p=iso(-10,-30,24); return <text x={p.x} y={p.y-8} textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">🌐 AIRE 220V/60Hz</text>; })()}
            {/* Cable AIRE → subestación */}
            {(() => {
              const pole=iso(-2,-27,12);
              const sub =iso(54,44,4);
              const mx=(pole.x+sub.x)/2, my=Math.min(pole.y,sub.y)-30;
              const pathD=`M ${pole.x} ${pole.y} Q ${mx} ${my} ${sub.x} ${sub.y}`;
              return <g>
                <path d={pathD} stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeDasharray="10 5" opacity="0.65">
                  <animate attributeName="stroke-dashoffset" values="0;-30" dur="2.2s" repeatCount="indefinite"/>
                </path>
                <circle r="3.5" fill="#3b82f6" opacity="0.9"><animateMotion dur="2.2s" repeatCount="indefinite" path={pathD}/></circle>
              </g>;
            })()}

            {/* ── ZONAS CRÍTICAS ── */}
            {zones.map((z)=>{
              const isHov = hoveredZone===z.key;
              const isAct = isZoneActive(z);
              const opacity= (hoveredZone && !isHov && !activeFilter) ? 0.35
                           : (!isAct && activeFilter) ? 0.18 : 1;
              const topC  = isHov||isAct ? z.color+'cc' : z.color+'55';
              const rightC= isHov||isAct ? z.color+'88' : z.color+'2a';
              const leftC = isHov||isAct ? z.color+'99' : z.color+'3e';
              return (
                <g key={z.key} opacity={opacity}
                  style={{cursor:'pointer',transition:'opacity 0.25s'}}
                  onMouseEnter={()=>setHoveredZone(z.key)}
                  onMouseLeave={()=>setHoveredZone(null)}>
                  {isoBox(z.bx,z.by,z.bz,z.w,z.d,0.8,'#0b1836','#0a1630','#0c1838')}
                  {isoBox(z.bx,z.by,z.bz,z.w,z.d,z.h,topC,rightC,leftC)}
                  {isHov&&(()=>{ const p=iso(z.bx+z.w/2,z.by+z.d/2,z.bz+z.h/2); return <circle cx={p.x} cy={p.y} r={38} fill={z.color} opacity="0.10" filter="url(#glowStrong)"/>; })()}
                  {(()=>{
                    const c=iso(z.bx+z.w/2,z.by+z.d/2,z.bz+z.h+1.8);
                    return <g>
                      <text x={c.x} y={c.y-5} textAnchor="middle" fill="white" fontSize={isHov?'13':'11'} style={{transition:'font-size 0.2s'}}>{z.icon}</text>
                      <text x={c.x} y={c.y+8} textAnchor="middle" fill={isHov?z.color:'white'} fontSize="7.5" fontWeight="bold" style={{transition:'fill 0.2s'}}>{z.label}</text>
                      <text x={c.x} y={c.y+19} textAnchor="middle" fill={z.floorColor} fontSize="5.8" fontWeight="bold" opacity={isHov?1:0.7}>{z.floor}</text>
                    </g>;
                  })()}
                </g>
              );
            })}
            {/* Cables energía */}
            {zones.map((z,k)=>energyLine(z.from3d,z.to3d,z.color,`${1.8+k*.2}s`,`${k*.3}s`,`cable-${z.key}`))}
          </g>
        </svg>
      </div>{/* /zoom-layer */}

      {/* ── TOOLTIPS unificados: hover > filtro zona > filtro categoría > subestación ── */}
      {(()=>{
        // Determinar qué clave mostrar
        const isZoneKey = (k) => zones.some(z=>z.key===k);
        const tipKey = hoveredZone || (!hoveredZone && activeFilter && isZoneKey(activeFilter) ? activeFilter : null);

        // 1 ── Zona individual (hover O filtro de zona)
        if (tipKey) {
          const z = zones.find(zz=>zz.key===tipKey);
          const d = zoneDetails[tipKey];
          if (!z||!d) return null;
          return (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-20 pointer-events-none"
              style={{animation:'tooltipAppear 0.18s ease'}}>
              <div className="rounded-2xl px-5 py-3 backdrop-blur-md flex items-center gap-4"
                style={{background:'rgba(6,14,43,0.97)',border:`1.5px solid ${z.color}`,boxShadow:`0 0 28px ${z.color}44,0 8px 32px #000c`}}>
                <span className="text-3xl">{z.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-base">{z.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{background:z.color+'33',color:z.color,border:`1px solid ${z.color}55`}}>{z.floor}</span>
                    {activeFilter===tipKey&&!hoveredZone&&<span className="text-xs text-white/30 italic">seleccionada</span>}
                  </div>
                  <div className="text-xs text-white/60 mb-1">{d.desc}</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span style={{color:z.color}} className="font-bold">{d.kw} kW</span>
                    <span className="text-white/50">·</span>
                    <span className="text-white/70">{d.backup}</span>
                    <span className="text-white/50">·</span>
                    <span className={`font-semibold ${d.priority==='CRÍTICA'?'text-red-400':d.priority==='ESENCIAL'?'text-yellow-400':'text-blue-400'}`}>{d.priority}</span>
                    <span className="text-white/50">· uptime</span>
                    <span className="text-energy-green-400 font-bold">{d.uptime}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // 2 ── Subestación (filtro batteries)
        if (activeFilter==='batteries') {
          return (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-20 pointer-events-none"
              style={{animation:'tooltipAppear 0.18s ease'}}>
              <div className="rounded-2xl px-5 py-3 backdrop-blur-md"
                style={{background:'rgba(6,14,43,0.97)',border:'1.5px solid #a855f7',boxShadow:'0 0 28px #a855f744,0 8px 32px #000c'}}>
                <div className="font-bold text-white text-base mb-1">⚡ Subestación Eléctrica</div>
                <div className="text-xs text-white/60 mb-2">Inversores híbridos + Banco LFP + SCADA · Red AIRE 220V/60Hz</div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="text-center"><div className="text-purple-300 font-bold text-base">300 kWh</div><div className="text-white/50">Banco LFP</div></div>
                  <div className="text-center"><div className="text-purple-300 font-bold text-base">2×125 kVA</div><div className="text-white/50">Inversores</div></div>
                  <div className="text-center"><div className="text-energy-green-400 font-bold text-base">98.5%</div><div className="text-white/50">MPPT</div></div>
                </div>
              </div>
            </div>
          );
        }

        // 3 ── Categoría de prioridad (CRÍTICA / ESENCIAL / BÁSICA)
        if (activeFilter && ['CRÍTICA','ESENCIAL','BÁSICA'].includes(activeFilter)) {
          const grpZones = zones.filter(z=>z.priority===activeFilter);
          const totalKw  = grpZones.reduce((s,z)=>s+(zoneDetails[z.key]?.kw||0), 0);
          const grpColor = activeFilter==='CRÍTICA'?'#ef4444':activeFilter==='ESENCIAL'?'#f59e0b':'#3b82f6';
          const grpEmoji = activeFilter==='CRÍTICA'?'🔴':activeFilter==='ESENCIAL'?'🟡':'🔵';
          return (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-20 pointer-events-none"
              style={{animation:'tooltipAppear 0.18s ease'}}>
              <div className="rounded-2xl px-5 py-3 backdrop-blur-md"
                style={{background:'rgba(6,14,43,0.97)',border:`1.5px solid ${grpColor}`,boxShadow:`0 0 28px ${grpColor}44,0 8px 32px #000c`}}>
                <div className="font-bold text-white text-base mb-2">{grpEmoji} Zonas {activeFilter}S</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {grpZones.map(z=>{
                    const d=zoneDetails[z.key];
                    return (
                      <div key={z.key} className="text-xs rounded-lg px-2 py-1"
                        style={{background:z.color+'1a',border:`1px solid ${z.color}44`,color:'#e2e8f0'}}>
                        <span>{z.icon} <strong style={{color:z.color}}>{z.label}</strong></span>
                        <span className="text-white/50 ml-1">{d?.kw} kW · uptime {d?.uptime}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3 text-xs text-white/55">
                  <span>Carga total: <strong style={{color:grpColor}}>{totalKw} kW</strong></span>
                  <span>·</span>
                  <span>{grpZones.length} zona{grpZones.length>1?'s':''}</span>
                </div>
              </div>
            </div>
          );
        }

        return null;
      })()}
    </div>
  );
}


function HospitalScene3DSlide() {
  const [activeFilter, setActiveFilter] = useState(null);

  // Categorías → filtros de prioridad
  const CATEGORIES = [
    { key: 'CRÍTICA',  label: '🔴 Zona Crítica',    color: '#ef4444', info: 'UCI · Quirófanos · Data Center — prioridad máxima 24/7' },
    { key: 'ESENCIAL', label: '🟡 Zona Esencial',   color: '#f59e0b', info: 'Farmacia · HVAC — operación continua requerida' },
    { key: 'BÁSICA',   label: '🔵 Zona Básica',     color: '#3b82f6', info: 'Pasillos e iluminación general' },
    { key: 'batteries',label: '🟣 Subestación',     color: '#a855f7', info: 'Banco LFP 300kWh + 2 Inversores 125kVA + SCADA + AIRE 220V' },
  ];

  // Zonas individuales
  const ZONES = [
    { key: 'uci',         label: 'UCI',         icon: '❤️',  color: '#ef4444' },
    { key: 'quirofanos',  label: 'Quirófanos',  icon: '🔪',  color: '#f87171' },
    { key: 'datacenter',  label: 'Data Center', icon: '🖥️', color: '#6366f1' },
    { key: 'farmacia',    label: 'Farmacia',    icon: '💊',  color: '#f59e0b' },
    { key: 'hvac',        label: 'HVAC',        icon: '🌡️', color: '#10b981' },
    { key: 'iluminacion', label: 'Pasillos',    icon: '💡',  color: '#3b82f6' },
  ];

  const toggleFilter = (key) => setActiveFilter(prev => prev === key ? null : key);

  const activeInfo = CATEGORIES.find(c=>c.key===activeFilter)?.info
                  || ZONES.find(z=>z.key===activeFilter)?.label;

  return (
    <Section id="hospital3d" className="bg-medical-blue-950 overflow-hidden">
      <Reveal>
        <div className="text-center mb-10">
          <span className="text-energy-green-400 text-sm font-semibold tracking-widest uppercase mb-3 block">
            02b · Vista Isométrica del Ecosistema
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Hospital Solar{' '}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #fbbf24, #34d399)' }}>
              Nazareth 1
            </span>
          </h2>
          <p className="text-medical-blue-300 max-w-2xl mx-auto">
            Visualización 3D isométrica interactiva · Hover para métricas · Selecciona
            una categoría o zona individual para hacer zoom y filtrar.
          </p>
        </div>
      </Reveal>

      {/* ── Filtros de categoría ── */}
      <Reveal delay={80}>
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {CATEGORIES.map(cat => {
            const active = activeFilter === cat.key;
            return (
              <button key={cat.key}
                onClick={() => toggleFilter(cat.key)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
                style={{
                  background: active ? cat.color + '33' : 'rgba(15,32,68,0.8)',
                  border: `1.5px solid ${active ? cat.color : cat.color + '44'}`,
                  color: active ? cat.color : '#94a3b8',
                  boxShadow: active ? `0 0 14px ${cat.color}44` : 'none',
                  transform: active ? 'scale(1.06)' : 'scale(1)',
                }}>
                {cat.label}
                {active && <span className="text-white/60 ml-1 text-xs">✕</span>}
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* ── Filtros de zona individual ── */}
      <Reveal delay={120}>
        <div className="flex flex-wrap justify-center gap-2 mb-5">
          {ZONES.map(z => {
            const active = activeFilter === z.key;
            return (
              <button key={z.key}
                onClick={() => toggleFilter(z.key)}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  background: active ? z.color + '2a' : 'rgba(10,20,50,0.7)',
                  border: `1px solid ${active ? z.color : z.color + '33'}`,
                  color: active ? z.color : '#cbd5e1',
                  boxShadow: active ? `0 0 10px ${z.color}33` : 'none',
                  transform: active ? 'scale(1.08)' : 'scale(1)',
                }}>
                <span>{z.icon}</span> {z.label}
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Info bar del filtro activo */}
      {activeFilter && activeInfo && (
        <div className="flex justify-center mb-4">
          <div className="text-xs text-white/55 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
            🔍 {activeInfo}
            <button onClick={()=>setActiveFilter(null)} className="ml-3 text-white/40 hover:text-white/80 transition-colors">✕ limpiar</button>
          </div>
        </div>
      )}

      {/* Escena 3D isométrica */}
      <Reveal direction="slideRotate">
        <div className="relative bg-medical-blue-950 border border-medical-blue-800/50 rounded-3xl overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 60% 30%, #0d1e4a 0%, #060e2b 70%)',
            boxShadow: '0 0 80px rgba(52,211,153,0.06), inset 0 0 60px rgba(0,0,0,0.5)',
          }}>
          <HospitalIsoScene externalFilter={activeFilter} />
        </div>
      </Reveal>

      {/* Leyenda compacta */}
      <Reveal delay={300}>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-white/40">
          <span>🔴 Crítica</span><span>·</span>
          <span>🟡 Esencial</span><span>·</span>
          <span>🔵 Básica</span><span>·</span>
          <span>🟢 Paneles FV</span><span>·</span>
          <span>🟣 Subestación AIRE</span><span>·</span>
          <span className="text-white/25 italic">Hover = métricas · Click categoría = zoom grupo</span>
        </div>
      </Reveal>
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
        <HospitalScene3DSlide />
        <DatosSlide />
        <RetosSlide />
        <ImpactoSlide />
      </main>
      <Footer />
    </>
  );
}
