const db = require("../../../config/Database");

class TransactionService {
  /**
   * Ejecuta una función dentro de una transacción ACID.
   * Si la función lanza un error, hace ROLLBACK automático.
   *
   * @param {Function} callback - async function(client) => result
   * @returns {{ success: boolean, data?: any, error?: string }}
   */
  async executeTransaction(callback) {
    const pool = db.getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const data = await callback(client);
      await client.query("COMMIT");
      return { success: true, data };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("TransactionService ROLLBACK:", error.message);
      return { success: false, error: error.message };
    } finally {
      client.release();
    }
  }
}

module.exports = { TransactionService };
