/**
 * @openapi
 * /api/insumos:
 *   get:
 *     summary: Obtiene lista de insumos y stock actual
 *     description: Retorna todos los insumos disponibles en el hospital con su stock
 *     tags:
 *       - Insumos
 *     responses:
 *       200:
 *         description: Insumos obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   stock:
 *                     type: integer
 *                   stockMinimo:
 *                     type: integer
 *       500:
 *         description: Error al obtener insumos
 */
module.exports = {};
