# SGTQ - Guía de Ramas y Flujo de Trabajo

## 🌿 Estrategia de Ramas

### Ramas Principales
```
main (o master)
└── develop
    ├── feature/dashboard-improvements
    ├── feature/api-validation
    ├── feature/database-optimization
    └── feature/documentation
```

### Convenciones de Nombres
- `main`: Rama de producción
- `develop`: Rama de desarrollo integrada
- `feature/*`: Nuevas funcionalidades
- `bugfix/*`: Corrección de bugs
- `hotfix/*`: Correcciones urgentes en producción
- `release/*`: Preparación para release

## 🔄 Flujo de Trabajo Git Flow

### 1. Desarrollo de Nueva Feature
```bash
# Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# Trabajar en la feature...
git add .
git commit -m "feat: descripción de la funcionalidad"

# Push de la rama
git push origin feature/nueva-funcionalidad
```

### 2. Pull Request
- Crear PR desde `feature/*` hacia `develop`
- Revisión de código por compañero
- Tests pasan
- Merge a `develop`

### 3. Release
```bash
# Crear rama de release
git checkout develop
git checkout -b release/v1.0.0

# Preparar release (versiones, changelog)
npm version patch
git add .
git commit -m "chore: prepare release v1.0.0"

# Merge a main
git checkout main
git merge release/v1.0.0

# Tag
git tag v1.0.0
git push origin main --tags
```

## 📁 Trabajo por Áreas (Estructura Reorganizada)

### Frontend (`src/`)
- **Rama**: `feature/frontend-*`
- **Archivos**: `src/pages/`, `src/components/`, `public/`
- **Responsable**: Desarrollador Frontend

### Backend (`src/routes/`, `server.js`)
- **Rama**: `feature/backend-*`
- **Archivos**: `src/routes/`, `server.js`, servicios backend
- **Responsable**: Desarrollador Backend

### Base de Datos (`database/`, `config/`)
- **Rama**: `feature/database-*`
- **Archivos**: `database/`, `config/Database.js`
- **Responsable**: DBA/Developer

### Configuración (`config/`)
- **Rama**: `feature/config-*`
- **Archivos**: `config/`, `.env.example`
- **Responsable**: DevOps/Developer

### Documentación (`docs/`)
- **Rama**: `feature/docs-*`
- **Archivos**: `docs/`
- **Responsable**: Technical Writer/Developer

## 🛡️ Seguridad y Variables de Entorno

### Archivos Sensibles (NO subir a Git)
- `config/env/.env` - Variables reales
- Credenciales de BD
- API Keys
- Secrets

### Archivos de Plantilla (SÍ subir a Git)
- `config/env/.env.example` - Plantilla con valores dummy
- Documentación de variables necesarias

### Configuración por Entorno
```bash
# Desarrollo
config/env/.env.development

# Testing
config/env/.env.test

# Producción
config/env/.env.production
```

## 🔧 Comandos Útiles por Rama

### Desarrollo General
```bash
# Ver rama actual
git branch --show-current

# Ver estado
git status

# Ver diferencias
git diff

# Cambiar de rama
git checkout nombre-rama
```

### Trabajo con Features
```bash
# Crear feature
git checkout -b feature/nueva-funcionalidad

# Actualizar desde develop
git checkout develop
git pull origin develop
git checkout feature/nueva-funcionalidad
git rebase develop

# Resolver conflictos si los hay
git add .
git rebase --continue

# Push de feature
git push origin feature/nueva-funcionalidad
```

### Limpieza
```bash
# Eliminar rama local después de merge
git branch -d feature/terminada

# Eliminar rama remota
git push origin --delete feature/terminada

# Limpiar ramas merged
git branch --merged develop | grep -v develop | xargs git branch -d
```

## 📋 Checklist Pre-Merge

### Antes de crear PR:
- [ ] Tests pasan localmente
- [ ] Código revisado (linting)
- [ ] Documentación actualizada
- [ ] Variables de entorno documentadas
- [ ] No hay archivos sensibles commited

### Durante PR:
- [ ] Revisión por al menos 1 compañero
- [ ] CI/CD pasa (si aplica)
- [ ] No hay conflictos con `develop`
- [ ] Funcionalidad probada en staging

## 🚨 Ramas de Emergencia (Hotfix)

### Para bugs críticos en producción:
```bash
# Crear hotfix desde main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# Corregir bug
# Tests
# Commit

# Merge directo a main
git checkout main
git merge hotfix/critical-bug-fix

# También merge a develop
git checkout develop
git merge hotfix/critical-bug-fix

# Tag si es necesario
git tag hotfix-v1.0.1
```

## 📊 Monitoreo de Ramas

### Ramas Activas
```bash
# Ver todas las ramas
git branch -a

# Ver ramas remotas
git branch -r

# Ver estado de ramas
git log --oneline --graph --all
```

### Limpieza Periódica
- Eliminar ramas merged hace más de 1 semana
- Archivar features abandonadas
- Mantener `develop` y `main` limpias

## 🎯 Mejores Prácticas

### Commits
- Usar commits convencionales: `feat:`, `fix:`, `docs:`, `chore:`
- Mensajes descriptivos en español
- Commits pequeños y enfocados

### Branches
- Nombres descriptivos pero cortos
- Prefijo por tipo: `feature/`, `bugfix/`, `hotfix/`
- Eliminar branches después del merge

### Code Review
- Al menos 1 aprobación por PR
- Revisar funcionalidad, no solo código
- Tests incluidos en la revisión

---

**Flujo de trabajo optimizado para equipos colaborativos** ✅
