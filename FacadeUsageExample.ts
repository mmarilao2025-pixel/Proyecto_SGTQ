import { bookingController } from './BookingController';

async function ejecutarEjemplo() {
  const respuesta = await bookingController.procesarSolicitudAgendamiento(
    5,
    2,
    'Cirugía ortopédica',
    true
  );

  console.log('Resultado de agendamiento:', respuesta);
}

if (require.main === module) {
  ejecutarEjemplo().catch(error => {
    console.error('Error en el ejemplo de fachada:', error);
  });
}
