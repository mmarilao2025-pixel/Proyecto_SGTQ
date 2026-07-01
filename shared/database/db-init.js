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


        // Ejecutar todas las migraciones en orden (001_..., 002_..., etc.)
        const migrationsDir = path.join(__dirname, 'migrations');
        const archivosMigracion = fs.readdirSync(migrationsDir)
            .filter((archivo) => archivo.endsWith('.sql'))
            .sort(); // orden alfabético => orden numérico (001, 002, 003...)

        for (const archivo of archivosMigracion) {
            const migrationPath = path.join(migrationsDir, archivo);
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

            await client.query('BEGIN');
            console.log(`Ejecutando migración: ${archivo}...`);

            try {
                await client.query(migrationSQL);
                await client.query('COMMIT');
                console.log(`Migración ${archivo} completada exitosamente.`);
            } catch (error) {
                await client.query('ROLLBACK');
                throw new Error(`Error en migración ${archivo}: ${error.message}`);
            }
        }

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

        console.log('Base de datos inicializada correctamente para SGTQ.');
    } catch (error) {
        console.error('Error en inicialización de BD:', error);
        throw error;
    } finally {
        client.release();
    }

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


        // Pacientes de prueba (con ficha clínica completa)
        await client.query(`
            INSERT INTO Pacientes (
                rut, nombre, fecha_nacimiento, telefono, email,
                direccion, sexo, contacto_emergencia_nombre, contacto_emergencia_telefono,
                prevision, isapre_plan, tipo_sangre, alergias, enfermedades_cronicas,
                peso_kg, altura_cm, observaciones_medicas, estado
            ) VALUES
            (
                '12345678-9', 'Juan Pérez', '1980-05-15', '+56912345678', 'juan@email.com',
                'Av. Siempre Viva 123, Santiago', 'Masculino', 'Ana Pérez', '+56911112222',
                'Isapre', 'Plan Esencial 1A', 'O+', ARRAY['Penicilina'], ARRAY[]::TEXT[],
                78.5, 175, 'Sin observaciones relevantes.', 'Activo'
            ),
            (
                '87654321-0', 'María González', '1975-03-20', '+56987654321', 'maria@email.com',
                'Calle Las Flores 456, Viña del Mar', 'Femenino', 'Pedro González', '+56933334444',
                'Fonasa', NULL, 'A-', ARRAY['Mariscos'], ARRAY['Hipertensión'],
                65, 162, 'Paciente con antecedente de hipertensión controlada.', 'Activo'
            )
            ON CONFLICT (rut) DO NOTHING
        `);

        // Tipos de cirugía (catálogo administrable)
        await client.query(`
            INSERT INTO TiposCirugia (nombre, especialidad_requerida, duracion_estimada_horas) VALUES
            ('Apendicectomía', 'Cirugía General', 1.5),
            ('Colecistectomía', 'Cirugía General', 2),
            ('Cirugía Cardíaca', 'Cardiovascular', 4),
            ('Cesárea', 'Ginecología', 1)
            ON CONFLICT (nombre) DO NOTHING
        `);

        // Médicos de prueba
        await client.query(`

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
