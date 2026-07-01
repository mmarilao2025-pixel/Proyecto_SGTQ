/**
 * @openapi
 * /api/surgeries:
 *   get:
 *     summary: Obtiene lista de cirugías programadas
 *     description: Retorna todas las cirugías en el sistema con su estado actual
 *     tags:
 *       - Cirugías
 *     responses:
 *       200:
 *         description: Cirugías obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   patient:
 *                     type: string
 *                   type:
 *                     type: string
 *                   startTime:
 *                     type: string
 *                   endTime:
 *                     type: string
 *                   pabellon:
 *                     type: integer
 *                   status:
 *                     type: string
 *                     enum: [PROGRAMADA, EN PROGRESO, COMPLETADA, CANCELADA]
 *                   requiereUCI:
 *                     type: boolean
 *       500:
 *         description: Error al obtener cirugías
 */
module.exports = {};
