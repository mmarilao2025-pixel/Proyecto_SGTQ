.PHONY: dev install lint fmt check test test-clean sonar

# Equivalencias con el Makefile del template Python del profe:
#   uv run  →  npx / npm run
#   ruff    →  eslint + prettier
#   ty      →  tsc --noEmit
#   pytest  →  jest

dev:
	npm run dev

install:
	npm install

# Equivalente a: make lint (ruff check)
lint:
	npm run lint

# Equivalente a: make fmt (ruff format)
fmt:
	npx prettier --write "backend/**/*.js" "shared/**/*.js" "frontend/src/**/*.{ts,tsx}"

# Verificar formato sin modificar archivos (usado en CI)
fmt-check:
	npx prettier --check "backend/**/*.js" "shared/**/*.js" "frontend/src/**/*.{ts,tsx}"

# Equivalente a: make check (ty check)
check:
	npm run type-check

# Equivalente a: make test (pytest)
test:
	npm run test:coverage

# Equivalente a: make test-clean
test-clean:
	rm -rf coverage

# Correr lint + fmt-check + check + test en secuencia (útil antes de hacer push)
ci:
	npm run lint
	$(MAKE) fmt-check
	npm run type-check
	npm run test:coverage