import React from 'react';
import { Surgery } from '../../types';

interface SurgeryListProps {
  surgeries: Surgery[];
  loading: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'EN PROGRESO':
      return 'bg-blue-50 text-blue-700';
    case 'PROGRAMADA':
      return 'bg-gray-50 text-gray-700';
    case 'COMPLETADA':
      return 'bg-emerald-50 text-emerald-700';
    case 'CANCELADA':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
};

const SurgeryList: React.FC<SurgeryListProps> = ({ surgeries, loading }) => {
  if (loading) {
    return <div className="text-slate-500">Cargando cirugías...</div>;
  }

  if (!surgeries.length) {
    return <div className="text-slate-500">No hay cirugías programadas en este momento.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Cirugías Programadas</h2>
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[680px] divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase tracking-[0.12em] text-[11px]">
            <tr>
              <th className="px-5 py-4">Paciente</th>
              <th className="px-5 py-4">Tipo</th>
              <th className="px-5 py-4">Hora</th>
              <th className="px-5 py-4">Pabellón</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">UCI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {surgeries.map((surgery) => (
              <tr key={surgery.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4 text-slate-700">{surgery.patient}</td>
                <td className="px-5 py-4 text-slate-700">{surgery.type}</td>
                <td className="px-5 py-4 text-slate-700">{surgery.startTime} - {surgery.endTime}</td>
                <td className="px-5 py-4 text-slate-700">Pab. {surgery.pabellon}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(surgery.status)}`}>
                    {surgery.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-700">{surgery.requiereUCI ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SurgeryList;
