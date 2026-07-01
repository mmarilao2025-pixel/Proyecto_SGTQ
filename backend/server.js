const { FatigueTransactionService } = require('../shared/api/database/services/FatigueTransactionService');
const { GestorEventosQuirurgicos, ObservadorNotificaciones } = require('./comportamiento_observador');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../shared/config/env/.env' });
const db = require('../shared/config/Database');
const path = require('path');
const { createServer } = require('http'); 
const { Server } = require('socket.io');  

// Importar servicios
const { agendarCirugiaAtomica } = require("./cirugiaService");
const { GestorCirugiasFacade } = require("./SurgeryBookingFacade");
const { notificarEvento } = require("./comportamiento_observador");
const {
  obtenerEstadisticasEventos,
  GestorEventosSingleton,
} = require("./comportamiento_observador");
const { obtenerInsumos } = require("./insumoService");

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist");

// Configuración de Servidor HTTP y WebSockets
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(distPath)); // Servir frontend compilado desde dist

// ============ RUTAS API ============

/**
 * GET /api/insumos — Lista todos los insumos con su stock actual
 */
app.get("/api/insumos", async (req, res) => {
  try {
    const insumos = await obtenerInsumos();
    res.json(insumos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener insumos" });
  }
});

/**
 * GET /api/dashboard
 */
app.get("/api/dashboard", (req, res) => {
  try {
    const dashboardData = {
      uciAvailability: 17,
      bloodSupply: 80,
      suppliesStatus: 75,
      activeTeam: [
        {
          id: 1,
          name: "Dr. Andrés Morales",
          specialty: "Cirugía General",
          status: "ALERTA",
          initials: "AM",
        },
        {
          id: 2,
          name: "Dr. Felipe Soto",
          specialty: "Cardiovascular",
          status: "BLOQUEADO",
          initials: "FS",
        },
      ],
      surgeries: [
        {
          id: 1,
          patient: "Paciente A",
          type: "Cirugía General",
          startTime: "08:00",
          endTime: "10:30",
          pabellon: 1,
          status: "EN PROGRESO",
        },
      ],
    };
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener datos del dashboard" });
  }
});

/**
 * POST /api/surgery/schedule
 * Agenda una nueva cirugía: Registra paciente y valida reglas SOLID
 */
app.post("/api/surgery/schedule", async (req, res) => {
  try {
    // 1. Extraemos los datos que envía el frontend (¡Aquí capturamos los nuevos!)
    const {
      rutPaciente,
      tipoCirugia,
      medicoId,
      quirofanoId,
      fechaHora,
      duracionEstimada,
    } = req.body;

    if (!rutPaciente || !medicoId || !quirofanoId || !fechaHora) {
      return res
        .status(400)
        .json({ error: "Faltan datos obligatorios para agendar." });
    }

    // 2. Armamos el Payload para el Motor SOLID
    const payload = {
      rutPaciente: rutPaciente,
      tipoCirugia: tipoCirugia,
      medicoId: medicoId,
      quirofanoId: quirofanoId,
      fechaHora: fechaHora,
      duracionEstimada: duracionEstimada || 60,
      medicoHoras: 30, // Simulado para la validación
    };

    const pool = db.getPool();

    // 3. Ejecutamos el Facade (Aquí ocurre la magia de las validaciones de horario)
    const facade = new GestorCirugiasFacade(); // O new SurgeryBookingFacade() según el que uses
    const resultado = await facade.validarYAgendarCirugia(payload, pool);

    if (resultado.exito) {
      // Guardamos en la base de datos real
      const insertQuery = `
                INSERT INTO Cirugias (paciente_rut, medico_id, pabellon_id, tipo_cirugia, fecha_hora, duracion_estimada_minutos, estado)
                VALUES ($1, $2, $3, $4, $5, $6, 'Programada')
                RETURNING id;
            `;
      const valoresInsert = [
        rutPaciente,
        medicoId,
        quirofanoId,
        tipoCirugia,
        fechaHora,
        payload.duracionEstimada,
      ];
      const nuevaCirugia = await pool.query(insertQuery, valoresInsert);

      // === INSTANCIACIÓN Y USO DEL PATRÓN OBSERVER ===
      const gestorEventos = new GestorEventosQuirurgicos();
      const moduloNotificaciones = new ObservadorNotificaciones();

      // Suscribimos el observador de WhatsApp al gestor de eventos
      gestorEventos.suscribir(moduloNotificaciones);

      // Notificamos el evento pasándole los datos del payload
      gestorEventos.notificar("cirugia_aprobada", payload);
      // ===============================================

      res.status(200).json({
        exito: true,
        mensaje: resultado.mensaje,
        cirugiaId: nuevaCirugia.rows[0].id,
      });
    }
  } catch (error) {
    console.error("Error en /api/surgery/schedule:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al procesar la cirugía." });
  }
});

app.get("/api/events/stats", (req, res) => {
  try {
    const stats = obtenerEstadisticasEventos();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener métricas de eventos" });
  }
});

/**
 * POST /api/surgery/atomic
 */
app.post("/api/surgery/atomic", async (req, res) => {
  try {
    const {
      rutPaciente,
      pabellonId,
      camaId,
      tipoCirugia,
      fechaInicio,
      fechaFin,
      requiereTransfusion,
      tipoSangre,
      litrosSangre,
    } = req.body;

    if (!rutPaciente || !pabellonId || !camaId || !tipoCirugia) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const resultado = await agendarCirugiaAtomica(
      rutPaciente,
      pabellonId,
      camaId,
      tipoCirugia,
      fechaInicio,
      fechaFin,
      requiereTransfusion,
      tipoSangre,
      litrosSangre,
    );

    if (resultado.exito) res.json(resultado);
    else res.status(400).json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Error en transacción de cirugía" });
  }
});

/**
 * GET /api/resources
 */
app.get("/api/resources", (req, res) => {
  try {
    res.json({
      camasUCI: { total: 20, disponibles: 3, ocupadas: 17, porcentaje: 85 },
      sangre: { total: 100, disponible: 80, porcentaje: 80 },
      insumos: { ok: true, cantidad: 150, porcentaje: 75 },
      pabellones: { total: 5, disponibles: 2, ocupados: 3 },
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener recursos" });
  }
});

/**
 * GET /api/team
 */
app.get("/api/team", (req, res) => {
  try {
    res.json([
      {
        id: 1,
        name: "Dr. Andrés Morales",
        specialty: "Cirugía General",
        status: "ALERTA",
        horasAcumuladas: 40,
        disponible: false,
      },
      {
        id: 2,
        name: "Dr. Felipe Soto",
        specialty: "Cardiovascular",
        status: "BLOQUEADO",
        horasAcumuladas: 48,
        disponible: false,
      },
      {
        id: 3,
        name: "Dra. María García",
        specialty: "Ginecología",
        status: "DISPONIBLE",
        horasAcumuladas: 32,
        disponible: true,
      },
    ]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener equipo" });
  }
});

/**
 * GET /api/patients/:rut
 * Consulta la ficha clínica de un paciente específico por su RUT
 */
app.get("/api/patients/:rut", async (req, res) => {
  try {
    const pool = db.getPool();
    // Limpiamos el RUT que viene de la URL (quitamos puntos y espacios, dejamos guion)
    const rutBusqueda = req.params.rut.trim();

    const query = `
            SELECT 
                rut, 
                nombre, 
                sexo, 
                prevision, 
                tipo_sangre AS "tipoSangre", 
                alergias, 
                enfermedades_cronicas AS "enfermedadesCronicas"
            FROM Pacientes 
            WHERE rut = $1;
        `;

    const resultado = await pool.query(query, [rutBusqueda]);

    if (resultado.rowCount > 0) {
      // El paciente existe, devolvemos su ficha clínica con código 200
      console.log(`🔍 Ficha clínica encontrada para el RUT: ${rutBusqueda}`);
      return res.status(200).json(resultado.rows[0]);
    } else {
      // No existe, devolvemos 404 para que React despliegue el formulario de registro
      console.log(`⚠️ Paciente no registrado con RUT: ${rutBusqueda}`);
      return res.status(404).json({ mensaje: "Paciente no encontrado." });
    }
  } catch (error) {
    console.error("Error al consultar paciente en la base de datos:", error);
    return res.status(500).json({
      error: "Error interno del servidor al consultar la ficha clínica.",
    });
  }
});

/**
 * POST /api/patients
 * Registra un nuevo paciente en la base de datos
 */
app.post("/api/patients", async (req, res) => {
  try {
    const { rut, nombre, fechaNacimiento, telefono, email } = req.body;

    // Validar campos obligatorios según la BD (001_initial_schema.sql)
    if (!rut || !nombre || !fechaNacimiento) {
      return res.status(400).json({
        error: "Faltan campos obligatorios: rut, nombre o fecha de nacimiento",
      });
    }

    const insertQuery = `
            INSERT INTO Pacientes (rut, nombre, fecha_nacimiento, telefono, email) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *;
        `;

    const valores = [
      rut,
      nombre,
      fechaNacimiento,
      telefono || null,
      email || null,
    ];
    const resultado = await db.query(insertQuery, valores);

    res.status(201).json({
      exito: true,
      mensaje: "Paciente registrado exitosamente",
      paciente: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error en /api/patients:", error.message);
    // Manejo de error si el RUT ya existe (código 23505 en PostgreSQL)
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ error: "El RUT ingresado ya está registrado en el sistema" });
    }
    res.status(500).json({ error: "Error interno al registrar el paciente" });
  }
});

/**
 * GET /api/surgeries
 */
app.get("/api/surgeries", (req, res) => {
  try {
    res.json([
      {
        id: 1,
        patient: "Juan Pérez",
        type: "Apendicectomía",
        startTime: "08:00",
        endTime: "09:30",
        pabellon: 1,
        status: "EN PROGRESO",
        requiereUCI: true,
      },
      {
        id: 2,
        patient: "María López",
        type: "Colecistectomía",
        startTime: "10:00",
        endTime: "11:45",
        pabellon: 2,
        status: "PROGRAMADA",
        requiereUCI: false,
      },
    ]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener cirugías" });
  }
});

/**
 * POST /api/team/reset-fatigue
 * Desbloquea a un médico tras su periodo de descanso
 */
app.post('/api/team/reset-fatigue', async (req, res) => {
    try {
        const { medicoId } = req.body;
        
        if (!medicoId) {
            return res.status(400).json({ error: 'Falta el ID del médico' });
        }

        const fatigueService = new FatigueTransactionService();
        const result = await fatigueService.resetFatigue(medicoId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error en /api/team/reset-fatigue:', error);
        res.status(500).json({ error: 'Error al reiniciar la fatiga del médico' });
    }
});

/**
 * POST /api/patients
 * Registra un nuevo paciente
 */
app.post('/api/patients', async (req, res) => {
    try {
        const { rut, nombre, fechaNacimiento, telefono, email } = req.body;

        // Validar campos obligatorios de la tabla
        if (!rut || !nombre || !fechaNacimiento) {
            return res.status(400).json({ 
                error: 'Faltan campos obligatorios: rut, nombre o fecha de nacimiento' 
            });
        }

        const db = require('../shared/config/Database');
        
        const insertQuery = `
            INSERT INTO Pacientes (rut, nombre, fecha_nacimiento, telefono, email) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *;
        `;
        
        const valores = [rut, nombre, fechaNacimiento, telefono || null, email || null];
        const resultado = await db.query(insertQuery, valores);

        // Retornamos 201 (Created) con los datos del paciente
        res.status(201).json({
            exito: true,
            mensaje: 'Paciente registrado exitosamente',
            paciente: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en POST /api/patients:', error.message);
        if (error.code === '23505') { // Código de error de PostgreSQL para "Unique violation"
            return res.status(409).json({ error: 'El RUT ingresado ya está registrado' });
        }
        res.status(500).json({ error: 'Error interno al registrar el paciente' });
    }
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ============ RUTAS ESTÁTICAS ============
app.get("*", (req, res, next) => {
  if (req.originalUrl.startsWith("/api/")) return next();
  res.sendFile(path.join(distPath, "index.html"));
});

// ============ MANEJO DE ERRORES ============
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// ============ WEBSOCKETS & OBSERVER ============
const gestorEventos = GestorEventosSingleton.obtenerInstancia();

class SocketBroadcaster {
  actualizar(evento, datos) {
    io.emit("hospital_event", { evento, datos });
  }
  getNombre() {
    return "SocketBroadcaster";
  }
}

const broadcaster = new SocketBroadcaster();
gestorEventos.suscribir("cirugia_aprobada", broadcaster);
gestorEventos.suscribir("cirugia_rechazada", broadcaster);
gestorEventos.suscribir("emergencia_medica", broadcaster);

io.on("connection", (socket) => {
  console.log("🔌 Nuevo cliente de dashboard conectado:", socket.id);
});

// ============ INICIAR SERVIDOR ============
httpServer.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════════╗
    ║   SGTQ - Sistema de Gestión Quirúrgica     ║
    ║   Servidor HTTP y WSS en puerto ${PORT}       ║
    ║   http://localhost:${PORT}                    ║
    ╚════════════════════════════════════════════╝
    `);
});