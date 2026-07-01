const {
  PriorityStrategy,
  StandardPriorityStrategy,
  TransplantPriorityStrategy,
  ReprioritizationService,
} = require("../PriorityStrategy");

describe("PriorityStrategy (clase abstracta)", () => {
  test("lanza error si calculateScore no está implementado", () => {
    const base = new PriorityStrategy();
    expect(() => base.calculateScore({})).toThrow(
      "Method 'calculateScore()' must be implemented.",
    );
  });
});

describe("StandardPriorityStrategy", () => {
  const strategy = new StandardPriorityStrategy();

  test("calcula score en base a días de espera", () => {
    const score = strategy.calculateScore({
      daysInWaitlist: 10,
      severity: "MEDIA",
    });
    expect(score).toBe(5);
  });

  test("suma 20 puntos extra si la severidad es ALTA", () => {
    const score = strategy.calculateScore({
      daysInWaitlist: 10,
      severity: "ALTA",
    });
    expect(score).toBe(25);
  });
});

describe("TransplantPriorityStrategy", () => {
  const strategy = new TransplantPriorityStrategy();

  test("retorna prioridad máxima si hay órgano disponible", () => {
    expect(strategy.calculateScore({ organAvailable: true })).toBe(9999);
  });

  test("retorna 0 si no hay órgano disponible", () => {
    expect(strategy.calculateScore({ organAvailable: false })).toBe(0);
  });
});

describe("ReprioritizationService", () => {
  test("getStrategy retorna la estrategia correcta según el tipo", () => {
    const service = new ReprioritizationService();
    expect(service.getStrategy("TRANSPLANT")).toBeInstanceOf(
      TransplantPriorityStrategy,
    );
    expect(service.getStrategy("ELECTIVE")).toBeInstanceOf(
      StandardPriorityStrategy,
    );
  });

  test("getStrategy retorna ELECTIVE por defecto para tipos desconocidos", () => {
    const service = new ReprioritizationService();
    expect(service.getStrategy("NO_EXISTE")).toBeInstanceOf(
      StandardPriorityStrategy,
    );
  });

  test("reprioritize ordena la lista de espera por score descendente", () => {
    const service = new ReprioritizationService();
    const waitlist = [
      { id: 1, type: "ELECTIVE", daysInWaitlist: 5, severity: "BAJA" },
      { id: 2, type: "TRANSPLANT", organAvailable: true },
      { id: 3, type: "ELECTIVE", daysInWaitlist: 40, severity: "ALTA" },
    ];

    const resultado = service.reprioritize(waitlist);

    expect(resultado[0].id).toBe(2); // trasplante siempre primero
    expect(resultado[1].id).toBe(3);
    expect(resultado[2].id).toBe(1);
  });
});
