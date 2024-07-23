import {Routes} from "@angular/router";

export enum USER_ROUTE_NAMES {
  PROFILE = 'profile',
  WALLET = 'wallet',
  INTEGRATIONS = 'integrations'
}

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../../../core/layouts/navbar-footer-layout/navbar-layout.component').then(c => c.NavbarLayoutComponent),
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./user-profile-page/user-profile-page.component').then(c => c.UserProfilePageComponent),
        data: {
          name: USER_ROUTE_NAMES.PROFILE
        }
      },
      {
        path: 'wallet',
        loadComponent: () => import('./user-wallet-page/user-wallet-page.component').then(c => c.UserWalletPageComponent),
        data: {
          name: USER_ROUTE_NAMES.WALLET
        }
      },
      {
        path: 'integrations',
        loadComponent: () => import('./integrations-page/integrations-page.component').then(c => c.IntegrationsPageComponent),
        data: {
          name: USER_ROUTE_NAMES.INTEGRATIONS
        }
      },
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      }
    ]
  }
]
