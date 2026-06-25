import React, { useState } from 'react';
// ✅ FIX: Ruta corregida — carpeta renombrada de 'serices' a 'services'
import ApiService from '../../services/api';

const ScheduleForm: React.FC = () => {
  const [pacienteId, setPacienteId] = useState(1);
  const [medicoId, setMedicoId] = useState(1);
  const [tipoCirugia, setTipoCirugia] = useState('Apendicectomía');
  const [requiereUci, setRequiereUci] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMensaje(null);
    setError(null);

    try {
      const resultado = await ApiService.scheduleSurgery(pacienteId, medicoId, tipoCirugia, requiereUci);
      if (resultado.exito) {
        setMensaje(resultado.mensaje);
      } else {
        setError(resultado.error || 'No se pudo agendar la cirugía');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al agendar');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-700 text-sm">Agendar Cirugía</h3>
        <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Validación en línea</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-slate-500">ID Paciente</span>
            <input
              type="number"
              min="1"
              value={pacienteId}
              onChange={(e) => setPacienteId(Number(e.target.value))}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs text-slate-500">ID Médico</span>
            <input
              type="number"
              min="1"
              value={medicoId}
              onChange={(e) => setMedicoId(Number(e.target.value))}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-slate-500">Tipo de cirugía</span>
          <input
            value={tipoCirugia}
            onChange={(e) => setTipoCirugia(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={requiereUci}
            onChange={(e) => setRequiereUci(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Requiere cama UCI
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Validando...' : 'Agendar'}
          </button>
          <p className="text-xs text-slate-500">Se validarán todos los requisitos de recursos y fatiga.</p>
        </div>

        {mensaje && <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">{mensaje}</div>}
        {error && <div className="rounded-2xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
      </form>
    </div>
  );
};

export default ScheduleForm;
