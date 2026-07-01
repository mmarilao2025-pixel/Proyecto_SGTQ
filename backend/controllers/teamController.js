/**
 * @openapi
 * /api/team:
 *   get:
 *     summary: Obtiene el equipo médico disponible
 *     description: Retorna lista del personal médico con su estado de disponibilidad y horas acumuladas
 *     tags:
 *       - Equipo Médico
 *     responses:
 *       200:
 *         description: Equipo médico obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   specialty:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [DISPONIBLE, ALERTA, BLOQUEADO]
 *                   horasAcumuladas:
 *                     type: number
 *                   disponible:
 *                     type: boolean
 *       500:
 *         description: Error al obtener equipo
 *
 * /api/team/reset-fatigue:
 *   post:
 *     summary: Resetea la fatiga de un médico
 *     description: Resetea las horas acumuladas de un médico específico
 *     tags:
 *       - Equipo Médico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medicoId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Fatiga reseteada correctamente
 *       400:
 *         description: Error al resetear fatiga
 */
module.exports = {};
