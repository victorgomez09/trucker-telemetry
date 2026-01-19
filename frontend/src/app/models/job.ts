import { Company } from './company';
import { User } from './user';

export interface Job {
  id: number;

  truck_name: string;

  // Información de Ruta
  city_source: string;
  city_destination: string;
  source_company: string;
  destination_company: string;

  // Información de Carga
  cargo_name: string;
  cargo_mass_kg: number;

  // Estadísticas del Viaje
  planned_distance: number;
  fuel_consumption: number; // Consumo promedio (L/100km)
  total_fuel_liters: number; // Litros totales usados

  // Finanzas (Calculadas en Backend)
  job_income: number; // Ingreso bruto del contrato
  fuelCost: number; // Coste del combustible (litros * precio_configurable)

  // Relaciones
  user?: User;
  company?: Company;
  events: JobEvent[];

  // Metadatos
  created_at: string | Date;
}

export interface JobEvent {
  type: number;
  description: string;
  value: number;
}
