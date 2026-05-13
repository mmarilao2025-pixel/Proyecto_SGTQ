const { Pool } = require('pg');
require('dotenv').config();

class DatabaseSingleton {
    constructor() {
        // Si la instancia ya existe, no creamos una nueva
        if (!DatabaseSingleton.instance) {
            this.pool = new Pool({
                user: process.env.DB_USER,
                host: process.env.DB_HOST,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: process.env.DB_PORT,
                max: 20, // Máximo de conexiones para manejar concurrencia en agendamiento
                idleTimeoutMillis: 30000, // Timeout para conexiones inactivas
                connectionTimeoutMillis: 2000, // Timeout para nuevas conexiones
            });

            // Manejo de eventos para logging y monitoreo
            this.pool.on('connect', (client) => {
                console.log('Nueva conexión a la base de datos establecida - Singleton activo');
            });

            this.pool.on('error', (err, client) => {
                console.error('Error en el pool de conexiones del Singleton:', err);
            });

            // Guardamos la instancia para el futuro
            DatabaseSingleton.instance = this;
            console.log("Instancia única de Base de Datos creada con configuración avanzada");
        }

        return DatabaseSingleton.instance;
    }

    // Método para obtener la conexión
    getPool() {
        return this.pool;
    }

    // Método para cerrar el pool de forma segura (útil para shutdown del sistema)
    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('Pool de conexiones del Singleton cerrado');
        }
    }

    // Método para verificar la salud de la conexión (crítico para validaciones en tiempo real)
    async healthCheck() {
        try {
            const client = await this.pool.connect();
            await client.query('SELECT 1'); // Query simple para probar conexión
            client.release();
            return true;
        } catch (error) {
            console.error('Error en health check del Singleton:', error);
            return false;
        }
    }
}

// Congelamos el objeto para que nadie pueda modificar la instancia (seguridad adicional)
const instance = new DatabaseSingleton();
Object.freeze(instance);

module.exports = instance;
