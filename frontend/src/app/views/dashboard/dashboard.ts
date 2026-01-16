import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { JobService } from '../../services/job';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CurrencyPipe, DecimalPipe, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  public auth = inject(AuthService);
  private jobService = inject(JobService);

  dashboardData = this.jobService.$dashboard;
  isLoading = signal(true);

  ngOnInit() {
    this.jobService.loadUserDashboard();
    console.log('data', this.jobService.loadUserDashboard())

    this.isLoading.set(false);
  }
}
