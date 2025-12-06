import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Operation, CreateOperation } from '../models/operation.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
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

  createOperation(operation: CreateOperation): Observable<Operation> {
    return this.http.post<Operation>(`${this.apiUrl}/operations`, operation, {
      headers: this.getHeaders()
    });
  }

  getOperationsByOrder(orderId: number): Observable<Operation[]> {
    return this.http.get<Operation[]>(`${this.apiUrl}/orders/${orderId}/operations`, {
      headers: this.getHeaders()
    });
  }
}

