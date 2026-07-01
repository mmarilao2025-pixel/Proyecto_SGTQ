jest.mock("../../shared/config/Database", () => ({
  getPool: jest.fn(),
}));

const db = require("../../shared/config/Database");
const {
  FatigueTransactionService,
} = require("../../shared/api/database/services/FatigueTransactionService");

function crearClienteFalso(respuestas) {
  return {
    query: jest.fn((sql) => {
      const key = Object.keys(respuestas).find((k) => sql.includes(k));
      return Promise.resolve(key ? respuestas[key] : {});
    }),
    release: jest.fn(),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FatigueTransactionService.resetFatigue", () => {
  test("reinicia la fatiga del médico cuando existe", async () => {
    const clienteFalso = crearClienteFalso({
      "SELECT id FROM Medicos": { rows: [{ id: 1 }] },
    });
    db.getPool.mockReturnValue({ connect: jest.fn().mockResolvedValue(clienteFalso) });

    const service = new FatigueTransactionService();
    const resultado = await service.resetFatigue(1);

    expect(resultado).toEqual({
      success: true,
      mensaje: "Fatiga reiniciada exitosamente",
    });
    expect(clienteFalso.query).toHaveBeenCalledWith("COMMIT");
  });

  test("retorna error y hace rollback si el médico no existe", async () => {
    const clienteFalso = crearClienteFalso({
      "SELECT id FROM Medicos": { rows: [] },
    });
    db.getPool.mockReturnValue({ connect: jest.fn().mockResolvedValue(clienteFalso) });

    const service = new FatigueTransactionService();
    const resultado = await service.resetFatigue(999);

    expect(resultado.success).toBe(false);
    expect(resultado.error).toContain("no encontrado");
    expect(clienteFalso.query).toHaveBeenCalledWith("ROLLBACK");
  });
});

describe("FatigueTransactionService.validateAndUpdateFatigue", () => {
  test("aprueba el turno cuando está dentro de los límites", async () => {
    const clienteFalso = crearClienteFalso({
      "SELECT horas_semanales_acumuladas": {
        rows: [{ horas_semanales_acumuladas: 10 }],
      },
    });
    db.getPool.mockReturnValue({ connect: jest.fn().mockResolvedValue(clienteFalso) });

    const service = new FatigueTransactionService();
    const resultado = await service.validateAndUpdateFatigue(1, 5);

    expect(resultado).toEqual({ approved: true, currentHours: 15 });
    expect(clienteFalso.query).toHaveBeenCalledWith("COMMIT");
  });

  test("rechaza el turno si supera el límite semanal de 44 horas", async () => {
    const clienteFalso = crearClienteFalso({
      "SELECT horas_semanales_acumuladas": {
        rows: [{ horas_semanales_acumuladas: 40 }],
      },
    });
    db.getPool.mockReturnValue({ connect: jest.fn().mockResolvedValue(clienteFalso) });

    const service = new FatigueTransactionService();
    const resultado = await service.validateAndUpdateFatigue(1, 10);

    expect(resultado.approved).toBe(false);
    expect(resultado.error).toContain("límite de fatiga");
  });

  test("rechaza el turno si supera el límite de 12 horas continuas", async () => {
    const clienteFalso = crearClienteFalso({
      "SELECT horas_semanales_acumuladas": {
        rows: [{ horas_semanales_acumuladas: 5 }],
      },
    });
    db.getPool.mockReturnValue({ connect: jest.fn().mockResolvedValue(clienteFalso) });

    const service = new FatigueTransactionService();
    const resultado = await service.validateAndUpdateFatigue(1, 13);

    expect(resultado.approved).toBe(false);
    expect(resultado.error).toContain("límite continuo");
  });

  test("retorna error si el médico no existe", async () => {
    const clienteFalso = crearClienteFalso({
      "SELECT horas_semanales_acumuladas": { rows: [] },
    });
    db.getPool.mockReturnValue({ connect: jest.fn().mockResolvedValue(clienteFalso) });

    const service = new FatigueTransactionService();
    const resultado = await service.validateAndUpdateFatigue(999, 5);

    expect(resultado.approved).toBe(false);
    expect(resultado.error).toContain("no encontrado");
  });
});

describe("FatigueTransactionService.getFatigueReport", () => {
  test("retorna el reporte de fatiga formateado", async () => {
    const poolFalso = {
      query: jest.fn().mockResolvedValue({
        rows: [
          {
            id: 1,
            nombre: "Dr. Ruiz",
            especialidad: "General",
            horas_semanales_acumuladas: 22,
            estado: "Disponible",
          },
        ],
      }),
    };
    db.getPool.mockReturnValue(poolFalso);

    const service = new FatigueTransactionService();
    const resultado = await service.getFatigueReport();

    expect(resultado.medicos).toHaveLength(1);
    expect(resultado.medicos[0]).toMatchObject({
      id: 1,
      nombre: "Dr. Ruiz",
      horasAcumuladas: 22,
      porcentajeFatiga: 50,
    });
  });

  test("retorna lista vacía si la consulta falla", async () => {
    const poolFalso = {
      query: jest.fn().mockRejectedValue(new Error("db caída")),
    };
    db.getPool.mockReturnValue(poolFalso);

    const service = new FatigueTransactionService();
    const resultado = await service.getFatigueReport();

    expect(resultado).toEqual({ medicos: [] });
  });
});
