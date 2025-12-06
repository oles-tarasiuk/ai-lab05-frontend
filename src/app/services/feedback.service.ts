import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { SubmitFeedbackRequest, Feedback, WorkerAverageResponse, WorkerFeedbackItem } from '../models/feedback.model';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
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

  getCompletedOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/feedback/orders/completed`, {
      headers: this.getHeaders()
    });
  }

  submitFeedback(request: SubmitFeedbackRequest): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.apiUrl}/feedback`, request, {
      headers: this.getHeaders()
    });
  }

  getWorkerAverage(workerId: number): Observable<WorkerAverageResponse> {
    return this.http.get<WorkerAverageResponse>(`${this.apiUrl}/feedback/worker/${workerId}/average`, {
      headers: this.getHeaders()
    });
  }

  getWorkerFeedbacks(workerId: number): Observable<WorkerFeedbackItem[]> {
    return this.http.get<WorkerFeedbackItem[]>(`${this.apiUrl}/feedback/worker/${workerId}`, {
      headers: this.getHeaders()
    });
  }
}
