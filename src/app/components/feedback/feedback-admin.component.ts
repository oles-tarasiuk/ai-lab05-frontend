import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FeedbackService } from '../../services/feedback.service';
import { WorkerAverageResponse, WorkerFeedbackItem } from '../../models/feedback.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-feedback-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-icon>analytics</mat-icon>
        <div class="title">Feedback — Admin</div>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="!authService.isAdmin()" class="warn">
          Only Admins can access this page.
        </div>
        <ng-container *ngIf="authService.isAdmin()">
          <form [formGroup]="form" (ngSubmit)="load()" class="row">
            <mat-form-field appearance="outline">
              <mat-label>Worker ID</mat-label>
              <input matInput type="number" formControlName="workerId" required>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading"><mat-icon>search</mat-icon>Load</button>
          </form>

          <div *ngIf="loading" class="center">
            <mat-progress-spinner diameter="32" mode="indeterminate"></mat-progress-spinner>
          </div>

          <div *ngIf="avg && !loading" class="summary">
            <mat-icon>person</mat-icon>
            Worker #{{avg.workerId}} — Average: <b>{{avg.average}}</b> ({{avg.count}} ratings)
          </div>

          <table mat-table [dataSource]="items" class="mat-elevation-z2" *ngIf="items.length && !loading">
            <ng-container matColumnDef="orderId">
              <th mat-header-cell *matHeaderCellDef> Order </th>
              <td mat-cell *matCellDef="let e"> #{{e.orderId}} </td>
            </ng-container>
            <ng-container matColumnDef="customerId">
              <th mat-header-cell *matHeaderCellDef> Customer </th>
              <td mat-cell *matCellDef="let e"> {{e.customerId}} </td>
            </ng-container>
            <ng-container matColumnDef="rating">
              <th mat-header-cell *matHeaderCellDef> Order Rating </th>
              <td mat-cell *matCellDef="let e"> {{e.rating}} </td>
            </ng-container>
            <ng-container matColumnDef="workerRating">
              <th mat-header-cell *matHeaderCellDef> Worker Rating </th>
              <td mat-cell *matCellDef="let e"> {{e.workerRating}} </td>
            </ng-container>
            <ng-container matColumnDef="comment">
              <th mat-header-cell *matHeaderCellDef> Comment </th>
              <td mat-cell *matCellDef="let e"> {{e.comment || '-'}} </td>
            </ng-container>
            <ng-container matColumnDef="createdAtUtc">
              <th mat-header-cell *matHeaderCellDef> Created </th>
              <td mat-cell *matCellDef="let e"> {{e.createdAtUtc | date:'short'}} </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </ng-container>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .row { display: flex; gap: 12px; align-items: center; }
    .title { margin-left: 8px; font-weight: 600; }
    .warn { color: #b00020; }
    .center { display:flex; justify-content:center; padding:16px; }
    .summary { display:flex; align-items:center; gap:8px; margin: 12px 0; }
    table { width: 100%; margin-top: 8px; }
  `]
})
export class FeedbackAdminComponent {
  displayedColumns: string[] = ['orderId', 'customerId', 'rating', 'workerRating', 'comment', 'createdAtUtc'];
  items: WorkerFeedbackItem[] = [];
  avg: WorkerAverageResponse | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {
    this.form = this.fb.group({
      workerId: [null as number | null, [Validators.required, Validators.min(1)]]
    });
  }

  form ;

  load(): void {
    if (this.form.invalid) return;
    const workerId = Number(this.form.value.workerId);
    this.loading = true;
    this.avg = null;
    this.items = [];
    this.feedbackService.getWorkerAverage(workerId).subscribe({
      next: (a) => this.avg = a,
      error: (e) => console.error(e)
    });
    this.feedbackService.getWorkerFeedbacks(workerId).subscribe({
      next: (list) => { this.items = list; this.loading = false; },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.snackBar.open('Failed to load feedback for worker', 'Close', { duration: 3000 });
      }
    });
  }
}
