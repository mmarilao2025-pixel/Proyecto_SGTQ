import React, { useState } from 'react';

// 1. Interfaz actualizada para coincidir con la Base de Datos
export interface Paciente {
  rut: string;
  nombre: string;
  fechaNacimiento: string; // CRÍTICO: Requerido por la BD
  telefono?: string;
  email?: string;
}

// Función para validar RUT con algoritmo Módulo 11 (¡Excelente implementación!)
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

  // 2. Estado del formulario actualizado
  const [formData, setFormData] = useState({
    nombre: '', fechaNacimiento: '', telefono: '', email: ''
  });

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
        setError('El RUT no está registrado. Complete el formulario para crear la ficha clínica.');
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
    const nuevoPaciente = { rut: rutBusqueda, ...formData };

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
            onChange={(e) => setRutBusqueda(e.target.value.replace(/[^0-9kK\-]/g, ''))}
            className="flex-1 rounded-lg border-slate-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
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
            <button onClick={() => onPacienteValidado(pacienteEncontrado)} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition">
              Avanzar a Quirófano <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      )}

      {/* FORMULARIO DE REGISTRO NUEVO AJUSTADO A LA BD */}
      {modoRegistro && (
        <form onSubmit={registrarPaciente} className="animate-fade-in space-y-5 bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
          <h3 className="font-bold text-emerald-800 border-b border-emerald-100 pb-2 mb-4">Ficha de Nuevo Paciente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Nombre Completo *</span>
              <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">RUT *</span>
              <input type="text" required value={rutBusqueda} onChange={(e) => setRutBusqueda(e.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Fecha de Nacimiento *</span>
              <input type="date" required value={formData.fechaNacimiento} onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Teléfono</span>
              <input type="tel" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} placeholder="+569..." className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none" />
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs font-semibold text-slate-600">Email</span>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="correo@ejemplo.com" className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm outline-none" />
            </label>
          </div>
          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition">
              Guardar y Continuar <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PatientRegistry;