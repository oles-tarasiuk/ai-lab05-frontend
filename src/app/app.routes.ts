import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./components/orders/orders.component').then(m => m.OrdersComponent),
    canActivate: [authGuard]
  },
  {
    path: 'operations',
    loadComponent: () => import('./components/operations/operations.component').then(m => m.OperationsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'details',
    loadComponent: () => import('./components/details/details.component').then(m => m.DetailsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'comparison',
    loadComponent: () => import('./components/comparison/comparison.component').then(m => m.ComparisonComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/orders',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/orders'
  }
];
