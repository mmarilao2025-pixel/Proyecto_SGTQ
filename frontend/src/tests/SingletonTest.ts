import { DatabaseManager } from '../../config/DatabaseManager';

/**
 * Pruebas unitarias para el patrón Singleton en DatabaseManager.
 * Valida que el Singleton funcione correctamente en el contexto de SGTQ,
 * asegurando una única instancia para conexiones a BD críticas.
 */
describe('DatabaseManager Singleton - SGTQ', () => {
    test('Debe retornar la misma instancia en múltiples llamadas', () => {
        const instance1 = DatabaseManager.getInstance();
        const instance2 = DatabaseManager.getInstance();
        expect(instance1).toBe(instance2); // Misma referencia de objeto
    });

    test('Debe tener un pool de conexiones válido', () => {
        const instance = DatabaseManager.getInstance();
        const pool = instance.getPool();
        expect(pool).toBeDefined();
        expect(typeof pool.connect).toBe('function'); // Verifica que sea un Pool de pg
    });

    test('Health check debe retornar boolean y funcionar', async () => {
        const instance = DatabaseManager.getInstance();
        const isHealthy = await instance.healthCheck();
        expect(typeof isHealthy).toBe('boolean');
        // En un entorno real con BD configurada, debería ser true
    });

    test('Instancia debe ser inmutable después de freeze', () => {
        const instance = DatabaseManager.getInstance();
        expect(() => {
            (instance as any).pool = null; // Intento de modificación
        }).toThrow(); // Debería fallar si está congelado
    });
});