import {Injectable} from '@angular/core';
import {AuthStoreService} from "../../../auth/infrastructure/services/auth-store.service";
import {UserProfile, UserStoreService} from "./user-store.service";
import {ZertipowerService} from "@shared/infrastructure/services/zertipower/zertipower.service";
import {EventBus} from "@shared/domain/EventBus";
import {UserLoggedInEvent} from "../../../auth/domain/UserLoggedInEvent";
import {UserProfileChangedEvent} from "../../../auth/domain/UserProfileChangedEvent";
import {UpdateUserCupsAction} from "../../actions/update-user-cups-action.service";
import {EthersService} from "@shared/infrastructure/services/ethers.service";

@Injectable({
  providedIn: 'root'
})
export class ProfileUpdaterService {

  constructor(
    private authStore: AuthStoreService,
    private userStore: UserStoreService,
    private zertipower: ZertipowerService,
    private ethersService: EthersService,
    private eventBus: EventBus,
    private updateCups: UpdateUserCupsAction
  ) {
    this.eventBus.subscribe(UserProfileChangedEvent.NAME, async () => {
      const userProfile = this.userStore.snapshotOnly(state => state.user);
      if (!userProfile) {
        throw new Error("User profile not defined");
      }

      await this.updateUserData(userProfile.id);
    });

    this.eventBus.subscribe(UserLoggedInEvent.NAME, async () => {
      const authData = this.authStore.snapshotOnly(state => state.authData);

      if (!authData) {
        return;
      }

      const userId = authData.id;
      await this.updateUserData(userId);
      await this.updateCups.run(userId);
    });
  }

  private async updateUserData(userId: number) {
    let user: UserProfile = await this.findUserProfileById(userId);
    user.wallet = await this.ethersService.getWalletFromAuthPk()
    this.userStore.patchState({user});
  }

  private async findUserProfileById(id: number) {
    const users = await this.zertipower.users.get({filters: []});
    const user = users.find(user => user.id === id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    return user;
  }
}
