describe("Database singleton - comportamiento de query() y close()", () => {
  let poolInstanceFalso;

  beforeEach(() => {
    jest.resetModules();

    poolInstanceFalso = {
      query: jest.fn(),
      end: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    };

    jest.doMock("pg", () => ({
      Pool: jest.fn().mockImplementation(() => poolInstanceFalso),
    }));
  });

  afterEach(() => {
    jest.dontMock("pg");
  });

  test("query() delega en el pool y retorna el resultado", async () => {
    poolInstanceFalso.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const Database = require("../../shared/config/Database");

    const resultado = await Database.query("SELECT 1", []);

    expect(poolInstanceFalso.query).toHaveBeenCalledWith("SELECT 1", []);
    expect(resultado).toEqual({ rows: [{ id: 1 }] });
  });

  test("query() propaga el error si la consulta falla", async () => {
    poolInstanceFalso.query.mockRejectedValue(new Error("conexión perdida"));
    const Database = require("../../shared/config/Database");

    await expect(Database.query("SELECT 1", [])).rejects.toThrow(
      "conexión perdida",
    );
  });

  test("close() cierra el pool de conexiones", async () => {
    const Database = require("../../shared/config/Database");

    await Database.close();

    expect(poolInstanceFalso.end).toHaveBeenCalled();
  });

  test("getPool() retorna la instancia del pool configurado", () => {
    const Database = require("../../shared/config/Database");
    expect(Database.getPool()).toBe(poolInstanceFalso);
  });
});
