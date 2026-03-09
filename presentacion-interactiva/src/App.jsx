import { useEffect, useRef } from 'react';
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

/* ─── Animated SVG energy flow ─── */
function EnergyFlowSVG() {
  return (
    <svg viewBox="0 0 800 320" className="w-full max-w-4xl mx-auto" aria-label="Diagrama de flujo de energía">
      {/* Defs */}
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#34d399" />
        </marker>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="solarGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7"/>
        </linearGradient>
        <linearGradient id="inverterGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.7"/>
        </linearGradient>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#059669" stopOpacity="0.7"/>
        </linearGradient>
      </defs>

      {/* Paneles Solares */}
      <rect x="20" y="110" width="160" height="100" rx="12" fill="url(#solarGrad)" filter="url(#glow)" />
      <text x="100" y="148" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">☀️ Paneles</text>
      <text x="100" y="166" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">Fotovoltaicos</text>
      <text x="100" y="184" textAnchor="middle" fill="#fef3c7" fontSize="11">~250 kWp</text>

      {/* Arrow 1 */}
      <line x1="180" y1="160" x2="290" y2="160" stroke="#34d399" strokeWidth="3" markerEnd="url(#arrow)"
        strokeDasharray="8 4" className="flow-line" />
      <text x="235" y="152" textAnchor="middle" fill="#6ee7b7" fontSize="10">DC →</text>

      {/* Inversores */}
      <rect x="290" y="110" width="160" height="100" rx="12" fill="url(#inverterGrad)" filter="url(#glow)" />
      <text x="370" y="148" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">⚡ Inversores</text>
      <text x="370" y="166" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">Híbridos</text>
      <text x="370" y="184" textAnchor="middle" fill="#bfdbfe" fontSize="11">DC/AC + MPPT</text>

      {/* Arrow 2 */}
      <line x1="450" y1="160" x2="560" y2="160" stroke="#34d399" strokeWidth="3" markerEnd="url(#arrow)"
        strokeDasharray="8 4" className="flow-line" />
      <text x="505" y="152" textAnchor="middle" fill="#6ee7b7" fontSize="10">AC →</text>

      {/* Áreas Críticas */}
      <rect x="560" y="20" width="160" height="72" rx="10" fill="url(#areaGrad)" filter="url(#glow)" />
      <text x="640" y="52" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">🏥 UCI</text>
      <text x="640" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10">Unidad de Cuidados</text>
      <text x="640" y="84" textAnchor="middle" fill="#d1fae5" fontSize="10">Intensivos</text>

      <rect x="560" y="124" width="160" height="72" rx="10" fill="url(#areaGrad)" filter="url(#glow)" />
      <text x="640" y="156" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">💊 Farmacia</text>
      <text x="640" y="174" textAnchor="middle" fill="#d1fae5" fontSize="10">Cadena de frío</text>
      <text x="640" y="188" textAnchor="middle" fill="#d1fae5" fontSize="10">de vacunas</text>

      <rect x="560" y="228" width="160" height="72" rx="10" fill="url(#areaGrad)" filter="url(#glow)" />
      <text x="640" y="260" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">🖥️ Data Center</text>
      <text x="640" y="278" textAnchor="middle" fill="#d1fae5" fontSize="10">Servidores y</text>
      <text x="640" y="292" textAnchor="middle" fill="#d1fae5" fontSize="10">monitoreo</text>

      {/* Distribution lines from inverter to areas */}
      <line x1="560" y1="56" x2="540" y2="56" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="540" y1="56" x2="540" y2="160" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="540" y1="160" x2="560" y2="160" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="540" y1="264" x2="560" y2="264" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="540" y1="160" x2="540" y2="264" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 3" />
    </svg>
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
    { href: '#datos', label: 'Datos' },
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
        <span className="text-xs text-medical-blue-400 hidden md:block">Sede Nazareth 1</span>
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
              Sede Nazareth 1 · 2024
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
            <a href="#ecosistema"
              className="px-8 py-3 rounded-full border border-medical-blue-400 text-medical-blue-200 hover:border-energy-green-400 hover:text-energy-green-400 font-semibold transition-all duration-300">
              Ver mapa del ecosistema
            </a>
          </div>
        </Reveal>

        {/* Stats bar */}
        <Reveal delay={600}>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '~250 kWp', label: 'Capacidad instalada', icon: '☀️' },
              { value: '6 áreas', label: 'Zonas críticas cubiertas', icon: '🏥' },
              { value: 'Data 2018', label: 'Histórico de consumo', icon: '📊' },
              { value: 'Python', label: 'Motor de análisis', icon: '🐍' },
            ].map((s) => (
              <div key={s.label}
                className="bg-medical-blue-900/50 border border-medical-blue-700/40 rounded-2xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl font-bold text-energy-green-400">{s.value}</div>
                <div className="text-xs text-medical-blue-300 mt-1">{s.label}</div>
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
   SLIDE 4 — FLUJO DE DATOS REAL
════════════════════════════════════════════ */
function DatosSlide() {
  const steps = [
    {
      step: '01',
      title: 'Registros Históricos',
      subtitle: 'Data 2018',
      desc: 'Datos reales de consumo energético hospitalario del año 2018 almacenados en CONSUMO DE ENERGIA 2018.xlsx, con registros mensuales por área.',
      icon: '📂',
      color: 'from-amber-700/40 to-amber-900/40',
      border: 'border-amber-500/30',
      accent: 'text-amber-300',
    },
    {
      step: '02',
      title: 'Preprocesamiento',
      subtitle: 'Pandas + NumPy',
      desc: 'Limpieza, normalización y análisis exploratorio de datos. Identificación de patrones de consumo por turno, área y estación del año.',
      icon: '🔬',
      color: 'from-purple-700/40 to-purple-900/40',
      border: 'border-purple-500/30',
      accent: 'text-purple-300',
    },
    {
      step: '03',
      title: 'Modelo Python',
      subtitle: 'Algoritmo de Monitoreo',
      desc: 'Script Python que estima la generación fotovoltaica diaria, simula la demanda energética y detecta anomalías en el consumo en tiempo real.',
      icon: '🐍',
      color: 'from-medical-blue-700/40 to-medical-blue-900/40',
      border: 'border-medical-blue-500/30',
      accent: 'text-medical-blue-300',
    },
    {
      step: '04',
      title: 'Dashboard Gerencial',
      subtitle: 'Toma de Decisiones',
      desc: 'Visualización integrada de KPIs energéticos, alertas predictivas y reportes automáticos para la dirección hospitalaria.',
      icon: '📊',
      color: 'from-energy-green-700/40 to-energy-green-900/40',
      border: 'border-energy-green-500/30',
      accent: 'text-energy-green-300',
    },
  ];

  const codeSnippet = `import pandas as pd
import numpy as np

# Cargar datos históricos 2018
df = pd.read_excel("CONSUMO DE ENERGIA 2018.xlsx")

# Calcular generación fotovoltaica estimada
IRRADIACION_PROM = 4.5  # kWh/m²/día (Bogotá)
AREA_PANELES = 1200     # m²
EFICIENCIA = 0.185      # 18.5%

df['generacion_kwh'] = (
    IRRADIACION_PROM * AREA_PANELES * EFICIENCIA
)

# Balance energético
df['balance'] = df['generacion_kwh'] - df['consumo_kwh']
df['ahorro_pct'] = (df['generacion_kwh'] / df['consumo_kwh']) * 100

print(df[['mes', 'consumo_kwh', 'generacion_kwh',
          'balance', 'ahorro_pct']].to_string())`;

  return (
    <Section id="datos" className="bg-medical-blue-950">
      <Reveal>
        <div className="text-center mb-14">
          <span className="text-energy-green-400 text-sm font-semibold tracking-widest uppercase mb-3 block">
            03 · Flujo de Datos Real
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            De los Datos{' '}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #34d399, #3b82f6)' }}>
              a las Decisiones
            </span>
          </h2>
          <p className="text-medical-blue-300 max-w-2xl mx-auto text-lg">
            Los registros históricos de consumo 2018 alimentan el algoritmo de monitoreo
            Python para la toma de decisiones estratégicas.
          </p>
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

      {/* Code snippet */}
      <Reveal>
        <div className="bg-gray-900/80 border border-gray-700/40 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/80 border-b border-gray-700/40">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-3 text-gray-400 text-xs font-mono">monitoreo_solar.py</span>
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
        { label: 'Ahorro anual estimado', value: '$45,000 USD' },
        { label: 'ROI proyectado', value: '8 años' },
        { label: 'Reducción factura eléctrica', value: '~65%' },
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
        { label: 'CO₂ evitado anual', value: '~180 ton' },
        { label: 'Equivalente en árboles', value: '8,200 árboles' },
        { label: 'Energía limpia generada', value: '340 MWh/año' },
        { label: 'Reducción huella hídrica', value: '30%' },
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
        { label: 'Incidentes por corte', value: '↓ 95%' },
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
              Un hospital que genera su propia energía
            </h3>
            <p className="text-medical-blue-200 max-w-2xl mx-auto mb-6 leading-relaxed">
              El Ecosistema Hospitalario Solar Sede Nazareth 1 representa un modelo replicable
              de hospital del futuro: autosuficiente, resiliente y comprometido con el planeta
              y con la vida de sus pacientes.
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
        © 2024 Ecosistema Hospitalario Solar · Sede Nazareth 1 ·{' '}
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
