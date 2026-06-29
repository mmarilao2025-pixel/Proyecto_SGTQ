const {
    MotorAgendamiento,
    IReglaValidacion
} = require("../motor_agendamiento");

const Database = require("../../shared/config/Database");

describe("SOLID - Single Responsibility Principle (SRP)", () => {
    test("MotorAgendamiento posee las operaciones principales", () => {

        const motor = new MotorAgendamiento();

        expect(typeof motor.procesar).toBe("function");
        expect(typeof motor.agregarRegla).toBe("function");
        expect(typeof motor.removerRegla).toBe("function");
        expect(motor).not.toHaveProperty("conectarBD");
        expect(motor).not.toHaveProperty("renderizarUI");

    });
    test("El motor carga reglas por defecto", () => {
        const motor = new MotorAgendamiento();
        expect(Array.isArray(motor.reglas)).toBe(true);
        expect(motor.reglas.length).toBeGreaterThan(5);
    });

});
describe("SOLID - Open Closed Principle (OCP)", () => {
    class ReglaPersonalizada extends IReglaValidacion {
        async validar(ctx) {
            return ctx.personalizada === true;
        }
        getNombre() {
            return "Regla Personalizada";
        }
        getPrioridad() {
            return 1;
        }
        getSeveridad() {
            return "BAJA";
        }
    }

    test("Es posible agregar nuevas reglas sin modificar el motor", () => {
        const motor = new MotorAgendamiento();
        const cantidadInicial = motor.reglas.length;
        motor.agregarRegla(new ReglaPersonalizada());
        expect(motor.reglas.length).toBe(cantidadInicial + 1);
    });

    test("También es posible remover reglas", () => {
        const motor = new MotorAgendamiento();
        motor.agregarRegla(new ReglaPersonalizada());
        motor.removerRegla("Regla Personalizada");
        const existe = motor.reglas.some(
            r => r.getNombre() === "Regla Personalizada"
        );

        expect(existe).toBe(false);
    });

});

describe("SOLID - Liskov Substitution Principle (LSP)", () => {
    test("Todas las reglas implementan la interfaz", () => {
        const motor = new MotorAgendamiento();
        motor.reglas.forEach(regla => {
            expect(regla instanceof IReglaValidacion).toBe(true);
            expect(typeof regla.validar).toBe("function");
            expect(typeof regla.getNombre).toBe("function");
            expect(typeof regla.getPrioridad).toBe("function");
            expect(typeof regla.getSeveridad).toBe("function");
        });
    });
});
describe("SOLID - Interface Segregation Principle (ISP)", () => {

    test("Las reglas exponen únicamente la interfaz necesaria", () => {

        const motor = new MotorAgendamiento();

        motor.reglas.forEach(regla => {

            expect(typeof regla.validar).toBe("function");
            expect(typeof regla.getNombre).toBe("function");
            expect(typeof regla.getPrioridad).toBe("function");
            expect(typeof regla.getSeveridad).toBe("function");

            expect(regla).not.toHaveProperty("conectarBD");
            expect(regla).not.toHaveProperty("renderizarUI");
            expect(regla).not.toHaveProperty("enviarCorreo");

        });

    });

});

describe("SOLID - Dependency Inversion Principle (DIP)", () => {

    test("El motor trabaja mediante la abstracción IReglaValidacion", () => {

        const motor = new MotorAgendamiento();

        motor.reglas.forEach(regla => {
            expect(regla instanceof IReglaValidacion).toBe(true);
        });

    });

    test("Se pueden inyectar nuevas implementaciones", () => {

        class ReglaDummy extends IReglaValidacion {

            async validar() {
                return true;
            }

            getNombre() {
                return "Dummy";
            }

            getPrioridad() {
                return 2;
            }

            getSeveridad() {
                return "MEDIA";
            }

        }

        const motor = new MotorAgendamiento();

        motor.agregarRegla(new ReglaDummy());

        const encontrada = motor.reglas.find(
            r => r.getNombre() === "Dummy"
        );

        expect(encontrada).toBeDefined();

    });

});

describe("Design Pattern - Strategy", () => {
    test("Las reglas son estrategias intercambiables", async () => {
        const motor = new MotorAgendamiento();
        const contexto = {
            pacienteApto: true,
            camasUCI: 5,
            insumos: 20,
            horasTrabajadasMedico: 8,
            duracionEstimadaCirugia: 4,
            medicoEspecialidad: "General",
            especialidadRequerida: "General",
            requiereTransfusion: false,
            alergiasPaciente: [],
            medicamentosPaciente: [],
            medicamentosCirugia: [],
            ultimaCirugiaFecha: null
        };

        for (const regla of motor.reglas) {
            const resultado = await regla.validar(contexto);
            expect(typeof resultado).toBe("boolean");
        }
    });

    test("El motor evalúa todas las reglas", async () => {
        const motor = new MotorAgendamiento();
        const contexto = {
            pacienteApto: true,
            camasUCI: 5,
            insumos: 20,
            horasTrabajadasMedico: 8,
            duracionEstimadaCirugia: 4,
            medicoEspecialidad: "General",
            especialidadRequerida: "General",
            requiereTransfusion: false,
            alergiasPaciente: [],
            medicamentosPaciente: [],
            medicamentosCirugia: [],
            ultimaCirugiaFecha: null
        };

        const resultado = await motor.procesar(contexto);
        expect(resultado).toHaveProperty("aprobado");
        expect(resultado).toHaveProperty("detalles");
        expect(resultado).toHaveProperty("reglasEvaluadas");
        expect(Array.isArray(resultado.detalles)).toBe(true);
    });
});
describe("Design Pattern - Singleton", () => {

    test("Database devuelve siempre la misma instancia", () => {

        const db1 = require("../../shared/config/Database");
        const db2 = require("../../shared/config/Database");

        expect(db1).toBe(db2);

    });

    test("La instancia expone los métodos esperados", () => {
      expect(typeof Database.getPool).toBe("function");
      expect(typeof Database.query).toBe("function");
      expect(typeof Database.close).toBe("function");

    });

});

describe("Integration Tests", () => {
    test("MotorAgendamiento puede procesar un contexto válido", async () => {
        const motor = new MotorAgendamiento();

        const contexto = {
            pacienteApto: true,
            camasUCI: 5,
            insumos: 20,
            horasTrabajadasMedico: 8,
            duracionEstimadaCirugia: 4,
            medicoEspecialidad: "General",
            especialidadRequerida: "General",
            requiereTransfusion: false,
            alergiasPaciente: [],
            medicamentosPaciente: [],
            medicamentosCirugia: [],
            ultimaCirugiaFecha: null

        };
        const resultado = await motor.procesar(contexto);
        expect(resultado).toBeDefined();
        expect(resultado).toHaveProperty("aprobado");
        expect(resultado).toHaveProperty("detalles");
        expect(resultado).toHaveProperty("reglasEvaluadas");

    });

    test("El motor acepta reglas personalizadas", async () => {
        class ReglaExtra extends IReglaValidacion {
            async validar() {
                return true;
            }
            getNombre() {
                return "Extra";
            }
            getPrioridad() {
                return 1;
            }
            getSeveridad() {
                return "BAJA";
            }
        }

        const motor = new MotorAgendamiento();
        motor.agregarRegla(new ReglaExtra());
        const existe = motor.reglas.find(
            r => r.getNombre() === "Extra"
        );
        expect(existe).toBeDefined();
    });
    test("Todas las reglas implementan la interfaz base", () => {
        const motor = new MotorAgendamiento();
        for (const regla of motor.reglas) {
            expect(regla instanceof IReglaValidacion).toBe(true);
        }
    });
});