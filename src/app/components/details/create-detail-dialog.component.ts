import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DetailsService } from '../../services/details.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './create-detail-dialog.component.html',
  styleUrl: './create-detail-dialog.component.scss'
})
export class CreateDetailDialogComponent {
  detailForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private detailsService: DetailsService,
    private dialogRef: MatDialogRef<CreateDetailDialogComponent>,
    private snackBar: MatSnackBar
  ) {
    this.detailForm = this.fb.group({
      name: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.detailForm.valid) {
      const formValue = this.detailForm.value;
      const detailData = {
        name: formValue.name,
        price: parseFloat(formValue.price),
        quantity: parseInt(formValue.quantity, 10)
      };

      this.detailsService.createDetail(detailData).subscribe({
        next: () => {
          this.snackBar.open('Detail created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Failed to create detail', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

