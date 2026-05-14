// Configuración para el patrón Observer en SGTQ
// Rama: feature/patron-comportamiento-observador

const CONFIG_OBSERVER = {
    // Configuración de eventos
    eventos: {
        habilitados: [
            'cirugia_aprobada',
            'cirugia_rechazada',
            'cirugia_cancelada',
            'cirugia_completada',
            'paciente_llegada',
            'paciente_recuperado',
            'emergencia_medica',
            'sistema_caido',
            'insumo_bajo',
            'insumo_agotado',
            'equipo_listo'
        ],

        // Eventos críticos que requieren notificación inmediata
        criticos: [
            'emergencia_medica',
            'sistema_caido',
            'insumo_agotado'
        ]
    },

    // Configuración de observadores
    observadores: {
        // Observadores activos por defecto
        por_defecto: {
            cirugia_aprobada: ['ObservadorAdmision', 'ObservadorPabellon', 'ObservadorInventario', 'ObservadorRecuperacion', 'ObservadorBaseDatos'],
            cirugia_rechazada: ['ObservadorAdmision', 'ObservadorEmergencias', 'ObservadorBaseDatos'],
            emergencia_medica: ['ObservadorEmergencias', 'ObservadorBaseDatos'],
            sistema_caido: ['ObservadorEmergencias', 'ObservadorBaseDatos'],
            insumo_bajo: ['ObservadorInventario'],
            insumo_agotado: ['ObservadorInventario', 'ObservadorEmergencias']
        },

        // Configuración específica por observador
        configuracion: {
            ObservadorEmergencias: {
                tiempo_respuesta_maximo: 30000, // 30 segundos
                auto_escalada: true,
                notificaciones_push: true
            },

            ObservadorBaseDatos: {
                retencion_dias: 90,
                compresion_habilitada: true,
                backup_automatico: true
            },

            ObservadorInventario: {
                umbral_critico: 10, // porcentaje
                tiempo_reposicion_estimado: 3600000, // 1 hora en ms
                proveedores_emergencia: ['ProveedorA', 'ProveedorB']
            }
        }
    },

    // Configuración de logging y auditoría
    logging: {
        habilitado: true,
        nivel: 'INFO', // DEBUG, INFO, WARN, ERROR
        incluir_timestamp: true,
        incluir_datos_evento: true,
        max_registros_historial: 1000,
        limpieza_automatica: true,
        intervalo_limpieza: 3600000 // 1 hora
    },

    // Configuración de rendimiento
    rendimiento: {
        procesamiento_asincrono: true,
        timeout_notificacion: 5000, // 5 segundos
        reintentos_fallidos: 3,
        cola_eventos_maxima: 1000,
        limpieza_memoria_automatica: true
    },

    // Configuración de UI (para integración con frontend)
    ui: {
        notificaciones_toast: true,
        sonidos_alertas: true,
        animaciones: true,
        colores_tema: {
            normal: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            critico: '#dc2626'
        }
    }
};

// Función para obtener configuración
function obtenerConfiguracion() {
    return CONFIG_OBSERVER;
}

// Función para actualizar configuración en runtime
function actualizarConfiguracion(nuevaConfig) {
    Object.assign(CONFIG_OBSERVER, nuevaConfig);
    console.log('⚙️ Configuración del patrón Observer actualizada');
    validarConfiguracion();
}

// Función para validar configuración
function validarConfiguracion() {
    const config = CONFIG_OBSERVER;

    // Validar que todos los eventos críticos estén en la lista de eventos habilitados
    const eventosCriticosInvalidos = config.eventos.criticos.filter(
        evento => !config.eventos.habilitados.includes(evento)
    );

    if (eventosCriticosInvalidos.length > 0) {
        throw new Error(`Eventos críticos no habilitados: ${eventosCriticosInvalidos.join(', ')}`);
    }

    // Validar configuración de rendimiento
    if (config.rendimiento.timeout_notificacion < 1000) {
        console.warn('⚠️ Timeout de notificación muy bajo, puede causar problemas de rendimiento');
    }

    if (config.logging.max_registros_historial > 10000) {
        console.warn('⚠️ Máximo de registros de historial muy alto, puede afectar memoria');
    }

    console.log('✅ Configuración del patrón Observer validada correctamente');
    return true;
}

// Función para obtener configuración de un observador específico
function obtenerConfiguracionObservador(nombreObservador) {
    return CONFIG_OBSERVER.observadores.configuracion[nombreObservador] || {};
}

// Función para verificar si un evento está habilitado
function eventoHabilitado(tipoEvento) {
    return CONFIG_OBSERVER.eventos.habilitados.includes(tipoEvento);
}

// Función para verificar si un evento es crítico
function eventoCritico(tipoEvento) {
    return CONFIG_OBSERVER.eventos.criticos.includes(tipoEvento);
}

// Función para obtener observadores por defecto para un evento
function obtenerObservadoresPorDefecto(tipoEvento) {
    return CONFIG_OBSERVER.observadores.por_defecto[tipoEvento] || [];
}

module.exports = {
    CONFIG_OBSERVER,
    obtenerConfiguracion,
    actualizarConfiguracion,
    validarConfiguracion,
    obtenerConfiguracionObservador,
    eventoHabilitado,
    eventoCritico,
    obtenerObservadoresPorDefecto
};