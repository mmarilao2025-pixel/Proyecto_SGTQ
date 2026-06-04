import React, { useState, useEffect } from 'react';
import { EventStats } from '../../types';

// ✅ Archivo movido a src/pages/components/ (carpeta renombrada de 'coponents')

const EventStatsCard: React.FC = () => {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events/stats');
      if (!response.ok) throw new Error('Error al obtener métricas de eventos');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-700 text-sm">Métricas de Eventos</h3>
        <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Actualiza cada 30s</span>
      </div>
      {loading ? (
        <div className="text-sm text-slate-500">Cargando métricas...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : stats ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Total de eventos</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalEventos}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Eventos activos</p>
              <p className="text-3xl font-bold text-slate-900">{stats.eventosActivos}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500 mb-2">Último evento</p>
            <p className="font-semibold">{stats.ultimoEvento?.tipo || 'Sin eventos recientes'}</p>
            <p className="text-xs text-slate-400">{stats.ultimoEvento?.timestamp || ''}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-2">Tipos de eventos</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(stats.tiposEventos).map(([tipo, count]) => (
                <div key={tipo} className="rounded-2xl bg-white p-3 border border-slate-100">
                  <p className="text-xs text-slate-500">{tipo}</p>
                  <p className="text-lg font-semibold text-slate-900">{count as number}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default EventStatsCard;
