import React, { useState, useEffect } from "react";
import { TeamMember } from "../../types";

// ✅ FIX (Raúl): FatigueCard ahora consume /api/team en lugar de datos hardcodeados

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

  // Calcular métricas reales desde los datos de la API
  const criticalCases = team.filter((m) => m.status === "BLOQUEADO").length;
  const alertCases = team.filter((m) => m.status === "ALERTA").length;
  const avgHours =
    team.length > 0
      ? Math.round(
          team.reduce((sum, m) => sum + (m.horasAcumuladas || 0), 0) /
            team.length,
        )
      : 0;
  // Porcentaje de fatiga: (horas promedio / 44) * 100
  const avgFatigue = Math.min(Math.round((avgHours / 44) * 100), 100);

  const getFatigueColor = (fatigue: number) => {
    if (fatigue >= 75) return "text-red-600";
    if (fatigue >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getFatigueBgColor = (fatigue: number) => {
    if (fatigue >= 75) return "bg-red-100";
    if (fatigue >= 50) return "bg-yellow-100";
    return "bg-green-100";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Monitoreo de Fatiga</h3>
        <p className="text-sm text-slate-500">Cargando datos de fatiga...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Monitoreo de Fatiga</h3>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold mb-4">Monitoreo de Fatiga</h3>

      <div className="grid grid-cols-3 gap-4">
        {/* Fatiga Promedio */}
        <div className={`p-4 rounded-lg ${getFatigueBgColor(avgFatigue)}`}>
          <p className="text-sm text-gray-600 mb-2">Fatiga Promedio</p>
          <p className={`text-3xl font-bold ${getFatigueColor(avgFatigue)}`}>
            {avgFatigue}%
          </p>
          <p className="text-xs text-gray-500 mt-2">del equipo quirúrgico</p>
        </div>

        {/* Casos Críticos */}
        <div className="p-4 rounded-lg bg-red-100">
          <p className="text-sm text-gray-600 mb-2">Casos Críticos</p>
          <p className="text-3xl font-bold text-red-600">{criticalCases}</p>
          <p className="text-xs text-gray-500 mt-2">médicos bloqueados</p>
        </div>

        {/* Alertas */}
        <div className="p-4 rounded-lg bg-yellow-100">
          <p className="text-sm text-gray-600 mb-2">En Alerta</p>
          <p className="text-3xl font-bold text-yellow-600">{alertCases}</p>
          <p className="text-xs text-gray-500 mt-2">acercándose al límite</p>
        </div>
      </div>

      {/* Detalle por médico */}
      <div className="mt-4 space-y-2">
        {team.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="font-medium">{member.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-slate-500">
                {member.horasAcumuladas}h / 44h
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  member.status === "BLOQUEADO"
                    ? "bg-red-100 text-red-600"
                    : member.status === "ALERTA"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                }`}
              >
                {member.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>⚠️ Límite Legal:</strong> Máximo 44 horas semanales por médico
        </p>
      </div>
    </div>
  );
};

export default FatigueCard;
