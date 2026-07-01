// backend/PriorityStrategy.js

class PriorityStrategy {
  calculateScore(surgeryContext) {
    throw new Error("Method 'calculateScore()' must be implemented.");
  }
}

class StandardPriorityStrategy extends PriorityStrategy {
  calculateScore(ctx) {
    // Lógica base: Días en lista de espera + severidad
    let score = ctx.daysInWaitlist * 0.5;
    if (ctx.severity === "ALTA") score += 20;
    return score;
  }
}

class TransplantPriorityStrategy extends PriorityStrategy {
  calculateScore(ctx) {
    // Órgano disponible = Prioridad máxima absoluta
    return ctx.organAvailable ? 9999 : 0;
  }
}

class ReprioritizationService {
  constructor() {
    this.strategies = {
      ELECTIVE: new StandardPriorityStrategy(),
      TRANSPLANT: new TransplantPriorityStrategy(),
    };
  }

  getStrategy(type) {
    return this.strategies[type] || this.strategies["ELECTIVE"];
  }

  reprioritize(waitlist) {
    return waitlist.sort((a, b) => {
      const strategyA = this.getStrategy(a.type);
      const strategyB = this.getStrategy(b.type);
      return strategyB.calculateScore(b) - strategyA.calculateScore(a);
    });
  }
}

module.exports = {
  PriorityStrategy,
  StandardPriorityStrategy,
  TransplantPriorityStrategy,
  ReprioritizationService,
};
