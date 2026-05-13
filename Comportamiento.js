// Interfaz de Regla (DIP)
        class IReglaValidacion {
            validar(contexto) { throw "Método no implementado"; }
        }

        // Reglas Concretas (SRP)
        class ReglaCamasDisponibles extends IReglaValidacion {
            validar(ctx) {
                return ctx.camasUCI > 2; // Bloquea si hay 2 o menos
            }
        }

        class ReglaInsumosCriticos extends IReglaValidacion {
            validar(ctx) {
                return ctx.insumos > 10;
            }
        }

        // Motor (OCP: Abierto a nuevas reglas, cerrado a modificación)
        class MotorAgendamiento {
            constructor() {
                this.reglas = [];
            }
            agregarRegla(regla) { this.reglas.push(regla); }
            
            procesar(contextoActual) {
                const resultados = this.reglas.map(r => ({
                    regla: r.constructor.name,
                    pasa: r.validar(contextoActual)
                }));
                return {
                    aprobado: resultados.every(r => r.pasa),
                    detalles: resultados
                };
            }
        }