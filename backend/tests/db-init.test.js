jest.mock("../../shared/config/Database", () => ({
  getPool: jest.fn(),
}));

jest.mock("fs", () => ({
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
}));

const fs = require("fs");
const db = require("../../shared/config/Database");
const { initializeDatabase } = require("../../shared/database/db-init");

function crearClienteFalso() {
  return {
    query: jest.fn().mockResolvedValue({}),
    release: jest.fn(),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("db-init.initializeDatabase", () => {
  test("ejecuta las migraciones en orden y los datos de prueba", async () => {
    const clienteFalso = crearClienteFalso();
    db.getPool.mockReturnValue({
      connect: jest.fn().mockResolvedValue(clienteFalso),
    });
    fs.readdirSync.mockReturnValue([
      "002_segunda.sql",
      "001_primera.sql",
      "notas.txt",
    ]);
    fs.readFileSync.mockReturnValue("CREATE TABLE test();");

    await initializeDatabase();

    // Solo se leen los .sql, ordenados alfabéticamente (001 antes que 002)
    expect(fs.readFileSync.mock.calls[0][0]).toContain("001_primera.sql");
    expect(fs.readFileSync.mock.calls[1][0]).toContain("002_segunda.sql");

    // Se ejecutan BEGIN/COMMIT por cada migración, más los inserts de datos de prueba
    expect(clienteFalso.query).toHaveBeenCalledWith("BEGIN");
    expect(clienteFalso.query).toHaveBeenCalledWith("COMMIT");
    expect(clienteFalso.release).toHaveBeenCalled();
  });

  test("hace rollback y lanza error si una migración falla", async () => {
    const clienteFalso = {
      query: jest.fn((sql) => {
        if (sql === "MIGRACION_INVALIDA") {
          return Promise.reject(new Error("sintaxis SQL inválida"));
        }
        return Promise.resolve({});
      }),
      release: jest.fn(),
    };
    db.getPool.mockReturnValue({
      connect: jest.fn().mockResolvedValue(clienteFalso),
    });
    fs.readdirSync.mockReturnValue(["001_rota.sql"]);
    fs.readFileSync.mockReturnValue("MIGRACION_INVALIDA");

    await expect(initializeDatabase()).rejects.toThrow(
      /Error en migración 001_rota.sql/,
    );

    expect(clienteFalso.query).toHaveBeenCalledWith("ROLLBACK");
    expect(clienteFalso.release).toHaveBeenCalled();
  });

  test("no falla si la inserción de datos de prueba genera un error (ej. ya existen)", async () => {
    const clienteFalso = {
      query: jest.fn((sql) => {
        if (typeof sql === "string" && sql.includes("INSERT INTO Pacientes")) {
          return Promise.reject(new Error("duplicate key"));
        }
        return Promise.resolve({});
      }),
      release: jest.fn(),
    };
    db.getPool.mockReturnValue({
      connect: jest.fn().mockResolvedValue(clienteFalso),
    });
    fs.readdirSync.mockReturnValue([]);

    await expect(initializeDatabase()).resolves.toBeUndefined();
  });
});
