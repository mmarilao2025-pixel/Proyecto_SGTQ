// --- TIPOS DE DATOS ---
interface LabResult {
  pacienteId: number;
  aptoParaCirugia: boolean;
  nivelSangre: string;
  riesgoRiesgoCardiologico: 'Bajo' | 'Medio' | 'Alto';
}

interface HRDoctorStatus {
  medicoId: number;
  horasSemanalesAcumuladas: number;
  enTurnoActualmente: boolean;
}

// --- SERVICIOS EXTERNOS SIMULADOS ---

export const LaboratorioExternoAPI = {
  /**
   * Simula la consulta a la red externa de laboratorios (ej. resultados de sangre preoperatorios)
   */
  obtenerResultadosPreoperatorios: async (pacienteId: number): Promise<LabResult> => {
    console.log(`[API Externa] Consultando resultados de laboratorio para paciente ${pacienteId}...`);
    
    return new Promise((resolve) => {
      // Simulamos un retraso de red de 1.5 segundos
      setTimeout(() => {
        resolve({
          pacienteId: pacienteId,
          aptoParaCirugia: true,
          nivelSangre: 'Normal',
          riesgoRiesgoCardiologico: 'Bajo'
        });
      }, 1500);
    });
  }
};

export const RecursosHumanosExternaAPI = {
  /**
   * Simula la consulta al sistema central de RRHH del hospital (suele ser un software distinto)
   */
  obtenerEstadoMedico: async (medicoId: number): Promise<HRDoctorStatus> => {
    console.log(`[API Externa] Verificando contrato y horas del médico ${medicoId}...`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          medicoId: medicoId,
          horasSemanalesAcumuladas: 38, // Menos de 44h, está OK
          enTurnoActualmente: false
        });
      }, 800);
    });
  }
};