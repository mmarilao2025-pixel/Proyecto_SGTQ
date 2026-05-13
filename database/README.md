# Rama: feature/bd-postgres-transacciones

## Descripción
Implementación de transacciones ACID en PostgreSQL para el sistema SGTQ. Garantiza atomicidad, consistencia, aislamiento y durabilidad en operaciones críticas de agendamiento quirúrgico.

## Requerimientos Cumplidos
- **Atomicidad**: Todas las operaciones de agendamiento son atómicas (BEGIN/COMMIT/ROLLBACK).
- **Consistencia**: Validaciones de integridad referencial y constraints de negocio.
- **Aislamiento**: Locking (SELECT FOR UPDATE) para prevenir condiciones de carrera.
- **Durabilidad**: Cambios persistentes en BD.

## Archivos Implementados

### Migraciones
- `database/migrations/001_initial_schema.sql`: Esquema completo con tablas, constraints e índices.

### Servicios Transaccionales
- `database/services/TransactionService.ts`: Abstracción para ejecutar transacciones genéricas.
- `database/services/FatigueTransactionService.ts`: Manejo transaccional de fatiga médica.
- `database/services/CirugiaTransactionService.js`: Agendamiento completo con validaciones.

### Inicialización
- `database/db-init.js`: Script para crear BD y poblar datos de prueba.

### Pruebas
- `src/tests/TransactionTests.js`: Validación de atomicidad y manejo de errores.

## Uso
```javascript
// Agendar cirugía con validaciones completas
const result = await cirugiaTransactionService.agendarCirugiaCompleta(
    '12345678-9', 1, 1, 1, 'Cirugía General', '2024-01-01 10:00', '2024-01-01 12:00', true, 2
);
```

## Integración con Otras Ramas
- Compatible con Singleton de `feature/patron-creacional-singleton`.
- Proporciona servicios para Facade en `feature/patron-estructural-facade`.
- Soporta validaciones de APIs externas en `feature/api-simuladas-externas`.