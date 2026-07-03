const db = require('../config/Database');

class LaboratorioExternoAPI {
  static async obtenerResultadosPreoperatorios() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          aptoParaCirugia: true,
          observaciones: "Resultados preoperatorios dentro de rangos normales.",
        });
      }, 300);
    });
  }
}

class RecursosHumanosExternaAPI {
  static async obtenerEstadoMedico(medicoId) {
    try {
      const result = await db.query(
        'SELECT horas_semanales_acumuladas, estado FROM Medicos WHERE id = $1',
        [medicoId]
      );
      if (result.rows.length === 0) {
        return { medicoId, horasSemanalesAcumuladas: 0, disponible: true };
      }
      const horas = result.rows[0].horas_semanales_acumuladas;
      return {
        medicoId,
        horasSemanalesAcumuladas: horas,
        disponible: horas < 44 && result.rows[0].estado === 'Disponible',
      };
    } catch {
      return { medicoId, horasSemanalesAcumuladas: 0, disponible: true };
    }
  }
}

class InventarioExternoAPI {
  static async verificarNivelInsumos(tipoCirugia) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const textoNormalizado = tipoCirugia
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase();
        const requiereInsumosCriticos =
          textoNormalizado.includes("cardiaca") ||
          textoNormalizado.includes("cardiovascular") ||
          textoNormalizado.includes("cardiologia");

        resolve({
          disponible: !requiereInsumosCriticos,
          detalle: requiereInsumosCriticos
            ? "insumos críticos insuficientes para cirugía cardiovascular."
            : "Stock de insumos validado correctamente.",
        });
      }, 200);
    });
  }
}

module.exports = {
  LaboratorioExternoAPI,
  RecursosHumanosExternaAPI,
  InventarioExternoAPI,
};
