import {Injectable} from '@angular/core';
import {UserStoreService} from "../infrastructure/services/user-store.service";
import {ZertipowerService} from "../../../shared/infrastructure/services/zertipower/zertipower.service";
import {AuthStoreService} from "../../auth/infrastructure/services/auth-store.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class UpdateUserCupsAction {

  constructor(
    private userStore: UserStoreService,
    private zertipower: ZertipowerService,
    private authStoreService: AuthStoreService,
    private router: Router,
  ) {
  }

  async run(userId: number) {
    try {
      const cups = await this.zertipower.users.getCups(userId);
      const surplusDistribution = parseFloat(cups![0]?.surplus_distribution || "0") * 100;
      this.userStore.patchState({
        surplusDistribution,
        selectedCupsIndex: 0,
        cups: cups!.map(c => {
          return {
            id: c.id,
            communityId: c.community_id,
            cupsCode: c.cups,
            surplusDistribution: parseFloat(c.surplus_distribution),
            reference: c.reference || ''
          }
        })
      })
    }catch (err){
      this.authStoreService.resetDefaults()
      const urlTree = this.router.createUrlTree(['/auth']);
      await this.router.navigateByUrl(urlTree);
    }
  }
}
