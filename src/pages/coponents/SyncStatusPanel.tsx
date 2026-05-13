import React from 'react';
import { SyncStatus } from '../../types';

interface SyncStatusPanelProps {
  syncStatus: SyncStatus[];
}

const getBadgeClasses = (status: SyncStatus['status']) => {
  switch (status) {
    case 'NORMAL':
      return 'bg-emerald-100 text-emerald-700';
    case 'RIESGO':
      return 'bg-amber-100 text-amber-700';
    case 'CRÍTICO':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const SyncStatusPanel: React.FC<SyncStatusPanelProps> = ({ syncStatus }) => {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Sincronización</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">Estado entre equipos</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
          Actualización en tiempo real
        </span>
      </div>

      <div className="space-y-4">
        {syncStatus.map((item) => (
          <div key={item.area} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.area}</p>
              <p className="text-sm text-slate-500">{item.details}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getBadgeClasses(item.status)}`}>
                {item.status}
              </span>
              <span className="text-xs text-slate-500">{item.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyncStatusPanel;
