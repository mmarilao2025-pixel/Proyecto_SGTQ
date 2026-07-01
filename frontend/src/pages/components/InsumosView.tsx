import React, { useState, useEffect } from 'react';
import { Insumo } from '../../types';

// Componente de gráfico de barra horizontal
const BarraProgreso: React.FC<{ insumo: Insumo }> = ({ insumo }) => {
  const porcentaje = Math.min(100, (insumo.cantidad / (insumo.umbral_critico * 4)) * 100);
  const color =
    insumo.cantidad <= 0 ? 'bg-red-500' :
    insumo.cantidad <= insumo.umbral_critico ? 'bg-amber-400' :
    'bg-emerald-500';
  const textColor =
    insumo.cantidad <= 0 ? 'text-red-600' :
    insumo.cantidad <= insumo.umbral_critico ? 'text-amber-600' :
    'text-emerald-600';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      <span className={`text-xs font-bold w-20 text-right ${textColor}`}>
        {insumo.cantidad} {insumo.unidad}
      </span>
    </div>
  );
};

// Gráfico circular SVG simple
const GraficoCircular: React.FC<{ insumo: Insumo }> = ({ insumo }) => {
  const max = insumo.umbral_critico * 4;
  const porcentaje = Math.min(100, Math.round((insumo.cantidad / max) * 100));
  const radio = 28;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia - (porcentaje / 100) * circunferencia;
  const color =
    insumo.cantidad <= 0 ? '#ef4444' :
    insumo.cantidad <= insumo.umbral_critico ? '#f59e0b' :
    '#10b981';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radio} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="36" cy="36" r={radio}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="bold" fill={color}>
          {porcentaje}%
        </text>
      </svg>
      <span className="text-[10px] text-slate-500 text-center leading-tight max-w-[72px]">
        {insumo.nombre}{insumo.tipo && insumo.categoria === 'sangre' ? ` ${insumo.tipo}` : ''}
      </span>
    </div>
  );
};

const InsumosView: React.FC = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = () =>
      fetch('/api/insumos')
        .then(r => r.json())
        .then(setInsumos)
        .finally(() => setLoading(false));
    fetch_();
    const iv = setInterval(fetch_, 15000);
    return () => clearInterval(iv);
  }, []);

  const sangre = insumos.filter(i => i.categoria === 'sangre');
  const kits   = insumos.filter(i => i.categoria === 'kit');
  const equipo = insumos.filter(i => i.categoria === 'equipo');

  const criticos = insumos.filter(i => i.cantidad <= i.umbral_critico);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando insumos...
    </div>
  );

  const Seccion: React.FC<{ titulo: string; icono: string; color: string; items: Insumo[] }> =
    ({ titulo, icono, color, items }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className={`text-sm font-bold ${color} mb-5 flex items-center gap-2`}>
        <i className={`fa-solid ${icono}`}></i> {titulo}
      </h3>

      {/* Gráficos circulares */}
      <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-slate-100">
        {items.map(i => <GraficoCircular key={i.id} insumo={i} />)}
      </div>

      {/* Tabla con barras */}
      <div className="space-y-3">
        {items.map(i => (
          <div key={i.id} className="grid grid-cols-[1fr_2fr] gap-4 items-center">
            <span className="text-xs text-slate-600 font-medium truncate">
              {i.categoria === 'sangre' ? `Tipo ${i.tipo}` : i.nombre}
            </span>
            <BarraProgreso insumo={i} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Insumos</h2>
          <p className="text-sm text-slate-500 mt-1">Stock en tiempo real · Actualización cada 15 segundos</p>
        </div>
        {criticos.length > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold">
            <i className="fa-solid fa-triangle-exclamation"></i>
            {criticos.length} insumo{criticos.length > 1 ? 's' : ''} bajo umbral crítico
          </div>
        )}
      </div>

      {/* Secciones */}
      <Seccion titulo="Banco de Sangre"  icono="fa-droplet"  color="text-red-500"   items={sangre} />
      <Seccion titulo="Kits Médicos"     icono="fa-kit-medical" color="text-blue-500"  items={kits}   />
      <Seccion titulo="Equipamiento"     icono="fa-box-open" color="text-slate-500"  items={equipo} />
    </div>
  );
};

export default InsumosView;