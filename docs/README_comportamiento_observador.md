# Rama: feature/patron-comportamiento-observador

## 📋 Descripción

Esta rama implementa el **Patrón Observer** para el sistema SGTQ (Sistema de Gestión de Turnos Quirúrgicos). El patrón Observer permite la comunicación desacoplada entre diferentes componentes del sistema, facilitando notificaciones en tiempo real sobre eventos quirúrgicos críticos.

## 🎯 Objetivos

- ✅ **Desacoplamiento**: Los observadores no conocen al sujeto que los notifica
- ✅ **Notificaciones en tiempo real**: Eventos quirúrgicos propagados instantáneamente
- ✅ **Extensibilidad**: Nuevos observadores sin modificar código existente
- ✅ **Auditoría completa**: Historial de todos los eventos del sistema
- ✅ **Manejo de emergencias**: Alertas críticas automáticas

## 📁 Archivos de la Rama

### Core Files
- **`comportamiento_observador.js`** - Implementación completa del patrón Observer
- **`comportamiento_observador.config.js`** - Configuración del sistema de eventos

### Archivos Auxiliares
- **`README_comportamiento_observador.md`** - Esta documentación

## 🏗️ Arquitectura del Patrón Observer

### Componentes Principales

#### 1. Interfaz IObserver
```javascript
interface IObserver {
    actualizar(evento: string, datos: any): void
    getNombre(): string
}
```

#### 2. Subject (GestorEventosQuirurgicos)
- **Gestión de suscripciones**: Mapa de eventos → lista de observadores
- **Notificación de eventos**: Propagación a observadores suscritos
- **Historial de eventos**: Auditoría completa del sistema
- **Manejo de errores**: Resistente a fallos de observadores individuales

#### 3. Observadores Concretos
- **ObservadorAdmision**: Gestiona llegada y admisión de pacientes
- **ObservadorPabellon**: Coordina equipo quirúrgico y recursos
- **ObservadorInventario**: Controla niveles de insumos y medicamentos
- **ObservadorRecuperacion**: Gestiona camas UCI y recuperación
- **ObservadorEmergencias**: Maneja situaciones críticas y alertas
- **ObservadorBaseDatos**: Registra todos los eventos para auditoría

## 🚀 Uso Básico

### Inicialización del Sistema
```javascript
const { GestorEventosSingleton } = require('./comportamiento_observador');
const gestor = GestorEventosSingleton.obtenerInstancia();
```

### Notificar Eventos
```javascript
const { notificarEvento } = require('./comportamiento_observador');

// Notificar cirugía aprobada
notificarEvento('cirugia_aprobada', {
    pacienteId: 123,
    medicoId: 456,
    tipoCirugia: 'Cirugía Cardíaca',
    requiereUci: true
});

// Notificar emergencia médica
notificarEvento('emergencia_medica', {
    pacienteId: 123,
    descripcion: 'Paro cardíaco',
    prioridad: 'CRITICA'
});
```

### Suscribir Observadores Personalizados
```javascript
const { suscribirObservador } = require('./comportamiento_observador');

class MiObservadorPersonalizado {
    actualizar(evento, datos) {
        console.log(`Evento personalizado: ${evento}`, datos);
    }
    getNombre() {
        return 'MiObservadorPersonalizado';
    }
}

suscribirObservador('cirugia_aprobada', new MiObservadorPersonalizado());
```

## 📊 Tipos de Eventos

### Eventos Quirúrgicos
- **`cirugia_aprobada`** - Cirugía validada y programada
- **`cirugia_rechazada`** - Cirugía no cumple requisitos
- **`cirugia_cancelada`** - Cirugía cancelada después de aprobación
- **`cirugia_completada`** - Cirugía finalizada exitosamente

### Eventos de Pacientes
- **`paciente_llegada`** - Paciente llega al hospital
- **`paciente_recuperado`** - Paciente dado de alta de recuperación

### Eventos de Emergencia
- **`emergencia_medica`** - Situación médica crítica
- **`sistema_caido`** - Fallo en componentes del sistema

### Eventos de Inventario
- **`insumo_bajo`** - Insumo por debajo del umbral
- **`insumo_agotado`** - Insumo completamente agotado
- **`equipo_listo`** - Equipo quirúrgico preparado

## ⚙️ Configuración

### Archivo: comportamiento_observador.config.js
```javascript
const config = obtenerConfiguracion();

// Eventos habilitados
config.eventos.habilitados.push('mi_evento_personalizado');

// Configuración de observadores
config.observadores.configuracion.ObservadorEmergencias = {
    tiempo_respuesta_maximo: 15000, // 15 segundos
    auto_escalada: true
};
```

### Configuración en Runtime
```javascript
const { actualizarConfiguracion } = require('./comportamiento_observador.config');

actualizarConfiguracion({
    logging: {
        nivel: 'DEBUG',
        incluir_datos_evento: true
    }
});
```

## 📈 Características Avanzadas

### Historial y Auditoría
- **Registro completo**: Todos los eventos con timestamp
- **Estadísticas en tiempo real**: Conteos por tipo de evento
- **Limpieza automática**: Mantenimiento del historial
- **IDs únicos**: Rastreo de eventos individuales

### Manejo de Errores
- **Aislamiento**: Error en un observador no afecta otros
- **Logging**: Registro de errores para debugging
- **Continuidad**: Sistema sigue funcionando tras errores

### Rendimiento
- **Procesamiento asíncrono**: Notificaciones no bloqueantes
- **Timeouts configurables**: Prevención de cuelgues
- **Limpieza de memoria**: Gestión automática de recursos

## 🔗 Integración con Otras Ramas

Esta rama se integra con:
- **feature/motor-agendamiento-solid**: Recibe eventos de validación del motor
- **feature/api-simuladas-externas**: Notifica cambios de estado a sistemas externos
- **feature/estructural-facade**: Proporciona interfaz unificada para eventos

### Ejemplo de Integración
```javascript
// En motor_agendamiento.js
const { notificarEvento } = require('./comportamiento_observador');

if (resultado.aprobado) {
    notificarEvento('cirugia_aprobada', {
        pacienteId,
        medicoId,
        tipoCirugia,
        requiereUci
    });
} else {
    notificarEvento('cirugia_rechazada', {
        pacienteId,
        razon: 'Reglas no cumplidas'
    });
}
```

## 🛡️ Consideraciones de Seguridad

- ✅ **Validación de eventos**: Solo eventos habilitados son procesados
- ✅ **Aislamiento de observadores**: Un observador comprometido no afecta otros
- ✅ **Rate limiting**: Prevención de spam de notificaciones
- ✅ **Auditoría completa**: Trazabilidad de todas las acciones

## 📈 Monitoreo y Métricas

### Estadísticas Disponibles
```javascript
const { obtenerEstadisticasEventos } = require('./comportamiento_observador');
const stats = obtenerEstadisticasEventos();

console.log(`Eventos totales: ${stats.totalEventos}`);
console.log(`Eventos activos: ${stats.eventosActivos}`);
console.log(`Tipos de eventos:`, stats.tiposEventos);
```

### Métricas de Rendimiento
- **Latencia de notificación**: Tiempo promedio de propagación
- **Tasa de errores**: Porcentaje de notificaciones fallidas
- **Uso de memoria**: Historial y observadores activos
