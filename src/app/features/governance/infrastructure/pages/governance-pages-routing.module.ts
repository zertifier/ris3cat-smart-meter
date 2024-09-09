import {Routes} from "@angular/router";
import {ENERGY_STATS_ROUTE_NAMES} from "../../../energy-stats/infrastructure/pages/energy-stats-pages-routing.module";
import {HasCommunityGuard} from "@shared/infrastructure/guards/has-community.guard";


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../../../core/layouts/navbar-footer-layout/navbar-layout.component').then(c => c.NavbarLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./governance-page/governance-page.component').then(c => c.GovernancePageComponent),
        data: {
          name: ENERGY_STATS_ROUTE_NAMES.GOVERNANCE,
        }
      },
      {
        path: 'proposals',
        loadComponent: () => import('./proposals-page/proposals-page.component').then(c => c.ProposalsPageComponent),
        data: {
          name: ENERGY_STATS_ROUTE_NAMES.GOVERNANCE,
        },
      },
      {
        path: 'proposals/new-proposal',
        loadComponent: () => import('./proposals-page/new-proposal-page/new-proposal-page.component').then(c => c.NewProposalPageComponent),
        data: {
          name: ENERGY_STATS_ROUTE_NAMES.GOVERNANCE,
        },

      },
      {
        path: 'proposals/:id',
        loadComponent: () => import('./proposals-page/proposal-page/proposal-page.component').then(c => c.ProposalPageComponent),
        data: {
          name: ENERGY_STATS_ROUTE_NAMES.GOVERNANCE,
        }
      },
      {
        path: 'participants',
        loadComponent: () => import('./participants/participants.component').then(c => c.ParticipantsComponent),
        data: {
          name: ENERGY_STATS_ROUTE_NAMES.GOVERNANCE,
        }
      }
    ]
  }
]
