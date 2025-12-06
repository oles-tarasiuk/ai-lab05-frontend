import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrdersService } from '../../services/orders.service';
import { UsersService, User } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './create-order-dialog.component.html',
  styleUrl: './create-order-dialog.component.scss'
})
export class CreateOrderDialogComponent implements OnInit {
  orderForm: FormGroup;
  users: User[] = [];
  isLoading = false;
  loadingUsers = true;

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private usersService: UsersService,
    public authService: AuthService,
    private dialogRef: MatDialogRef<CreateOrderDialogComponent>,
    private snackBar: MatSnackBar
  ) {
    this.orderForm = this.fb.group({
      description: ['', [Validators.required]],
      startDateUtc: ['', [Validators.required]],
      endDateUtc: ['', [Validators.required]],
      customerId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // If customer, auto-set their ID and don't load users
    if (this.authService.isCustomer() && this.authService.userId()) {
      this.orderForm.patchValue({
        customerId: this.authService.userId()
      });
      this.orderForm.get('customerId')?.disable();
    } else if (this.authService.isAdmin()) {
      // Only load users for admins
      this.loadUsers();
    }
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (users) => {
        // Filter to show only Customers for customer selection
        this.users = users.filter(user => user.role === 'Customer');
        this.loadingUsers = false;
      },
      error: (error) => {
        this.loadingUsers = false;
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        console.error('Error loading users:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.orderForm.valid && !this.isLoading) {
      this.isLoading = true;
      const formValue = this.orderForm.value;
      // Get customerId from form value or from auth service if field is disabled
      const customerId = formValue.customerId || this.authService.userId();
      const orderData = {
        ...formValue,
        startDateUtc: new Date(formValue.startDateUtc).toISOString(),
        endDateUtc: new Date(formValue.endDateUtc).toISOString(),
        customerId: parseInt(customerId?.toString() || '0', 10)
      };

      this.ordersService.createOrder(orderData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Order created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error.error?.message || 'Failed to create order', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

