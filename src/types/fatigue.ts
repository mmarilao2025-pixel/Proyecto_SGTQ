// src/types/fatigue.ts
export interface EntradaFatiga {
  id: string;
  nombreTrabajador: string;
  puntajeFatiga: number; // Nivel de 0 a 1
  estado: 'normal' | 'alerta' | 'critico';
  fechaHora: string;
}