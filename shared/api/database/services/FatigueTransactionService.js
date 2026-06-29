const db = require('../../../config/Database');

class FatigueTransactionService {
    static LIMITE_HORAS_SEMANALES = 44;
    static LIMITE_HORAS_TURNO_CONTINUO = 12;

    /**
     * Valida que el médico no supere el límite de horas y actualiza su registro.
     *
     * @param {number} medicoId
     * @param {number} horasNuevas - horas del nuevo turno a agregar
     * @returns {{ approved: boolean, currentHours?: number, error?: string }}
     */
    async validateAndUpdateFatigue(medicoId, horasNuevas) {
        const pool = db.getPool();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Obtener horas actuales con bloqueo para evitar race conditions
            const result = await client.query(
                'SELECT horas_semanales_acumuladas FROM Medicos WHERE id = $1 FOR UPDATE',
                [medicoId]
            );

            if (result.rows.length === 0) {
                throw new Error(`Médico con ID ${medicoId} no encontrado`);
            }

            const horasActuales = result.rows[0].horas_semanales_acumuladas;
            const horasTotal = horasActuales + horasNuevas;

            // Validar límite de horas semanales (BR-2)
            if (horasTotal > FatigueTransactionService.LIMITE_HORAS_SEMANALES) {
                await client.query('ROLLBACK');
                return {
                    approved: false,
                    error: `El médico supera límite de fatiga: ${horasTotal}h > ${FatigueTransactionService.LIMITE_HORAS_SEMANALES}h semanales`
                };
            }

            // Validar límite de turno continuo
            if (horasNuevas > FatigueTransactionService.LIMITE_HORAS_TURNO_CONTINUO) {
                await client.query('ROLLBACK');
                return {
                    approved: false,
                    error: `El turno supera el límite continuo: ${horasNuevas}h > ${FatigueTransactionService.LIMITE_HORAS_TURNO_CONTINUO}h`
                };
            }

            // Actualizar horas acumuladas
            await client.query(
                'UPDATE Medicos SET horas_semanales_acumuladas = $1 WHERE id = $2',
                [horasTotal, medicoId]
            );

            await client.query('COMMIT');

            return {
                approved: true,
                currentHours: horasTotal
            };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('FatigueTransactionService ROLLBACK:', error.message);
            return { approved: false, error: error.message };
        } finally {
            client.release();
        }
    }

    /**
     * Retorna el reporte de fatiga de todos los médicos.
     *
     * @returns {{ medicos: Array }}
     */
    async getFatigueReport() {
        const pool = db.getPool();
        try {
            const result = await pool.query(
                `SELECT id, nombre, especialidad, horas_semanales_acumuladas, estado
                 FROM Medicos
                 ORDER BY horas_semanales_acumuladas DESC`
            );
            return {
                medicos: result.rows.map(m => ({
                    id: m.id,
                    nombre: m.nombre,
                    especialidad: m.especialidad,
                    horasAcumuladas: m.horas_semanales_acumuladas,
                    estado: m.estado,
                    porcentajeFatiga: Math.round((m.horas_semanales_acumuladas / FatigueTransactionService.LIMITE_HORAS_SEMANALES) * 100)
                }))
            };
        } catch (error) {
            console.error('Error en getFatigueReport:', error.message);
            return { medicos: [] };
        }
    }
}

module.exports = { FatigueTransactionService };
