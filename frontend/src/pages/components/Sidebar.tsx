import React from 'react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 shadow-2xl z-10">
      {/* Logo / Cabecera */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-3 text-white">
          <i className="fa-solid fa-heart-pulse text-2xl text-blue-500"></i>
          <div>
            <h1 className="text-xl font-bold leading-none tracking-wide">SGTQ</h1>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Hospital Univ.</span>
          </div>
        </div>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <button 
          onClick={() => setActiveView('cronograma')} 
          className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
            activeView === 'cronograma' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <i className={`fa-solid fa-calendar-days w-5 text-center text-lg ${activeView === 'cronograma' ? 'text-blue-200' : 'text-slate-500'}`}></i> 
          <span>Cronograma</span>
        </button>

        <button 
          onClick={() => setActiveView('equipo')} 
          className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
            activeView === 'equipo' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <i className={`fa-solid fa-user-doctor w-5 text-center text-lg ${activeView === 'equipo' ? 'text-blue-200' : 'text-slate-500'}`}></i> 
          <span>Equipo Médico</span>
        </button>

        <button 
          onClick={() => setActiveView('pacientes')} 
          className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
            activeView === 'pacientes' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <i className={`fa-solid fa-id-card w-5 text-center text-lg ${activeView === 'pacientes' ? 'text-blue-200' : 'text-slate-500'}`}></i> 
          <span>Ficha Clínica</span>
        </button>

        <button 
          onClick={() => setActiveView('agendamiento')} 
          className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
            activeView === 'agendamiento' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <i className={`fa-solid fa-book-medical w-5 text-center text-lg ${activeView === 'agendamiento' ? 'text-blue-200' : 'text-slate-500'}`}></i> 
          <span>Agendamiento</span>
        </button>

        <button 
          onClick={() => setActiveView('auditoria')} 
          className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
            activeView === 'auditoria' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <i className={`fa-solid fa-shield-halved w-5 text-center text-lg ${activeView === 'auditoria' ? 'text-blue-200' : 'text-slate-500'}`}></i> 
          <span>Auditoría y Recursos</span>
        </button>
      </nav>

      {/* Perfil de Usuario Falso (Para darle toque profesional) */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold text-xs">
            AD
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white">Admin Central</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> En línea
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;