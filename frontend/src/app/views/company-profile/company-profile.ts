import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CompanySummary } from '../../models/company';
import { CompanyService } from '../../services/company';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-profile.html',
  styleUrls: ['./company-profile.css'],
})
export class CompanyProfileComponent implements OnInit {
  private companyService = inject(CompanyService);
  private route = inject(ActivatedRoute);

  summary = signal<CompanySummary | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  showMonthlyStats = signal<boolean>(true);

  ngOnInit(): void {
    const companyId = this.route.snapshot.paramMap.get('id');

    if (companyId) {
      this.loadCompanyData(+companyId);
    } else {
      this.errorMessage.set('No se ha proporcionado un ID de empresa válido.');
      this.isLoading.set(false);
    }
  }

  /**
   * Carga los datos de la empresa desde el servicio
   */
  loadCompanyData(id: number): void {
    this.isLoading.set(true);

    this.companyService.getCompanySummary(id).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando la empresa:', error);
        this.errorMessage.set('Hubo un error al conectar con el servidor.');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Cambia entre estadísticas mensuales y totales
   */
  toggleStats(isMonthly: boolean): void {
    this.showMonthlyStats.set(isMonthly);
  }

  /**
   * Formatea la masa de la carga para la UI
   */
  formatMass(kg: number): string {
    if (!kg) return '0 t';
    return (kg / 1000).toFixed(1) + ' t';
  }
}
