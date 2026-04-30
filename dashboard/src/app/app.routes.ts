import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./pages/analytics/analytics').then(m => m.AnalyticsComponent)
  },
  {
    path: 'loads',
    loadComponent: () =>
      import('./pages/loads/loads').then(m => m.LoadsComponent)
  },
  {
    path: 'priorities',
    loadComponent: () =>
      import('./pages/priorities/priorities').then(m => m.PrioritiesComponent)
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings').then(m => m.SettingsComponent)
  }
];
