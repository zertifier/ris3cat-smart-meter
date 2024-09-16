import {Injectable} from '@angular/core';
import {ethers} from "ethers";
import {AuthStoreService} from "../infrastructure/services/auth-store.service";
import {ZertiauthApiService} from "../infrastructure/services/zertiauth-api.service";
import {ApiService} from "@shared/infrastructure/services/api.service";
import {EventBus} from "@shared/domain/EventBus";
import {UserLoggedInEvent} from "../domain/UserLoggedInEvent";
import {ZertipowerService} from "@shared/infrastructure/services/zertipower/zertipower.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class LoginActionService {

  constructor(
    private readonly zertiauthApiService: ZertiauthApiService,
    private readonly apiService: ApiService,
    private readonly authStore: AuthStoreService,
    private readonly eventBus: EventBus,
    private readonly zertipower: ZertipowerService,
    private readonly router: Router,
  ) {
  }

  /**
   * Execute all the steps to login, emits the corresponding events. If all is succeeded
   * return a boolean indicating the success.
   * @param oauthCode
   */
  async run(oauthCode: string): Promise<boolean> {
    // It's necessary to save if the user has tried to log in to allow him to access the register pages
    // in case that the user does not exist
    this.authStore.patchState({loginTry: true});
    const response = await this.zertiauthApiService.getPrivateKey(oauthCode);

    const wallet = new ethers.Wallet(response.privateKey as string);

    const users = await this.zertipower.users.get({filters: []});
    // If user with this email is not found means that user doesn't exist
    // And should be redirected to register page
    if (!users.find(u => u.email === response.email)) {
      this.authStore.patchState({loginData: {privateKey: response.privateKey, email: response.email}})
      await this.router.navigate(['/auth/register']);
      return false;
    }

    const tokens = await this.apiService.auth.login(wallet.address, wallet.privateKey, response.email);
    this.authStore.setTokens({refreshToken: tokens.refreshToken, accessToken: tokens.accessToken});
    this.authStore.saveOauthCode(oauthCode);
    // Events are emitted via event bus. This allows to dispatch asynchronous operations like loading user info when
    // is logged in or when their profile changed.
    await this.eventBus.publishEvents(new UserLoggedInEvent());
    this.authStore.patchState({loginTry: false});
    return true;
  }
}
