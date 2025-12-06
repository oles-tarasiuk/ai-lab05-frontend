import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeedbackService } from '../../services/feedback.service';
import { CompletedOrder, CreateFeedback } from '../../models/feedback.model';
import { CreateFeedbackDialogComponent } from './create-feedback-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss'
})
export class FeedbackComponent implements OnInit {
  completedOrders: CompletedOrder[] = [];
  isLoading = false;

  constructor(
    private feedbackService: FeedbackService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderId = params['orderId'];
      if (orderId) {
        // If orderId is provided, load orders and open dialog for that order
        this.loadCompletedOrders(() => {
          const order = this.completedOrders.find(o => o.id === parseInt(orderId, 10));
          if (order && !order.hasFeedback) {
            this.openFeedbackDialog(order);
          }
        });
      } else {
        this.loadCompletedOrders();
      }
    });
  }

  loadCompletedOrders(callback?: () => void): void {
    this.isLoading = true;
    this.feedbackService.getCompletedOrders().subscribe({
      next: (orders) => {
        this.completedOrders = orders;
        this.isLoading = false;
        if (callback) {
          callback();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to load completed orders', 'Close', { duration: 3000 });
        console.error('Error loading completed orders:', error);
      }
    });
  }

  openFeedbackDialog(order: CompletedOrder): void {
    const dialogRef = this.dialog.open(CreateFeedbackDialogComponent, {
      width: '600px',
      data: { order }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCompletedOrders();
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

