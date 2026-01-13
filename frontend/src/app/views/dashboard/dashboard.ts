import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { JobService } from '../../services/job';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CurrencyPipe, DecimalPipe, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
private jobService = inject(JobService);

  // Cargamos los trabajos (puedes inicializarlo desde el servicio)
  jobs = this.jobService.jobsSignal;

  // CÁLCULOS AUTOMÁTICOS CON SIGNALS
  totalJobs = computed(() => this.jobs().length);
  
  totalDistance = computed(() => 
    this.jobs().reduce((acc, job) => acc + job.distance, 0)
  );

  totalIncome = computed(() => 
    this.jobs().reduce((acc, job) => acc + job.income, 0)
  );

  ngOnInit() {
    this.jobService.loadJobs();
  }
}
