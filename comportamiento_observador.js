class EstadoHospital {
            constructor() {
                this.observadores = [];
                this.datos = { camasUCI: 17, sangre: 80, insumos: 75 };
            }

            suscribir(obs) { this.observadores.push(obs); }

            setEstado(nuevoEstado) {
                this.datos = { ...this.datos, ...nuevoEstado };
                this.notificar();
            }

            notificar() {
                this.observadores.forEach(obs => obs.actualizar(this.datos));
            }
        }

        // Observador 1: Actualiza Anillos de Progreso
        class UIAnillosObservador {
            actualizar(datos) {
                this._updateRing('uci', datos.camasUCI);
                this._updateRing('sangre', datos.sangre);
                this._updateRing('insumos', datos.insumos);
            }

            _updateRing(key, valor) {
                const el = document.getElementById(`val-${key}`);
                const ring = document.getElementById(`ring-${key}`);
                if (el) el.innerText = `${valor}%`;
                if (ring) {
                    ring.style.borderColor = valor < 20 ? '#ef4444' : (valor < 50 ? '#f59e0b' : '#10b981');
                }
            }
        }

        // Observador 2: Alerta de Emergencia
        class UIEmergenciaObservador {
            actualizar(datos) {
                const btn = document.getElementById('btn-emergencia');
                if (datos.camasUCI < 10) {
                    btn.classList.add('animate-emergency', 'text-red-700', 'border-red-200');
                    btn.classList.remove('text-gray-400', 'border-gray-200');
                } else {
                    btn.classList.remove('animate-emergency', 'text-red-700', 'border-red-200');
                    btn.classList.add('text-gray-400', 'border-gray-200');
                }
            }
        }