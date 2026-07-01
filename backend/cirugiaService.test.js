const {
  CONFIG_MOTOR_AGENDAMIENTO,
  obtenerConfiguracion,
  actualizarUmbrales,
  validarConfiguracion,
} = require("../motor_agendamiento.config");

const CONFIG_OBSERVER = require("../comportamiento_observador.config");

describe("motor_agendamiento.config", () => {
  test("obtenerConfiguracion retorna el objeto de configuración global", () => {
    expect(obtenerConfiguracion()).toBe(CONFIG_MOTOR_AGENDAMIENTO);
  });

  test("actualizarUmbrales combina los umbrales nuevos con los existentes", () => {
    const original = CONFIG_MOTOR_AGENDAMIENTO.umbrales.camas_uci_minimas;
    actualizarUmbrales({ camas_uci_minimas: 7 });

    expect(CONFIG_MOTOR_AGENDAMIENTO.umbrales.camas_uci_minimas).toBe(7);

    // restaurar para no afectar otros tests
    actualizarUmbrales({ camas_uci_minimas: original });
  });

  test("validarConfiguracion retorna true para la configuración por defecto", () => {
    expect(validarConfiguracion()).toBe(true);
  });

  test("validarConfiguracion lanza error si camas_uci_minimas es negativo", () => {
    const original = CONFIG_MOTOR_AGENDAMIENTO.umbrales.camas_uci_minimas;
    CONFIG_MOTOR_AGENDAMIENTO.umbrales.camas_uci_minimas = -1;

    expect(() => validarConfiguracion()).toThrow(
      "Umbral de camas UCI no puede ser negativo",
    );

    CONFIG_MOTOR_AGENDAMIENTO.umbrales.camas_uci_minimas = original;
  });

  test("validarConfiguracion lanza error si horas_turno_maximas excede 24", () => {
    const original = CONFIG_MOTOR_AGENDAMIENTO.umbrales.horas_turno_maximas;
    CONFIG_MOTOR_AGENDAMIENTO.umbrales.horas_turno_maximas = 30;

    expect(() => validarConfiguracion()).toThrow(
      "Horas de turno máximo no puede exceder 24 horas",
    );

    CONFIG_MOTOR_AGENDAMIENTO.umbrales.horas_turno_maximas = original;
  });

  test("validarConfiguracion lanza error si alguna regla no tiene prioridad válida", () => {
    CONFIG_MOTOR_AGENDAMIENTO.prioridades.regla_invalida = 0;

    expect(() => validarConfiguracion()).toThrow(/sin prioridad válida/);

    delete CONFIG_MOTOR_AGENDAMIENTO.prioridades.regla_invalida;
  });
});

describe("comportamiento_observador.config", () => {
  test("expone la lista de eventos habilitados", () => {
    expect(Array.isArray(CONFIG_OBSERVER.CONFIG_OBSERVER.eventos.habilitados)).toBe(
      true,
    );
    expect(
      CONFIG_OBSERVER.CONFIG_OBSERVER.eventos.habilitados,
    ).toContain("cirugia_aprobada");
  });

  test("marca emergencia_medica como evento crítico", () => {
    expect(
      CONFIG_OBSERVER.CONFIG_OBSERVER.eventos.criticos,
    ).toContain("emergencia_medica");
  });

  test("define observadores por defecto para cirugia_aprobada", () => {
    expect(
      CONFIG_OBSERVER.CONFIG_OBSERVER.observadores.por_defecto.cirugia_aprobada,
    ).toContain("ObservadorBaseDatos");
  });

  test("obtenerConfiguracion retorna el objeto de configuración global", () => {
    expect(CONFIG_OBSERVER.obtenerConfiguracion()).toBe(
      CONFIG_OBSERVER.CONFIG_OBSERVER,
    );
  });

  test("eventoHabilitado identifica eventos habilitados y no habilitados", () => {
    expect(CONFIG_OBSERVER.eventoHabilitado("cirugia_aprobada")).toBe(true);
    expect(CONFIG_OBSERVER.eventoHabilitado("evento_inventado")).toBe(false);
  });

  test("eventoCritico identifica correctamente eventos críticos", () => {
    expect(CONFIG_OBSERVER.eventoCritico("sistema_caido")).toBe(true);
    expect(CONFIG_OBSERVER.eventoCritico("paciente_llegada")).toBe(false);
  });

  test("obtenerObservadoresPorDefecto retorna lista vacía para eventos sin configurar", () => {
    expect(
      CONFIG_OBSERVER.obtenerObservadoresPorDefecto("evento_sin_config"),
    ).toEqual([]);
  });

  test("obtenerConfiguracionObservador retorna configuración específica o vacía", () => {
    expect(
      CONFIG_OBSERVER.obtenerConfiguracionObservador("ObservadorEmergencias"),
    ).toHaveProperty("tiempo_respuesta_maximo");
    expect(
      CONFIG_OBSERVER.obtenerConfiguracionObservador("NoExiste"),
    ).toEqual({});
  });

  test("validarConfiguracion retorna true para la configuración por defecto", () => {
    expect(CONFIG_OBSERVER.validarConfiguracion()).toBe(true);
  });

  test("validarConfiguracion lanza error si hay eventos críticos no habilitados", () => {
    CONFIG_OBSERVER.CONFIG_OBSERVER.eventos.criticos.push("evento_fantasma");

    expect(() => CONFIG_OBSERVER.validarConfiguracion()).toThrow(
      /Eventos críticos no habilitados/,
    );

    CONFIG_OBSERVER.CONFIG_OBSERVER.eventos.criticos.pop();
  });

  test("actualizarConfiguracion combina la nueva configuración y valida", () => {
    CONFIG_OBSERVER.actualizarConfiguracion({});
    expect(CONFIG_OBSERVER.validarConfiguracion()).toBe(true);
  });
});
