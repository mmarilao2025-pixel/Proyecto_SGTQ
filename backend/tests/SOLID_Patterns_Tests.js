const { MotorAgendamiento, FabricaReglas } = require('../motor_agendamiento');

// Pruebas unitarias para demostrar SOLID y patrones de diseño

describe('SOLID Principles - Single Responsibility Principle (SRP)', () => {
  test('MotorAgendamiento solo maneja validación de reglas', () => {
    const motor = new MotorAgendamiento();

    // Verificar que el motor solo tiene métodos relacionados con validación
    expect(typeof motor.procesar).toBe('function');
    expect(typeof motor.agregarRegla).toBe('function');
    expect(typeof motor.obtenerReglasActivas).toBe('function');

    // No debería tener métodos de BD, UI, etc.
    expect(motor).not.toHaveProperty('conectarBD');
    expect(motor).not.toHaveProperty('renderizarUI');
  });

  test('Cada regla tiene responsabilidad única', () => {
    const reglaFatiga = FabricaReglas.crearRegla('fatiga');
    const reglaCamas = FabricaReglas.crearRegla('camas');

    // Cada regla solo valida un aspecto específico
    expect(reglaFatiga.getNombre()).toBe('Fatiga Médica (Horas de Turno)');
    expect(reglaCamas.getNombre()).toBe('Disponibilidad de Camas UCI');

    // Métodos específicos para su responsabilidad
    expect(typeof reglaFatiga.validar).toBe('function');
    expect(typeof reglaCamas.validar).toBe('function');
  });
});

describe('SOLID Principles - Open/Closed Principle (OCP)', () => {
  test('Motor abierto a nuevas reglas sin modificar código existente', () => {
    const motor = new MotorAgendamiento();
    const reglasIniciales = motor.obtenerReglasActivas().length;

    // Crear nueva regla sin modificar MotorAgendamiento
    class ReglaNueva extends require('../motor_agendamiento').IReglaValidacion {
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
    const motor = new MotorAgendamiento();
    const reglas = [
      FabricaReglas.crearRegla('fatiga'),
      FabricaReglas.crearRegla('camas'),
      FabricaReglas.crearRegla('paciente_apto')
    ];

    // Todas implementan la interfaz correctamente
    reglas.forEach(regla => {
      expect(typeof regla.validar).toBe('function');
      expect(typeof regla.getNombre).toBe('function');
      expect(typeof regla.getPrioridad).toBe('function');
      expect(typeof regla.getSeveridad).toBe('function');
    });

    // Pueden ser usadas intercambiablemente
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

    // Solo métodos necesarios para validación
    expect(Object.getOwnPropertyNames(Object.getPrototypeOf(regla))).toEqual([
      'constructor',
      'validar',
      'getNombre',
      'getPrioridad',
      'getSeveridad'
    ]);

    // No métodos innecesarios
    expect(regla).not.toHaveProperty('conectarBD');
    expect(regla).not.toHaveProperty('enviarEmail');
    expect(regla).not.toHaveProperty('renderizarHTML');
  });
});

describe('SOLID Principles - Dependency Inversion Principle (DIP)', () => {
  test('Motor depende de abstracciones, no de concretos', () => {
    const motor = new MotorAgendamiento();

    // El motor no conoce implementaciones concretas
    expect(motor.reglas[0].constructor.name).not.toBe('ReglaFatigaMedica');
    expect(motor.reglas[0].constructor.name).not.toBe('ReglaCamasDisponibles');

    // Solo conoce la interfaz
    expect(typeof motor.reglas[0].validar).toBe('function');
    expect(typeof motor.reglas[0].getNombre).toBe('function');
  });

  test('Configuración externa (no hardcodeada)', () => {
    // Las reglas usan configuración externa, no valores hardcodeados
    const regla = FabricaReglas.crearRegla('fatiga');
    const contexto = { horasTrabajadasMedico: 10 };

    // La regla valida basado en lógica, no valores fijos
    expect(regla.validar(contexto)).toBe(true); // 10 < 12

    const contextoExcedido = { horasTrabajadasMedico: 14 };
    expect(regla.validar(contextoExcedido)).toBe(false); // 14 > 12
  });
});

describe('Design Patterns - Strategy Pattern', () => {
  test('Reglas intercambiables en tiempo de ejecución', () => {
    const motor = new MotorAgendamiento();

    // Agregar diferentes estrategias de validación
    const reglaConservadora = FabricaReglas.crearRegla('camas');
    const reglaEstricta = FabricaReglas.crearRegla('fatiga');

    // Contexto que pasa regla conservadora pero falla estricta
    const contexto = {
      pacienteApto: true,
      medicoDisponible: true,
      camasUCI: 3, // Pasa regla conservadora (3 > 2)
      horasTrabajadasMedico: 13, // Falla regla estricta (13 > 12)
      insumos: 20
    };

    expect(reglaConservadora.validar(contexto)).toBe(true);
    expect(reglaEstricta.validar(contexto)).toBe(false);
  });

  test('Fábrica crea estrategias dinámicamente', () => {
    const estrategias = ['fatiga', 'camas', 'insumos', 'paciente_apto'];

    estrategias.forEach(tipo => {
      const regla = FabricaReglas.crearRegla(tipo);
      expect(regla).toBeDefined();
      expect(typeof regla.validar).toBe('function');
      expect(typeof regla.getNombre).toBe('function');
    });
  });
});

describe('Design Patterns - Singleton Pattern', () => {
  test('Database Singleton garantiza instancia única', () => {
    const db1 = require('../../shared/config/Database');
    const db2 = require('../../shared/config/Database');

    // Misma instancia
    expect(db1).toBe(db2);

    // Métodos de instancia única
    expect(typeof db1.getPool).toBe('function');
    expect(typeof db1.healthCheck).toBe('function');
  });

  test('Singleton previene creación múltiple', () => {
    const Database = require('../config/Database');

    // Intentar crear nueva instancia (debería devolver la misma)
    const instancia1 = new Database.constructor();
    const instancia2 = new Database.constructor();

    expect(instancia1).toBe(instancia2);
  });
});

describe('Integration Tests - SOLID Application', () => {
  test('Flujo completo demuestra todos los principios SOLID', () => {
    const motor = new MotorAgendamiento();

    // SRP: Motor solo valida
    expect(typeof motor.procesar).toBe('function');

    // OCP: Agregar regla sin modificar motor
    const reglaPersonalizada = {
      validar: (ctx) => ctx.customCheck === true,
      getNombre: () => 'Regla Personalizada',
      getPrioridad: () => 1,
      getSeveridad: () => 'BAJA'
    };
    motor.agregarRegla(reglaPersonalizada);

    // LSP: Regla intercambiable
    const contexto = {
      pacienteApto: true,
      medicoDisponible: true,
      camasUCI: 5,
      horasTrabajadasMedico: 8,
      insumos: 20,
      customCheck: true
    };

    const resultado = motor.procesar(contexto);

    // DIP: Motor usa abstracciones
    expect(resultado).toHaveProperty('aprobado');
    expect(resultado).toHaveProperty('reglasEvaluadas');
    expect(resultado.reglasEvaluadas).toBeGreaterThan(1);
  });
});