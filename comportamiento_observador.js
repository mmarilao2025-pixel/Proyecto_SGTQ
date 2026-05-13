// Patrón Observer para Sistema de Gestión de Turnos Quirúrgicos (SGTQ)
// Implementación completa del patrón Observer con observadores especializados

// Interfaz del Observer
class IObserver {
    actualizar(evento, datos) {
        throw new Error("Método actualizar no implementado");
    }

    getNombre() {
        throw new Error("Método getNombre no implementado");
    }
}

// Subject (Observable) - Gestor de Eventos Quirúrgicos
class GestorEventosQuirurgicos {
    constructor() {
        this.observadores = new Map(); // Mapa de tipo de evento -> lista de observadores
        this.historialEventos = [];
        this.eventosActivos = new Set();
    }

    // Suscribir observador a un tipo específico de evento
    suscribir(tipoEvento, observador) {
        if (!this.observadores.has(tipoEvento)) {
            this.observadores.set(tipoEvento, []);
        }
        this.observadores.get(tipoEvento).push(observador);
        console.log(`✅ Observador ${observador.getNombre()} suscrito al evento: ${tipoEvento}`);
    }

    // Desuscribir observador de un tipo de evento
    desuscribir(tipoEvento, observador) {
        if (this.observadores.has(tipoEvento)) {
            const lista = this.observadores.get(tipoEvento);
            const indice = lista.indexOf(observador);
            if (indice > -1) {
                lista.splice(indice, 1);
                console.log(`❌ Observador ${observador.getNombre()} desuscrito del evento: ${tipoEvento}`);
            }
        }
    }

    // Notificar a todos los observadores de un tipo de evento
    notificar(tipoEvento, datos) {
        const evento = {
            tipo: tipoEvento,
            datos: datos,
            timestamp: new Date().toISOString(),
            id: this.generarIdEvento()
        };

        // Registrar en historial
        this.historialEventos.push(evento);
        this.eventosActivos.add(evento.id);

        // Notificar observadores
        if (this.observadores.has(tipoEvento)) {
            const observadores = this.observadores.get(tipoEvento);
            observadores.forEach(observador => {
                try {
                    observador.actualizar(tipoEvento, datos);
                } catch (error) {
                    console.error(`❌ Error notificando a ${observador.getNombre()}:`, error);
                }
            });
        }

        console.log(`📢 Evento notificado: ${tipoEvento} (ID: ${evento.id})`);
    }

    // Marcar evento como procesado
    marcarEventoProcesado(idEvento) {
        this.eventosActivos.delete(idEvento);
    }

    // Generar ID único para evento
    generarIdEvento() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Obtener estadísticas de eventos
    obtenerEstadisticas() {
        const tiposEventos = {};
        this.historialEventos.forEach(evento => {
            tiposEventos[evento.tipo] = (tiposEventos[evento.tipo] || 0) + 1;
        });

        return {
            totalEventos: this.historialEventos.length,
            eventosActivos: this.eventosActivos.size,
            tiposEventos: tiposEventos,
            ultimoEvento: this.historialEventos[this.historialEventos.length - 1]
        };
    }

    // Limpiar historial antiguo (mantener últimos N eventos)
    limpiarHistorial(maxEventos = 1000) {
        if (this.historialEventos.length > maxEventos) {
            const eventosRemovidos = this.historialEventos.splice(0, this.historialEventos.length - maxEventos);
            console.log(`🧹 Limpiados ${eventosRemovidos.length} eventos antiguos del historial`);
        }
    }
}

// Observadores Especializados para el Dominio Médico

// Observador de Admisión
class ObservadorAdmision extends IObserver {
    constructor() {
        super();
        this.pacientesAdmitidos = new Set();
    }

    actualizar(evento, datos) {
        switch (evento) {
            case 'cirugia_aprobada':
                console.log(`🏥 [ADMISIÓN] Paciente ${datos.pacienteId} aprobado para cirugía. Preparando admisión.`);
                this.pacientesAdmitidos.add(datos.pacienteId);
                this._prepararAdmision(datos);
                break;

            case 'cirugia_rechazada':
                console.log(`🏥 [ADMISIÓN] Cirugía rechazada para paciente ${datos.pacienteId}. Razón: ${datos.razon}`);
                this._notificarPaciente(datos);
                break;

            case 'paciente_llegada':
                console.log(`🏥 [ADMISIÓN] Paciente ${datos.pacienteId} ha llegado al hospital.`);
                break;
        }
    }

    getNombre() {
        return "ObservadorAdmisión";
    }

    _prepararAdmision(datos) {
        // Lógica específica de admisión
        console.log(`📋 Preparando documentos de admisión para paciente ${datos.pacienteId}`);
    }

    _notificarPaciente(datos) {
        // Lógica para notificar al paciente sobre el rechazo
        console.log(`📞 Notificando paciente ${datos.pacienteId} sobre el rechazo`);
    }
}

// Observador de Pabellón Quirúrgico
class ObservadorPabellon extends IObserver {
    constructor() {
        super();
        this.cirugiasProgramadas = new Map();
    }

    actualizar(evento, datos) {
        switch (evento) {
            case 'cirugia_aprobada':
                console.log(`🏥 [PABELLÓN] Cirugía programada para médico ${datos.medicoId}. Preparando equipo quirúrgico.`);
                this.cirugiasProgramadas.set(datos.pacienteId, {
                    ...datos,
                    estado: 'programada',
                    timestamp: new Date()
                });
                this._prepararEquipo(datos);
                break;

            case 'cirugia_cancelada':
                console.log(`🏥 [PABELLÓN] Cirugía cancelada. Liberando recursos del pabellón.`);
                this.cirugiasProgramadas.delete(datos.pacienteId);
                this._liberarRecursos(datos);
                break;

            case 'equipo_listo':
                console.log(`🏥 [PABELLÓN] Equipo quirúrgico listo para paciente ${datos.pacienteId}`);
                break;
        }
    }

    getNombre() {
        return "ObservadorPabellon";
    }

    _prepararEquipo(datos) {
        console.log(`🔧 Preparando equipo quirúrgico para cirugía: ${datos.tipoCirugia}`);
    }

    _liberarRecursos(datos) {
        console.log(`🆓 Liberando recursos del pabellón para paciente ${datos.pacienteId}`);
    }
}

// Observador de Inventario
class ObservadorInventario extends IObserver {
    constructor() {
        super();
        this.nivelesCriticos = new Map();
    }

    actualizar(evento, datos) {
        switch (evento) {
            case 'cirugia_aprobada':
                console.log(`📦 [INVENTARIO] Cirugía ${datos.tipoCirugia} aprobada. Verificando y reservando insumos.`);
                this._verificarInsumos(datos);
                this._reservarInsumos(datos);
                break;

            case 'insumo_bajo':
                console.log(`⚠️ [INVENTARIO] ALERTA: Insumo ${datos.insumo} está por debajo del nivel crítico (${datos.nivel}%)`);
                this.nivelesCriticos.set(datos.insumo, datos.nivel);
                this._solicitarReposicion(datos);
                break;

            case 'insumo_agotado':
                console.log(`🚨 [INVENTARIO] EMERGENCIA: Insumo ${datos.insumo} AGOTADO!`);
                this._bloquearCirugias(datos);
                break;
        }
    }

    getNombre() {
        return "ObservadorInventario";
    }

    _verificarInsumos(datos) {
        console.log(`🔍 Verificando niveles de insumos para: ${datos.tipoCirugia}`);
    }

    _reservarInsumos(datos) {
        console.log(`📋 Reservando insumos para paciente ${datos.pacienteId}`);
    }

    _solicitarReposicion(datos) {
        console.log(`📞 Solicitando reposición urgente de: ${datos.insumo}`);
    }

    _bloquearCirugias(datos) {
        console.log(`🚫 Bloqueando cirugías que requieren: ${datos.insumo}`);
    }
}

// Observador de Recuperación/UCI
class ObservadorRecuperacion extends IObserver {
    constructor() {
        super();
        this.camasReservadas = new Map();
    }

    actualizar(evento, datos) {
        switch (evento) {
            case 'cirugia_aprobada':
                if (datos.requiereUci) {
                    console.log(`🏥 [RECUPERACIÓN] Cirugía requiere UCI. Reservando cama para paciente ${datos.pacienteId}.`);
                    this.camasReservadas.set(datos.pacienteId, {
                        tipo: 'UCI',
                        reservada: true,
                        timestamp: new Date()
                    });
                    this._prepararCamaUCI(datos);
                }
                break;

            case 'cirugia_completada':
                console.log(`🏥 [RECUPERACIÓN] Cirugía completada. Monitoreando recuperación de paciente ${datos.pacienteId}.`);
                this._iniciarMonitoreo(datos);
                break;

            case 'paciente_recuperado':
                console.log(`✅ [RECUPERACIÓN] Paciente ${datos.pacienteId} recuperado. Liberando cama.`);
                this.camasReservadas.delete(datos.pacienteId);
                this._liberarCama(datos);
                break;
        }
    }

    getNombre() {
        return "ObservadorRecuperacion";
    }

    _prepararCamaUCI(datos) {
        console.log(`🛏️ Preparando cama UCI para paciente ${datos.pacienteId}`);
    }

    _iniciarMonitoreo(datos) {
        console.log(`📊 Iniciando monitoreo post-operatorio para paciente ${datos.pacienteId}`);
    }

    _liberarCama(datos) {
        console.log(`🆓 Liberando cama para paciente ${datos.pacienteId}`);
    }
}

// Observador de Emergencias
class ObservadorEmergencias extends IObserver {
    constructor() {
        super();
        this.alertasActivas = new Set();
    }

    actualizar(evento, datos) {
        switch (evento) {
            case 'emergencia_medica':
                console.log(`🚨 [EMERGENCIAS] ALERTA MÉDICA: ${datos.descripcion} - Paciente ${datos.pacienteId}`);
                this.alertasActivas.add(`emergencia_${datos.pacienteId}`);
                this._activarProtocoloEmergencia(datos);
                break;

            case 'cirugia_rechazada':
                if (datos.razon.includes('camas') || datos.razon.includes('fatiga')) {
                    console.log(`🚨 [EMERGENCIAS] ALERTA CRÍTICA: ${datos.razon} - Paciente ${datos.pacienteId}`);
                    this.alertasActivas.add(`critica_${datos.pacienteId}`);
                    this._notificarEquipoEmergencia(datos);
                }
                break;

            case 'sistema_caido':
                console.log(`🚨 [EMERGENCIAS] SISTEMA CAÍDO: ${datos.componente} - ${datos.descripcion}`);
                this._iniciarProtocoloRecuperacion(datos);
                break;
        }
    }

    getNombre() {
        return "ObservadorEmergencias";
    }

    _activarProtocoloEmergencia(datos) {
        console.log(`🚨 Activando protocolo de emergencia para paciente ${datos.pacienteId}`);
    }

    _notificarEquipoEmergencia(datos) {
        console.log(`📢 Notificando equipo de emergencias sobre situación crítica`);
    }

    _iniciarProtocoloRecuperacion(datos) {
        console.log(`🔧 Iniciando protocolo de recuperación del sistema`);
    }
}

// Observador de Base de Datos (Auditoría)
class ObservadorBaseDatos extends IObserver {
    constructor() {
        super();
        this.eventosRegistrados = [];
    }

    actualizar(evento, datos) {
        const registro = {
            id: `log_${Date.now()}`,
            evento: evento,
            datos: { ...datos },
            timestamp: new Date().toISOString(),
            severidad: this._determinarSeveridad(evento)
        };

        this.eventosRegistrados.push(registro);

        // Simular guardado en BD
        console.log(`💾 [BASE DE DATOS] Evento registrado: ${evento} (ID: ${registro.id})`);

        // Mantener solo últimos 100 registros
        if (this.eventosRegistrados.length > 100) {
            this.eventosRegistrados.shift();
        }
    }

    getNombre() {
        return "ObservadorBaseDatos";
    }

    _determinarSeveridad(evento) {
        const severidades = {
            'emergencia_medica': 'CRITICA',
            'sistema_caido': 'CRITICA',
            'cirugia_rechazada': 'ALTA',
            'cirugia_aprobada': 'MEDIA',
            'paciente_llegada': 'BAJA'
        };
        return severidades[evento] || 'BAJA';
    }

    obtenerHistorial() {
        return this.eventosRegistrados;
    }
}

// Singleton para el Gestor de Eventos
class GestorEventosSingleton {
    static instancia = null;

    static obtenerInstancia() {
        if (!GestorEventosSingleton.instancia) {
            GestorEventosSingleton.instancia = new GestorEventosQuirurgicos();

            // Suscribir observadores por defecto
            const gestor = GestorEventosSingleton.instancia;
            gestor.suscribir('cirugia_aprobada', new ObservadorAdmision());
            gestor.suscribir('cirugia_aprobada', new ObservadorPabellon());
            gestor.suscribir('cirugia_aprobada', new ObservadorInventario());
            gestor.suscribir('cirugia_aprobada', new ObservadorRecuperacion());
            gestor.suscribir('cirugia_rechazada', new ObservadorEmergencias());
            gestor.suscribir('emergencia_medica', new ObservadorEmergencias());
            gestor.suscribir('sistema_caido', new ObservadorEmergencias());

            // Suscribir observador de BD a todos los eventos
            const observadorBD = new ObservadorBaseDatos();
            gestor.suscribir('cirugia_aprobada', observadorBD);
            gestor.suscribir('cirugia_rechazada', observadorBD);
            gestor.suscribir('emergencia_medica', observadorBD);
            gestor.suscribir('sistema_caido', observadorBD);

            console.log('🎯 Gestor de Eventos Quirúrgicos inicializado con observadores por defecto');
        }
        return GestorEventosSingleton.instancia;
    }
}

// Funciones de utilidad para integración
function notificarEvento(tipoEvento, datos) {
    const gestor = GestorEventosSingleton.obtenerInstancia();
    gestor.notificar(tipoEvento, datos);
}

function suscribirObservador(tipoEvento, observador) {
    const gestor = GestorEventosSingleton.obtenerInstancia();
    gestor.suscribir(tipoEvento, observador);
}

function obtenerEstadisticasEventos() {
    const gestor = GestorEventosSingleton.obtenerInstancia();
    return gestor.obtenerEstadisticas();
}

// Exportar clases y funciones
module.exports = {
    IObserver,
    GestorEventosQuirurgicos,
    ObservadorAdmision,
    ObservadorPabellon,
    ObservadorInventario,
    ObservadorRecuperacion,
    ObservadorEmergencias,
    ObservadorBaseDatos,
    GestorEventosSingleton,
    notificarEvento,
    suscribirObservador,
    obtenerEstadisticasEventos
};