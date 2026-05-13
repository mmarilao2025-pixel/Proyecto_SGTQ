const db = require('./config/Database'); 

async function agendarCirugiaAtomica(rutPaciente, pabellonId, camaId, tipoCirugia, fechaInicio, fechaFin) {
    const pool = db.getPool();
    //CRÍTICO: Para transacciones, debemos "pedir prestado" un cliente específico del pool
    const client = await pool.connect(); 

    try {
        //INICIAMOS LA TRANSACCIÓN ACID
        await client.query('BEGIN'); 
        console.log("Iniciando transacción de agendamiento...");

        //Validar que el Pabellón esté disponible
        const resPabellon = await client.query('SELECT estado FROM Pabellones WHERE id = $1 FOR UPDATE', [pabellonId]);
        if (resPabellon.rows[0].estado !== 'Disponible') {
            throw new Error("El pabellón ya no está disponible");
        }

        //Insertar la cirugía
        const insertQuery = `
            INSERT INTO Cirugias (paciente_rut, pabellon_id, cama_id, tipo, fecha_inicio, fecha_fin) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
        `;
        const resCirugia = await client.query(insertQuery, [rutPaciente, pabellonId, camaId, tipoCirugia, fechaInicio, fechaFin]);

        //Actualizar el estado de los recursos a 'Reservado'
        await client.query(`UPDATE Pabellones SET estado = 'Reservado' WHERE id = $1`, [pabellonId]);
        await client.query(`UPDATE Camas SET estado = 'Reservado' WHERE id = $1`, [camaId]);

        //SI TODO SALIÓ BIEN, GUARDAMOS LOS CAMBIOS DE FORMA DEFINITIVA
        await client.query('COMMIT');
        console.log("Transacción exitosa: Cirugía agendada");
        
        return { exito: true, cirugia_id: resCirugia.rows[0].id };

    } catch (error) {
        //SI ALGO FALLA (ej. no hay cama), DESHACEMOS TODO LO QUE HICIMOS
        await client.query('ROLLBACK');
        console.error("Error en transacción, se aplicó ROLLBACK:", error.message);
        return { exito: false, mensaje: error.message };
    } finally {
        // Siempre debemos devolver el cliente al pool
        client.release();
    }
}

module.exports = { agendarCirugiaAtomica };
