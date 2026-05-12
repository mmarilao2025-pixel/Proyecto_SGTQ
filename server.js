const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './config/env/.env' });
const path = require('path');

// Importar servicios
const { agendarCirugiaAtomica } = require('./cirugiaService');

// Simulación de GestorCirugiasFacade si no está compilado
const GestorCirugiasFacade = class {
  constructor() {
    this.inventario = { verificarMateriales: () => true };
    this.camasUci = { verificarDisponibilidad: () => true };
    this.fatigaValidator = { validarDescansoMedico: (horas) => horas < 44 };
  }

  async validarYAgendarCirugia(pacienteId, medicoId, tipoCirugia, requiereUci) {
    console.log("=== INICIANDO PROTOCOLO DE VALIDACIÓN DE CIRUGÍA (FACADE) ===");
    try {
      if (!this.inventario.verificarMateriales(tipoCirugia)) {
        throw new Error("No hay materiales suficientes en inventario.");
      }
      if (requiereUci && !this.camasUci.verificarDisponibilidad()) {
        throw new Error("No hay camas UCI disponibles. Alerta Roja.");
      }
      if (!this.fatigaValidator.validarDescansoMedico(40)) {
        throw new Error("El médico ha superado el límite de horas (Riesgo de Fatiga).");
      }
      console.log("=== VALIDACIÓN EXITOSA: CIRUGÍA AGENDADA ===");
      return { exito: true, mensaje: "Cirugía agendada en el sistema." };
    } catch (error) {
      console.error(`=== FALLO EN VALIDACIÓN: ${error.message} ===`);
      return { exito: false, mensaje: error.message };
    }
  }
};

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos desde public

// ============ RUTAS API ============

/**
 * GET /api/dashboard
 * Obtiene los datos actuales del dashboard
 */
app.get('/api/dashboard', (req, res) => {
    try {
        const dashboardData = {
            uciAvailability: 17,
            bloodSupply: 80,
            suppliesStatus: 75,
            activeTeam: [
                {
                    id: 1,
                    name: 'Dr. Andrés Morales',
                    specialty: 'Cirugía General',
                    status: 'ALERTA',
                    initials: 'AM'
                },
                {
                    id: 2,
                    name: 'Dr. Felipe Soto',
                    specialty: 'Cardiovascular',
                    status: 'BLOQUEADO',
                    initials: 'FS'
                }
            ],
            surgeries: [
                {
                    id: 1,
                    patient: 'Paciente A',
                    type: 'Cirugía General',
                    startTime: '08:00',
                    endTime: '10:30',
                    pabellon: 1,
                    status: 'EN PROGRESO'
                }
            ]
        };
        res.json(dashboardData);
    } catch (error) {
        console.error('Error en /api/dashboard:', error);
        res.status(500).json({ error: 'Error al obtener datos del dashboard' });
    }
});

/**
 * POST /api/surgery/schedule
 * Agenda una nueva cirugía validando todas las restricciones
 */
app.post('/api/surgery/schedule', async (req, res) => {
    try {
        const { pacienteId, medicoId, tipoCirugia, requiereUci } = req.body;

        // Validar entrada
        if (!pacienteId || !medicoId || !tipoCirugia) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        // Usar la Fachada para validar y agendar
        const facade = new GestorCirugiasFacade();
        const resultado = await facade.validarYAgendarCirugia(
            pacienteId,
            medicoId,
            tipoCirugia,
            requiereUci || false
        );

        if (resultado.exito) {
            res.json({ 
                exito: true, 
                mensaje: resultado.mensaje,
                id: Math.random().toString(36).substr(2, 9)
            });
        } else {
            res.status(400).json({ 
                exito: false, 
                error: resultado.mensaje 
            });
        }
    } catch (error) {
        console.error('Error en /api/surgery/schedule:', error);
        res.status(500).json({ error: 'Error al agendar cirugía' });
    }
});

/**
 * POST /api/surgery/atomic
 * Agenda una cirugía de forma atómica con transacciones
 */
app.post('/api/surgery/atomic', async (req, res) => {
    try {
        const { rutPaciente, pabellonId, camaId, tipoCirugia, fechaInicio, fechaFin } = req.body;

        // Validar entrada
        if (!rutPaciente || !pabellonId || !camaId || !tipoCirugia) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        // Ejecutar agendamiento atómico
        const resultado = await agendarCirugiaAtomica(
            rutPaciente,
            pabellonId,
            camaId,
            tipoCirugia,
            fechaInicio,
            fechaFin
        );

        if (resultado.exito) {
            res.json(resultado);
        } else {
            res.status(400).json(resultado);
        }
    } catch (error) {
        console.error('Error en /api/surgery/atomic:', error);
        res.status(500).json({ error: 'Error en transacción de cirugía' });
    }
});

/**
 * GET /api/resources
 * Obtiene el estado de recursos disponibles
 */
app.get('/api/resources', (req, res) => {
    try {
        const resources = {
            camasUCI: {
                total: 20,
                disponibles: 3,
                ocupadas: 17,
                porcentaje: 85
            },
            sangre: {
                total: 100,
                disponible: 80,
                porcentaje: 80
            },
            insumos: {
                ok: true,
                cantidad: 150,
                porcentaje: 75
            },
            pabellones: {
                total: 5,
                disponibles: 2,
                ocupados: 3
            }
        };
        res.json(resources);
    } catch (error) {
        console.error('Error en /api/resources:', error);
        res.status(500).json({ error: 'Error al obtener recursos' });
    }
});

/**
 * GET /api/team
 * Obtiene el estado del equipo médico
 */
app.get('/api/team', (req, res) => {
    try {
        const team = [
            {
                id: 1,
                name: 'Dr. Andrés Morales',
                specialty: 'Cirugía General',
                status: 'ALERTA',
                horasAcumuladas: 40,
                disponible: false
            },
            {
                id: 2,
                name: 'Dr. Felipe Soto',
                specialty: 'Cardiovascular',
                status: 'BLOQUEADO',
                horasAcumuladas: 48,
                disponible: false
            },
            {
                id: 3,
                name: 'Dra. María García',
                specialty: 'Ginecología',
                status: 'DISPONIBLE',
                horasAcumuladas: 32,
                disponible: true
            }
        ];
        res.json(team);
    } catch (error) {
        console.error('Error en /api/team:', error);
        res.status(500).json({ error: 'Error al obtener equipo' });
    }
});

/**
 * GET /api/surgeries
 * Obtiene las cirugías programadas
 */
app.get('/api/surgeries', (req, res) => {
    try {
        const surgeries = [
            {
                id: 1,
                patient: 'Juan Pérez',
                type: 'Apendicectomía',
                startTime: '08:00',
                endTime: '09:30',
                pabellon: 1,
                status: 'EN PROGRESO',
                requiereUCI: true
            },
            {
                id: 2,
                patient: 'María López',
                type: 'Colecistectomía',
                startTime: '10:00',
                endTime: '11:45',
                pabellon: 2,
                status: 'PROGRAMADA',
                requiereUCI: false
            }
        ];
        res.json(surgeries);
    } catch (error) {
        console.error('Error en /api/surgeries:', error);
        res.status(500).json({ error: 'Error al obtener cirugías' });
    }
});

/**
 * GET /api/health
 * Verificar que el servidor está activo
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============ RUTAS ESTÁTICAS ============

/**
 * GET / o /index.html
 * Servir la página principal
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ MANEJO DE ERRORES ============

app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============ INICIAR SERVIDOR ============

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════╗
    ║   SGTQ - Sistema de Gestión Quirúrgica    ║
    ║   Servidor ejecutándose en puerto ${PORT}       ║
    ║   http://localhost:${PORT}                    ║
    ╚════════════════════════════════════════════╝
    `);
});
