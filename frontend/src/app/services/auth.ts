import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = 'http://localhost:8080/api/v1/auth';

  // Señal que guarda el token (se inicializa con lo que haya en localStorage)
  private tokenSignal = signal<string | null>(localStorage.getItem('truck_token'));

  // Computed para saber si está autenticado
  public isAuthenticated = computed(() => !!this.tokenSignal());

  register(data: any) {
    return this.http.post<{token: string}>(`${this.API_URL}/register`, data).pipe(
      tap(res => this.saveToken(res.token))
    );
  }

  login(data: any) {
    return this.http.post<{token: string}>(`${this.API_URL}/login`, data).pipe(
      tap(res => this.saveToken(res.token))
    );
  }

  logout() {
    localStorage.removeItem('truck_token');
    this.tokenSignal.set(null);
    this.router.navigate(['/login']);
  }

  private saveToken(token: string) {
    localStorage.setItem('truck_token', token);
    this.tokenSignal.set(token);
    this.router.navigate(['/dashboard']);
  }

  getToken() {
    return this.tokenSignal();
  }
}