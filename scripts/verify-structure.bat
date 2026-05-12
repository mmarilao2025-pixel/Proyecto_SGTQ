@echo off
REM SGTQ - Script de Verificación Post-Reorganización (Windows)
REM Verifica que todos los archivos estén en su lugar correcto

echo.
echo ╔══════════════════════════════════════════════╗
echo ║   SGTQ - Verificación de Estructura          ║
echo ╚══════════════════════════════════════════════╝
echo.

REM Función para verificar si existe un archivo/directorio
:check_path
setlocal enabledelayedexpansion
set "path=%~1"
set "description=%~2"

if exist "%path%" (
    echo ✅ %description%: %path%
    exit /b 0
) else (
    echo ❌ FALTA %description%: %path%
    exit /b 1
)
endlocal

echo 📁 Verificando estructura de directorios...
echo.

REM Verificar directorios principales
call :check_path "config\" "Directorio de configuración"
call :check_path "config\env\" "Directorio de variables de entorno"
call :check_path "database\" "Directorio de base de datos"
call :check_path "docs\" "Directorio de documentación"
call :check_path "public\" "Directorio de archivos estáticos"
call :check_path "scripts\" "Directorio de scripts"
call :check_path "src\" "Directorio de código fuente"
call :check_path "src\pages\" "Directorio de páginas React"
call :check_path "src\serices\" "Directorio de servicios"
call :check_path "src\types\" "Directorio de tipos TypeScript"
call :check_path "src\routes\" "Directorio de rutas"

echo.
echo 📄 Verificando archivos de configuración...
echo.

REM Verificar archivos de configuración
call :check_path "config\env\.env.example" "Archivo de ejemplo de variables de entorno"
call :check_path "config\Database.js" "Archivo de configuración de base de datos"
call :check_path "config\tsconfig.json" "Archivo de configuración TypeScript"
call :check_path ".gitignore" "Archivo .gitignore"

echo.
echo 📚 Verificando documentación...
echo.

REM Verificar documentación
call :check_path "docs\README.md" "Documentación principal"
call :check_path "docs\QUICK_START.md" "Guía de inicio rápido"
call :check_path "docs\STATUS.md" "Estado del proyecto"
call :check_path "docs\PROJECT_STRUCTURE.md" "Estructura del proyecto"
call :check_path "docs\GIT_WORKFLOW.md" "Flujo de trabajo Git"
call :check_path "README.md" "README raíz"

echo.
echo 🔧 Verificando scripts de automatización...
echo.

REM Verificar scripts
call :check_path "scripts\install.bat" "Script de instalación Windows"
call :check_path "scripts\install.sh" "Script de instalación Unix"
call :check_path "database\db-init.js" "Script de inicialización BD"

echo.
echo 🌐 Verificando archivos web...
echo.

REM Verificar archivos web
call :check_path "public\index.html" "Página principal HTML"
call :check_path "server.js" "Servidor principal"

echo.
echo ⚛️  Verificando componentes React...
echo.

REM Verificar componentes React
call :check_path "src\main.tsx" "Punto de entrada React"
call :check_path "src\app.tsx" "Componente raíz React"
call :check_path "src\pages\Dashboard.tsx" "Componente Dashboard"
call :check_path "src\pages\coponents\SurgeryList.tsx" "Componente SurgeryList"
call :check_path "src\pages\coponents\FatigueCard.tsx" "Componente FatigueCard"
call :check_path "src\serices\api.ts" "Servicio API"
call :check_path "src\types\index.ts" "Definiciones de tipos"

echo.
echo 🔗 Verificando rutas del servidor...
echo.

REM Verificar rutas
call :check_path "src\routes\index.js" "Rutas del servidor"

echo.
echo 🏗️  Verificando servicios backend...
echo.

REM Verificar servicios backend
call :check_path "cirugiaService.js" "Servicio de cirugías"
call :check_path "Comportamiento.js" "Motor de validación"
call :check_path "comportamiento_observador.js" "Patrón Observer"
call :check_path "SurgeryBookingFacade.ts" "Fachada de agendamiento"
call :check_path "ExternalServicesApi.ts" "APIs externas"

echo.
echo 📦 Verificando package.json...
echo.

REM Verificar contenido de package.json
findstr /C:"\"start\": \"node server.js\"" package.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Script start correcto en package.json
) else (
    echo ❌ ERROR Script start en package.json
)

findstr /C:"\"dev\": \"nodemon server.js\"" package.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Script dev correcto en package.json
) else (
    echo ❌ ERROR Script dev en package.json
)

findstr /C:"config/tsconfig.json" package.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Ruta tsconfig correcta en package.json
) else (
    echo ❌ ERROR Ruta tsconfig en package.json
)

echo.
echo 🎯 Verificación completada!
echo.
echo 💡 Próximos pasos:
echo    1. Copia config\env\.env.example a config\env\.env
echo    2. Configura tus credenciales de PostgreSQL
echo    3. Ejecuta: npm run db:init
echo    4. Ejecuta: npm start
echo    5. Visita: http://localhost:3000
echo.
pause