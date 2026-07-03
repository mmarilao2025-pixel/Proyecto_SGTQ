import React, { useState, useEffect } from "react";
// ✅ FIX (María): Ruta corregida — types está en src/types, no en pages/types
import { Surgery } from "../../types";

const SurgeryList: React.FC = () => {
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurgeries();
    const interval = setInterval(fetchSurgeries, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSurgeries = async () => {
    try {
      const response = await fetch("/api/surgeries");
      if (response.ok) {
        const data = await response.json();
        setSurgeries(data);
      }
    } catch (error) {
      console.error("Error fetching surgeries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN PROGRESO":
        return "bg-blue-50 text-blue-700";
      case "PROGRAMADA":
        return "bg-gray-50 text-gray-700";
      case "COMPLETADA":
        return "bg-green-50 text-green-700";
      case "CANCELADA":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-slate-500 p-6">Cargando cirugías...</div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Cirugías Programadas</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Paciente</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Hora</th>
              <th className="px-4 py-2 text-left">Pabellón</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">UCI</th>
              <th className="px-4 py-2 text-left">Médico</th>
              <th className="px-4 py-2 text-left">Cama UCI</th>
            </tr>
          </thead>
          <tbody>
            {surgeries.map((surgery) => (
              <tr key={surgery.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{surgery.patient}</td>
                <td className="px-4 py-2">{surgery.type}</td>
                <td className="px-4 py-2">{surgery.startTime} - {surgery.endTime}</td>
                <td className="px-4 py-2">Pab. {surgery.pabellon}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(surgery.status)}`}
                  >
                    {surgery.status}
                  </span>
                </td>
                <td className="px-4 py-2">{surgery.requiereUCI ? "✓" : "-"}</td>
                <td className="px-4 py-2">{surgery.medico ?? 'No asignado'}</td>
                <td className="px-4 py-2">{surgery.cama ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SurgeryList;
