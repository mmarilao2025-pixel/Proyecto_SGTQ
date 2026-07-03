import React, { useState, useEffect } from "react";
import { Paciente } from "./PatientRegistry";

interface Medico {
  id: number;
  name: string;
  specialty: string;
  status: string;
}

interface SurgerySchedulerProps {
  paciente: Paciente;
  onSuccess: () => void;
}

const SurgeryScheduler: React.FC<SurgerySchedulerProps> = ({
  paciente,
  onSuccess,
}) => {
  const [tipoCirugia, setTipoCirugia] = useState("");
  const [medicoId, setMedicoId] = useState("");
  const [quirofanoId, setQuirofanoId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [duracion, setDuracion] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medicos, setMedicos] = useState<Medico[]>([]);

  const normalizarEspecialidad = (texto: string) =>
    texto
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();

  const canonizarEspecialidad = (texto: string) => {
    const clave = normalizarEspecialidad(texto);
    const equivalencias: Record<string, string> = {
      "cirugia general": "cirugia general",
      "cardiovascular": "cardiovascular",
      "cardiologia": "cardiovascular",
      "ortopedia": "ortopedia",
      "neurocirugia": "neurocirugia",
      "ginecologia": "ginecologia",
    };
    return equivalencias[clave] || clave;
  };

  const especialidadPorCirugia: Record<string, string> = {
    "apendicectomia": "cirugia general",
    "colecistectomia": "cirugia general",
    "herniplastia": "cirugia general",
    "cirugia cardiaca": "cardiovascular",
    "angioplastia": "cardiovascular",
    "ortopedia": "ortopedia",
    "neurocirugia": "neurocirugia",
  };

  const especialidadRequerida = tipoCirugia
    ? canonizarEspecialidad(especialidadPorCirugia[normalizarEspecialidad(tipoCirugia)] || "")
    : "";

  const medicosFiltrados = tipoCirugia
    ? medicos.filter((m) =>
        especialidadRequerida
          ? canonizarEspecialidad(m.specialty) === especialidadRequerida
          : true,
      )
    : medicos;

  // ✅ Cargar médicos disponibles desde la BD
  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((data: Medico[]) => {
        setMedicos(data.filter((m) => m.status === "DISPONIBLE" || m.status === "ALERTA"));
      })
      .catch(() => setMedicos([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      rutPaciente: paciente.rut,
      tipoCirugia,
      // ✅ Si no se selecciona médico, se manda vacío y el backend asigna uno automáticamente
      medicoId: medicoId ? Number(medicoId) : null,
      // ✅ Pabellón como número entero
      quirofanoId: Number(quirofanoId),
      fechaHora: `${fecha} ${hora}:00`,
      duracionEstimada: duracion,
    };

    try {
      const response = await fetch("/api/surgery/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.exito) {
        onSuccess();
      } else {
        setError(
          data.mensaje ||
          data.error ||
          "El agendamiento fue bloqueado por las reglas de negocio.",
        );
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 w-full max-w-4xl mx-auto">
      {/* SECCIÓN 1: Ficha Clínica (Solo Lectura) */}
      <div className="mb-8 p-5 rounded-xl bg-slate-50 border border-slate-100">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center">
          <i className="fa-solid fa-notes-medical mr-2 text-blue-600"></i>{" "}
          Resumen Clínico del Paciente
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
              {paciente.tipoSangre ?? "No registrado"}
            </span>
          </div>
          <div className="col-span-2">
            <p className="text-slate-500 text-xs font-semibold uppercase">Alergias Registradas</p>
            {paciente.alergias ? (
              <p className="font-medium text-amber-600 border-l-2 border-amber-500 pl-2 mt-1">
                {paciente.alergias}
              </p>
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
            <select
              required
              value={tipoCirugia}
              onChange={(e) => setTipoCirugia(e.target.value)}
              className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              <option value="Apendicectomía">Apendicectomía</option>
              <option value="Colecistectomía">Colecistectomía</option>
              <option value="Hernioplastia">Hernioplastia</option>
              <option value="Cirugía Cardíaca">Cirugía Cardíaca</option>
              <option value="Angioplastia">Angioplastia</option>
              <option value="Ortopedia">Ortopedia</option>
              <option value="Neurocirugía">Neurocirugía</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Cirujano Principal</span>
            <select
              value={medicoId}
              onChange={(e) => setMedicoId(e.target.value)}
              className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar doctor</option>
              {medicosFiltrados.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.specialty}
                </option>
              ))}
            </select>
          </label>

          {/* ✅ Pabellones con IDs numéricos reales */}
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Quirófano Asignado</span>
            <select
              required
              value={quirofanoId}
              onChange={(e) => setQuirofanoId(e.target.value)}
              className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar sala...</option>
              <option value="1">Pabellón 1 (Alta Complejidad)</option>
              <option value="2">Pabellón 2 (Ambulatorio)</option>
            </select>
          </label>

          <div className="grid grid-cols-3 gap-2">
            <label className="col-span-1 block">
              <span className="text-xs font-semibold text-slate-600">Fecha</span>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="col-span-1 block">
              <span className="text-xs font-semibold text-slate-600">Hora</span>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="col-span-1 block">
              <span className="text-xs font-semibold text-slate-600">Minutos (Est.)</span>
              <input
                type="number"
                min="15"
                step="15"
                required
                value={duracion}
                onChange={(e) => setDuracion(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>
            {error}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-8 py-3 text-white text-sm font-bold shadow-md transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Validando horarios..." : "Confirmar Cirugía"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SurgeryScheduler;