import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FeedbackService } from '../../services/feedback.service';
import { Feedback, WorkerAverageRating } from '../../models/feedback.model';

@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-feedback.component.html',
  styleUrl: './admin-feedback.component.scss'
})
export class AdminFeedbackComponent implements OnInit {
  feedbacks: Feedback[] = [];
  workerRatings: WorkerAverageRating[] = [];
  isLoadingFeedbacks = false;
  isLoadingRatings = false;

  feedbackColumns: string[] = ['id', 'orderId', 'customerId', 'rating', 'comment', 'createdAt'];
  ratingsColumns: string[] = ['workerId', 'workerUsername', 'averageRating', 'totalRatings'];

  constructor(
    private feedbackService: FeedbackService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFeedbacks();
    this.loadWorkerRatings();
  }

  loadFeedbacks(): void {
    this.isLoadingFeedbacks = true;
    this.feedbackService.getAllFeedbacks().subscribe({
      next: (feedbacks) => {
        this.feedbacks = feedbacks;
        this.isLoadingFeedbacks = false;
      },
      error: (error) => {
        this.isLoadingFeedbacks = false;
        this.snackBar.open('Failed to load feedbacks', 'Close', { duration: 3000 });
        console.error('Error loading feedbacks:', error);
      }
    });
  }

  loadWorkerRatings(): void {
    this.isLoadingRatings = true;
    this.feedbackService.getWorkerAverageRatings().subscribe({
      next: (ratings) => {
        this.workerRatings = ratings;
        this.isLoadingRatings = false;
      },
      error: (error) => {
        this.isLoadingRatings = false;
        this.snackBar.open('Failed to load worker ratings', 'Close', { duration: 3000 });
        console.error('Error loading worker ratings:', error);
      }
    });
  }

  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars: string[] = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('star');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('star_half');
      } else {
        stars.push('star_border');
      }
    }
    return stars;
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'primary';
    if (rating >= 3.5) return 'accent';
    return 'warn';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  truncateComment(comment: string | undefined, maxLength: number = 50): string {
    if (!comment) return 'No comment';
    return comment.length > maxLength ? comment.substring(0, maxLength) + '...' : comment;
  }
}

