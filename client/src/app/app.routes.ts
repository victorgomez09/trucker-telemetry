import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'telemetry',
        loadComponent: () => import('./components/telemetry/telemetry').then(m => m.Telemetry),
    },
    {
        path: 'radio',
        loadComponent: () => import('./components/radio/radio').then(m => m.RadioComponent),
    },
    { path: '', redirectTo: '/telemetry', pathMatch: 'full' }
];
