import React, { useState } from 'react';
import Sidebar from './pages/components/Sidebar';

// Importamos los componentes que ya tenías
import { DashboardComponent } from './pages/Dashboard';
import SurgeryList from './pages/components/SurgeryList';
import FatigueCard from './pages/components/FatigueCard';
import EventStatsCard from './pages/components/EventStatsCard';
import ScheduleForm from './pages/components/ScheduleForm';

const App: React.FC = () => {
  // Estado que controla qué pantalla estamos viendo
  const [activeView, setActiveView] = useState('cronograma');

  // Función para renderizar el título dinámico superior
  const getPageTitle = () => {
    switch (activeView) {
      case 'cronograma': return 'Cronograma de Cirugías';
      case 'equipo': return 'Gestión del Equipo Médico';
      case 'agendamiento': return 'Agendamiento de Pacientes';
      case 'auditoria': return 'Auditoría y Control de Recursos';
      default: return 'Panel Quirúrgico';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* 1. La nueva Barra Lateral */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* 2. Área de Contenido Principal a la derecha */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Cabecera Superior Blanca */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm z-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{getPageTitle()}</h2>
            <p className="text-sm text-slate-500 mt-0.5">Panel de control operativo SGTQ</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
             <i className="fa-solid fa-server text-slate-400"></i>
             <span className="text-xs font-semibold text-slate-600 tracking-wide">
                API Conectada: {window.location.hostname}
             </span>
          </div>
        </header>

        {/* Zona de Scroll donde cambian las vistas */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* VISTA 1: CRONOGRAMA */}
          {activeView === 'cronograma' && (
            <div className="space-y-8 animate-fade-in">
              <DashboardComponent />
              <SurgeryList />
            </div>
          )}

          {/* VISTA 2: EQUIPO MÉDICO */}
          {activeView === 'equipo' && (
            <div className="max-w-5xl animate-fade-in">
              <FatigueCard />
              {/* Aquí luego podemos añadir más detalles de los doctores */}
            </div>
          )}

          {/* VISTA 3: AGENDAMIENTO */}
          {activeView === 'agendamiento' && (
            <div className="max-w-3xl animate-fade-in">
              <ScheduleForm />
              {/* Este es el formulario que mejoraremos en el próximo paso */}
            </div>
          )}

          {/* VISTA 4: AUDITORÍA */}
          {activeView === 'auditoria' && (
            <div className="grid xl:grid-cols-2 gap-8 animate-fade-in">
              <EventStatsCard />
              {/* Aquí añadiremos los logs en tiempo real luego */}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;