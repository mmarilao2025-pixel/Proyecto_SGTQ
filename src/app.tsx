import React from 'react';

const App: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* El contenido será renderizado por index.html */}
      <main id="root" className="flex-1 flex flex-col">
        <h1 className="text-2xl font-bold p-6">SGTQ - Sistema de Gestión de Turnos Quirúrgicos</h1>
        {/* Componentes se cargarán aquí */}
      </main>
    </div>
  );
};

export default App;
