import React from 'react';
import { DashboardComponent } from './pages/Dashboard';
import SurgeryList from './pages/coponents/SurgeryList';
import FatigueCard from './pages/coponents/FatigueCard';
import EventStatsCard from './pages/coponents/EventStatsCard';
import ScheduleForm from './pages/coponents/ScheduleForm';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">SGTQ</p>
            <h1 className="text-3xl font-bold text-slate-900">Control Operativo Quirúrgico</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">Panel en tiempo real</div>
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">Conexión API: {window.location.hostname}</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <DashboardComponent />

        <div className="grid xl:grid-cols-[1.7fr_1fr] gap-6">
          <SurgeryList />
          <div className="space-y-6">
            <FatigueCard />
            <EventStatsCard />
          </div>
        </div>

        <ScheduleForm />
      </main>
    </div>
  );
};

export default App;
