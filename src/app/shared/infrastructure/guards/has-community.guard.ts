import { CanActivateFn } from '@angular/router';
import {Inject} from "@angular/core";
import {UserStoreService} from "../../../features/user/infrastructure/services/user-store.service";

export const HasCommunityGuard: CanActivateFn = (route, state) => {
  const userStore = Inject(UserStoreService)

  /*userStore.selectOnly(userStore.$).subscribe((community: any) => {
    console.log(community)
  })*/

  return true;
};
