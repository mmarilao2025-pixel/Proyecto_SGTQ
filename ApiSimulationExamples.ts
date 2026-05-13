/**
 * Ejemplos de uso de las APIs Simuladas Externas
 * Ejecuta diferentes escenarios de validación
 */

import {
  ejecutarValidacionCompleta,
  ejecutarScenario,
} from './ApiSimulationUtils';

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   PRUEBAS DE APIs EXTERNAS SIMULADAS - SGTQ            ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  // Scenario 1: Cirugía que debería ser aprobada
  await ejecutarScenario('Paciente apto, médico disponible', 1, 1);

  // Scenario 2: Paciente con riesgo
  await ejecutarScenario('Paciente con resultados anómalos', 2, 2);

  // Scenario 3: Médico con demasiadas horas
  await ejecutarScenario('Médico excedido en horas', 3, 2);

  // Scenario 4: Validación completa con UCI
  console.log('\n📋 SCENARIO: Cirugía cardíaca que requiere UCI\n');
  const resultado = await ejecutarValidacionCompleta(4, 3, 'Cirugía Cardíaca', true);
  console.log('Resultado:', resultado);
}

// Ejecutar solo si se llama directamente como script
if (require.main === module) {
  main().catch((error) => {
    console.error('Error en ejemplos:', error);
  });
}

export { ejecutarValidacionCompleta, ejecutarScenario };
