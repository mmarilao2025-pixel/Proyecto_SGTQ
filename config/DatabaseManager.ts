import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Patrón Singleton para la gestión de la conexión a la base de datos PostgreSQL.
 * Garantiza una única instancia thread-safe, optimizada para el sistema SGTQ de agendamiento quirúrgico.
 * Maneja concurrencia, reconexiones y monitoreo para evitar fallos en validaciones críticas.
 */
export class DatabaseManager {
    private static instance: DatabaseManager;
    private pool: Pool;

    private constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT || '5432'),
            max: 20, // Límite para manejar múltiples validaciones simultáneas
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Eventos para logging y debugging en producción
        this.pool.on('connect', (client) => {
            console.log('Conexión Singleton a BD establecida - Sistema SGTQ operativo');
        });

        this.pool.on('error', (err, client) => {
            console.error('Error en pool Singleton:', err);
        });

        console.log("Singleton DatabaseManager inicializado para SGTQ");
    }

    /**
     * Obtiene la instancia única del DatabaseManager.
     * Thread-safe: Múltiples llamadas retornan la misma instancia.
     */
    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    /**
     * Retorna el pool de conexiones para operaciones de BD.
     */
    public getPool(): Pool {
        return this.pool;
    }

    /**
     * Cierra el pool de conexiones de forma segura.
     * Útil para shutdown del sistema o mantenimiento.
     */
    public async close(): Promise<void> {
        await this.pool.end();
        console.log('Pool Singleton cerrado');
    }

    /**
     * Verifica la salud de la conexión a BD.
     * Crítico para validar disponibilidad antes de agendamientos.
     */
    public async healthCheck(): Promise<boolean> {
        try {
            const client = await this.pool.connect();
            await client.query('SELECT 1');
            client.release();
            return true;
        } catch (error) {
            console.error('Health check fallido en Singleton:', error);
            return false;
        }
    }
}

// Exportar la instancia singleton para uso en módulos TS
export const databaseManager = DatabaseManager.getInstance();