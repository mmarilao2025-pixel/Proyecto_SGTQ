#!/bin/bash

# SGTQ - Script de Verificación Post-Reorganización
# Verifica que todos los archivos estén en su lugar correcto

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   SGTQ - Verificación de Estructura          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Función para verificar si existe un archivo/directorio
check_path() {
    local path="$1"
    local description="$2"

    if [ -e "$path" ]; then
        echo "✅ $description: $path"
        return 0
    else
        echo "❌ FALTA $description: $path"
        return 1
    fi
}

# Función para verificar si un archivo contiene cierto texto
check_content() {
    local file="$1"
    local pattern="$2"
    local description="$3"

    if [ -f "$file" ] && grep -q "$pattern" "$file"; then
        echo "✅ $description: $file"
        return 0
    else
        echo "❌ ERROR $description: $file"
        return 1
    fi
}

echo "📁 Verificando estructura de directorios..."
echo ""

# Verificar directorios principales
check_path "config/" "Directorio de configuración"
check_path "config/env/" "Directorio de variables de entorno"
check_path "database/" "Directorio de base de datos"
check_path "docs/" "Directorio de documentación"
check_path "public/" "Directorio de archivos estáticos"
check_path "scripts/" "Directorio de scripts"
check_path "src/" "Directorio de código fuente"
check_path "src/pages/" "Directorio de páginas React"
check_path "src/serices/" "Directorio de servicios"
check_path "src/types/" "Directorio de tipos TypeScript"
check_path "src/routes/" "Directorio de rutas"

echo ""
echo "📄 Verificando archivos de configuración..."
echo ""

# Verificar archivos de configuración
check_path "config/env/.env.example" "Archivo de ejemplo de variables de entorno"
check_path "config/Database.js" "Archivo de configuración de base de datos"
check_path "config/tsconfig.json" "Archivo de configuración TypeScript"
check_path ".gitignore" "Archivo .gitignore"

echo ""
echo "📚 Verificando documentación..."
echo ""

# Verificar documentación
check_path "docs/README.md" "Documentación principal"
check_path "docs/QUICK_START.md" "Guía de inicio rápido"
check_path "docs/STATUS.md" "Estado del proyecto"
check_path "docs/PROJECT_STRUCTURE.md" "Estructura del proyecto"
check_path "docs/GIT_WORKFLOW.md" "Flujo de trabajo Git"
check_path "README.md" "README raíz"

echo ""
echo "🔧 Verificando scripts de automatización..."
echo ""

# Verificar scripts
check_path "scripts/install.bat" "Script de instalación Windows"
check_path "scripts/install.sh" "Script de instalación Unix"
check_path "database/db-init.js" "Script de inicialización BD"

echo ""
echo "🌐 Verificando archivos web..."
echo ""

# Verificar archivos web
check_path "public/index.html" "Página principal HTML"
check_path "server.js" "Servidor principal"

echo ""
echo "⚛️  Verificando componentes React..."
echo ""

# Verificar componentes React
check_path "src/main.tsx" "Punto de entrada React"
check_path "src/app.tsx" "Componente raíz React"
check_path "src/pages/Dashboard.tsx" "Componente Dashboard"
check_path "src/pages/coponents/SurgeryList.tsx" "Componente SurgeryList"
check_path "src/pages/coponents/FatigueCard.tsx" "Componente FatigueCard"
check_path "src/serices/api.ts" "Servicio API"
check_path "src/types/index.ts" "Definiciones de tipos"

echo ""
echo "🔗 Verificando rutas del servidor..."
echo ""

# Verificar rutas
check_path "src/routes/index.js" "Rutas del servidor"

echo ""
echo "🏗️  Verificando servicios backend..."
echo ""

# Verificar servicios backend
check_path "cirugiaService.js" "Servicio de cirugías"
check_path "Comportamiento.js" "Motor de validación"
check_path "comportamiento_observador.js" "Patrón Observer"
check_path "SurgeryBookingFacade.ts" "Fachada de agendamiento"
check_path "ExternalServicesApi.ts" "APIs externas"

echo ""
echo "🔍 Verificando contenido de archivos críticos..."
echo ""

# Verificar contenido crítico
check_content "server.js" "config/env/.env" "Ruta correcta de .env en server.js"
check_content "package.json" "config/tsconfig.json" "Ruta correcta de tsconfig en package.json"
check_content "cirugiaService.js" "./config/Database" "Ruta correcta de Database.js"
check_content ".gitignore" ".env" "Archivo .env ignorado por Git"

echo ""
echo "📦 Verificando package.json..."
echo ""

# Verificar package.json
check_content "package.json" "\"start\": \"node server.js\"" "Script start correcto"
check_content "package.json" "\"dev\": \"nodemon server.js\"" "Script dev correcto"
check_content "package.json" "\"build\": \"tsc --project config/tsconfig.json\"" "Script build correcto"

echo ""
echo "🎯 Verificación completada!"
echo ""
echo "💡 Próximos pasos:"
echo "   1. Copia config/env/.env.example a config/env/.env"
echo "   2. Configura tus credenciales de PostgreSQL"
echo "   3. Ejecuta: npm run db:init"
echo "   4. Ejecuta: npm start"
echo "   5. Visita: http://localhost:3000"
echo ""
