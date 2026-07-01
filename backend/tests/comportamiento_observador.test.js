const {
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
} = require("../comportamiento_observador");

describe("IObserver (interfaz base)", () => {
  test("actualizar lanza error si no está implementado", () => {
    const observer = new IObserver();
    expect(() => observer.actualizar("evento", {})).toThrow(
      "Método actualizar no implementado",
    );
  });

  test("getNombre lanza error si no está implementado", () => {
    const observer = new IObserver();
    expect(() => observer.getNombre()).toThrow(
      "Método getNombre no implementado",
    );
  });
});

describe("ObservadorNotificaciones", () => {
  test("getNombre retorna el nombre correcto", () => {
    const obs = new ObservadorNotificaciones();
    expect(obs.getNombre()).toBe("ObservadorNotificaciones");
  });

  test("actualizar dispara enviarWhatsAppSimulado cuando el evento es cirugia_aprobada", () => {
    const obs = new ObservadorNotificaciones();
    const spy = jest.spyOn(obs, "enviarWhatsAppSimulado");

    obs.actualizar("cirugia_aprobada", {
      rutPaciente: "12345678-9",
      tipoCirugia: "Apendicectomía",
    });

    expect(spy).toHaveBeenCalledWith({
      rutPaciente: "12345678-9",
      tipoCirugia: "Apendicectomía",
    });
  });

  test("actualizar NO dispara nada para otros eventos", () => {
    const obs = new ObservadorNotificaciones();
    const spy = jest.spyOn(obs, "enviarWhatsAppSimulado");

    obs.actualizar("cirugia_rechazada", {});

    expect(spy).not.toHaveBeenCalled();
  });

  test("enviarWhatsAppSimulado soporta datos con pacienteId/tipoSurgery como fallback", () => {
    const obs = new ObservadorNotificaciones();
    expect(() =>
      obs.enviarWhatsAppSimulado({ pacienteId: 1, tipoSurgery: "General" }),
    ).not.toThrow();
  });
});

describe("GestorEventosQuirurgicos (Subject)", () => {
  let gestor;

  beforeEach(() => {
    gestor = new GestorEventosQuirurgicos();
  });

  test("inicia con historial y observadores vacíos", () => {
    expect(gestor.historialEventos).toEqual([]);
    expect(gestor.eventosActivos.size).toBe(0);
  });

  test("suscribir agrega un observador a un tipo de evento nuevo", () => {
    const obs = new ObservadorAdmision();
    gestor.suscribir("cirugia_aprobada", obs);

    expect(gestor.observadores.get("cirugia_aprobada")).toContain(obs);
  });

  test("suscribir agrega múltiples observadores al mismo evento", () => {
    const obs1 = new ObservadorAdmision();
    const obs2 = new ObservadorPabellon();
    gestor.suscribir("cirugia_aprobada", obs1);
    gestor.suscribir("cirugia_aprobada", obs2);

    expect(gestor.observadores.get("cirugia_aprobada")).toHaveLength(2);
  });

  test("desuscribir remueve un observador existente", () => {
    const obs = new ObservadorAdmision();
    gestor.suscribir("cirugia_aprobada", obs);
    gestor.desuscribir("cirugia_aprobada", obs);

    expect(gestor.observadores.get("cirugia_aprobada")).not.toContain(obs);
  });

  test("desuscribir no falla si el evento no existe", () => {
    const obs = new ObservadorAdmision();
    expect(() => gestor.desuscribir("evento_inexistente", obs)).not.toThrow();
  });

  test("desuscribir no falla si el observador no estaba suscrito", () => {
    const obs1 = new ObservadorAdmision();
    const obs2 = new ObservadorPabellon();
    gestor.suscribir("cirugia_aprobada", obs1);

    expect(() => gestor.desuscribir("cirugia_aprobada", obs2)).not.toThrow();
  });

  test("notificar registra el evento en el historial y lo marca activo", () => {
    gestor.notificar("cirugia_aprobada", { pacienteId: 1 });

    expect(gestor.historialEventos).toHaveLength(1);
    expect(gestor.historialEventos[0].tipo).toBe("cirugia_aprobada");
    expect(gestor.eventosActivos.size).toBe(1);
  });

  test("notificar llama a actualizar() de todos los observadores suscritos", () => {
    const obs1 = new ObservadorAdmision();
    const obs2 = new ObservadorPabellon();
    const spy1 = jest.spyOn(obs1, "actualizar");
    const spy2 = jest.spyOn(obs2, "actualizar");

    gestor.suscribir("cirugia_aprobada", obs1);
    gestor.suscribir("cirugia_aprobada", obs2);
    gestor.notificar("cirugia_aprobada", { pacienteId: 1 });

    expect(spy1).toHaveBeenCalledWith("cirugia_aprobada", { pacienteId: 1 });
    expect(spy2).toHaveBeenCalledWith("cirugia_aprobada", { pacienteId: 1 });
  });

  test("notificar no falla si no hay observadores para ese evento", () => {
    expect(() => gestor.notificar("evento_sin_suscriptores", {})).not.toThrow();
  });

  test("notificar captura y loguea el error si un observador falla, sin detener a los demás", () => {
    const obsRoto = new ObservadorAdmision();
    obsRoto.actualizar = () => {
      throw new Error("fallo simulado");
    };
    const obsSano = new ObservadorPabellon();
    const spySano = jest.spyOn(obsSano, "actualizar");

    gestor.suscribir("cirugia_aprobada", obsRoto);
    gestor.suscribir("cirugia_aprobada", obsSano);

    expect(() =>
      gestor.notificar("cirugia_aprobada", { pacienteId: 1 }),
    ).not.toThrow();
    expect(spySano).toHaveBeenCalled();
  });

  test("marcarEventoProcesado quita el evento de eventosActivos", () => {
    gestor.notificar("cirugia_aprobada", {});
    const idEvento = gestor.historialEventos[0].id;

    gestor.marcarEventoProcesado(idEvento);

    expect(gestor.eventosActivos.has(idEvento)).toBe(false);
  });

  test("generarIdEvento retorna IDs únicos", () => {
    const id1 = gestor.generarIdEvento();
    const id2 = gestor.generarIdEvento();

    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^evt_/);
  });

  test("obtenerEstadisticas resume totales, tipos y último evento", () => {
    gestor.notificar("cirugia_aprobada", {});
    gestor.notificar("cirugia_aprobada", {});
    gestor.notificar("cirugia_rechazada", {});

    const stats = gestor.obtenerEstadisticas();

    expect(stats.totalEventos).toBe(3);
    expect(stats.tiposEventos.cirugia_aprobada).toBe(2);
    expect(stats.tiposEventos.cirugia_rechazada).toBe(1);
    expect(stats.ultimoEvento.tipo).toBe("cirugia_rechazada");
  });

  test("limpiarHistorial elimina los eventos más antiguos cuando se excede el máximo", () => {
    for (let i = 0; i < 5; i++) {
      gestor.notificar("cirugia_aprobada", { i });
    }

    gestor.limpiarHistorial(2);

    expect(gestor.historialEventos).toHaveLength(2);
    expect(gestor.historialEventos[0].datos.i).toBe(3);
  });

  test("limpiarHistorial no hace nada si no se supera el máximo", () => {
    gestor.notificar("cirugia_aprobada", {});

    gestor.limpiarHistorial(1000);

    expect(gestor.historialEventos).toHaveLength(1);
  });
});

describe("Observadores especializados del dominio médico", () => {
  test("ObservadorAdmision registra al paciente en cirugia_aprobada", () => {
    const obs = new ObservadorAdmision();
    obs.actualizar("cirugia_aprobada", { pacienteId: 42 });

    expect(obs.pacientesAdmitidos.has(42)).toBe(true);
    expect(obs.getNombre()).toBe("ObservadorAdmisión");
  });

  test("ObservadorAdmision ignora eventos distintos y datos sin pacienteId", () => {
    const obs = new ObservadorAdmision();
    expect(() => obs.actualizar("otro_evento", {})).not.toThrow();
    expect(() => obs.actualizar("cirugia_aprobada", {})).not.toThrow();
    expect(obs.pacientesAdmitidos.size).toBe(0);
  });

  test("ObservadorPabellon reacciona a cirugia_aprobada", () => {
    const obs = new ObservadorPabellon();
    expect(() => obs.actualizar("cirugia_aprobada", {})).not.toThrow();
    expect(obs.getNombre()).toBe("ObservadorPabellon");
  });

  test("ObservadorInventario reacciona a cirugia_aprobada", () => {
    const obs = new ObservadorInventario();
    expect(() => obs.actualizar("cirugia_aprobada", {})).not.toThrow();
    expect(obs.getNombre()).toBe("ObservadorInventario");
  });

  test("ObservadorRecuperacion reserva cama solo si requiereUci es true", () => {
    const obs = new ObservadorRecuperacion();
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    obs.actualizar("cirugia_aprobada", { requiereUci: true });
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Reservando cama"),
    );

    logSpy.mockClear();
    obs.actualizar("cirugia_aprobada", { requiereUci: false });
    expect(logSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
    expect(obs.getNombre()).toBe("ObservadorRecuperacion");
  });

  test("ObservadorEmergencias reacciona a emergencia_medica", () => {
    const obs = new ObservadorEmergencias();
    expect(() => obs.actualizar("emergencia_medica", {})).not.toThrow();
    expect(obs.getNombre()).toBe("ObservadorEmergencias");
  });

  test("ObservadorEmergencias ignora otros eventos", () => {
    const obs = new ObservadorEmergencias();
    expect(() => obs.actualizar("cirugia_aprobada", {})).not.toThrow();
  });

  test("ObservadorBaseDatos registra cada evento recibido", () => {
    const obs = new ObservadorBaseDatos();
    obs.actualizar("cirugia_aprobada", {});
    obs.actualizar("emergencia_medica", {});

    expect(obs.eventosRegistrados).toHaveLength(2);
    expect(obs.eventosRegistrados[0].evento).toBe("cirugia_aprobada");
    expect(obs.getNombre()).toBe("ObservadorBaseDatos");
  });
});

describe("GestorEventosSingleton", () => {
  test("obtenerInstancia siempre retorna la misma instancia", () => {
    const instancia1 = GestorEventosSingleton.obtenerInstancia();
    const instancia2 = GestorEventosSingleton.obtenerInstancia();

    expect(instancia1).toBe(instancia2);
  });

  test("la instancia viene con todos los observadores por defecto ya suscritos", () => {
    const gestor = GestorEventosSingleton.obtenerInstancia();

    expect(gestor.observadores.get("cirugia_aprobada").length).toBeGreaterThanOrEqual(5);
    expect(gestor.observadores.get("emergencia_medica").length).toBeGreaterThanOrEqual(1);
  });
});

describe("notificarEvento (función de utilidad)", () => {
  test("delega en la instancia singleton del gestor", () => {
    const gestor = GestorEventosSingleton.obtenerInstancia();
    const spy = jest.spyOn(gestor, "notificar");

    notificarEvento("cirugia_aprobada", { pacienteId: 99 });

    expect(spy).toHaveBeenCalledWith("cirugia_aprobada", { pacienteId: 99 });
    spy.mockRestore();
  });
});