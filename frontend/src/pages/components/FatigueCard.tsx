import React, { useState, useEffect } from "react";
import { TeamMember } from "../../types";

const FatigueCard: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
    const interval = setInterval(fetchTeam, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await fetch("/api/team");
      if (!response.ok) throw new Error("Error al obtener equipo médico");
      const data: TeamMember[] = await response.json();
      setTeam(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const criticalCases = team.filter(m => m.status === 'BLOQUEADO').length;
  const alertCases = team.filter(m => m.status === 'ALERTA').length;
  const avgHours = team.length > 0
    ? Math.round(team.reduce((sum, m) => sum + (m.horasAcumuladas || 0), 0) / team.length)
    : 0;
  const avgFatigue = Math.min(Math.round((avgHours / 44) * 100), 100);

  const getFatigueColor = (fatigue: number) => {
    if (fatigue >= 75) return 'text-red-600';
    if (fatigue >= 50) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getFatigueBgColor = (fatigue: number) => {
    if (fatigue >= 75) return 'bg-red-50 border-red-200';
    if (fatigue >= 50) return 'bg-amber-50 border-amber-200';
    return 'bg-emerald-50 border-emerald-200';
  };
  const getStatusClass = (status: string) => {
    if (status === 'BLOQUEADO') return 'bg-red-100 text-red-700 border border-red-200';
    if (status === 'ALERTA') return 'bg-amber-100 text-amber-700 border border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'BLOQUEADO') return 'BLOQUEADO';
    if (status === 'ALERTA') return 'EN ALERTA';
    return 'HABILITADO';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Estado del Equipo Médico</h3>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Estado del Equipo Médico</h3>
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">Estado del Equipo Médico</h3>
        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
          {team.length} Médicos
        </span>
      </div>

      {/* Tarjetas de Resumen (Métricas) */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-xl border ${getFatigueBgColor(avgFatigue)}`}>
          <p className="text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Fatiga Global</p>
          <p className={`text-2xl font-black ${getFatigueColor(avgFatigue)}`}>
            {avgFatigue}%
          </p>
        </div>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-xs font-bold text-red-800 mb-1 uppercase tracking-wider">Bloqueados</p>
          <p className="text-2xl font-black text-red-600">{criticalCases}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs font-bold text-amber-800 mb-1 uppercase tracking-wider">En Alerta</p>
          <p className="text-2xl font-black text-amber-600">{alertCases}</p>
        </div>
      </div>

      {/* Lista Detallada de Médicos */}
      <div className="space-y-3">
        {team.map(member => (
          <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
            
            {/* Información Personal y Especialidad */}
            <div className="mb-3 sm:mb-0">
              <p className="font-bold text-slate-800 text-sm">{member.name}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center">
                <i className="fa-solid fa-stethoscope mr-1.5 text-slate-400"></i>
                {member.specialty}
              </p>
            </div>

            {/* Horas y Estado */}
            <div className="flex items-center gap-4 sm:justify-end">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Horas Activas</p>
                <p className="text-sm font-black text-slate-700">{member.horasAcumuladas} / 44</p>
              </div>
              
              <div className="w-[110px] text-center">
                <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg w-full inline-block tracking-wide ${getStatusClass(member.status)}`}>
                  {getStatusLabel(member.status)}
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>
      
    </div>
  );
};

export default FatigueCard;