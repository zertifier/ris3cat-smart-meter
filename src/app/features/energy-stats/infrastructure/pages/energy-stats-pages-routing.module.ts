import {Routes} from "@angular/router";
import {switchChartEntityGuard} from "../guards/switch-chart-entity.guard";
import {ChartEntity} from "../../domain/ChartEntity";
import {hasCupsGuard} from "../guards/has-cups.guard";
import {hasCommunityGuard} from "../guards/has-community.guard";

// These names are used on the guards
// Each route has a name, and the guards verify what is the
// original name. Depending on that redirects the user to a route or another
export enum ENERGY_STATS_ROUTE_NAMES {
  STATS_COMMUNITY = 'stats-community',
  STATS_CUPS = 'stats-cups',
  MISSING_COMMUNITY = 'missing-community',
  MISSING_CUPS = 'missing-cups',
  GOVERNANCE = 'GOVERNANCE'
}

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../../../core/layouts/navbar-footer-layout/navbar-layout.component').then(c => c.NavbarLayoutComponent),
    children: [
      {
        path: 'community',
        loadComponent: () => import('./community/my-community-page/my-community-page.component').then(c => c.MyCommunityPageComponent),
        canActivate: [switchChartEntityGuard(ChartEntity.COMMUNITIES), hasCommunityGuard],
        data: {
          name: ENERGY_STATS_ROUTE_NAMES.STATS_COMMUNITY
        }
      },
      {
        path: 'my-cup',
        loadComponent: () => import('./cups/my-cups-page/my-cup-page.component').then(c => c.MyCupPageComponent),
        canActivate: [switchChartEntityGuard(ChartEntity.CUPS), hasCupsGuard],
        data: {
          name: ENERGY_STATS_ROUTE_NAMES.STATS_CUPS
        }
      },
      {
        path: 'community/missing',
        loadComponent: () => import('./community/missing-community-page/missing-community-page.component').then(c => c.MissingCommunityPageComponent),
        canActivate: [hasCommunityGuard],
        data: {
          name: ENERGY_STATS_ROUTE_NAMES.MISSING_COMMUNITY
        }
      },
      {
        path: 'my-cup/missing',
        loadComponent: () => import('./cups/missing-cups-page/missing-cup-page.component').then(c => c.MissingCupPageComponent),
        canActivate: [hasCupsGuard],
        data: {
          name: ENERGY_STATS_ROUTE_NAMES.MISSING_CUPS
        }
      },
      {
        path: 'share',
        loadComponent: () => import('./share-page/share-page.component').then(c => c.SharePageComponent)
      },
      {
        path: 'data-source-health',
        loadComponent: () => import('./data-source-health/data-source-health.component').then(c => c.DataSourceHealthComponent)
      },
      {
        path: 'stats',
        loadComponent: () => import('./stats/stats.component').then(c => c.StatsComponent)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'my-cup'
      }
    ]
  },
];
