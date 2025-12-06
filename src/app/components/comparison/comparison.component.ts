import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ComparisonService, ComparisonResponse } from '../../services/comparison.service';

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.scss'
})
export class ComparisonComponent implements OnInit {
  isLoading = false;
  comparisonResult: ComparisonResponse | null = null;
  orderId = 1;
  Math = Math; // Expose Math for template

  constructor(
    private comparisonService: ComparisonService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Optionally load comparison on init
  }

  runComparison(): void {
    this.isLoading = true;
    this.comparisonResult = null;

    this.comparisonService.compareApproaches(this.orderId).subscribe({
      next: (result) => {
        this.comparisonResult = result;
        this.isLoading = false;
        this.snackBar.open('Comparison completed successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to run comparison', 'Close', { duration: 3000 });
        console.error('Error running comparison:', error);
      }
    });
  }

  getFasterApproach(): string {
    if (!this.comparisonResult) return '';
    return this.comparisonResult.summary.fasterApproach;
  }

  getTimeDifference(): number {
    if (!this.comparisonResult) return 0;
    return this.comparisonResult.summary.timeDifference;
  }

  getTimeDifferencePercent(): number {
    if (!this.comparisonResult) return 0;
    return this.comparisonResult.summary.timeDifferencePercent;
  }
}

