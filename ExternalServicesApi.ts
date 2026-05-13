export interface ResultadoLaboratorio {
  aptoParaCirugia: boolean;
  observaciones: string;
}

export interface EstadoMedico {
  medicoId: number;
  horasSemanalesAcumuladas: number;
  disponible: boolean;
}

export class LaboratorioExternoAPI {
  static async obtenerResultadosPreoperatorios(pacienteId: number): Promise<ResultadoLaboratorio> {
    return new Promise(resolve => {
      setTimeout(() => {
        const apto = pacienteId % 3 !== 0;
        resolve({
          aptoParaCirugia: apto,
          observaciones: apto
            ? 'Resultados de laboratorio compatibles con cirugía.'
            : 'Resultado anómalo: requiere revisión adicional.',
        });
      }, 300);
    });
  }
}

export class RecursosHumanosExternaAPI {
  static async obtenerEstadoMedico(medicoId: number): Promise<EstadoMedico> {
    return new Promise(resolve => {
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

export class InventarioExternoAPI {
  static async verificarNivelInsumos(tipoCirugia: string): Promise<{ disponible: boolean; detalle: string }> {
    return new Promise(resolve => {
      setTimeout(() => {
        const esCritico = tipoCirugia.toLowerCase().includes('cardíaca');
        resolve({
          disponible: !esCritico,
          detalle: esCritico
            ? 'La cirugía requiere insumos críticos especiales y se debe confirmar stock.'
            : 'Stock de insumos validado correctamente.',
        });
      }, 200);
    });
  }
}
