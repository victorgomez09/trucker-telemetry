import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { JobService } from '../../services/job';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-details.html',
})
export class JobDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly jobService = inject(JobService);
  
  job = this.jobService.$job;
  isLoading = this.jobService.$loading;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.jobService.loadJobById(+id);
    }
  }

  generateEventDescription(description: string): string {
    switch (description) {
      case "speeding_camera":
        return "Multa de Velocidad"
      case "crash":
        return "Choque"
      default:
        return description;
    }
  }

  calculateJobIncome(): number {
    let totalEventsValue = 0;
    this.job().events.forEach(event => totalEventsValue += event.value);
    return this.job().job_income - totalEventsValue;
  }
}