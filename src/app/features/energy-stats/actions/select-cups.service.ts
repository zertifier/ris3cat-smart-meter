import {Injectable} from '@angular/core';
import {UserStoreService} from "../../user/infrastructure/services/user-store.service";

@Injectable({
  providedIn: 'root'
})
export class SelectCupsService {

  constructor(private userStore: UserStoreService) { }

  /**
   * Select the corresponding cups and updates {@link UserStoreService}
   * @throws Error if cups not found
   * @param selectedCupsIndex
   */
  public async run(selectedCupsIndex: number) {
    const cups = this.userStore.snapshotOnly(state => state.cups[selectedCupsIndex]);
    if (!cups) {
      throw new Error(`Cups not found at index ${selectedCupsIndex}`);
    }
    this.userStore.patchState({selectedCupsIndex, surplusDistribution: cups.surplusDistribution * 100})
  }
}
