export interface Surgery {
  id: number;
  patient: string;
  type: string;
  startTime: string;
  endTime: string;
  pabellon: number;
  status: 'PROGRAMADA' | 'EN PROGRESO' | 'COMPLETADA' | 'CANCELADA';
  requiereUCI: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  specialty: string;
  status: 'DISPONIBLE' | 'ALERTA' | 'BLOQUEADO';
  horasAcumuladas: number;
  disponible: boolean;
}

export interface Resources {
  camasUCI: {
    total: number;
    disponibles: number;
    ocupadas: number;
    porcentaje: number;
  };
  sangre: {
    total: number;
    disponible: number;
    porcentaje: number;
  };
  insumos: {
    ok: boolean;
    cantidad: number;
    porcentaje: number;
  };
  pabellones: {
    total: number;
    disponibles: number;
    ocupados: number;
  };
}

export interface ValidacionCirugia {
  exito: boolean;
  mensaje: string;
  id?: string;
  error?: string;
}

export interface EntradaFatiga {
  id: string;
  nombreTrabajador: string;
  puntajeFatiga: number;
  estado: 'normal' | 'alerta' | 'critico';
  fechaHora: string;
}

export interface FatigueSummary {
  avgFatigue: number;
  criticalCases: number;
  alertCases: number;
  highRiskCount: number;
  legalLimitHours: number;
}

export type SyncStatusLevel = 'NORMAL' | 'RIESGO' | 'CRÍTICO';

export interface SyncStatus {
  area: 'Admisión' | 'Pabellón' | 'Inventario' | 'Recuperación';
  status: SyncStatusLevel;
  details: string;
  updatedAt: string;
}

export interface DashboardPayload {
  resources: Resources;
  activeTeam: TeamMember[];
  surgeries: Surgery[];
  fatigueSummary: FatigueSummary;
  syncStatus: SyncStatus[];
}
