import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = 'https://stunning-garbanzo-x9qj59gwg54c9654-8080.app.github.dev/api/v1/auth';
  private readonly API_USERS_URL = 'https://stunning-garbanzo-x9qj59gwg54c9654-8080.app.github.dev/api/v1/users';

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

  register(data: {username: string, password: string}) {
    return this.http
      .post<{ token: string }>(`${this.API_URL}/register`, data)
      .pipe(tap((res) => this.processLoginResponse(res.token)));
  }

  login(data: {username: string, password: string}) {
    return this.http.post<{ token: string }>(`${this.API_URL}/login`, data).pipe(
      tap((res) => {
        localStorage.setItem('truck_token', res.token);
        this.tokenSignal.set(res.token);
      }),
      tap(() => this.fetchMe().subscribe(() => this.router.navigate(['/'])))
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

  private processLoginResponse(token: string) {
    localStorage.setItem('truck_token', token);
    this.tokenSignal.set(token);
    this.fetchMe().subscribe(() => this.router.navigate(['/']));
  }
}
