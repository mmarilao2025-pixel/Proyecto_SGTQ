import React from 'react';
import { FatigueSummary } from '../../types';

interface FatigueCardProps {
  fatigueSummary: FatigueSummary;
}

const getFatigueColor = (fatigue: number) => {
  if (fatigue >= 75) return 'text-red-600';
  if (fatigue >= 50) return 'text-yellow-600';
  return 'text-emerald-600';
};

const getFatigueBgColor = (fatigue: number) => {
  if (fatigue >= 75) return 'bg-red-100';
  if (fatigue >= 50) return 'bg-yellow-100';
  return 'bg-emerald-100';
};

const FatigueCard: React.FC<FatigueCardProps> = ({ fatigueSummary }) => {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Fatiga Operativa</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">Riesgo de fatiga</h3>
        </div>
        <div className={`rounded-3xl px-4 py-2 text-sm font-semibold ${getFatigueBgColor(fatigueSummary.avgFatigue)} ${getFatigueColor(fatigueSummary.avgFatigue)}`}>
          {fatigueSummary.avgFatigue}%
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Críticos</p>
          <p className="mt-2 text-3xl font-semibold text-rose-600">{fatigueSummary.criticalCases}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">En alerta</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">{fatigueSummary.alertCases}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Riesgo alto</p>
          <p className="mt-2 text-3xl font-semibold text-slate-700">{fatigueSummary.highRiskCount}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Límite legal</p>
          <p className="mt-2 text-3xl font-semibold text-slate-800">{fatigueSummary.legalLimitHours}h</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-100">
        El motor de fatiga debe integrarse con reglas OCP para proteger turnos de más de 12 horas y permitir validaciones claras.
      </div>
    </div>
  );
};

export default FatigueCard;
