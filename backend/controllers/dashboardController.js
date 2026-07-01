/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     summary: Obtiene el resumen del dashboard quirúrgico
 *     description: Retorna datos consolidados del dashboard incluyendo disponibilidad de recursos y equipo activo
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Datos del dashboard obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uciAvailability:
 *                   type: integer
 *                   description: Camas UCI disponibles
 *                 bloodSupply:
 *                   type: integer
 *                   description: Porcentaje de disponibilidad de sangre
 *                 suppliesStatus:
 *                   type: integer
 *                   description: Porcentaje de insumos disponibles
 *                 activeTeam:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       specialty:
 *                         type: string
 *                       status:
 *                         type: string
 *                 surgeries:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       patient:
 *                         type: string
 *                       type:
 *                         type: string
 *                       startTime:
 *                         type: string
 *                       endTime:
 *                         type: string
 *                       pabellon:
 *                         type: integer
 *                       status:
 *                         type: string
 *       500:
 *         description: Error al obtener datos del dashboard
 */
module.exports = {};
