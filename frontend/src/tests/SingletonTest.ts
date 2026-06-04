const Database = require('../../../shared/config/Database');

describe('Database Singleton - SGTQ', () => {
    test('Debe retornar la misma instancia en múltiples imports (Singleton)', () => {
        const instance1 = require('../../../shared/config/Database');
        const instance2 = require('../../../shared/config/Database');
        // Node.js cachea módulos, garantizando instancia única
        expect(instance1).toBe(instance2);
    });

    test('Debe tener un pool de conexiones válido', () => {
        const pool = Database.getPool();
        expect(pool).toBeDefined();
        expect(typeof pool.connect).toBe('function');
    });

    test('La instancia debe tener método query', () => {
        expect(typeof Database.query).toBe('function');
    });

    test('La instancia debe estar congelada (inmutable)', () => {
        expect(() => {
            (Database as any).pool = null;
        }).toThrow();
    });
});
