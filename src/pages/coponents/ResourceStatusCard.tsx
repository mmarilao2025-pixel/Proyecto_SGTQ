import React from 'react';
import { Resources } from '../../types';

interface ResourceStatusCardProps {
  resources: Resources;
}

const ResourceStatusCard: React.FC<ResourceStatusCardProps> = ({ resources }) => {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Recursos críticos</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">Disponibilidad de pabellón</h3>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
          Estado operativo
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Camas UCI</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{resources.camasUCI.disponibles}/{resources.camasUCI.total}</p>
          <p className="text-sm text-slate-500">{resources.camasUCI.porcentaje}% disponibles</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Insumos</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{resources.insumos.porcentaje}%</p>
          <p className="text-sm text-slate-500">{resources.insumos.cantidad} unidades</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Sangre</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{resources.sangre.porcentaje}%</p>
          <p className="text-sm text-slate-500">{resources.sangre.disponible}/{resources.sangre.total} bolsas</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pabellones</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{resources.pabellones.disponibles}/{resources.pabellones.total}</p>
          <p className="text-sm text-slate-500">{resources.pabellones.ocupados} ocupados</p>
        </div>
      </div>
    </div>
  );
};

export default ResourceStatusCard;
