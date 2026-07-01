const db = require('../shared/config/Database');

async function obtenerInsumos() {
    const pool = db.getPool();
    const result = await pool.query(
        'SELECT * FROM Insumos ORDER BY categoria, nombre'
    );
    return result.rows;
}

async function descontarInsumoCirugia(client, insumoId, cantidad, cirugiaId, motivo) {
    const check = await client.query(
        'SELECT cantidad FROM Insumos WHERE id = $1 FOR UPDATE', [insumoId]
    );
    if (check.rows[0].cantidad < cantidad) {
        throw new Error(`Stock insuficiente del insumo ID ${insumoId}`);
    }
    await client.query(
        'UPDATE Insumos SET cantidad = cantidad - $1, updated_at = NOW() WHERE id = $2',
        [cantidad, insumoId]
    );
    await client.query(
        `INSERT INTO Insumos_Movimientos (insumo_id, cirugia_id, cantidad, motivo)
         VALUES ($1, $2, $3, $4)`,
        [insumoId, cirugiaId, -cantidad, motivo]
    );
}
module.exports = { obtenerInsumos, descontarInsumoCirugia };