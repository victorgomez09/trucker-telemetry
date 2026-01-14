import { Job } from "./job";
import { UserSummary } from "./user";

export interface Company {
  id: number;
  name: string;
  tag: string; // Ejemplo: [ESP]
  createdAt: string | Date;
  
  // Relaciones
  members?: UserSummary[]; // Lista de conductores
  jobs?: Job[];           // Historial de entregas de la empresa
}

// DTO específico para el resumen de estadísticas que creamos
export interface CompanySummary {
  companyName: string;
  companyTag: string;
  totalJobs: number;
  totalKilometers: number;
  recentJobs: Job[];
}