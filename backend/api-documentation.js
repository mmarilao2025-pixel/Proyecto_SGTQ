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
 * 
 * /api/insumos:
 *   get:
 *     summary: Obtiene lista de insumos
 *     description: Retorna todos los insumos disponibles en el hospital con su stock
 *     tags:
 *       - Insumos
 *     responses:
 *       200:
 *         description: Insumos obtenidos correctamente
 *       500:
 *         description: Error al obtener insumos
 * 
 * /api/surgery/schedule:
 *   post:
 *     summary: Agenda una nueva cirugía
 *     description: Registra un paciente y valida reglas SOLID antes de agendar la cirugía
 *     tags:
 *       - Cirugías
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rutPaciente
 *               - medicoId
 *               - quirofanoId
 *               - fechaHora
 *             properties:
 *               rutPaciente:
 *                 type: string
 *                 description: RUT del paciente
 *               tipoCirugia:
 *                 type: string
 *                 description: Tipo de cirugía
 *               medicoId:
 *                 type: number
 *                 description: ID del médico asignado
 *               quirofanoId:
 *                 type: number
 *                 description: ID del quirófano
 *               fechaHora:
 *                 type: string
 *                 format: date-time
 *               duracionEstimada:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cirugía agendada exitosamente
 *       400:
 *         description: Datos incompletos
 *       500:
 *         description: Error interno del servidor
 * 
 * /api/surgery/atomic:
 *   post:
 *     summary: Agenda una cirugía con transacción atómica
 *     tags:
 *       - Cirugías
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rutPaciente
 *               - pabellonId
 *               - camaId
 *               - tipoCirugia
 *             properties:
 *               rutPaciente:
 *                 type: string
 *               pabellonId:
 *                 type: number
 *               camaId:
 *                 type: number
 *               tipoCirugia:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cirugía agendada con transacción atómica
 *       500:
 *         description: Error en transacción
 * 
 * /api/events/stats:
 *   get:
 *     summary: Obtiene estadísticas de eventos
 *     tags:
 *       - Eventos
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas correctamente
 *       500:
 *         description: Error al obtener métricas
 * 
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
 *                 sangre:
 *                   type: object
 *                 insumos:
 *                   type: object
 *                 pabellones:
 *                   type: object
 *       500:
 *         description: Error al obtener recursos
 * 
 * /api/team:
 *   get:
 *     summary: Obtiene el equipo médico disponible
 *     description: Retorna lista del personal médico con su estado y horas acumuladas
 *     tags:
 *       - Equipo Médico
 *     responses:
 *       200:
 *         description: Equipo médico obtenido
 *       500:
 *         description: Error al obtener equipo
 * 
 * /api/surgeries:
 *   get:
 *     summary: Obtiene lista de cirugías programadas
 *     tags:
 *       - Cirugías
 *     responses:
 *       200:
 *         description: Cirugías obtenidas correctamente
 *       500:
 *         description: Error al obtener cirugías
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
 *                 timestamp:
 *                   type: string
 */

module.exports = {};
