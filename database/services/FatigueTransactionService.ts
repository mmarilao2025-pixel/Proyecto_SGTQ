import { PoolClient } from 'pg';
import { transactionService } from './TransactionService';

/**
 * Servicio transaccional para manejo de fatiga médica en SGTQ.
 * Implementa validaciones y actualizaciones transaccionales de horas trabajadas,
 * cumpliendo con límites legales (máximo 44 horas/semana) y previniendo riesgos.
 */
export class FatigueTransactionService {

    /**
     * Valida y actualiza horas de fatiga médica de forma transaccional.
     * Bloquea agendamientos si supera el límite de seguridad.
     * @param medicoId ID del médico
     * @param horasAdicionales Horas a agregar por nueva cirugía
     * @returns Resultado de la validación
     */
    async validateAndUpdateFatigue(
        medicoId: number,
        horasAdicionales: number
    ): Promise<{ approved: boolean; currentHours?: number; error?: string }> {
        return await transactionService.executeTransaction(async (client: PoolClient) => {
            // Obtener horas actuales con locking
            const selectQuery = `
                SELECT horas_semanales_acumuladas, estado
                FROM Medicos
                WHERE id = $1 FOR UPDATE
            `;
            const result = await client.query(selectQuery, [medicoId]);

            if (result.rows.length === 0) {
                throw new Error('Médico no encontrado');
            }

            const { horas_semanales_acumuladas, estado } = result.rows[0];
            const newTotal = horas_semanales_acumuladas + horasAdicionales;

            // Validar límite de fatiga (44 horas/semana según normativas)
            if (newTotal > 44) {
                throw new Error(`Médico supera límite de fatiga. Horas actuales: ${horas_semanales_acumuladas}, adicionales: ${horasAdicionales}`);
            }

            // Validar estado del médico
            if (estado === 'Fatigado' || estado === 'Ausente') {
                throw new Error(`Médico no disponible. Estado: ${estado}`);
            }

            // Actualizar horas y estado si es necesario
            const updateQuery = `
                UPDATE Medicos
                SET horas_semanales_acumuladas = $2,
                    estado = CASE WHEN $2 >= 40 THEN 'Fatigado' ELSE 'Disponible' END
                WHERE id = $1
            `;
            await client.query(updateQuery, [medicoId, newTotal]);

            console.log(`Fatiga actualizada para médico ${medicoId}: ${horas_semanales_acumuladas} -> ${newTotal}`);

            return { approved: true, currentHours: newTotal };
        });
    }

    /**
     * Resetea contador de horas semanalmente (mantenimiento programado).
     * Debe ejecutarse al inicio de cada semana.
     */
    async resetWeeklyHours(): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
        return await transactionService.executeTransaction(async (client: PoolClient) => {
            const updateQuery = `
                UPDATE Medicos
                SET horas_semanales_acumuladas = 0,
                    estado = 'Disponible'
                WHERE estado != 'Ausente'
            `;
            const result = await client.query(updateQuery);

            console.log(`Reset semanal completado. Médicos actualizados: ${result.rowCount}`);

            return { success: true, updatedCount: result.rowCount };
        });
    }

    /**
     * Obtiene reporte de fatiga para monitoreo en tiempo real.
     */
    async getFatigueReport(): Promise<{ medicos: any[]; error?: string }> {
        try {
            const client = await transactionService['pool'].connect();
            const query = `
                SELECT id, nombre, especialidad, horas_semanales_acumuladas, estado
                FROM Medicos
                ORDER BY horas_semanales_acumuladas DESC
            `;
            const result = await client.query(query);
            client.release();

            return { medicos: result.rows };
        } catch (error: any) {
            return { medicos: [], error: error.message };
        }
    }
}

// Instancia del servicio
export const fatigueTransactionService = new FatigueTransactionService();