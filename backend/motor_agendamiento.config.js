// Configuración para el motor de agendamiento SOLID
// Rama: feature/motor-agendamiento-solid

const CONFIG_MOTOR_AGENDAMIENTO = {
    // Umbrales de validación
    umbrales: {
        camas_uci_minimas: 3,
        insumos_minimos: 15,
        horas_turno_maximas: 12,
        duracion_cirugia_maxima: 8,
        tiempo_recuperacion_minimo: 30, // días
        edad_paciente_minima: 0, // años
        edad_paciente_maxima: 120 // años
    },

    // Severidades por defecto para reglas
    severidades: {
        CRITICA: ['paciente_apto', 'fatiga_medica', 'camas_disponibles', 'compatibilidad_sanguinea', 'alergias_paciente'],
        ALTA: ['insumos_criticos', 'tiempo_cirugia', 'especialidad_medico', 'interacciones_medicamentosas', 'disponibilidad_medico'],
        MEDIA: ['tiempo_recuperacion'],
        BAJA: []
    },

    // Prioridades por defecto (1-5, siendo 5 la máxima)
    prioridades: {
        paciente_apto: 5,
        fatiga_medica: 5,
        camas_disponibles: 5,
        compatibilidad_sanguinea: 5,
        alergias_paciente: 5,
        insumos_criticos: 4,
        tiempo_cirugia: 4,
        especialidad_medico: 4,
        interacciones_medicamentosas: 4,
        disponibilidad_medico: 3,
        tiempo_recuperacion: 3
    },

    // Interacciones medicamentosas peligrosas
    interacciones_medicamentosas: [
        ['warfarina', 'antibiotico'],
        ['warfarina', 'aspirina'],
        ['digoxina', 'diuretico'],
        ['digoxina', 'quinidina'],
        ['litio', 'diuretico'],
        ['teofilina', 'cimetidina']
    ],

    // Configuración de logging
    logging: {
        habilitado: true,
        nivel: 'INFO', // DEBUG, INFO, WARN, ERROR
        incluir_detalles_reglas: true,
        incluir_metricas_rendimiento: false
    },

    // Validaciones adicionales
    validaciones_extra: {
        validar_edad_paciente: true,
        validar_peso_paciente: false,
        validar_grupo_sanguineo: true,
        validar_alergias_conocidas: true
    }
};

// Función para obtener configuración
function obtenerConfiguracion() {
    return CONFIG_MOTOR_AGENDAMIENTO;
}

// Función para actualizar umbrales
function actualizarUmbrales(nuevosUmbrales) {
    CONFIG_MOTOR_AGENDAMIENTO.umbrales = {
        ...CONFIG_MOTOR_AGENDAMIENTO.umbrales,
        ...nuevosUmbrales
    };
    console.log('📝 Umbrales actualizados:', nuevosUmbrales);
}

// Función para validar configuración
function validarConfiguracion() {
    const config = CONFIG_MOTOR_AGENDAMIENTO;

    // Validar umbrales
    if (config.umbrales.camas_uci_minimas < 0) {
        throw new Error('Umbral de camas UCI no puede ser negativo');
    }

    if (config.umbrales.horas_turno_maximas > 24) {
        throw new Error('Horas de turno máximo no puede exceder 24 horas');
    }

    // Validar que todas las reglas tengan prioridad
    const reglasSinPrioridad = Object.keys(config.prioridades).filter(regla =>
        !config.prioridades[regla] || config.prioridades[regla] < 1 || config.prioridades[regla] > 5
    );

    if (reglasSinPrioridad.length > 0) {
        throw new Error(`Reglas sin prioridad válida: ${reglasSinPrioridad.join(', ')}`);
    }

    console.log('✅ Configuración validada correctamente');
    return true;
}

module.exports = {
    CONFIG_MOTOR_AGENDAMIENTO,
    obtenerConfiguracion,
    actualizarUmbrales,
    validarConfiguracion
};