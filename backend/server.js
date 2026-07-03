const { FatigueTransactionService } = require('../shared/api/database/services/FatigueTransactionService');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../shared/config/env/.env' });
const db = require('../shared/config/Database');
const path = require('node:path');
const { createServer } = require('node:http'); 
const { Server } = require('socket.io');
const { setupSwagger } = require('./swagger');  

// Importar servicios
const { agendarCirugiaAtomica } = require("./cirugiaService");
const { GestorCirugiasFacade } = require("./SurgeryBookingFacade");
const {
  obtenerEstadisticasEventos,
  GestorEventosSingleton,
} = require("./comportamiento_observador");
const { obtenerInsumos } = require("./insumoService");

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist");

function formatLocalTimestamp(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function parseLocalTimestamp(dateTimeString) {
  const [datePart, timePart] = dateTimeString.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second = 0] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
}

// Configuración de Servidor HTTP y WebSockets
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(distPath)); // Servir frontend compilado desde dist

// Inicialización de Swagger en la capa de infraestructura
setupSwagger(app);

// ============ RUTAS API ============

/**
 * GET /api/insumos — Lista todos los insumos con su stock actual
 */
app.get("/api/insumos", async (req, res) => {
  try {
    const insumos = await obtenerInsumos();
    res.json(insumos);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  } catch {
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

    if (!rutPaciente || !quirofanoId || !fechaHora) {
      return res
        .status(400)
        .json({ error: "Faltan datos obligatorios para agendar." });
    }

    const pool = db.getPool();

    const cirugiaExistente = await pool.query(`
      SELECT id FROM Cirugias
      WHERE paciente_rut = $1
        AND estado IN ('Programada', 'En Progreso')
      LIMIT 1
    `, [rutPaciente]);

    if (cirugiaExistente.rows.length > 0) {
      return res.status(400).json({
        exito: false,
        mensaje: "El paciente ya tiene una cirugía programada o en progreso.",
      });
    }

    const normalizarTexto = (texto) =>
      texto
        ? texto
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
            .trim()
        : "";

    const canonizarEspecialidad = (texto) => {
      const clave = normalizarTexto(texto);
      const equivalencias = {
        "cirugia general": "Cirugía General",
        "cardiovascular": "Cardiovascular",
        "cardiologia": "Cardiovascular",
        "cirugia cardiaca": "Cardiovascular",
        "ortopedia": "Ortopedia",
        "neurocirugia": "Neurocirugía",
        "ginecologia": "Ginecología",
      };
      return equivalencias[clave] || texto;
    };

    const especialidadPorCirugia = {
      [normalizarTexto("Apendicectomía")]: "Cirugía General",
      [normalizarTexto("Colecistectomía")]: "Cirugía General",
      [normalizarTexto("Colecistectomia")]: "Cirugía General",
      [normalizarTexto("Colestectomía")]: "Cirugía General",
      [normalizarTexto("Colestectomia")]: "Cirugía General",
      [normalizarTexto("Hernioplastia")]: "Cirugía General",
      [normalizarTexto("Cirugía Cardíaca")]: "Cardiovascular",
      [normalizarTexto("Angioplastia")]: "Cardiovascular",
      [normalizarTexto("Ortopedia")]: "Ortopedia",
      [normalizarTexto("Neurocirugía")]: "Neurocirugía",
      [normalizarTexto("Cesárea")]: "Ginecología",
    };
    const especialidadRequerida = canonizarEspecialidad(
      especialidadPorCirugia[normalizarTexto(tipoCirugia)] || "Cirugía General",
    );

    // ✅ ASIGNACIÓN AUTOMÁTICA DE MÉDICO en función de la especialidad requerida
    let medicoAsignado = medicoId;
    let medicoEspecialidad = null;
    if (medicoAsignado) {
      const medicoRes = await pool.query(
        `SELECT especialidad FROM Medicos WHERE id = $1`,
        [medicoAsignado],
      );
      if (medicoRes.rows.length === 0) {
        return res.status(400).json({
          exito: false,
          mensaje: "No se encontró el médico seleccionado.",
        });
      }
      medicoEspecialidad = canonizarEspecialidad(medicoRes.rows[0].especialidad);

      const especialidadDelMedico = medicoEspecialidad;
      if (medicoId && especialidadDelMedico !== especialidadRequerida) {
        return res.status(400).json({
          exito: false,
          mensaje: `El médico seleccionado pertenece a ${especialidadDelMedico} y no coincide con la especialidad requerida (${especialidadRequerida}).`,
        });
      }
    }

    if (!medicoAsignado) {
      const medicoRes = await pool.query(`
        SELECT id, especialidad FROM Medicos
        WHERE estado = 'Disponible'
          AND horas_semanales_acumuladas < 44
        ORDER BY horas_semanales_acumuladas ASC
      `);

      const medicoEncontrado = medicoRes.rows.find((m) =>
        canonizarEspecialidad(m.especialidad) === especialidadRequerida,
      );

      if (!medicoEncontrado) {
        return res.status(400).json({
          error: `No hay médicos disponibles en la especialidad solicitada: ${especialidadRequerida}.`,
        });
      }

      medicoAsignado = medicoEncontrado.id;
      medicoEspecialidad = canonizarEspecialidad(medicoEncontrado.especialidad);
    }

    // ✅ Payload corregido — pacienteId ya no llega undefined
    const payload = {
      pacienteId: rutPaciente,
      rutPaciente: rutPaciente,
      tipoCirugia: tipoCirugia,
      medicoId: medicoAsignado,
      medicoEspecialidad: medicoEspecialidad,
      especialidadRequerida,
      quirofanoId: quirofanoId,
      fechaHora: fechaHora,
      duracionEstimada: duracionEstimada || 60,
    };

    // Ejecutamos el Facade con las validaciones SOLID
    const facade = new GestorCirugiasFacade();
    const resultado = await facade.validarYAgendarCirugia(payload, pool);

    if (resultado.exito) {
      // Guardamos en la base de datos
      const insertQuery = `
        INSERT INTO Cirugias (paciente_rut, medico_id, pabellon_id, tipo, fecha_inicio, fecha_fin, estado)
        VALUES ($1, $2, $3, $4, $5, $6, 'Programada')
        RETURNING id;
      `;
      const fechaInicioDate = parseLocalTimestamp(fechaHora);
      const fechaFinDate = new Date(fechaInicioDate.getTime() + payload.duracionEstimada * 60000);
      const fechaInicioLocal = formatLocalTimestamp(fechaInicioDate);
      const fechaFinLocal = formatLocalTimestamp(fechaFinDate);
      const valoresInsert = [
        rutPaciente,
        medicoAsignado,
        quirofanoId,
        tipoCirugia,
        fechaInicioLocal,
        fechaFinLocal,
      ];
      const nuevaCirugia = await pool.query(insertQuery, valoresInsert);
      const horasAsignadas = Math.max(1, Math.ceil(payload.duracionEstimada / 60));
      await pool.query(
        `UPDATE Medicos SET horas_semanales_acumuladas = horas_semanales_acumuladas + $1 WHERE id = $2`,
        [horasAsignadas, medicoAsignado],
      );

      // Observer — notificar cirugía aprobada
      const gestorEventos = new GestorEventosQuirurgicos();
      const moduloNotificaciones = new ObservadorNotificaciones();
      gestorEventos.suscribir("cirugia_aprobada", moduloNotificaciones);
      gestorEventos.notificar("cirugia_aprobada", payload);

      res.status(200).json({
        exito: true,
        mensaje: resultado.mensaje,
        cirugiaId: nuevaCirugia.rows[0].id,
        medicoAsignado: medicoAsignado,
      });
    } else {
      res.status(400).json({
        exito: false,
        mensaje: resultado.mensaje,
        detalles: resultado.detalles,
      });
    }
  } catch (error) {
    console.error("Error en /api/surgery/schedule:", error);
    res.status(500).json({ error: "Error interno del servidor al procesar la cirugía." });
  }
});

app.get("/api/events/stats", (req, res) => {
  try {
    const stats = obtenerEstadisticasEventos();
    res.json(stats);
  } catch {
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
  } catch {
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
  } catch {
    res.status(500).json({ error: "Error al obtener recursos" });
  }
});

/**
 * GET /api/team
 */
app.get("/api/team", async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.query(`
      SELECT 
        id,
        nombre AS name,
        especialidad AS specialty,
        horas_semanales_acumuladas AS "horasAcumuladas",
        estado,
        CASE 
          WHEN estado = 'Disponible' AND horas_semanales_acumuladas < 36 THEN 'DISPONIBLE'
          WHEN estado = 'Disponible' AND horas_semanales_acumuladas >= 36 THEN 'ALERTA'
          ELSE 'BLOQUEADO'
        END AS status,
        CASE 
          WHEN estado = 'Disponible' THEN true 
          ELSE false 
        END AS disponible,
        UPPER(
          SUBSTRING(nombre FROM 1 FOR 1) ||
          COALESCE(SUBSTRING(nombre FROM POSITION(' ' IN nombre) + 1 FOR 1), '')
        ) AS initials
      FROM Medicos
      ORDER BY horas_semanales_acumuladas ASC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
                prevision AS "previsionSalud", 
                isapre_plan AS "planIsapre",
                tipo_sangre AS "tipoSangre", 
                alergias, 
                enfermedades_cronicas AS "enfermedadesCronicas",
                telefono,
                email,
                direccion,
                contacto_emergencia_nombre AS "contactoEmergenciaNombre",
                contacto_emergencia_telefono AS "contactoEmergenciaTelefono",
                peso_kg AS "peso",
                altura_cm AS "altura",
                observaciones_medicas AS "observacionesMedicas",
                estado AS "estadoPaciente"
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
    const {
      rut,
      nombre,
      fechaNacimiento,
      telefono,
      email,
      sexo,
      direccion,
      contactoEmergenciaNombre,
      contactoEmergenciaTelefono,
      previsionSalud,
      prevision,
      planIsapre,
      tipoSangre,
      alergias,
      enfermedadesCronicas,
      peso,
      altura,
      observacionesMedicas,
      estadoPaciente,
    } = req.body;

    // Validar campos obligatorios según la BD (001_initial_schema.sql)
    if (!rut || !nombre || !fechaNacimiento) {
      return res.status(400).json({
        error: "Faltan campos obligatorios: rut, nombre o fecha de nacimiento",
      });
    }

    const tipoSangreLimpio =
      typeof tipoSangre === "string" && tipoSangre.length <= 10
        ? tipoSangre
        : null;

    let previsionFinal = null;
    if (typeof previsionSalud === "string") {
      previsionFinal = previsionSalud;
    } else if (typeof prevision === "string") {
      previsionFinal = prevision;
    }

    const insertQuery = `
            INSERT INTO Pacientes (
              rut, nombre, fecha_nacimiento, telefono, email,
              sexo, direccion, contacto_emergencia_nombre, contacto_emergencia_telefono,
              prevision, isapre_plan, tipo_sangre, alergias, enfermedades_cronicas,
              peso_kg, altura_cm, observaciones_medicas, estado
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *;
        `;

    const valores = [
      rut,
      nombre,
      fechaNacimiento,
      telefono || null,
      email || null,
      sexo || null,
      direccion || null,
      contactoEmergenciaNombre || null,
      contactoEmergenciaTelefono || null,
      previsionFinal || null,
      planIsapre || null,
      tipoSangreLimpio,
      alergias?.length ? alergias : [],
      enfermedadesCronicas?.length ? enfermedadesCronicas : [],
      peso || null,
      altura || null,
      observacionesMedicas || null,
      estadoPaciente || 'Activo',
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
app.get("/api/surgeries", async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.query(`
      SELECT 
        c.id,
        p.nombre AS patient,
        c.tipo AS type,
        TO_CHAR(c.fecha_inicio, 'HH24:MI') AS "startTime",
        TO_CHAR(c.fecha_fin, 'HH24:MI') AS "endTime",
        c.pabellon_id AS pabellon,
        UPPER(c.estado) AS status,
        COALESCE(c.requiere_uci, false) AS "requiereUCI",
        m.nombre AS medico,
        c.cama_id AS cama
      FROM Cirugias c
      JOIN Pacientes p ON p.rut = c.paciente_rut
      LEFT JOIN Medicos m ON m.id = c.medico_id
      ORDER BY c.fecha_inicio DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error en /api/surgeries:", error);
    res.status(500).json({ error: "Error interno al obtener cirugías" });
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

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ============ RUTAS ESTÁTICAS ============
app.get("*", (req, res, next) => {
  if (req.originalUrl.startsWith("/api/")) return next();
  res.sendFile(path.join(distPath, "index.html"));
});

// ============ MANEJO DE ERRORES ============
/* eslint-disable-next-line no-unused-vars */
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