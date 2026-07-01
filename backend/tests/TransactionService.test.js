jest.mock("../../shared/config/Database", () => ({
  getPool: jest.fn(),
}));

const db = require("../../shared/config/Database");
const {
  TransactionService,
} = require("../../shared/api/database/services/TransactionService");

function crearClienteFalso() {
  return {
    query: jest.fn().mockResolvedValue({}),
    release: jest.fn(),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TransactionService.executeTransaction", () => {
  test("hace commit y retorna success=true cuando el callback resuelve", async () => {
    const clienteFalso = crearClienteFalso();
    db.getPool.mockReturnValue({
      connect: jest.fn().mockResolvedValue(clienteFalso),
    });

    const service = new TransactionService();
    const resultado = await service.executeTransaction(async (client) => {
      await client.query("SELECT 1");
      return { ok: true };
    });

    expect(resultado).toEqual({ success: true, data: { ok: true } });
    expect(clienteFalso.query).toHaveBeenCalledWith("BEGIN");
    expect(clienteFalso.query).toHaveBeenCalledWith("COMMIT");
    expect(clienteFalso.release).toHaveBeenCalled();
  });

  test("hace rollback y retorna success=false cuando el callback lanza un error", async () => {
    const clienteFalso = crearClienteFalso();
    db.getPool.mockReturnValue({
      connect: jest.fn().mockResolvedValue(clienteFalso),
    });

    const service = new TransactionService();
    const resultado = await service.executeTransaction(async () => {
      throw new Error("fallo en la transacción");
    });

    expect(resultado).toEqual({
      success: false,
      error: "fallo en la transacción",
    });
    expect(clienteFalso.query).toHaveBeenCalledWith("ROLLBACK");
    expect(clienteFalso.release).toHaveBeenCalled();
  });
});
