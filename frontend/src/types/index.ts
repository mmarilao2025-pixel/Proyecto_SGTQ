export interface Surgery {
  id: number;
  patient: string;
  type: string;
  startTime: string;
  endTime: string;
  pabellon: number;
  status: 'PROGRAMADA' | 'EN PROGRESO' | 'COMPLETADA' | 'CANCELADA';
  requiereUCI: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  specialty: string;
  status: 'DISPONIBLE' | 'ALERTA' | 'BLOQUEADO';
  horasAcumuladas: number;
  disponible: boolean;
  initials: string;
}

export interface Resources {
  camasUCI: {
    total: number;
    disponibles: number;
    ocupadas: number;
    porcentaje: number;
  };
  sangre: {
    total: number;
    disponible: number;
    porcentaje: number;
  };
  insumos: {
    ok: boolean;
    cantidad: number;
    porcentaje: number;
  };
  pabellones: {
    total: number;
    disponibles: number;
    ocupados: number;
  };
}

export interface ValidacionCirugia {
  exito: boolean;
  mensaje: string;
  id?: string;
  error?: string;
  detalles?: Array<{ regla: string; pasa: boolean; descripcion: string; prioridad: number; severidad: string }>;
}

export interface EventStats {
  totalEventos: number;
  eventosActivos: number;
  tiposEventos: Record<string, number>;
  ultimoEvento: {
    tipo: string;
    datos: any;
    timestamp: string;
    id: string;
  };
}

export interface EntradaFatiga {
  id: string;
  nombreTrabajador: string;
  puntajeFatiga: number;
  estado: 'normal' | 'alerta' | 'critico';
  fechaHora: string;
}
export interface Insumo {
  id: number;
  nombre: string;
  categoria: string;
  tipo: string | null;
  cantidad: number;
  unidad: string;
  umbral_critico: number;
}
export interface Paciente {
  rut: string;
  nombre: string;
  fechaNacimiento?: string;
  telefono?: string;
  email?: string;
  tipoSangre?: string;
  alergias?: string;
  enfermedadesCronicas?: string;
}