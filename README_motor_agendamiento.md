# Rama: feature/motor-agendamiento-solid

## 📋 Descripción

Esta rama implementa el **Motor de Agendamiento** siguiendo estrictamente los principios **SOLID** para el sistema SGTQ (Sistema de Gestión de Turnos Quirúrgicos).

## 🎯 Objetivos

- ✅ **SRP (Single Responsibility)**: Cada regla tiene una responsabilidad única
- ✅ **OCP (Open/Closed)**: Motor abierto a nuevas reglas, cerrado a modificación
- ✅ **LSP (Liskov Substitution)**: Reglas intercambiables por la interfaz
- ✅ **ISP (Interface Segregation)**: Interfaz específica para validación
- ✅ **DIP (Dependency Inversion)**: Dependencias de abstracciones

## 📁 Archivos de la Rama

### Core Files
- **`motor_agendamiento.js`** - Motor principal con reglas y lógica de validación
- **`motor_agendamiento.config.js`** - Configuración de umbrales y parámetros

## 🏗️ Arquitectura

### Interfaz IReglaValidacion
```javascript
class IReglaValidacion {
    validar(contexto)     // Lógica de validación
    getNombre()          // Nombre descriptivo
    getPrioridad()       // Prioridad 1-5 (5 = máxima)
    getSeveridad()       // CRITICA, ALTA, MEDIA, BAJA
}
```

### Reglas Implementadas (11 reglas)

#### 🔴 Críticas (Prioridad 5)
- **ReglaPacienteApto** - Paciente médicamente apto
- **ReglaFatigaMedica** - Médico sin fatiga (>12h turno)
- **ReglaCamasDisponibles** - Camas UCI disponibles
- **ReglaCompatibilidadSanguinea** - Compatibilidad sanguínea
- **ReglaAlergiasPaciente** - Sin alergias a medicamentos

#### 🟠 Alta (Prioridad 4)
- **ReglaInsumosCriticos** - Insumos suficientes
- **ReglaTiempoCirugia** - Cirugía ≤8 horas
- **ReglaEspecialidadMedico** - Médico con especialidad requerida
- **ReglaInteraccionesMedicamentosas** - Sin interacciones peligrosas

#### 🟡 Media (Prioridad 3)
- **ReglaDisponibilidadMedico** - Médico disponible
- **ReglaTiempoRecuperacion** - Tiempo de recuperación adecuado

## 🚀 Uso Básico

### Crear Motor
```javascript
const { MotorAgendamiento } = require('./motor_agendamiento');
const motor = new MotorAgendamiento();
```

### Procesar Validación
```javascript
const contexto = {
    pacienteApto: true,
    medicoDisponible: true,
    camasUCI: 5,
    insumos: 20,
    horasTrabajadasMedico: 8,
    // ... otros campos
};

const resultado = motor.procesar(contexto);
console.log('Aprobado:', resultado.aprobado);
console.log('Reglas críticas fallidas:', resultado.reglasCriticasFallidas);
```

### Usar Fábrica de Reglas
```javascript
const { FabricaReglas } = require('./motor_agendamiento');
const regla = FabricaReglas.crearRegla('paciente_apto');
```

## ⚙️ Configuración

### Archivo: motor_agendamiento.config.js
```javascript
const config = obtenerConfiguracion();

// Umbrales personalizables
config.umbrales.horas_turno_maximas = 10; // Cambiar límite de horas

// Interacciones medicamentosas
config.interacciones_medicamentosas.push(['nuevo_med1', 'nuevo_med2']);
```

## 📊 Métricas y Reportes

El motor proporciona métricas detalladas:
- **reglasEvaluadas**: Total de reglas procesadas
- **reglasFallidas**: Número de reglas que fallaron
- **reglasCriticasFallidas**: Reglas críticas que fallaron
- **reglasPorSeveridad**: Conteo por nivel de severidad

## 🔧 Extensibilidad

### Agregar Nueva Regla
1. Crear clase que extienda `IReglaValidacion`
2. Implementar métodos requeridos
3. Agregar a fábrica `FabricaReglas.crearRegla()`
4. Actualizar configuración si es necesario

### Ejemplo Nueva Regla
```javascript
class ReglaNueva extends IReglaValidacion {
    validar(ctx) {
        return ctx.nuevoCampo > umbral;
    }

    getNombre() {
        return "Nueva Regla Médica";
    }

    getPrioridad() { return 3; }
    getSeveridad() { return 'MEDIA'; }
}
```

## 🛡️ Validaciones de Seguridad

- ✅ **Contexto requerido**: Valida campos obligatorios
- ✅ **Tipos de datos**: Validación de tipos de entrada
- ✅ **Límites seguros**: Umbrales médicos realistas
- ✅ **Interacciones peligrosas**: Base de datos de interacciones medicamentosas

## 📈 Rendimiento

- **Ordenamiento inteligente**: Reglas críticas primero
- **Validación temprana**: Falla rápida en errores críticos
- **Memoria eficiente**: Instancias compartidas de reglas
- **Logging opcional**: Configurable para producción

## 🔗 Integración con Otras Ramas

Esta rama se integra con:
- **feature/patron-estructural-facade**: Proporciona motor al facade
- **feature/api-simuladas-externas**: Usa datos de APIs simuladas
- **feature/patron-comportamiento-observador**: Notifica eventos de validación


