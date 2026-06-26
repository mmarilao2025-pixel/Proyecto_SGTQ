import React, { useState } from 'react';
import Sidebar from './pages/components/Sidebar';
import PatientRegistry, { Paciente } from './pages/components/PatientRegistry';
import SurgeryScheduler from './pages/components/SurgeryScheduler';
import SurgeryList from './pages/components/SurgeryList';
import FatigueCard from './pages/components/FatigueCard';
import EventStatsCard from './pages/components/EventStatsCard';

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
              return <FatigueCard />;
              
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
              // La pestaña de Agendamiento maneja los pabellones y horarios
              return (
                <SurgeryScheduler 
                  paciente={pacienteSeleccionado || { rut: '', nombre: '', sexo: '', prevision: '', tipoSangre: '', alergias: '', enfermedadesCronicas: '' }} 
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