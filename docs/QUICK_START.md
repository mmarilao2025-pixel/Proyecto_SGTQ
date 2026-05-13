# GUÍA DE INICIO RÁPIDO - SGTQ

## ⚡ Pasos para poner en marcha el proyecto

### 1️⃣ Requisitos Previos
- **Node.js 16+**: Descargar desde https://nodejs.org/
- **PostgreSQL 12+**: Descargar desde https://www.postgresql.org/
- **Git** (opcional): Descargar desde https://git-scm.com/

### 2️⃣ Instalación Rápida (Windows)
```bash
# Hacer doble clic en install.bat
# O ejecutar en PowerShell:
.\install.bat
```

### 3️⃣ Instalación Rápida (Mac/Linux)
```bash
# Dar permisos y ejecutar:
chmod +x install.sh
./install.sh
```

### 4️⃣ Configurar Base de Datos
```bash
# Editar el archivo .env con tus credenciales:
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_NAME=sgtq_db
DB_PORT=5432
```

### 5️⃣ Ejecutar el Servidor

**Modo Desarrollo** (con auto-reload):
```bash
npm run dev
```

**Modo Producción**:
```bash
npm start
```

### 6️⃣ Acceder a la Aplicación
Abrir en el navegador:
```
http://localhost:3000
```

## 📋 Estructura del Proyecto

```
Proyecto_SGTQ/
├── index.html              ← Interfaz principal
├── server.js               ← Servidor Express
├── package.json            ← Dependencias
├── tsconfig.json           ← Configuración TypeScript
├── .env.example            ← Variables de entorno
├── db-init.js              ← Inicialización de BD
├── install.bat/sh          ← Script de instalación
│
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   └── coponents/
│   │       ├── SurgeryList.tsx
│   │       └── FatigueCard.tsx
│   ├── serices/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── app.tsx
│   └── main.tsx
│
├── Backend Services
│   ├── Database.js                 ← Conexión a BD
│   ├── cirugiaService.js           ← Lógica de agendamiento
│   ├── SurgeryBookingFacade.ts     ← Fachada de validaciones
│   ├── ExternalServicesApi.ts      ← APIs externas
│   ├── Comportamiento.js           ← Motor de validación
│   └── comportamiento_observador.js ← Patrón Observer
```

## 🔧 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala todas las dependencias |
| `npm start` | Inicia el servidor (producción) |
| `npm run dev` | Inicia con nodemon (desarrollo) |
| `npm run build` | Compila TypeScript |
| `npm test` | Ejecuta pruebas |

## 🚀 Endpoints API Disponibles

### Dashboard
- `GET /api/dashboard` - Datos completos del dashboard
- `GET /api/health` - Estado del servidor

### Cirugías
- `POST /api/surgery/schedule` - Agendar con validaciones
- `POST /api/surgery/atomic` - Agendamiento atómico
- `GET /api/surgeries` - Listar cirugías

### Recursos
- `GET /api/resources` - Estado de recursos
- `GET /api/team` - Estado del equipo médico

## 📝 Ejemplo de Uso de API

### Agendar una Cirugía
```bash
curl -X POST http://localhost:3000/api/surgery/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "pacienteId": 123,
    "medicoId": 1,
    "tipoCirugia": "Apendicectomía",
    "requiereUci": true
  }'
```

Respuesta exitosa:
```json
{
  "exito": true,
  "mensaje": "Cirugía agendada en el sistema.",
  "id": "abc123def456"
}
```

## ⚠️ Troubleshooting

### Error: "Cannot find module 'pg'"
```bash
npm install pg
```

### Error: "ECONNREFUSED - PostgreSQL no responde"
- Verificar que PostgreSQL está ejecutándose
- Verificar credenciales en .env
- Verificar host y puerto en .env

### Error: "Port 3000 already in use"
```bash
# Cambiar puerto en .env
PORT=3001
```

### El dashboard no carga
- Verificar que el servidor está corriendo
- Abrir consola de desarrollador (F12)
- Verificar errores en Network y Console

## 📚 Documentación Completa

Ver [README.md](./README.md) para documentación detallada

## 🆘 Soporte

Si tienes problemas:
1. Consulta el README.md
2. Revisa los logs del servidor
3. Verifica que todas las dependencias estén instaladas
4. Asegúrate que PostgreSQL está corriendo

---

**¡Listo! Tu sistema SGTQ está configurado y funcionando** ✅
