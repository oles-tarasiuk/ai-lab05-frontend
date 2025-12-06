import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { OrdersService } from '../../services/orders.service';
import { Order, OrderStatus, UpdateOrderStatus } from '../../models/order.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-update-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './update-status-dialog.component.html',
  styleUrl: './update-status-dialog.component.scss'
})
export class UpdateStatusDialogComponent {
  statusForm: FormGroup;
  orderStatuses = Object.keys(OrderStatus).filter(key => isNaN(Number(key)));

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private dialogRef: MatDialogRef<UpdateStatusDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { order: Order }
  ) {
    this.statusForm = this.fb.group({
      status: [OrderStatus[data.order.status], [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.statusForm.valid) {
      const statusKey = this.statusForm.value.status;
      const status = OrderStatus[statusKey as keyof typeof OrderStatus];
      const updateData: UpdateOrderStatus = { status };

      this.ordersService.updateOrderStatus(this.data.order.id, updateData).subscribe({
        next: () => {
          this.snackBar.open('Order status updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Failed to update status', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

