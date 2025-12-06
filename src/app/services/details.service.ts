import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Detail } from '../models/detail.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DetailsService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getDetails(): Observable<Detail[]> {
    return this.http.get<Detail[]>(`${this.apiUrl}/details`, {
      headers: this.getHeaders()
    });
  }

  getDetail(id: number): Observable<Detail> {
    return this.http.get<Detail>(`${this.apiUrl}/details/${id}`, {
      headers: this.getHeaders()
    });
  }

  createDetail(detail: Omit<Detail, 'id'>): Observable<Detail> {
    return this.http.post<Detail>(`${this.apiUrl}/details`, detail, {
      headers: this.getHeaders()
    });
  }
}

