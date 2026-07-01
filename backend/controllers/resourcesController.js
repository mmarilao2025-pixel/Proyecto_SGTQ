/**
 * @openapi
 * /api/resources:
 *   get:
 *     summary: Obtiene estado de recursos del hospital
 *     description: Retorna información sobre disponibilidad de camas UCI, sangre e insumos
 *     tags:
 *       - Recursos
 *     responses:
 *       200:
 *         description: Recursos obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 camasUCI:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     disponibles:
 *                       type: integer
 *                     ocupadas:
 *                       type: integer
 *                     porcentaje:
 *                       type: integer
 *                 sangre:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     disponible:
 *                       type: integer
 *                     porcentaje:
 *                       type: integer
 *                 insumos:
 *                   type: object
 *                   properties:
 *                     ok:
 *                       type: boolean
 *                     cantidad:
 *                       type: integer
 *                     porcentaje:
 *                       type: integer
 *                 pabellones:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     disponibles:
 *                       type: integer
 *                     ocupados:
 *                       type: integer
 *       500:
 *         description: Error al obtener recursos
 */
module.exports = {};
