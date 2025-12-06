import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FeedbackService } from '../../services/feedback.service';
import { SubmitFeedbackRequest } from '../../models/feedback.model';
import { Order } from '../../models/order.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-icon>rate_review</mat-icon>
        <div class="title">Leave Feedback</div>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="!authService.hasAnyRole('Customer','Admin')" class="warn">
          You do not have permission to submit feedback.
        </div>
        <ng-container *ngIf="authService.hasAnyRole('Customer','Admin')">
          <div *ngIf="isLoading" class="center">
            <mat-progress-spinner diameter="32" mode="indeterminate"></mat-progress-spinner>
          </div>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" *ngIf="!isLoading">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Completed Order</mat-label>
              <mat-select formControlName="orderId" required>
                <mat-option *ngFor="let o of orders" [value]="o.id">#{{o.id}} — {{o.description}}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Rating (1-5)</mat-label>
              <input matInput type="number" formControlName="rating" min="1" max="5" required>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Comment (optional)</mat-label>
              <textarea matInput rows="3" formControlName="comment"></textarea>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || submitting">
              <mat-icon>send</mat-icon>
              Submit
            </button>
          </form>
        </ng-container>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .full { width: 100%; }
    .center { display:flex; justify-content:center; padding:16px; }
    .title { margin-left: 8px; font-weight: 600; }
    .warn { color: #b00020; }
  `]
})
export class FeedbackFormComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  submitting = false;

  form;

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {
    this.form = this.fb.group({
      orderId: [null as number | null, Validators.required],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['']
    });
  }

  ngOnInit(): void {
    this.loadCompletedOrders();
  }

  loadCompletedOrders(): void {
    this.isLoading = true;
    this.feedbackService.getCompletedOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
        if (orders.length && !this.form.value.orderId) {
          this.form.patchValue({ orderId: orders[0].id });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.snackBar.open('Failed to load completed orders', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.value;
    const payload: SubmitFeedbackRequest = {
      orderId: value.orderId!,
      rating: Number(value.rating),
      comment: (value.comment || '').toString().trim() || undefined
    };
    this.submitting = true;
    this.feedbackService.submitFeedback(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open('Feedback submitted. Thank you!', 'Close', { duration: 3000 });
        this.form.patchValue({ comment: '' });
      },
      error: (err) => {
        this.submitting = false;
        const msg = err?.status === 409
          ? 'You have already submitted feedback for this order'
          : (err?.error || 'Failed to submit feedback');
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      }
    });
  }
}
