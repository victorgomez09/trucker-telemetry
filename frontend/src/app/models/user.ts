import { Company } from "./company";

export interface User {
  id: number;
  username: string;
  email: string;
  // Relación Muchos a Muchos: Un usuario puede estar en varias empresas
  companies?: Company[]; 
  createdAt?: string | Date;
}

// Interfaz simplificada para respuestas de autenticación o listas
export interface UserSummary {
  id: number;
  username: string;
  email: string;
}