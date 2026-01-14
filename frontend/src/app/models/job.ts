import { Company } from "./company";
import { User } from "./user";

export interface Job {
  id: number;
  
  // Información de Ruta
  sourceCity: string;
  destinationCity: string;
  sourceCompany: string;
  destinationCompany: string;
  
  // Información de Carga
  cargoName: string;
  cargoMassKg: number;
  
  // Estadísticas del Viaje
  distanceKm: number;
  fuelConsumption: number; // Consumo promedio (L/100km)
  totalFuelLiters: number; // Litros totales usados
  
  // Finanzas (Calculadas en Backend)
  income: number;          // Beneficio neto
  jobIncome: number;       // Ingreso bruto del contrato
  fuelCost: number;        // Coste del combustible (litros * precio_configurable)
  
  // Relaciones
  user?: User;
  company?: Company;
  
  // Metadatos
  createdAt: string | Date;
  updatedAt?: string | Date;
}