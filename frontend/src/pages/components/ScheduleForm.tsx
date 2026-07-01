import React, { useState, useEffect } from "react";
import ApiService from "../../services/api";
import { TeamMember } from "../../types";

const ScheduleForm: React.FC = () => {
  const [rut, setRut] = useState("");
  const [nombre, setNombre] = useState("");
  const [alergias, setAlergias] = useState("");
  const [tipoCirugia, setTipoCirugia] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [requiereUci, setRequiereUci] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [medicoAsignado, setMedicoAsignado] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await ApiService.getTeam();
        setTeam(data);
      } catch (err) {
        console.error("Error cargando equipo médico", err);
      }
    };
    fetchTeam();
  }, []);

  // 2. Lógica de AUTO-ASIGNACIÓN (Se dispara cada vez que cambia la especialidad)
  useEffect(() => {
    if (especialidad && team.length > 0) {
      // Le decimos explícitamente a TypeScript que 'doc' es un TeamMember
      const doctoresDisponibles = team.filter(
        (doc: TeamMember) =>
          doc.specialty === especialidad && doc.status !== "BLOQUEADO",
      );

      if (doctoresDisponibles.length > 0) {
        // Le decimos explícitamente que 'a' y 'b' son TeamMember
        doctoresDisponibles.sort((a: TeamMember, b: TeamMember) =>
          a.status === "DISPONIBLE" ? -1 : 1,
        );
        setMedicoAsignado(doctoresDisponibles[0]);
      } else {
        setMedicoAsignado(null);
      }
    } else {
      setMedicoAsignado(null);
    }
  }, [especialidad, team]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMensaje(null);
    setError(null);

    if (!medicoAsignado) {
      setError(
        "Operación denegada: No hay médicos disponibles para la especialidad requerida.",
      );
      setLoading(false);
      return;
    }

    try {
      const resultado = await ApiService.scheduleSurgery({
        rut,
        nombre,
        alergias,
        medicoId: medicoAsignado.id,
        tipoCirugia,
        requiereUci,
      });

      if (resultado.exito) {
        setMensaje(resultado.mensaje);
        setRut("");
        setNombre("");
        setAlergias("");
        setTipoCirugia("");
        setEspecialidad("");
      } else {
        setError(resultado.error || "El Motor SOLID ha bloqueado la cirugía.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error desconocido de conexión",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Formulario de Ingreso Quirúrgico
        </h2>
        <p className="text-sm text-gray-500">
          El sistema asignará automáticamente al profesional idóneo disponible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">
            <i className="fa-regular fa-user mr-2"></i>Paciente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs text-slate-500 font-medium">RUT</span>
              <input
                type="text"
                placeholder="Ej: 12345678-9"
                required
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500 font-medium">
                Nombre Completo
              </span>
              <input
                type="text"
                placeholder="Juan Pérez"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs text-slate-500 font-medium">
                Alergias Conocidas (Opcional)
              </span>
              <input
                type="text"
                placeholder="Ej: Penicilina, Látex..."
                value={alergias}
                onChange={(e) => setAlergias(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 outline-none"
              />
            </label>
          </div>
        </div>

        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">
            <i className="fa-solid fa-bed-pulse mr-2"></i>Procedimiento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs text-slate-500 font-medium">
                Tipo de Cirugía
              </span>
              <input
                type="text"
                placeholder="Ej: Apendicectomía"
                required
                value={tipoCirugia}
                onChange={(e) => setTipoCirugia(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500 font-medium">
                Especialidad Requerida
              </span>
              <select
                required
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 outline-none"
              >
                <option value="">Seleccione especialidad...</option>
                <option value="Cirugía General">Cirugía General</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Ginecología">Ginecología</option>
              </select>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 md:col-span-2 mt-2">
              <input
                type="checkbox"
                checked={requiereUci}
                onChange={(e) => setRequiereUci(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium">
                Reservar Cama UCI post-operatoria (Requiere validación de
                disponibilidad)
              </span>
            </label>
          </div>
        </div>

        {especialidad && (
          <div
            className={`p-4 rounded-xl border ${medicoAsignado ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}
          >
            <h4
              className={`text-xs font-bold uppercase mb-2 ${medicoAsignado ? "text-emerald-700" : "text-red-700"}`}
            >
              <i className="fa-solid fa-robot mr-2"></i>Asignación Automática
            </h4>

            {medicoAsignado ? (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center font-bold text-sm">
                    {medicoAsignado.initials || "DR"}
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900">
                      {medicoAsignado.name}
                    </p>
                    <p className="text-xs text-emerald-700">
                      Fatiga actual: {medicoAsignado.horasAcumuladas}h / 44h
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {medicoAsignado.status}
                </span>
              </div>
            ) : (
              <p className="text-sm text-red-700">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i>{' '}
                No hay profesionales con disponibilidad o margen de fatiga legal
              </p>
            )}
          </div>
        )}

        {mensaje && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
            <i className="fa-solid fa-circle-check mr-2"></i>
            {mensaje}
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            <i className="fa-solid fa-circle-xmark mr-2"></i>
            {error}
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading || !medicoAsignado}
            className="rounded-xl bg-slate-900 px-6 py-3 text-white text-sm font-bold shadow-md transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner animate-spin mr-2"></i>{' '}
                Procesando en Motor SOLID...
              </>
            ) : (
              "Confirmar Agendamiento"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;
