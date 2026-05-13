/**
 * Configuración de latencias y comportamientos simulados
 * Esto permite ajustar tiempos de respuesta realistas sin cambiar la lógica
 */
export const SIMULATED_API_CONFIG = {
  LATENCIES: {
    LABORATORIO: 1500,        // ms - consulta de resultados de lab
    RECURSOS_HUMANOS: 800,    // ms - estado de médicos
    INVENTARIO: 600,          // ms - niveles de insumos
    PABELLON_UCI: 700,        // ms - disponibilidad de camas UCI
    ADMISION: 500,            // ms - datos de paciente
  },
  ERROR_RATES: {
    LABORATORIO: 0.05,        // 5% de probabilidad de fallo
    RECURSOS_HUMANOS: 0.02,   // 2% de probabilidad de fallo
    INVENTARIO: 0.1,          // 10% de probabilidad de fallo
    PABELLON_UCI: 0.08,       // 8% de probabilidad de fallo
  },
  THRESHOLDS: {
    MAX_HORAS_SEMANALES: 44,
    MAX_HORAS_TURNO: 12,
    INVENTARIO_CRITICO: 20,   // Porcentaje
    INVENTARIO_BAJO: 40,      // Porcentaje
  }
};

export const SIMULATED_BEHAVIORS = {
  // Si true, devuelve errores de red ocasionales según ERROR_RATES
  ENABLE_RANDOM_FAILURES: false,
  // Si true, registra logs detallados de cada simulación
  ENABLE_DETAILED_LOGGING: true,
};
