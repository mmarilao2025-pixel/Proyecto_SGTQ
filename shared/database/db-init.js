const fs = require("fs");
const path = require("path");
const db = require("../config/Database");

/**
 * Script de inicialización de base de datos para SGTQ.
 * Ejecuta migraciones y pobla datos iniciales de forma transaccional.
 */
async function initializeDatabase() {
  const pool = db.getPool();
  const client = await pool.connect();

  try {
    console.log("Iniciando inicialización de BD para SGTQ...");

    // Ejecutar migración inicial
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "001_initial_schema.sql",
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    await client.query("BEGIN");
    console.log("Ejecutando migración inicial...");

    await client.query(migrationSQL);

    await client.query("COMMIT");
    console.log("Migración completada exitosamente.");

    // Insertar datos de prueba (opcional)
    await insertTestData(client);

    console.log("Base de datos inicializada correctamente para SGTQ.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en inicialización de BD:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Inserta datos de prueba para desarrollo.
 */
async function insertTestData(client) {
  try {
    console.log("Insertando datos de prueba...");

    // Pacientes de prueba
    await client.query(`
            INSERT INTO Pacientes (rut, nombre, fecha_nacimiento, telefono, email) VALUES
            ('12345678-9', 'Juan Pérez', '1980-05-15', '+56912345678', 'juan@email.com'),
            ('87654321-0', 'María González', '1975-03-20', '+56987654321', 'maria@email.com')
            ON CONFLICT (rut) DO NOTHING
        `);

    // Médicos de prueba
    await client.query(`
            INSERT INTO Medicos (nombre, especialidad, horas_semanales_acumuladas) VALUES
            ('Dr. Carlos Ruiz', 'Cirugía General', 20),
            ('Dra. Ana López', 'Cardiología', 35)
            ON CONFLICT DO NOTHING
        `);

    // Pabellones de prueba
    await client.query(`
            INSERT INTO Pabellones (nombre, tipo, capacidad) VALUES
            ('Pabellón 1', 'Cirugía General', 1),
            ('Pabellón 2', 'Cardiología', 1)
            ON CONFLICT DO NOTHING
        `);

    console.log("Datos de prueba insertados.");
  } catch (error) {
    console.warn(
      "Error insertando datos de prueba (posiblemente ya existen):",
      error.message,
    );
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("Inicialización completada.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error en inicialización:", error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
