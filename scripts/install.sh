#!/bin/bash

# SGTQ - Script de Instalación y Ejecución
# Este script automatiza la instalación y puesta en marcha del proyecto

echo "╔════════════════════════════════════════════╗"
echo "║   SGTQ - Sistema de Gestión Quirúrgica    ║"
echo "║        Script de Instalación              ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instálalo desde https://nodejs.org"
    exit 1
fi

echo "✓ Node.js detectado: $(node --version)"
echo "✓ npm detectado: $(npm --version)"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo "✓ Dependencias instaladas"
echo ""

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "⚙️  Creando archivo .env..."
    cp .env.example .env
    echo "✓ Archivo .env creado. Por favor edítalo con tus credenciales de BD"
fi

echo ""
echo "✅ Instalación completada"
echo ""
echo "Para iniciar el servidor, ejecuta:"
echo "  npm start       (producción)"
echo "  npm run dev     (desarrollo con hot-reload)"
echo ""
