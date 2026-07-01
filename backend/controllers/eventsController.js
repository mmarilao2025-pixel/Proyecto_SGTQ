/**
 * @openapi
 * /api/events/stats:
 *   get:
 *     summary: Obtiene estadísticas de eventos
 *     description: Retorna métricas y estadísticas de eventos del sistema
 *     tags:
 *       - Eventos
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Error al obtener métricas de eventos
 *
 * /api/health:
 *   get:
 *     summary: Health check del servidor
 *     description: Verifica que el servidor está funcionando correctamente
 *     tags:
 *       - Sistema
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [OK]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
module.exports = {};
