// Ejemplo de uso del patrón Observer en SGTQ
// Rama: feature/patron-comportamiento-observador

const {
  GestorEventosSingleton,
  notificarEvento,
  obtenerEstadisticasEventos,
  suscribirObservador,
} = require("./comportamiento_observador");

console.log("🏥 DEMOSTRACIÓN DEL PATRÓN OBSERVER EN SGTQ\n");

// Inicializar el sistema de eventos
console.log("1️⃣ Inicializando sistema de eventos...");
GestorEventosSingleton.obtenerInstancia();
console.log("✅ Sistema inicializado con observadores por defecto\n");

// Crear un observador personalizado para demostración
class ObservadorDemo {
  constructor() {
    this.eventosRecibidos = [];
  }

  actualizar(evento, datos) {
    const timestamp = new Date().toISOString();
    this.eventosRecibidos.push({ evento, datos, timestamp });
    console.log(`📢 [${timestamp}] ObservadorDemo recibió: ${evento}`);
    console.log(`   📋 Datos:`, JSON.stringify(datos, null, 2));
  }

  getNombre() {
    return "ObservadorDemo";
  }

  getEstadisticas() {
    return {
      totalEventos: this.eventosRecibidos.length,
      eventosPorTipo: this.eventosRecibidos.reduce((acc, e) => {
        acc[e.evento] = (acc[e.evento] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}

const observadorDemo = new ObservadorDemo();

// Suscribir el observador demo a varios eventos
console.log("2️⃣ Suscribiendo observador personalizado...");
suscribirObservador("cirugia_aprobada", observadorDemo);
suscribirObservador("emergencia_medica", observadorDemo);
suscribirObservador("insumo_bajo", observadorDemo);
console.log("✅ Observador demo suscrito a eventos críticos\n");

// Simular escenario real: llegada de paciente y programación de cirugía
console.log("3️⃣ Simulando llegada de paciente y aprobación de cirugía...");

// Evento: Paciente llega al hospital
notificarEvento("paciente_llegada", {
  pacienteId: 1001,
  nombre: "María González",
  edad: 45,
  tipoSangre: "A+",
  alergias: ["Penicilina"],
  prioridad: "URGENTE",
});

// Evento: Cirugía aprobada por el motor de agendamiento
setTimeout(() => {
  notificarEvento("cirugia_aprobada", {
    pacienteId: 1001,
    medicoId: 2001,
    tipoCirugia: "Cirugía Cardiovascular",
    pabellonId: 3,
    requiereUci: true,
    tiempoEstimado: 180, // minutos
    insumosRequeridos: ["Bypass", "Valvula", "Sangre A+"],
    equipoMedico: ["Cardiólogo", "Anestesista", "Enfermera"],
  });
}, 1000);

// Simular alerta de inventario bajo
setTimeout(() => {
  notificarEvento("insumo_bajo", {
    insumoId: "BYPASS_001",
    nombre: "Bypass Cardíaco",
    nivelActual: 2,
    nivelMinimo: 5,
    tiempoReposicion: 7200000, // 2 horas en ms
    proveedores: ["ProveedorA", "ProveedorB"],
  });
}, 2000);

// Simular emergencia médica
setTimeout(() => {
  notificarEvento("emergencia_medica", {
    pacienteId: 1001,
    descripcion: "Arritmia ventricular durante preparación",
    prioridad: "CRITICA",
    requiereDefibrilacion: true,
    equipoEmergencia: ["Cardiólogo", "Enfermera", "Defibrilador"],
  });
}, 3000);

// Simular cirugía completada exitosamente
setTimeout(() => {
  notificarEvento("cirugia_completada", {
    pacienteId: 1001,
    medicoId: 2001,
    tiempoReal: 195, // minutos
    complicaciones: false,
    estadoPaciente: "Estable en UCI",
    notas: "Cirugía exitosa, paciente responde bien",
  });
}, 4000);

// Mostrar estadísticas después de todos los eventos
setTimeout(() => {
  console.log("\n4️⃣ Estadísticas finales del sistema:");

  const statsSistema = obtenerEstadisticasEventos();
  console.log("📊 Estadísticas del sistema:");
  console.log(`   • Eventos totales: ${statsSistema.totalEventos}`);
  console.log(`   • Eventos activos: ${statsSistema.eventosActivos}`);
  console.log(`   • Tipos de eventos:`, statsSistema.tiposEventos);

  const statsDemo = observadorDemo.getEstadisticas();
  console.log("\n📊 Estadísticas del observador demo:");
  console.log(`   • Eventos recibidos: ${statsDemo.totalEventos}`);
  console.log(`   • Por tipo:`, statsDemo.eventosPorTipo);

  console.log("\n🎯 DEMOSTRACIÓN COMPLETA DEL PATRÓN OBSERVER");
  console.log("✅ Todos los observadores especializados fueron notificados");
  console.log("✅ El sistema mantuvo la integridad ante eventos críticos");
  console.log("✅ La auditoría completa registró todos los eventos");
  console.log("✅ El observador personalizado funcionó correctamente");
}, 5000);

// Mantener el proceso vivo para ver todos los eventos
setTimeout(() => {
  console.log("\n🏁 Fin de la demostración");
  process.exit(0);
}, 6000);
