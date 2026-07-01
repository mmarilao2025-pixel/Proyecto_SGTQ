const {
  LaboratorioExternoAPI,
  RecursosHumanosExternaAPI,
  InventarioExternoAPI,
} = require("../../shared/api/ExternalServicesApi");

describe("LaboratorioExternoAPI", () => {
  test("retorna resultados de laboratorio según el id del paciente", async () => {
    const resultado = await LaboratorioExternoAPI.obtenerResultadosPreoperatorios("2");
    expect(resultado).toHaveProperty("aptoParaCirugia");
    expect(resultado).toHaveProperty("observaciones");
  });

  test("usa 1 como valor por defecto si el id no contiene números", async () => {
    const resultado =
      await LaboratorioExternoAPI.obtenerResultadosPreoperatorios("abc");
    expect(resultado).toBeDefined();
  });
});

describe("RecursosHumanosExternaAPI", () => {
  test("calcula horas semanales y disponibilidad del médico", async () => {
    const resultado = await RecursosHumanosExternaAPI.obtenerEstadoMedico(1);
    expect(resultado.medicoId).toBe(1);
    expect(resultado.horasSemanalesAcumuladas).toBeGreaterThanOrEqual(30);
    expect(typeof resultado.disponible).toBe("boolean");
  });
});

describe("InventarioExternoAPI", () => {
  test("marca como no disponible cuando la cirugía es cardíaca", async () => {
    const resultado =
      await InventarioExternoAPI.verificarNivelInsumos("Cirugía Cardíaca");
    expect(resultado.disponible).toBe(false);
    expect(resultado.detalle).toContain("insumos críticos");
  });

  test("marca como disponible para cirugías no críticas", async () => {
    const resultado =
      await InventarioExternoAPI.verificarNivelInsumos("Apendicectomía");
    expect(resultado.disponible).toBe(true);
    expect(resultado.detalle).toContain("Stock");
  });
});
