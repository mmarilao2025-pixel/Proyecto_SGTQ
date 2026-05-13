import { GestorCirugiasFacade } from './SurgeryBookingFacade';

export class BookingController {
  private facade = new GestorCirugiasFacade();

  async procesarSolicitudAgendamiento(
    pacienteId: number,
    medicoId: number,
    tipoCirugia: string,
    requiereUci: boolean
  ) {
    const resultado = await this.facade.validarYAgendarCirugia(
      pacienteId,
      medicoId,
      tipoCirugia,
      requiereUci
    );

    if (!resultado.exito) {
      return {
        estado: 'rechazado',
        mensaje: resultado.mensaje,
      };
    }

    return {
      estado: 'confirmado',
      mensaje: resultado.mensaje,
    };
  }
}

export const bookingController = new BookingController();
