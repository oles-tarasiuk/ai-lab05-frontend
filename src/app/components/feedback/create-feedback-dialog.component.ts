import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FeedbackService } from '../../services/feedback.service';
import { CompletedOrder, CreateFeedback } from '../../models/feedback.model';

@Component({
  selector: 'app-create-feedback-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './create-feedback-dialog.component.html',
  styleUrl: './create-feedback-dialog.component.scss'
})
export class CreateFeedbackDialogComponent implements OnInit {
  feedbackForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateFeedbackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { order: CompletedOrder }
  ) {
    this.feedbackForm = this.fb.group({
      orderRating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [''],
      workerRatings: this.fb.group({})
    });
  }

  ngOnInit(): void {
    // Initialize worker ratings
    const workerRatingsFormGroup = this.feedbackForm.get('workerRatings') as FormGroup;
    this.data.order.workers.forEach(worker => {
      workerRatingsFormGroup.addControl(
        worker.id.toString(),
        this.fb.control(5, [Validators.required, Validators.min(1), Validators.max(5)])
      );
    });
  }

  getWorkerRatingControl(workerId: number) {
    const workerRatingsGroup = this.feedbackForm.get('workerRatings') as FormGroup;
    return workerRatingsGroup.get(workerId.toString());
  }

  getStars(rating: number): string[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 'star' : 'star_border');
  }

  setOrderRating(rating: number): void {
    this.feedbackForm.patchValue({ orderRating: rating });
  }

  setWorkerRating(workerId: number, rating: number): void {
    const control = this.getWorkerRatingControl(workerId);
    if (control) {
      control.setValue(rating);
    }
  }

  onSubmit(): void {
    if (this.feedbackForm.valid) {
      this.isLoading = true;
      const formValue = this.feedbackForm.value;
      
      const createFeedback: CreateFeedback = {
        orderId: this.data.order.id,
        rating: formValue.orderRating,
        comment: formValue.comment || undefined,
        workerRatings: Object.keys(formValue.workerRatings).map(workerId => ({
          workerId: parseInt(workerId, 10),
          rating: formValue.workerRatings[workerId]
        }))
      };

      this.feedbackService.createFeedback(createFeedback).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Feedback submitted successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || 'Failed to submit feedback';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          console.error('Error submitting feedback:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

