// Motor de Agendamiento siguiendo principios SOLID
// SRP: Cada clase tiene una responsabilidad única
// OCP: Abierto a extensión (nuevas reglas), cerrado a modificación
// LSP: Las reglas concretas son sustituibles por la interfaz
// ISP: Interfaz específica para validación
// DIP: Depende de abstracciones, no de concretos

// Interfaz de Regla (ISP - Interface Segregation Principle)
class IReglaValidacion {
    validar(contexto) {
        throw new Error("Método validar no implementado");
    }

    getNombre() {
        throw new Error("Método getNombre no implementado");
    }

    getPrioridad() {
        return 1; // Prioridad por defecto (1-5, siendo 5 la más alta)
    }

    getSeveridad() {
        return 'MEDIA'; // BAJA, MEDIA, ALTA, CRITICA
    }
}

// Reglas Concretas (SRP - Single Responsibility Principle)
class ReglaCamasDisponibles extends IReglaValidacion {
    validar(ctx) {
        return ctx.camasUCI > 2; // Bloquea si hay 2 o menos
    }

    getNombre() {
        return "Disponibilidad de Camas UCI";
    }

    getPrioridad() {
        return 5; // Muy alta prioridad
    }

    getSeveridad() {
        return 'CRITICA'; // Puede causar muerte si no hay camas
    }
}

class ReglaInsumosCriticos extends IReglaValidacion {
    validar(ctx) {
        return ctx.insumos > 10;
    }

    getNombre() {
        return "Insumos Críticos Disponibles";
    }

    getPrioridad() {
        return 4;
    }

    getSeveridad() {
        return 'ALTA'; // Puede comprometer la cirugía
    }
}

class ReglaFatigaMedica extends IReglaValidacion {
    validar(ctx) {
        // Regla: No más de 12 horas de turno continuo
        return ctx.horasTrabajadasMedico <= 12;
    }

    getNombre() {
        return "Fatiga Médica (Horas de Turno)";
    }

    getPrioridad() {
        return 5;
    }

    getSeveridad() {
        return 'CRITICA'; // Riesgo legal y de seguridad
    }
}

class ReglaDisponibilidadMedico extends IReglaValidacion {
    validar(ctx) {
        return ctx.medicoDisponible === true;
    }

    getNombre() {
        return "Disponibilidad del Médico";
    }

    getPrioridad() {
        return 3;
    }

    getSeveridad() {
        return 'ALTA';
    }
}

class ReglaPacienteApto extends IReglaValidacion {
    validar(ctx) {
        return ctx.pacienteApto === true;
    }

    getNombre() {
        return "Aptitud del Paciente";
    }

    getPrioridad() {
        return 5;
    }

    getSeveridad() {
        return 'CRITICA'; // No operar paciente no apto
    }
}

class ReglaTiempoCirugia extends IReglaValidacion {
    validar(ctx) {
        // Regla: Cirugías no pueden exceder 8 horas para evitar fatiga extrema
        return ctx.duracionEstimadaCirugia <= 8;
    }

    getNombre() {
        return "Duración Máxima de Cirugía";
    }

    getPrioridad() {
        return 4;
    }

    getSeveridad() {
        return 'ALTA';
    }
}

class ReglaEspecialidadMedico extends IReglaValidacion {
    validar(ctx) {
        // Regla: El médico debe tener la especialidad requerida
        return ctx.medicoEspecialidad === ctx.especialidadRequerida;
    }

    getNombre() {
        return "Especialidad del Médico";
    }

    getPrioridad() {
        return 4;
    }

    getSeveridad() {
        return 'ALTA';
    }
}

class ReglaCompatibilidadSanguinea extends IReglaValidacion {
    validar(ctx) {
        // Regla: Compatibilidad sanguínea para cirugías con transfusión
        if (ctx.requiereTransfusion) {
            return ctx.compatibilidadSanguinea === 'COMPATIBLE';
        }
        return true; // No aplica si no requiere transfusión
    }

    getNombre() {
        return "Compatibilidad Sanguínea";
    }

    getPrioridad() {
        return 5;
    }

    getSeveridad() {
        return 'CRITICA'; // Reacción alérgica fatal posible
    }
}

class ReglaAlergiasPaciente extends IReglaValidacion {
    validar(ctx) {
        // Regla: Paciente no debe tener alergias a medicamentos/anestésicos usados
        if (ctx.alergiasPaciente && ctx.alergiasPaciente.length > 0) {
            const medicamentosCirugia = ctx.medicamentosRequeridos || [];
            return !ctx.alergiasPaciente.some(alergia =>
                medicamentosCirugia.includes(alergia)
            );
        }
        return true;
    }

    getNombre() {
        return "Ausencia de Alergias";
    }

    getPrioridad() {
        return 5;
    }

    getSeveridad() {
        return 'CRITICA'; // Shock anafiláctico posible
    }
}

class ReglaInteraccionesMedicamentosas extends IReglaValidacion {
    validar(ctx) {
        // Regla: No interacciones peligrosas entre medicamentos del paciente y cirugía
        if (ctx.medicamentosPaciente && ctx.medicamentosCirugia) {
            // Lógica simplificada - en producción usaría base de datos de interacciones
            const interaccionesPeligrosas = [
                ['warfarina', 'antibiotico'],
                ['digoxina', 'diuretico']
            ];

            return !interaccionesPeligrosas.some(([med1, med2]) =>
                ctx.medicamentosPaciente.includes(med1) &&
                ctx.medicamentosCirugia.includes(med2)
            );
        }
        return true;
    }

    getNombre() {
        return "Interacciones Medicamentosas";
    }

    getPrioridad() {
        return 4;
    }

    getSeveridad() {
        return 'ALTA';
    }
}

class ReglaTiempoRecuperacion extends IReglaValidacion {
    validar(ctx) {
        // Regla: Tiempo mínimo de recuperación entre cirugías del mismo paciente
        if (ctx.ultimaCirugiaFecha) {
            const diasDesdeUltimaCirugia = Math.floor(
                (new Date() - new Date(ctx.ultimaCirugiaFecha)) / (1000 * 60 * 60 * 24)
            );
            const tiempoMinimoRecuperacion = ctx.tiempoRecuperacionRequerido || 30; // 30 días por defecto
            return diasDesdeUltimaCirugia >= tiempoMinimoRecuperacion;
        }
        return true; // Primera cirugía
    }

    getNombre() {
        return "Tiempo de Recuperación";
    }

    getPrioridad() {
        return 3;
    }

    getSeveridad() {
        return 'MEDIA';
    }
}

// Motor de Agendamiento (OCP - Open/Closed Principle)
class MotorAgendamiento {
    constructor() {
        this.reglas = [];
        this.inicializarReglasPorDefecto();
    }

    // Método para agregar reglas dinámicamente (OCP)
    agregarRegla(regla) {
        if (regla instanceof IReglaValidacion) {
            this.reglas.push(regla);
        } else {
            throw new Error("La regla debe implementar IReglaValidacion");
        }
    }

    // Método para remover reglas
    removerRegla(nombreRegla) {
        this.reglas = this.reglas.filter(regla => regla.getNombre() !== nombreRegla);
    }

    // Inicializar con reglas básicas
    inicializarReglasPorDefecto() {
        this.agregarRegla(new ReglaPacienteApto());
        this.agregarRegla(new ReglaFatigaMedica());
        this.agregarRegla(new ReglaCamasDisponibles());
        this.agregarRegla(new ReglaCompatibilidadSanguinea());
        this.agregarRegla(new ReglaAlergiasPaciente());
        this.agregarRegla(new ReglaEspecialidadMedico());
        this.agregarRegla(new ReglaInsumosCriticos());
        this.agregarRegla(new ReglaTiempoCirugia());
        this.agregarRegla(new ReglaInteraccionesMedicamentosas());
        this.agregarRegla(new ReglaDisponibilidadMedico());
        this.agregarRegla(new ReglaTiempoRecuperacion());
    }

    // Procesar validación con prioridades y severidades
    procesar(contextoActual) {
        // Validar contexto básico
        if (!this.validarContexto(contextoActual)) {
            return {
                aprobado: false,
                detalles: [],
                reglasEvaluadas: 0,
                reglasFallidas: 0,
                error: 'Contexto inválido o incompleto'
            };
        }

        // Ordenar reglas por prioridad (mayor primero)
        const reglasOrdenadas = [...this.reglas].sort((a, b) => b.getPrioridad() - a.getPrioridad());

        const resultados = reglasOrdenadas.map(regla => ({
            regla: regla.getNombre(),
            pasa: regla.validar(contextoActual),
            descripcion: regla.getNombre(),
            prioridad: regla.getPrioridad(),
            severidad: regla.getSeveridad()
        }));

        const aprobado = resultados.every(r => r.pasa);

        // Calcular métricas adicionales
        const reglasCriticasFallidas = resultados.filter(r =>
            !r.pasa && r.severidad === 'CRITICA'
        );

        return {
            aprobado,
            detalles: resultados,
            reglasEvaluadas: this.reglas.length,
            reglasFallidas: resultados.filter(r => !r.pasa).length,
            reglasCriticasFallidas: reglasCriticasFallidas.length,
            reglasPorSeveridad: this.contarPorSeveridad(resultados)
        };
    }

    // Método para validar que el contexto tenga los campos necesarios
    validarContexto(contexto) {
        const camposRequeridos = [
            'pacienteApto', 'medicoDisponible', 'camasUCI', 'insumos'
        ];

        return camposRequeridos.every(campo => contexto.hasOwnProperty(campo));
    }

    // Método auxiliar para contar reglas por severidad
    contarPorSeveridad(resultados) {
        const conteo = { CRITICA: 0, ALTA: 0, MEDIA: 0, BAJA: 0 };

        resultados.forEach(r => {
            if (conteo.hasOwnProperty(r.severidad)) {
                conteo[r.severidad]++;
            }
        });

        return conteo;
    }

    // Método para obtener reglas activas
    obtenerReglasActivas() {
        return this.reglas.map(regla => regla.getNombre());
    }

    // Método para obtener reglas críticas
    obtenerReglasCriticas() {
        return this.reglas
            .filter(regla => regla.getSeveridad() === 'CRITICA')
            .map(regla => regla.getNombre());
    }
}

// Fábrica para crear reglas (si se necesitan reglas parametrizadas)
class FabricaReglas {
    static crearRegla(tipo, parametros = {}) {
        switch (tipo) {
            case 'camas':
                return new ReglaCamasDisponibles();
            case 'insumos':
                return new ReglaInsumosCriticos();
            case 'fatiga':
                return new ReglaFatigaMedica();
            case 'disponibilidad_medico':
                return new ReglaDisponibilidadMedico();
            case 'paciente_apto':
                return new ReglaPacienteApto();
            case 'tiempo_cirugia':
                return new ReglaTiempoCirugia();
            case 'especialidad_medico':
                return new ReglaEspecialidadMedico();
            case 'compatibilidad_sanguinea':
                return new ReglaCompatibilidadSanguinea();
            case 'alergias_paciente':
                return new ReglaAlergiasPaciente();
            case 'interacciones_medicamentosas':
                return new ReglaInteraccionesMedicamentosas();
            case 'tiempo_recuperacion':
                return new ReglaTiempoRecuperacion();
            default:
                throw new Error(`Tipo de regla desconocido: ${tipo}`);
        }
    }
}

module.exports = {
    IReglaValidacion,
    ReglaCamasDisponibles,
    ReglaInsumosCriticos,
    ReglaFatigaMedica,
    ReglaDisponibilidadMedico,
    ReglaPacienteApto,
    ReglaTiempoCirugia,
    ReglaEspecialidadMedico,
    ReglaCompatibilidadSanguinea,
    ReglaAlergiasPaciente,
    ReglaInteraccionesMedicamentosas,
    ReglaTiempoRecuperacion,
    MotorAgendamiento,
    FabricaReglas
};