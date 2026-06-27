// ✅ FIX: Este archivo va en src/services/api.ts 
import { Surgery, TeamMember, Resources, ValidacionCirugia } from '../types';

const API_BASE_URL = '/api';

class ApiService {
  async getDashboard() {
    const response = await fetch(`${API_BASE_URL}/dashboard`);
    if (!response.ok) throw new Error('Error al obtener dashboard');
    return response.json();
  }

  async resetFatigue(medicoId: number): Promise<{success: boolean, error?: string, mensaje?: string}> {
    const response = await fetch(`${API_BASE_URL}/team/reset-fatigue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicoId })
    });
    return response.json();
  }

  async getResources(): Promise<Resources> {
    const response = await fetch(`${API_BASE_URL}/resources`);
    if (!response.ok) throw new Error('Error al obtener recursos');
    return response.json();
  }

  async getTeam(): Promise<TeamMember[]> {
    const response = await fetch(`${API_BASE_URL}/team`);
    if (!response.ok) throw new Error('Error al obtener equipo');
    return response.json();
  }

  async getSurgeries(): Promise<Surgery[]> {
    const response = await fetch(`${API_BASE_URL}/surgeries`);
    if (!response.ok) throw new Error('Error al obtener cirugías');
    return response.json();
  }

  async scheduleSurgery(payload: {
    rut: string;
    nombre: string;
    alergias: string;
    medicoId: number;
    tipoCirugia: string;
    requiereUci: boolean;
  }): Promise<ValidacionCirugia> {
    const response = await fetch(`${API_BASE_URL}/surgery/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return response.json();
  }

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
      body: JSON.stringify({ rutPaciente, pabellonId, camaId, tipoCirugia, fechaInicio, fechaFin })
    });
    return response.json();
  }

  async registerPatient(patientData: { 
    rut: string; 
    nombre: string; 
    fechaNacimiento: string; 
    telefono?: string; 
    email?: string 
  }) {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar paciente');
    }
    
    return data;
  }

  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Servidor no disponible');
    return response.json();
  }
}


export default new ApiService();
