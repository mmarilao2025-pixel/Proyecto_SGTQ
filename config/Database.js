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
            });
            
            // Guardamos la instancia para el futuro
            DatabaseSingleton.instance = this;
            console.log("Instancia única de Base de Datos creada");
        }
        
        return DatabaseSingleton.instance;
    }

    // Método para obtener la conexión
    getPool() {
        return this.pool;
    }
}

// Congelamos el objeto para que nadie pueda modificar la instancia
const instance = new DatabaseSingleton();
Object.freeze(instance);

module.exports = instance;
