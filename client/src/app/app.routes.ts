import { Routes } from '@angular/router';
import { configGuard } from './guards/config.guard';

export const routes: Routes = [
  { path: 'setup', loadComponent: () => import('./views/setup/setup.component/setup.component').then(m => m.SetupComponent) },
  {
    path: '',
    loadComponent: () => import('./views/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [configGuard],
  },
];
