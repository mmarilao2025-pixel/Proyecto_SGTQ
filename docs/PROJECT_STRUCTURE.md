# SGTQ - Estructura del Proyecto

## 📁 Estructura Reorganizada

```
Proyecto_SGTQ/
│
├── 📂 config/                    # Configuraciones del proyecto
│   ├── 📂 env/                   # Variables de entorno (sensibles)
│   │   ├── 📄 .env               # Variables de entorno reales
│   │   └── 📄 .env.example       # Plantilla de variables
│   ├── 📄 Database.js            # Configuración de base de datos
│   └── 📄 tsconfig.json          # Configuración TypeScript
│
├── 📂 database/                  # Scripts y configuraciones de BD
│   └── 📄 db-init.js             # Inicialización de base de datos
│
├── 📂 docs/                      # Documentación del proyecto
│   ├── 📄 README.md              # Documentación completa
│   ├── 📄 QUICK_START.md         # Guía de inicio rápido
│   └── 📄 STATUS.md              # Estado del proyecto
│
├── 📂 public/                    # Archivos estáticos públicos
│   └── 📄 index.html             # Página principal
│
├── 📂 scripts/                   # Scripts de automatización
│   ├── 📄 install.bat            # Instalación Windows
│   └── 📄 install.sh             # Instalación Unix/Linux
│
├── 📂 src/                       # Código fuente de la aplicación
│   ├── 📂 pages/                 # Componentes de páginas React
│   │   ├── 📄 Dashboard.tsx
│   │   └── 📂 coponents/
│   │       ├── 📄 SurgeryList.tsx
│   │       └── 📄 FatigueCard.tsx
│   ├── 📂 serices/               # Servicios y APIs
│   │   └── 📄 api.ts
│   ├── 📂 types/                 # Definiciones TypeScript
│   │   └── 📄 index.ts
│   ├── 📂 routes/                # Rutas del servidor
│   │   └── 📄 index.js
│   ├── 📄 app.tsx                # Componente raíz React
│   └── 📄 main.tsx               # Punto de entrada React
│
├── 📂 Backend Services           # Servicios backend existentes
│   ├── 📄 cirugiaService.js      # Lógica de agendamiento
│   ├── 📄 Comportamiento.js      # Motor de validación
│   ├── 📄 comportamiento_observador.js
│   ├── 📄 SurgeryBookingFacade.ts
│   └── 📄 ExternalServicesApi.ts
│
├── 📄 .gitignore                 # Archivos ignorados por Git
├── 📄 package.json               # Dependencias y scripts
├── 📄 server.js                  # Servidor principal Express
└── 📄 message (2).txt            # Archivo temporal
```

## 🎯 Beneficios de Esta Estructura

### ✅ **Separación de Responsabilidades**
- **config/**: Todas las configuraciones centralizadas
- **database/**: Todo lo relacionado con BD
- **docs/**: Documentación organizada
- **public/**: Archivos estáticos
- **scripts/**: Automatización
- **src/**: Código fuente limpio

### ✅ **Seguridad Mejorada**
- **config/env/**: Variables sensibles separadas
- **.gitignore**: Archivos sensibles no se suben a Git
- **.env**: Fuera del repositorio

### ✅ **Mantenibilidad**
- Estructura clara y predecible
- Fácil navegación
- Escalabilidad futura

### ✅ **Compatibilidad con Git**
- Ramas pueden trabajar en carpetas específicas
- Conflictos reducidos
- Despliegue más limpio

## 🚀 Ramas y Flujo de Trabajo

### Ramas Recomendadas:
```
main/           # Rama principal (producción)
├── develop/    # Rama de desarrollo
│   ├── feature/dashboard
│   ├── feature/api-endpoints
│   ├── feature/database
│   └── feature/docs
```

### Trabajo por Carpetas:
- **feature/dashboard**: Trabajar en `src/pages/`
- **feature/api**: Trabajar en `src/routes/` y `server.js`
- **feature/database**: Trabajar en `database/` y `config/`
- **feature/docs**: Trabajar en `docs/`

## 📋 Comandos Actualizados

```bash
# Instalación
npm run install:win    # Windows
npm run install:unix   # Unix/Linux

# Base de datos
npm run db:init        # Inicializar BD

# Desarrollo
npm run dev           # Servidor con hot-reload
npm start             # Servidor producción

# Build
npm run build         # Compilar TypeScript
```

## 🔧 Variables de Entorno

**Ubicación**: `config/env/.env`

```env
# Base de Datos
DB_USER=postgres
DB_HOST=localhost
DB_PASSWORD=tu_password
DB_NAME=sgtq_db
DB_PORT=5432

# Servidor
PORT=3000
NODE_ENV=development
```

## 📚 Documentación

- **[docs/README.md](docs/README.md)** - Documentación completa
- **[docs/QUICK_START.md](docs/QUICK_START.md)** - Inicio rápido
- **[docs/STATUS.md](docs/STATUS.md)** - Estado actual

---

**Estructura reorganizada para mejor mantenibilidad y seguridad** ✅
