/**
 * Utilidades y helpers para testing de APIs simuladas
 */

import {
  InventarioExternoAPI,
  PabellonUCIExternoAPI,
  AdmisionExternoAPI,
  LaboratorioExternoAPI,
  RecursosHumanosExternoAPI,
} from './ApiExternasSimuladasExpandidas';

/**
 * Ejecuta validación completa simulando el flujo real
 */
export async function ejecutarValidacionCompleta(
  pacienteId: number,
  medicoId: number,
  tipoCirugia: string,
  requiereUCI: boolean
) {
  console.log('\n=== INICIANDO VALIDACIÓN COMPLETA ===\n');

  try {
    // 1. Verificar datos del paciente
    console.log(`1️⃣  Verificando datos del paciente...`);
    const datosPaciente = await AdmisionExternoAPI.obtenerDatosPaciente(
      pacienteId
    );
    console.log(`   ✓ Paciente: ${datosPaciente.nombre}`);

    // 2. Verificar resultados de laboratorio
    console.log(`2️⃣  Consultando resultados de laboratorio...`);
    const resultsLab = await LaboratorioExternoAPI.obtenerResultadosPreoperatorios(
      pacienteId
    );
    if (!resultsLab.aptoParaCirugia) {
      throw new Error(`Paciente no apto según laboratorio: ${resultsLab.observaciones}`);
    }
    console.log(`   ✓ ${resultsLab.observaciones}`);

    // 3. Verificar estado del médico
    console.log(`3️⃣  Verificando estado del médico...`);
    const estadoMedico = await RecursosHumanosExternoAPI.obtenerEstadoMedico(medicoId);
    if (!estadoMedico.puedeOperar) {
      throw new Error(`Médico no disponible: ${estadoMedico.observaciones}`);
    }
    console.log(`   ✓ ${estadoMedico.observaciones}`);

    // 4. Verificar insumos
    console.log(`4️⃣  Verificando disponibilidad de insumos...`);
    const insumos = await InventarioExternoAPI.verificarInsumos(tipoCirugia);
    if (!insumos.disponible) {
      throw new Error(`Insumos no disponibles: ${insumos.mensaje}`);
    }
    console.log(`   ✓ ${insumos.mensaje}`);

    // 5. Si requiere UCI, verificar disponibilidad
    if (requiereUCI) {
      console.log(`5️⃣  Verificando disponibilidad de UCI...`);
      const uci = await PabellonUCIExternoAPI.verificarDisponibilidadUCI();
      if (!uci.puede_agendar) {
        throw new Error(
          `UCI llena: ${uci.disponibles}/${uci.total} camas disponibles`
        );
      }
      console.log(`   ✓ Cama asignada: ${uci.cama_asignada}`);
    }

    console.log(`\n✅ VALIDACIÓN EXITOSA - Cirugía puede agendarse\n`);
    return { exito: true, mensaje: 'Cirugía validada y lista para agendar' };
  } catch (error: any) {
    console.log(`\n❌ VALIDACIÓN FALLIDA\n   Error: ${error.message}\n`);
    return { exito: false, mensaje: error.message };
  }
}

/**
 * Ejecuta un escenario de prueba específico
 */
export async function ejecutarScenario(
  nombreScenario: string,
  pacienteId: number,
  medicoId: number
) {
  console.log(`\n📋 SCENARIO: ${nombreScenario}\n`);
  return await ejecutarValidacionCompleta(
    pacienteId,
    medicoId,
    'Cirugía General',
    false
  );
}
