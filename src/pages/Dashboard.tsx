// src/pages/Dashboard.tsx
import React from 'react';

export const Dashboard = () => {
  return (
    <div style={{ padding: '30px', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <header>
        <h1 style={{ color: '#2c3e50' }}>Panel de Control SGTQ</h1>
        <p>Monitoreo de Fatiga y Salud del Personal</p>
      </header>
      
      <main style={{ marginTop: '20px', padding: '20px', border: '2px dashed #bdc3c7', borderRadius: '10px' }}>
        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
          Iniciando módulos de visualización...
        </p>
      </main>
    </div>
  );
};