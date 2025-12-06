import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface TestResult {
  approach: string;
  success: boolean;
  deliveryTime: number;
  processingTime: number;
  totalTime: number;
  note: string;
}

export interface ComparisonResponse {
  message: string;
  results: {
    rabbitMq: TestResult;
    restApi: TestResult;
  };
  summary: {
    restApi: {
      deliveryTime: number;
    };
    rabbitMq: {
      deliveryTime: number;
    };
    fasterApproach: string;
    timeDifference: number;
    timeDifferencePercent: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ComparisonService {
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

  compareApproaches(orderId: number = 1): Observable<ComparisonResponse> {
    return this.http.post<ComparisonResponse>(
      `${this.apiUrl}/comparison/test?orderId=${orderId}`,
      {},
      { headers: this.getHeaders() }
    );
  }
}

