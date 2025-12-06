import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CompletedOrder, CreateFeedback, Feedback, WorkerAverageRating } from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
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

  getCompletedOrders(): Observable<CompletedOrder[]> {
    return this.http.get<CompletedOrder[]>(`${this.apiUrl}/feedbacks/completed-orders`, {
      headers: this.getHeaders()
    });
  }

  createFeedback(feedback: CreateFeedback): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.apiUrl}/feedbacks`, feedback, {
      headers: this.getHeaders()
    });
  }

  getFeedbackForOrder(orderId: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.apiUrl}/feedbacks/order/${orderId}`, {
      headers: this.getHeaders()
    });
  }

  getAllFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/admin/feedbacks/orders`, {
      headers: this.getHeaders()
    });
  }

  getWorkerAverageRatings(): Observable<WorkerAverageRating[]> {
    return this.http.get<WorkerAverageRating[]>(`${this.apiUrl}/admin/feedbacks/workers/average-ratings`, {
      headers: this.getHeaders()
    });
  }
}

