const { Pool } = require('pg');

/**
 * Database.js - Singleton para el pool de conexiones PostgreSQL
 * 
 * Patrón Singleton: garantiza una única instancia del pool en toda la aplicación.
 * Necesario para las transacciones ACID del agendamiento atómico (NFR-3).
 * 
 * Configuración via variables de entorno (.env):
 *   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 */

class Database {
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        this.pool = new Pool({
            host:     process.env.DB_HOST     || 'localhost',
            port:     parseInt(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME     || 'sgtq_db',
            user:     process.env.DB_USER     || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            // Pool settings para concurrencia (NFR-1: 50 solicitudes concurrentes)
            max:              20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        this.pool.on('error', (err) => {
            console.error('Error inesperado en cliente PostgreSQL:', err);
        });

        this.pool.on('connect', () => {
            console.log('✅ Nueva conexión establecida con PostgreSQL');
        });

        Database.instance = this;
        console.log('🗄️  Database Singleton inicializado');
    }

    /**
     * Retorna el pool de conexiones.
     * Usado por cirugiaService.js y db-init.js para transacciones ACID.
     */
    getPool() {
        return this.pool;
    }

    /**
     * Ejecuta una query simple (sin transacción).
     */
    async query(text, params) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            console.log(`Query ejecutada en ${duration}ms`);
            return result;
        } catch (error) {
            console.error('Error en query:', error.message);
            throw error;
        }
    }

    /**
     * Cierra el pool de conexiones al apagar el servidor.
     */
    async close() {
        await this.pool.end();
        console.log('🔌 Pool de conexiones cerrado');
    }
}

// Exportar instancia única (Singleton)
module.exports = new Database();
