import React, { useState } from 'react';
import { Paciente } from '../../types';
interface SurgerySchedulerProps {
  paciente: Paciente; // El paciente validado en el Paso 1
  onSuccess: () => void;
}

const SurgeryScheduler: React.FC<SurgerySchedulerProps> = ({ paciente, onSuccess }) => {
  const [tipoCirugia, setTipoCirugia] = useState('');
  const [medicoId, setMedicoId] = useState('');
  const [quirofanoId, setQuirofanoId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [duracion, setDuracion] = useState(60); // Minutos por defecto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      rutPaciente: paciente.rut,
      tipoCirugia,
      medicoId,
      quirofanoId,
      fechaHora: `${fecha} ${hora}:00`,
      duracionEstimada: duracion
    };

    try {
      // Reemplaza esto con tu llamada real a la API
      const response = await fetch('/api/surgery/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.exito) {
        onSuccess();
      } else {
        setError(data.error || 'El agendamiento fue bloqueado por las reglas de negocio.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 w-full max-w-4xl mx-auto">
      
      {/* SECCIÓN 1: Ficha Clínica (Solo Lectura) */}
      <div className="mb-8 p-5 rounded-xl bg-slate-50 border border-slate-100">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center">
          <i className="fa-solid fa-notes-medical mr-2 text-blue-600"></i> Resumen Clínico del Paciente
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase">Paciente</p>
            <p className="font-bold text-slate-900">{paciente.nombre}</p>
            <p className="text-slate-500">{paciente.rut}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase">Tipo de Sangre</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
              {paciente.tipoSangre}
            </span>
          </div>
          <div className="col-span-2">
            <p className="text-slate-500 text-xs font-semibold uppercase">Alergias Registradas</p>
            {paciente.alergias ? (
              <p className="font-medium text-amber-600 border-l-2 border-amber-500 pl-2 mt-1">{paciente.alergias}</p>
            ) : (
              <p className="text-slate-500 mt-1">Sin alergias conocidas</p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Formulario de Agendamiento */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 border-b pb-2">
          Parámetros de la Cirugía
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Tipo de Procedimiento</span>
            <select required value={tipoCirugia} onChange={(e) => setTipoCirugia(e.target.value)}
              className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar...</option>
              <option value="Apendicectomía">Apendicectomía</option>
              <option value="Colecistectomía">Colecistectomía</option>
              <option value="Hernioplastia">Hernioplastia</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Cirujano Principal</span>
            <select required value={medicoId} onChange={(e) => setMedicoId(e.target.value)}
              className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar profesional...</option>
              <option value="1">Dr. Andrés Morales (Cirugía General)</option>
              <option value="2">Dra. Sofía Castro (Digestivo)</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Quirófano Asignado</span>
            <select required value={quirofanoId} onChange={(e) => setQuirofanoId(e.target.value)}
              className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar sala...</option>
              <option value="PAB-01">Pabellón 1 (Alta Complejidad)</option>
              <option value="PAB-02">Pabellón 2 (Ambulatorio)</option>
            </select>
          </label>

          <div className="grid grid-cols-3 gap-2">
            <label className="col-span-1 block">
              <span className="text-xs font-semibold text-slate-600">Fecha</span>
              <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)}
                className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="col-span-1 block">
              <span className="text-xs font-semibold text-slate-600">Hora</span>
              <input type="time" required value={hora} onChange={(e) => setHora(e.target.value)}
                className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="col-span-1 block">
              <span className="text-xs font-semibold text-slate-600">Minutos (Est.)</span>
              <input type="number" min="15" step="15" required value={duracion} onChange={(e) => setDuracion(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>{error}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button type="submit" disabled={loading}
            className="rounded-xl bg-blue-600 px-8 py-3 text-white text-sm font-bold shadow-md transition hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Validando horarios...' : 'Confirmar Cirugía'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SurgeryScheduler;