import { User } from './user.model';

export enum OrderStatus {
  Created = 1,
  InProgress = 2,
  Pending = 3,
  Canceled = 4,
  Completed = 5
}

export interface Order {
  id: number;
  description: string;
  startDateUtc: string;
  endDateUtc: string;
  status: OrderStatus;
  customer: User;
}

export interface CreateOrder {
  description: string;
  startDateUtc: string;
  endDateUtc: string;
  customerId: number;
}

export interface UpdateOrderStatus {
  status: OrderStatus;
}

