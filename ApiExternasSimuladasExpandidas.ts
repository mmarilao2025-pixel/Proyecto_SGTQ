/**
 * APIs Externas Simuladas Expandidas
 * Incluye servicios de inventario, UCI, admisión y más
 */

import { SIMULATED_API_CONFIG, SIMULATED_BEHAVIORS } from './ApiSimulationConfig';
import {
  MOCK_PACIENTES,
  MOCK_MEDICOS,
  MOCK_INVENTARIO,
  MOCK_CAMAS_UCI,
  MOCK_RESULTADOS_LAB,
} from './ApiSimulationMocks';

/**
 * Servicio de Inventario Externo
 * Simula consultas al sistema de almacén
 */
export const InventarioExternoAPI = {
  verificarInsumos: async (tipoCirugia: string): Promise<{
    disponible: boolean;
    stock: number;
    critico: boolean;
    mensaje: string;
  }> => {
    if (SIMULATED_BEHAVIORS.ENABLE_DETAILED_LOGGING) {
      console.log(`[Inventario API] Verificando insumos para ${tipoCirugia}...`);
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const clave = tipoCirugia.toUpperCase().substring(0, 7);
        const insumo = MOCK_INVENTARIO[clave] || MOCK_INVENTARIO['GENERAL'];

        resolve({
          disponible: insumo.disponible,
          stock: insumo.stock,
          critico: insumo.critico,
          mensaje: insumo.critico
            ? `⚠️ Stock crítico: ${insumo.stock}% disponible`
            : `✓ Stock adecuado: ${insumo.stock}% disponible`,
        });
      }, SIMULATED_API_CONFIG.LATENCIES.INVENTARIO);
    });
  },
};

/**
 * Servicio de Pabellón y UCI Externo
 * Simula consultas al sistema de camas y disponibilidad
 */
export const PabellonUCIExternoAPI = {
  verificarDisponibilidadUCI: async (): Promise<{
    disponibles: number;
    total: number;
    cama_asignada: string | null;
    puede_agendar: boolean;
  }> => {
    if (SIMULATED_BEHAVIORS.ENABLE_DETAILED_LOGGING) {
      console.log(`[Pabellón UCI API] Consultando disponibilidad de camas UCI...`);
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const puede = MOCK_CAMAS_UCI.disponibles > 0;
        resolve({
          disponibles: MOCK_CAMAS_UCI.disponibles,
          total: MOCK_CAMAS_UCI.total,
          cama_asignada: puede ? `UCI-${Math.floor(Math.random() * 10) + 1}` : null,
          puede_agendar: puede,
        });
      }, SIMULATED_API_CONFIG.LATENCIES.PABELLON_UCI);
    });
  },
};

/**
 * Servicio de Admisión Externo
 * Simula consultas a datos del paciente
 */
export const AdmisionExternoAPI = {
  obtenerDatosPaciente: async (pacienteId: number): Promise<any> => {
    if (SIMULATED_BEHAVIORS.ENABLE_DETAILED_LOGGING) {
      console.log(`[Admisión API] Obteniendo datos del paciente ${pacienteId}...`);
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const paciente = MOCK_PACIENTES[pacienteId];
        if (!paciente) {
          reject(new Error(`Paciente ${pacienteId} no encontrado en el sistema`));
        } else {
          resolve(paciente);
        }
      }, SIMULATED_API_CONFIG.LATENCIES.ADMISION);
    });
  },
};

/**
 * Servicio de Laboratorio Externo
 * Simula resultados de análisis preoperatorios
 */
export const LaboratorioExternoAPI = {
  obtenerResultadosPreoperatorios: async (pacienteId: number): Promise<any> => {
    if (SIMULATED_BEHAVIORS.ENABLE_DETAILED_LOGGING) {
      console.log(`[Laboratorio API] Consultando resultados para paciente ${pacienteId}...`);
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const resultados = MOCK_RESULTADOS_LAB[pacienteId];
        if (!resultados) {
          reject(
            new Error(
              `No hay resultados de laboratorio para el paciente ${pacienteId}`
            )
          );
        } else {
          resolve({
            ...resultados,
            aptoParaCirugia: resultados.aptoParaCirugia,
            observaciones: resultados.aptoParaCirugia
              ? 'Resultados favorables para cirugía'
              : '⚠️ Revisar con médico antes de agendar',
          });
        }
      }, SIMULATED_API_CONFIG.LATENCIES.LABORATORIO);
    });
  },
};

/**
 * Servicio de Recursos Humanos Externo
 * Simula estado y disponibilidad de médicos
 */
export const RecursosHumanosExternoAPI = {
  obtenerEstadoMedico: async (medicoId: number): Promise<any> => {
    if (SIMULATED_BEHAVIORS.ENABLE_DETAILED_LOGGING) {
      console.log(`[RRHH API] Verificando estado del médico ${medicoId}...`);
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const medico = MOCK_MEDICOS[medicoId];
        if (!medico) {
          reject(new Error(`Médico ${medicoId} no encontrado en el sistema`));
        } else {
          const excedeLimite =
            medico.horasAcumuladas >=
            SIMULATED_API_CONFIG.THRESHOLDS.MAX_HORAS_SEMANALES;

          resolve({
            medicoId: medico.id,
            nombre: medico.nombre,
            especialidad: medico.especialidad,
            horasSemanalesAcumuladas: medico.horasAcumuladas,
            enTurnoActualmente: medico.enTurno,
            puedeOperar: !excedeLimite && !medico.enTurno,
            riesgoDeFatiga: excedeLimite,
            observaciones: excedeLimite
              ? `⚠️ Médico ha acumulado ${medico.horasAcumuladas}h (límite: ${SIMULATED_API_CONFIG.THRESHOLDS.MAX_HORAS_SEMANALES}h)`
              : '✓ Médico disponible y dentro de los límites de horario',
          });
        }
      }, SIMULATED_API_CONFIG.LATENCIES.RECURSOS_HUMANOS);
    });
  },
};

/**
 * Función auxiliar para simular fallo de red (opcional)
 */
export function simularFalloRed(apiName: string): boolean {
  if (!SIMULATED_BEHAVIORS.ENABLE_RANDOM_FAILURES) return false;

  const tasaError = (SIMULATED_API_CONFIG.ERROR_RATES as any)[apiName] || 0;
  return Math.random() < tasaError;
}
