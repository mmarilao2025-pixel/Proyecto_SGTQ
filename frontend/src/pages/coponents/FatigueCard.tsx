import React, { useState, useEffect } from 'react';

const FatigueCard: React.FC = () => {
  const [fatigueData, setFatigueData] = useState({
    avgFatigue: 0,
    criticalCases: 0,
    alertCases: 0
  });

  useEffect(() => {
    // Simular carga de datos de fatiga
    const mockData = {
      avgFatigue: 65,
      criticalCases: 2,
      alertCases: 5
    };
    setFatigueData(mockData);
  }, []);

  const getFatigueColor = (fatigue: number) => {
    if (fatigue >= 75) return 'text-red-600';
    if (fatigue >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getFatigueBgColor = (fatigue: number) => {
    if (fatigue >= 75) return 'bg-red-100';
    if (fatigue >= 50) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold mb-4">Monitoreo de Fatiga</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Fatiga Promedio */}
        <div className={`p-4 rounded-lg ${getFatigueBgColor(fatigueData.avgFatigue)}`}>
          <p className="text-sm text-gray-600 mb-2">Fatiga Promedio</p>
          <p className={`text-3xl font-bold ${getFatigueColor(fatigueData.avgFatigue)}`}>
            {fatigueData.avgFatigue}%
          </p>
          <p className="text-xs text-gray-500 mt-2">del equipo quirúrgico</p>
        </div>

        {/* Casos Críticos */}
        <div className="p-4 rounded-lg bg-red-100">
          <p className="text-sm text-gray-600 mb-2">Casos Críticos</p>
          <p className="text-3xl font-bold text-red-600">
            {fatigueData.criticalCases}
          </p>
          <p className="text-xs text-gray-500 mt-2">médicos bloqueados</p>
        </div>

        {/* Alertas */}
        <div className="p-4 rounded-lg bg-yellow-100">
          <p className="text-sm text-gray-600 mb-2">En Alerta</p>
          <p className="text-3xl font-bold text-yellow-600">
            {fatigueData.alertCases}
          </p>
          <p className="text-xs text-gray-500 mt-2">acercándose al límite</p>
        </div>
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
