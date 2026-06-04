const { MotorAgendamiento, FabricaReglas, IReglaValidacion } = require('../../../backend/motor_agendamiento');

describe('SOLID Principles - Single Responsibility Principle (SRP)', () => {
  test('MotorAgendamiento solo maneja validación de reglas', () => {
    const motor = new MotorAgendamiento();
    expect(typeof motor.procesar).toBe('function');
    expect(typeof motor.agregarRegla).toBe('function');
    expect(typeof motor.obtenerReglasActivas).toBe('function');
    expect(motor).not.toHaveProperty('conectarBD');
    expect(motor).not.toHaveProperty('renderizarUI');
  });

  test('Cada regla tiene responsabilidad única', () => {
    const reglaFatiga = FabricaReglas.crearRegla('fatiga');
    const reglaCamas = FabricaReglas.crearRegla('camas');
    expect(reglaFatiga.getNombre()).toBe('Fatiga Médica (Horas de Turno)');
    expect(reglaCamas.getNombre()).toBe('Disponibilidad de Camas UCI');
    expect(typeof reglaFatiga.validar).toBe('function');
    expect(typeof reglaCamas.validar).toBe('function');
  });
});

describe('SOLID Principles - Open/Closed Principle (OCP)', () => {
  test('Motor abierto a nuevas reglas sin modificar código existente', () => {
    const motor = new MotorAgendamiento();
    const reglasIniciales = motor.obtenerReglasActivas().length;

    class ReglaNueva extends IReglaValidacion {
      validar(ctx) { return ctx.nuevaPropiedad > 0; }
      getNombre() { return 'Nueva Regla de Prueba'; }
      getPrioridad() { return 1; }
      getSeveridad() { return 'BAJA'; }
    }

    motor.agregarRegla(new ReglaNueva());
    expect(motor.obtenerReglasActivas().length).toBe(reglasIniciales + 1);
  });

  test('Fábrica permite crear reglas sin modificar código', () => {
    const regla = FabricaReglas.crearRegla('paciente_apto');
    expect(regla.getNombre()).toBe('Aptitud del Paciente');
    expect(typeof regla.validar).toBe('function');
  });
});

describe('SOLID Principles - Liskov Substitution Principle (LSP)', () => {
  test('Todas las reglas son sustituibles por IReglaValidacion', () => {
    const reglas = [
      FabricaReglas.crearRegla('fatiga'),
      FabricaReglas.crearRegla('camas'),
      FabricaReglas.crearRegla('paciente_apto')
    ];

    reglas.forEach(regla => {
      expect(typeof regla.validar).toBe('function');
      expect(typeof regla.getNombre).toBe('function');
      expect(typeof regla.getPrioridad).toBe('function');
      expect(typeof regla.getSeveridad).toBe('function');
    });

    const contexto = {
      pacienteApto: true,
      medicoDisponible: true,
      camasUCI: 5,
      horasTrabajadasMedico: 8,
      insumos: 20
    };

    reglas.forEach(regla => {
      const resultado = regla.validar(contexto);
      expect(typeof resultado).toBe('boolean');
    });
  });
});

describe('SOLID Principles - Interface Segregation Principle (ISP)', () => {
  test('Interfaces específicas y minimalistas', () => {
    const regla = FabricaReglas.crearRegla('fatiga');
    expect(regla).not.toHaveProperty('conectarBD');
    expect(regla).not.toHaveProperty('enviarEmail');
    expect(regla).not.toHaveProperty('renderizarHTML');
  });
});

describe('SOLID Principles - Dependency Inversion Principle (DIP)', () => {
  test('Motor depende de abstracciones, no de concretos', () => {
    const motor = new MotorAgendamiento();
    expect(typeof motor.reglas[0].validar).toBe('function');
    expect(typeof motor.reglas[0].getNombre).toBe('function');
  });

  test('Configuración externa (no hardcodeada)', () => {
    const regla = FabricaReglas.crearRegla('fatiga');
    expect(regla.validar({ horasTrabajadasMedico: 10 })).toBe(true);
    expect(regla.validar({ horasTrabajadasMedico: 14 })).toBe(false);
  });
});

describe('Design Patterns - Strategy Pattern', () => {
  test('Reglas intercambiables en tiempo de ejecución', () => {
    const reglaConservadora = FabricaReglas.crearRegla('camas');
    const reglaEstricta = FabricaReglas.crearRegla('fatiga');

    const contexto = {
      pacienteApto: true,
      medicoDisponible: true,
      camasUCI: 3,
      horasTrabajadasMedico: 13,
      insumos: 20
    };

    expect(reglaConservadora.validar(contexto)).toBe(true);
    expect(reglaEstricta.validar(contexto)).toBe(false);
  });
});

describe('Integration Tests - SOLID Application', () => {
  test('Flujo completo demuestra todos los principios SOLID', () => {
    const motor = new MotorAgendamiento();

    const reglaPersonalizada = {
      validar: (ctx) => ctx.customCheck === true,
      getNombre: () => 'Regla Personalizada',
      getPrioridad: () => 1,
      getSeveridad: () => 'BAJA'
    };
    motor.agregarRegla(reglaPersonalizada);

    const contexto = {
      pacienteApto: true,
      medicoDisponible: true,
      camasUCI: 5,
      horasTrabajadasMedico: 8,
      insumos: 20,
      customCheck: true,
      medicoEspecialidad: 'Cirugía General',
      especialidadRequerida: 'Cirugía General',
      duracionEstimadaCirugia: 4
    };

    const resultado = motor.procesar(contexto);
    expect(resultado).toHaveProperty('aprobado');
    expect(resultado).toHaveProperty('reglasEvaluadas');
    expect(resultado.reglasEvaluadas).toBeGreaterThan(1);
  });
});
