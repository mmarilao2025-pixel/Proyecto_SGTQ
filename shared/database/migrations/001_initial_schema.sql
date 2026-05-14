-- Migración inicial para SGTQ - Sistema de Gestión de Turnos Quirúrgicos
-- Crear tablas con constraints para integridad referencial y validaciones críticas

-- Tabla de Pacientes
CREATE TABLE IF NOT EXISTS Pacientes (
    rut VARCHAR(12) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(15),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Médicos
CREATE TABLE IF NOT EXISTS Medicos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(50) NOT NULL,
    horas_semanales_acumuladas INTEGER DEFAULT 0 CHECK (horas_semanales_acumuladas >= 0),
    estado VARCHAR(20) DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Fatigado', 'Ausente')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Pabellones
CREATE TABLE IF NOT EXISTS Pabellones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Reservado', 'Mantenimiento')),
    capacidad INTEGER DEFAULT 1 CHECK (capacidad > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Camas UCI
CREATE TABLE IF NOT EXISTS Camas (
    id SERIAL PRIMARY KEY,
    pabellon_id INTEGER REFERENCES Pabellones(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Reservado', 'Ocupado')),
    requiere_uci BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pabellon_id, numero)
);

-- Tabla de Cirugías (transaccional)
CREATE TABLE IF NOT EXISTS Cirugias (
    id SERIAL PRIMARY KEY,
    paciente_rut VARCHAR(12) REFERENCES Pacientes(rut) ON DELETE CASCADE,
    medico_id INTEGER REFERENCES Medicos(id) ON DELETE CASCADE,
    pabellon_id INTEGER REFERENCES Pabellones(id) ON DELETE CASCADE,
    cama_id INTEGER REFERENCES Camas(id) ON DELETE SET NULL,
    tipo VARCHAR(100) NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    requiere_uci BOOLEAN DEFAULT FALSE,
    estado VARCHAR(20) DEFAULT 'Programada' CHECK (estado IN ('Programada', 'En Progreso', 'Completada', 'Cancelada')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (fecha_fin > fecha_inicio)
);

-- Índices para optimizar consultas críticas
CREATE INDEX IF NOT EXISTS idx_cirugias_fecha ON Cirugias(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_cirugias_medico ON Cirugias(medico_id);
CREATE INDEX IF NOT EXISTS idx_cirugias_pabellon ON Cirugias(pabellon_id);
CREATE INDEX IF NOT EXISTS idx_medicos_fatiga ON Medicos(horas_semanales_acumuladas);

-- Comentarios para documentación
COMMENT ON TABLE Cirugias IS 'Tabla principal para agendamiento transaccional de cirugías';
COMMENT ON COLUMN Medicos.horas_semanales_acumuladas IS 'Control de fatiga médica - máximo 44 horas/semana';