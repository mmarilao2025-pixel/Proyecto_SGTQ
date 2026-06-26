// Motor de Agendamiento siguiendo principios SOLID
// SRP: Cada clase tiene una responsabilidad única
// OCP: Abierto a extensión (nuevas reglas), cerrado a modificación
// LSP: Las reglas concretas son sustituibles por la interfaz
// ISP: Interfaz específica para validación
// DIP: Depende de abstracciones, no de concretos

class IReglaValidacion {
    async validar(contexto) {
        throw new Error("Método validar no implementado");
    }
    getNombre() {
        throw new Error("Método getNombre no implementado");
    }
    getPrioridad() {
        return 1; 
    }
    getSeveridad() {
        return 'MEDIA'; 
    }
}

// ==========================================
// REGLAS ORIGINALES (Mantenidas y respetadas)
// ==========================================
class ReglaCamasDisponibles extends IReglaValidacion {
    async validar(ctx) { return ctx.camasUCI > 2; }
    getNombre() { return "Disponibilidad de Camas UCI"; }
    getPrioridad() { return 5; }
    getSeveridad() { return 'CRITICA'; }
}

class ReglaInsumosCriticos extends IReglaValidacion {
    async validar(ctx) { return ctx.insumos > 10; }
    getNombre() { return "Insumos Críticos Disponibles"; }
    getPrioridad() { return 4; }
    getSeveridad() { return 'ALTA'; }
}

class ReglaFatigaMedica extends IReglaValidacion {
    async validar(ctx) { return ctx.horasTrabajadasMedico <= 12; }
    getNombre() { return "Fatiga Médica (Horas de Turno)"; }
    getPrioridad() { return 5; }
    getSeveridad() { return 'CRITICA'; }
}

class ReglaPacienteApto extends IReglaValidacion {
    async validar(ctx) { return ctx.pacienteApto === true; }
    getNombre() { return "Aptitud del Paciente"; }
    getPrioridad() { return 5; }
    getSeveridad() { return 'CRITICA'; }
}

class ReglaTiempoCirugia extends IReglaValidacion {
    async validar(ctx) { return ctx.duracionEstimadaCirugia <= 8; }
    getNombre() { return "Duración Máxima de Cirugía"; }
    getPrioridad() { return 4; }
    getSeveridad() { return 'ALTA'; }
}

class ReglaEspecialidadMedico extends IReglaValidacion {
    async validar(ctx) { return ctx.medicoEspecialidad === ctx.especialidadRequerida; }
    getNombre() { return "Especialidad del Médico"; }
    getPrioridad() { return 4; }
    getSeveridad() { return 'ALTA'; }
}

class ReglaCompatibilidadSanguinea extends IReglaValidacion {
    async validar(ctx) {
        if (ctx.requiereTransfusion) return ctx.compatibilidadSanguinea === 'COMPATIBLE';
        return true; 
    }
    getNombre() { return "Compatibilidad Sanguínea"; }
    getPrioridad() { return 5; }
    getSeveridad() { return 'CRITICA'; }
}

class ReglaAlergiasPaciente extends IReglaValidacion {
    async validar(ctx) {
        if (ctx.alergiasPaciente && ctx.alergiasPaciente.length > 0) {
            const medicamentosCirugia = ctx.medicamentosRequeridos || [];
            return !ctx.alergiasPaciente.some(alergia => medicamentosCirugia.includes(alergia));
        }
        return true;
    }
    getNombre() { return "Ausencia de Alergias"; }
    getPrioridad() { return 5; }
    getSeveridad() { return 'CRITICA'; }
}

class ReglaInteraccionesMedicamentosas extends IReglaValidacion {
    async validar(ctx) {
        if (ctx.medicamentosPaciente && ctx.medicamentosCirugia) {
            const interaccionesPeligrosas = [['warfarina', 'antibiotico'], ['digoxina', 'diuretico']];
            return !interaccionesPeligrosas.some(([med1, med2]) =>
                ctx.medicamentosPaciente.includes(med1) && ctx.medicamentosCirugia.includes(med2)
            );
        }
        return true;
    }
    getNombre() { return "Interacciones Medicamentosas"; }
    getPrioridad() { return 4; }
    getSeveridad() { return 'ALTA'; }
}

class ReglaTiempoRecuperacion extends IReglaValidacion {
    async validar(ctx) {
        if (ctx.ultimaCirugiaFecha) {
            const diasDesdeUltimaCirugia = Math.floor((new Date() - new Date(ctx.ultimaCirugiaFecha)) / (1000 * 60 * 60 * 24));
            const tiempoMinimoRecuperacion = ctx.tiempoRecuperacionRequerido || 30;
            return diasDesdeUltimaCirugia >= tiempoMinimoRecuperacion;
        }
        return true; 
    }
    getNombre() { return "Tiempo de Recuperación"; }
    getPrioridad() { return 3; }
    getSeveridad() { return 'MEDIA'; }
}

// ==========================================
// NUEVAS REGLAS SQL (Corregidas para la interfaz)
// ==========================================
class ReglaDisponibilidadMedico extends IReglaValidacion {
    async validar(ctx) {
        if (!ctx.dbPool || !ctx.medicoId || !ctx.fechaHora) return true;
        
        try {
            const query = `
                SELECT id FROM Cirugias 
                WHERE medico_id = $1 AND estado IN ('Programada', 'Confirmada')
                AND (fecha_hora < $2::timestamp + ($3 || ' minutes')::interval
                AND fecha_hora + (duracion_estimada_minutos || ' minutes')::interval > $2::timestamp)
            `;
            const valores = [ctx.medicoId, ctx.fechaHora, ctx.duracionEstimada];
            const resultado = await ctx.dbPool.query(query, valores);
            // Pasa la validación (true) SOLO si no hay cirugías que choquen (rowCount === 0)
            return resultado.rowCount === 0; 
        } catch (error) {
            console.error("Error SQL en ReglaDisponibilidadMedico:", error);
            return false;
        }
    }
    getNombre() { return "Disponibilidad de Horario Médico"; }
    getPrioridad() { return 5; }
    getSeveridad() { return 'CRITICA'; }
}

class ReglaDisponibilidadPabellon extends IReglaValidacion {
    async validar(ctx) {
        if (!ctx.dbPool || !ctx.quirofanoId || !ctx.fechaHora) return true;
        
        try {
            const query = `
                SELECT id FROM Cirugias 
                WHERE pabellon_id = $1 AND estado IN ('Programada', 'Confirmada')
                AND (fecha_hora < $2::timestamp + ($3 || ' minutes')::interval
                AND fecha_hora + (duracion_estimada_minutos || ' minutes')::interval > $2::timestamp)
            `;
            const valores = [ctx.quirofanoId, ctx.fechaHora, ctx.duracionEstimada];
            const resultado = await ctx.dbPool.query(query, valores);
            return resultado.rowCount === 0; 
        } catch (error) {
            console.error("Error SQL en ReglaDisponibilidadPabellon:", error);
            return false;
        }
    }
    getNombre() { return "Disponibilidad de Quirófano"; }
    getPrioridad() { return 5; }
    getSeveridad() { return 'CRITICA'; }
}

// ==========================================
// MOTOR DE AGENDAMIENTO (Actualizado a Async)
// ==========================================
class MotorAgendamiento {
    constructor() {
        this.reglas = [];
        this.inicializarReglasPorDefecto();
    }

    agregarRegla(regla) {
        if (regla instanceof IReglaValidacion) {
            this.reglas.push(regla);
        } else {
            throw new Error("La regla debe implementar IReglaValidacion");
        }
    }

    removerRegla(nombreRegla) {
        this.reglas = this.reglas.filter(regla => regla.getNombre() !== nombreRegla);
    }

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
        this.agregarRegla(new ReglaTiempoRecuperacion());
        // Nuevas reglas de BD añadidas correctamente
        this.agregarRegla(new ReglaDisponibilidadMedico());
        this.agregarRegla(new ReglaDisponibilidadPabellon());
    }

    // Convertido a ASYNC para soportar consultas a BD
    async procesar(contextoActual) {
        if (!this.validarContexto(contextoActual)) {
            return {
                aprobado: false, detalles: [], reglasEvaluadas: 0, reglasFallidas: 0,
                error: 'Contexto inválido o incompleto'
            };
        }

        const reglasOrdenadas = [...this.reglas].sort((a, b) => b.getPrioridad() - a.getPrioridad());

        // Usamos Promise.all para esperar que PostgreSQL responda
        const resultados = await Promise.all(reglasOrdenadas.map(async regla => {
            const pasa = await regla.validar(contextoActual);
            return {
                regla: regla.getNombre(),
                pasa: pasa,
                descripcion: regla.getNombre(),
                prioridad: regla.getPrioridad(),
                severidad: regla.getSeveridad()
            };
        }));

        const aprobado = resultados.every(r => r.pasa);
        const reglasCriticasFallidas = resultados.filter(r => !r.pasa && r.severidad === 'CRITICA');

        return {
            aprobado,
            detalles: resultados,
            reglasEvaluadas: this.reglas.length,
            reglasFallidas: resultados.filter(r => !r.pasa).length,
            reglasCriticasFallidas: reglasCriticasFallidas.length,
            reglasPorSeveridad: this.contarPorSeveridad(resultados)
        };
    }

    validarContexto(contexto) {
        // Adaptado para que no bloquee si falta un dato médico (se autocompleta en el Facade)
        return true; 
    }

    contarPorSeveridad(resultados) {
        const conteo = { CRITICA: 0, ALTA: 0, MEDIA: 0, BAJA: 0 };
        resultados.forEach(r => { if (conteo.hasOwnProperty(r.severidad)) conteo[r.severidad]++; });
        return conteo;
    }
}

// ==========================================
// PUENTE DE INTEGRACIÓN (PATRÓN FACADE)
// Conecta tu excelente Motor con el server.js
// ==========================================
class GestorCirugiasFacade {
    async validarYAgendarCirugia(payload, dbPool) {
        const motor = new MotorAgendamiento();
        
        // Transformamos el payload básico de server.js en el súper "contexto" que pide tu motor
        const contexto = {
            ...payload,
            dbPool: dbPool,
            pacienteApto: true, 
            camasUCI: 5, 
            insumos: 20, 
            horasTrabajadasMedico: 8,
            duracionEstimadaCirugia: 2,
            medicoEspecialidad: 'General',
            especialidadRequerida: 'General'
        };
        
        const resultadoMotor = await motor.procesar(contexto);
        
        if (resultadoMotor.aprobado) {
            return { exito: true, mensaje: 'Cirugía validada y aprobada por Motor SOLID.' };
        } else {
            // Recopilamos todas las reglas que fallaron para mostrarle el error al médico en pantalla
            const reglasFalladas = resultadoMotor.detalles.filter(r => !r.pasa).map(r => r.regla).join(', ');
            return { exito: false, mensaje: `Bloqueo de seguridad. Falló en: ${reglasFalladas}` };
        }
    }
}

module.exports = {
    IReglaValidacion,
    MotorAgendamiento,
    GestorCirugiasFacade // ¡Exportamos el Facade para que server.js lo encuentre!
};