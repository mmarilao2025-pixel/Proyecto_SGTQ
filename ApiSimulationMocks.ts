/**
 * Datos mock para simular bases de datos externas
 * Estos datos pueden modificarse o expandirse según necesidades del proyecto
 */

export const MOCK_PACIENTES = {
  1: {
    id: 1,
    nombre: 'Juan Pérez',
    edad: 45,
    tipo: 'Cirugía General',
    requiereUci: false,
  },
  2: {
    id: 2,
    nombre: 'María García',
    edad: 52,
    tipo: 'Cirugía Cardíaca',
    requiereUci: true,
  },
  3: {
    id: 3,
    nombre: 'Carlos López',
    edad: 38,
    tipo: 'Cirugía Ortopédica',
    requiereUci: false,
  },
  4: {
    id: 4,
    nombre: 'Ana Martínez',
    edad: 61,
    tipo: 'Neurocirugía',
    requiereUci: true,
  },
  5: {
    id: 5,
    nombre: 'Roberto Sánchez',
    edad: 55,
    tipo: 'Cirugía Gastrointestinal',
    requiereUci: false,
  },
};

export const MOCK_MEDICOS = {
  1: {
    id: 1,
    nombre: 'Dr. Andrés Fuentes',
    especialidad: 'Cirugía General',
    horasAcumuladas: 30,
    enTurno: false,
  },
  2: {
    id: 2,
    nombre: 'Dra. Patricia Ruiz',
    especialidad: 'Cirugía Cardíaca',
    horasAcumuladas: 42,
    enTurno: true,
  },
  3: {
    id: 3,
    nombre: 'Dr. Miguel Torres',
    especialidad: 'Neurocirugía',
    horasAcumuladas: 38,
    enTurno: false,
  },
  4: {
    id: 4,
    nombre: 'Dra. Sofía Vargas',
    especialidad: 'Cirugía Ortopédica',
    horasAcumuladas: 25,
    enTurno: false,
  },
};

export const MOCK_INVENTARIO = {
  'GENERAL': {
    disponible: true,
    stock: 85,
    unidad: '%',
    critico: false,
  },
  'CARDIACA': {
    disponible: false,
    stock: 15,
    unidad: '%',
    critico: true,
  },
  'ORTOPEDICA': {
    disponible: true,
    stock: 70,
    unidad: '%',
    critico: false,
  },
  'NEURO': {
    disponible: true,
    stock: 45,
    unidad: '%',
    critico: false,
  },
};

export const MOCK_CAMAS_UCI = {
  disponibles: 3,
  total: 10,
  ocupadas: 7,
  enMantenimiento: 0,
};

export const MOCK_RESULTADOS_LAB = {
  1: {
    pacienteId: 1,
    aptoParaCirugia: true,
    nivelSangre: 'Normal',
    riesgoCardiologico: 'Bajo',
  },
  2: {
    pacienteId: 2,
    aptoParaCirugia: false,
    nivelSangre: 'Bajo',
    riesgoCardiologico: 'Medio',
  },
  3: {
    pacienteId: 3,
    aptoParaCirugia: true,
    nivelSangre: 'Normal',
    riesgoCardiologico: 'Bajo',
  },
  4: {
    pacienteId: 4,
    aptoParaCirugia: true,
    nivelSangre: 'Normal',
    riesgoCardiologico: 'Alto',
  },
  5: {
    pacienteId: 5,
    aptoParaCirugia: true,
    nivelSangre: 'Alto',
    riesgoCardiologico: 'Bajo',
  },
};
