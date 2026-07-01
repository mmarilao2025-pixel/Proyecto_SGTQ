const laboratorioResultados = [
  {
    aptoParaCirugia: true,
    observaciones: "Resultados de laboratorio compatibles con cirugía.",
  },
  {
    aptoParaCirugia: false,
    observaciones: "Resultado anómalo: requiere revisión adicional.",
  },
];

class LaboratorioExternoAPI {
  static async obtenerResultadosPreoperatorios(pacienteId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const numeroLimpio =
          parseInt(String(pacienteId).replace(/[^0-9]/g, "")) || 1;
        const indice = numeroLimpio % laboratorioResultados.length;
        resolve(laboratorioResultados[indice]);
      }, 300);
    });
  }
}

class RecursosHumanosExternaAPI {
  static async obtenerEstadoMedico(medicoId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const horas = 30 + (medicoId % 3) * 8;
        resolve({
          medicoId,
          horasSemanalesAcumuladas: horas,
          disponible: horas < 52,
        });
      }, 250);
    });
  }
}

class InventarioExternoAPI {
  static async verificarNivelInsumos(tipoCirugia) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const esCritico = tipoCirugia.toLowerCase().includes("cardíaca");
        resolve({
          disponible: !esCritico,
          detalle: esCritico
            ? "La cirugía requiere insumos críticos especiales y se debe confirmar stock."
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
