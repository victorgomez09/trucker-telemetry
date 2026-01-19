import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { JobService } from '../../services/job';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-jobs',
  imports: [CommonModule, FormsModule, RouterModule, ],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css',
})
export class Jobs implements OnInit {
  private readonly jobService = inject(JobService);

  jobs = this.jobService.$jobs;
  isLoading = this.jobService.$loading;
  searchTerm = signal('');

  // Filtro reactivo en el cliente
  filteredJobs = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.jobs().filter(j => 
      j.city_source.toLowerCase().includes(term) || 
      j.city_destination.toLowerCase().includes(term) ||
      j.cargo_name.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.jobService.loadJobs();
  }
}
