import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';
import { TeamMember } from '../../types';

const FatigueResetCard: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTeam = async () => {
    try {
      const data = await ApiService.getTeam();
      setTeam(data);
    } catch (error) {
      console.error('Error al obtener equipo:', error);
    }
  };

  useEffect(() => {
    fetchTeam();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchTeam, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = async (medicoId: number) => {
    setLoading(true);
    try {
      const result = await ApiService.resetFatigue(medicoId);
      if (result.success) {
        // Recargar la lista para reflejar los cambios
        await fetchTeam();
      } else {
        alert(result.error || 'Error al desbloquear al médico');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtramos solo a los médicos que están bloqueados o en alerta crítica
  const medicosBloqueados = team.filter(m => m.status === 'BLOQUEADO');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-700 text-sm">Control de Descanso (8 hrs)</h3>
        <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Desbloqueo</span>
      </div>

      {medicosBloqueados.length === 0 ? (
        <p className="text-sm text-slate-500 italic">No hay médicos bloqueados por fatiga actualmente.</p>
      ) : (
        <div className="space-y-4">
          {medicosBloqueados.map(medico => (
            <div key={medico.id} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-800">{medico.name}</span>
                <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-600 rounded">
                  {medico.horasAcumuladas}h acumuladas
                </span>
              </div>
              <button
                onClick={() => handleReset(medico.id)}
                disabled={loading}
                className="mt-2 w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Confirmar 8hrs de descanso (Desbloquear)'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FatigueResetCard;