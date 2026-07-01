// Los controllers en backend/controllers/*.js son actualmente módulos "stub":
// solo contienen documentación OpenAPI (JSDoc) y exportan un objeto vacío.
// La lógica real vive en backend/server.js. Estos tests documentan y verifican
// ese contrato para que, si en el futuro se les agrega lógica real, quede claro
// que necesitarán tests propios.

const dashboardController = require("../controllers/dashboardController");
const eventsController = require("../controllers/eventsController");
const insumoController = require("../controllers/insumoController");
const resourcesController = require("../controllers/resourcesController");
const surgeriesController = require("../controllers/surgeriesController");
const surgeryController = require("../controllers/surgeryController");
const teamController = require("../controllers/teamController");
const apiDocumentation = require("../api-documentation");

describe("Controllers (stubs de documentación OpenAPI)", () => {
  test.each([
    ["dashboardController", dashboardController],
    ["eventsController", eventsController],
    ["insumoController", insumoController],
    ["resourcesController", resourcesController],
    ["surgeriesController", surgeriesController],
    ["surgeryController", surgeryController],
    ["teamController", teamController],
  ])("%s exporta un objeto (actualmente sin lógica propia)", (_, controller) => {
    expect(typeof controller).toBe("object");
    expect(controller).not.toBeNull();
  });

  test("api-documentation.js exporta un objeto vacío (solo contiene JSDoc de Swagger)", () => {
    expect(apiDocumentation).toEqual({});
  });
});
