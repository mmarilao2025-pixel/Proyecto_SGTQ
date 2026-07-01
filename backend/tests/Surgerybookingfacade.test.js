jest.mock("../../shared/api/ExternalServicesApi", () => ({
  LaboratorioExternoAPI: {
    obtenerResultadosPreoperatorios: jest.fn(),
  },
  RecursosHumanosExternaAPI: {
    obtenerEstadoMedico: jest.fn(),
  },
  InventarioExternoAPI: {
    verificarNivelInsumos: jest.fn(),
  },
}));

const {
  LaboratorioExternoAPI,
  RecursosHumanosExternaAPI,
  InventarioExternoAPI,
} = require("../../shared/api/ExternalServicesApi");
const { GestorCirugiasFacade } = require("../SurgeryBookingFacade");

function mockApisExternas({
  apto = true,
  horasSemanales = 10,
  disponible = true,
  insumosDisponibles = true,
} = {}) {
  LaboratorioExternoAPI.obtenerResultadosPreoperatorios.mockResolvedValue({
    aptoParaCirugia: apto,
  });
  RecursosHumanosExternaAPI.obtenerEstadoMedico.mockResolvedValue({
    horasSemanalesAcumuladas: horasSemanales,
    disponible,
  });
  InventarioExternoAPI.verificarNivelInsumos.mockResolvedValue({
    disponible: insumosDisponibles,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GestorCirugiasFacade.validarYAgendarCirugia", () => {
  test("aprueba la cirugía cuando todas las validaciones pasan", async () => {
    mockApisExternas({ apto: true, horasSemanales: 10, insumosDisponibles: true });

    const facade = new GestorCirugiasFacade();
    const resultado = await facade.validarYAgendarCirugia({
      pacienteId: "1",
      medicoId: 1,
      tipoCirugia: "Apendicectomía",
      requiereUci: false,
    });

    expect(resultado.exito).toBe(true);
    expect(resultado.mensaje).toContain("validada y habilitada");
    expect(Array.isArray(resultado.detalles)).toBe(true);
  });

  test("rechaza la cirugía y da mensaje de fatiga cuando el médico excede horas continuas", async () => {
    // > 44 horas semanales fuerza horasTurnoContinuo = 13 (> 12, dispara ReglaFatigaMedica)
    mockApisExternas({ apto: true, horasSemanales: 50, insumosDisponibles: true });

    const facade = new GestorCirugiasFacade();
    const resultado = await facade.validarYAgendarCirugia({
      pacienteId: "1",
      medicoId: 1,
      tipoCirugia: "Apendicectomía",
      requiereUci: false,
    });

    expect(resultado.exito).toBe(false);
    expect(resultado.mensaje).toContain("Fatiga de Vuelo");
  });

  test("rechaza la cirugía cuando el paciente no está apto (falla crítica no relacionada a fatiga)", async () => {
    mockApisExternas({ apto: false, horasSemanales: 10, insumosDisponibles: true });

    const facade = new GestorCirugiasFacade();
    const resultado = await facade.validarYAgendarCirugia({
      pacienteId: "1",
      medicoId: 1,
      tipoCirugia: "Apendicectomía",
      requiereUci: false,
    });

    expect(resultado.exito).toBe(false);
    expect(resultado.mensaje).toContain("restricción");
  });

  test("fuerza insumos en 0 cuando el inventario externo no está disponible", async () => {
    mockApisExternas({ apto: true, horasSemanales: 10, insumosDisponibles: false });

    const facade = new GestorCirugiasFacade();
    const resultado = await facade.validarYAgendarCirugia({
      pacienteId: "1",
      medicoId: 1,
      tipoCirugia: "Apendicectomía",
      requiereUci: false,
    });

    expect(resultado.exito).toBe(false);
    const reglaInsumos = resultado.detalles.find(
      (d) => d.regla === "Insumos Críticos Disponibles",
    );
    expect(reglaInsumos.pasa).toBe(false);
  });

  test("usa camasUCI provistas cuando requiereUci es true", async () => {
    mockApisExternas({ apto: true, horasSemanales: 10, insumosDisponibles: true });

    const facade = new GestorCirugiasFacade();
    const resultado = await facade.validarYAgendarCirugia({
      pacienteId: "1",
      medicoId: 1,
      tipoCirugia: "Apendicectomía",
      requiereUci: true,
      camasUCI: 1, // por debajo del umbral (>2) -> debe fallar esa regla
    });

    const reglaCamas = resultado.detalles.find(
      (d) => d.regla === "Disponibilidad de Camas UCI",
    );
    expect(reglaCamas.pasa).toBe(false);
  });

  test("retorna exito=false y mensaje de error si una API externa falla", async () => {
    LaboratorioExternoAPI.obtenerResultadosPreoperatorios.mockRejectedValue(
      new Error("Laboratorio caído"),
    );
    RecursosHumanosExternaAPI.obtenerEstadoMedico.mockResolvedValue({
      horasSemanalesAcumuladas: 10,
      disponible: true,
    });
    InventarioExternoAPI.verificarNivelInsumos.mockResolvedValue({
      disponible: true,
    });

    const facade = new GestorCirugiasFacade();
    const resultado = await facade.validarYAgendarCirugia({
      pacienteId: "1",
      medicoId: 1,
      tipoCirugia: "Apendicectomía",
    });

    expect(resultado.exito).toBe(false);
    expect(resultado.mensaje).toContain("Error interno al validar cirugía");
    expect(resultado.detalles).toEqual([]);
  });
});