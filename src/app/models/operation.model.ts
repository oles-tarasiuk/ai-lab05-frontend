import { Order } from './order.model';
import { User } from './user.model';

export interface Operation {
  id: number;
  description: string;
  startDateUtc: string;
  timeSpent: number;
  employee: User;
  order: Order;
}

export interface CreateOperation {
  description: string;
  startDateUtc: string;
  timeSpent: number;
  employeeId: number;
  orderId: number;
  detailid: number;
}

