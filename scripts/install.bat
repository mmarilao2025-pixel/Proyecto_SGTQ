@echo off
REM SGTQ - Script de Instalación y Ejecución (Windows)
REM Este script automatiza la instalación y puesta en marcha del proyecto

echo.
echo ╔════════════════════════════════════════════╗
echo ║   SGTQ - Sistema de Gestión Quirúrgica    ║
echo ║   Script de Instalación ^(Windows^)         ║
echo ╚════════════════════════════════════════════╝
echo.

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado.
    echo    Descárgalo desde https://nodejs.org
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✓ Node.js detectado: %NODE_VERSION%
echo ✓ npm detectado: %NPM_VERSION%
echo.

REM Instalar dependencias
echo 📦 Instalando dependencias...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias
    exit /b 1
)

echo ✓ Dependencias instaladas
echo.

REM Crear archivo .env si no existe
if not exist "config\env\.env" (
    echo ⚙️  Creando archivo .env...
    copy "config\env\.env.example" "config\env\.env"
    echo ✓ Archivo .env creado. Por favor edítalo con tus credenciales de BD
)

echo.
echo ✅ Instalación completada
echo.
echo Para iniciar el servidor, ejecuta:
echo   npm start       ^(producción^)
echo   npm run dev     ^(desarrollo con hot-reload^)
echo.
pause
