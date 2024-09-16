import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AuthStoreService} from "../services/auth-store.service";

/**
 * The user is allowed to access to register page only if tries to log in and the user does not exist
 */
export const triedLoginGuard: CanActivateFn = () => {
  const authStore = inject(AuthStoreService);
  const router = inject(Router);

  // The user is allowed to access to register page only if tries to log in and the user does not exist
  const loginTry = authStore.snapshotOnly(state => state.loginTry);
  return loginTry || router.createUrlTree(['/auth/login']);
};
