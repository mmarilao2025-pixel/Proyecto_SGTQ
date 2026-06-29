import React, { useState, useEffect } from 'react';

export interface Dashboard {
  uciAvailability: number;
  bloodSupply: number;
  suppliesStatus: number;
  activeTeam: TeamMember[];
  surgeries: Surgery[];
}

export interface TeamMember {
  id: number;
  name: string;
  specialty: string;
  status: 'DISPONIBLE' | 'ALERTA' | 'BLOQUEADO';
  initials: string;
}

export interface Surgery {
  id: number;
  patient: string;
  type: string;
  startTime: string;
  endTime: string;
  pabellon: number;
  status: string;
}

export const DashboardComponent: React.FC = () => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Error al cargar datos');
      const data = await response.json();
      setDashboard(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600 text-center">
          <p className="text-xl font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-12 gap-6">
        {/* Recursos Críticos */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-700 text-sm mb-6">Recursos Críticos</h3>
          <div className="flex justify-around items-center text-center">
            <div>
             <div className={`w-16 h-16 rounded-full border-[6px] ${
                (dashboard?.uciAvailability ?? 0) < 20? 'border-red-500': 'border-green-500'} flex items-center justify-center mb-2`}>
                <span className="text-sm font-bold">{dashboard?.uciAvailability}%</span>
              </div>
              <p className="text-[10px] font-bold text-gray-500">Camas UCI</p>
            </div>
            <div>
              <div className="w-16 h-16 rounded-full border-[6px] border-green-500 flex items-center justify-center mb-2">
                <span className="text-sm font-bold">{dashboard?.bloodSupply}%</span>
              </div>
              <p className="text-[10px] font-bold text-gray-500">Sangre</p>
            </div>
            <div>
              <div className="w-16 h-16 rounded-full border-[6px] border-green-400 flex items-center justify-center mb-2">
                <span className="text-sm font-bold">{dashboard?.suppliesStatus}%</span>
              </div>
              <p className="text-[10px] font-bold text-gray-500">Insumos OK</p>
            </div>
          </div>
        </div>

        {/* Equipo Quirúrgico */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700 text-sm">Equipo Quirúrgico</h3>
            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {dashboard?.activeTeam.length} activos
            </span>
          </div>
          <div className="space-y-4">
            {dashboard?.activeTeam.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {member.initials}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold">{member.name}</p>
                    <p className="text-gray-400">{member.specialty}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded italic ${
                  member.status === 'DISPONIBLE' 
                    ? 'text-green-500 bg-green-50' 
                    : member.status === 'ALERTA'
                    ? 'text-amber-500 bg-amber-50'
                    : 'text-red-500 bg-red-50'
                }`}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};