import { Routes } from '@angular/router';
import { authGuard } from './guards/auth';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./views/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./views/register/register').then(m => m.Register)
  },
  {
    path: '',
    loadComponent: () => import('./components/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./views/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'jobs/:id',
        loadComponent: () => import('./views/job-details/job-details').then((m) => m.JobDetails),
      },
      {
        path: 'companies/:id',
        loadComponent: () =>
          import('./views/company-profile/company-profile').then((m) => m.CompanyProfileComponent),
      },
    ]
  }
];
