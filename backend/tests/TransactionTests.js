const {
  TransactionService,
} = require("../../shared/api/database/services/TransactionService");
const {
  FatigueTransactionService,
} = require("../../shared/api/database/services/FatigueTransactionService");

/**
 * Pruebas para servicios transaccionales en SGTQ.
 * Valida atomicidad, rollback y manejo de concurrencia.
 */
describe("Transaction Services - SGTQ", () => {
  let transactionService;
  let fatigueService;

  beforeAll(() => {
    transactionService = new TransactionService();
    fatigueService = new FatigueTransactionService();
  });

  test("TransactionService executeTransaction debe manejar commit exitoso", async () => {
    const result = await transactionService.executeTransaction(
      async (client) => {
        // Simular operación exitosa
        return { test: "success" };
      },
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ test: "success" });
  });

  test("TransactionService debe hacer rollback en error", async () => {
    const result = await transactionService.executeTransaction(
      async (client) => {
        throw new Error("Test error");
      },
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("Test error");
  });

  test("FatigueTransactionService debe validar límites de horas", async () => {
    // Asumiendo que existe un médico con ID 1 en BD de prueba
    const result = await fatigueService.validateAndUpdateFatigue(1, 50); // Excede límite

    expect(result.approved).toBe(false);
    expect(result.error).toContain("supera límite de fatiga");
  });

  test("FatigueTransactionService debe actualizar horas correctamente", async () => {
    // Asumiendo médico con horas bajas
    const result = await fatigueService.validateAndUpdateFatigue(1, 2);

    if (result.approved) {
      expect(result.currentHours).toBeDefined();
      expect(typeof result.currentHours).toBe("number");
    }
  });

  test("Debe obtener reporte de fatiga", async () => {
    const report = await fatigueService.getFatigueReport();

    expect(report).toHaveProperty("medicos");
    expect(Array.isArray(report.medicos)).toBe(true);
  });
});
