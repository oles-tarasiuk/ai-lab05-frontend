import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

interface JwtPayload {
  sub?: string;
  name?: string;
  nameid?: string;
  email?: string;
  role?: string;
  exp?: number;
  iss?: string;
  aud?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  
  isAuthenticated = signal<boolean>(false);
  token = signal<string | null>(null);
  userRole = signal<string | null>(null);
  userId = signal<number | null>(null);
  username = signal<string | null>(null);

  // Computed signals for role checks
  isAdmin = computed(() => this.userRole() === 'Admin');
  isCustomer = computed(() => this.userRole() === 'Customer');
  isWorker = computed(() => this.userRole() === 'Worker');

  constructor(private http: HttpClient) {
    const storedToken = localStorage.getItem(this.tokenKey);
    if (storedToken) {
      this.token.set(storedToken);
      this.isAuthenticated.set(true);
      this.decodeToken(storedToken);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.token.set(response.token);
          this.isAuthenticated.set(true);
          localStorage.setItem(this.tokenKey, response.token);
          this.decodeToken(response.token);
        })
      );
  }

  logout(): void {
    this.token.set(null);
    this.isAuthenticated.set(false);
    this.userRole.set(null);
    this.userId.set(null);
    this.username.set(null);
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return this.token();
  }

  private decodeToken(token: string): void {
    try {
      const payload = this.parseJwt(token);
      this.userRole.set(payload.role || null);
      this.userId.set(payload.nameid ? parseInt(payload.nameid, 10) : null);
      this.username.set(payload.name || null);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.logout();
    }
  }

  private parseJwt(token: string): JwtPayload {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  hasRole(role: string): boolean {
    return this.userRole() === role;
  }

  hasAnyRole(...roles: string[]): boolean {
    const currentRole = this.userRole();
    return currentRole ? roles.includes(currentRole) : false;
  }
}

