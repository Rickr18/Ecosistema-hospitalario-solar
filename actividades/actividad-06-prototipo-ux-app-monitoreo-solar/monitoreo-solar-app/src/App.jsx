import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header  from './components/Header.jsx';
import Dashboard   from './screens/Dashboard.jsx';
import SolarPanels from './screens/SolarPanels.jsx';
import Batteries   from './screens/Batteries.jsx';
import Alerts      from './screens/Alerts.jsx';
import History     from './screens/History.jsx';

const screens = {
  dashboard: Dashboard,
  panels:    SolarPanels,
  batteries: Batteries,
  alerts:    Alerts,
  history:   History,
};

export default function App() {
  const [current, setCurrent] = useState('dashboard');

  const Screen = screens[current] ?? Dashboard;

  return (
    <div className="flex h-screen overflow-hidden bg-medical-blue-950">
      <Sidebar current={current} onNavigate={setCurrent} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header currentScreen={current} />

        {/* Screen area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <Screen key={current} onNavigate={setCurrent} />
        </main>
      </div>
    </div>
  );
}
