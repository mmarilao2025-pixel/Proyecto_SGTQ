# feature/api-simuladas-externas

## Descripción
Esta rama contiene las **APIs Externas Simuladas** para el SGTQ (Sistema de Gestión de Turnos Quirúrgicos).

Las APIs simuladas permiten:
- Probar la lógica de agendamiento sin conectarse a sistemas reales
- Simular diferentes escenarios (éxito, fallo, casos límite)
- Controlar latencias de red de forma realista
- Facilitar testing y desarrollo en paralelo

## Servicios Incluidos

### 1. **LaboratorioExternoAPI**
- Consulta resultados de análisis preoperatorios
- Devuelve aptitud para cirugía, nivel de sangre, riesgo cardiológico

### 2. **RecursosHumanosExternoAPI**
- Verifica estado y horas acumuladas de médicos
- Detecta riesgo de fatiga
- Informa si el médico está disponible

### 3. **InventarioExternoAPI**
- Consulta niveles de insumos por tipo de cirugía
- Identifica stock crítico
- Bloquea cirugías si no hay insumos

### 4. **PabellonUCIExternoAPI**
- Verifica disponibilidad de camas UCI
- Asigna cama si está disponible
- Consulta total de camas y ocupadas

### 5. **AdmisionExternoAPI**
- Obtiene datos del paciente
- Valida que el paciente exista en el sistema

## Archivos Clave

- **ApiExternasSimuladasExpandidas.ts** - Implementación de todos los servicios
- **ApiSimulationConfig.ts** - Configuración de latencias y comportamientos
- **ApiSimulationMocks.ts** - Datos mock (pacientes, médicos, inventario)
- **ApiSimulationUtils.ts** - Utilidades y flujos de validación completa
- **ApiSimulationExamples.ts** - Ejemplos de uso y escenarios de prueba

## Cómo Usar

### Ejemplo básico - Verificar un insumo
```typescript
import { InventarioExternoAPI } from './ApiExternasSimuladasExpandidas';

const insumo = await InventarioExternoAPI.verificarInsumos('Cirugía Cardíaca');
console.log(insumo.disponible); // true o false
```

### Ejemplo completo - Validación de cirugía
```typescript
import { ejecutarValidacionCompleta } from './ApiSimulationUtils';

const resultado = await ejecutarValidacionCompleta(
  pacienteId: 1,
  medicoId: 2,
  tipoCirugia: 'Cirugía General',
  requiereUCI: false
);
console.log(resultado.exito); // true o false
```

### Ejecutar escenarios de prueba
```bash
npm run build
node dist/ApiSimulationExamples.js
```

## Configuración

Ajusta comportamientos en **ApiSimulationConfig.ts**:

```typescript
export const SIMULATED_BEHAVIORS = {
  ENABLE_RANDOM_FAILURES: false,      // Simula fallos de red
  ENABLE_DETAILED_LOGGING: true,      // Logs detallados
};
```

Modifica latencias:
```typescript
LATENCIES: {
  LABORATORIO: 1500,        // Aumentar/disminuir ms
  RECURSOS_HUMANOS: 800,
  INVENTARIO: 600,
  PABELLON_UCI: 700,
  ADMISION: 500,
}
```

## Integración con Facade

Las APIs simuladas se integran con `SurgeryBookingFacade.ts` de la rama anterior. La fachada llama a estos servicios para validar cirugías.

## Próximos Pasos

- [ ] Conectar con base de datos real (Postgres)
- [ ] Eliminar simulación cuando APIs reales estén disponibles
- [ ] Agregar casos de prueba automatizadas
- [ ] Documentar interacción con equipo de Recursos Humanos y Laboratorio
