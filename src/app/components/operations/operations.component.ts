import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OperationsService } from '../../services/operations.service';
import { OrdersService } from '../../services/orders.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models/order.model';
import { DetailsService } from '../../services/details.service';
import { Detail } from '../../models/detail.model';
import { UsersService, User } from '../../services/users.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-operations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './operations.component.html',
  styleUrl: './operations.component.scss'
})
export class OperationsComponent implements OnInit {
  operationForm: FormGroup;
  orders: Order[] = [];
  details: Detail[] = [];
  users: User[] = [];
  isLoading = false;
  loadingUsers = true;

  constructor(
    private fb: FormBuilder,
    private operationsService: OperationsService,
    private ordersService: OrdersService,
    private detailsService: DetailsService,
    private usersService: UsersService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.operationForm = this.fb.group({
      description: ['', [Validators.required]],
      startDateUtc: [new Date(), [Validators.required]],
      timeSpent: ['', [Validators.required, Validators.min(0)]],
      employeeId: ['', [Validators.required]],
      orderId: ['', [Validators.required]],
      detailid: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Only load data if user can create operations (Worker or Admin)
    if (this.authService.hasAnyRole('Worker', 'Admin')) {
      this.loadOrders();
      this.loadDetails();
      
      // Auto-set employee ID for workers and hide dropdown
      if (this.authService.isWorker() && this.authService.userId()) {
        this.operationForm.patchValue({
          employeeId: this.authService.userId()
        });
        this.operationForm.get('employeeId')?.disable();
      } else if (this.authService.isAdmin()) {
        // Only load users for admins
        this.loadUsers();
      }
    }
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (users) => {
        // Filter to show only Workers and Admins for employee selection
        this.users = users.filter(user => user.role === 'Worker' || user.role === 'Admin');
        this.loadingUsers = false;
      },
      error: (error) => {
        this.loadingUsers = false;
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        console.error('Error loading users:', error);
      }
    });
  }

  loadOrders(): void {
    // Pass forOperations=true to get all orders for workers when creating operations
    this.ordersService.getOrders(true).subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.snackBar.open('Failed to load orders', 'Close', { duration: 3000 });
      }
    });
  }

  loadDetails(): void {
    this.detailsService.getDetails().subscribe({
      next: (details) => {
        this.details = details;
      },
      error: (error) => {
        console.error('Error loading details:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.operationForm.valid) {
      this.isLoading = true;
      const formValue = this.operationForm.value;
      // Get employeeId from form value or from auth service if field is disabled
      const employeeId = formValue.employeeId || this.authService.userId();
      const operationData = {
        ...formValue,
        startDateUtc: new Date(formValue.startDateUtc).toISOString(),
        timeSpent: parseFloat(formValue.timeSpent),
        employeeId: parseInt(employeeId?.toString() || '0', 10),
        orderId: parseInt(formValue.orderId, 10),
        detailid: parseInt(formValue.detailid, 10)
      };

      this.operationsService.createOperation(operationData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Operation created successfully', 'Close', { duration: 3000 });
          const resetValue: any = {
            startDateUtc: new Date()
          };
          // Maintain employeeId for workers after reset
          if (this.authService.isWorker() && this.authService.userId()) {
            resetValue.employeeId = this.authService.userId();
          }
          this.operationForm.reset(resetValue);
          // Re-disable employeeId field for workers if it was disabled
          if (this.authService.isWorker()) {
            this.operationForm.get('employeeId')?.disable();
          }

          this.router.navigate(['/orders']);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error.error?.message || 'Failed to create operation', 'Close', { duration: 3000 });
        }
      });
    }
  }
}

