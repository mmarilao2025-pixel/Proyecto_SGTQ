/**
 * @openapi
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
 *                 description: Tipo de cirugía a realizar
 *               medicoId:
 *                 type: number
 *                 description: ID del médico asignado
 *               quirofanoId:
 *                 type: number
 *                 description: ID del quirófano
 *               fechaHora:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de la cirugía
 *               duracionEstimada:
 *                 type: number
 *                 description: Duración estimada en minutos
 *     responses:
 *       200:
 *         description: Cirugía agendada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 cirugiaId:
 *                   type: number
 *       400:
 *         description: Datos incompletos o faltan datos obligatorios
 *       500:
 *         description: Error interno del servidor
 *
 * /api/surgery/atomic:
 *   post:
 *     summary: Agenda una cirugía con transacción atómica
 *     description: Realiza una transacción atómica para agendar cirugía con cama UCI
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
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *               fechaFin:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Cirugía agendada con transacción atómica exitosa
 *       400:
 *         description: Datos incompletos
 *       500:
 *         description: Error en transacción de cirugía
 */
module.exports = {};
