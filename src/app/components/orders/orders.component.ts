import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { OrdersService } from '../../services/orders.service';
import { OperationsService } from '../../services/operations.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus } from '../../models/order.model';
import { Operation } from '../../models/operation.model';
import { CreateOrderDialogComponent } from './create-order-dialog.component';
import { UpdateStatusDialogComponent } from './update-status-dialog.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'description', 'customer', 'startDate', 'endDate', 'status', 'actions'];
  orders: Order[] = [];
  isLoading = false;
  OrderStatus = OrderStatus;
  expandedOrderId: number | null = null;
  orderOperations: Map<number, Operation[]> = new Map();
  loadingOperations: Set<number> = new Set();

  constructor(
    private ordersService: OrdersService,
    private operationsService: OperationsService,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.ordersService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to load orders', 'Close', { duration: 3000 });
        console.error('Error loading orders:', error);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateOrderDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrders();
      }
    });
  }

  openUpdateStatusDialog(order: Order): void {
    const dialogRef = this.dialog.open(UpdateStatusDialogComponent, {
      width: '400px',
      data: { order }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrders();
      }
    });
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Created:
        return 'primary';
      case OrderStatus.InProgress:
        return 'accent';
      case OrderStatus.Pending:
        return 'warn';
      case OrderStatus.Canceled:
        return '';
      case OrderStatus.Completed:
        return 'primary';
      default:
        return '';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    return OrderStatus[status];
  }

  canCreateOrder(): boolean {
    return this.authService.hasAnyRole('Customer', 'Admin');
  }

  canUpdateStatus(): boolean {
    return this.authService.hasAnyRole('Admin', 'Worker');
  }

  toggleOperations(orderId: number): void {
    if (this.expandedOrderId === orderId) {
      this.expandedOrderId = null;
    } else {
      this.expandedOrderId = orderId;
      if (!this.orderOperations.has(orderId)) {
        this.loadOperations(orderId);
      }
    }
  }

  loadOperations(orderId: number): void {
    this.loadingOperations.add(orderId);
    this.operationsService.getOperationsByOrder(orderId).subscribe({
      next: (operations) => {
        this.orderOperations.set(orderId, operations);
        this.loadingOperations.delete(orderId);
      },
      error: (error) => {
        this.loadingOperations.delete(orderId);
        this.snackBar.open('Failed to load operations', 'Close', { duration: 3000 });
        console.error('Error loading operations:', error);
      }
    });
  }

  getOperations(orderId: number): Operation[] {
    return this.orderOperations.get(orderId) || [];
  }

  isLoadingOperations(orderId: number): boolean {
    return this.loadingOperations.has(orderId);
  }
}

