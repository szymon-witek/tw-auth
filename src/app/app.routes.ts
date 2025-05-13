import { VerificationComponent } from './verification/verification.component';
import { ModDashboardComponent } from './mod-dashboard/mod-dashboard.component';
import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('../login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'verify',
    loadComponent: () => import('./verification/verification.component').then(m => m.VerificationComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('../dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'account-setup',
    loadComponent: () => import('./account-setup/account-setup.component').then(m => m.AccountSetupComponent)
  },
    {
    path: 'mod-dashboard',
    loadComponent: () => import('./mod-dashboard/mod-dashboard.component').then(m => m.ModDashboardComponent),
    canActivate: [AuthGuard]
  },
  // {
  //   path: 'admin',
  //   loadComponent: () => import('../admin/admin.component').then(m => m.AdminComponent),
  //   canActivate: [AdminGuard]
  // },
  {
    path: '**',
    redirectTo: 'login'
  }
];
