import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Dashboard } from '../models/dashboard';
import { Job } from '../models/job';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.API_URL}/jobs`;

  private readonly loadingState = signal<boolean>(true);
  private readonly jobsState = signal<Job[]>([]);
  private readonly jobState = signal<Job>({} as Job);
  private readonly dashboardSignal = signal<Dashboard>({} as Dashboard)
  
  public $loading = this.loadingState.asReadonly();
  public $jobs = this.jobsState.asReadonly();
  public $job = this.jobState.asReadonly();
  public $dashboard = this.dashboardSignal.asReadonly();

  /**
   * Carga los trabajos del usuario autenticado
   */
  loadJobs() {
    this.loadingState.set(true);
    this.http.get<Job[]>(`${this.API_URL}/my-jobs`).subscribe({
      next: (jobs) => {
        this.jobsState.set(jobs);
        this.loadingState.set(true);
      },
      error: (err) => {
        console.error('Error cargando trabajos', err)
        this.loadingState.set(true);
      }
    });
  }

  loadUserDashboard() {
    this.loadingState.set(true);
    this.http.get<Dashboard>(`${this.API_URL}/dashboard`).subscribe({
      next: (data) => {
        this.dashboardSignal.set(data); 
        console.log("data from service", data)
        this.loadingState.set(true);
      },
      error: (err) => {
        console.error('Error cargando dashb oard', err)
        this.loadingState.set(true);
      }
    })
  }

  loadJobById(id: number) {
    this.loadingState.set(true);
    this.http.get<Job>(`${this.API_URL}/${id}`)
        .subscribe({
          next: (data) => {
            this.jobState.set(data);
            this.loadingState.set(false);
          },
          error: () => this.loadingState.set(false)
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