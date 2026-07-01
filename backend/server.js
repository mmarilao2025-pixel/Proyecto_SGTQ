const {
  GestorEventosQuirurgicos,
  ObservadorNotificaciones,
} = require("./comportamiento_observador");
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "../shared/config/env/.env" });
const db = require("../shared/config/Database");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");

// Importar servicios
const { agendarCirugiaAtomica } = require("./cirugiaService");
const { GestorCirugiasFacade } = require("./SurgeryBookingFacade");
const { notificarEvento } = require("./comportamiento_observador");
const {
  obtenerEstadisticasEventos,
  GestorEventosSingleton,
} = require("./comportamiento_observador");

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

    const payload = {
      rutPaciente: rutPaciente,
      tipoCirugia: tipoCirugia,
      medicoId: medicoId,
      quirofanoId: quirofanoId,
      fechaHora: fechaHora,
      duracionEstimada: duracionEstimada || 60,
      medicoHoras: 30,
    };

    const pool = db.getPool();
    const facade = new GestorCirugiasFacade();
    const resultado = await facade.validarYAgendarCirugia(payload, pool);

    if (resultado.exito) {
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

      const gestorEventosInstance = new GestorEventosQuirurgicos();
      const moduloNotificaciones = new ObservadorNotificaciones();
      gestorEventosInstance.suscribir(moduloNotificaciones);
      gestorEventosInstance.notificar("cirugia_aprobada", payload);

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

// ============ RUTAS DE PACIENTES (FICHA CLÍNICA UNIFICADA) ============

/**
 * GET /api/patients/:rut
 * Consulta la ficha clínica completa de un paciente por su RUT
 */
app.get("/api/patients/:rut", async (req, res) => {
  try {
    const pool = db.getPool();
    const rutBusqueda = req.params.rut.trim();

    const query = `
            SELECT 
                rut, 
                nombre,
                fecha_nacimiento AS "fechaNacimiento",
                telefono,
                email,
                direccion,
                sexo, 
                contacto_emergencia_nombre AS "contactoEmergenciaNombre",
                contacto_emergencia_telefono AS "contactoEmergenciaTelefono",
                prevision,
                isapre_plan AS "isaprePlan",
                tipo_sangre AS "tipoSangre", 
                alergias, 
                enfermedades_cronicas AS "enfermedadesCronicas",
                medicamentos_actuales AS "medicamentosActuales",
                peso_kg AS "pesoKg",
                altura_cm AS "alturaCm",
                observaciones_medicas AS "observacionesMedicas",
                estado
            FROM Pacientes 
            WHERE rut = $1;
        `;

    const resultado = await pool.query(query, [rutBusqueda]);

    if (resultado.rowCount > 0) {
      console.log(`🔍 Ficha clínica encontrada para el RUT: ${rutBusqueda}`);
      return res.status(200).json(resultado.rows[0]);
    } else {
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
 * Registra un nuevo paciente con todos sus datos clínicos
 */
app.post("/api/patients", async (req, res) => {
  try {
    const {
      rut, nombre, fechaNacimiento, telefono, email,
      direccion, sexo, contactoEmergenciaNombre, contactoEmergenciaTelefono,
      prevision, isaprePlan, tipoSangre,
      alergias, enfermedadesCronicas, medicamentosActuales,
      pesoKg, alturaCm, observacionesMedicas
    } = req.body;

    if (!rut || !nombre || !fechaNacimiento) {
      return res.status(400).json({
        error: "Faltan campos obligatorios: rut, nombre o fecha de nacimiento",
      });
    }

    const pool = db.getPool();

    const insertQuery = `
            INSERT INTO Pacientes (
                rut, nombre, fecha_nacimiento, telefono, email,
                direccion, sexo, contacto_emergencia_nombre, contacto_emergencia_telefono,
                prevision, isapre_plan, tipo_sangre,
                alergias, enfermedades_cronicas, medicamentos_actuales,
                peso_kg, altura_cm, observaciones_medicas
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9,
                $10, $11, $12,
                $13, $14, $15,
                $16, $17, $18
            )
            RETURNING *;
        `;

    const valores = [
      rut,
      nombre,
      fechaNacimiento,
      telefono || null,
      email || null,
      direccion || null,
      sexo || "Masculino",
      contactoEmergenciaNombre || null,
      contactoEmergenciaTelefono || null,
      prevision || "Fonasa",
      isaprePlan || null,
      tipoSangre || "Desconocido / No informado",
      Array.isArray(alergias) ? alergias.join(", ") : (alergias || ""),
      Array.isArray(enfermedadesCronicas) ? enfermedadesCronicas.join(", ") : (enfermedadesCronicas || ""),
      medicamentosActuales || null,
      pesoKg ? parseFloat(pesoKg) : null,
      alturaCm ? parseInt(alturaCm, 10) : null,
      observacionesMedicas || null,
    ];

    const resultado = await pool.query(insertQuery, valores);

    res.status(201).json({
      exito: true,
      mensaje: "Paciente registrado exitosamente",
      paciente: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error en POST /api/patients:", error.message);
    if (error.code === "23505") {
      return res.status(409).json({ error: "El RUT ingresado ya está registrado" });
    }
    if (error.code === "23514") {
      return res.status(400).json({ error: "Alguno de los datos no cumple el formato esperado (revisa campos de la BD)." });
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

httpServer.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════════╗
    ║   SGTQ - Sistema de Gestión Quirúrgica     ║
    ║   Servidor HTTP y WSS en puerto ${PORT}       ║
    ║   http://localhost:${PORT}                    ║
    ╚════════════════════════════════════════════╝
    `);
});