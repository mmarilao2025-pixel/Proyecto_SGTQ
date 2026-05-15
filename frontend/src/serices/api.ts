import { Surgery, TeamMember, Resources, ValidacionCirugia } from '../types';

const API_BASE_URL = '/api';

class ApiService {
  /**
   * Obtiene los datos del dashboard
   */
  async getDashboard() {
    const response = await fetch(`${API_BASE_URL}/dashboard`);
    if (!response.ok) throw new Error('Error al obtener dashboard');
    return response.json();
  }

  /**
   * Obtiene el estado de los recursos
   */
  async getResources(): Promise<Resources> {
    const response = await fetch(`${API_BASE_URL}/resources`);
    if (!response.ok) throw new Error('Error al obtener recursos');
    return response.json();
  }

  /**
   * Obtiene el estado del equipo médico
   */
  async getTeam(): Promise<TeamMember[]> {
    const response = await fetch(`${API_BASE_URL}/team`);
    if (!response.ok) throw new Error('Error al obtener equipo');
    return response.json();
  }

  /**
   * Obtiene las cirugías programadas
   */
  async getSurgeries(): Promise<Surgery[]> {
    const response = await fetch(`${API_BASE_URL}/surgeries`);
    if (!response.ok) throw new Error('Error al obtener cirugías');
    return response.json();
  }

  /**
   * Agenda una nueva cirugía con validación de restricciones
   */
  async scheduleSurgery(
    pacienteId: number,
    medicoId: number,
    tipoCirugia: string,
    requiereUci: boolean
  ): Promise<ValidacionCirugia> {
    const response = await fetch(`${API_BASE_URL}/surgery/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pacienteId,
        medicoId,
        tipoCirugia,
        requiereUci
      })
    });
    return response.json();
  }

  /**
   * Agenda una cirugía de forma atómica (transacción ACID)
   */
  async scheduleAtomicSurgery(
    rutPaciente: string,
    pabellonId: number,
    camaId: number,
    tipoCirugia: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<ValidacionCirugia> {
    const response = await fetch(`${API_BASE_URL}/surgery/atomic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rutPaciente,
        pabellonId,
        camaId,
        tipoCirugia,
        fechaInicio,
        fechaFin
      })
    });
    return response.json();
  }

  /**
   * Verifica el estado del servidor
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Servidor no disponible');
    return response.json();
  }
}

export default new ApiService();
