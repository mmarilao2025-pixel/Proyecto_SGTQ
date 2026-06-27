import React, { useState } from 'react';
import Sidebar from './pages/components/Sidebar';
import PatientRegistry, { Paciente } from './pages/components/PatientRegistry';
import SurgeryScheduler from './pages/components/SurgeryScheduler';
import SurgeryList from './pages/components/SurgeryList';
import FatigueCard from './pages/components/FatigueCard';
import EventStatsCard from './pages/components/EventStatsCard';
import FatigueResetCard from './pages/components/FatigueResetCard';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('cronograma');
  
  // Estado global para compartir el paciente seleccionado/creado hacia el agendamiento
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);

  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans overflow-hidden">
      {/* 1. Barra Lateral Pasando el estado de navegación */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* 2. Contenido Principal Dinámico */}
      <div className="flex-1 overflow-y-auto p-8">
        {(() => {
          switch (activeView) {
            case 'cronograma':
              return <SurgeryList />;
              
            case 'equipo':
              // 2. Modificamos la vista de equipo para mostrar ambas tarjetas
              return (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <FatigueCard />
                  <FatigueResetCard />
                </div>
              );
              
            case 'pacientes':
              // La pestaña de Ficha Clínica muestra el buscador y formulario de registro
              return (
                <PatientRegistry 
                  onPacienteValidado={(paciente) => {
                    setPacienteSeleccionado(paciente);
                    setActiveView('agendamiento'); // Redirección automática al flujo de pabellón
                  }} 
                />
              );
              
            case 'agendamiento':
              // Si no hay paciente seleccionado, pedimos que seleccione uno
              if (!pacienteSeleccionado) {
                return (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <p className="mb-4">Por favor, valida o registra un paciente primero.</p>
                    <button 
                      onClick={() => setActiveView('pacientes')}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                    >
                      Ir a Ficha Clínica
                    </button>
                  </div>
                );
              }

              // Si hay paciente, mostramos el agendamiento normal
              return (
                <SurgeryScheduler 
                  paciente={pacienteSeleccionado} 
                  onSuccess={() => {
                    alert('¡Cirugía agendada con éxito!');
                    setPacienteSeleccionado(null);
                    setActiveView('cronograma'); // Volver a la vista principal
                  }}
                />
              );
              
            case 'auditoria':
              return <EventStatsCard />;
              
            default:
              return <SurgeryList />;
          }
        })()}
      </div>
    </div>
  );
};

export default App;