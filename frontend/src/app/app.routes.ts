import { Routes } from '@angular/router';
import { authGuard } from './guards/auth';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./views/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'companies/:id',
    loadComponent: () =>
      import('./views/company-profile/company-profile').then((m) => m.CompanyProfileComponent),
    canActivate: [authGuard]
  },
];
