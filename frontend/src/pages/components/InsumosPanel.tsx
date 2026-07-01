import React, { useState, useEffect } from 'react';
import { Insumo } from '../../types';

const InsumosPanel: React.FC = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsumos = () =>
      fetch('/api/insumos')
        .then(r => r.json())
        .then(setInsumos)
        .finally(() => setLoading(false));

    fetchInsumos();
    const interval = setInterval(fetchInsumos, 15000); // refresca cada 15s
    return () => clearInterval(interval);
  }, []);

  const sangre = insumos.filter(i => i.categoria === 'sangre');
  const kits   = insumos.filter(i => i.categoria === 'kit');
  const otros  = insumos.filter(i => !['sangre','kit'].includes(i.categoria));

  const colorCantidad = (insumo: Insumo) => {
    if (insumo.cantidad <= 0) return 'text-red-600 font-bold';
    if (insumo.cantidad <= insumo.umbral_critico) return 'text-amber-500 font-bold';
    return 'text-green-600 font-semibold';
  };

  if (loading) return <div className="p-4 text-sm text-gray-400">Cargando insumos...</div>;

  return (
    <aside className="w-64 bg-white border-l border-gray-100 shadow-sm p-4 space-y-5 overflow-y-auto h-full">
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Insumos</h2>

      {/* Sangre */}
      <section>
        <h3 className="text-xs font-semibold text-red-500 mb-2 flex items-center gap-1">
          Banco de Sangre
        </h3>
        <div className="space-y-1">
          {sangre.map(s => (
            <div key={s.id} className="flex justify-between text-xs py-1 border-b border-gray-50">
              <span className="text-gray-600">Tipo {s.tipo}</span>
              <span className={colorCantidad(s)}>
                {s.cantidad} {s.unidad}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Kits */}
      <section>
        <h3 className="text-xs font-semibold text-blue-500 mb-2">Kits Médicos</h3>
        <div className="space-y-1">
          {kits.map(k => (
            <div key={k.id} className="flex justify-between text-xs py-1 border-b border-gray-50">
              <span className="text-gray-600">{k.nombre}</span>
              <span className={colorCantidad(k)}>
                {k.cantidad} {k.unidad}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Otros */}
      {otros.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 mb-2">Equipamiento</h3>
          <div className="space-y-1">
            {otros.map(o => (
              <div key={o.id} className="flex justify-between text-xs py-1 border-b border-gray-50">
                <span className="text-gray-600">{o.nombre}</span>
                <span className={colorCantidad(o)}>
                  {o.cantidad} {o.unidad}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
};

export default InsumosPanel;