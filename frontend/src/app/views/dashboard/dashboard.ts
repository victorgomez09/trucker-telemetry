import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { JobService } from '../../services/job';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, CurrencyPipe, DecimalPipe, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  public auth = inject(AuthService);
  private readonly jobService = inject(JobService);

  dashboardData = this.jobService.$dashboard;
  isLoading = signal(true);

  ngOnInit() {
    this.jobService.loadUserDashboard();
    console.log('data', this.jobService.loadUserDashboard())

    this.isLoading.set(false);
  }
}
