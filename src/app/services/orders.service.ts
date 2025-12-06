import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, CreateOrder, UpdateOrderStatus } from '../models/order.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
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

  getOrders(forOperations: boolean = false): Observable<Order[]> {
    const url = forOperations 
      ? `${this.apiUrl}/orders?forOperations=true`
      : `${this.apiUrl}/orders`;
    return this.http.get<Order[]>(url, {
      headers: this.getHeaders()
    });
  }

  createOrder(order: CreateOrder): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, order, {
      headers: this.getHeaders()
    });
  }

  updateOrderStatus(orderId: number, status: UpdateOrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${orderId}/status`, status, {
      headers: this.getHeaders()
    });
  }
}

