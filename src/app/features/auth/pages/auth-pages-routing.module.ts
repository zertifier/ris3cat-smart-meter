import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login-page/login-page.component').then(m => m.LoginPageComponent)
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'login'
  }
];
