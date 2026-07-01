const { MotorAgendamiento } = require("./motor_agendamiento");
const {
  LaboratorioExternoAPI,
  RecursosHumanosExternaAPI,
  InventarioExternoAPI,
} = require("../shared/api/ExternalServicesApi");

/**
 * SurgeryBookingFacade.js - Patrón Facade para el agendamiento de cirugías
 *
 * Propósito: Simplifica la interfaz compleja de validación multicriterio del SGTQ.
 * El servidor (server.js) solo necesita llamar a un método: validarYAgendarCirugia().
 *
 * Internamente coordina:
 *   1. APIs externas (Laboratorio, RRHH, Inventario)  → ExternalServicesApi.js
 *   2. Motor de validación de reglas SOLID             → motor_agendamiento.js
 *   3. Construcción del contexto de validación         → método privado buildContexto()
 *
 * Referencia SRS: UC-01 Agendar Cirugía Electiva (Validación Multicriterio)
 * Requisitos cubiertos: FR-1, FR-2, FR-3, FR-4, FR-5 / BR-1, BR-2, BR-4
 */
class GestorCirugiasFacade {
  constructor() {
    this.motor = new MotorAgendamiento();
  }

  /**
   * Método principal (punto de entrada único).
   * Orquesta todas las validaciones y retorna resultado unificado.
   *
   * @param {Object} payload - Datos de la solicitud de cirugía desde server.js
   * @returns {Object} { exito, mensaje, detalles }
   */
  async validarYAgendarCirugia(payload) {
    console.log("\n=== SGTQ: Iniciando validación multicriterio ===");
    console.log(
      `Paciente: ${payload.pacienteId} | Médico: ${payload.medicoId} | Tipo: ${payload.tipoCirugia}`,
    );

    try {
      // FASE 1: Consultar APIs externas en paralelo (NFR-1: rendimiento)
      const contexto = await this._construirContexto(payload);

      // FASE 2: Ejecutar motor de reglas SOLID con el contexto construido
      const resultado = this.motor.procesar(contexto);

      // FASE 3: Construir respuesta final
      if (resultado.aprobado) {
        console.log(
          "✅ Todas las validaciones pasaron — Cirugía habilitada para agendamiento",
        );
        return {
          exito: true,
          mensaje: `Cirugía de tipo "${payload.tipoCirugia}" validada y habilitada para agendamiento.`,
          detalles: resultado.detalles,
        };
      } else {
        // Identificar reglas bloqueantes para dar mensaje claro al usuario
        const fallidas = resultado.detalles.filter((r) => !r.pasa);
        const criticasFallidas = fallidas.filter(
          (r) => r.severidad === "CRITICA",
        );

        // Mensaje especial para fatiga médica (CA-01 del SRS)
        const hayFatiga = fallidas.some(
          (r) => r.regla === "Fatiga Médica (Horas de Turno)",
        );
        const mensajePrincipal = hayFatiga
          ? "Riesgo Legal: Fatiga de Vuelo — El médico supera el límite legal de horas continuas (BR-2)."
          : `Agendamiento bloqueado: ${criticasFallidas.length} restricción(es) crítica(s) sin cumplir.`;

        console.log(
          `❌ Validación rechazada — ${fallidas.length} regla(s) fallida(s)`,
        );
        return {
          exito: false,
          mensaje: mensajePrincipal,
          detalles: resultado.detalles,
        };
      }
    } catch (error) {
      console.error("Error en GestorCirugiasFacade:", error.message);
      return {
        exito: false,
        mensaje: `Error interno al validar cirugía: ${error.message}`,
        detalles: [],
      };
    }
  }

  /**
   * Construye el contexto de validación consultando las APIs externas en paralelo.
   * Implementa BR-1: Indivisibilidad de la Reserva Quirúrgica.
   *
   * @param {Object} payload - Datos crudos del request
   * @returns {Object} contexto - Objeto normalizado para el motor de reglas
   */
  async _construirContexto(payload) {
    console.log("→ Consultando APIs externas en paralelo...");

    // Consultas paralelas a sistemas externos (simulados en primera entrega)
    const [resultadoLab, estadoMedico, estadoInventario] = await Promise.all([
      LaboratorioExternoAPI.obtenerResultadosPreoperatorios(payload.pacienteId),
      RecursosHumanosExternaAPI.obtenerEstadoMedico(payload.medicoId),
      InventarioExternoAPI.verificarNivelInsumos(payload.tipoCirugia),
    ]);

    console.log(
      `  Lab: apto=${resultadoLab.aptoParaCirugia} | RRHH: horas=${estadoMedico.horasSemanalesAcumuladas} | Inventario: ok=${estadoInventario.disponible}`,
    );

    // Calcular horas de turno continuo estimadas a partir de horas semanales
    // (en producción vendría del sistema de RRHH en tiempo real)
    const horasTurnoContinuo =
      estadoMedico.horasSemanalesAcumuladas > 44
        ? 13 // supera límite → se marca como fatiga (>12h)
        : Math.min(estadoMedico.horasSemanalesAcumuladas % 12, 12);

    // Construir contexto normalizado para el motor de reglas
    return {
      // Datos del paciente
      pacienteApto: resultadoLab.aptoParaCirugia,
      alergiasPaciente: payload.alergiasPaciente || [],
      medicamentosPaciente: payload.medicamentosPaciente || [],
      ultimaCirugiaFecha: payload.ultimaCirugiaFecha || null,
      tiempoRecuperacionRequerido: payload.tiempoRecuperacionRequerido || 30,

      // Datos del médico (FR-2: Control de Fatiga / BR-2)
      medicoDisponible: estadoMedico.disponible,
      horasTrabajadasMedico: horasTurnoContinuo,
      medicoEspecialidad: payload.medicoEspecialidad || "Cirugía General",

      // Datos de la cirugía
      tipoCirugia: payload.tipoCirugia,
      especialidadRequerida: payload.especialidadRequerida || "Cirugía General",
      duracionEstimadaCirugia: payload.duracionEstimadaCirugia || 4,
      medicamentosRequeridos: payload.medicamentosRequeridos || [],
      requiereTransfusion: payload.requiereTransfusion || false,
      compatibilidadSanguinea: payload.compatibilidadSanguinea || "COMPATIBLE",

      // Recursos hospitalarios (FR-1: Validación de Recursos / BR-1)
      camasUCI: payload.requiereUci
        ? (payload.camasUCI ?? 3) // si requiere UCI, usar valor provisto
        : 99, // no requiere UCI → no bloquear por camas
      insumos: estadoInventario.disponible ? (payload.insumos ?? 15) : 0, // inventario no disponible → fuerza fallo
    };
  }
}

module.exports = { GestorCirugiasFacade };
