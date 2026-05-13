import { Pool, PoolClient } from 'pg';
import { databaseManager } from '../../config/DatabaseManager';

/**
 * Servicio de abstracción para transacciones ACID en PostgreSQL.
 * Proporciona métodos para ejecutar operaciones transaccionales de forma segura,
 * críticas para el agendamiento de cirugías en SGTQ.
 */
export class TransactionService {
    private pool: Pool;

    constructor() {
        this.pool = databaseManager.getPool();
    }

    /**
     * Ejecuta una función callback dentro de una transacción ACID.
     * Maneja BEGIN, COMMIT y ROLLBACK automáticamente.
     * @param callback Función que recibe el cliente transaccional
     * @returns Resultado de la callback o error
     */
    async executeTransaction<T>(
        callback: (client: PoolClient) => Promise<T>
    ): Promise<{ success: boolean; data?: T; error?: string }> {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');
            console.log('Transacción iniciada en SGTQ');

            const result = await callback(client);

            await client.query('COMMIT');
            console.log('Transacción confirmada exitosamente');

            return { success: true, data: result };
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Transacción revertida por error:', error.message);

            return { success: false, error: error.message };
        } finally {
            client.release();
        }
    }

    /**
     * Verifica y reserva recursos con locking optimista.
     * Útil para validar disponibilidad antes de agendar.
     */
    async checkAndReserveResource(
        table: string,
        id: number,
        lockColumn: string = 'estado'
    ): Promise<{ available: boolean; client?: PoolClient }> {
        const client = await this.pool.connect();

        try {
            // SELECT FOR UPDATE para locking
            const query = `SELECT ${lockColumn} FROM ${table} WHERE id = $1 FOR UPDATE`;
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                client.release();
                return { available: false };
            }

            const status = result.rows[0][lockColumn];
            const available = status === 'Disponible';

            if (!available) {
                client.release();
                return { available: false };
            }

            return { available: true, client };
        } catch (error) {
            client.release();
            throw error;
        }
    }

    /**
     * Libera un cliente transaccional sin commit/rollback.
     * Útil cuando se maneja manualmente la transacción.
     */
    releaseClient(client: PoolClient): void {
        client.release();
    }
}

// Instancia singleton del servicio
export const transactionService = new TransactionService();