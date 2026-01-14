import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CompanySummary } from '../models/company';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);
  private readonly authService = inject(AuthService)
  private readonly API_URL = 'http://localhost:8080/api/v1/companies';

  getCompanySummary(id: number) {
    return this.http.get<CompanySummary>(`${this.API_URL}/${id}/summary`);
  }

  userBelongsTo(companyId: number): Observable<boolean> {
  // 1. Intentamos obtener el usuario del AuthService (donde guardas el token/user)
  const currentUser = this.authService.getUser(); 
  
  if (!currentUser) return of(false);

  // 2. Llamada al nuevo endpoint del backend
  return this.http.get<boolean>(`${this.API_URL}/${companyId}/check-membership/${currentUser.username}`);
}
}