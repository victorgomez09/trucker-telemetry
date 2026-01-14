import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Dashboard } from '../models/dashboard';
import { Job } from '../models/job';

@Injectable({ providedIn: 'root' })
export class JobService {
  private http = inject(HttpClient);
  private readonly API_URL = `http://localhost:8080/api/v1/jobs`;

  private jobsState = signal<Job[]>([]);
  private dashboardSignal = signal<Dashboard>({} as Dashboard)
  
  public $jobs = this.jobsState.asReadonly();
  public $dashboard = this.dashboardSignal.asReadonly();

  /**
   * Carga los trabajos del usuario autenticado
   */
  loadJobs() {
    this.http.get<Job[]>(`${this.API_URL}/my-jobs`).subscribe({
      next: (jobs) => this.jobsState.set(jobs),
      error: (err) => console.error('Error cargando trabajos', err)
    });
  }

  loadUserDashboard() {
    this.http.get<Dashboard>(`${this.API_URL}/dashboard`).subscribe({
      next: (data) => this.dashboardSignal.set(data),
      error: (err) => console.error('Error cargando dashb oard', err)
    })
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