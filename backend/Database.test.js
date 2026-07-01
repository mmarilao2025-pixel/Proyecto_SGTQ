jest.mock("../../shared/config/Database", () => ({
  getPool: jest.fn(),
}));

const db = require("../../shared/config/Database");
const {
  obtenerInsumos,
  descontarInsumoCirugia,
} = require("../insumoService");

describe("insumoService.obtenerInsumos", () => {
  test("retorna las filas obtenidas desde la base de datos", async () => {
    const filasFalsas = [{ id: 1, nombre: "Gasas" }];
    const poolFalso = {
      query: jest.fn().mockResolvedValue({ rows: filasFalsas }),
    };
    db.getPool.mockReturnValue(poolFalso);

    const resultado = await obtenerInsumos();

    expect(poolFalso.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM Insumos"),
    );
    expect(resultado).toEqual(filasFalsas);
  });
});

describe("insumoService.descontarInsumoCirugia", () => {
  test("descuenta stock y registra el movimiento cuando hay stock suficiente", async () => {
    const clienteFalso = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rows: [{ cantidad: 10 }] }) // SELECT ... FOR UPDATE
        .mockResolvedValueOnce({}) // UPDATE
        .mockResolvedValueOnce({}), // INSERT movimiento
    };

    await descontarInsumoCirugia(clienteFalso, 1, 2, 99, "Transfusión");

    expect(clienteFalso.query).toHaveBeenCalledTimes(3);
    expect(clienteFalso.query.mock.calls[1][0]).toContain("UPDATE Insumos");
    expect(clienteFalso.query.mock.calls[2][0]).toContain(
      "INSERT INTO Insumos_Movimientos",
    );
  });

  test("lanza error cuando no hay stock suficiente", async () => {
    const clienteFalso = {
      query: jest.fn().mockResolvedValueOnce({ rows: [{ cantidad: 1 }] }),
    };

    await expect(
      descontarInsumoCirugia(clienteFalso, 5, 10, 99, "Transfusión"),
    ).rejects.toThrow("Stock insuficiente del insumo ID 5");

    // Solo se debió ejecutar la consulta de verificación de stock
    expect(clienteFalso.query).toHaveBeenCalledTimes(1);
  });
});
