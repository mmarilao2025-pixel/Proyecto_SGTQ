const { setupSwagger } = require("../swagger");

describe("swagger.setupSwagger", () => {
  test("registra las rutas /api-docs y /api-docs.json en la app de Express", () => {
    const appFalsa = {
      use: jest.fn(),
      get: jest.fn(),
    };

    setupSwagger(appFalsa);

    expect(appFalsa.use).toHaveBeenCalledWith(
      "/api-docs",
      expect.anything(),
      expect.anything(),
    );
    expect(appFalsa.get).toHaveBeenCalledWith(
      "/api-docs.json",
      expect.any(Function),
    );
  });

  test("la ruta /api-docs.json responde con el spec en formato JSON", () => {
    const appFalsa = { use: jest.fn(), get: jest.fn() };
    setupSwagger(appFalsa);

    const handler = appFalsa.get.mock.calls[0][1];
    const resFalso = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    handler({}, resFalso);

    expect(resFalso.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json",
    );
    expect(resFalso.send).toHaveBeenCalled();
  });
});
