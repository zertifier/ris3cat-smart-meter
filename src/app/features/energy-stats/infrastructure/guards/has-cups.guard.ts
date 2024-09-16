import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {UserStoreService} from "../../../user/infrastructure/services/user-store.service";
import {map, skipWhile} from "rxjs";
import {ENERGY_STATS_ROUTE_NAMES} from "../pages/energy-stats-pages-routing.module";

/**
 * Ensures that a user has a cups assigned. If not redirects the user to a missing cups page
 * @param route
 */
export const hasCupsGuard: CanActivateFn = (route) => {
  const userStore = inject(UserStoreService);
  const router = inject(Router);

  return userStore.select().pipe(
    // Since it returns an observable its necessary to only parsing a value through a pipe only if the user profile
    // is loaded. If is not loaded it's not possible to check if it has a community
    skipWhile((state) => !userStore.$.profileLoaded(state)),
    map((state) => {
      const {cups} = state;
      // At the routing config metadata is attached to routes. Thanks to this is possible to know which
      // page is user trying to access:
      const routeName = route.data['name'];

      const tryStatsAccess = ENERGY_STATS_ROUTE_NAMES.STATS_CUPS === routeName;
      const hasCups = cups.length > 0;

      if (tryStatsAccess) {
        return hasCups || router.createUrlTree(['energy-stats/my-cup/missing']);
      }

      return !hasCups || router.createUrlTree(['energy-stats/my-cup']);
    })
  );
};
