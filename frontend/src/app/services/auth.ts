import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = 'http://localhost:8080/api/v1/auth';
  private readonly API_USERS_URL = 'http://localhost:8080/api/v1/users';

  private tokenSignal = signal<string | null>(localStorage.getItem('truck_token'));
  private currentUserSignal = signal<any>(null); // Guardamos la info del /me

  public isAuthenticated = computed(() => !!this.tokenSignal());
  public currentUser = computed(() => this.currentUserSignal());

  constructor() {
    if (this.tokenSignal()) {
      this.fetchMe().subscribe();
    }
  }

  fetchMe() {
    return this.http.get<any>(`${this.API_USERS_URL}/me`).pipe(
      tap((user) => this.currentUserSignal.set(user)),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  login(data: any) {
    return this.http.post<{ token: string }>(`${this.API_URL}/login`, data).pipe(
      tap((res) => {
        localStorage.setItem('truck_token', res.token);
        this.tokenSignal.set(res.token);
      }),
      tap(() => this.fetchMe().subscribe(() => this.router.navigate(['/dashboard'])))
    );
  }

  logout() {
    localStorage.removeItem('truck_token');
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getUser() {
    return this.currentUserSignal();
  }
}
