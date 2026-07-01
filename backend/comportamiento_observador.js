// Interfaz del Observer
class IObserver {
  actualizar(evento, datos) {
    throw new Error("Método actualizar no implementado");
  }

  getNombre() {
    throw new Error("Método getNombre no implementado");
  }
}

// 📱 NUEVO: Observador Concreto para WhatsApp / Correo
class ObservadorNotificaciones extends IObserver {
  actualizar(evento, datos) {
    if (evento === "cirugia_aprobada") {
      this.enviarWhatsAppSimulado(datos);
    }
  }

  getNombre() {
    return "ObservadorNotificaciones";
  }

  enviarWhatsAppSimulado(datos) {
    console.log("\n=======================================================");
    console.log("📱 [NOTIFICACIÓN SGTQ] Disparando simulación de WhatsApp...");
    console.log(`Para Paciente RUT: ${datos.rutPaciente || datos.pacienteId}`);
    console.log(
      `Mensaje: "Estimado/a paciente, su procedimiento de ${datos.tipoSurgery || datos.tipoCirugia} ha sido programado con éxito."`,
    );
    console.log("=======================================================\n");
  }
}

// Subject (Observable) - Gestor de Eventos Quirúrgicos
class GestorEventosQuirurgicos {
  constructor() {
    this.observadores = new Map(); // Mapa de tipo de evento -> lista de observadores
    this.historialEventos = [];
    this.eventosActivos = new Set();
  }

  // Suscribir observador a un tipo específico de evento
  suscribir(tipoEvento, observador) {
    if (!this.observadores.has(tipoEvento)) {
      this.observadores.set(tipoEvento, []);
    }
    this.observadores.get(tipoEvento).push(observador);
    console.log(
      `✅ Observador ${observador.getNombre()} suscrito al evento: ${tipoEvento}`,
    );
  }

  // Desuscribir observador de un tipo de evento
  desuscribir(tipoEvento, observador) {
    if (this.observadores.has(tipoEvento)) {
      const lista = this.observadores.get(tipoEvento);
      const indice = lista.indexOf(observador);
      if (indice > -1) {
        lista.splice(indice, 1);
        console.log(
          `❌ Observador ${observador.getNombre()} desuscrito del evento: ${tipoEvento}`,
        );
      }
    }
  }

  // Notificar a todos los observadores de un tipo de evento
  notificar(tipoEvento, datos) {
    const evento = {
      tipo: tipoEvento,
      datos: datos,
      timestamp: new Date().toISOString(),
      id: this.generarIdEvento(),
    };

    // Registrar en historial
    this.historialEventos.push(evento);
    this.eventosActivos.add(evento.id);

    // Notificar observadores
    if (this.observadores.has(tipoEvento)) {
      const observadores = this.observadores.get(tipoEvento);
      observadores.forEach((observador) => {
        try {
          observador.actualizar(tipoEvento, datos);
        } catch (error) {
          console.error(
            `❌ Error notificando a ${observador.getNombre()}:`,
            error,
          );
        }
      });
    }

    console.log(`📢 Evento notificado: ${tipoEvento} (ID: ${evento.id})`);
  }

  // Marcar evento como procesado
  marcarEventoProcesado(idEvento) {
    this.eventosActivos.delete(idEvento);
  }

  // Generar ID único para evento
  generarIdEvento() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Obtener estadísticas de eventos
  obtenerEstadisticas() {
    const tiposEventos = {};
    this.historialEventos.forEach((evento) => {
      tiposEventos[evento.tipo] = (tiposEventos[evento.tipo] || 0) + 1;
    });

    return {
      totalEventos: this.historialEventos.length,
      eventosActivos: this.eventosActivos.size,
      tiposEventos: tiposEventos,
      ultimoEvento: this.historialEventos[this.historialEventos.length - 1],
    };
  }

  // Limpiar historial antiguo (mantener últimos N eventos)
  limpiarHistorial(maxEventos = 1000) {
    if (this.historialEventos.length > maxEventos) {
      const eventosRemovidos = this.historialEventos.splice(
        0,
        this.historialEventos.length - maxEventos,
      );
      console.log(
        `🧹 Limpiados ${eventosRemovidos.length} eventos antiguos del historial`,
      );
    }
  }
}

// Observadores Especializados para el Dominio Médico

// Observador de Admisión
class ObservadorAdmision extends IObserver {
  constructor() {
    super();
    this.pacientesAdmitidos = new Set();
  }

  actualizar(evento, datos) {
    switch (evento) {
      case "cirugia_aprobada":
        console.log(
          `🏥 [ADMISIÓN] Paciente aprobado para cirugía. Preparando admisión.`,
        );
        if (datos.pacienteId) this.pacientesAdmitidos.add(datos.pacienteId);
        break;
    }
  }

  getNombre() {
    return "ObservadorAdmisión";
  }
}

// Observador de Pabellón Quirúrgico
class ObservadorPabellon extends IObserver {
  constructor() {
    super();
    this.cirugiasProgramadas = new Map();
  }

  actualizar(evento, datos) {
    switch (evento) {
      case "cirugia_aprobada":
        console.log(
          `🏥 [PABELLÓN] Cirugía programada. Preparando equipo quirúrgico.`,
        );
        break;
    }
  }

  getNombre() {
    return "ObservadorPabellon";
  }
}

// Observador de Inventario
class ObservadorInventario extends IObserver {
  constructor() {
    super();
    this.nivelesCriticos = new Map();
  }

  actualizar(evento, datos) {
    switch (evento) {
      case "cirugia_aprobada":
        console.log(
          `📦 [INVENTARIO] Cirugía aprobada. Verificando y reservando insumos.`,
        );
        break;
    }
  }

  getNombre() {
    return "ObservadorInventario";
  }
}

// Observador de Recuperación/UCI
class ObservadorRecuperacion extends IObserver {
  constructor() {
    super();
    this.camasReservadas = new Map();
  }

  actualizar(evento, datos) {
    switch (evento) {
      case "cirugia_aprobada":
        if (datos.requiereUci) {
          console.log(
            `🏥 [RECUPERACIÓN] Cirugía requiere UCI. Reservando cama.`,
          );
        }
        break;
    }
  }

  getNombre() {
    return "ObservadorRecuperacion";
  }
}

// Observador de Emergencias
class ObservadorEmergencias extends IObserver {
  constructor() {
    super();
    this.alertasActivas = new Set();
  }

  actualizar(evento, datos) {
    switch (evento) {
      case "emergencia_medica":
        console.log(`🚨 [EMERGENCIAS] ALERTA MÉDICA`);
        break;
    }
  }

  getNombre() {
    return "ObservadorEmergencias";
  }
}

// Observador de Base de Datos (Auditoría)
class ObservadorBaseDatos extends IObserver {
  constructor() {
    super();
    this.eventosRegistrados = [];
  }

  actualizar(evento, datos) {
    const registro = {
      id: `log_${Date.now()}`,
      evento: evento,
      timestamp: new Date().toISOString(),
    };
    this.eventosRegistrados.push(registro);
    console.log(`💾 [BASE DE DATOS] Evento registrado: ${evento}`);
  }

  getNombre() {
    return "ObservadorBaseDatos";
  }
}

// Singleton para el Gestor de Eventos
class GestorEventosSingleton {
  static instancia = null;

  static obtenerInstancia() {
    if (!GestorEventosSingleton.instancia) {
      GestorEventosSingleton.instancia = new GestorEventosQuirurgicos();

      const gestor = GestorEventosSingleton.instancia;

      // Suscribir todos los observadores que tenían + el NUEVO de WhatsApp
      gestor.suscribir("cirugia_aprobada", new ObservadorAdmision());
      gestor.suscribir("cirugia_aprobada", new ObservadorPabellon());
      gestor.suscribir("cirugia_aprobada", new ObservadorInventario());
      gestor.suscribir("cirugia_aprobada", new ObservadorRecuperacion());
      gestor.suscribir("cirugia_aprobada", new ObservadorNotificaciones()); // <--- AQUÍ ESTÁ EL WHATSAPP

      gestor.suscribir("cirugia_rechazada", new ObservadorEmergencias());
      gestor.suscribir("emergencia_medica", new ObservadorEmergencias());
      gestor.suscribir("sistema_caido", new ObservadorEmergencias());

      const observadorBD = new ObservadorBaseDatos();
      gestor.suscribir("cirugia_aprobada", observadorBD);
      gestor.suscribir("cirugia_rechazada", observadorBD);
      gestor.suscribir("emergencia_medica", observadorBD);
      gestor.suscribir("sistema_caido", observadorBD);

      console.log(
        "🎯 Gestor de Eventos Quirúrgicos inicializado con todos los observadores",
      );
    }
    return GestorEventosSingleton.instancia;
  }
}

// Funciones de utilidad para integración
function notificarEvento(tipoEvento, datos) {
  const gestor = GestorEventosSingleton.obtenerInstancia();
  gestor.notificar(tipoEvento, datos);
}

// Exportar clases y funciones
module.exports = {
  IObserver,
  GestorEventosQuirurgicos,
  ObservadorAdmision,
  ObservadorPabellon,
  ObservadorInventario,
  ObservadorRecuperacion,
  ObservadorEmergencias,
  ObservadorBaseDatos,
  ObservadorNotificaciones,
  GestorEventosSingleton,
  notificarEvento,
};
