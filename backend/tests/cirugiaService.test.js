jest.mock("../../shared/config/Database", () => ({
  getPool: jest.fn(),
}));

jest.mock("../insumoService", () => ({
  descontarInsumoCirugia: jest.fn().mockResolvedValue(undefined),
}));

const db = require("../../shared/config/Database");
const { descontarInsumoCirugia } = require("../insumoService");
const { agendarCirugiaAtomica } = require("../cirugiaService");

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

describe("cirugiaService.agendarCirugiaAtomica", () => {
  test("agenda exitosamente cuando el pabellón está disponible", async () => {
    const clienteFalso = crearClienteFalso({
      "SELECT estado FROM Pabellones": { rows: [{ estado: "Disponible" }] },
      "INSERT INTO Cirugias": { rows: [{ id: 42 }] },
    });
    db.getPool.mockReturnValue({ connect: jest.fn().mockResolvedValue(clienteFalso) });

    const resultado = await agendarCirugiaAtomica({
      rutPaciente: "12345678-9",
      pabellonId: 1,
      camaId: 2,
      tipoCirugia: "Apendicectomía",
      fechaInicio: "2026-01-01",
      fechaFin: "2026-01-01",
    });
    expect(resultado).toEqual({ exito: true, cirugia_id: 42 });
    expect(clienteFalso.query).toHaveBeenCalledWith("BEGIN");
    expect(clienteFalso.query).toHaveBeenCalledWith("COMMIT");
    expect(clienteFalso.release).toHaveBeenCalled();
  });

  test("descuenta insumos de sangre cuando requiere transfusión", async () => {
    const clienteFalso = crearClienteFalso({
      "SELECT estado FROM Pabellones": { rows: [{ estado: "Disponible" }] },
      "INSERT INTO Cirugias": { rows: [{ id: 7 }] },
      "SELECT id FROM Insumos": { rows: [{ id: 99 }] },
    });
    db.getPool.mockReturnValue({ connect: jest.fn().mockResolvedValue(clienteFalso) });

    const resultado = await agendarCirugiaAtomica({
      rutPaciente: "12345678-9",
      pabellonId: 1,
      camaId: 2,
      tipoCirugia: "Cirugía Cardíaca",
      fechaInicio: "2026-01-01",
      fechaFin: "2026-01-01",
      requiereTransfusion: true,
      tipoSangre: "O+",
      litrosSangre: 3,
    });

    expect(resultado.exito).toBe(true);
    expect(descontarInsumoCirugia).toHaveBeenCalledWith(
      clienteFalso,
      99,
      3,
      7,
      expect.stringContaining("Transfusión"),
    );
  });

  test("hace rollback y retorna error si el pabellón no está disponible", async () => {
    const clienteFalso = crearClienteFalso({
      "SELECT estado FROM Pabellones": { rows: [{ estado: "Ocupado" }] },
    });
    db.getPool.mockReturnValue({ connect: jest.fn().mockResolvedValue(clienteFalso) });

    const resultado = await agendarCirugiaAtomica({
      rutPaciente: "12345678-9",
      pabellonId: 1,
      camaId: 2,
      tipoCirugia: "Apendicectomía",
      fechaInicio: "2026-01-01",
      fechaFin: "2026-01-01",
    });

    expect(resultado.exito).toBe(false);
    expect(resultado.mensaje).toContain("no está disponible");
    expect(clienteFalso.query).toHaveBeenCalledWith("ROLLBACK");
    expect(clienteFalso.release).toHaveBeenCalled();
  });

  test("siempre libera el cliente incluso si ocurre un error inesperado", async () => {
    const clienteFalso = {
      query: jest.fn().mockRejectedValueOnce(new Error("fallo de conexión")),
      release: jest.fn(),
    };
    db.getPool.mockReturnValue({ connect: jest.fn().mockResolvedValue(clienteFalso) });

    const resultado = await agendarCirugiaAtomica({
      rutPaciente: "12345678-9",
      pabellonId: 1,
      camaId: 2,
      tipoCirugia: "Apendicectomía",
      fechaInicio: "2026-01-01",
      fechaFin: "2026-01-01",
    });

    expect(resultado.exito).toBe(false);
    expect(clienteFalso.release).toHaveBeenCalled();
  });
});
