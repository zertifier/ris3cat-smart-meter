import {Injectable} from '@angular/core';
import {AuthStoreService} from "../infrastructure/services/auth-store.service";
import {UserStoreService} from "../../user/infrastructure/services/user-store.service";
import {AuthApiService} from "../infrastructure/services/auth-api.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class LogoutActionService {

  constructor(
    private authStore: AuthStoreService,
    private userStore: UserStoreService,
    private authApiService: AuthApiService,
    private router: Router,
  ) {
  }

  /**
   * Logout and reset {@link AuthStoreService} and {@link UserStoreService}
   */
  public async run() {
    const refreshToken = this.authStore.snapshotOnly(state => state.refreshToken);
    await this.authApiService.logout(refreshToken);
    this.authStore.resetDefaults();
    this.userStore.resetDefaults();
    this.router.navigate(['/auth']);
  }
}
