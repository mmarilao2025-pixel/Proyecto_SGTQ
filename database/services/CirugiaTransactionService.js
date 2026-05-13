const { transactionService } = require('./database/services/TransactionService');
const { fatigueTransactionService } = require('./database/services/FatigueTransactionService');

/**
 * Servicio mejorado de agendamiento de cirugías con transacciones ACID completas.
 * Integra validaciones de fatiga, recursos y atomicidad para SGTQ.
 */
class CirugiaTransactionService {

    /**
     * Agenda una cirugía con validaciones completas y transacciones.
     * Incluye verificación de fatiga médica, disponibilidad de recursos y rollback automático.
     */
    async agendarCirugiaCompleta(
        rutPaciente,
        medicoId,
        pabellonId,
        camaId,
        tipoCirugia,
        fechaInicio,
        fechaFin,
        requiereUci = false,
        horasCirugia = 2
    ) {
        return await transactionService.executeTransaction(async (client) => {
            console.log(`Iniciando agendamiento transaccional para paciente ${rutPaciente}`);

            // 1. Validar y actualizar fatiga médica
            const fatigaResult = await fatigueTransactionService.validateAndUpdateFatigue(medicoId, horasCirugia);
            if (!fatigaResult.approved) {
                throw new Error(`Validación de fatiga fallida: ${fatigaResult.error}`);
            }

            // 2. Verificar disponibilidad de pabellón con locking
            const pabellonCheck = await transactionService.checkAndReserveResource('Pabellones', pabellonId);
            if (!pabellonCheck.available) {
                throw new Error('Pabellón no disponible');
            }

            // 3. Verificar cama UCI si es requerida
            if (requiereUci) {
                const camaCheck = await transactionService.checkAndReserveResource('Camas', camaId);
                if (!camaCheck.available) {
                    throw new Error('Cama UCI no disponible');
                }
            }

            // 4. Insertar cirugía
            const insertQuery = `
                INSERT INTO Cirugias (paciente_rut, medico_id, pabellon_id, cama_id, tipo, fecha_inicio, fecha_fin, requiere_uci)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;
            `;
            const cirugiaResult = await client.query(insertQuery, [
                rutPaciente, medicoId, pabellonId, camaId, tipoCirugia, fechaInicio, fechaFin, requiereUci
            ]);

            // 5. Actualizar estados de recursos
            await client.query(`UPDATE Pabellones SET estado = 'Reservado' WHERE id = $1`, [pabellonId]);
            if (requiereUci) {
                await client.query(`UPDATE Camas SET estado = 'Reservado' WHERE id = $1`, [camaId]);
            }

            console.log(`Cirugía agendada exitosamente. ID: ${cirugiaResult.rows[0].id}`);

            return {
                exito: true,
                cirugia_id: cirugiaResult.rows[0].id,
                horas_actualizadas: fatigaResult.currentHours
            };
        });
    }

    /**
     * Cancela una cirugía y libera recursos de forma transaccional.
     */
    async cancelarCirugia(cirugiaId, medicoId, horasCirugia) {
        return await transactionService.executeTransaction(async (client) => {
            // Obtener datos de la cirugía
            const selectQuery = `SELECT pabellon_id, cama_id FROM Cirugias WHERE id = $1`;
            const cirugiaData = await client.query(selectQuery, [cirugiaId]);

            if (cirugiaData.rows.length === 0) {
                throw new Error('Cirugía no encontrada');
            }

            const { pabellon_id, cama_id } = cirugiaData.rows[0];

            // Cancelar cirugía
            await client.query(`UPDATE Cirugias SET estado = 'Cancelada' WHERE id = $1`, [cirugiaId]);

            // Liberar recursos
            await client.query(`UPDATE Pabellones SET estado = 'Disponible' WHERE id = $1`, [pabellon_id]);
            if (cama_id) {
                await client.query(`UPDATE Camas SET estado = 'Disponible' WHERE id = $1`, [cama_id]);
            }

            // Revertir horas de fatiga
            await client.query(
                `UPDATE Medicos SET horas_semanales_acumuladas = GREATEST(horas_semanales_acumuladas - $2, 0) WHERE id = $1`,
                [medicoId, horasCirugia]
            );

            console.log(`Cirugía ${cirugiaId} cancelada y recursos liberados`);

            return { exito: true };
        });
    }
}

module.exports = { CirugiaTransactionService: new CirugiaTransactionService() };