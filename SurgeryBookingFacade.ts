import { LaboratorioExternoAPI, RecursosHumanosExternaAPI } from './ExternalServicesApi';

// Simulamos los servicios internos que ya tendrías en tu backend
class InventarioService {
  verificarMateriales(tipoCirugia: string) { return true; /* Lógica compleja */ }
}

class CamasUCIService {
  verificarDisponibilidad() { return true; /* Lógica compleja de BDD */ }
}

class AlgoritmoFatigaService {
  validarDescansoMedico(horasAcumuladas: number) { 
    return horasAcumuladas < 44; 
  }
}

/**
 * LA FACHADA (FACADE)
 * Oculta toda la complejidad de validación detrás de un solo método limpio.
 */
export class GestorCirugiasFacade {
  private inventario: InventarioService;
  private camasUci: CamasUCIService;
  private fatigaValidator: AlgoritmoFatigaService;

  constructor() {
    this.inventario = new InventarioService();
    this.camasUci = new CamasUCIService();
    this.fatigaValidator = new AlgoritmoFatigaService();
  }

  /**
   * Este es el único método que el Controlador o el Frontend necesita llamar.
   */
  public async validarYAgendarCirugia(pacienteId: number, medicoId: number, tipoCirugia: string, requiereUci: boolean) {
    console.log("=== INICIANDO PROTOCOLO DE VALIDACIÓN DE CIRUGÍA (FACADE) ===");

    try {
      // 1. Validaciones Internas Síncronas
      if (!this.inventario.verificarMateriales(tipoCirugia)) {
        throw new Error("No hay materiales suficientes en inventario.");
      }

      if (requiereUci && !this.camasUci.verificarDisponibilidad()) {
        throw new Error("No hay camas UCI disponibles. Alerta Roja.");
      }

      // 2. Validaciones usando APIs Externas Simuladas (Asíncronas)
      const [resultadosLab, estadoMedico] = await Promise.all([
        LaboratorioExternoAPI.obtenerResultadosPreoperatorios(pacienteId),
        RecursosHumanosExternaAPI.obtenerEstadoMedico(medicoId)
      ]);

      if (!resultadosLab.aptoParaCirugia) {
        throw new Error("El paciente no es apto según los exámenes de laboratorio externos.");
      }

      // 3. Cruzar datos externos con lógica interna
      if (!this.fatigaValidator.validarDescansoMedico(estadoMedico.horasSemanalesAcumuladas)) {
        throw new Error("El médico ha superado el límite de horas (Riesgo de Fatiga).");
      }

      console.log("=== VALIDACIÓN EXITOSA: CIRUGÍA AGENDADA ===");
      return { exito: true, mensaje: "Cirugía agendada en el sistema." };

    } catch (error: any) {
      console.error(`=== FALLO EN VALIDACIÓN: ${error.message} ===`);
      return { exito: false, mensaje: error.message };
    }
  }
}