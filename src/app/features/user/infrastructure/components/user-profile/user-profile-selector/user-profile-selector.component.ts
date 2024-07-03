import {Component} from '@angular/core';
import {
  NgbDropdown,
  NgbDropdownButtonItem,
  NgbDropdownMenu,
  NgbDropdownModule,
  NgbDropdownToggle
} from "@ng-bootstrap/ng-bootstrap";
import {Confirmable} from "../../../../../../shared/infrastructure/decorators/Confirmable";
import {LogoutActionService} from "../../../../../auth/actions/logout-action.service";
import {UserStoreService} from "../../../services/user-store.service";
import {map} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {TextShorterPipe} from "../../../../../../shared/infrastructure/pipes/wallet-address-shortener.pipe";
import {RouterLink} from "@angular/router";
import {
  BreakPoints,
  ScreenBreakPointsService
} from "../../../../../../shared/infrastructure/services/screen-break-points.service";
import {TranslocoPipe, TranslocoService} from "@jsverse/transloco";
import Swal from "sweetalert2";

@Component({
  selector: 'app-user-profile-selector',
  standalone: true,
  imports: [
    NgbDropdownModule,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownButtonItem,
    AsyncPipe,
    TextShorterPipe,
    RouterLink,
    TranslocoPipe
  ],
  templateUrl: './user-profile-selector.component.html',
  styleUrl: './user-profile-selector.component.scss'
})
export class UserProfileSelectorComponent {
  currentBreakpoint$ = this.screenBreakpointService.observeBreakpoints();
  hideName$ = this.currentBreakpoint$.pipe(map(value => {
    return value <= BreakPoints.MD;
  }));
  userWallet$ = this.userStore
    .selectOnly(state => state.user?.wallet_address)
    .pipe(
      map(wallet => {
        if (!wallet) {
          return 'No hi ha cap wallet assignada'
        }

        return new TextShorterPipe().transform(wallet, 6, 4);
      })
    );
  firstName$ = this.userStore.selectOnly(state => state.user?.firstname)
    .pipe(
      map(username => username || 'Anònim'),
      map(username => {
        const maxSize = 30;
        const endSize = Math.floor(maxSize / 3);
        if (username.length > maxSize) {
          return new TextShorterPipe().transform(username, endSize, endSize);
        }
        return username;
      })
    );

  constructor(
    private readonly logoutAction: LogoutActionService,
    private readonly userStore: UserStoreService,
    private readonly screenBreakpointService: ScreenBreakPointsService,
    private readonly translocoService: TranslocoService
  ) {
  }

  // @Confirmable(() => (this as any).translocoService.translate('LOGOUT.modal.message'), () => {
  //   return {confirmButton: 'Tancar sessió', cancelButton: 'Cancel·lar'}
  // })
  async logout() {

    Swal.fire({
      text: this.translocoService.translate('LOGOUT.modal.message'),
      icon: 'question',
      confirmButtonText: this.translocoService.translate('LOGOUT.modal.confirm'),
      cancelButtonText: this.translocoService.translate('GENERIC.texts.cancel'),
      showCancelButton: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        // originalFunction.apply(this, args)
        await this.logoutAction.run();

      }
    });

    // await this.logoutAction.run();
  }

}
