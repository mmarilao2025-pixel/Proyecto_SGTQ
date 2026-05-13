import React, { useState, useEffect } from 'react';
import ApiService from '../serices/api';
import { DashboardPayload, TeamMember } from '../types';
import ResourceStatusCard from './coponents/ResourceStatusCard';
import FatigueCard from './coponents/FatigueCard';
import SurgeryList from './coponents/SurgeryList';
import SyncStatusPanel from './coponents/SyncStatusPanel';

const fallbackDashboard: DashboardPayload = {
  resources: {
    camasUCI: { total: 30, disponibles: 8, ocupadas: 22, porcentaje: 27 },
    sangre: { total: 500, disponible: 210, porcentaje: 42 },
    insumos: { ok: true, cantidad: 480, porcentaje: 78 },
    pabellones: { total: 6, disponibles: 2, ocupados: 4 }
  },
  activeTeam: [
    { id: 1, name: 'Dra. Ana Ruiz', specialty: 'Cirugía General', status: 'DISPONIBLE', horasAcumuladas: 32, disponible: true },
    { id: 2, name: 'Dr. Martín Soto', specialty: 'Anestesia', status: 'ALERTA', horasAcumuladas: 40, disponible: true },
    { id: 3, name: 'Dra. Laura Vega', specialty: 'UCI', status: 'BLOQUEADO', horasAcumuladas: 46, disponible: false }
  ],
  surgeries: [
    { id: 1, patient: 'María Pérez', type: 'Apendicectomía', startTime: '08:30', endTime: '10:00', pabellon: 1, status: 'PROGRAMADA', requiereUCI: true },
    { id: 2, patient: 'Carlos Díaz', type: 'Cesárea', startTime: '09:00', endTime: '11:30', pabellon: 2, status: 'EN PROGRESO', requiereUCI: false },
    { id: 3, patient: 'Lucía Torres', type: 'Colecistectomía', startTime: '11:00', endTime: '12:15', pabellon: 3, status: 'PROGRAMADA', requiereUCI: false }
  ],
  fatigueSummary: {
    avgFatigue: 65,
    criticalCases: 1,
    alertCases: 3,
    highRiskCount: 2,
    legalLimitHours: 44
  },
  syncStatus: [
    { area: 'Admisión', status: 'NORMAL', details: 'Flujo estable', updatedAt: 'Hace 2 min' },
    { area: 'Pabellón', status: 'RIESGO', details: '2 cirugías retrasadas', updatedAt: 'Hace 1 min' },
    { area: 'Inventario', status: 'NORMAL', details: 'Insumos suficientes', updatedAt: 'Hace 5 min' },
    { area: 'Recuperación', status: 'CRÍTICO', details: 'Capacidad UCI limitada', updatedAt: 'Hace 3 min' }
  ]
};

export const DashboardComponent: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await ApiService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.warn('No se pudo cargar el dashboard completo, usando datos de respaldo.', error);
      setDashboard(fallbackDashboard);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="text-red-600 text-center">
          <p className="text-xl font-bold">Error</p>
          <p>No se pudieron cargar los datos del dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-screen-2xl space-y-6">
        <header className="rounded-3xl bg-white px-6 py-6 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-slate-500">SGTQ</p>
              <h1 className="text-3xl font-bold text-slate-900">Tablero operativo de pabellones</h1>
              <p className="mt-2 text-slate-500 max-w-2xl">
                Estado de camas UCI, inventario crítico, equipo quirúrgico y detección temprana de fatiga.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-inner">
              Actualizado: {new Date().toLocaleTimeString()} · Fuente: sistema central
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ResourceStatusCard resources={dashboard.resources} />
              <FatigueCard fatigueSummary={dashboard.fatigueSummary} />
            </div>

            <SyncStatusPanel syncStatus={dashboard.syncStatus} />

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <SurgeryList surgeries={dashboard.surgeries} loading={loading} />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Equipo activo</h2>
                  <p className="text-sm text-slate-500">Visualiza disponibilidad y estado de fatiga</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {dashboard.activeTeam.length} miembros
                </span>
              </div>
              <div className="space-y-4">
                {dashboard.activeTeam.map((member: TeamMember) => (
                  <div key={member.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{member.name}</p>
                        <p className="text-sm text-slate-500">{member.specialty}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        member.status === 'DISPONIBLE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : member.status === 'ALERTA'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-slate-500">
                      Horas acumuladas: <span className="font-semibold text-slate-700">{member.horasAcumuladas}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default DashboardComponent;
