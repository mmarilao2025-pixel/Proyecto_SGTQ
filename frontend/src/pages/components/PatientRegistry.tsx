import React, { useState } from 'react';

// 1. Interfaz actualizada con datos personales y clínicos completos
export interface Paciente {
  rut: string;
  nombre: string;
  fechaNacimiento: string; 
  sexo: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  previsionSalud: string;
  planIsapre?: string;
  
  // Datos Clínicos
  alergias: string[];
  tipoSangre: string;
  cirugiasPrevias: string;
  enfermedadesCronicas: string[];
  medicamentosActuales?: string;
  peso?: string;
  altura?: string;
  observacionesMedicas?: string;
  estadoPaciente: string;
}

// Validación de RUT (Módulo 11)
const validarRUT = (rutCompleto: string): boolean => {
  const rutLimpio = rutCompleto.replace(/[^0-9kK]/g, '').toUpperCase();
  if (rutLimpio.length < 8) return false;

  const dvIngresado = rutLimpio.slice(-1);
  let rutNumeros = parseInt(rutLimpio.slice(0, -1), 10);
  
  let m = 0, s = 1;
  for (; rutNumeros; rutNumeros = Math.floor(rutNumeros / 10)) {
    s = (s + rutNumeros % 10 * (9 - m++ % 6)) % 11;
  }
  
  const dvEsperado = s ? String(s - 1) : 'K';
  return dvIngresado === dvEsperado;
};

interface PatientRegistryProps {
  onPacienteValidado: (paciente: Paciente) => void;
}

const PatientRegistry: React.FC<PatientRegistryProps> = ({ onPacienteValidado }) => {
  const [rutBusqueda, setRutBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Paciente | null>(null);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Opciones predefinidas para tags/chips multi-selección
  const opcionesAlergias = ["Penicilina", "Lactosa", "Aspirina", "Yodo", "Látex"];
  const opcionesEnfermedades = ["Diabetes", "Hipertensión", "Cardiopatías", "Asma", "Hipotiroidismo"];

  // Estado del formulario expandido
  const [formData, setFormData] = useState({
    nombre: '',
    fechaNacimiento: '',
    sexo: 'Masculino',
    telefono: '',
    email: '',
    direccion: '',
    contactoEmergenciaNombre: '',
    contactoEmergenciaTelefono: '',
    previsionSalud: 'Fonasa',
    planIsapre: '',
    alergias: [] as string[],
    tipoSangre: 'Desconocido / No informado',
    cirugiasPrevias: '',
    enfermedadesCronicas: [] as string[],
    medicamentosActuales: '',
    peso: '',
    altura: '',
    observacionesMedicas: '',
    estadoPaciente: 'Activo'
  });

  // Manejo de multi-selección para Alergias y Enfermedades Crónicas
  const handleCheckboxGroup = (campo: 'alergias' | 'enfermedadesCronicas', valor: string) => {
    setFormData(prev => {
      const listaActual = prev[campo];
      const nuevaLista = listaActual.includes(valor)
        ? listaActual.filter(item => item !== valor)
        : [...listaActual, valor];
      return { ...prev, [campo]: nuevaLista };
    });
  };

  const buscarPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rutBusqueda) return;

    if (!validarRUT(rutBusqueda)) {
      setError('El RUT ingresado no es válido. Verifique el formato y el dígito verificador.');
      setPacienteEncontrado(null);
      setModoRegistro(false);
      return; 
    }

    setLoading(true);
    setError(null);
    setModoRegistro(false);
    setPacienteEncontrado(null);

    try {
      const response = await fetch(`/api/patients/${rutBusqueda}`);
      if (response.ok) {
        const data = await response.json();
        setPacienteEncontrado(data);
      } else if (response.status === 404) {
        setModoRegistro(true);
        setError('El RUT no está registrado. Complete los datos personales y clínicos para crear la ficha clínica.');
      } else {
        setError('Error al consultar la base de datos.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const registrarPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarRUT(rutBusqueda)) {
      setError('No se puede registrar: El RUT ingresado es inválido.');
      return;
    }
    setLoading(true);
    const nuevoPaciente: Paciente = { rut: rutBusqueda, ...formData };

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPaciente)
      });

      if (response.ok) {
        const data = await response.json();
        onPacienteValidado(data.paciente || nuevoPaciente);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al registrar el paciente en el sistema.');
      }
    } catch (err) {
      setError('Error de conexión al registrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 w-full mx-auto">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <i className="fa-solid fa-folder-open text-blue-600 mr-3"></i> 1. Validación de Ficha Clínica
        </h2>
        <p className="text-sm text-slate-500 mt-1">Busque al paciente o registre uno nuevo antes de asignar el quirófano.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <form onSubmit={buscarPaciente} className="flex flex-1 gap-2">
          <input 
            type="text" 
            placeholder="Ingrese RUT (Ej: 12345678-9)" 
            value={rutBusqueda} 
            onChange={(e) => setRutBusqueda(e.target.value.replace(/[^0-9kK-]/g, ''))}
            className="flex-1 rounded-lg border-slate-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm border" 
          />
          <button type="submit" disabled={loading} className="bg-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-700 transition shadow-sm">
            <i className="fa-solid fa-magnifying-glass mr-2"></i> Buscar Ficha
          </button>
        </form>
        
        <div className="hidden md:block border-l border-slate-300 mx-2"></div>
        
        <button 
          type="button" 
          onClick={() => { setPacienteEncontrado(null); setError(null); setModoRegistro(true); }} 
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
        >
          <i className="fa-solid fa-user-plus mr-2"></i> Registrar Nuevo Paciente
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-200">{error}</div>}

      {/* RESULTADO BÚSQUEDA */}
      {pacienteEncontrado && !modoRegistro && (
        <div className="animate-fade-in border border-blue-100 rounded-xl p-6 bg-blue-50/30">
          <h3 className="text-sm font-bold text-blue-800 uppercase mb-4">Paciente Encontrado</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</span>
              <p className="text-lg font-bold text-slate-800">{pacienteEncontrado.nombre}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">RUT</span>
              <p className="font-medium text-slate-700">{pacienteEncontrado.rut}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={() => onPacienteValidado(pacienteEncontrado!)} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition">
              Avanzar a Quirófano <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      )}

      {/* FORMULARIO DE REGISTRO INTEGRAL (PERSONALES + CLÍNICOS) */}
      {modoRegistro && (
        <form onSubmit={registrarPaciente} className="animate-fade-in space-y-6 bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
          
          {/* SECCIÓN: DATOS PERSONALES */}
          <div>
            <h3 className="font-bold text-emerald-800 border-b border-emerald-100 pb-2 mb-4 text-base">
              <i className="fa-solid fa-user mr-2"></i> Datos Personales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Nombre Completo *</span>
                <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">RUT *</span>
                <input type="text" required value={rutBusqueda} onChange={(e) => setRutBusqueda(e.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Fecha de Nacimiento *</span>
                <input type="date" required value={formData.fechaNacimiento} onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Sexo *</span>
                <select value={formData.sexo} onChange={(e) => setFormData({...formData, sexo: e.target.value})} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border">
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Teléfono de Contacto</span>
                <input type="tel" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} placeholder="+569..." className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Correo Electrónico</span>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="correo@ejemplo.com" className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border" />
              </label>

              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-slate-600">Dirección</span>
                <input type="text" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} placeholder="Calle, Número, Comuna" className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Contacto de Emergencia (Nombre)</span>
                <input type="text" value={formData.contactoEmergenciaNombre} onChange={(e) => setFormData({...formData, contactoEmergenciaNombre: e.target.value})} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Contacto de Emergencia (Teléfono)</span>
                <input type="tel" value={formData.contactoEmergenciaTelefono} onChange={(e) => setFormData({...formData, contactoEmergenciaTelefono: e.target.value})} placeholder="+569..." className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Previsión de Salud *</span>
                <select value={formData.previsionSalud} onChange={(e) => setFormData({...formData, previsionSalud: e.target.value, planIsapre: e.target.value !== 'Isapre' ? '' : formData.planIsapre})} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border">
                  <option value="Fonasa">Fonasa</option>
                  <option value="Isapre">Isapre</option>
                </select>
              </label>

              {formData.previsionSalud === 'Isapre' && (
                <label className="block animate-fade-in">
                  <span className="text-xs font-semibold text-slate-600">Nombre del Plan Isapre *</span>
                  <input type="text" required value={formData.planIsapre} onChange={(e) => setFormData({...formData, planIsapre: e.target.value})} placeholder="Ej: Consalud Diamond" className="mt-1 block w-full rounded-lg border-emerald-300 bg-emerald-50/50 p-2.5 text-sm outline-none border" />
                </label>
              )}
            </div>
          </div>

          {/* SECCIÓN: DATOS CLÍNICOS RELEVANTES */}
          <div className="pt-4">
            <h3 className="font-bold text-emerald-800 border-b border-emerald-100 pb-2 mb-4 text-base">
              <i className="fa-solid fa-heart-pulse mr-2"></i> Datos Clínicos Relevantes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="block md:col-span-2">
                <span className="text-xs font-semibold text-slate-600">Alergias</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {opcionesAlergias.map((alergia) => {
                    const seleccionado = formData.alergias.includes(alergia);
                    return (
                      <button
                        type="button"
                        key={alergia}
                        onClick={() => handleCheckboxGroup('alergias', alergia)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${seleccionado ? 'bg-amber-600 border-amber-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {alergia}
                      </button>
                    );
                  })}
                </div>
                <input 
                  type="text" 
                  placeholder="Otras alergias (Separadas por comas)" 
                  onChange={(e) => {
                    const manuales = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    const estables = formData.alergias.filter(a => opcionesAlergias.includes(a));
                    setFormData({...formData, alergias: [...estables, ...manuales]});
                  }}
                  className="mt-2 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border"
                />
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Tipo de Sangre *</span>
                <select value={formData.tipoSangre} onChange={(e) => setFormData({...formData, tipoSangre: e.target.value})} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border">
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="Desconocido / No informado">Desconocido / No informado</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Estado del Paciente *</span>
                <select value={formData.estadoPaciente} onChange={(e) => setFormData({...formData, estadoPaciente: e.target.value})} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border">
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600">Peso (kg)</span>
                  <input type="number" step="0.1" value={formData.peso} onChange={(e) => setFormData({...formData, peso: e.target.value})} placeholder="Ej: 75.5" className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border" />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600">Altura (cm)</span>
                  <input type="number" value={formData.altura} onChange={(e) => setFormData({...formData, altura: e.target.value})} placeholder="Ej: 172" className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border" />
                </label>
              </div>

              <div className="block md:col-span-2">
                <span className="text-xs font-semibold text-slate-600">Enfermedades Crónicas o Preexistentes</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {opcionesEnfermedades.map((enfermedad) => {
                    const seleccionado = formData.enfermedadesCronicas.includes(enfermedad);
                    return (
                      <button
                        type="button"
                        key={enfermedad}
                        onClick={() => handleCheckboxGroup('enfermedadesCronicas', enfermedad)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${seleccionado ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {enfermedad}
                      </button>
                    );
                  })}
                </div>
                <input 
                  type="text" 
                  placeholder="Otras enfermedades crónicas..." 
                  onChange={(e) => {
                    const manuales = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    const estables = formData.enfermedadesCronicas.filter(enfermedad => opcionesEnfermedades.includes(enfermedad));
                    setFormData({...formData, enfermedadesCronicas: [...estables, ...manuales]});
                  }}
                  className="mt-2 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border"
                />
              </div>

              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-slate-600">Medicamentos que consume actualmente</span>
                <textarea rows={2} value={formData.medicamentosActuales} onChange={(e) => setFormData({...formData, medicamentosActuales: e.target.value})} placeholder="Nombre de medicamentos y dosis..." className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border resize-none" />
              </label>

              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-slate-600">Cirugías previas</span>
                <textarea rows={2} value={formData.cirugiasPrevias} onChange={(e) => setFormData({...formData, cirugiasPrevias: e.target.value})} placeholder="Tipo de cirugía, fecha, médico tratante, observaciones..." className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border resize-none" />
              </label>

              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-slate-600">Observaciones Médicas Generales</span>
                <textarea rows={2} value={formData.observacionesMedicas} onChange={(e) => setFormData({...formData, observacionesMedicas: e.target.value})} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none border resize-none" />
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-slate-100">
            <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition">
              {loading ? 'Guardando...' : 'Guardar y Continuar'} <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PatientRegistry;