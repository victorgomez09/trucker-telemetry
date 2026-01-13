import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Job {
  id?: number;
  cargoName: string;
  sourceCity: string;
  destinationCity: string;
  truckName: string;
  distance: number;
  income: number;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class JobService {
  private http = inject(HttpClient);
  private readonly API_URL = `http://localhost:8080/api/v1/jobs`;

  // La fuente de verdad para toda la aplicación
  private jobsState = signal<Job[]>([]);
  
  // Exponemos la señal como "read-only" para los componentes
  public jobsSignal = this.jobsState.asReadonly();

  /**
   * Carga los trabajos del usuario autenticado
   */
  loadJobs() {
    this.http.get<Job[]>(`${this.API_URL}/my-jobs`).subscribe({
      next: (jobs) => this.jobsState.set(jobs),
      error: (err) => console.error('Error cargando trabajos', err)
    });
  }

  /**
   * Guarda un nuevo trabajo finalizado (llamado desde la lógica de telemetría)
   */
  saveJob(newJob: Job) {
    return this.http.post<Job>(this.API_URL, newJob).subscribe({
      next: (savedJob) => {
        // Actualizamos la señal añadiendo el nuevo trabajo al inicio de la lista
        this.jobsState.update(jobs => [savedJob, ...jobs]);
      },
      error: (err) => console.error('Error al guardar el trabajo', err)
    });
  }
}